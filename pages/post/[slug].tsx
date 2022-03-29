import { FC, DetailedHTMLProps, HTMLAttributes, useCallback, useMemo } from 'react'
import type { Post } from 'contracts'
import { getPosts } from 'lib/posts'
import { slug } from 'lib/utils'
import { GetStaticPaths, GetStaticProps } from 'next'
import Header from 'components/Header'
import { MDXRemote } from 'next-mdx-remote'
import Head from 'next/head'
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/xcode.css'
import Link from 'next/link'

interface Props {
  post: Post
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts()
  return {
    paths: posts.map((post) => ({
      params: { slug: slug(post.title) },
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const post = (await getPosts()).find((post) => slug(post.title) === context.params?.slug)

  return post === undefined ? { notFound: true } : { props: { post } }
}

const CustomPre = ({
  children,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>) => {
  const onCreate = useCallback((node: HTMLPreElement | null) => {
    if (node && node.firstChild) hljs.highlightElement(node.firstChild as HTMLElement)
  }, [])
  return (
    <pre ref={onCreate} {...props}>
      {children}
    </pre>
  )
}

const CustomH1 = ({
  children,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => {
  const id = useMemo(() => (typeof children === 'string' ? slug(children) : undefined), [children])
  return (
    <div className="flex no-prose">
      <Link href={`#${id}`}>
        <a className="no-underline">
          <h1 id={id} className="" {...props}>
            {children}
          </h1>
        </a>
      </Link>
    </div>
  )
}

const components = {
  pre: CustomPre,
  h1: CustomH1,
}

const Post: FC<Props> = ({ post }) => {
  return (
    <>
      <Head>
        <title>
          {post.title} by {post.author} &mdash; erik.cat
        </title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.tags.join(', ')} />
      </Head>
      <article className="text-justify">
        <Header post={post} />
        <MDXRemote {...post.serialized} components={components} />
      </article>
    </>
  )
}

export default Post
