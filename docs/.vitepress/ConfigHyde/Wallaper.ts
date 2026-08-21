// 首页壁纸 - 动态获取图片服务的图库，失败则回落到内置列表

// 壁纸服务配置 - 统一配置服务地址，一处修改全局生效
// 注意：这里用的是绝对地址，好处是本地 dev（localhost:5173）也能拿到真实图库，
// 代价是预览域名（*.pages.dev）会跨域打到生产站，靠 /api/images 的 CORS: * 兜住。
export const WALLPAPER_SERVICE_CONFIG = {
  baseUrl: 'https://blog.itpiggy.us',
  apiEndpoint: '/api/images',
  timeout: 4000,
  get fullUrl() {
    return `${this.baseUrl}${this.apiEndpoint}`
  }
}

// 图片 CDN 域名与内置壁纸数量
const IMAGE_DOMAIN = 'https://image.itpiggy.us'
const FALLBACK_COUNT = 25

/**
 * 内置备用壁纸列表 —— 全站唯一来源
 * DynamicWallpaperManager 与首页 Banner 都从这里取，不要再复制一份
 */
export const FALLBACK_WALLPAPERS: string[] = Array.from(
  { length: FALLBACK_COUNT },
  (_, i) => `${IMAGE_DOMAIN}/WallPaper/${i + 1}.webp`
)

// 随机打乱数组的函数
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 请求图库服务，带超时（超时会真正 abort，不会挂住定时刷新）
 */
export async function fetchWallpaperLibrary(): Promise<string[] | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WALLPAPER_SERVICE_CONFIG.timeout)

  try {
    const response = await fetch(WALLPAPER_SERVICE_CONFIG.fullUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const data = await response.json()
    if (!data.success) {
      console.warn('API 返回失败:', data.error)
      return null
    }

    // API 返回完整 URL（含域名），这里只做有效性过滤
    const wallpapers: string[] = (data.images || []).filter(
      (url: string) => url && (url.startsWith('http://') || url.startsWith('https://'))
    )

    if (wallpapers.length === 0) return null

    console.log(`✅ 成功获取 ${wallpapers.length} 张壁纸，域名: ${data.domain || '未知'}`)
    return shuffleArray(wallpapers)
  } catch (error) {
    console.warn('❌ 无法获取动态壁纸:', error)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 获取壁纸列表，失败时回落到打乱后的内置列表
 */
export async function fetchDynamicWallpapers(): Promise<string[]> {
  return (await fetchWallpaperLibrary()) ?? shuffleArray(FALLBACK_WALLPAPERS)
}

// 导出的 Wallpaper 数组 - 构建期使用打乱后的内置图片，运行期由组件动态替换
export const Wallpaper: string[] = shuffleArray(FALLBACK_WALLPAPERS)
