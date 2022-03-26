import type { Post } from 'contracts'
import { readdir, readFile } from 'fs/promises'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

export const getPosts = async (): Promise<Post[]> => {
  const files = await readdir('posts')
  return await Promise.all(
    files.map(async (file): Promise<Post> => {
      const { content, data } = matter(await readFile(`posts/${file}`, 'utf-8'))
      return {
        title: data.title ?? 'Unknown',
        author: data.author ?? 'Unknown',
        tags: data.tags ?? [],
        date: data.date ?? new Date(),
        description: data.description ?? '',
        serialized: await serialize(content),
      }
    })
  )
}
