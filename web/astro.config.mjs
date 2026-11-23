import { defineConfig } from 'astro/config'
import Unocss from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://zaneliu.me',
  integrations: [Unocss()],
  build: {
    // 单页小站：CSS 直接内联，省一次请求
    inlineStylesheets: 'always',
  },
})
