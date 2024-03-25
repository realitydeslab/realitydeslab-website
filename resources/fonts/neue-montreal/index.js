import localFont from 'next/font/local'
const NeueMontreal = localFont({
  src: [
    {
      path: './NeueMontreal-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './NeueMontreal-LightItalic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './NeueMontreal-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './NeueMontreal-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './NeueMontreal-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './NeueMontreal-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './NeueMontreal-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './NeueMontreal-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
  ],
})

export default NeueMontreal
