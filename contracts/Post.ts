import { MDXRemoteSerializeResult } from 'next-mdx-remote'

export interface Post {
  title: string
  author: string
  tags: string[]
  date: string
  description: string
  serialized: MDXRemoteSerializeResult
}
