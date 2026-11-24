/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** dashboard 的 PROFILE 接口地址（构建时取文案） */
  readonly PROFILE_API_BASE?: string
  /** 埋点上报地址，默认线上 dashboard；本地联调指向本地后端 */
  readonly PUBLIC_TRACK_ENDPOINT?: string
  /** dashboard 公开统计接口（浏览器里取活动数据） */
  readonly PUBLIC_PROFILE_API?: string
}
