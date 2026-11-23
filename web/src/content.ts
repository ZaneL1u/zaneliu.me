// 页面文案与展示内容：构建时从 dashboard 的公开接口取（/api/v1/public/profile/content），
// 取不到就用这里的默认值。图标 / 封面在内容里只存「键」，这里映射到站内资源，未知的键不显示图标。

export type Text = { en: string, zh: string }

export interface Content {
  intro: {
    title: Text
    description: Text
    hello: { en: string[], zh: string[] }
    lead: Text
    work_before: Text
    work_after: Text
    thinking: Text
    sign_off: Text
  }
  company: { name: string, href: string, icon: string }
  open_source: { name: string, href: string, icon: string }[]
  languages: { name: string, icon: string }[]
  ai_tools: { name: string, icon: string }[]
  life: { name: Text, icon: string }[]
  pets: { name: string, kind: Text, icon: string }[]
  games: { name: Text, cover: string, note?: Text }[]
}

/** 图标键 → UnoCSS 图标类（i- 开头）或站内图片路径 */
export const ICONS: Record<string, string> = {
  'yangcong': '/yangcongxueyuan.svg',
  'vue': 'i-logos-vue',
  'taro': '/icons/taro.png',
  'pixi': '/icons/pixi.png',
  'typescript': 'i-logos-typescript-icon',
  'python': 'i-logos-python',
  'go': 'i-logos-go',
  'rust': 'i-simple-icons-rust',
  'claude': 'i-logos-claude-icon',
  'openai': 'i-simple-icons-openai',
  'cursor': 'i-simple-icons-cursor',
  'skier': '/icons/emoji/skier.svg',
  'guitar': '/icons/emoji/guitar.svg',
  'seedling': '/icons/emoji/seedling.svg',
  'cooking': '/icons/emoji/shallow-pan-of-food.svg',
  'dog': '/icons/emoji/dog-face.svg',
  'cat': '/icons/emoji/cat-face.svg',
}

export const COVERS: Record<string, string> = {
  'zelda': '/games/zelda.jpg',
  'rdr2': '/games/rdr2.jpg',
  'gta6': '/games/gta6.jpg',
  'civ6': '/games/civ6.jpg',
  'oni': '/games/oni.jpg',
  'dont-starve': '/games/dont-starve.jpg',
  'bfv': '/games/bfv.jpg',
}

const t = (en: string, zh: string): Text => ({ en, zh })

export const DEFAULT_CONTENT: Content = {
  intro: {
    title: t('Zane Liu', 'Zane Liu'),
    description: t(
      'Zane Liu — software engineer. I build things for the web, mostly in TypeScript, and contribute to open source.',
      'Zane Liu，软件工程师，日常主要用 TypeScript 写 Web，也给开源项目做贡献。',
    ),
    hello: { en: ['Hello, I\'m ', '.'], zh: ['你好，我是 ', '。'] },
    lead: t(
      'Software engineer based in Beijing. I build things for the web, mostly in TypeScript, and lately I\'ve been getting to know Rust.',
      '在北京做软件开发。日常主要用 TypeScript 写 Web，最近在认真学 Rust。',
    ),
    work_before: t('I\'m currently at', '目前在'),
    work_after: t(', and in my spare time I contribute to open source:', '工作，业余时间给开源项目做贡献：'),
    thinking: t(
      'I like to think things through on my own, untangle hard problems, and plan for the long run. New ideas and new technology still get me excited.',
      '我喜欢独立思考，把复杂的问题拆开想清楚，也习惯做长远的规划。新想法和新技术，到现在依然会让我兴奋。',
    ),
    sign_off: t('Have a nice day.', '祝你今天愉快。'),
  },
  company: { name: '洋葱学园', href: 'https://yangcongxueyuan.com', icon: 'yangcong' },
  open_source: [
    { name: 'Vue', href: 'https://github.com/vuejs/core', icon: 'vue' },
    { name: 'Taro', href: 'https://github.com/NervJS/taro', icon: 'taro' },
    { name: 'PixiJS', href: 'https://github.com/pixijs/pixijs', icon: 'pixi' },
  ],
  languages: [
    { name: 'TypeScript', icon: 'typescript' },
    { name: 'Python', icon: 'python' },
    { name: 'Go', icon: 'go' },
    { name: 'Rust', icon: 'rust' },
  ],
  ai_tools: [
    { name: 'Claude Code', icon: 'claude' },
    { name: 'Codex', icon: 'openai' },
    { name: 'Cursor', icon: 'cursor' },
  ],
  life: [
    { name: t('Skiing', '滑雪'), icon: 'skier' },
    { name: t('Guitar', '吉他'), icon: 'guitar' },
    { name: t('My little farm', '我的小农场'), icon: 'seedling' },
    { name: t('Cooking with my wife', '和老婆一起做饭'), icon: 'cooking' },
  ],
  pets: [
    { name: '漏洞', kind: t('the dog', '狗狗'), icon: 'dog' },
    { name: '胖子', kind: t('the cat', '猫咪'), icon: 'cat' },
  ],
  games: [
    { name: t('Zelda: Breath of the Wild', '塞尔达传说：旷野之息'), cover: 'zelda' },
    { name: t('Red Dead Redemption 2', '荒野大镖客：救赎 2'), cover: 'rdr2' },
    { name: t('Grand Theft Auto VI', '侠盗猎车手 6'), cover: 'gta6', note: t('new', '新作') },
    { name: t('Civilization V / VI', '文明 5 / 6'), cover: 'civ6' },
    { name: t('Oxygen Not Included', '缺氧'), cover: 'oni' },
    { name: t('Don\'t Starve', '饥荒'), cover: 'dont-starve' },
    { name: t('Battlefield V', '战地 5'), cover: 'bfv', note: t('now and then', '偶尔') },
  ],
}

const API_BASE = (import.meta.env.PROFILE_API_BASE as string | undefined) ?? 'https://dashboard.loki.zaneliu.me'

let cached: Promise<Content> | null = null

/** 构建时取一次（两种语言的页面共用）；失败、超时或结构不对就用默认值 */
export function loadContent(): Promise<Content> {
  cached ??= (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/profile/content`, { signal: AbortSignal.timeout(8000) })
      if (!res.ok)
        throw new Error(String(res.status))
      const data = await res.json() as Content
      if (!data?.intro?.lead?.en || !Array.isArray(data.games))
        throw new Error('结构不对')
      return data
    }
    catch (e) {
      console.warn(`[content] 用默认文案（${(e as Error).message}）`)
      return DEFAULT_CONTENT
    }
  })()
  return cached
}
