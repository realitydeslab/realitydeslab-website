import Head from 'next/head'

export default function ScrollRestorationDisabler() {
  return (
    <Head>
      {/* Tell the browser to never restore the scroll position on load */}
      <script
        dangerouslySetInnerHTML={{
          __html: `history.scrollRestoration = "manual"`,
        }}
      />
    </Head>
  )
}
