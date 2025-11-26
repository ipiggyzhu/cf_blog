/**
 * 天气组件常量定义
 * @description 定义天气相关的常量配置
 */

import type { WeatherProviderConfig, GeolocationProviderConfig, WMOMapping } from '../types/weather'

// 缓存键名常量
export const CACHE_KEYS = {
  GEOLOCATION: 'nav-weather:geo',
  WEATHER_PREFIX: 'nav-weather:realtime:'
} as const

// 缓存时间常量（毫秒）
export const CACHE_DURATION = {
  LOCATION: 5 * 60 * 1000,      // 5分钟
  WEATHER: 10 * 60 * 1000,      // 10分钟
  LOCATION_PERMISSION: 24 * 60 * 60 * 1000  // 24小时
} as const

// 超时时间常量（毫秒）
export const TIMEOUTS = {
  DEFAULT_API: 5000,            // 默认API超时
  LOCATION_REQUEST: 20000,      // 浏览器定位超时
  WEATHER_REQUEST: 5000,        // 天气API超时
  GEOCODING_REQUEST: 5000       // 逆地理编码超时
} as const

// 天气图标映射 - 彩云天气代码到emoji
export const WEATHER_ICON_MAP: Record<string, string> = {
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

// 天气描述映射 - 彩云天气代码到中文
export const WEATHER_DESC_MAP: Record<string, string> = {
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

// WMO代码到彩云天气代码映射
export const WMO_TO_SKYCON: WMOMapping = {
  0: 'CLEAR_DAY',       // 晴朗
  1: 'PARTLY_CLOUDY_DAY', // 大部分晴朗
  2: 'PARTLY_CLOUDY_DAY', // 部分晴朗
  3: 'CLOUDY',          // 阴天
  45: 'FOG',            // 雾
  48: 'FOG',            // 沉积雾
  51: 'LIGHT_RAIN',     // 轻微小雨
  53: 'MODERATE_RAIN',  // 中度小雨
  55: 'MODERATE_RAIN',  // 密集小雨
  61: 'LIGHT_RAIN',     // 轻微降雨
  63: 'MODERATE_RAIN',  // 中度降雨
  65: 'HEAVY_RAIN',     // 大雨
  80: 'LIGHT_RAIN',     // 轻微降雨阵雨
  81: 'MODERATE_RAIN',  // 中度降雨阵雨
  82: 'HEAVY_RAIN',     // 大雨阵雨
  71: 'LIGHT_SNOW',     // 轻微降雪
  73: 'MODERATE_SNOW',  // 中度降雪
  75: 'HEAVY_SNOW',     // 大雪
  85: 'MODERATE_SNOW',  // 轻度降雪阵雨
  86: 'HEAVY_SNOW',     // 大雪阵雨
  95: 'STORM_RAIN',     // 轻微或中度雷暴
  96: 'STORM_RAIN',     // 有轻微冰雹的雷暴
  99: 'STORM_RAIN'      // 有重度冰雹的雷暴
}

// 定位选项配置
export const GEOLOCATION_DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: TIMEOUTS.LOCATION_REQUEST,
  maximumAge: 0
}

// 更新间隔（毫秒）
export const UPDATE_INTERVALS = {
  WEATHER_REFRESH: 15 * 60 * 1000   // 15分钟
}

// 位置服务提供商配置
export const GEOLOCATION_PROVIDERS: GeolocationProviderConfig[] = [
  {
    name: 'geolocation-api',
    baseURL: 'browser-api',
    timeout: TIMEOUTS.LOCATION_REQUEST,
    maxRetries: 1
  }
]

// 天气服务提供商配置
export const WEATHER_PROVIDERS: WeatherProviderConfig[] = [
  {
    name: 'caiyun',
    baseURL: 'https://api.caiyunapp.com/v2.6',
    timeout: TIMEOUTS.WEATHER_REQUEST,
    requiresToken: true
  },
  {
    name: 'open-meteo',
    baseURL: 'https://api.open-meteo.com/v1',
    timeout: TIMEOUTS.WEATHER_REQUEST,
    requiresToken: false
  }
]