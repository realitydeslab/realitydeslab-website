import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import ImageControl from './mdx/ImageControl'
import Contacts from './mdx/Contacts'
import Contact from './mdx/Contact'
import Members from './mdx/Members'
import Hide from './mdx/Hide'

export const components: MDXComponents = {
  Image,
  // TOCInline,
  a: CustomLink,
  pre: Pre,
  table: TableWrapper,
  BlogNewsletterForm,
  ImageControl,
  Members,
  Contacts,
  Contact,
  Hide,
}
