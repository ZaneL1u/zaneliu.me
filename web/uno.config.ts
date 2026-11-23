import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  transformers: [transformerDirectives()],
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1,
      extraProperties: { 'display': 'inline-block', 'vertical-align': '-0.125em' },
    }),
  ],
})
