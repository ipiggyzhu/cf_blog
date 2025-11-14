<template>
  <div class="weather-wrapper">
    <div class="divider divider-left"></div>
    <a class="VPSocialLink no-icon weather-link" :title="weatherTooltip" href="javascript:void(0)" @click="handleWeatherClick">
      <span class="weather-emoji" v-if="weatherData">{{ weatherIcon }}</span>
      <span class="weather-loading" v-else>🌡️</span>
    </a>
    <div class="divider divider-right"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface WeatherData {
  temperature: number
  skycon: string
  description: string
}

const weatherData = ref<WeatherData | null>(null)
const cityName = ref<string>('')

// 彩云天气的天气代码映射到emoji图标
const weatherIconMap: Record<string, string> = {
  'CLEAR_DAY': '☀️',
  'CLEAR_NIGHT': '🌙',
  'PARTLY_CLOUDY_DAY': '⛅',
  'PARTLY_CLOUDY_NIGHT': '☁️',
  'CLOUDY': '☁️',
  'LIGHT_HAZE': '😶‍🌫️',
  'MODERATE_HAZE': '😶‍🌫️',
  'HEAVY_HAZE': '😶‍🌫️',
  'LIGHT_RAIN': '🌦️',
  'MODERATE_RAIN': '🌧️',
  'HEAVY_RAIN': '⛈️',
  'STORM_RAIN': '⛈️',
  'FOG': '🌫️',
  'LIGHT_SNOW': '🌨️',
  'MODERATE_SNOW': '❄️',
  'HEAVY_SNOW': '❄️',
  'STORM_SNOW': '❄️',
  'DUST': '💨',
  'SAND': '💨',
  'WIND': '💨'
}

// 天气描述
const weatherDescMap: Record<string, string> = {
  'CLEAR_DAY': '晴天',
  'CLEAR_NIGHT': '晴夜',
  'PARTLY_CLOUDY_DAY': '多云',
  'PARTLY_CLOUDY_NIGHT': '多云',
  'CLOUDY': '阴天',
  'LIGHT_HAZE': '轻度雾霾',
  'MODERATE_HAZE': '中度雾霾',
  'HEAVY_HAZE': '重度雾霾',
  'LIGHT_RAIN': '小雨',
  'MODERATE_RAIN': '中雨',
  'HEAVY_RAIN': '大雨',
  'STORM_RAIN': '暴雨',
  'FOG': '雾',
  'LIGHT_SNOW': '小雪',
  'MODERATE_SNOW': '中雪',
  'HEAVY_SNOW': '大雪',
  'STORM_SNOW': '暴雪',
  'DUST': '浮尘',
  'SAND': '沙尘',
  'WIND': '大风'
}

const weatherIcon = computed(() => {
  if (!weatherData.value) return '🌡️'
  return weatherIconMap[weatherData.value.skycon] || '🌡️'
})

const temperature = computed(() => {
  if (!weatherData.value) return '--'
  return Math.round(weatherData.value.temperature)
})

const weatherTooltip = computed(() => {
  if (!weatherData.value) return '加载天气中...'
  const city = cityName.value ? `${cityName.value} · ` : ''
  return `${city}${weatherData.value.description} ${temperature.value}°C`
})

// ---- 位置与缓存 ----
const GEO_CACHE_KEY = 'nav-weather:geo'
const WEATHER_CACHE_PREFIX = 'nav-weather:realtime:'

const withTimeout = async <T>(promise: Promise<T>, ms = 8000): Promise<T> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    // @ts-ignore
    const result = await promise
    return result as T
  } finally {
    clearTimeout(timeout)
  }
}

const getEnvToken = (): string => {
  // @ts-ignore
  return (import.meta.env && import.meta.env.VITE_CAIYUN_TOKEN) || (window as any).__CAIYUN_TOKEN__ || ''
}

const getVisitorLocation = async (): Promise<{ latitude: number; longitude: number; city?: string } | null> => {
  if (typeof window === 'undefined') return null

  // 1. 检查缓存（缩短缓存时间到 5 分钟，提高准确性）
  try {
    const cacheRaw = localStorage.getItem(GEO_CACHE_KEY)
    if (cacheRaw) {
      const cache = JSON.parse(cacheRaw)
      // 缓存时间从 10 分钟改为 5 分钟
      if (Date.now() - cache.time < 5 * 60 * 1000) {
        return cache.value
      }
    }
  } catch {}

  // 2. 优先使用浏览器地理位置 API（最准确）
  const geoByBrowser = await new Promise<{ latitude: number; longitude: number } | null>(resolve => {
    if (!('geolocation' in navigator)) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      // 提高超时时间到 15 秒，给用户更多时间授权
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    )
  })
  if (geoByBrowser) {
    // 使用高德地图逆地理编码获取城市名称（国内更准确）
    try {
      const cityName = await getCityNameFromCoords(geoByBrowser.latitude, geoByBrowser.longitude)
      const value = { ...geoByBrowser, city: cityName }
      try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ time: Date.now(), value })) } catch {}
      return value
    } catch {
      try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ time: Date.now(), value: geoByBrowser })) } catch {}
      return geoByBrowser
    }
  }

  // 3. 使用国内 IP 定位服务（对国内用户更准确）
  const cnProviders = [
    // 高德 IP 定位（国内最准）
    async () => {
      const r = await withTimeout(fetch('https://restapi.amap.com/v3/ip?key=REDACTED_AMAP_KEY'))
      const j = await r.json()
      if (j.status === '1' && j.rectangle) {
        // 高德返回矩形范围，取中心点
        const coords = j.rectangle.split(';')
        const [lon1, lat1] = coords[0].split(',').map(Number)
        const [lon2, lat2] = coords[1].split(',').map(Number)
        return { 
          latitude: (lat1 + lat2) / 2, 
          longitude: (lon1 + lon2) / 2, 
          city: j.city || j.province 
        }
      }
      throw new Error('amap failed')
    },
    // 腾讯位置服务
    async () => {
      const r = await withTimeout(fetch('https://apis.map.qq.com/ws/location/v1/ip?key=UBNBZ-PHZW3-JJJ3Z-7R5LE-BQGVF-YVFBV&output=jsonp'))
      const text = await r.text()
      // 处理 JSONP 响应
      const jsonMatch = text.match(/\((.+)\)/)
      if (jsonMatch) {
        const j = JSON.parse(jsonMatch[1])
        if (j.status === 0 && j.result) {
          return { 
            latitude: j.result.location.lat, 
            longitude: j.result.location.lng, 
            city: j.result.ad_info.city 
          }
        }
      }
      throw new Error('tencent failed')
    }
  ]

  for (const fn of cnProviders) {
    try {
      const loc = await fn()
      if (loc && loc.latitude && loc.longitude) {
        try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ time: Date.now(), value: loc })) } catch {}
        return loc
      }
    } catch {}
  }

  // 4. 回退到国际 IP 定位服务
  const intlProviders = [
    async () => {
      const r = await withTimeout(fetch('https://ipapi.co/json/'))
      const j = await r.json()
      return { latitude: j.latitude, longitude: j.longitude, city: j.city }
    },
    async () => {
      const r = await withTimeout(fetch('https://ip-api.com/json/?lang=zh-CN'))
      const j = await r.json()
      return { latitude: j.lat, longitude: j.lon, city: j.city }
    }
  ]
  
  for (const fn of intlProviders) {
    try {
      const loc = await fn()
      if (loc && loc.latitude && loc.longitude) {
        try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ time: Date.now(), value: loc })) } catch {}
        return loc
      }
    } catch {}
  }

  // 5. 最后尝试 Cloudflare Pages Functions
  try {
    const r = await withTimeout(fetch('/api/geo'), 1500)
    const j = await r.json()
    if (j && j.ok && j.latitude && j.longitude) {
      const value = { latitude: Number(j.latitude), longitude: Number(j.longitude), city: j.city || '' }
      try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ time: Date.now(), value })) } catch {}
      return value
    }
  } catch {}

  return null
}

// 根据经纬度获取城市名称（使用高德地图逆地理编码）
const getCityNameFromCoords = async (lat: number, lon: number): Promise<string> => {
  try {
    const r = await withTimeout(
      fetch(`https://restapi.amap.com/v3/geocode/regeo?key=REDACTED_AMAP_KEY&location=${lon},${lat}`)
    )
    const j = await r.json()
    if (j.status === '1' && j.regeocode) {
      return j.regeocode.addressComponent.city || j.regeocode.addressComponent.province || ''
    }
  } catch {}
  return ''
}

// 获取天气数据
const fetchWeather = async () => {
  try {
    if (typeof window === 'undefined') return
    const token = getEnvToken()
    if (!token) {
      console.warn('[NavWeather] 未设置 VITE_CAIYUN_TOKEN 或 window.__CAIYUN_TOKEN__')
      throw new Error('missing token')
    }

    const loc = await getVisitorLocation()
    if (!loc) throw new Error('geo failed')

    const lat = loc.latitude
    const lon = loc.longitude
    cityName.value = loc.city || ''

    const cacheKey = `${WEATHER_CACHE_PREFIX}${lat.toFixed(2)},${lon.toFixed(2)}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const cc = JSON.parse(cached)
        if (Date.now() - cc.time < 10 * 60 * 1000) {
          weatherData.value = cc.value
          return
        }
      }
    } catch {}

    const url = `https://api.caiyunapp.com/v2.6/${token}/${lon},${lat}/realtime`
  const resp = await withTimeout(fetch(url))
  const data = await resp.json()
  if (data.status === 'ok') {
    const realtime = data.result.realtime
    const value: WeatherData = {
      temperature: realtime.temperature,
      skycon: realtime.skycon,
      description: weatherDescMap[realtime.skycon] || '未知'
    }
    weatherData.value = value
    try { localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), value })) } catch {}
  } else {
    // 彩云未返回 ok，尝试 Open-Meteo 兜底，避免 0℃
    await fetchOpenMeteo(lat, lon, cacheKey)
  }
  } catch (error) {
    console.error('获取天气数据失败:', error)
  try {
    const loc = await getVisitorLocation()
    if (loc) {
      const cacheKey = `${WEATHER_CACHE_PREFIX}${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`
      await fetchOpenMeteo(loc.latitude, loc.longitude, cacheKey)
      return
    }
  } catch {}
  weatherData.value = { temperature: 0, skycon: 'CLOUDY', description: '天气' }
  }
}

// Open-Meteo 兜底：无需 token，保证温度不为 0
const fetchOpenMeteo = async (lat: number, lon: number, cacheKey: string) => {
  try {
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
    const r = await withTimeout(fetch(api), 5000)
    const j = await r.json()
    const cur = j.current
    if (!cur) throw new Error('no current')

    const sky = wmoToSkycon(Number(cur.weather_code))
    const value: WeatherData = {
      temperature: Number(cur.temperature_2m),
      skycon: sky,
      description: weatherDescMap[sky] || '天气'
    }
    weatherData.value = value
    try { localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), value })) } catch {}
  } catch (e) {
    console.warn('open-meteo fallback failed', e)
  }
}

const wmoToSkycon = (code: number): string => {
  if (code === 0) return 'CLEAR_DAY'
  if ([1,2,3].includes(code)) return 'PARTLY_CLOUDY_DAY'
  if ([45,48].includes(code)) return 'FOG'
  if ([51,53,55,61,63,65,80,81,82].includes(code)) {
    if ([61,80,51].includes(code)) return 'LIGHT_RAIN'
    if ([63,81,53,55].includes(code)) return 'MODERATE_RAIN'
    return 'HEAVY_RAIN'
  }
  if ([71,73,75,85,86].includes(code)) {
    if (code === 71) return 'LIGHT_SNOW'
    if ([73,85].includes(code)) return 'MODERATE_SNOW'
    return 'HEAVY_SNOW'
  }
  if ([95,96,99].includes(code)) return 'STORM_RAIN'
  return 'CLOUDY'
}

onMounted(() => {
  fetchWeather()
  // 每 15 分钟更新一次天气（更频繁的更新）
  setInterval(fetchWeather, 15 * 60 * 1000)
})

// 添加手动刷新功能（点击天气图标刷新）
const handleWeatherClick = () => {
  // 清除缓存，强制重新获取
  try {
    localStorage.removeItem(GEO_CACHE_KEY)
    const keys = Object.keys(localStorage).filter(k => k.startsWith(WEATHER_CACHE_PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
  } catch {}
  weatherData.value = null
  fetchWeather()
}
</script>

<style scoped>
.weather-wrapper {
  display: inline-flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
  /* 不做负外边距偏移，避免与后续图标重叠 */
}

.divider {
  display: block !important;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider);
  flex-shrink: 0;
}

.divider-left {
  margin-left: 8px;
  margin-right: 8px;
}

.divider-right {
  margin-left: 8px;
  margin-right: 8px;
}

/* 完全模仿VPSocialLink的样式 */
.weather-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
  flex-shrink: 0;
}

.weather-link:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.weather-emoji,
.weather-loading {
  font-size: 18px;
  line-height: 18px;
  display: block;
}

.weather-loading {
  opacity: 0.5;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .weather-link {
    width: 20px;
    height: 32px;
    margin: 0 2px;
  }
  
  .weather-emoji,
  .weather-loading {
    font-size: 16px;
    line-height: 16px;
  }
}
</style>

