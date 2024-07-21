import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import Unocss from 'unocss/astro'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  // Enable Solid to support Solid JSX components.
  integrations: [solid(), Unocss()],
  vite: {
    plugins: [
      Icons({
        compiler: 'astro',
      }),
    ],
  },
})
