import { handlePermalinks } from './inc/permalinks.mjs'
import { handleEntries } from './inc/entries.mjs'
async function prebuild() {
  console.log('start prebuild...')
  await handlePermalinks()
  await handleEntries()
  console.log('prebuild done.')
}

prebuild()
