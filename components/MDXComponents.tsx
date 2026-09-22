import Video from './Video'
import PdfDocument from './PdfDocument'
import Pre from 'pliny/ui/Pre.js'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm.js'
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
  Video,
  video: Video,
  embed: PdfDocument,
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
