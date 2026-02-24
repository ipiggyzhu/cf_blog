/**
 * Cloudflare Pages Function - R2 壁纸图片列表 API
 * 使用 Cache API 缓存 R2 list 结果，减少重复调用
 */
import { corsPreflightResponse, jsonResponse, withTimeout } from "../_lib/http.js";

const IMAGE_DOMAIN = "https://image.itpiggy.top";
const WALLPAPER_PREFIX = "WallPaper/";
const IMAGE_RE = /\.(jpg|jpeg|png|webp|gif)$/i;
const FALLBACK_IMAGES = Array.from(
  { length: 25 },
  (_, i) => `${IMAGE_DOMAIN}/WallPaper/${i + 1}.webp`
);

const R2_LIST_TIMEOUT = 4000;
const BROWSER_TTL = 300;
const EDGE_TTL = 900;
const STALE_TTL = 86400;
const ERROR_TTL = 60;

function normalizeCacheKey(request) {
  const url = new URL(request.url);
  url.search = "";
  return new Request(url.toString(), { method: "GET" });
}

function buildPayload({ images, mode, fallback, startTime, error = null }) {
  return {
    success: true,
    data: images,
    count: images.length,
    images,
    domain: IMAGE_DOMAIN,
    mode, fallback, error,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime,
  };
}

function cacheControl(isError = false) {
  if (isError) return `public, max-age=${ERROR_TTL}, s-maxage=${ERROR_TTL}`;
  return `public, max-age=${BROWSER_TTL}, s-maxage=${EDGE_TTL}, stale-while-revalidate=${STALE_TTL}`;
}

function withCacheMarker(response, marker) {
  const headers = new Headers(response.headers);
  headers.set("x-images-cache", marker);
  return new Response(response.body, { status: response.status, headers });
}

export async function onRequestGet({ request, env, waitUntil }) {
  // 1. 先查 Cache API
  const cache = globalThis.caches?.default;
  const cacheKey = normalizeCacheKey(request);
  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) return withCacheMarker(cached, "HIT");
  }

  const startTime = Date.now();
  try {
    let payload;
    if (!env.R2_BUCKET) {
      payload = buildPayload({ images: FALLBACK_IMAGES, mode: "fallback-no-r2", fallback: true, startTime });
    } else {
      const listed = await withTimeout(
        env.R2_BUCKET.list({ prefix: WALLPAPER_PREFIX, limit: 1000 }),
        R2_LIST_TIMEOUT
      );
      const images = listed.objects
        .filter(obj => {
          const fileName = obj.key.split("/").pop();
          return fileName && IMAGE_RE.test(fileName);
        })
        .map(obj => `${IMAGE_DOMAIN}/${obj.key}`);

      payload = buildPayload({
        images: images.length > 0 ? images : FALLBACK_IMAGES,
        mode: images.length > 0 ? "dynamic" : "fallback-empty",
        fallback: images.length === 0,
        startTime,
      });
    }

    const response = jsonResponse(payload, { cacheControl: cacheControl(false) });
    if (cache) {
      const write = cache.put(cacheKey, response.clone());
      if (waitUntil) waitUntil(write); else await write;
    }
    return withCacheMarker(response, "MISS");
  } catch (error) {
    console.error("Images API error:", { message: error?.message, timestamp: new Date().toISOString() });

    const response = jsonResponse(
      buildPayload({ images: FALLBACK_IMAGES, mode: "fallback-error", fallback: true, error: error?.message, startTime }),
      { cacheControl: cacheControl(true) }
    );
    if (cache) {
      const write = cache.put(cacheKey, response.clone());
      if (waitUntil) waitUntil(write); else await write;
    }
    return withCacheMarker(response, "MISS");
  }
}

export const onRequestOptions = corsPreflightResponse;
