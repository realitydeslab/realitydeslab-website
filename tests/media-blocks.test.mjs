import test from 'node:test'
import assert from 'node:assert/strict'
import { liftMediaBlocks } from '../libs/lift-media-blocks.mjs'

test('standalone video transclusions cannot render a figure inside a paragraph', () => {
  const video = { type: 'mdxJsxFlowElement', name: 'Video', attributes: [] }
  const tree = { type: 'root', children: [{ type: 'paragraph', children: [video] }] }
  liftMediaBlocks(tree)
  assert.equal(tree.children[0], video)
})

test('media blocks preserve adjacent prose and links inside list items', () => {
  const before = { type: 'text', value: 'Before ' }
  const link = { type: 'link', url: '/project/feltsight', children: [{ type: 'text', value: 'FeltSight' }] }
  const after = { type: 'text', value: ' After' }
  const video = { type: 'mdxJsxFlowElement', name: 'Video', attributes: [] }
  const tree = { type: 'listItem', children: [{ type: 'paragraph', children: [before, link, video, after] }] }
  liftMediaBlocks(tree)
  assert.equal(tree.children.length, 3)
  assert.deepEqual(tree.children[0].children, [before, link])
  assert.equal(tree.children[1], video)
  assert.deepEqual(tree.children[2].children, [after])
})
