/**
 * 本地存储组合式函数
 * @description 提供类型安全的localStorage操作
 */

import { ref, watch, type Ref } from 'vue'
import {
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
  isServerSide
} from '../utils/helpers'

/**
 * 创建响应式的localStorage引用
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @returns 响应式引用
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = isServerSide() ? null : safeGetLocalStorage<T>(key)
  const data = ref<T>(stored !== null ? stored : defaultValue)

  // 监听变化并自动保存
  watch(data, (newValue) => {
    safeSetLocalStorage(key, newValue)
  }, { immediate: true })

  return data
}

/**
 * 创建带扩展功能的本地存储
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @returns 带扩展方法的响应式引用
 */
export function useLocalStorageWithActions<T>(key: string, defaultValue: T) {
  const data = useLocalStorage(key, defaultValue)

  const remove = () => {
    safeRemoveLocalStorage(key)
    data.value = defaultValue
  }

  const refresh = () => {
    const stored = safeGetLocalStorage<T>(key)
    if (stored !== null) {
      data.value = stored
    }
  }

  return {
    ...data,
    remove,
    refresh
  }
}

/**
 * 创建带过期时间的本地缓存
 * @param key - 缓存键名
 * @param maxAge - 最大缓存时间（毫秒）
 * @returns 缓存操作对象
 */
export function useCache<T>(key: string, maxAge: number) {
  const cacheKey = `${key}:cache`
  const dataKey = `${key}:data`

  const getCache = (): { time: number; value: T } | null => {
    return safeGetLocalStorage<{ time: number; value: T }>(cacheKey)
  }

  const setCache = (value: T, time = Date.now()) => {
    safeSetLocalStorage(cacheKey, { time, value })
  }

  const clearCache = () => {
    safeRemoveLocalStorage(cacheKey)
    safeRemoveLocalStorage(dataKey)
  }

  const isExpired = (cacheTime: number): boolean => {
    return Date.now() - cacheTime > maxAge
  }

  const get = (): T | null => {
    const cached = getCache()
    if (!cached || isExpired(cached.time)) {
      return null
    }
    return cached.value
  }

  const set = (value: T): void => {
    setCache(value)
  }

  return {
    get,
    set,
    clear: clearCache,
    isExpired
  }
}

/**
 * 批量清除指定前缀的缓存
 * @param prefix - 缓存键前缀
 */
export function clearCacheByPrefix(prefix: string): void {
  if (isServerSide()) return

  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix))
    keys.forEach(key => {
      safeRemoveLocalStorage(key)
    })
    console.log(`[useLocalStorage] 清除了 ${keys.length} 个匹配的缓存项`)
  } catch (error) {
    console.warn('[useLocalStorage] 批量清除缓存失败:', error)
  }
}

/**
 * 获取指定前缀的所有缓存键
 * @param prefix - 缓存键前缀
 * @returns 匹配的缓存键数组
 */
export function getCacheKeysByPrefix(prefix: string): string[] {
  if (isServerSide()) return []

  try {
    return Object.keys(localStorage).filter(k => k.startsWith(prefix))
  } catch (error) {
    console.warn('[useLocalStorage] 获取缓存键失败:', error)
    return []
  }
}