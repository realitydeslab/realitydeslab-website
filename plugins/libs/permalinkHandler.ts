import fs from 'fs-extra'
import { dirname } from 'path'
import chalk from 'chalk'
import path from 'path'
import permalinksMap from '../../cache/permalinks.json' assert { type: 'json' }

const supportedFileFormats = [
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
  'pdf',
]

const videoFileFormats = ['mp4', 'mov']

const defaultWikiLinkResolver = (target: string) => {
  // for [[#heading]] links
  if (!target) {
    return []
  }
  let permalink = target.replace(/\/index$/, '')
  // TODO what to do with [[index]] link?
  if (permalink.length === 0) {
    permalink = '/'
  }
  return [permalink]
}

const permalinkResolver = (
  pathFormat?: 'raw' | 'obsidian-absolute' | 'obsidian-short',
  permalinks?: string[]
): ((target: string) => string) => {
  return (target: string) => {
    const possibleWikiLinkPermalinks = defaultWikiLinkResolver(target)

    const matchingPermalink =
      permalinks &&
      permalinks.find((e) => {
        return possibleWikiLinkPermalinks.find((p) => {
          if (pathFormat === 'obsidian-short') {
            if (e === p || e.endsWith(p)) {
              return true
            }
          } else if (pathFormat === 'obsidian-absolute') {
            if (e === '/' + p) {
              return true
            }
          } else {
            if (e === p) {
              return true
            }
          }
          return false
        })
      })

    // TODO this is ugly
    const link =
      matchingPermalink ||
      (pathFormat === 'obsidian-absolute'
        ? '/' + possibleWikiLinkPermalinks[0]
        : possibleWikiLinkPermalinks[0]) ||
      ''

    return link
  }
}

const isVideo = (filepath: string): boolean =>
  videoFileFormats.indexOf(path.extname(filepath).replace('.', '')) >= 0

const isMedia = (filepath: string): boolean =>
  supportedFileFormats.indexOf(path.extname(filepath).replace('.', '')) >= 0

export type PermalinkResult = { type: 'img' | 'video' | 'link'; uri: string }

const permalinkHandler = (
  vault_root: string,
  target_root: string
): ((permalink: string) => PermalinkResult) => {
  return (permalink: string) => {
    if (isMedia(permalink)) {
      return { type: 'img', uri: publishMedia(permalink, vault_root, target_root) }
    } else if (isVideo(permalink)) {
      return { type: 'video', uri: publishMedia(permalink, vault_root, target_root) }
    } else {
      return { type: 'link', uri: rewritePermalink(permalink) }
    }
  }
}

const publishMedia = (filepath: string, source_root: string, target_root: string): string => {
  const publishFilePath = `/static/${target_root}${filepath}`

  const publicFolder = `${process.cwd()}/public`
  const vaultFolder = `${process.cwd()}/${source_root}`

  const source = `${vaultFolder}${filepath}`
  const target = `${publicFolder}${publishFilePath}`

  if (fs.existsSync(source)) {
    console.log(chalk.bgGreen('[copy file]'), chalk.green(filepath))
    fs.ensureDirSync(dirname(target))
    fs.copyFileSync(source, target)
  }

  return publishFilePath
}

const rewritePermalink = (permalink: string): string => {
  const found = permalinksMap[permalink] ?? '/'
  console.log(chalk.bgGreen('[rewrite permalink]'), chalk.green(`${permalink} -> ${found}`))
  return found
}

function getLinkContent(token: string): string {
  const wikiLinkPattern = /\[\[(.+)\]\]/
  const matched = token.match(wikiLinkPattern)
  const link = matched ? matched[1] : ''
  return link
}

export { permalinkHandler, permalinkResolver, getLinkContent }
