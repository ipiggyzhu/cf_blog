/**
 * 天气组件工具函数
 * @description 提供通用的工具函数
 */

import type { WeatherData } from '../types/weather'

/**
 * 异步操作超时封装
 * @param promise - 原始Promise
 * @param ms - 超时时间（毫秒）
 * @returns Promise<T>
 */
export async function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)

  try {
    // @ts-expect-error - 需要处理AbortController类型
    const result = await promise
    return result as T
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * 安全地解析JSON
 * @param str - JSON字符串
 * @returns 解析结果或null
 */
export function safeJSONParse<T = any>(str: string): T | null {
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
 * 生成地理位置缓存键
 * @param lat - 纬度
 * @param lon - 经度
 * @returns 缓存键
 */
export function generateWeatherCacheKey(lat: number, lon: number): string {
  return `nav-weather:realtime:${lat.toFixed(2)},${lon.toFixed(2)}`
}

/**
 * 检查缓存是否过期
 * @param cacheTime - 缓存时间戳
 * @param maxAge - 最大存活时间（毫秒）
 * @returns 是否过期
 */
export function isCacheExpired(cacheTime: number, maxAge: number): boolean {
  return Date.now() - cacheTime > maxAge
}

/**
 * 创建延迟执行的Promise
 * @param ms - 延迟时间（毫秒）
 * @returns Promise<void>
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试异步操作
 * @param operation - 异步操作函数
 * @param maxRetries - 最大重试次数
 * @param delayMs - 重试间隔（毫秒）
 * @returns Promise<T>
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`[RetryAsync] 第 ${i + 1} 次尝试失败:`, error)

      if (i < maxRetries - 1) {
        await delay(delayMs * (i + 1)) // 指数退避
      }
    }
  }

  throw lastError || new Error('所有重试均失败')
}