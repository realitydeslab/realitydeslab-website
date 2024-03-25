import NextImage, { ImageProps } from 'next/image'

const Image = ({ ...rest }: ImageProps) => (
  <NextImage {...rest} className="h-auto w-full object-contain" />
)

export default Image
