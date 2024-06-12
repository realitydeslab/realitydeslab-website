import { visit } from 'unist-util-visit'
import { sync } from 'probe-image-size'
import fs from 'fs-extra'
import { Parent, Node } from 'unist'

// src/mdx-plugins/remark-img-to-jsx.ts
function remarkImgToNextImage({ target_root }: { target_root: string }) {
  return (tree) => {
    visit(
      tree,
      // only visit p tags that contain an img element
      (node: Parent) =>
        node.type === 'paragraph' && node.children.some((n:any) => n.data?.hName === 'img'),
      (node) => {
        const imageNodeIndex = node.children.findIndex((n:any) => n.data?.hName === 'img')
        const imageNode = node.children[imageNodeIndex]

        const filePath = `${process.cwd()}/public/static/${target_root}/${imageNode.data.permalink}`

        if (fs.existsSync(filePath)) {
          const dimensions = sync(fs.readFileSync(filePath))

          const max_width = 1800
          const ratio = dimensions.width > max_width ? max_width / dimensions.width : 1

          imageNode.type = 'mdxJsxFlowElement'
          imageNode.name = 'Image'
          imageNode.attributes = [
            { type: 'mdxJsxAttribute', name: 'alt', value: imageNode.data.hProperties.alt },
            {
              type: 'mdxJsxAttribute',
              name: 'src',
              value: `/static/${target_root}${imageNode.data.permalink}`,
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
          node.type = 'div'
          node.children[imageNodeIndex] = imageNode
        }
      }
    )
  }
}

export { remarkImgToNextImage }
