import { antfu } from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  solid: true,
  astro: true,
  markdown: false,
  rules: {
    'no-console': 'off',
  },
})
