/**
 * 天气组件工具函数
 * @description 提供通用的工具函数
 */

import { CACHE_KEYS } from './constants'

/**
 * 开发环境日志工具
 * 仅在开发环境输出日志，生产环境静默
 */
export const devLog = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args)
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(...args)
    }
  },
  error: (...args: any[]) => {
    // 错误日志始终输出
    console.error(...args)
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info(...args)
    }
  }
}

/**
 * 带超时的 JSON 请求，超时会真正 abort 底层请求
 *
 * 这是浏览器侧唯一的超时约定。不要再写 `Promise.race([fetch(url), timeout])`——
 * 那种写法只是让调用方提前拿到 reject，底层请求仍在跑，连接不会被释放。
 *
 * @param url - 请求地址
 * @param ms - 超时时间（毫秒）
 * @param init - fetch 配置
 * @returns 解析后的 JSON
 */
export async function fetchJsonWithTimeout<T = any>(
  url: string,
  ms = 5000,
  init: RequestInit = {}
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ms)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      ...init,
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as T
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 安全地解析JSON（仅本文件内部使用）
 * @param str - JSON字符串
 * @returns 解析结果或null
 */
function safeJSONParse<T = any>(str: string): T | null {
  try {
    return JSON.parse(str) as T
  } catch {
    return null
  }
}

/**
 * 安全地设置localStorage
 * @param key - 存储键
 * @param value - 存储值
 */
export function safeSetLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[SafeLocalStorage] 存储失败: ${key}`, error)
  }
}

/**
 * 安全地获取localStorage
 * @param key - 存储键
 * @returns 获取值或null
 */
export function safeGetLocalStorage<T = any>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? safeJSONParse<T>(item) : null
  } catch (error) {
    console.warn(`[SafeLocalStorage] 获取失败: ${key}`, error)
    return null
  }
}

/**
 * 安全地移除localStorage
 * @param key - 存储键
 */
export function safeRemoveLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`[SafeLocalStorage] 移除失败: ${key}`, error)
  }
}

/**
 * 获取环境变量中的Token
 * @param envKey - 环境变量键名
 * @param windowKey - window对象键名
 * @returns Token字符串
 */
export function getEnvToken(envKey = 'VITE_CAIYUN_TOKEN', windowKey = '__CAIYUN_TOKEN__'): string {
  // @ts-expect-error - 需要处理import.meta.env类型
  return (import.meta.env && import.meta.env[envKey]) || (typeof window !== 'undefined' && (window as any)[windowKey]) || ''
}

/**
 * 检查是否运行在服务器端
 * @returns 是否SSR环境
 */
export function isServerSide(): boolean {
  return typeof window === 'undefined'
}

/**
 * 检查是否支持Geolocation API
 * @returns 是否支持
 */
export function isGeolocationSupported(): boolean {
  return !isServerSide() && 'geolocation' in navigator
}

/**
 * 格式化温度（保留整数）
 * @param temperature - 原始温度
 * @returns 格式化后的温度
 */
export function formatTemperature(temperature: number): number {
  return Math.round(temperature)
}

/**
 * 生成天气缓存键
 * @param lat - 纬度
 * @param lon - 经度
 * @returns 缓存键
 */
export function generateWeatherCacheKey(lat: number, lon: number): string {
  return `${CACHE_KEYS.WEATHER_PREFIX}${lat.toFixed(2)},${lon.toFixed(2)}`
}
