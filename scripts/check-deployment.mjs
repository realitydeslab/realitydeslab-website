// Smoke-check a deployment before it takes the domain: key routes render,
// hidden work stays hidden, security headers are present, and every media
// file the homepage references is served.
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const base = process.argv[2]?.replace(/\/$/, '')
if (!base || !/^https?:\/\//.test(base)) {
  console.error('Usage: node scripts/check-deployment.mjs <deployment-url>')
  process.exit(2)
}
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
const headers = bypass ? { 'x-vercel-protection-bypass': bypass } : {}
const useVercelCurl = process.env.VERCEL_CURL === '1' && !bypass

async function vercelCurl(path, curlArgs) {
  const args = ['--yes', 'vercel@59.25.0', 'curl', path, '--deployment', base]
  if (process.env.VERCEL_TOKEN) args.push('--token', process.env.VERCEL_TOKEN)
  args.push('--', '--silent', '--show-error', '--max-time', '20', ...curlArgs)
  try {
    return (await execFileAsync('npx', args, { timeout: 30000, maxBuffer: 2 * 1024 * 1024 })).stdout
  } catch {
    // Do not include the command or stderr: either may contain a CLI token.
    throw new Error(`Authenticated request failed for ${path}`)
  }
}

async function status(path, method = 'GET') {
  if (!useVercelCurl) {
    return (await fetch(base + path, {
      method, headers, redirect: 'manual', signal: AbortSignal.timeout(20000),
    })).status
  }
  const args = ['--output', '/dev/null', '--write-out', '%{http_code}']
  if (method === 'HEAD') args.push('--head')
  return Number((await vercelCurl(path, args)).trim())
}

async function homepage() {
  if (!useVercelCurl) {
    const response = await fetch(base + '/', {
      headers, redirect: 'manual', signal: AbortSignal.timeout(20000),
    })
    return {
      status: response.status,
      location: response.headers.get('location'),
      csp: response.headers.get('content-security-policy') ?? '',
      html: await response.text(),
    }
  }
  const raw = await vercelCurl('/', ['--include'])
  const separator = raw.indexOf('\r\n\r\n')
  if (separator < 0) throw new Error('Authenticated homepage response has no HTTP headers')
  const header = raw.slice(0, separator)
  return {
    status: Number(header.match(/^HTTP\/\S+\s+(\d+)/)?.[1]),
    location: header.match(/^location:\s*(.+)$/im)?.[1],
    csp: header.match(/^content-security-policy:\s*(.+)$/im)?.[1] ?? '',
    html: raw.slice(separator + 4),
  }
}

const entry = await homepage()
if (entry.status >= 300 && entry.status < 400) {
  const destination = entry.location ?? '(no location)'
  const reason = destination.startsWith('https://vercel.com/sso-api')
    ? 'Vercel Authentication blocked the deployment; use VERCEL_CURL or set VERCEL_AUTOMATION_BYPASS_SECRET.'
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
if (entry.status !== 200) failures.push(`/: expected 200, got ${entry.status}`)
for (const [path, expected] of expectations.slice(1)) {
  const actual = await status(path)
  if (actual !== expected) failures.push(`${path}: expected ${expected}, got ${actual}`)
}

const csp = entry.csp
if (!csp.includes("frame-ancestors 'none'")) failures.push('Content-Security-Policy missing or weakened')
if (/'unsafe-eval'/.test(csp)) failures.push("Content-Security-Policy allows 'unsafe-eval'")

const html = entry.html
const media = [...new Set(html.match(/\/media\/[^"?\s]+\.(?:mp4|avif|webp|jpe?g|png|pdf)/g) ?? [])]
if (!media.length) failures.push('Homepage references no /media/ files')
const mediaRoot = new URL('../public/media/', import.meta.url)
if (!fs.existsSync(mediaRoot)) throw new Error('Built public media directory is missing')
const videos = fs.readdirSync(mediaRoot, { recursive: true })
  .filter((file) => /\.mp4$/i.test(file))
  .map((file) => '/media/' + file.split(path.sep).map(encodeURIComponent).join('/'))
if (!videos.length) failures.push('Built site contains no preview videos')
const assets = [...new Set([...media.map((file) => encodeURI(decodeURI(file))), ...videos])]
for (let i = 0; i < assets.length; i += 5) {
  const batch = assets.slice(i, i + 5)
  const results = await Promise.all(batch.map((file) => status(file, 'HEAD')))
  results.forEach((actual, index) => {
    if (actual !== 200) failures.push(`${batch[index]}: ${actual}`)
  })
}

if (failures.length) {
  console.error(`Deployment check failed for ${base}:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`Deployment check passed for ${base}: ${expectations.length} routes, ${media.length} homepage media, ${videos.length} preview videos`)
