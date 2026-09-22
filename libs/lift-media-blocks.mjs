// A wikilink starts as phrasing content. Once it becomes a block component,
// lift it out of the paragraph so the browser and React parse the same tree.
export function liftMediaBlocks(node) {
  if (!Array.isArray(node.children)) return
  const children = []
  for (const child of node.children) {
    liftMediaBlocks(child)
    if (child.type !== 'paragraph' || !child.children.some(isMediaBlock)) {
      children.push(child)
      continue
    }
    let inline = []
    const flush = () => {
      if (inline.some((item) => item.type !== 'text' || item.value.trim())) {
        children.push({ ...child, children: inline })
      }
      inline = []
    }
    for (const item of child.children) {
      if (isMediaBlock(item)) {
        flush()
        children.push(item)
      } else inline.push(item)
    }
    flush()
  }
  node.children = children
}

function isMediaBlock(node) {
  return node.type === 'mdxJsxFlowElement' && ['Video', 'Image'].includes(node.name)
}
