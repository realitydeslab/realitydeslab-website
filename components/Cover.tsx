import Image from 'next/image'

type CoverProps = {
  cover: { uri: string; type: string }
  alt: string
  className?: string
  eager?: boolean
}

const Cover = ({ cover, alt, className = '', eager = false }: CoverProps) => {
  return (
    cover &&
    cover.type == 'img' && (
      <Image
        className={className}
        width={1600}
        placeholder="empty"
        loading={eager ? 'eager' : 'lazy'}
        sizes="(max-width:768px) 100vw,(max-width:1200px) 70vw,66vw"
        height={900}
        style={{ width: '100%', height: 'auto' }}
        alt={alt}
        src={cover.uri ?? ''}
      />
    )
  )
}

export default Cover
