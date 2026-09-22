import 'dotenv/config'
import { handlePermalinks } from './inc/permalinks.mjs'
import { handleEntries } from './inc/entries.mjs'
import { handleMedias } from './inc/medias.mjs'
import { stagePublishedContent } from './inc/published-content.mjs'

async function prebuild() {
  console.log('start prebuild...')
  await stagePublishedContent()
  await handlePermalinks()
  await handleEntries()
  await handleMedias()
  console.log('prebuild done.')
}

prebuild().catch((error) => { console.error(error); process.exitCode = 1 })
