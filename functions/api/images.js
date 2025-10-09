/**
 * Cloudflare Pages Function - R2 壁纸图片列表 API
 * 这个文件会自动部署为 /api/images 端点
 * 无需额外配置，随 Pages 一起部署
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    // 检查 R2_BUCKET 是否已配置
    if (!env.R2_BUCKET) {
      throw new Error('R2_BUCKET is not configured. Please bind R2 bucket in Cloudflare Pages settings.');
    }

    // 获取 R2 公开域名（从环境变量或使用默认值）
    const R2_PUBLIC_DOMAIN = env.R2_PUBLIC_DOMAIN || 'https://image.itpiggy.top';

    // 从 R2 存储桶获取 cf-blog/WallPaper/ 目录下的文件列表
    const listed = await env.R2_BUCKET.list({
      prefix: 'cf-blog/WallPaper/',
      delimiter: '/'
    });

    // 过滤出图片文件（支持常见图片格式）
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
    const images = listed.objects
      .filter(obj => {
        const ext = obj.key.toLowerCase().slice(obj.key.lastIndexOf('.'));
        return imageExtensions.includes(ext);
      })
      .map(obj => {
        // 返回完整的公开访问 URL
        // 格式：https://image.itpiggy.top/cf-blog/WallPaper/1.png
        return `${R2_PUBLIC_DOMAIN}/${obj.key}`;
      });

    // 返回 JSON 响应
    return new Response(JSON.stringify({
      success: true,
      count: images.length,
      images: images,
      domain: R2_PUBLIC_DOMAIN,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300' // 缓存5分钟
      }
    });

  } catch (error) {
    console.error('R2 API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      images: [] // 返回空数组，前端会使用备用图片
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 处理 CORS 预检
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

