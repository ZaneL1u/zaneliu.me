// 「代码贡献 / AI 用量 / 模型消耗 / AI 日报 / 开源」的渲染：纯函数，只拼 HTML 字符串，不碰 DOM。
// 构建时（Astro 组件 frontmatter）用它把内容直接写进页面（SEO、无脚本也能看）；
// 浏览器里用同一份逻辑处理交互（年份切换、悬停详情、展开、更多），两边输出一致。

export type Lang = 'en' | 'zh'
export type Commits = { github: number, gitea: number }
export type Day = { date: string, tokens: number, sessions: number, commits: Commits }
export type Window = {
  tokens: number
  tokens_by_tool: Record<string, number>
  sessions: number
  sessions_by_tool: Record<string, number>
  commits: Commits
}
export type Report = {
  date: string
  sessions: Record<string, number>
  tokens: number
  scope: Record<string, number>
  kinds: { key: string, count: number }[]
  tech: { key: string, count: number }[]
  peak_hour?: number | null
  commits: Commits
  github?: GhDayItem[]
  first_hour?: number | null
  last_hour?: number | null
  projects?: Record<string, number>
}
export type GhDayItem = { type: string, repo: string, title?: string, action?: string, url?: string, count?: number, stars?: number }
export type OssItem = { kind?: 'pr' | 'own', repo: string, title: string, url?: string, merged_at: string, stars: number, language?: string | null }
export type GhEvent = { id: string, type: string, repo: string, created_at: string, action?: string, title?: string, url?: string, ref?: string, ref_type?: string, commits?: number }
export type Repo = { repo: string, prs: number, stars?: number, description?: string, language?: string | null }
export type UsageRange = {
  models: { model: string, tokens: number, requests: number, sources: string[] }[]
  sources: { source: string, tokens: number, requests: number }[]
}
export type Profile = {
  as_of?: string
  calendar: { start: string, days: number[][] }
  years: string[]
  totals: { all: Window, year: Window, month: Window, week: Window }
  since: { ai: string | null, tokens: string | null }
  streak: number
  active_days: number
  reports: Report[]
  github: { user: string, repos: Repo[], timeline?: OssItem[] }
  activity?: GhEvent[]
  day_details?: Record<string, { models?: [string, number][], tools?: Record<string, number>, github?: GhDayItem[] }>
  usage?: {
    all: UsageRange
    month: UsageRange
    embeddings: { model: string, builds: number, tokens: number }[]
  }
}

/** 页面里各个 data-slot 的初始内容：html / text 二选一，hidden 表示整块隐藏 */
export type Slot = { html?: string, text?: string, hidden?: boolean }

const TOOLS = { claude: 'Claude Code', codex: 'Codex', cursor: 'Cursor' } as const
type Tool = keyof typeof TOOLS
const STAR = '<svg class="star" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>'

const SOURCE_NAME: Record<string, [string, string]> = {
  personal: ['Personal', '个人'],
  multica: ['Multica', 'Multica'],
  'coding-agent': ['Coding agents', 'Coding Agent'],
  friday: ['Friday', 'Friday'],
  loopforge: ['LoopForge', 'LoopForge'],
}
const VENDOR_COLOR: [RegExp, string][] = [
  [/^claude/i, '#d97757'],
  [/^(gpt|o\d|codex)/i, '#10a37f'],
  [/^qwen/i, '#7c5cff'],
  [/^glm/i, '#3b82f6'],
  [/^deepseek/i, '#4d6bfe'],
  [/^(k\d|kimi)/i, '#1f2937'],
  [/^mimo/i, '#ff6900'],
  [/^gemini/i, '#4285f4'],
]
// 模型图标（站内文件）：各家官方标志。mono：单色标志按文字颜色着色（暗色主题下也看得见）。没匹配上的退回圆点。
const MODEL_ICON: [RegExp, string, boolean][] = [
  [/^claude/i, '/icons/tech/claude.svg', false],
  [/^(gpt|o\d|codex|chatgpt)/i, '/icons/tech/openai.svg', true],
  [/^qwen/i, '/icons/models/qwen.svg', false],
  [/^glm/i, '/icons/models/zai.svg', true],
  [/^deepseek/i, '/icons/models/deepseek.svg', false],
  [/^gemini/i, '/icons/models/gemini.svg', false],
  [/^(k\d|kimi)/i, '/icons/models/kimi.svg', true],
  [/^(minimax|abab)/i, '/icons/models/minimax.svg', false],
]

const esc = (s: string) => s.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

function trim(x: number): string {
  return x.toFixed(x >= 100 ? 0 : 1).replace(/\.0$/, '')
}

function joinWords(items: string[]): string {
  if (items.length <= 1)
    return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function parseDay(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 按非零值的分位数分 4 档，避免一两天的峰值把其余日子都压成最浅色 */
function levels(values: number[]): (v: number) => number {
  const nz = values.filter(v => v > 0).sort((a, b) => a - b)
  if (!nz.length)
    return () => 0
  const q = (p: number) => nz[Math.min(nz.length - 1, Math.floor(p * nz.length))]
  const cuts = [q(0.25), q(0.5), q(0.75)]
  return v => (v <= 0 ? 0 : v <= cuts[0] ? 1 : v <= cuts[1] ? 2 : v <= cuts[2] ? 3 : 4)
}

const commitsOf = (d: Day) => d.commits.github + d.commits.gitea

export function createView(lang: Lang) {
  const isZh = lang === 'zh'

  /** 大数字缩写：英文 K/M/B/T，中文 万/亿/万亿 */
  function compact(n: number): string {
    const units: [number, string][] = isZh
      ? [[1e12, ' 万亿'], [1e8, ' 亿'], [1e4, ' 万']]
      : [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]
    for (const [v, u] of units) {
      if (n >= v)
        return `${trim(n / v)}${u}`
    }
    return String(n)
  }

  const L = isZh
    ? {
        locale: 'zh-CN',
        kinds: {
          feature: '新功能开发', fix: '问题修复', refactor: '重构优化', ops: '部署运维',
          research: '调研问答', docs: '文档写作', review: '代码审查', test: '测试',
        } as Record<string, string>,
        scope: { work: '工作', personal: '个人项目', oss: '开源', other: '其他' } as Record<string, string>,
        sentence: (k: string[], tech: string[]) =>
          `${k.length ? `以${k.join('和')}为主` : '各种事情都做了一点'}${tech.length ? `，用到 ${tech.join('、')}` : ''}。`,
        lastYear: '近一年',
        tokensAll: '累计 token', sessionsAll: '累计会话', activeDays: '活跃天数', streak: '连续天数',
        streakValue: (n: number) => `${n} 天`,
        split: (tool: string, n: string, t: string | null) => `${tool} · ${n} 次会话${t ? ` · ${t} token` : ''}`,
        dayAi: (t: number, n: number) => (t ? `${compact(t)} token，${n} 次会话` : `${n} 次会话`),
        noAi: '没有 AI 会话',
        aiCaption: (n: number, t: string, label: string) => `${label}：${n.toLocaleString('zh-CN')} 次会话，共 ${t} token。`,
        since: (s: string | null, t: string | null) =>
          `会话从 ${s ?? '—'} 开始统计，token 从 ${t ?? '—'} 开始统计：更早的日志没有 token 记录，Cursor 本地也不记录 token。`,
        sessions: (n: number) => `${n} 次会话`,
        tokens: (t: string) => `${t} token`,
        contrib: (n: number) => `${n} 次贡献`,
        empty: '这周没有会话，大概是滑雪去了。',
        contribAll: '累计贡献', privateRepos: '私有存储库',
        noContrib: '没有贡献',
        dayContrib: (n: number, parts: string[]) => `${n} 次贡献（${parts.join('，')}）`,
        codeCaption: (n: number, label: string) => `${label}：${n.toLocaleString('zh-CN')} 次贡献。`,
        prs: (n: number) => `${n} 个 PR`,
        more: (n: number) => `展示更多 +${n}`,
        ownBadge: '我的项目',
        expand: (n: number) => `展开 +${n}`,
        detail: (o: { tools: string, hours: string, kinds: string, projects: string }) =>
          [o.tools, o.hours, o.kinds && `具体：${o.kinds}`, o.projects].filter(Boolean).join('；') + '。',
        hoursText: (a: number, b: number, peak: number | null) => (a === b ? `${a} 点前后` : `${a} 点到 ${b} 点${peak != null ? `，${peak} 点最忙` : ''}`),
        projectsText: (parts: string[]) => (parts.length ? `涉及 ${parts.join('、')}` : ''),
        projectScope: { personal: ' 个个人项目', oss: ' 个开源项目', work: ' 个工作项目', other: ' 个其他目录' } as Record<string, string>,
        tipSessions: '会话', tipTokens: 'token', tipModels: '主要模型', tipGithub: 'GitHub 动态', tipNone: '这天没有记录',
        collapse: '收起',
        dayKinds: { MergedPR: '合入', PullRequestEvent: 'PR', ReleaseEvent: '发布', PublicEvent: '开源', CreateEvent: '新仓库', IssuesEvent: 'Issue', PushEvent: '推送' } as Record<string, string>,
        pushes: (n: number) => `${n} 次推送`,
        events: { PushEvent: '推送', PullRequestEvent: 'PR', CreateEvent: '新建', ReleaseEvent: '发布', WatchEvent: '点星', ForkEvent: 'Fork', IssuesEvent: 'Issue', PublicEvent: '开源' } as Record<string, string>,
        commits: (n: number) => `${n} 个提交`,
        ago: (d: number) => (d < 1 ? '今天' : d < 2 ? '昨天' : d < 30 ? `${Math.floor(d)} 天前` : d < 365 ? `${Math.floor(d / 30)} 个月前` : `${Math.floor(d / 365)} 年前`),
        modelVal: (t: string, r: string) => `${t} token · ${r} 次请求`,
        embedding: (m: string, n: string) => `Embedding：${m}，构建索引 ${n} 次（平台没有记录 embedding 的 token 数）。`,
      }
    : {
        locale: 'en-US',
        kinds: {
          feature: 'building features', fix: 'fixing bugs', refactor: 'refactoring', ops: 'ops and deploys',
          research: 'research and Q&A', docs: 'writing docs', review: 'reviewing code', test: 'testing',
        } as Record<string, string>,
        scope: { work: 'work', personal: 'side projects', oss: 'open source', other: 'misc' } as Record<string, string>,
        sentence: (k: string[], tech: string[]) =>
          `${k.length ? `Mostly ${k[0]}${k[1] ? `, plus ${k[1]}` : ''}` : 'A mixed bag'}${tech.length ? `. Worked in ${joinWords(tech)}` : ''}.`,
        lastYear: 'Last 12 months',
        tokensAll: 'tokens, all time', sessionsAll: 'sessions, all time', activeDays: 'active days', streak: 'current streak',
        streakValue: (n: number) => `${n}d`,
        split: (tool: string, n: string, t: string | null) => `${tool} · ${n} sessions${t ? ` · ${t} tokens` : ''}`,
        dayAi: (t: number, n: number) => (t ? `${compact(t)} tokens, ${n} sessions` : `${n} sessions`),
        noAi: 'no AI sessions',
        aiCaption: (n: number, t: string, label: string) => `${label}: ${n.toLocaleString('en-US')} sessions, ${t} tokens.`,
        since: (s: string | null, t: string | null) =>
          `Sessions counted since ${s ?? '—'}, tokens since ${t ?? '—'}. Older logs have no token data, and Cursor doesn't keep it locally.`,
        sessions: (n: number) => `${n} sessions`,
        tokens: (t: string) => `${t} tokens`,
        contrib: (n: number) => `${n} contributions`,
        empty: 'No sessions this week. Probably out skiing.',
        contribAll: 'contributions, all time', privateRepos: 'private repos',
        noContrib: 'no contributions',
        dayContrib: (n: number, parts: string[]) => `${n} contributions (${parts.join(', ')})`,
        codeCaption: (n: number, label: string) => `${label}: ${n.toLocaleString('en-US')} contributions.`,
        prs: (n: number) => `${n} PR${n > 1 ? 's' : ''}`,
        more: (n: number) => `Show ${n} more`,
        ownBadge: 'My project',
        expand: (n: number) => `Show ${n} more`,
        detail: (o: { tools: string, hours: string, kinds: string, projects: string }) =>
          [o.tools, o.hours, o.kinds && `breakdown: ${o.kinds}`, o.projects].filter(Boolean).join('; ') + '.',
        hoursText: (a: number, b: number, peak: number | null) => (a === b ? `around ${a}:00` : `${a}:00 to ${b}:00${peak != null ? `, busiest at ${peak}:00` : ''}`),
        projectsText: (parts: string[]) => (parts.length ? `across ${parts.join(', ')}` : ''),
        projectScope: { personal: ' side projects', oss: ' open-source projects', work: ' work projects', other: ' other folders' } as Record<string, string>,
        tipSessions: 'sessions', tipTokens: 'tokens', tipModels: 'Top models', tipGithub: 'GitHub', tipNone: 'Nothing recorded',
        collapse: 'Show less',
        dayKinds: { MergedPR: 'Merged', PullRequestEvent: 'PR', ReleaseEvent: 'Release', PublicEvent: 'Public', CreateEvent: 'New repo', IssuesEvent: 'Issue', PushEvent: 'Push' } as Record<string, string>,
        pushes: (n: number) => `${n} push${n > 1 ? 'es' : ''}`,
        events: { PushEvent: 'Push', PullRequestEvent: 'PR', CreateEvent: 'Create', ReleaseEvent: 'Release', WatchEvent: 'Star', ForkEvent: 'Fork', IssuesEvent: 'Issue', PublicEvent: 'Public' } as Record<string, string>,
        commits: (n: number) => `${n} commit${n > 1 ? 's' : ''}`,
        ago: (d: number) => (d < 1 ? 'today' : d < 2 ? 'yesterday' : d < 30 ? `${Math.floor(d)}d ago` : d < 365 ? `${Math.floor(d / 30)}mo ago` : `${Math.floor(d / 365)}y ago`),
        modelVal: (t: string, r: string) => `${t} tokens · ${r} requests`,
        embedding: (m: string, n: string) => `Embeddings: ${m}, ${n} index builds (the platform doesn't record embedding tokens).`,
      }
  const num = (n: number) => n.toLocaleString(L.locale)
  const fmtShort = new Intl.DateTimeFormat(L.locale, { month: 'short', day: 'numeric' })
  const fmtLong = new Intl.DateTimeFormat(L.locale, { year: 'numeric', month: 'short', day: 'numeric' })
  const fmtWeekday = new Intl.DateTimeFormat(L.locale, { weekday: 'short' })
  // 构建机和访客浏览器的时区可能不同：日期都按北京时间格式化
  const fmtMonthDay = new Intl.DateTimeFormat(L.locale, { month: 'short', day: 'numeric', timeZone: 'Asia/Shanghai' })

  function stat(value: string, label: string): string {
    return `<div class="stat"><b>${esc(value)}</b><span>${esc(label)}</span></div>`
  }

  /** 日报的第二行：工具分布、时间段、各类事情的次数、涉及的项目数（不出现项目名） */
  function dayDetail(r: Report): string {
    const sep = isZh ? '、' : ', '
    const tools = Object.entries(r.sessions).filter(([, n]) => n > 0)
      .map(([t, n]) => `${TOOLS[t as Tool] ?? t} ${n}`).join(' · ')
    const hours = r.first_hour != null && r.last_hour != null ? L.hoursText(r.first_hour, r.last_hour, r.peak_hour ?? null) : ''
    const kinds = r.kinds.map(k => L.kinds[k.key] ? `${L.kinds[k.key]} ${k.count}` : '').filter(Boolean).join(sep)
    const projects = L.projectsText(
      Object.entries(r.projects ?? {}).filter(([, n]) => n > 0)
        .map(([k, n]) => `${n}${L.projectScope[k] ?? ` ${k}`}`),
    )
    return L.detail({ tools, hours, kinds, projects })
  }

  function describe(r: Report): string {
    const kinds = r.kinds.slice(0, 2).map(k => L.kinds[k.key]).filter(Boolean)
    const tech = r.tech.filter(t => t.key !== 'Markdown').slice(0, 3).map(t => t.key)
    return L.sentence(kinds, tech)
  }

  function expand(cal: Profile['calendar']): Day[] {
    const start = parseDay(cal.start)
    return cal.days.map(([tokens, sessions, github, gitea], i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return { date: iso(d), tokens, sessions, commits: { github: github ?? 0, gitea: gitea ?? 0 } }
    })
  }

  function heatmap(days: Day[], value: (d: Day) => number, label: (d: Day) => string): string {
    if (!days.length)
      return ''
    const level = levels(days.map(value))
    const first = parseDay(days[0].date).getDay() // 0 = 周日，与 GitHub 一样从周日开始
    const cells: string[] = Array.from({ length: first }, () => '<i class="pad"></i>')
    for (const d of days) {
      const text = `${fmtLong.format(parseDay(d.date))}: ${label(d)}`
      cells.push(`<i data-l="${level(value(d))}" data-d="${d.date}" aria-label="${esc(text)}"></i>`)
    }
    return cells.join('')
  }

  type YearOption = { key: string, label: string, days: Day[] }
  /** 年份切换：「近一年」+ 有数据的每一年 */
  function yearOptions(years: string[], all: Day[]): YearOption[] {
    return [
      { key: 'recent', label: L.lastYear, days: all.slice(-365) },
      ...years.map(y => ({ key: y, label: y, days: all.filter(d => d.date.startsWith(y)) })),
    ]
  }
  function yearTabs(options: YearOption[], selected: string): string {
    return options
      .map(o => `<button type="button" role="tab" data-key="${o.key}" aria-selected="${o.key === selected}">${esc(o.label)}</button>`)
      .join('')
  }

  /** 由一份接口数据算出整块内容；now 用于「几天前」这类相对时间 */
  function build(p: Profile, now: number = Date.now()) {
    const days = expand(p.calendar)
    const byDate = new Map(days.map(d => [d.date, d]))
    const details = p.day_details ?? {}
    const row = (k: string, v: string) => `<div class="row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`
    const ghLine = (it: GhDayItem) => {
      const extra = it.type === 'PushEvent' ? L.pushes(it.count ?? 1) : (it.title ?? '')
      return `<div class="gh">${esc(L.dayKinds[it.type] ?? it.type)} · ${esc(it.repo)}${extra ? ` · ${esc(extra)}` : ''}</div>`
    }
    const codeTip = (date: string) => {
      const d = byDate.get(date)
      const det = details[date]
      const parts = [`<b>${esc(fmtLong.format(parseDay(date)))}</b>`]
      if (!d || !commitsOf(d))
        parts.push(`<div class="row"><span>${esc(L.noContrib)}</span></div>`)
      else
        parts.push(row('GitHub', num(d.commits.github)), row(L.privateRepos, num(d.commits.gitea)))
      if (det?.github?.length)
        parts.push(`<div class="sep">${esc(L.tipGithub)}</div>`, ...det.github.map(ghLine))
      return parts.join('')
    }
    const aiTip = (date: string) => {
      const d = byDate.get(date)
      const det = details[date]
      const parts = [`<b>${esc(fmtLong.format(parseDay(date)))}</b>`]
      if (!d || (!d.sessions && !d.tokens))
        return parts.concat(`<div class="row"><span>${esc(L.tipNone)}</span></div>`).join('')
      for (const [t, n] of Object.entries(det?.tools ?? {}))
        parts.push(row(TOOLS[t as Tool] ?? t, `${num(n)} ${L.tipSessions}`))
      if (d.tokens)
        parts.push(row(L.tipTokens, compact(d.tokens)))
      if (det?.models?.length)
        parts.push(`<div class="sep">${esc(L.tipModels)}</div>`, ...det.models.map(([m, t]) => row(m, compact(t))))
      return parts.join('')
    }

    // ---------- 代码贡献 ----------
    const codeYears = p.years.filter(y => days.some(d => d.date.startsWith(y) && commitsOf(d) > 0))
    const codeOptions = yearOptions(codeYears, days)
    const codeView = (key: string) => {
      const o = codeOptions.find(x => x.key === key) ?? codeOptions[0]
      return {
        heat: heatmap(o.days, commitsOf, (d) => {
          const n = commitsOf(d)
          if (!n)
            return L.noContrib
          const parts = ([['GitHub', d.commits.github], [L.privateRepos, d.commits.gitea]] as [string, number][])
            .filter(([, v]) => v).map(([k, v]) => `${k} ${v}`)
          return L.dayContrib(n, parts)
        }),
        caption: L.codeCaption(o.days.reduce((a, d) => a + commitsOf(d), 0), o.label),
      }
    }

    // ---------- AI 用量 ----------
    const all = p.totals.all
    // 没有 token 的早期日子按会话数着色（权重压低，有 token 的日子总是更深）
    const aiValue = (d: Day) => d.tokens || d.sessions / 1e6
    const aiFrom = (p.since.ai ?? days[days.length - 1].date).slice(0, 4)
    const aiOptions = yearOptions(p.years.filter(y => y >= aiFrom), days)
    const aiView = (key: string) => {
      const o = aiOptions.find(x => x.key === key) ?? aiOptions[0]
      const n = o.days.reduce((a, d) => a + d.sessions, 0)
      const t = o.days.reduce((a, d) => a + d.tokens, 0)
      return {
        heat: heatmap(o.days, aiValue, d => (d.sessions || d.tokens ? L.dayAi(d.tokens, d.sessions) : L.noAi)),
        caption: L.aiCaption(n, compact(t), o.label),
      }
    }
    const totalSessions = all.sessions || 1
    const tools = (Object.keys(TOOLS) as Tool[])
      .map(t => ({ t, sessions: all.sessions_by_tool[t] ?? 0, tokens: all.tokens_by_tool[t] ?? 0 }))
      .filter(x => x.sessions || x.tokens)

    // ---------- AI 日报 ----------
    // 当天的 GitHub 动态（开源合入、PR、发布、推送……）：默认 3 条，其余点「展开」
    const ghList = (items: GhDayItem[]) => {
      if (!items.length)
        return ''
      const rows = items.map((it, i) => {
        const [owner, name] = it.repo.split('/')
        const extra = it.type === 'PushEvent' ? L.pushes(it.count ?? 1) : [it.action !== 'merged' ? it.action : '', it.title].filter(Boolean).join(' ')
        return `<li${i >= 3 ? ' hidden data-extra' : ''}><span class="k">${esc(L.dayKinds[it.type] ?? it.type)}</span><a href="${esc(it.url || `https://github.com/${it.repo}`)}" target="_blank" rel="noopener">${esc(owner)}/<b>${esc(name ?? '')}</b>${extra ? ` · ${esc(extra)}` : ''}</a></li>`
      }).join('')
      const more = items.length > 3 ? `<button type="button" class="gh-more" data-n="${items.length - 3}">${esc(L.expand(items.length - 3))}</button>` : ''
      return `<ul class="gh">${rows}</ul>${more}`
    }
    const log = p.reports.length
      ? p.reports.map((r) => {
          const d = parseDay(r.date)
          const scope = Object.entries(r.scope).filter(([, n]) => n > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => `<span class="tag">${esc(L.scope[k] ?? k)} ${n}</span>`)
          const commits = r.commits.github + r.commits.gitea
          const sessions = Object.values(r.sessions).reduce((a, b) => a + b, 0)
          return `<li>
            <time datetime="${r.date}">${fmtShort.format(d)}<small>${fmtWeekday.format(d)}</small></time>
            <div>
              <p class="what">${esc(describe(r))}</p>
              <p class="detail">${esc(dayDetail(r))}</p>
              <div class="meta">
                <span class="tag">${L.sessions(sessions)}</span>
                ${r.tokens ? `<span class="tag">${L.tokens(compact(r.tokens))}</span>` : ''}
                ${commits ? `<span class="tag">${L.contrib(commits)}</span>` : ''}
                ${scope.join('')}
              </div>
              ${ghList(r.github ?? [])}
            </div>
          </li>`
        }).join('')
      : `<li>${L.empty}</li>`

    // ---------- 模型消耗 ----------
    const u = p.usage
    const hasModels = !!u && (u.all.models.length > 0 || u.embeddings.length > 0)
    const srcName = (s: string) => (SOURCE_NAME[s] ?? [s, s])[isZh ? 1 : 0]
    const color = (m: string) => VENDOR_COLOR.find(([re]) => re.test(m))?.[1] ?? 'var(--faint)'
    const icon = (m: string) => {
      const hit = MODEL_ICON.find(([re]) => re.test(m))
      if (!hit)
        return `<i class="m-dot" style="background:${color(m)}"></i>`
      const [, src, mono] = hit
      return mono
        ? `<i class="m-icon m-mask" style="--icon:url(${src})" aria-hidden="true"></i>`
        : `<img class="m-icon" src="${src}" alt="" width="18" height="18" loading="lazy" decoding="async">`
    }
    const modelsView = (range: 'all' | 'month') => {
      if (!u)
        return { sources: '', list: '' }
      const r = u[range]
      const max = Math.max(1, ...r.models.map(m => m.tokens))
      return {
        sources: r.sources.map(s => `<span>${esc(srcName(s.source))} <b>${compact(s.tokens)}</b></span>`).join(''),
        list: r.models.slice(0, 10).map(m => `<li>
            <span class="m-name">${icon(m.model)}<span>${esc(m.model)}</span><small>${esc(m.sources.map(srcName).join(' · '))}</small></span>
            <span class="m-val">${esc(L.modelVal(compact(m.tokens), num(m.requests)))}</span>
            <span class="m-bar"><i style="width:${Math.max(1, (m.tokens / max) * 100).toFixed(2)}%;background:${color(m.model)}"></i></span>
          </li>`).join(''),
      }
    }

    // ---------- 最近动态（GitHub 公开动态归档） ----------
    const daysAgo = (at: string) => (now - new Date(at).getTime()) / 86_400_000
    const feed = (p.activity ?? []).slice(0, 8).map((e) => {
      const [owner, name] = e.repo.split('/')
      const extra = e.type === 'PushEvent'
        ? [e.ref, e.commits ? L.commits(e.commits) : ''].filter(Boolean).join(' · ')
        : e.type === 'CreateEvent' ? `${e.ref_type ?? ''} ${e.ref ?? ''}`.trim() : (e.title ?? '')
      return `<li>
        <span class="kind">${esc(L.events[e.type] ?? e.type)}</span>
        <a class="what" href="${esc(e.url || `https://github.com/${e.repo}`)}" target="_blank" rel="noopener"><span>${esc(owner)}/</span>${esc(name ?? '')}${extra ? ` <span>· ${esc(extra)}</span>` : ''}</a>
        <time datetime="${esc(e.created_at)}">${esc(L.ago(daysAgo(e.created_at)))}</time>
      </li>`
    })

    // ---------- 开源贡献时间轴（从新到旧，默认近一年，其余点「展示更多」） ----------
    const items = p.github.timeline ?? []
    const inYear = items.filter(x => daysAgo(x.merged_at) <= 365).length
    const initialShown = Math.min(items.length, Math.max(inYear, 5))
    const timelineView = (shown: number) => {
      let year = ''
      const parts: string[] = []
      for (const x of items.slice(0, shown)) {
        const y = x.merged_at.slice(0, 4)
        if (y !== year) {
          year = y
          parts.push(`<li class="year">${y}</li>`)
        }
        const [owner, name] = x.repo.split('/')
        parts.push(`<li class="item"><a href="${esc(x.url || `https://github.com/${x.repo}`)}" target="_blank" rel="noopener">
          <span class="head">
            <span class="name"><span>${esc(owner)}/</span>${esc(name ?? '')}</span>${x.kind === 'own' ? `<span class="own">${esc(L.ownBadge)}</span>` : ''}
            <span class="meta"><span class="stars">${STAR}${compact(x.stars)}</span>${x.language ? `<span>${esc(x.language)}</span>` : ''}</span>
            <time datetime="${esc(x.merged_at)}">${esc(fmtMonthDay.format(new Date(x.merged_at)))}</time>
          </span>
          <span class="title">${esc(x.title)}</span>
        </a></li>`)
      }
      const rest = items.length - shown
      return { html: parts.join(''), rest, more: L.more(rest) }
    }

    // ---------- 各 slot 的初始内容 ----------
    const c = all.commits
    const code0 = codeView('recent')
    const ai0 = aiView('recent')
    const models0 = modelsView('all')
    const tl0 = timelineView(initialShown)
    const slots: Record<string, Slot> = {
      'code-stats': {
        html: [
          stat(num(c.github + c.gitea), L.contribAll),
          stat(num(c.github), 'GitHub'),
          stat(num(c.gitea), L.privateRepos),
        ].join(''),
      },
      'code-tabs': { html: yearTabs(codeOptions, 'recent') },
      'code-heat': { html: code0.heat },
      'code-caption': { text: code0.caption },
      'feed': { html: feed.join('') },
      'feed-wrap': { hidden: !feed.length },
      'ai-stats': {
        html: [
          stat(compact(all.tokens), L.tokensAll),
          stat(num(all.sessions), L.sessionsAll),
          stat(num(p.active_days), L.activeDays),
          stat(L.streakValue(p.streak), L.streak),
        ].join(''),
      },
      'split': {
        html: `
      <div class="bar">${tools.map(x => `<i style="width:${((x.sessions / totalSessions) * 100).toFixed(2)}%;background:var(--${x.t})"></i>`).join('')}</div>
      <div class="keys">${tools.map(x => `<span><span class="dot" style="background:var(--${x.t})"></span>${esc(L.split(TOOLS[x.t], num(x.sessions), x.tokens ? compact(x.tokens) : null))}</span>`).join('')}</div>`,
      },
      'ai-tabs': { html: yearTabs(aiOptions, 'recent') },
      'ai-heat': { html: ai0.heat },
      'ai-caption': { text: ai0.caption },
      'ai-since': { text: L.since(p.since.ai, p.since.tokens) },
      'models-section': { hidden: !hasModels },
      'models-sources': { html: models0.sources },
      'models': { html: models0.list },
      'embeddings': { text: (u?.embeddings ?? []).map(e => L.embedding(e.model, num(e.builds))).join(' ') },
      'log': { html: log },
      'timeline': { html: tl0.html },
      'more': { text: tl0.more, hidden: tl0.rest <= 0 },
      'oss-section': { hidden: !items.length },
    }

    return { slots, codeView, aiView, codeTip, aiTip, modelsView, timelineView, initialShown, itemCount: items.length }
  }

  return { L, build }
}
