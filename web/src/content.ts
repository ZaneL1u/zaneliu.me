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
    sign_off: Text
  }
  personality: Personality
  company: { name: string, href: string, icon: string }
  open_source: { name: string, href: string, icon: string }[]
  languages: { name: string, icon: string }[]
  ai_tools: { name: string, icon: string }[]
  life: { name: Text, icon: string, note?: Text }[]
  pets: { name: string, kind: Text, icon: string }[]
  games: { name: Text, cover: string, note?: Text, hours?: number, href?: string }[]
}

export interface Personality {
  type: string
  name: Text
  /** percent：偏向 letter 那一侧的百分比 */
  axes: { letter: string, label: Text, other_letter: string, other_label: Text, percent: number }[]
  report: { title: Text, intro: Text, sections: { title: Text, body: Text }[], footnote: Text }
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
  'snowboarder': '/icons/emoji/snowboarder.svg',
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
  'dont-starve-together': '/games/dont-starve-together.jpg',
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
    sign_off: t('Have a nice day.', '祝你今天愉快。'),
  },
  personality: {
    type: 'INTJ-H',
    name: t('INTJ, leaning warm', '倾向热情的 INTJ'),
    axes: [
      { letter: 'I', label: t('Introversion', '内向'), other_letter: 'E', other_label: t('Extraversion', '外向'), percent: 72 },
      { letter: 'N', label: t('Intuition', '直觉'), other_letter: 'S', other_label: t('Sensing', '感觉'), percent: 80 },
      { letter: 'T', label: t('Thinking', '思考'), other_letter: 'F', other_label: t('Feeling', '情感'), percent: 92 },
      { letter: 'J', label: t('Judging', '判断'), other_letter: 'P', other_label: t('Perceiving', '知觉'), percent: 76 },
    ],
    report: {
      title: t('About INTJ-H', '关于 INTJ-H'),
      intro: t(
        'A summary of my MBTI Step II interpretive report, with personal details removed. Step I gives the four letters; Step II splits each preference into five facets to show how the type actually plays out in one person. The report also measures warm vs. cool, where I lean warm (60%) — hence INTJ-H.',
        '这是我一份 MBTI 第二步（Step II）解释性报告的摘要，去掉了个人信息。第一步给出四个字母；第二步把每个维度再拆成 5 个子维度，看同一类型落到一个人身上具体是什么样。报告还额外测了「温暖—高冷」，我偏温暖（60%），所以写作 INTJ-H。',
      ),
      sections: [
        {
          title: t('Introversion · moderate', '内向 · 中等'),
          body: t(
            'Quiet, happier observing than joining in, with a small circle of close friends and most at ease on my own. The one exception is enthusiasm: when something grabs me I go all in and want to pull others along — that\'s the "leaning warm" part.',
            '话不多，更喜欢安静地观察；只有少数很亲近的朋友，一个人待着最自在。唯一反过来的是「热情」：碰上感兴趣的事会很投入，也愿意拉着大家一起，「倾向热情」就是这么来的。',
          ),
        },
        {
          title: t('Intuition · clear', '直觉 · 明显'),
          body: t(
            'All five facets lean intuitive: I look for patterns, ask why, chase new ideas, enjoy theory for its own sake, and don\'t love doing things the old way.',
            '五个子维度都偏直觉：喜欢找规律、追问原因、琢磨新点子，对理论本身也有兴趣，不太愿意照老规矩来。',
          ),
        },
        {
          title: t('Thinking · strong', '思考 · 强'),
          body: t(
            'Decisions come from logic and trade-offs rather than feelings. I like to argue a problem until it\'s clear and I\'m strongly goal-driven — logic, questioning and toughness all max out.',
            '做决定看道理和利弊，不太被情绪左右；喜欢把问题争论清楚，目标感很强。逻辑、质询、强硬三项都在最高一档。',
          ),
        },
        {
          title: t('Judging · clear', '判断 · 明显'),
          body: t(
            'Systematic, an early starter, and happiest with a plan. The one facet in the middle is planned vs. open-ended: planned at work, more relaxed at home.',
            '做事有系统、习惯提前开工、按计划推进。唯一在中间的是「有计划—开放」：工作上爱计划，生活里可以随意一些。',
          ),
        },
        {
          title: t('Warm', '温暖'),
          body: t(
            'Trusting, sincere and generous rather than cutting. The report also notes, honestly, a touch of pride.',
            '坦诚、不猜忌、不刻薄，愿意为别人着想。报告也老实指出：有一点傲娇。',
          ),
        },
        {
          title: t('Blind spots', '盲点'),
          body: t(
            'Big picture first, so details can slip. My questioning and criticism are about the problem, not the person, but they don\'t always land that way. And when I\'m busy I forget to give praise.',
            '容易只看大局而漏掉细节；质询和批评是对事不对人，但别人不一定这么理解；忙起来会忘了夸人。',
          ),
        },
      ],
      footnote: t(
        'Taken in 2023. Consistency 85/100; lie scale 3/12 (5 or below counts as reliable).',
        '测于 2023 年。答题一致性 85 / 100；测谎指数 3 / 12（≤ 5 为可信）。',
      ),
    },
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
    { name: t('Skiing', '滑雪'), note: t('snowboard, learning to carve', '单板，在学刻滑'), icon: 'snowboarder' },
    { name: t('Guitar', '吉他'), note: t('just about managing Castle in the Sky', '刚能弹《天空之城》'), icon: 'guitar' },
    { name: t('My little farm', '我的小农场'), icon: 'seedling' },
    { name: t('Cooking with my wife', '和老婆一起做饭'), note: t('a few signature dishes', '有几道拿手菜'), icon: 'cooking' },
  ],
  pets: [
    { name: '漏洞', kind: t('Labrador, 7', '拉布拉多 · 7 岁'), icon: 'dog' },
    { name: '胖子', kind: t('Dragon Li cat, 9', '狸花猫 · 9 岁'), icon: 'cat' },
  ],
  games: [
    { name: t('Oxygen Not Included', '缺氧'), cover: 'oni', hours: 2000, href: 'https://store.steampowered.com/app/457140/' },
    { name: t('Don\'t Starve Together', '饥荒联机版'), cover: 'dont-starve-together', hours: 1500, href: 'https://store.steampowered.com/app/322330/' },
    { name: t('Zelda: Breath of the Wild', '塞尔达传说：旷野之息'), cover: 'zelda' },
    { name: t('Red Dead Redemption 2', '荒野大镖客：救赎 2'), cover: 'rdr2' },
    { name: t('Grand Theft Auto VI', '侠盗猎车手 6'), cover: 'gta6', note: t('new', '新作') },
    { name: t('Civilization V / VI', '文明 5 / 6'), cover: 'civ6' },
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
      if (!data?.intro?.lead?.en || !Array.isArray(data.games) || !Array.isArray(data.personality?.axes))
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
