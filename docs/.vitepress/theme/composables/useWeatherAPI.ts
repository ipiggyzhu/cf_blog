/**
 * 天气API组合式函数
 * @description 处理天气数据获取和缓存逻辑
 */

import { ref, computed, readonly, type ComputedRef, type Ref } from 'vue'
import type { WeatherData, LocationData } from '../types/weather'
import {
  WMO_TO_SKYCON,
  WEATHER_ICON_MAP,
  WEATHER_DESC_MAP,
  CACHE_KEYS,
  TIMEOUTS
} from '../utils/constants'
import {
  withTimeout,
  getEnvToken,
  isServerSide,
  formatTemperature,
  generateWeatherCacheKey
} from '../utils/helpers'
import { useCache } from './useLocalStorage'

// 天气API状态
export interface WeatherState {
  isLoading: boolean
  isError: boolean
  weather: WeatherData | null
  error: string | null
  lastUpdated: number | null
}

/**
 * 天气API组合式函数
 * @returns 天气状态和操作方法
 */
export function useWeatherAPI() {
  const state = ref<WeatherState>({
    isLoading: false,
    isError: false,
    weather: null,
    error: null,
    lastUpdated: null
  })

  console.log('[useWeatherAPI] 🔧 State初始化:', state.value)

  // 计算属性
  const weatherIcon = computed(() => {
    if (!state.value.weather) return '🌡️'
    return WEATHER_ICON_MAP[state.value.weather.skycon] || '🌡️'
  })

  const temperature = computed(() => {
    if (!state.value.weather) return '--'
    return formatTemperature(state.value.weather.temperature)
  })

  const weatherDescription = computed(() => {
    if (!state.value.weather) return '加载中...'
    return state.value.weather.description
  })

  /**
   * 彩云天气API调用
   */
  const fetchFromCaiyun = async (lat: number, lon: number): Promise<WeatherData | null> => {
    const token = getEnvToken()
    if (!token) {
      console.log('[useWeatherAPI] 彩云Token未配置，使用备选方案')
      return null
    }

    try {
      const url = `https://api.caiyunapp.com/v2.6/${token}/${lon},${lat}/realtime`
      const response = await withTimeout(fetch(url), TIMEOUTS.WEATHER_REQUEST)
      const data = await response.json()

      if (data.status === 'ok' && data.result && data.result.realtime) {
        const realtime = data.result.realtime
        return {
          temperature: realtime.temperature,
          skycon: realtime.skycon,
          description: WEATHER_DESC_MAP[realtime.skycon] || '未知'
        }
      }
      throw new Error('彩云天气API返回数据格式异常')
    } catch (error) {
      console.warn('[useWeatherAPI] 彩云天气获取失败:', error)
      return null
    }
  }

  /**
   * Open-Meteo天气API调用（免费备选）
   */
  const fetchFromOpenMeteo = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
      const response = await withTimeout(fetch(url), TIMEOUTS.WEATHER_REQUEST)
      const data = await response.json()

      const current = data.current
      if (!current || !current.temperature_2m || current.weather_code === undefined) {
        throw new Error('Open-Meteo返回数据异常')
      }

      const skycon = wmoToSkycon(Number(current.weather_code))
      return {
        temperature: Number(current.temperature_2m),
        skycon: skycon,
        description: WEATHER_DESC_MAP[skycon] || '天气'
      }
    } catch (error) {
      console.warn('[useWeatherAPI] Open-Meteo获取失败:', error)
      return null
    }
  }

  /**
   * WMO天气代码转彩云天气代码
   */
  const wmoToSkycon = (code: number): string => {
    return WMO_TO_SKYCON[code] || 'CLOUDY'
  }

  /**
   * 获取天气信息
   */
  const fetchWeather = async (location: LocationData): Promise<WeatherData | null> => {
    if (isServerSide()) {
      return null
    }

    state.value.isLoading = true
    state.value.isError = false
    state.value.error = null

    try {
      // 生成缓存键
      const cacheKey = generateWeatherCacheKey(location.latitude, location.longitude)
      const weatherCache = useCache<WeatherData>(cacheKey, 10 * 60 * 1000) // 10分钟缓存

      // 检查缓存
      const cachedWeather = weatherCache.get()
      if (cachedWeather) {
        console.log('[useWeatherAPI] 📦 使用缓存的天气数据:', cachedWeather)
        state.value.weather = cachedWeather
        state.value.lastUpdated = Date.now()
        console.log('[useWeatherAPI] 🌤️ 缓存State更新后:', state.value)
        return cachedWeather
      }

      // 优先尝试彩云天气（配置token的情况下）
      console.log('[useWeatherAPI] 🌤️ 尝试彩云天气...')
      let weatherData = await fetchFromCaiyun(location.latitude, location.longitude)

      // 彩云失败则使用Open-Meteo作为备选
      if (!weatherData) {
        console.log('[useWeatherAPI] 🌤️ 彩云不可用，尝试Open-Meteo...')
        weatherData = await fetchFromOpenMeteo(location.latitude, location.longitude)
      }

      // 所有API都失败
      if (!weatherData) {
        throw new Error('所有天气服务均不可用')
      }

      // 缓存结果
      weatherCache.set(weatherData)
      state.value.weather = weatherData
      state.value.lastUpdated = Date.now()

      console.log('[useWeatherAPI] ✅ 天气获取成功: ${weatherData.description} ${formatTemperature(weatherData.temperature)}°C')
      console.log('[useWeatherAPI] 🌤️ State更新后:', state.value)
      return weatherData

    } catch (error) {
      state.value.isError = true
      state.value.error = error instanceof Error ? error.message : '天气获取失败'
      console.error('[useWeatherAPI] ❌ 获取天气失败:', error)

      // 保底数据
      const fallbackWeather: WeatherData = {
        temperature: 0,
        skycon: 'CLOUDY',
        description: '天气'
      }
      state.value.weather = fallbackWeather
      console.log('[useWeatherAPI] ⚠️ 使用保底数据:', state.value)
      return fallbackWeather

    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * 刷新天气数据
   */
  const refreshWeather = async (location: LocationData): Promise<WeatherData | null> => {
    console.log('[useWeatherAPI] 🔄 刷新天气数据...')
    // 清除相关缓存
    const cacheKey = generateWeatherCacheKey(location.latitude, location.longitude)
    // 这里可以实现缓存清除逻辑
    return fetchWeather(location)
  }

  /**
   * 清除天气缓存
   */
  const clearWeatherCache = (): void => {
    console.log('[useWeatherAPI] 🗑️ 清除所有天气缓存')
    // 可以遍历所有以天气前缀开头的缓存键并清除
    // 这个实现需要根据具体的localStorage管理策略来调整
  }

  /**
   * 获取工具性方法
   */
  const getIconForSkycon = (skycon: string): string => {
    return WEATHER_ICON_MAP[skycon] || '🌡️'
  }

  const getDescriptionForSkycon = (skycon: string): string => {
    return WEATHER_DESC_MAP[skycon] || '未知'
  }

  const getTooltipText = (location: LocationData, weather: WeatherData | null): string => {
    if (!weather) return '加载天气中...'

    const city = location.city ? `${location.city} · ` : ''
    const clickTip = '\n点击刷新位置'
    return `${city}${getDescriptionForSkycon(weather.skycon)} ${formatTemperature(weather.temperature)}°C${clickTip}`
  }

  return {
    // 状态
    state: readonly(state),
    weatherIcon,
    temperature,
    weatherDescription,

    // 方法
    fetchWeather,
    refreshWeather,
    clearWeatherCache,
    getIconForSkycon,
    getDescriptionForSkycon,
    getTooltipText
  }
}