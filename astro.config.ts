import { defineConfig, fontProviders } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import robots from 'astro-robots-txt'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: process.env.MAIN_DOMAIN ?? process.env.CF_PAGES_URL ?? 'https://erik.cat',
  integrations: [mdx(), sitemap(), robots()],
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Instrument Sans',
        cssVariable: '--font-primary',
        weights: ['400 700'],
      },
      {
        provider: fontProviders.google(),
        name: 'Bebas Neue',
        cssVariable: '--font-secondary',
        weights: ['400'],
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: 'light-dark()',
    },
  },
})
