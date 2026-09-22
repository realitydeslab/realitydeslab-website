export default function PdfDocument({ src }: { src?: string }) {
  if (!src) return null
  return (
    <p className="my-4">
      <a href={src} target="_blank" rel="noopener noreferrer" className="x-link">
        Read document (PDF)
      </a>
    </p>
  )
}
