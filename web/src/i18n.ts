export const LANGS = ['en', 'zh'] as const
export type Lang = (typeof LANGS)[number]

export const PATHS: Record<Lang, string> = { en: '/', zh: '/zh/' }

export interface Copy {
  htmlLang: string
  title: string
  description: string
  hello: [string, string]
  lead: string
  contact: string
  work: {
    title: string
    before: string
    after: string
  }
  personality: { title: string, details: string }
  wechat: { label: string, title: string, scan: string, longPress: string }
  tools: { title: string, languages: string, ai: string }
  life: {
    title: string
    skiing: string
    guitar: string
    farm: string
    cooking: string
    dog: string
    cat: string
  }
  games: {
    title: string
    zelda: string
    dontStarve: string
    oni: string
    rdr2: string
    civ: string
    gta6: string
    bfv: string
    fresh: string
    sometimes: string
    /** {n} 替换为小时数 */
    hours: string
    steam: string
  }
  close: string
  signOff: string
  switchLang: string
  theme: { system: string, light: string, dark: string, label: string }
}

export const COPY: Record<Lang, Copy> = {
  en: {
    htmlLang: 'en',
    title: 'Zane Liu',
    description:
      'Zane Liu — software engineer. I build things for the web, mostly in TypeScript, and contribute to open source.',
    hello: ['Hello, I\'m ', '.'],
    lead: 'Software engineer based in Beijing. I build things for the web, mostly in TypeScript, and lately I\'ve been getting to know Rust.',
    contact: 'Contact',
    work: {
      title: 'Work',
      before: 'I\'m currently at',
      after: ', and in my spare time I contribute to open source:',
    },
    personality: { title: 'Personality', details: 'Details' },
    wechat: {
      label: 'WeChat',
      title: 'Add me on WeChat',
      scan: 'Scan with WeChat to add me',
      longPress: 'Browsing in WeChat? Long-press the code.',
    },
    tools: { title: 'Tools', languages: 'Languages', ai: 'AI tools' },
    life: {
      title: 'Away from the keyboard',
      skiing: 'Skiing',
      guitar: 'Guitar',
      farm: 'My little farm',
      cooking: 'Cooking with my wife',
      dog: 'the dog',
      cat: 'the cat',
    },
    games: {
      title: 'Games I keep coming back to',
      zelda: 'Zelda: Breath of the Wild',
      dontStarve: 'Don\'t Starve',
      oni: 'Oxygen Not Included',
      rdr2: 'Red Dead Redemption 2',
      civ: 'Civilization V / VI',
      gta6: 'Grand Theft Auto VI',
      bfv: 'Battlefield V',
      fresh: 'new',
      sometimes: 'now and then',
      hours: '~{n} hrs',
      steam: 'on Steam',
    },
    close: 'Close',
    signOff: 'Have a nice day.',
    switchLang: '中文',
    theme: { system: 'System theme', light: 'Light theme', dark: 'Dark theme', label: 'Switch theme' },
  },
  zh: {
    htmlLang: 'zh-CN',
    title: 'Zane Liu',
    description: 'Zane Liu，软件工程师，日常主要用 TypeScript 写 Web，也给开源项目做贡献。',
    hello: ['你好，我是 ', '。'],
    lead: '在北京做软件开发。日常主要用 TypeScript 写 Web，最近在认真学 Rust。',
    contact: '联系方式',
    work: {
      title: '工作',
      before: '目前在',
      after: '工作，业余时间给开源项目做贡献：',
    },
    personality: { title: '性格', details: '详细' },
    wechat: {
      label: '微信',
      title: '加我微信',
      scan: '微信扫一扫，加我为好友',
      longPress: '在微信里浏览时，可长按识别',
    },
    tools: { title: '常用技术', languages: '语言', ai: 'AI 工具' },
    life: {
      title: '工作之外',
      skiing: '滑雪',
      guitar: '吉他',
      farm: '我的小农场',
      cooking: '和老婆一起做饭',
      dog: '狗狗',
      cat: '猫咪',
    },
    games: {
      title: '常玩的游戏',
      zelda: '塞尔达传说：旷野之息',
      dontStarve: '饥荒',
      oni: '缺氧',
      rdr2: '荒野大镖客：救赎 2',
      civ: '文明 5 / 6',
      gta6: '侠盗猎车手 6',
      bfv: '战地 5',
      fresh: '新作',
      sometimes: '偶尔',
      hours: '约 {n} 小时',
      steam: 'Steam 页面',
    },
    close: '关闭',
    signOff: '祝你今天愉快。',
    switchLang: 'EN',
    theme: { system: '跟随系统', light: '浅色', dark: '深色', label: '切换主题' },
  },
}
