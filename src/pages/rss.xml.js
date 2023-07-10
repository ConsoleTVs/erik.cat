import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function get(context) {
  const posts = await getCollection('blog')
  return rss({
    title: 'Èrik C. Forés • Software Engineer',
    description:
      "Inspiring engineers to build the future. I'm Èrik, a systems engineer from Catalonia that builds open source software and occasionally writes about it.",
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug.replace(/^[0-9]+-/, '')}/`,
    })),
  })
}
