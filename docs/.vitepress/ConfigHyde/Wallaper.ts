// 首页壁纸 - 动态获取本地图片服务器的图片

// 壁纸服务配置 - 统一配置服务地址，一处修改全局生效
export const WALLPAPER_SERVICE_CONFIG = {
  baseUrl: 'https://blog.itpiggy.top',
  // baseUrl: 'https://blog.itpiggy.top',
  apiEndpoint: '/api/images',
  get fullUrl() {
    return `${this.baseUrl}${this.apiEndpoint}`
  }
}

// 备用图片列表（使用您自己的壁纸）
const fallbackImages = [
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
];
// 随机打乱数组的函数
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 动态获取图片列表的函数
async function fetchDynamicWallpapers(): Promise<string[]> {
  try {
    // 使用统一配置的图片服务API
    const response = await fetch(WALLPAPER_SERVICE_CONFIG.fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 检查 API 是否成功返回数据
    if (!data.success) {
      console.warn('API 返回失败:', data.error);
      return shuffleArray(fallbackImages);
    }
    
    const images = data.images || [];
    
    // API 现在返回完整的 URL（包含域名），直接使用
    // 格式：https://image.itpiggy.top/cf-blog/WallPaper/1.png
    const wallpapers = images.filter((imagePath: string) => {
      // 确保是有效的 URL
      return imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'));
    });
    
    console.log(`✅ 成功获取 ${wallpapers.length} 张壁纸，域名: ${data.domain || '未知'}`);
    
    // 如果获取到图片，随机打乱后返回，否则返回随机打乱的备用图片
    return wallpapers.length > 0 ? shuffleArray(wallpapers) : shuffleArray(fallbackImages);
    
  } catch (error) {
    console.warn('❌ 无法获取动态壁纸，使用备用图片:', error);
    return shuffleArray(fallbackImages);
  }
}

// 创建一个Promise来获取壁纸
let wallpaperPromise: Promise<string[]> | null = null;

// 获取壁纸的函数
function getWallpapers(): Promise<string[]> {
  if (!wallpaperPromise) {
    wallpaperPromise = fetchDynamicWallpapers();
  }
  return wallpaperPromise;
}

// 导出的Wallpaper数组 - 在服务端渲染时使用随机打乱的备用图片，客户端动态加载
export const Wallpaper: string[] = shuffleArray(fallbackImages);

// 导出动态获取函数供主题使用
export { getWallpapers, fetchDynamicWallpapers };
