// Smoke-check a deployment before it takes the domain: key routes render,
// hidden work stays hidden, security headers are present, and every media
// file the homepage references is served.
const base = process.argv[2]?.replace(/\/$/, '')
if (!base || !/^https?:\/\//.test(base)) {
  console.error('Usage: node scripts/check-deployment.mjs <deployment-url>')
  process.exit(2)
}
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const headers = bypass ? { 'x-vercel-protection-bypass': bypass } : {}
const get = (path) => fetch(base + path, { headers, redirect: 'follow' })

const entry = await fetch(base + '/', { headers, redirect: 'manual' })
if (entry.status >= 300 && entry.status < 400) {
  const destination = entry.headers.get('location') ?? '(no location)'
  const reason = destination.startsWith('https://vercel.com/sso-api')
    ? 'Vercel Authentication blocked the deployment; set VERCEL_AUTOMATION_BYPASS_SECRET.'
    : `Homepage redirected instead of serving the site (${entry.status}).`
  console.error(`Deployment check cannot reach the site: ${reason}`)
  process.exit(1)
}

const expectations = [
  ['/', 200],
  ['/project/feltsight', 200],
  ['/project/echovision', 200],
  ['/publications', 200],
  ['/writing', 200],
  ['/sitemap.xml', 200],
  ['/project/touchport', 404],
]
const failures = []
for (const [path, status] of expectations) {
  const res = await get(path)
  if (res.status !== status) failures.push(`${path}: expected ${status}, got ${res.status}`)
}

const home = await get('/')
const csp = home.headers.get('content-security-policy') ?? ''
if (!csp.includes("frame-ancestors 'none'")) failures.push('Content-Security-Policy missing or weakened')
if (/'unsafe-eval'/.test(csp)) failures.push("Content-Security-Policy allows 'unsafe-eval'")

const html = await home.text()
const media = [...new Set(html.match(/\/media\/[^"?\s]+\.(?:mp4|avif|webp|jpe?g|png|pdf)/g) ?? [])]
if (!media.length) failures.push('Homepage references no /media/ files')
for (const file of media) {
  const res = await fetch(base + encodeURI(decodeURI(file)), { method: 'HEAD', headers })
  if (res.status !== 200) failures.push(`${file}: ${res.status}`)
}

if (failures.length) {
  console.error(`Deployment check failed for ${base}:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`Deployment check passed for ${base}: ${expectations.length} routes, ${media.length} media files`)
