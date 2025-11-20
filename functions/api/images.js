/**
 * Cloudflare Pages Function - R2 壁纸图片列表 API
 * 自动列出 R2 存储桶中的所有壁纸图片
 * 增强版：添加超时保护和完善的错误处理
 */

// 超时包装函数
async function withTimeout(promise, timeoutMs = 5000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export async function onRequestGet({ env }) {
  const startTime = Date.now();
  
  try {
    // 固定壁纸列表作为备用（如果 R2 绑定失败）
    const fallbackImages = [
      'https://image.itpiggy.top/WallPaper/1.webp',
      'https://image.itpiggy.top/WallPaper/2.webp',
      'https://image.itpiggy.top/WallPaper/3.webp',
      'https://image.itpiggy.top/WallPaper/4.webp',
      'https://image.itpiggy.top/WallPaper/5.webp',
      'https://image.itpiggy.top/WallPaper/6.webp',
      'https://image.itpiggy.top/WallPaper/7.webp',
      'https://image.itpiggy.top/WallPaper/8.webp',
      'https://image.itpiggy.top/WallPaper/9.webp',
      'https://image.itpiggy.top/WallPaper/10.webp',
      'https://image.itpiggy.top/WallPaper/11.webp',
      'https://image.itpiggy.top/WallPaper/12.webp',
      'https://image.itpiggy.top/WallPaper/13.webp',
      'https://image.itpiggy.top/WallPaper/14.webp',
      'https://image.itpiggy.top/WallPaper/15.webp',
      'https://image.itpiggy.top/WallPaper/16.webp',
      'https://image.itpiggy.top/WallPaper/17.webp',
      'https://image.itpiggy.top/WallPaper/18.webp',
      'https://image.itpiggy.top/WallPaper/19.webp',
      'https://image.itpiggy.top/WallPaper/20.webp',
      'https://image.itpiggy.top/WallPaper/21.webp',
      'https://image.itpiggy.top/WallPaper/22.webp',
      'https://image.itpiggy.top/WallPaper/23.webp',
      'https://image.itpiggy.top/WallPaper/24.webp',
      'https://image.itpiggy.top/WallPaper/25.webp',
    ];

    // 检查 R2 绑定是否存在
    if (!env.R2_BUCKET) {
      console.warn('⚠️ R2_BUCKET 未绑定，使用固定图片列表');
      return new Response(JSON.stringify({
        success: true,
        data: fallbackImages,
        count: fallbackImages.length,
        images: fallbackImages,
        domain: 'https://image.itpiggy.top',
        mode: 'fallback',
        fallback: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // 自动列出 WallPaper 目录下的所有图片（带超时保护）
    const listed = await withTimeout(
      env.R2_BUCKET.list({
        prefix: 'WallPaper/',
        limit: 1000
      }),
      5000
    );

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
        data: fallbackImages,
        count: fallbackImages.length,
        images: fallbackImages,
        domain: 'https://image.itpiggy.top',
        mode: 'fallback-empty',
        fallback: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }

    // 返回动态获取的图片列表
    return new Response(JSON.stringify({
      success: true,
      data: images,
      count: images.length,
      images: images,
      domain: 'https://image.itpiggy.top',
      mode: 'dynamic',
      fallback: false,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('❌ API 错误:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // 出错时返回备用图片
    const fallbackImages = [
      'https://image.itpiggy.top/WallPaper/1.webp',
      'https://image.itpiggy.top/WallPaper/2.webp',
      'https://image.itpiggy.top/WallPaper/3.webp',
      'https://image.itpiggy.top/WallPaper/4.webp',
      'https://image.itpiggy.top/WallPaper/5.webp',
      'https://image.itpiggy.top/WallPaper/6.webp',
      'https://image.itpiggy.top/WallPaper/7.webp',
      'https://image.itpiggy.top/WallPaper/8.webp',
      'https://image.itpiggy.top/WallPaper/9.webp',
      'https://image.itpiggy.top/WallPaper/10.webp',
      'https://image.itpiggy.top/WallPaper/11.webp',
      'https://image.itpiggy.top/WallPaper/12.webp',
      'https://image.itpiggy.top/WallPaper/13.webp',
      'https://image.itpiggy.top/WallPaper/14.webp',
      'https://image.itpiggy.top/WallPaper/15.webp',
      'https://image.itpiggy.top/WallPaper/16.webp',
      'https://image.itpiggy.top/WallPaper/17.webp',
      'https://image.itpiggy.top/WallPaper/18.webp',
      'https://image.itpiggy.top/WallPaper/19.webp',
      'https://image.itpiggy.top/WallPaper/20.webp',
      'https://image.itpiggy.top/WallPaper/21.webp',
      'https://image.itpiggy.top/WallPaper/22.webp',
      'https://image.itpiggy.top/WallPaper/23.webp',
      'https://image.itpiggy.top/WallPaper/24.webp',
      'https://image.itpiggy.top/WallPaper/25.webp',
    ];

    return new Response(JSON.stringify({
      success: true,
      data: fallbackImages,
      count: fallbackImages.length,
      images: fallbackImages,
      domain: 'https://image.itpiggy.top',
      mode: 'fallback-error',
      fallback: true,
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=60'
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

