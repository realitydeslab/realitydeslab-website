import { allCourses } from 'contentlayer/generated'
import { __, allPublishedContent } from '@/plugins/libs/utils'
import EntryCode from '@/components/EntryCode'

export default async function Page() {
  const courses = allPublishedContent(allCourses)

  return (
    <div className="flex flex-col gap-8 lg:gap-[3.75rem]">
      {courses.map((course) => (
        <EntryCode key={course.title} code={course}></EntryCode>
      ))}
    </div>
  )
}
