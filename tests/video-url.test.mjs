import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveVideoUrl } from '../libs/video-url.mjs'
import { fileIsPublished } from '../scripts/inc/utils.mjs'

test('Vimeo unlisted tokens survive both supported link formats', () => {
  for (const value of ['https://vimeo.com/915076535/79af935685', 'https://player.vimeo.com/video/915076535?h=79af935685']) {
    const parsed = new URL(resolveVideoUrl(value).src)
    assert.equal(parsed.pathname, '/video/915076535')
    assert.equal(parsed.searchParams.get('h'), '79af935685')
  }
})
test('YouTube links use HTTPS privacy-enhanced embeds', () => {
  for (const value of ['http://youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ', 'https://youtube.com/shorts/dQw4w9WgXcQ'])
    assert.equal(resolveVideoUrl(value).src, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?playsinline=1')
})
test('untrusted frames and malformed IDs cannot become embeds', () => {
  for (const value of ['javascript:alert(1)', 'https://vimeo.com.evil.test/1234', 'https://example.com/vimeo.com/1234', 'https://youtube.com/watch?v=x', '/local'])
    assert.equal(resolveVideoUrl(value), null)
})
test('publication requires explicit true, preserving documented legacy draft semantics', () => {
  assert.equal(fileIsPublished({ published: false, draft: true }), false)
  assert.equal(fileIsPublished({ draft: true }), false)
  assert.equal(fileIsPublished({ published: 'true' }), false)
  assert.equal(fileIsPublished({ published: true, draft: true }), true)
})
