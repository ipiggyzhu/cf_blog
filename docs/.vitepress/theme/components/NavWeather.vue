<template>
  <div class="nav-weather VPSocialLink" :title="weatherTooltip">
    <div class="weather-content">
      <span class="weather-emoji" v-if="weatherData">{{ weatherIcon }}</span>
      <span class="weather-loading" v-else>🌡️</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface WeatherData {
  temperature: number
  skycon: string
  description: string
}

const weatherData = ref<WeatherData | null>(null)

// 彩云天气的天气代码映射到emoji图标
const weatherIconMap: Record<string, string> = {
  'CLEAR_DAY': '☀️',
  'CLEAR_NIGHT': '🌙',
  'PARTLY_CLOUDY_DAY': '⛅',
  'PARTLY_CLOUDY_NIGHT': '☁️',
  'CLOUDY': '☁️',
  'LIGHT_HAZE': '😶‍🌫️',
  'MODERATE_HAZE': '😶‍🌫️',
  'HEAVY_HAZE': '😶‍🌫️',
  'LIGHT_RAIN': '🌦️',
  'MODERATE_RAIN': '🌧️',
  'HEAVY_RAIN': '⛈️',
  'STORM_RAIN': '⛈️',
  'FOG': '🌫️',
  'LIGHT_SNOW': '🌨️',
  'MODERATE_SNOW': '❄️',
  'HEAVY_SNOW': '❄️',
  'STORM_SNOW': '❄️',
  'DUST': '💨',
  'SAND': '💨',
  'WIND': '💨'
}

// 天气描述
const weatherDescMap: Record<string, string> = {
  'CLEAR_DAY': '晴天',
  'CLEAR_NIGHT': '晴夜',
  'PARTLY_CLOUDY_DAY': '多云',
  'PARTLY_CLOUDY_NIGHT': '多云',
  'CLOUDY': '阴天',
  'LIGHT_HAZE': '轻度雾霾',
  'MODERATE_HAZE': '中度雾霾',
  'HEAVY_HAZE': '重度雾霾',
  'LIGHT_RAIN': '小雨',
  'MODERATE_RAIN': '中雨',
  'HEAVY_RAIN': '大雨',
  'STORM_RAIN': '暴雨',
  'FOG': '雾',
  'LIGHT_SNOW': '小雪',
  'MODERATE_SNOW': '中雪',
  'HEAVY_SNOW': '大雪',
  'STORM_SNOW': '暴雪',
  'DUST': '浮尘',
  'SAND': '沙尘',
  'WIND': '大风'
}

const weatherIcon = computed(() => {
  if (!weatherData.value) return '🌡️'
  return weatherIconMap[weatherData.value.skycon] || '🌡️'
})

const temperature = computed(() => {
  if (!weatherData.value) return '--'
  return Math.round(weatherData.value.temperature)
})

const weatherTooltip = computed(() => {
  if (!weatherData.value) return '加载天气中...'
  return `${weatherData.value.description} ${temperature.value}°C`
})

// 获取天气数据
const fetchWeather = async () => {
  try {
    // 彩云天气API配置
    const API_KEY = 'HsqDIplY13zWWUVM' // 请替换为您的彩云天气API Key
    
    // 通过 IP 自动获取访问者的位置
    const ipResponse = await fetch('https://ipapi.co/json/')
    const ipData = await ipResponse.json()
    const longitude = ipData.longitude
    const latitude = ipData.latitude
    
    const url = `https://api.caiyunapp.com/v2.6/${API_KEY}/${longitude},${latitude}/realtime`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === 'ok') {
      const realtime = data.result.realtime
      weatherData.value = {
        temperature: realtime.temperature,
        skycon: realtime.skycon,
        description: weatherDescMap[realtime.skycon] || '未知'
      }
    }
  } catch (error) {
    console.error('获取天气数据失败:', error)
    // 失败时显示默认数据
    weatherData.value = {
      temperature: 0,
      skycon: 'CLOUDY',
      description: '天气'
    }
  }
}

onMounted(() => {
  fetchWeather()
  // 每30分钟更新一次天气
  setInterval(fetchWeather, 30 * 60 * 1000)
})
</script>

<style scoped>
.nav-weather {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.5s;
  cursor: default;
}

.nav-weather:hover {
  color: var(--vp-c-text-1);
}

.weather-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.weather-emoji {
  font-size: 20px;
  line-height: 1;
  display: block;
}

.weather-loading {
  font-size: 20px;
  line-height: 1;
  display: block;
  opacity: 0.5;
}

/* 响应式：移动端适配 */
@media (max-width: 768px) {
  .nav-weather {
    width: 32px;
    height: 32px;
  }
  
  .weather-emoji,
  .weather-loading {
    font-size: 18px;
  }
}
</style>

