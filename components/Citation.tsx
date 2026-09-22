'use client'

import { useEffect, useState } from 'react'

const Citation = ({ children }: { children: string | undefined }) => {
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const doCopy = async () => {
    try {
      await window.navigator.clipboard.writeText(children ?? '')
      setCopied(true)
    } catch {
      // clipboard unavailable (insecure context or denied permission)
    }
  }

  return (
    children && (
      <div className="x-citation">
        <h2>Cite Us</h2>
        <div
          role="button"
          tabIndex={0}
          onClick={doCopy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              doCopy()
            }
          }}
          aria-label={copied ? 'Citation copied to clipboard' : 'Copy citation to clipboard'}
          className="group relative cursor-pointer">
          <pre className="w-full whitespace-pre-wrap !pr-16 lg:!pr-24">
            <code className="font-code text-xs">{children}</code>
          </pre>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute right-3 top-3 text-12 transition-opacity duration-150 lg:right-6 lg:top-6 ${
              copied
                ? 'text-accent-500 opacity-100'
                : 'text-primary-700 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
            }`}>
            {copied ? 'copied' : 'copy'}
          </span>
        </div>
      </div>
    )
  )
}
export default Citation
