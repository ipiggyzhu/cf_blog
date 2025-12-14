// 首页壁纸 - 直接使用 Cloudflare R2 存储的图片

// R2 壁纸列表
const R2_WALLPAPERS = [
  "https://image.itpiggy.top/WallPaper/1.webp",
  "https://image.itpiggy.top/WallPaper/2.webp",
  "https://image.itpiggy.top/WallPaper/3.webp",
  "https://image.itpiggy.top/WallPaper/4.webp",
  "https://image.itpiggy.top/WallPaper/5.webp",
  "https://image.itpiggy.top/WallPaper/6.webp",
  "https://image.itpiggy.top/WallPaper/7.webp",
  "https://image.itpiggy.top/WallPaper/8.webp",
  "https://image.itpiggy.top/WallPaper/9.webp",
  "https://image.itpiggy.top/WallPaper/10.webp",
  "https://image.itpiggy.top/WallPaper/11.webp",
  "https://image.itpiggy.top/WallPaper/12.webp",
  "https://image.itpiggy.top/WallPaper/13.webp",
  "https://image.itpiggy.top/WallPaper/14.webp",
  "https://image.itpiggy.top/WallPaper/15.webp",
  "https://image.itpiggy.top/WallPaper/16.webp",
  "https://image.itpiggy.top/WallPaper/17.webp",
  "https://image.itpiggy.top/WallPaper/18.webp",
  "https://image.itpiggy.top/WallPaper/19.webp",
  "https://image.itpiggy.top/WallPaper/20.webp",
  "https://image.itpiggy.top/WallPaper/21.webp",
  "https://image.itpiggy.top/WallPaper/22.webp",
  "https://image.itpiggy.top/WallPaper/23.webp",
  "https://image.itpiggy.top/WallPaper/24.webp",
  "https://image.itpiggy.top/WallPaper/25.webp",
]

// 随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 获取壁纸列表（直接返回 R2 图片，随机打乱）
export function fetchDynamicWallpapers(): Promise<string[]> {
  return Promise.resolve(shuffleArray(R2_WALLPAPERS))
}

// 同步获取壁纸列表
export function getWallpapers(): string[] {
  return shuffleArray(R2_WALLPAPERS)
}

// 导出壁纸数组
export const Wallpaper: string[] = R2_WALLPAPERS

// 兼容旧代码的配置（不再使用，保留避免报错）
export const WALLPAPER_SERVICE_CONFIG = {
  baseUrl: 'https://image.itpiggy.top',
  apiEndpoint: '/WallPaper',
  get fullUrl() {
    return `${this.baseUrl}${this.apiEndpoint}`
  }
}
