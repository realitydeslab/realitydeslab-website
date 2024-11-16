import { allProjects, allCodes, allCourses, allBlogs } from 'contentlayer/generated'
import { allPublishedContent } from '@/libs/utils'

type Orderable = {
  order?: number
}

export const sortByOrder = (a: Orderable, b: Orderable) => (b.order || 0) - (a.order || 0)

const projects = allPublishedContent(allProjects)
  .sort(sortByOrder)
  .map((project) => {
    return { title: project.title, href: project.url, codename: project.codename }
  })


const blogs = allPublishedContent(allBlogs).map((project) => {
  return { title: project.title, href: project.url, codename: project.codename }
})

const codes = allPublishedContent(allCodes).map((project) => {
  return { title: project.title, href: project.url, codename: project.codename }
})

const courses = allPublishedContent(allCourses).map((project) => {
  return { title: project.title, href: project.url, codename: project.codename }
})

const headerNavLinks = [
  { href: '/', title: 'Home' },
  { href: '/project', title: 'projects', children: projects },
  { href: '/writing', title: 'writings', children: blogs },
  { href: '/toolkit', title: 'toolkits', children: codes },
  { href: '/teaching', title: 'teachings', children: courses },
  // { href: '/research', title: 'research' },
  // { href: '/code', title: 'open source', children: codes },
  // { href: '/teaching', title: 'teaching', children: courses },
  { href: '/about-reality-design-lab', title: 'about' },
  { href: '/founder', title: 'founder' },
  { href: '/join-us', title: 'join us' },
]

export default headerNavLinks
