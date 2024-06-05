import { visit } from 'unist-util-visit'
import { Parent, Node } from 'unist'

import { permalinkHandler, PermalinkResult } from './libs/permalinkHandler'

import { permaLinkParser } from './libs/permalinkParser'

type remarkHandleWikiLinkOptions = {
  vault_root: string
  target_root: string
  permalinks: string[]
  pathFormat?: 'raw' | 'obsidian-absolute' | 'obsidian-short'
}

function remarkHandleWikiLink(opts: remarkHandleWikiLinkOptions): (tree: Node) => void {
  // const handlePermalink = permalinkHandler(vault_root, target_root)
  const parsePermalink = permaLinkParser(opts)

  return (tree) => {
    visit(
      tree,
      (node: Parent) =>
        node.type === 'paragraph' && node.children.some((n) => n.type === 'wikiLink'),
      (node: Parent) => {
        const nodeIndex = node.children.findIndex((n) => n.type === 'wikiLink')
        let childNode: any = node.children[nodeIndex]

        if (childNode.data && childNode.data.permalink) {
          const { permalink } = childNode.data

          const result: PermalinkResult = parsePermalink(permalink)

          switch (result.type) {
            case 'img':
              childNode.data.hProperties && (childNode.data.hProperties.src = result.uri)
              break

            case 'video':
              childNode.data.hName = 'video'
              childNode.data.hProperties = {
                controls: true,
                src: result.uri,
              }
              childNode.data.hChildren = null
              node.type = 'div'
              break

            case 'link':
            default:
              childNode.data.hProperties && (childNode.data.hProperties.href = result.uri)
              break
          }

          node.children[nodeIndex] = childNode
        }
      }
    )
  }
}

export { remarkHandleWikiLink }
