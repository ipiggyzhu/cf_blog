<template>
  <span
    class="weather-emoji"
    :title="title"
    :class="{ 'weather-loading-state': isLoading }"
  >
    {{ icon }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon?: string
  temperature?: number
  isLoading?: boolean
  hasError?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '🌡️',
  temperature: undefined,
  isLoading: false,
  hasError: false,
  title: '天气'
})

const icon = computed(() => {
  if (props.hasError) return '❌'
  if (props.isLoading) return '🌡️'
  return props.icon
})
</script>

<style scoped>
.weather-emoji {
  font-size: 18px;
  line-height: 18px;
  display: block;
  transition: all 0.3s ease;
}

.weather-loading-state {
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .weather-emoji {
    font-size: 16px;
    line-height: 16px;
  }
}
</style>