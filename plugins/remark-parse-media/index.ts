import { sync } from 'probe-image-size'
import { dirname } from 'path'
import fs from 'fs-extra'
import { Node } from 'unist'
import { visit } from 'unist-util-visit'
import chalk from 'chalk'
import { resolveMedia } from '../../libs/permalink-resolver'

type WikiLink = {
  isType?: string
  name: string
  attributes: any[]
  data: {
    permalink: string
    hName: string
    hProperties: {
      src: string
      type: string
      alt: string
    }
  }
} & Node
type remarkParseImageOptions = { useJSX: Boolean }

function composeNextImage(node: WikiLink) {
  try {
    if (node.data.permalink == null) {
      return null
    }

    const target = `${process.cwd()}/public${node.data.permalink}`
    const dimensions = sync(fs.readFileSync(target))
    const max_width = 1800
    const ratio = dimensions.width > max_width ? max_width / dimensions.width : 1

    node.type = 'mdxJsxFlowElement'
    node.name = 'Image'
    node.attributes = [
      { type: 'mdxJsxAttribute', name: 'alt', value: node.data.hProperties.alt },
      {
        type: 'mdxJsxAttribute',
        name: 'src',
        value: node.data.permalink,
      },
      {
        type: 'mdxJsxAttribute',
        name: 'width',
        value: parseInt((dimensions.width * ratio).toString()),
      },
      {
        type: 'mdxJsxAttribute',
        name: 'height',
        value: parseInt((dimensions.height * ratio).toString()),
      },
    ]
  } catch (error) {
    console.error(error)
  }
}

function isTransclusions(node: WikiLink): boolean {
  return (node?.isType && node.isType == 'transclusions') || false
}

function remarkParseMedia(opts: remarkParseImageOptions = { useJSX: false }) {
  return (tree: Node) => {
    visit(tree, 'wikiLink', (node: WikiLink) => {
      if (isTransclusions(node)) {
        let permalink = resolveMedia(node?.data?.permalink)
        node.data.permalink = permalink

        if (opts.useJSX && node.data.hName == 'img') {
          composeNextImage(node)
        } else {
          node.data.hProperties.src = permalink
        }
      }
    })
  }
}

export default remarkParseMedia
