import { Blog } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer'
import { EntryWrap } from '@/components/helpers/Common'
import Authors from '@/components/Authors'
import Link from 'next/link'
import Cover from './Cover'

type Props = {
  post: CoreContent<Blog>
}

const Title = ({ post }: Props) => {
  return (
    <h2 className="text-28 leading-[1.2] lg:text-40">
      <a href={post.url} className="hover:text-accent-500">
        {post.title}
      </a>
    </h2>
  )
}

const Description = ({ post }: Props) => {
  return (
    post.description && (
      <p className="hidden leading-loose lg:block">
        {post.description}
        <Link href={post.url} className="ml-1 hover:text-accent-500">
          [→]
        </Link>
      </p>
    )
  )
}

const EntryPost = ({ post }: Props) => {
  return (
    <EntryWrap key={post.title}>
      <Title post={post} />
      <Description post={post} />
      <Authors authors={post.authors} byClassName="text-primary-500" date={post.date} />
      <Cover
        cover={post.parsed_cover}
        alt={post.title}
        className="relative aspect-video object-cover object-top"
      />
    </EntryWrap>
  )
}

export default EntryPost
