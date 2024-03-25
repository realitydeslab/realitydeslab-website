import siteMetadata from '@/data/siteMetadata'
import Link from './Link'

const Brand = () => (
  <Link href="/" aria-label={siteMetadata.headerTitle} className="x-brand w-[13.25rem] text-right">
    <span className="block whitespace-nowrap text-30 leading-[2.25rem] text-primary-900">
      {siteMetadata.headerTitle}
    </span>
    <span className="block text-right text-sm text-primary-500">{siteMetadata.description}</span>
  </Link>
)

export default Brand
