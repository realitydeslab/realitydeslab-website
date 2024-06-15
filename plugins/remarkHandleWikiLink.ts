import { visit } from 'unist-util-visit'
import { Parent, Node } from 'unist'

import { permaLinkParser, PermalinkResult } from './libs/permalinkParser'

type remarkHandleWikiLinkOptions = {
  vault_root: string
  target_root: string
  permalinks: string[]
  pathFormat?: 'raw' | 'obsidian-absolute' | 'obsidian-short'
}

function remarkHandleWikiLink(opts: remarkHandleWikiLinkOptions): (tree: Node) => void {
  const parsePermalink = permaLinkParser(opts)

  return (tree) => {
    visit(
      tree,
      (node: Parent) =>
        node.type === 'paragraph' && node.children.some((n:any) => n.type === 'wikiLink'),
      (node: Parent) => {
        const items = node.children.filter((n:any) => n.type === 'wikiLink')
        items.forEach((childNode:any) => {
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
          }
        });
      }
    )
  }
}

export { remarkHandleWikiLink }
