import type { AppProps } from 'next/app'
import 'tailwindcss/tailwind.css'
import Link from 'next/link'

const prosePre =
  'prose-pre:!border-0 prose-pre:!rounded-none prose-pre:!p-0 prose-code:!p-0 prose-pre:!text-black prose-pre:!bg-transparent'
const proseHeadings =
  'prose-headings:!text-left prose-headings:!text-black prose-headings:!font-bold prose-headings:!mt-12 prose-headings:!mb-4'
const proseH1 =
  "prose-h1:!text-2xl md:prose-h1:!text-3xl prose-h1:before:content-['#'] prose-h1:before:pr-2 prose-h1:before:text-slate-200"
const proseH2 = 'prose-h2:!text-xl md:prose-h2:!text-2xl'
const proseH3 = 'prose-h3:!text-lg md:prose-h3:!text-xl'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <header className="my-12 font-serif font-bold tracking-widest text-center">
        <Link href="/">
          <a className="transition-colors duration-300 text-slate-500 hover:text-black">
            &mdash; &nbsp; erik.cat &nbsp; &mdash;
          </a>
        </Link>
      </header>
      <main
        className={`px-6 mx-auto font-serif prose prose-base print:prose-base md:prose-lg ${prosePre} ${proseHeadings} ${proseH1} ${proseH2} ${proseH3} xl:px-0`}>
        <Component {...pageProps} />
      </main>
      <footer className="my-12 font-serif text-xs font-bold text-center text-slate-500">
        Copyright &copy; {new Date().getFullYear()} &mdash; Èrik C. Forés. All Rights Reserved.
      </footer>
    </>
  )
}

export default MyApp
