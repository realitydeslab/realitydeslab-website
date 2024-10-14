import { allProjects } from 'contentlayer/generated'
import Projects from '@/components/Projects'
import { allPublishedContent } from '@/libs/utils'
import { sortByOrder } from '@/data/headerNavLinks'

export default async function Page() {
  const projects = allPublishedContent(allProjects).sort(sortByOrder)
  return <Projects projects={projects} />
}
