import solid from '@astrojs/solid-js'
import { defineConfig } from 'astro/config'
import Unocss from 'unocss/astro'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  integrations: [solid(), Unocss()],
  vite: {
    plugins: [
      Icons({
        compiler: 'astro',
      }),
    ],
  },
})
