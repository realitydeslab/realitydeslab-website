import { allProjects, allCodes, allCourses } from 'contentlayer/generated'
import { allPublishedContent } from '@/libs/utils'

const projects = allPublishedContent(allProjects).map((project) => {
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
  // { href: '/research', title: 'research' },
  // { href: '/code', title: 'open source', children: codes },
  { href: '/code', title: 'open source' },
  // { href: '/teaching', title: 'teaching', children: courses },
  { href: '/teaching', title: 'teaching' },
  { href: '/writing', title: 'writing' },
  { href: '/about-reality-design-lab', title: 'about' },
  { href: '/people', title: 'founder' },
  { href: '/join-us', title: 'join us' },
]

export default headerNavLinks
