<template>
  <div class="weather-tooltip">
    <div class="tooltip-content" v-if="!isLoading && hasData">
      <div class="location-info" v-if="location.city">
        <span class="city">{{ location.city }}</span>
        <span class="separator"> · </span>
      </div>
      <div class="weather-info">
        <span class="description">{{ weather.description }}</span>
        <span class="temperature">{{ Math.round(weather.temperature) }}°C</span>
      </div>
      <div class="hint" v-if="showHint">
        {{ hintText }}
      </div>
    </div>
    <div class="tooltip-loading" v-else-if="isLoading">
      <span class="loading-icon">🌡️</span>
      <span class="loading-text">加载位置信息中...</span>
    </div>
    <div class="tooltip-error" v-else-if="hasError">
      <span class="error-icon">❌</span>
      <span class="error-text">{{ errorText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LocationData } from '../../types/weather'
import type { WeatherData as WeatherDataType } from '../../types/weather'

interface Props {
  location: LocationData | null
  weather: WeatherDataType | null
  isLoading: boolean
  hasError: boolean
  errorText?: string
  showHint?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errorText: '无法获取位置信息',
  showHint: true
})

const hasData = computed(() => Boolean(props.location && props.weather))

const hintText = computed(() => {
  // 只有在没有城市信息时提示
  if (!props.location?.city) {
    return '提示：点击图标允许浏览器定位以获得更精准的位置 (>100米精度)'
  }
  return '点击刷新天气'
})
</script>

<style scoped>
.weather-tooltip {
  max-width: 250px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  white-space: normal;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.city {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.separator {
  color: var(--vp-c-text-2);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.description {
  font-weight: 500;
}

.temperature {
  background: var(--vp-c-bg-alt);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.hint {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.3;
}

.tooltip-loading,
.tooltip-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.loading-text,
.error-text {
  font-size: 13px;
}

.error-icon {
  color: #ff6b6b;
}

.error-text {
  color: var(--vp-c-text-2);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>