<template>
  <div
    class="weather-wrapper"
    @mouseenter="showTooltip = true"
    @mouseleave="hideTooltipWithDelay"
  >
    <div class="divider divider-left"></div>
    <button
      ref="weatherButton"
      class="VPSocialLink no-icon weather-link"
      :title="tooltipText"
      @click.prevent="handleWeatherClick"
      type="button"
    >
      <WeatherIcon
        :icon="weatherIcon"
        :is-loading="geolocation.state.isLoading || weatherAPI.state.isLoading"
        :has-error="geolocation.state.isError || weatherAPI.state.isError"
      />
    </button>
    <div class="divider divider-right"></div>

    <!-- 悬浮提示框 - 简化版，直接显示简单信息 -->
    <div
      v-if="showTooltip"
      class="simple-tooltip"
      @mouseenter="clearHideTimeout"
      @mouseleave="hideTooltipWithDelay"
    >
      <div class="tooltip-content">
        <!-- 加载状态 -->
        <div class="weather-info" v-if="isLoading">
          <span class="loading">获取位置和天气中...</span>
        </div>
        <!-- 正常状态 -->
        <div class="weather-info" v-else-if="hasLocation && hasWeather">
          <span v-if="geolocation.state.location?.city" class="city">{{ geolocation.state.location.city }} · </span>
          <span class="description">{{ weatherAPI.state.weather?.description }}</span>
          <span class="temperature">{{ Math.round(weatherAPI.state.weather?.temperature || 0) }}°C</span>
        </div>
        <!-- 错误状态 -->
        <div class="weather-info" v-else-if="hasError">
          <span class="error">点击重新获取位置</span>
        </div>
        <!-- 无数据状态 -->
        <div class="weather-info" v-else>
          <span class="loading">准备获取位置...</span>
        </div>

        <!-- 精准定位提示 -->
        <div class="hint" v-if="!geolocation.isPreciseLocation && !hasError && hasLocation && hasWeather && !isLoading">
          点击允许浏览器定位获得更精准位置
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import WeatherIcon from './nav-weather/WeatherIcon.vue'
import { useGeolocation } from '../composables/useGeolocation'
import { useWeatherAPI } from '../composables/useWeatherAPI'
import { UPDATE_INTERVALS } from '../utils/constants'

// 状态
const showTooltip = ref(false)
let refreshInterval: number | null = null
let tooltipTimeout: number | null = null
const weatherButton = ref<HTMLElement | null>(null)

// 组合式函数
console.log('[NavWeather] 🚀 初始化组合式函数...')
const geolocation = useGeolocation()
const weatherAPI = useWeatherAPI()
console.log('[NavWeather] ✅ 组合式函数初始化完成:', {
  geolocation: !!geolocation,
  weatherAPI: !!weatherAPI
})

// 计算属性
const weatherIcon = computed(() => {
  return weatherAPI.weatherIcon.value
})

// 调试计算属性
const hasLocation = computed(() => {
  const result = !!geolocation.state.location
  console.log('[NavWeather] 🔍 hasLocation计算:', {
    location: geolocation.state.location,
    result
  })
  return result
})

const hasWeather = computed(() => {
  const result = !!weatherAPI.state.weather
  console.log('[NavWeather] 🔍 hasWeather计算:', {
    weather: weatherAPI.state.weather,
    result
  })
  return result
})

const isLoading = computed(() => {
  const result = geolocation.state.isLoading || weatherAPI.state.isLoading
  console.log('[NavWeather] 🔍 isLoading计算:', {
    geoLoading: geolocation.state.isLoading,
    weatherLoading: weatherAPI.state.isLoading,
    result
  })
  return result
})

const hasError = computed(() => {
  const result = geolocation.state.isError || weatherAPI.state.isError
  console.log('[NavWeather] 🔍 hasError计算:', {
    geoError: geolocation.state.isError,
    weatherError: weatherAPI.state.isError,
    result
  })
  return result
})

const tooltipText = computed(() => {
  if (geolocation.state.isError || weatherAPI.state.isError) {
    return '点击重新获取位置'
  }
  return weatherAPI.getTooltipText(
    geolocation.state.location!,
    weatherAPI.state.weather
  )
})

const errorText = computed(() => {
  if (geolocation.state.error) return geolocation.state.error
  if (weatherAPI.state.error) return weatherAPI.state.error
  return '未知错误'
})

/**
 * 清除隐藏定时器
 */
const clearHideTimeout = () => {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
    tooltipTimeout = null
  }
}

/**
 * 隐藏提示框（带延迟）
 */
const hideTooltipWithDelay = () => {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
  }

  tooltipTimeout = setTimeout(() => {
    showTooltip.value = false
    tooltipTimeout = null
  }, 200) // 200ms 延迟，避免鼠标快速移动时闪烁
}

/**
 * 初始化流程
 */
const initializeWeather = async () => {
  console.log('[NavWeather] 🔧 初始化天气组件...')

  // 1. 获取位置
  const location = await geolocation.getCurrentLocation()

  if (!location) {
    console.warn('[NavWeather] ⚠️ 无法获取位置信息')
    return
  }

  // 2. 根据位置获取天气
  await weatherAPI.fetchWeather(location)
}

/**
 * 刷新天气（点击触发）
 */
const handleWeatherClick = async () => {
  console.log('[NavWeather] 🔄 手动刷新天气...')

  // 显示加载状态
  geolocation.state.isLoading = true
  weatherAPI.state.isLoading = true

  try {
    // 1. 刷新位置
    await geolocation.refreshLocation()

    // 2. 如果有新位置，刷新天气
    if (geolocation.state.location) {
      await weatherAPI.refreshWeather(geolocation.state.location)
    }

    // 3. 显示成功提示
    setTimeout(() => {
      console.log('[NavWeather] ✅ 刷新完成')
    }, 300)

  } catch (error) {
    console.error('[NavWeather] ❌ 刷新失败:', error)
  } finally {
    geolocation.state.isLoading = false
    weatherAPI.state.isLoading = false
  }
}

/**
 * 显示权限提示
 */
const showPermissionHints = () => {
  if (!geolocation.isSupported.value) return

  // 延迟执行，避免控制台信息混乱
  setTimeout(() => {
    const permissionState = geolocation.state.permissionState

    if (permissionState === 'prompt') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🌤️  天气组件提示')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💡 当前使用 IP 定位（精度较低，误差可达几十公里）')
      console.log('✨ 点击天气图标并允许浏览器定位，可获得精准位置')
      console.log('📍 浏览器定位精度：< 100 米')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else if (permissionState === 'denied') {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('⚠️  天气组件警告')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.warn('❌ 浏览器定位权限被拒绝')
      console.warn('📍 当前使用 IP 定位（精度低，可能不准确）')
      console.log('💡 如需精准定位，请按以下步骤操作：')
      console.log('   1. 点击地址栏左侧的 🔒 图标')
      console.log('   2. 找到"位置"权限，选择"允许"')
      console.log('   3. 刷新页面或点击天气图标')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else if (permissionState === 'granted') {
      console.log('[NavWeather] ✅ 浏览器定位权限已授权，将使用精准定位')
    }
  }, 1000)
}

/**
 * 设置自动更新
 */
const setupAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }

  refreshInterval = setInterval(async () => {
    if (geolocation.state.location && !geolocation.state.isLoading && !weatherAPI.state.isLoading) {
      console.log('[NavWeather] 🔄 自动更新天气...')
      await weatherAPI.fetchWeather(geolocation.state.location)
    }
  }, UPDATE_INTERVALS.WEATHER_REFRESH)
}

// 生命周期
onMounted(() => {
  console.log('[NavWeather] 🚀 天气组件挂载，开始初始化...')

  // 先设置状态监听器
  console.log('[NavWeather] 🔧 设置状态监听器...')
  watch([hasLocation, hasWeather, isLoading, hasError], ([newHasLocation, newHasWeather, newIsLoading, newHasError]) => {
    console.log('[NavWeather] 🔍 状态变化:', {
      hasLocation: newHasLocation,
      hasWeather: newHasWeather,
      isLoading: newIsLoading,
      hasError: newHasError,
      weatherIcon: weatherIcon.value,
      timestamp: new Date().toISOString()
    })
  }, { immediate: true })
  console.log('[NavWeather] ✅ 状态监听器设置完成')

  // 异步初始化，等待完成后再检查状态
  const init = async () => {
    try {
      await initializeWeather()
      showPermissionHints()
      setupAutoRefresh()

      // 等待一个微任务确保state更新完成
      await nextTick()

      console.log('[NavWeather] 📊 初始化完成后状态检查:', {
        hasLocation: hasLocation.value,
        hasWeather: hasWeather.value,
        isLoading: isLoading.value,
        hasError: hasError.value,
        weatherIcon: weatherIcon.value,
        geoState: geolocation.state,
        weatherState: weatherAPI.state
      })
    } catch (error) {
      console.error('[NavWeather] ❌ 初始化失败:', error)
    }
  }

  init()
})

onUnmounted(() => {
  console.log('[NavWeather] 🛑 天气组件卸载，清理资源...')
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

// 监听位置变化，自动更新天气
watch(
  () => geolocation.state.location,
  async (newLocation) => {
    if (newLocation && !geolocation.state.isLoading) {
      console.log('[NavWeather] 📍 位置更新，重新获取天气...')
      await weatherAPI.fetchWeather(newLocation)
    }
  }
)
</script>

<style scoped>
.weather-wrapper {
  display: inline-flex;
  align-items: center;
  height: 100%;
  margin-left: 8px;
  position: relative; /* 为提示框定位 */
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
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
}

.weather-link:hover {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.weather-link:active {
  transform: scale(0.95);
}

.weather-tooltip-container {
  position: fixed; /* 使用fixed定位避免层级问题 */
  z-index: 9999; /* 最高层级 */
  pointer-events: none; /* 不干扰鼠标事件 */
}

/* 简化版提示框样式 */
.simple-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  z-index: 9999;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.weather-info .city {
  font-weight: 500;
  color: var(--vp-c-brand);
}

.weather-info .description {
  color: var(--vp-c-text-2);
}

.weather-info .temperature {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.loading {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.error {
  font-size: 12px;
  color: var(--vp-c-danger);
  font-weight: 500;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .weather-link {
    width: 20px;
    height: 32px;
    margin: 0 2px;
  }

  .divider {
    height: 20px;
  }
}

/* 深色主题适配 */
:deep(.dark) .weather-tooltip-content {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
}
</style>