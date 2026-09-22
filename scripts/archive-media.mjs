import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

const folder = path.resolve(process.argv[2] || 'output/archive/EchoVision')
const manifestPath = path.join(folder, 'manifest.json')
const records = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
await fs.mkdir(path.join(folder, 'web'), { recursive: true })
let cursor = 0
async function worker() {
  while (cursor < records.length) {
    const record = records[cursor++]
    try {
      const target = path.join(folder, path.basename(record.file))
      let data
      try { data = await fs.readFile(target) } catch {
        const response = await fetch(record.url, { signal: AbortSignal.timeout(60000) })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        data = Buffer.from(await response.arrayBuffer())
        await sharp(data).metadata() // Reject HTML error pages before archiving.
        await fs.writeFile(target, data)
      }
      const meta = await sharp(data).metadata()
      record.sha256 = createHash('sha256').update(data).digest('hex')
      record.bytes = data.length
      record.width = meta.width
      record.height = meta.height
      record.archivedAt = record.archivedAt || new Date().toISOString()
      record.webFile = 'web/' + path.parse(record.file).name + '.webp'
      await sharp(data).rotate().resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 }).toFile(path.join(folder, record.webFile))
      delete record.error
      console.log(`Archived ${record.file} (${data.length} bytes)`)
    } catch (error) {
      record.error = String(error)
      console.error(record.file, record.error)
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
await fs.writeFile(manifestPath, JSON.stringify(records, null, 2) + '\n')
const failures = records.filter((r) => r.error)
console.log(`${records.length - failures.length}/${records.length} archived`)
if (failures.length) process.exitCode = 1
