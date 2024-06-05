import { allProjects } from 'contentlayer/generated'

let projects = allProjects
  .filter((project) => project.published)
  .map((project) => {
    return { title: project.title, href: project.url, codename: project.codename }
  })

const headerNavLinks = [
  { href: '/', title: 'Home' },
  { href: '/projects', title: 'projects', children: projects },
  // { href: '/research', title: 'research' },
  { href: '/codes', title: 'open source' },
  { href: '/blogs', title: 'writing' },
  { href: '/about-reality-design-lab', title: 'about' },
  { href: '/people', title: 'people' },
  { href: '/join-us', title: 'join us' },
]

export default headerNavLinks
