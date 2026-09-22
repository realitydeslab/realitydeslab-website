import fs from 'fs-extra'
import { dirname } from 'path'
import chalk from 'chalk'
import path from 'path'
import permalinks from '../.cache/permalinks.json'
import medias from '../.cache/medias.json'
import { wikiTarget } from './wiki-target.mjs'

const supportedFileFormats = ['zip', 'bib', 'csl', 'pdf']

const supportedMediaFormats = [
  'webp',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'svg',
  'apng',
  'png',
  'avif',
  'ico',
]

const videoFileFormats = ['mp4', 'mov', 'webm']

const isVideo = (filepath: string): boolean =>
  videoFileFormats.indexOf(path.extname(filepath).replace('.', '')) >= 0

const isFile = (filepath: string): boolean =>
  supportedFileFormats.indexOf(path.extname(filepath).replace('.', '')) >= 0

const isMedia = (filepath: string): boolean =>
  supportedMediaFormats.indexOf(path.extname(filepath).replace('.', '')) >= 0

export type PermalinkResult = {
  type: 'img' | 'video' | 'link' | 'pdf'
  uri: string | null
  label?: string
}

function resolveWikilink(wikilink: string): { filepath: string; label?: string } {
  const decoded = wikilink.replace('[[', '').replace(']]', '').split('|')
  if (decoded.length > 1) {
    return { filepath: decoded[0], label: decoded[1] }
  } else {
    return { filepath: decoded[0] }
  }
}
//wikilink:[[file|alias?]]
function resolvePermalink(wikilink: string): PermalinkResult {
  const { filepath, label } = resolveWikilink(wikilink)

  if (filepath == '') {
    return { type: 'link', uri: null }
  }

  if (isMedia(filepath)) {
    return { type: 'img', uri: resolveMedia(filepath) }
  } else if (isVideo(filepath)) {
    return { type: 'video', uri: resolveMedia(filepath) }
  } else if (isFile(filepath)) {
    return { type: 'link', uri: resolveMedia(filepath) }
  } else {
    return { type: 'link', uri: rewritePermalink(filepath), label }
  }
}

function searchMedia(filename: string, root: string): string | null {
  const normalized = filename.replaceAll('\\', '/').replace(/^\/+/, '')
  if (normalized.split('/').includes('..')) throw new Error(`Unsafe media path: ${filename}`)
  const exact = medias.filter((media) => media.endsWith('/' + normalized))
  if (exact.length === 1) return exact[0]
  if (exact.length > 1) throw new Error(`Ambiguous media reference: ${filename}`)
  return null
}

const resolveMedia = (filename: string): string => {
//  console.log(chalk.bgBlue(`[resolveMedia] ${filename}`))
  if (isFile(filename)) {
    console.log(chalk.bgBlue(`[resolveMedia] ${filename}`))
  }

  const vault_root = `${process.cwd()}/${process.env.VAULT_ROOT || 'vault'}`
  const source = searchMedia(filename, vault_root)

  if (source && fs.existsSync(source)) {
    const public_path = `${process.cwd()}/public`
    const publish_root = `${process.env.PUBLISH_ROOT || 'publish'}`
    const ext = path.extname(filename).replace('.', '')
    const permalink = `/${publish_root}/${filename}`
    const target = `${public_path}/${permalink}`

    if (fs.existsSync(target) && fs.statSync(target).size === fs.statSync(source).size && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) {
      console.log(chalk.gray(`[target file exist.] ${permalink}`))
    } else {
      console.log(chalk.bgGreen(`[copy file] ${permalink}`))
      console.log(chalk.green(`[source] ${source}`))
      console.log(chalk.green(`[target] ${target}`))
      fs.ensureDirSync(dirname(target))
      fs.copyFileSync(source, target)
    }
    if (ext == 'pdf') {
      return `${permalink}?view=Fit`
    }

    return permalink
  } else {
    console.log(chalk.bgRed(`[source file not found.] ${source}`))
    throw new Error(`Referenced media was not found: ${filename}`)
  }
}

const rewritePermalink = (permalink: string): string | null => wikiTarget(permalink, permalinks)

function getLinkContent(token: string): string {
  const wikiLinkPattern = /\[\[(.+)\]\]/
  const matched = token.match(wikiLinkPattern)
  return matched ? matched[1] : token
}

export { rewritePermalink, getLinkContent, resolvePermalink, resolveMedia }
