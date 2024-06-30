import 'dotenv/config'
import { handlePermalinks } from './inc/permalinks.mjs'
import { handleEntries } from './inc/entries.mjs'
import { handleMedias } from './inc/medias.mjs'

async function prebuild() {
  console.log('start prebuild...')
  await handlePermalinks()
  await handleEntries()
  await handleMedias()
  console.log('prebuild done.')
}

prebuild()
