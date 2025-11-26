/**
 * 地理位置组合式函数
 * @description 处理地理位置获取逻辑，包括多种定位策略
 */

import { ref, computed, readonly, type ComputedRef } from 'vue'
import type { LocationData, LocationCache } from '../types/weather'
import {
  CACHE_KEYS,
  CACHE_DURATION,
  TIMEOUTS,
  GEOLOCATION_DEFAULT_OPTIONS
} from '../utils/constants'
import {
  withTimeout,
  safeGetLocalStorage,
  safeSetLocalStorage,
  safeRemoveLocalStorage,
  isServerSide,
  isGeolocationSupported,
  formatTemperature
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

  console.log('[useGeolocation] 🔧 State初始化:', state.value)

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
      // @ts-expect-error - 需要处理权限API类型
      const result = await navigator.permissions.query({ name: 'geolocation' })
      state.value.permissionState = result.state as 'prompt' | 'granted' | 'denied'
      console.log(`[useGeolocation] 定位权限状态: ${state.value.permissionState}`)
    } catch (error) {
      console.warn('[useGeolocation] 获取权限状态失败:', error)
      state.value.permissionState = 'unknown'
    }
  }

  /**
   * 浏览器高精度定位（首选）
   */
  const getBrowserLocation = async (): Promise<LocationData | null> => {
    if (!isSupported.value) {
      console.warn('[useGeolocation] 浏览器不支持地理位置API')
      return null
    }

    return new Promise((resolve) => {
      console.log('[useGeolocation] 正在请求浏览器定位...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          console.log(`[useGeolocation] ✅ 浏览器定位成功: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)
          resolve(location)
        },
        (error) => {
          console.warn('[useGeolocation] 浏览器定位失败:', error.message)
          if (error.code === 1) {
            state.value.permissionState = 'denied'
          }
          resolve(null)
        },
        GEOLOCATION_DEFAULT_OPTIONS
      )
    })
  }

  /**
   * 高德地图逆地理编码
   */
  const getCityNameFromGaode = async (lat: number, lon: number): Promise<string> => {
    try {
      const url = `https://restapi.amap.com/v3/geocode/regeo?key=c3d805f184aa33e876d0d9e22e027b9e&location=${lon},${lat}`
      const response = await withTimeout(fetch(url), TIMEOUTS.GEOCODING_REQUEST)
      const data = await response.json()

      if (data.status === '1' && data.regeocode) {
        const city = data.regeocode.addressComponent.city || data.regeocode.addressComponent.province
        console.log(`[useGeolocation] 🏙️ 获取城市名称成功: ${city}`)
        return city
      }
    } catch (error) {
      console.warn('[useGeolocation] 逆地理编码失败:', error)
    }
    return ''
  }

  /**
   * 高德地图IP定位（国内首选）
   */
  const getLocationFromGaode = async (): Promise<LocationData | null> => {
    try {
      const url = 'https://restapi.amap.com/v3/ip?key=c3d805f184aa33e876d0d9e22e027b9e'
      const response = await withTimeout(fetch(url), TIMEOUTS.DEFAULT_API)
      const data = await response.json()

      if (data.status === '1' && data.rectangle) {
        // 高德返回矩形范围，取中心点
        const coords = data.rectangle.split(';')
        const [lon1, lat1] = coords[0].split(',').map(Number)
        const [lon2, lat2] = coords[1].split(',').map(Number)

        const location: LocationData = {
          latitude: (lat1 + lat2) / 2,
          longitude: (lon1 + lon2) / 2,
          city: data.city || data.province
        }
        console.log(`[useGeolocation] ✓ 高德IP定位成功: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)
        return location
      }
    } catch (error) {
      console.warn('[useGeolocation] 高德IP定位失败:', error)
    }
    return null
  }

  /**
   * 百度地图IP定位（备选）
   */
  const getLocationFromBaidu = async (): Promise<LocationData | null> => {
    try {
      const url = 'https://api.map.baidu.com/location/ip?ak=C93b5178d7a8ebdb830b9b557abce78b&coor=bd09ll'
      const response = await withTimeout(fetch(url), TIMEOUTS.DEFAULT_API)
      const data = await response.json()

      if (data.status === 0 && data.content && data.content.point) {
        const location: LocationData = {
          latitude: data.content.point.y,
          longitude: data.content.point.x,
          city: data.content.address_detail?.city || data.content.address
        }
        console.log(`[useGeolocation] ✓ 百度IP定位成功: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`)
        return location
      }
    } catch (error) {
      console.warn('[useGeolocation] 百度IP定位失败:', error)
    }
    return null
  }

  /**
   * 国际IP定位服务（最后备选）
   */
  const getLocationFromIntl = async (): Promise<LocationData | null> => {
    // ipapi.co
    try {
      const response = await withTimeout(fetch('https://ipapi.co/json/'), TIMEOUTS.DEFAULT_API)
      const data = await response.json()
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city
        }
      }
    } catch (error) {
      console.warn('[useGeolocation] ipapi.co定位失败:', error)
    }

    // ip-api.com
    try {
      const response = await withTimeout(fetch('https://ip-api.com/json/?lang=zh-CN'), TIMEOUTS.DEFAULT_API)
      const data = await response.json()
      if (data.lat && data.lon) {
        return {
          latitude: data.lat,
          longitude: data.lon,
          city: data.city
        }
      }
    } catch (error) {
      console.warn('[useGeolocation] ip-api.com定位失败:', error)
    }

    return null
  }

  /**
   * Cloudflare Pages Functions定位（本地API）
   */
  const getLocationFromCloudflare = async (): Promise<LocationData | null> => {
    try {
      const response = await withTimeout(fetch('/api/geo'), TIMEOUTS.DEFAULT_API)
      const data = await response.json()

      if (data && data.ok && data.latitude && data.longitude) {
        return {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          city: data.city || ''
        }
      }
    } catch (error) {
      console.warn('[useGeolocation] Cloudflare定位不可用:', error)
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
      // 1. 检查缓存
      const cached = geoCache.get()
      if (cached) {
        console.log('[useGeolocation] 📦 使用缓存的位置信息')
        state.value.location = cached
        await checkPermissionStatus()
        return cached
      }

      // 2. 浏览器定位（最精准）
      console.log('[useGeolocation] 🌐 尝试浏览器定位...')
      const browserLocation = await getBrowserLocation()
      if (browserLocation) {
        // 尝试获取城市名称
        try {
          const cityName = await getCityNameFromGaode(browserLocation.latitude, browserLocation.longitude)
          const location = { ...browserLocation, city: cityName }

          state.value.location = location
          geoCache.set(location)
          safeSetLocalStorage(CACHE_KEYS.GEOLOCATION, ({
            time: Date.now(),
            value: location
          } as LocationCache))

          await checkPermissionStatus()
          console.log(`[useGeolocation] ✅ 浏览器定位+逆编码成功，城市: ${cityName || '未知'}`)
          return location
        } catch (error) {
          console.warn('[useGeolocation] 逆地理编码失败，但位置已获取:', error)

          // 即使没有城市名也保存位置
          state.value.location = browserLocation
          geoCache.set(browserLocation)
          safeSetLocalStorage(CACHE_KEYS.GEOLOCATION, ({
            time: Date.now(),
            value: browserLocation
          } as LocationCache))

          await checkPermissionStatus()
          return browserLocation
        }
      }

      // 3. 国内IP定位（高德、百度）
      console.log('[useGeolocation] 📍 尝试国内IP定位...')
      const cnProviders = [
        getLocationFromGaode,
        getLocationFromBaidu
      ]

      for (const provider of cnProviders) {
        try {
          const location = await provider()
          if (location) {
            state.value.location = location
            geoCache.set(location)
            safeSetLocalStorage(CACHE_KEYS.GEOLOCATION, ({
              time: Date.now(),
              value: location
            } as LocationCache))
            console.log(`[useGeolocation] ✓ 国内IP定位成功: ${location.city || '未知城市'}`)
            return location
          }
        } catch (error) {
          console.warn(`[useGeolocation] IP定位提供商失败:`, error)
        }
      }

      // 4. 国际IP定位 + Cloudflare API
      console.log('[useGeolocation] 🌍 尝试国际IP定位...')

      // Cloudflare Pages Functions API（最稳定的备选）
      const cfLocation = await getLocationFromCloudflare()
      if (cfLocation) {
        state.value.location = cfLocation
        geoCache.set(cfLocation)
        safeSetLocalStorage(CACHE_KEYS.GEOLOCATION, ({
          time: Date.now(),
          value: cfLocation
        } as LocationCache))
        console.log('[useGeolocation] ✓ Cloudflare定位成功')
        return cfLocation
      }

      // 国际IP定位（最后备选）
      const intlLocation = await getLocationFromIntl()
      if (intlLocation) {
        state.value.location = intlLocation
        geoCache.set(intlLocation)
        safeSetLocalStorage(CACHE_KEYS.GEOLOCATION, ({
          time: Date.now(),
          value: intlLocation
        } as LocationCache))
        console.log('[useGeolocation] ✓ 国际IP定位成功:', intlLocation)
        console.log('[useGeolocation] 📍 State更新后:', state.value)
        return intlLocation
      }

      // 5. 所有方式都失败
      state.value.isError = true
      state.value.error = '无法获取位置信息'
      console.error('[useGeolocation] ❌ 所有定位方式均失败')
      return null

    } catch (error) {
      state.value.isError = true
      state.value.error = error instanceof Error ? error.message : '位置获取失败'
      console.error('[useGeolocation] 定位失败:', error)
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
    console.log('[useGeolocation] 🔄 刷新位置信息...')
    geoCache.clear()
    safeRemoveLocalStorage(CACHE_KEYS.GEOLOCATION)
    return getCurrentLocation()
  }

  /**
   * 手动清除所有位置相关缓存
   */
  const clearAllCaches = (): void => {
    console.log('[useGeolocation] 🗑️ 清除所有位置缓存')
    geoCache.clear()
    safeRemoveLocalStorage(CACHE_KEYS.GEOLOCATION)
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