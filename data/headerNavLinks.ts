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

const abouts = [
  { title: 'reality design lab', href: '/about-reality-design-lab', codename: 'reality design lab' },
  { title: 'botao amber hu', href: 'https://botao.hu', codename: 'botao \'amber\' hu' },
  { title: 'reality designers', href: '/reality-designers', codename: 'reality designers' },
  { title: 'collab with us', href: '/collab-with-us', codename: 'collab with us' },
]

const inspires = [
  { title: 'Augmented Reality', href: 'https://augmented.reality.design', codename: 'Augmented Reality' },
  { title: 'More-than-Human Reality', href: 'https://more-than-human.reality.design', codename: 'More-than-Human Reality' },
  { title: 'Somatic Reality Design', href: 'https://somatic.reality.design', codename: 'Somatic Reality Design' },
  { title: 'Machinic Reality', href: 'https://machinic.reality.design', codename: 'Machinic Reality' },
  { title: 'Protocolized Reality', href: 'https://protocolized.reality.design', codename: 'Protocolized Reality' },
]

const headerNavLinks = [
  { href: '/', title: 'Home' },
  { href: '/project', title: 'projects', children: projects },
  { href: '/writing', title: 'writings', children: blogs },
  { href: '/toolkit', title: 'toolkits', children: codes },
  { href: '/teaching', title: 'teachings', children: courses },
  { href: '#inspires', title: 'inspires', children: inspires },
  // { href: '/research', title: 'research' },
  // { href: '/code', title: 'open source', children: codes },
  // { href: '/teaching', title: 'teaching', children: courses },
  { href: '/publications', title: 'publications'},
  { href: '/fellowships', title: 'fellowships' },
  { href: '/about', title: 'about', children: abouts },

  // { href: '/about-reality-design-lab', title: 'about' },
  // { href: '/join-us', title: 'join us' },
]

export default headerNavLinks
