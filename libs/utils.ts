import { omit, sortBy } from 'lodash'

function coreContent(content) {
  return omit(content, ['body', '_raw', '_id'])
}

function __(wikilink: string): string | undefined {
  return wikilink.replaceAll('[[', '').replaceAll(']]', '').split('|').pop() //TODO:临时处理 "page|alias"链接
}

function collect(doc, keys) {
  let obj = {}
  keys.forEach((key) => {
    obj[key] = doc[key]
      .array()
      .map((elm) => __(elm))
      .join(', ')
  })
  return obj
}

function allPublishedContent(contents) {
  const publishedContents = contents
    .map((c) => coreContent(c))
    .filter((c) => 'published' in c && c.published === true)
  const sortedContents = sortBy(publishedContents, 'date').reverse()
  return sortedContents
}

export { __, collect, allPublishedContent }
