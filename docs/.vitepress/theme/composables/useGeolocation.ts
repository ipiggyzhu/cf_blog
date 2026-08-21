/**
 * 地理位置组合式函数
 * @description 处理地理位置获取逻辑，按 浏览器定位 → Cloudflare 边缘 → 国际 IP 的顺序降级
 *
 * 说明：这里刻意不接入高德/百度 IP 定位——它们的 web 服务 key 必须明文写进前端，
 * 放在公开仓库里等于把配额送人；且返回的是 GCJ-02 / BD-09 加密坐标，
 * 直接喂给天气 API 会有几百米偏差。Cloudflare 边缘定位对国内访客同样有效。
 */

import { ref, computed, readonly } from 'vue'
import type { LocationData } from '../types/weather'
import {
  CACHE_KEYS,
  CACHE_DURATION,
  TIMEOUTS,
  GEOLOCATION_DEFAULT_OPTIONS
} from '../utils/constants'
import {
  fetchJsonWithTimeout,
  isServerSide,
  isGeolocationSupported,
  devLog
} from '../utils/helpers'
import { useCache } from './useLocalStorage'

// 地理位置状态
export interface GeolocationState {
  isLoading: boolean
  isError: boolean
  location: LocationData | null
  error: string | null
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown'
}

/**
 * 地理位置组合式函数
 * @returns 地理位置状态和操作方法
 */
export function useGeolocation() {
  const state = ref<GeolocationState>({
    isLoading: false,
    isError: false,
    location: null,
    error: null,
    permissionState: 'unknown'
  })

  // 位置缓存
  const geoCache = useCache<LocationData>(CACHE_KEYS.GEOLOCATION, CACHE_DURATION.LOCATION)

  // 计算属性：是否支持地理位置API
  const isSupported = computed(() => isGeolocationSupported())

  // 计算属性：是否是精准定位（浏览器定位）
  const isPreciseLocation = computed(() => {
    return state.value.permissionState === 'granted'
  })

  /**
   * 检查浏览器定位权限状态
   */
  const checkPermissionStatus = async (): Promise<void> => {
    if (!isSupported.value) {
      state.value.permissionState = 'unknown'
      return
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      state.value.permissionState = result.state as 'prompt' | 'granted' | 'denied'
      devLog.log(`[useGeolocation] 定位权限状态: ${state.value.permissionState}`)
    } catch (error) {
      devLog.warn('[useGeolocation] 获取权限状态失败:', error)
      state.value.permissionState = 'unknown'
    }
  }

  /**
   * 记录定位结果：写入状态与缓存
   */
  const commitLocation = (location: LocationData, source: string): LocationData => {
    state.value.location = location
    geoCache.set(location)
    devLog.log(`[useGeolocation] ✓ ${source}定位成功: ${location.city || '未知城市'}`)
    return location
  }

  /**
   * 浏览器高精度定位（首选）
   */
  const getBrowserLocation = async (): Promise<LocationData | null> => {
    if (!isSupported.value) {
      devLog.warn('[useGeolocation] 浏览器不支持地理位置API')
      return null
    }

    return new Promise((resolve) => {
      devLog.log('[useGeolocation] 正在请求浏览器定位...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          devLog.warn('[useGeolocation] 浏览器定位失败:', error.message)
          if (error.code === error.PERMISSION_DENIED) {
            state.value.permissionState = 'denied'
          }
          resolve(null)
        },
        GEOLOCATION_DEFAULT_OPTIONS
      )
    })
  }

  /**
   * Cloudflare Pages Functions 定位（边缘地理信息，零额外依赖）
   */
  const getLocationFromCloudflare = async (): Promise<LocationData | null> => {
    try {
      const data = await fetchJsonWithTimeout<any>('/api/geo', TIMEOUTS.DEFAULT_API)
      if (data?.ok && data.latitude !== null && data.longitude !== null) {
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city || ''
        }
      }
    } catch (error) {
      devLog.warn('[useGeolocation] Cloudflare定位不可用:', error)
    }
    return null
  }

  /**
   * 国际IP定位服务（最后备选）
   */
  const getLocationFromIntl = async (): Promise<LocationData | null> => {
    try {
      const data = await fetchJsonWithTimeout<any>('https://ipapi.co/json/', TIMEOUTS.DEFAULT_API)
      if (data.latitude && data.longitude) {
        return { latitude: data.latitude, longitude: data.longitude, city: data.city }
      }
    } catch (error) {
      devLog.warn('[useGeolocation] ipapi.co定位失败:', error)
    }

    try {
      const data = await fetchJsonWithTimeout<any>(
        'https://ip-api.com/json/?lang=zh-CN',
        TIMEOUTS.DEFAULT_API
      )
      if (data.lat && data.lon) {
        return { latitude: data.lat, longitude: data.lon, city: data.city }
      }
    } catch (error) {
      devLog.warn('[useGeolocation] ip-api.com定位失败:', error)
    }

    return null
  }

  /**
   * 获取位置信息（多策略后备）
   */
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    if (isServerSide()) {
      return null
    }

    state.value.isLoading = true
    state.value.isError = false
    state.value.error = null

    try {
      // 1. 命中缓存直接返回
      const cached = geoCache.get()
      if (cached) {
        devLog.log('[useGeolocation] 📦 使用缓存的位置信息')
        state.value.location = cached
        return cached
      }

      // 2. 浏览器定位（最精准），城市名由 /api/geo 补齐
      devLog.log('[useGeolocation] 🌐 尝试浏览器定位...')
      const browserLocation = await getBrowserLocation()
      if (browserLocation) {
        const edgeLocation = await getLocationFromCloudflare()
        return commitLocation(
          { ...browserLocation, city: edgeLocation?.city || '' },
          '浏览器'
        )
      }

      // 3. Cloudflare 边缘定位
      devLog.log('[useGeolocation] 📍 尝试 Cloudflare 边缘定位...')
      const cfLocation = await getLocationFromCloudflare()
      if (cfLocation) return commitLocation(cfLocation, 'Cloudflare')

      // 4. 国际 IP 定位（最后备选）
      devLog.log('[useGeolocation] 🌍 尝试国际IP定位...')
      const intlLocation = await getLocationFromIntl()
      if (intlLocation) return commitLocation(intlLocation, '国际IP')

      // 5. 所有方式都失败
      state.value.isError = true
      state.value.error = '无法获取位置信息'
      devLog.error('[useGeolocation] ❌ 所有定位方式均失败')
      return null
    } catch (error) {
      state.value.isError = true
      state.value.error = error instanceof Error ? error.message : '位置获取失败'
      devLog.error('[useGeolocation] 定位失败:', error)
      return null
    } finally {
      state.value.isLoading = false
      await checkPermissionStatus()
    }
  }

  /**
   * 清除位置缓存并重新获取
   */
  const refreshLocation = async (): Promise<LocationData | null> => {
    devLog.log('[useGeolocation] 🔄 刷新位置信息...')
    geoCache.clear()
    return getCurrentLocation()
  }

  /**
   * 手动清除位置缓存
   */
  const clearAllCaches = (): void => {
    devLog.log('[useGeolocation] 🗑️ 清除位置缓存')
    geoCache.clear()
  }

  return {
    // 状态
    state: readonly(state),
    isSupported,
    isPreciseLocation,

    // 方法
    getCurrentLocation,
    refreshLocation,
    clearAllCaches,
    checkPermissionStatus
  }
}
