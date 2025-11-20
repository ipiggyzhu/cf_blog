/**
 * Cloudflare Pages Function - 地理位置 API
 * 获取用户地理位置信息（经纬度、城市）
 * 增强版：添加超时保护和完善的错误处理
 */

// 超时包装函数
async function withTimeout(promise, timeoutMs = 5000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export const onRequestGet = async ({ request }) => {
  const startTime = Date.now();
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'cache-control': 'no-store',
  };

  try {
    const cf = request.cf || {};
    const latitude = cf.latitude ? Number(cf.latitude) : null;
    const longitude = cf.longitude ? Number(cf.longitude) : null;
    const city = cf.city || '';

    if (latitude && longitude) {
      return new Response(
        JSON.stringify({ 
          success: true,
          ok: true, 
          source: 'cf', 
          data: { latitude, longitude, city },
          latitude, 
          longitude, 
          city,
          fallback: false,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }),
        { status: 200, headers }
      );
    }

    // Fallback to IP provider (server-side) with timeout
    try {
      const response = await withTimeout(
        fetch('https://ipapi.co/json/'),
        5000
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const j = await response.json();
      if (j && j.latitude && j.longitude) {
        return new Response(
          JSON.stringify({ 
            success: true,
            ok: true, 
            source: 'ipapi', 
            data: { 
              latitude: j.latitude, 
              longitude: j.longitude, 
              city: j.city || '' 
            },
            latitude: j.latitude, 
            longitude: j.longitude, 
            city: j.city || '',
            fallback: true,
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime
          }),
          { status: 200, headers }
        );
      }
    } catch (fetchError) {
      console.warn('⚠️ IP API fallback failed:', fetchError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        ok: false,
        error: 'Unable to determine location',
        fallback: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }), 
      { status: 200, headers }
    );
  } catch (e) {
    console.error('❌ Geo API 错误:', {
      message: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        ok: false,
        error: e.message || 'Internal server error',
        fallback: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime
      }), 
      { status: 200, headers }
    );
  }
};

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


