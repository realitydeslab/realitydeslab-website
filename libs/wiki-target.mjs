// An absent destination is text, not a link to the homepage or a guessed route.
export function wikiTarget(value, links) {
  const target = value.replace(/^\[\[|\]\]$/g, '').split('|')[0].trim()
  const [file, ...fragment] = target.split('#')
  const anchor = fragment.join('#').trim().toLowerCase().replace(/\s+/g, '-')
  if (!file) return anchor ? `#${anchor}` : null
  const normalized = file.replaceAll('\\', '/').replace(/\.md$/i, '')
  const url = links[normalized]
  return url ? `${url}${anchor ? `#${anchor}` : ''}` : null
}
