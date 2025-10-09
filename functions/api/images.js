/**
 * Cloudflare Pages Function - R2 壁纸图片列表 API
 * 直接返回固定的壁纸列表，无需 R2 绑定
 */

export async function onRequestGet() {
  try {
    // 您的壁纸列表（通过 image.itpiggy.top Worker 访问）
    const images = [
      'https://image.itpiggy.top/cf-blog/WallPaper/1.png',
      'https://image.itpiggy.top/cf-blog/WallPaper/2.png',
      'https://image.itpiggy.top/cf-blog/WallPaper/3.png',
      'https://image.itpiggy.top/cf-blog/WallPaper/4.png',
      'https://image.itpiggy.top/cf-blog/WallPaper/5.png',
    ];

    // 返回 JSON 响应
    return new Response(JSON.stringify({
      success: true,
      count: images.length,
      images: images,
      domain: 'https://image.itpiggy.top',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      images: []
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

