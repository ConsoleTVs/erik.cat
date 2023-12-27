import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import robots from 'astro-robots-txt'
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  site: process.env.MAIN_DOMAIN ?? process.env.CF_PAGES_URL ?? 'https://erik.cat',
  integrations: [mdx(), tailwind(), sitemap(), robots()],
  markdown: {
    shikiConfig: {
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme: 'vitesse-dark',
    },
  },
})
