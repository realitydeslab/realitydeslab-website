import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer className="my-6 text-12 text-primary-500 lg:my-[3.75rem]">
      {siteMetadata.copyright} {`${new Date().getFullYear()}`}
    </footer>
  )
}
