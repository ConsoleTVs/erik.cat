import type { Post } from 'contracts'
import type { NextPage, GetStaticProps } from 'next'
import { getPosts } from 'lib/posts'
import { SmallHeader } from 'components/Header'
import Head from 'next/head'
import { slug, orderPostsByDate } from 'lib/utils'
import Image from 'next/image'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'

interface Props {
  posts: Post[]
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  return {
    props: {
      posts: (await getPosts()).sort(orderPostsByDate),
    },
  }
}

const Home: NextPage<Props> = ({ posts }) => {
  const [search, setSearch] = useState('')
  const [fuse] = useState(function () {
    return new Fuse(posts, {
      keys: ['title', 'tags', 'date'],
      threshold: 0.25,
    })
  })
  const [searchInput, setSearchInput] = useState<HTMLInputElement>()
  const [results, setResults] = useState<Post[]>([])
  const filteredPosts = useMemo(() => (search === '' ? posts : results), [search, results])

  const handleSearch = useCallback(function (event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.currentTarget.value)
    setResults(fuse.search(event.currentTarget.value).map((item) => item.item))
  }, [])

  useEffect(
    function () {
      function detectSearch(event: KeyboardEvent) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          searchInput?.focus()
        }
      }

      document.addEventListener('keydown', detectSearch)

      return function () {
        document.removeEventListener('keydown', detectSearch)
      }
    },
    [searchInput]
  )

  const inputRef = useCallback(function (element: HTMLInputElement) {
    element?.focus()
    setSearchInput(element)
  }, [])

  return (
    <>
      <Head>
        <title>Èrik C. Forés &mdash; ICT Systems Engineer</title>
        <meta
          name="description"
          content="A personal blog where you can find all my posts about computer science and programming languages in general."
        />
      </Head>
      <div className="flex items-center justify-center my-12 space-x-6">
        <Image
          className="rounded-full"
          height={100}
          width={100}
          alt="Avatar"
          src="https://avatars.githubusercontent.com/u/6124435?v=4"
          priority
        />
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">Èrik C. Forés</div>
          <div className="text-slate-600">ICT Systems Engineer</div>
          <div className="flex mt-3 space-x-2 text-sm">
            <a
              href="https://github.com/ConsoleTVs"
              className="duration-300 text-slate-500 hover:text-black transition-color decoration-2 underline-offset-2 decoration-transparent hover:decoration-slate-300">
              Github
            </a>
            <div className="text-slate-600">&bull;</div>
            <a
              href="https://twitter.com/ErikCampobadal"
              className="duration-300 text-slate-500 hover:text-black transition-color decoration-2 underline-offset-2 decoration-transparent hover:decoration-slate-300">
              Twitter
            </a>
            <div className="text-slate-600">&bull;</div>
            <a
              href="mailto:%73o&#99;@erik.%63a&#116;"
              className="duration-300 text-slate-500 hover:text-black transition-color decoration-2 underline-offset-2 decoration-transparent hover:decoration-slate-300">
              Email
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-3 print:hidden">
        <input
          ref={inputRef}
          value={search}
          onInput={handleSearch}
          className="w-full py-2 leading-normal transition-colors duration-300 border-b-2 border-transparent outline-none focus:border-slate-100 placeholder:text-slate-300"
          type="text"
          placeholder="Search for a specific post..."
        />
        <div className="text-xs">
          Showing {filteredPosts.length} posts
          <span
            className={`transition-opacity duration-300 ${
              search === '' ? 'opacity-0' : 'opacity-100'
            }`}>
            {' '}
            with "{search}"
          </span>
        </div>
      </div>
      <div className="flex flex-col my-12 space-y-12">
        {filteredPosts.map((post) => (
          <SmallHeader key={slug(post.title)} post={post} />
        ))}
      </div>
    </>
  )
}

export default Home
