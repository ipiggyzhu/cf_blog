export const onRequestGet = async ({ request }) => {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
  };

  try {
    const cf = request.cf || {};
    const latitude = cf.latitude ? Number(cf.latitude) : null;
    const longitude = cf.longitude ? Number(cf.longitude) : null;
    const city = cf.city || '';

    if (latitude && longitude) {
      return new Response(
        JSON.stringify({ ok: true, source: 'cf', latitude, longitude, city }),
        { headers }
      );
    }

    // Fallback to IP provider (server-side)
    try {
      const r = await fetch('https://ipapi.co/json/');
      const j = await r.json();
      if (j && j.latitude && j.longitude) {
        return new Response(
          JSON.stringify({ ok: true, source: 'ipapi', latitude: j.latitude, longitude: j.longitude, city: j.city || '' }),
          { headers }
        );
      }
    } catch {}

    return new Response(JSON.stringify({ ok: false }), { headers, status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { headers, status: 200 });
  }
};


