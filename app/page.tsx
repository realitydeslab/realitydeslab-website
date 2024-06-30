import { allProjects } from 'contentlayer/generated'
import Projects from '@/components/Projects'
import { allPublishedContent } from '@/libs/utils'

export default async function Page() {
  const projects = allPublishedContent(allProjects)
  return <Projects projects={projects} />
}
