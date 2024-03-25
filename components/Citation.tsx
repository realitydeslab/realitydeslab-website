'use client'

import { useState } from 'react'

const Citation = ({ children }: { children: string | undefined }) => {
  const [copied, setCopied] = useState<boolean>(false)

  const doCopy = () => {
    window.navigator.clipboard.writeText(children ?? '')
    setCopied(true)
  }

  return (
    children && (
      <div className="x-citation">
        <h2>citation</h2>
        <p>
          copy to the clip board for citation
          <button className="ml-1 hover:text-accent-500 active:text-accent-500" onClick={doCopy}>
            [{copied ? '✓' : '→'}]
          </button>
        </p>
        <pre className="!lg:p-6 max-h-[6.25rem] w-full overflow-y-auto whitespace-pre-wrap p-3">
          <code className="font-code text-xs">{children}</code>
        </pre>
      </div>
    )
  )
}
export default Citation
