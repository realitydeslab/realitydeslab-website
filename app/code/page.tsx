import { allCodes } from 'contentlayer/generated'
import { __, allPublishedContent } from '@/libs/utils'
import EntryCode from '@/components/EntryCode'

export default async function Page() {
  const codes = allPublishedContent(allCodes)

  return (
    <div className="flex flex-col gap-8 lg:gap-[3.75rem]">
      {codes.map((code) => (
        <EntryCode key={code.title} code={code}></EntryCode>
      ))}
    </div>
  )
}
