import type { AppProps } from "next/app";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import Link from "next/link";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <header className="my-12 font-serif text-center">
        <Link href="/">
          <a className="text-gray-500">
            &mdash; &nbsp; erik.cat &nbsp; &mdash;
          </a>
        </Link>
      </header>
      <main className="container px-12 mx-auto font-serif prose xl:px-0">
        <Component {...pageProps} />
      </main>
      <footer className="my-12 text-sm italic text-center text-gray-500 font-serif2">
        Copyright &copy; {new Date().getFullYear()} &mdash; Èrik C. Forés. All
        Rights Reserved.
      </footer>
    </>
  );
}

export default MyApp;
