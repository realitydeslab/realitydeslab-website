import Image from 'next/image'

type CoverProps = {
  cover: { uri: string; type: string }
  alt: string
  className?: string
}

const Cover = ({ cover, alt, className = '' }: CoverProps) => {
  return (
    cover &&
    cover.type == 'img' && (
      <Image
        className={className}
        width={0}
        placeholder="empty"
        sizes="(max-width:768px) 100vw,(max-width:1200px) 70vw,66vw"
        height={0}
        style={{ width: '100%', height: 'auto' }}
        alt={alt}
        src={cover.uri ?? ''}
      />
    )
  )
}

export default Cover
