import { syntax } from './syntax'
import { toMarkdown } from 'mdast-util-wiki-link'
import { fromMarkdown, wikiLinkTransclusionFormat } from './from-markdown'

export type remarkWikiLinkOptions = {
  aliasDivider: string
  pageResolver: (name: string) => any[]
  permalinks: {}
  newClassName?: string
  wikiLinkClassName?: string
  hrefTemplate: (name: string) => string
}

function remarkWikiLink(this: any, opts: remarkWikiLinkOptions) {
  const data = this.data()
  const permalinks = opts.permalinks ?? {}

  function defaultPageResolver(name: string) {
    const image = wikiLinkTransclusionFormat(name)[1]

    let heading = ''

    if (!image && !name.startsWith('#') && name.match(/#/)) {
      ;[, heading] = name.split('#')
      name = name.replace(`#${heading}`, '')
    } else if (name.startsWith('#')) {
      name = name.toLowerCase()
    }

    if (permalinks) {
      const url = permalinks[name] ?? permalinks[name] ?? null

      if (url) {
        if (heading) return [`${url}#${heading.toLowerCase()}`.replace(/ /g, '-')]
        return [url]
      }
    }
    return image ? [name] : [name.replace(/ /g, '-')]
  }

  function add(field: any, value: any) {
    if (data[field]) data[field].push(value)
    else data[field] = [value]
  }

  opts = {
    ...opts,
    aliasDivider: opts.aliasDivider ? opts.aliasDivider : '|',
    pageResolver: opts.pageResolver ? opts.pageResolver : defaultPageResolver,
    permalinks: opts.permalinks,
  }

  add('micromarkExtensions', syntax(opts))
  add('fromMarkdownExtensions', fromMarkdown(opts))
  add('toMarkdownExtensions', toMarkdown(opts))
}

export default remarkWikiLink
