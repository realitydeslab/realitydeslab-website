import assert from 'node:assert/strict'
import test from 'node:test'
import { wikiTarget } from '../libs/wiki-target.mjs'

const links = { 'Projects/MOFA.ar/MOFA.ar': '/project/mofa', MOFA: '/project/mofa' }
test('wiki destinations preserve qualified paths, aliases, and headings', () => {
  assert.equal(wikiTarget('[[Projects/MOFA.ar/MOFA.ar.md#Playing together|Play]]', links), '/project/mofa#playing-together')
  assert.equal(wikiTarget('[[MOFA]]', links), '/project/mofa')
  assert.equal(wikiTarget('[[#Publications]]', links), '#publications')
})
test('unpublished and unresolved targets never become homepage or guessed links', () => {
  assert.equal(wikiTarget('[[Unpublished project]]', links), null)
  assert.equal(wikiTarget('[[Meta/Authors/Unknown.md|Someone]]', links), null)
  assert.equal(wikiTarget('', links), null)
})
