import {
  defineConfig,
  presetAttributify,
  presetMini,
  presetTagify,
  presetTypography,
  presetUno,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  transformers: [transformerDirectives()],
  presets: [
    presetUno(),
    presetTagify(),
    presetMini(),
    presetAttributify(),
    presetTypography(),
  ],
})
