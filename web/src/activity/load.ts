// 构建时取 dashboard 的公开统计（/api/v1/public/profile）。接口按北京时间每天缓存，数据只到昨天；
// 网站由 dashboard 每天凌晨重建一次，所以页面里的数据就是构建时这一份，浏览器不再请求接口。
import type { Profile } from './view'

// 构建时用的地址：PROFILE_API_BASE（和文案共用；quicksilver 上重建时指向本机 dashboard）
const BUILD_BASE = (import.meta.env.PROFILE_API_BASE as string | undefined) ?? 'https://dashboard.loki.zaneliu.me'
const BUILD_API = `${BUILD_BASE.replace(/\/$/, '')}/api/v1/public/profile`
// 浏览器兜底现取用的公开地址（只在构建时没拿到数据时用）
export const PROFILE_API = (import.meta.env.PUBLIC_PROFILE_API as string | undefined) ?? 'https://dashboard.loki.zaneliu.me/api/v1/public/profile'
// 定时重建时设 PROFILE_REQUIRED=1：取不到数据就让构建失败，不上传一个没有数据的页面
const REQUIRED = import.meta.env.PROFILE_REQUIRED === '1'

let cached: Promise<Profile | null> | null = null

async function fetchOnce(): Promise<Profile> {
  const res = await fetch(BUILD_API, { signal: AbortSignal.timeout(20000) })
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`)
  const data = await res.json() as Profile & { content?: unknown }
  if (!data?.calendar?.days || !data.totals)
    throw new Error('结构不对')
  // 文案另有接口，嵌进页面的数据里不需要
  delete data.content
  return data
}

/** 两种语言的页面共用一次请求；失败重试 3 次，仍失败返回 null（页面上这一块退回到浏览器里现取） */
export function loadProfile(): Promise<Profile | null> {
  cached ??= (async () => {
    let last: unknown
    for (let i = 0; i < 3; i++) {
      try {
        return await fetchOnce()
      }
      catch (e) {
        last = e
        await new Promise(r => setTimeout(r, 2000 * (i + 1)))
      }
    }
    const cause = (last as { cause?: { code?: string, message?: string } }).cause
    const why = `${(last as Error).message}${cause ? ` / ${cause.code ?? ''} ${cause.message ?? ''}` : ''}`
    if (REQUIRED)
      throw new Error(`[activity] 构建时取统计失败：${why}`)
    console.warn(`[activity] 构建时取统计失败，页面改为浏览器里现取（${why}）`)
    return null
  })()
  return cached
}
