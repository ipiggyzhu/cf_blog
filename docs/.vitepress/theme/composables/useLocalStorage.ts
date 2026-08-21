/**
 * 本地存储组合式函数
 * @description 提供类型安全的 localStorage 缓存操作
 */

import {
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
  isServerSide
} from '../utils/helpers'

/**
 * 创建带过期时间的本地缓存
 * @param key - 缓存键名
 * @param maxAge - 最大缓存时间（毫秒）
 * @returns 缓存操作对象
 */
export function useCache<T>(key: string, maxAge: number) {
  const cacheKey = `${key}:cache`

  const get = (): T | null => {
    const cached = safeGetLocalStorage<{ time: number; value: T }>(cacheKey)
    if (!cached || Date.now() - cached.time > maxAge) {
      return null
    }
    return cached.value
  }

  const set = (value: T): void => {
    safeSetLocalStorage(cacheKey, { time: Date.now(), value })
  }

  const clear = (): void => {
    safeRemoveLocalStorage(cacheKey)
  }

  return { get, set, clear }
}

/**
 * 批量清除指定前缀的缓存
 * @param prefix - 缓存键前缀
 */
export function clearCacheByPrefix(prefix: string): void {
  if (isServerSide()) return

  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    keys.forEach(key => safeRemoveLocalStorage(key))
    console.log(`[useLocalStorage] 清除了 ${keys.length} 个匹配的缓存项`)
  } catch (error) {
    console.warn('[useLocalStorage] 批量清除缓存失败:', error)
  }
}
