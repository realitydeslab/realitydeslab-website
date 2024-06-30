import { remarkWikiLinkOptions } from '.'

function wikiLinkTransclusionFormat(extension) {
  const transclusionFormats = [
    /\.jpe?g$/,
    /\.a?png$/,
    /\.webp$/,
    /\.avif$/,
    /\.gif$/,
    /\.svg$/,
    /\.bmp$/,
    /\.ico$/,
    /\.pdf$/,
  ]

  const supportedFormat = extension.match(
    transclusionFormats.filter((r) => extension.match(r))[0]
  )[0]
  const strippedExtension = extension.match(/\.[0-9a-z]{1,4}$/gi)

  if (!supportedFormat) return [false, strippedExtension && strippedExtension[0].replace('.', '')]

  return [true, supportedFormat.replace('.', '')]
}

function fromMarkdown(opts: remarkWikiLinkOptions) {
  const permalinks = opts.permalinks || {}
  const defaultPageResolver = (name: string) => [name.replace(/ /g, '-')]
  const pageResolver = opts.pageResolver || defaultPageResolver
  const newClassName = opts.newClassName || 'new'
  const wikiLinkClassName = opts.wikiLinkClassName || 'internal'
  const defaultHrefTemplate = (permalink: string) => permalink
  const hrefTemplate = opts.hrefTemplate || defaultHrefTemplate
  let node: any

  function enterWikiLink(this: any, token: any) {
    node = {
      type: 'wikiLink',
      value: null,
      isType: token.isType ? token.isType : null,
      data: {
        alias: null,
        permalink: null,
        exists: null,
      },
    }
    this.enter(node, token)
  }

  function top(stack: any) {
    return stack[stack.length - 1]
  }

  function exitWikiLinkAlias(this: any, token: any) {
    const alias = this.sliceSerialize(token)
    const current = top(this.stack)
    current.data.alias = alias
  }

  function exitWikiLinkTarget(this: any, token: any) {
    const target = this.sliceSerialize(token)
    const current = top(this.stack)
    current.value = target
  }

  function permalinkExists(link: string) {
    return Object.values(permalinks).indexOf(link) !== -1
  }

  function exitWikiLink(this: any, token: any) {
    this.exit(token)
    const wikiLink = node
    const wikiLinkTransclusion = wikiLink?.isType === 'transclusions'

    const pagePermalinks = pageResolver(wikiLink?.value)
    let permalink = pagePermalinks.find((p) => {
      let heading = ''

      if (!wikiLinkTransclusion && p.match(/#/)) {
        ;[, heading] = p.split('#')
      }
      const link = heading ? p.replace(`#${heading}`, '') : p

      return permalinkExists(link)
    })

    const exists = permalink !== undefined

    if (!exists) {
      permalink = pagePermalinks[0]
    }
    const regex = /\/?index(?![\w\S])|\/?index(?=#)/g
    if (!wikiLinkTransclusion && permalink.match(regex)) {
      permalink = permalink.replace(regex, '')
    }

    let displayName
    let transclusionFormat

    if (wikiLinkTransclusion) {
      transclusionFormat = wikiLinkTransclusionFormat(wikiLink.value)
      if (!transclusionFormat[0]) {
        displayName = `Document type ${transclusionFormat[1] ? transclusionFormat[1].toUpperCase() : null} is not yet supported for transclusion`
        console.warn(displayName)
        wikiLink.data.hName = 'span'
        wikiLink.data.hChildren = [
          {
            type: 'text',
            value: displayName,
          },
        ]
      } else {
        const regex = new RegExp(`${transclusionFormat[1]}$`, 'g')
        displayName = wikiLink.value.replace(regex, '')

        if (transclusionFormat[1] === 'pdf') {
          wikiLink.data.hName = 'embed'
        } else {
          wikiLink.data.hName = 'img'
        }
      }
    } else {
      if (wikiLink.value.startsWith('#')) {
        displayName = wikiLink.value.replace('#', '')
      } else {
        displayName = wikiLink.value
      }
      wikiLink.data.hName = 'a'
    }

    if (wikiLink.data.alias && !wikiLinkTransclusion) {
      displayName = wikiLink.data.alias
    }

    let classNames = wikiLinkClassName
    if (!exists && !wikiLinkTransclusion) {
      classNames += ' ' + newClassName
    }

    wikiLink.data.alias = displayName
    wikiLink.data.permalink = permalink
    wikiLink.data.exists = exists

    if (wikiLinkTransclusion) {
      if (!transclusionFormat[0]) {
        wikiLink.data.hProperties = {
          className: classNames + ' no-support',
          style: 'color:#fef08a;',
          src: hrefTemplate(permalink),
        }
      } else if (transclusionFormat[1] === 'pdf') {
        wikiLink.data.hProperties = {
          className: `${classNames} x-pdf`,
          type: 'application/pdf',
          src: hrefTemplate(permalink),
        }
      } else {
        wikiLink.data.hProperties = {
          className: classNames,
          src: hrefTemplate(permalink),
          alt: displayName,
        }
      }
    } else {
      wikiLink.data.hProperties = {
        className: classNames,
        href: hrefTemplate(permalink),
      }
      wikiLink.data.hChildren = [
        {
          type: 'text',
          value: displayName,
        },
      ]
    }
  }

  return {
    enter: {
      wikiLink: enterWikiLink,
    },
    exit: {
      wikiLinkTarget: exitWikiLinkTarget,
      wikiLinkAlias: exitWikiLinkAlias,
      wikiLink: exitWikiLink,
    },
  }
}

export { fromMarkdown, wikiLinkTransclusionFormat }
