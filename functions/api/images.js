/**
 * Cloudflare Pages Function - R2 壁纸图片列表 API
 * 自动列出 R2 存储桶中的所有壁纸图片
 */

export async function onRequestGet({ env }) {
  try {
    // 固定壁纸列表作为备用（如果 R2 绑定失败）
    const fallbackImages = [
      'https://image.itpiggy.top/WallPaper/1.webp',
      'https://image.itpiggy.top/WallPaper/2.webp',
      'https://image.itpiggy.top/WallPaper/3.webp',
      'https://image.itpiggy.top/WallPaper/4.webp',
      'https://image.itpiggy.top/WallPaper/5.webp',
    ];

    // 检查 R2 绑定是否存在
    if (!env.R2_BUCKET) {
      console.warn('⚠️ R2_BUCKET 未绑定，使用固定图片列表');
      return new Response(JSON.stringify({
        success: true,
        count: fallbackImages.length,
        images: fallbackImages,
        domain: 'https://image.itpiggy.top',
        mode: 'fallback',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // 自动列出 WallPaper 目录下的所有图片
    const listed = await env.R2_BUCKET.list({
      prefix: 'WallPaper/',
      limit: 100
    });

    // 过滤出图片文件并构建完整 URL
    const images = listed.objects
      .filter(obj => {
        // 只要图片文件，排除文件夹
        const fileName = obj.key.split('/').pop();
        return fileName && /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
      })
      .map(obj => `https://image.itpiggy.top/${obj.key}`);

    // 如果没有找到图片，使用备用列表
    if (images.length === 0) {
      console.warn('⚠️ R2 中没有找到图片，使用备用列表');
      return new Response(JSON.stringify({
        success: true,
        count: fallbackImages.length,
        images: fallbackImages,
        domain: 'https://image.itpiggy.top',
        mode: 'fallback-empty',
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // 返回动态获取的图片列表
    return new Response(JSON.stringify({
      success: true,
      count: images.length,
      images: images,
      domain: 'https://image.itpiggy.top',
      mode: 'dynamic',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('❌ API 错误:', error);
    
    // 出错时返回备用图片
    const fallbackImages = [
      'https://image.itpiggy.top/WallPaper/1.webp',
      'https://image.itpiggy.top/WallPaper/2.webp',
      'https://image.itpiggy.top/WallPaper/3.webp',
      'https://image.itpiggy.top/WallPaper/4.webp',
      'https://image.itpiggy.top/WallPaper/5.webp',
    ];

    return new Response(JSON.stringify({
      success: true,
      count: fallbackImages.length,
      images: fallbackImages,
      domain: 'https://image.itpiggy.top',
      mode: 'fallback-error',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
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

