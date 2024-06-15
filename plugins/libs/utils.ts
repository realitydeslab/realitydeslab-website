var isProduction = process.env.NODE_ENV === 'production'

import _ from 'lodash'

function coreContent(content) {
  return _.omit(content, ['body', '_raw', '_id'])
}

function __(wikilink) {
  return wikilink.replaceAll('[[', '').replaceAll(']]', '')
  .split("|").pop() //TODO:临时处理 "page|alias"链接
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
  const publishedContents = contents.map((c) => coreContent(c)).filter((c) => 'published' in c && c.published === true)
  const sortedContents = _.sortBy(publishedContents, 'date').reverse()
  return sortedContents
}


export { __, collect, allPublishedContent }
