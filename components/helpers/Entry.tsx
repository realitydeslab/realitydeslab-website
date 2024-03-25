import entryData from '@/cache/entries.json' assert { type: 'json' }
import { __ } from '@/plugins/libs/utils'
import _ from 'lodash'

const getEntry = (entry: string) => {
  return entryData[__(entry)] ?? null
}

const entryRecognitions = (entries: string[]) => {
  return entries.length ? (
    entries.map((entry, index) => <EntryRecognition key={`reco_${index}`} entry={entry} />)
  ) : (
    <></>
  )
}

const authorPublications = (name: string) => {
  const entries = _.pickBy(
    entryData,
    (entry) => entry.authors && entry.authors.some((n) => __(n) == name)
  )

  return entryRecognitions(_.keys(entries))
}

const EntryRecognition = ({ entry }: { entry: string }) => {
  const entity = getEntry(entry)
  if (entity === null) return <></>
  const { recognition, recoLink } = entity

  return recognition && recoLink ? (
    <p>
      {recognition}
      <a href={recoLink} target="_blank" rel="nofollow" className="x-link-arrow">
        [→]
      </a>
    </p>
  ) : (
    <></>
  )
}

export { EntryRecognition, entryRecognitions, authorPublications }
