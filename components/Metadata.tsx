import { values } from 'lodash'

interface Props {
  data: object
}

function groupHasContent(data: object, key: string) {
  return values(data[key]).some((n) => n)
}

function renderRow(title: string, content: string) {
  return (
    content && (
      <p key={title}>
        <label>{title}: </label>
        <span>{content ?? ''}</span>
      </p>
    )
  )
}

const Metadata = ({ data }: Props) => {
  const keys = Object.keys(data)

  return Object.entries(data).map(
    ([label, rows]) =>
      groupHasContent(data, label) && (
        <div key={label} className="x-metadata grid gap-3 lg:gap-6">
          <h2>{label}</h2>
          <div className="text-14 grid gap-2 leading-normal lg:gap-3 lg:text-base">
            {Object.entries(rows).map(([title, content]) => renderRow(title, content as string))}
          </div>
        </div>
      )
  )
}

export default Metadata
