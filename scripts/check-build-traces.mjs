import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('.next/server/app')
const limit = 200 * 1024 * 1024
if (!fs.existsSync(root)) throw new Error('Next.js server traces are missing')

const traces = fs.readdirSync(root, { recursive: true }).filter((name) => name.endsWith('.nft.json'))
if (!traces.length) throw new Error('No Next.js server traces were generated')

let largest = { route: '', bytes: 0 }
const tracedMedia = new Set()
for (const name of traces) {
  const trace = path.join(root, name)
  const files = JSON.parse(fs.readFileSync(trace, 'utf8')).files
  let bytes = 0
  for (const file of files) {
    const absolute = path.resolve(path.dirname(trace), file)
    const relative = path.relative(process.cwd(), absolute).split(path.sep).join('/')
    if (relative.startsWith('public/media/')) tracedMedia.add(relative)
    try {
      bytes += fs.statSync(absolute).size
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  if (bytes > largest.bytes) largest = { route: name, bytes }
}

console.log(`Checked ${traces.length} server traces; largest ${largest.route}: ${(largest.bytes / 1048576).toFixed(1)} MiB`)
if (tracedMedia.size) throw new Error(`${tracedMedia.size} public media files were included in server functions`)
if (largest.bytes > limit) throw new Error(`Server trace exceeds the 200 MiB release guard: ${largest.route}`)
