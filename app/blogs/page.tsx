import { allBlogs } from 'contentlayer/generated'
import { __, allPublishedContent } from '@/plugins/libs/utils'
import EntryPost from '@/components/EntryPost'

export default async function Page() {
  const posts = allPublishedContent(allBlogs)

  return (
    <div className="flex flex-col gap-8 lg:gap-[3.75rem]">
      {posts.map((post, index) => (
        <EntryPost key={`post_${index}`} post={post} />
      ))}
    </div>
  )
}
 