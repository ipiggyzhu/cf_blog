/**
 * Cloudflare Pages Function - 地理位置 API
 * 使用 CF 边缘地理信息 + ipapi fallback（带 Cache API 缓存）
 */
import { corsPreflightResponse, jsonResponse, withTimeout } from "../_lib/http.js";

const GEO_BROWSER_TTL = 300;
const GEO_FAIL_TTL = 30;
const GEO_FALLBACK_CACHE_TTL = 1800;
const GEO_EXTERNAL_TIMEOUT = 1500;
const IP_API_URL = "https://ipapi.co/json/";

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getCfLocation(cf = {}) {
  const latitude = toNumber(cf.latitude);
  const longitude = toNumber(cf.longitude);
  if (latitude === null || longitude === null) return null;
  return { latitude, longitude, city: cf.city || "" };
}

function buildPayload({ success, source = "none", latitude = null, longitude = null, city = "", fallback = false, cached = false, error = null, startTime }) {
  return {
    success, ok: success, source,
    data: success ? { latitude, longitude, city } : null,
    latitude, longitude, city,
    fallback, cached, error,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
  };
}

function buildFallbackCacheKey(request) {
  const url = new URL(request.url);
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  url.pathname = "/__internal/geo-fallback-cache";
  url.search = `ip=${encodeURIComponent(ip)}`;
  return new Request(url.toString(), { method: "GET" });
}

async function fetchIpLocation() {
  const response = await withTimeout(
    fetch(IP_API_URL, { headers: { Accept: "application/json" } }),
    GEO_EXTERNAL_TIMEOUT
  );
  if (!response.ok) throw new Error(`IP API HTTP ${response.status}`);
  const json = await response.json();
  const latitude = toNumber(json.latitude);
  const longitude = toNumber(json.longitude);
  if (latitude === null || longitude === null) return null;
  return { latitude, longitude, city: json.city || "" };
}

export const onRequestGet = async ({ request, waitUntil }) => {
  const startTime = Date.now();
  const okCache = `private, max-age=${GEO_BROWSER_TTL}, stale-while-revalidate=600`;
  const failCache = `private, max-age=${GEO_FAIL_TTL}`;

  try {
    // 1. 优先使用 Cloudflare 边缘地理信息（零延迟）
    const cfLocation = getCfLocation(request.cf);
    if (cfLocation) {
      return jsonResponse(
        buildPayload({ success: true, source: "cf", fallback: false, startTime, ...cfLocation }),
        { cacheControl: okCache }
      );
    }

    // 2. Fallback: 先查 Cache API，再调 ipapi
    const cache = globalThis.caches?.default;
    if (cache) {
      const cacheKey = buildFallbackCacheKey(request);
      const cached = await cache.match(cacheKey);
      if (cached) {
        const loc = await cached.json();
        return jsonResponse(
          buildPayload({ success: true, source: "ipapi-cache", fallback: true, cached: true, startTime, ...loc }),
          { cacheControl: okCache }
        );
      }

      try {
        const ipLocation = await fetchIpLocation();
        if (ipLocation) {
          const entry = new Response(JSON.stringify(ipLocation), {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": `public, max-age=${GEO_FALLBACK_CACHE_TTL}`,
            },
          });
          const write = cache.put(cacheKey, entry);
          if (waitUntil) waitUntil(write); else await write;

          return jsonResponse(
            buildPayload({ success: true, source: "ipapi", fallback: true, startTime, ...ipLocation }),
            { cacheControl: okCache }
          );
        }
      } catch (fetchErr) {
        console.warn("IP API fallback failed:", fetchErr.message);
      }
    }

    return jsonResponse(
      buildPayload({ success: false, fallback: true, error: "Unable to determine location", startTime }),
      { cacheControl: failCache }
    );
  } catch (e) {
    console.error("Geo API error:", { message: e.message, timestamp: new Date().toISOString() });
    return jsonResponse(
      buildPayload({ success: false, error: e.message || "Internal server error", fallback: true, startTime }),
      { cacheControl: failCache }
    );
  }
};

export const onRequestOptions = corsPreflightResponse;
