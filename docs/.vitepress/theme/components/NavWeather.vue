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
        :is-loading="uiState.isLoading"
        :has-error="uiState.hasError"
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
        <div class="weather-info" v-if="uiState.isLoading">
          <span class="loading">获取位置和天气中...</span>
        </div>
        <!-- 正常状态 -->
        <div class="weather-info" v-else-if="uiState.hasLocation && uiState.hasWeather">
          <span v-if="geolocation.state.value.location?.city" class="city">{{ geolocation.state.value.location.city }} · </span>
          <span class="description">{{ weatherAPI.state.value.weather?.description }}</span>
          <span class="temperature">{{ Math.round(weatherAPI.state.value.weather?.temperature || 0) }}°C</span>
        </div>
        <!-- 错误状态 -->
        <div class="weather-info" v-else-if="uiState.hasError">
          <span class="error">点击重新获取位置</span>
        </div>
        <!-- 无数据状态 -->
        <div class="weather-info" v-else>
          <span class="loading">准备获取位置...</span>
        </div>

        <!-- 精准定位提示 -->
        <div class="hint" v-if="!geolocation.isPreciseLocation && !uiState.hasError && uiState.hasLocation && uiState.hasWeather && !uiState.isLoading">
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
import { devLog } from '../utils/helpers'

// 状态
const showTooltip = ref(false)
let refreshInterval: number | null = null
let tooltipTimeout: number | null = null
const weatherButton = ref<HTMLElement | null>(null)

// 组合式函数
devLog.log('[NavWeather] 🚀 初始化组合式函数...')
const geolocation = useGeolocation()
const weatherAPI = useWeatherAPI()
devLog.log('[NavWeather] ✅ 组合式函数初始化完成')

// 合并后的 UI 状态计算属性（优化性能）
const uiState = computed(() => ({
  hasLocation: !!geolocation.state.value.location,
  hasWeather: !!weatherAPI.state.value.weather,
  isLoading: geolocation.state.value.isLoading || weatherAPI.state.value.isLoading,
  hasError: geolocation.state.value.isError || weatherAPI.state.value.isError
}))

// 天气图标
const weatherIcon = computed(() => weatherAPI.weatherIcon.value)

// 提示文本
const tooltipText = computed(() => {
  if (uiState.value.hasError) {
    return '点击重新获取位置'
  }
  // 确保 location 存在才调用 getTooltipText
  if (!geolocation.state.value.location) {
    return '获取位置中...'
  }
  return weatherAPI.getTooltipText(
    geolocation.state.value.location,
    weatherAPI.state.value.weather
  )
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
  devLog.log('[NavWeather] 🔧 初始化天气组件...')

  // 1. 获取位置
  const location = await geolocation.getCurrentLocation()

  if (!location) {
    devLog.warn('[NavWeather] ⚠️ 无法获取位置信息')
    return
  }

  // 2. 根据位置获取天气
  await weatherAPI.fetchWeather(location)
}

/**
 * 刷新天气（点击触发）
 */
const handleWeatherClick = async () => {
  devLog.log('[NavWeather] 🔄 手动刷新天气...')

  try {
    // 1. 刷新位置（会自动设置 loading 状态）
    await geolocation.refreshLocation()

    // 2. 如果有新位置，刷新天气
    if (geolocation.state.value.location) {
      await weatherAPI.refreshWeather(geolocation.state.value.location)
    }

    // 3. 显示成功提示
    setTimeout(() => {
      devLog.log('[NavWeather] ✅ 刷新完成')
    }, 300)

  } catch (error) {
    devLog.error('[NavWeather] ❌ 刷新失败:', error)
  }
}

/**
 * 显示权限提示
 */
const showPermissionHints = () => {
  if (!geolocation.isSupported.value) return

  // 延迟执行，避免控制台信息混乱
  setTimeout(() => {
    const permissionState = geolocation.state.value.permissionState

    if (permissionState === 'prompt') {
      devLog.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      devLog.log('🌤️  天气组件提示')
      devLog.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      devLog.log('💡 当前使用 IP 定位（精度较低，误差可达几十公里）')
      devLog.log('✨ 点击天气图标并允许浏览器定位，可获得精准位置')
      devLog.log('📍 浏览器定位精度：< 100 米')
      devLog.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else if (permissionState === 'denied') {
      devLog.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      devLog.log('⚠️  天气组件警告')
      devLog.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      devLog.warn('❌ 浏览器定位权限被拒绝')
      devLog.warn('📍 当前使用 IP 定位（精度低，可能不准确）')
      devLog.log('💡 如需精准定位，请按以下步骤操作：')
      devLog.log('   1. 点击地址栏左侧的 🔒 图标')
      devLog.log('   2. 找到"位置"权限，选择"允许"')
      devLog.log('   3. 刷新页面或点击天气图标')
      devLog.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    } else if (permissionState === 'granted') {
      devLog.log('[NavWeather] ✅ 浏览器定位权限已授权，将使用精准定位')
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
    if (geolocation.state.value.location && !geolocation.state.value.isLoading && !weatherAPI.state.value.isLoading) {
      devLog.log('[NavWeather] 🔄 自动更新天气...')
      await weatherAPI.fetchWeather(geolocation.state.value.location)
    }
  }, UPDATE_INTERVALS.WEATHER_REFRESH)
}

// 生命周期
onMounted(() => {
  devLog.log('[NavWeather] 🚀 天气组件挂载，开始初始化...')

  const init = async () => {
    try {
      await initializeWeather()
      showPermissionHints()
      setupAutoRefresh()

      await nextTick()
      devLog.log('[NavWeather] 📊 初始化完成:', uiState.value)
    } catch (error) {
      devLog.error('[NavWeather] ❌ 初始化失败:', error)
    }
  }

  init()
})

onUnmounted(() => {
  devLog.log('[NavWeather] 🛑 天气组件卸载，清理资源...')
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
})

// 监听位置变化，自动更新天气
watch(
  () => geolocation.state.value.location,
  async (newLocation) => {
    if (newLocation && !geolocation.state.value.isLoading) {
      devLog.log('[NavWeather] 📍 位置更新，重新获取天气...')
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