import entryData from '../../.cache/entries.json'
import { __ } from '@/libs/utils'
import _ from 'lodash'

const getEntry = (entry: string) => {
  const key = __(entry)
  return key ? entryData[key] : null
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
    (entry: any) => entry.authors && entry.authors.some((n: any) => __(n) == name)
  )

  return entryRecognitions(_.keys(entries))
}

const EntryRecognition = ({ entry }: { entry: string }) => {
  const entity = getEntry(entry)
  if (!entity) return <></>
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
