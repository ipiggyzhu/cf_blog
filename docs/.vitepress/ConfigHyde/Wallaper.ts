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

// 备用图片列表（当本地服务不可用时使用）
const fallbackImages = [
  "https://image.itpiggy.top/cf-blog/WallPaper/1.png",
  "https://image.itpiggy.top/cf-blog/WallPaper/2.png",
  "https://image.itpiggy.top/cf-blog/WallPaper/3.png",
  "https://image.itpiggy.top/cf-blog/WallPaper/4.png",
  "https://image.itpiggy.top/cf-blog/WallPaper/5.png",
];
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
    const images = data.images || [];
    
    // 将相对路径转换为完整的 R2 URL
    const wallpapers = images.map((imagePath: string) => {
      // 如果 API 返回的是完整 URL，直接使用；否则拼接 R2 域名
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      return `https://image.itpiggy.top${imagePath}`;
    });
    
    // 如果获取到图片，返回动态图片列表，否则返回备用图片
    return wallpapers.length > 0 ? wallpapers : wallpapers;
    
  } catch (error) {
    console.warn('无法获取动态壁纸，使用备用图片:', error);
    return fallbackImages;
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

// 导出的Wallpaper数组 - 在服务端渲染时使用备用图片，客户端动态加载
export const Wallpaper: string[] = fallbackImages;

// 导出动态获取函数供主题使用
export { getWallpapers, fetchDynamicWallpapers };
