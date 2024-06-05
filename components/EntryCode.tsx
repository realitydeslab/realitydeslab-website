import { Code } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer'
import Authors from '@/components/Authors'
import Link from 'next/link'
import { EntryWrap } from '@/components/helpers/Common'
import Cover from './Cover'
type Props = {
  code: CoreContent<Code>
}

const Title = ({ code }: Props) => {
  return (
    <h2 className="text-32 leading-[1.2] lg:text-40">
      <a href={code.url} className="hover:text-accent-500">
        {code.title}
      </a>
    </h2>
  )
}

const Repo = ({ code }: Props) => {
  return (
    <p>
      <a
        target="_blank"
        href={code.repos[0]}
        className="font-code text-xs leading-none hover:text-accent-500 lg:text-sm"
      >
        {code.repos[0]}
      </a>
    </p>
  )
}

const Description = ({ code }: Props) => {
  return (
    code.description && (
      <p className="hidden leading-loose lg:block">
        {code.description}
        <Link href={code.url} className="ml-1 hover:text-accent-500">
          [→]
        </Link>
      </p>
    )
  )
}

const EntryCode = ({ code }: Props) => {
  return (
    <EntryWrap key={code.title}>
      <Title code={code} />
      <Description code={code} />
      <Authors authors={code.authors} />
      <Repo code={code} />
      <Cover
        cover={code.parsed_cover}
        alt={code.title}
        className=" relative hidden lg:block lg:aspect-video"
      />
    </EntryWrap>
  )
}

export default EntryCode
