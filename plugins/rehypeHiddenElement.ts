/**
 * @typedef {import('hast').Root} Root
 */

/**
 * @typedef Options
 *   Configuration (optional).
 * @property {string} [prefix='']
 *   Prefix to add in front of `id`s.
 */

import _ from 'lodash'
import { visit } from 'unist-util-visit'

/**
 * Plugin to add `id`s to headings.
 *
 * @type {import('unified').Plugin<[Options?]|Array<void>, Root>}
 */
export default function rehypeHiddenElement(options = {}) {
  return (tree) => {
    visit(
      tree,
      (node) => node && (node as any).name == 'hide',
      (node) => {
        node.name = _.capitalize(node.name)
        node.children = []
      }
    )
  }
}
