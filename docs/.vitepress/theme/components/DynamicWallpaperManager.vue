<template>
  <!-- 这是一个无渲染组件，仅用于管理动态壁纸 -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { inBrowser } from 'vitepress'
import { getWallpapers } from '../../ConfigHyde/Wallaper'

// 路由检测 - 只在首页启用动态壁纸
const route = useRoute()

// SSR 检测
if (!inBrowser) {
  console.log('🖼️ 服务端渲染环境，动态壁纸系统不启动')
}

// 配置
const SWITCH_INTERVAL = 10 * 1000 // 10秒切换一次

// 状态
let switchIntervalId: number | null = null
let currentImages: string[] = []
let currentDisplayImage: string = ''
let currentActiveLayer: 'A' | 'B' = 'A'
let isTransitioning = false

// 缓存键
const LAST_IMAGE_KEY = 'last-wallpaper-image'

// 保存/获取最后显示的图片
function saveLastImage(src: string) {
  try { localStorage.setItem(LAST_IMAGE_KEY, src) } catch {}
}

function getLastImage(): string | null {
  try { return localStorage.getItem(LAST_IMAGE_KEY) } catch { return null }
}

// 预加载图片
function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    const timeout = setTimeout(() => {
      img.onload = null
      img.onerror = null
      resolve(false)
    }, 5000)
    img.onload = () => { clearTimeout(timeout); resolve(true) }
    img.onerror = () => { clearTimeout(timeout); resolve(false) }
    img.src = src
  })
}

// 初始化 Banner 背景
function initBannerBackground(imageSrc: string): boolean {
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement
  if (!bannerEl) return false

  bannerEl.style.background = 'var(--vp-c-bg)'
  bannerEl.style.setProperty('--layer-a-bg-image', `url("${imageSrc}")`)
  bannerEl.style.setProperty('--layer-a-opacity', '0')
  bannerEl.style.setProperty('--layer-b-opacity', '0')
  bannerEl.classList.remove('has-layer-b', 'dual-layer')
  bannerEl.classList.add('has-layer-a')
  currentActiveLayer = 'A'

  const img = new Image()
  img.onload = () => {
    const el = document.querySelector('.tk-banner') as HTMLElement
    if (!el) return
    el.style.setProperty('--layer-a-opacity', '1')
    setTimeout(() => {
      const finalEl = document.querySelector('.tk-banner') as HTMLElement
      if (finalEl) finalEl.classList.add('background-loaded')
    }, 100)
  }
  img.onerror = () => {
    // 失败时尝试下一张
    const nextImg = currentImages.find(i => i !== imageSrc)
    if (nextImg) {
      const el = document.querySelector('.tk-banner') as HTMLElement
      if (el) {
        el.style.setProperty('--layer-a-bg-image', `url("${nextImg}")`)
        const fallback = new Image()
        fallback.onload = () => {
          const finalEl = document.querySelector('.tk-banner') as HTMLElement
          if (finalEl) {
            finalEl.style.setProperty('--layer-a-opacity', '1')
            setTimeout(() => finalEl.classList.add('background-loaded'), 100)
          }
        }
        fallback.src = nextImg
      }
    }
  }
  img.src = imageSrc
  saveLastImage(imageSrc)
  return true
}

// 切换壁纸（双图层无缝切换）
async function switchWallpaper(imageSrc: string): Promise<boolean> {
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement
  if (!bannerEl || isTransitioning) return false

  const preloaded = await preloadImage(imageSrc)
  if (!preloaded) return false

  isTransitioning = true
  const targetLayer = currentActiveLayer === 'A' ? 'B' : 'A'

  // 设置新图层
  if (targetLayer === 'A') {
    bannerEl.style.setProperty('--layer-a-bg-image', `url("${imageSrc}")`)
    bannerEl.style.setProperty('--layer-a-opacity', '0')
    bannerEl.classList.add('has-layer-a', 'dual-layer')
  } else {
    bannerEl.style.setProperty('--layer-b-bg-image', `url("${imageSrc}")`)
    bannerEl.style.setProperty('--layer-b-opacity', '0')
    bannerEl.classList.add('has-layer-b', 'dual-layer')
  }

  // 淡入新图层
  await new Promise<void>(r => setTimeout(r, 100))
  const el1 = document.querySelector('.tk-banner') as HTMLElement
  if (!el1) { isTransitioning = false; return false }

  if (targetLayer === 'A') {
    el1.style.setProperty('--layer-a-opacity', '1')
  } else {
    el1.style.setProperty('--layer-b-opacity', '1')
  }

  // 等待过渡完成后隐藏旧图层
  await new Promise<void>(r => setTimeout(r, 1000))
  const el2 = document.querySelector('.tk-banner') as HTMLElement
  if (!el2) { isTransitioning = false; return false }

  if (currentActiveLayer === 'A') {
    el2.style.setProperty('--layer-a-opacity', '0')
    setTimeout(() => {
      const el3 = document.querySelector('.tk-banner') as HTMLElement
      if (el3) el3.classList.remove('has-layer-a')
    }, 2000)
  } else {
    el2.style.setProperty('--layer-b-opacity', '0')
    setTimeout(() => {
      const el3 = document.querySelector('.tk-banner') as HTMLElement
      if (el3) el3.classList.remove('has-layer-b')
    }, 2000)
  }

  currentActiveLayer = targetLayer
  el2.classList.remove('dual-layer')
  isTransitioning = false
  saveLastImage(imageSrc)
  return true
}

// 显示随机壁纸
async function displayRandomImage() {
  if (currentImages.length === 0) return

  let available = currentImages.filter(img => img !== currentDisplayImage)
  if (available.length === 0) available = currentImages

  const randomImg = available[Math.floor(Math.random() * available.length)]
  if (randomImg === currentDisplayImage) return

  const success = await switchWallpaper(randomImg)
  if (success) {
    currentDisplayImage = randomImg
    console.log('🎨 已切换壁纸:', randomImg)
  }
}

// 检查是否为首页
function isHomePage(): boolean {
  const path = route.path
  return path === '/' || path === '/index.html' || path === ''
}

// 停止壁纸系统
function stopWallpaperSystem() {
  if (switchIntervalId) {
    clearInterval(switchIntervalId)
    switchIntervalId = null
  }
  console.log('🖼️ 动态壁纸系统已停止')
}

onMounted(() => {
  if (!inBrowser || !isHomePage()) return

  console.log('🖼️ 动态壁纸系统启动')

  // 获取 R2 壁纸列表
  currentImages = getWallpapers()

  // 尝试使用缓存的图片，否则用第一张
  const lastImage = getLastImage()
  const initialImage = (lastImage && currentImages.includes(lastImage))
    ? lastImage
    : currentImages[0]

  if (initialImage) {
    currentDisplayImage = initialImage
    initBannerBackground(initialImage)
  }

  // 定时切换壁纸
  switchIntervalId = window.setInterval(displayRandomImage, SWITCH_INTERVAL)

  // 页面可见性变化监听
  document.addEventListener('visibilitychange', () => {
    const bannerEl = document.querySelector('.tk-banner') as HTMLElement
    if (bannerEl) {
      bannerEl.classList.toggle('paused', document.hidden)
    }
  })

  // 监听路由变化
  watch(() => route.path, () => {
    if (!isHomePage()) {
      stopWallpaperSystem()
    }
  })
})

onUnmounted(() => {
  stopWallpaperSystem()
})
</script>

<style>
/* 壁纸呼吸动画效果 */
@keyframes wallpaper-breathing {
  0%, 100% {
    transform: scale(1) translateZ(0);
    filter: brightness(1) contrast(1);
  }
  50% {
    transform: scale(1.02) translateZ(0);
    filter: brightness(1.1) contrast(1.03);
  }
}

/* 双图层背景系统 - 首页专用 */
.VPHome .tk-banner {
  position: relative;
  z-index: 0;
  overflow: hidden;
  isolation: isolate;
  background: var(--vp-c-bg);

  --layer-a-bg-image: none;
  --layer-a-opacity: 0;
  --layer-b-bg-image: none;
  --layer-b-opacity: 0;
  --bg-transition-duration: 2s;
}

/* 图层 A */
.VPHome .tk-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--layer-a-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: var(--layer-a-opacity);
  transition: opacity var(--bg-transition-duration) ease;
  z-index: -2;
  pointer-events: none;
  will-change: opacity;
}

/* 图层 B */
.VPHome .tk-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--layer-b-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: var(--layer-b-opacity);
  transition: opacity var(--bg-transition-duration) ease;
  z-index: -1;
  pointer-events: none;
  will-change: opacity;
}

/* 呼吸动画仅在背景加载完成后启用，避免阻塞 LCP */
.VPHome .tk-banner.background-loaded::before,
.VPHome .tk-banner.background-loaded::after {
  animation: wallpaper-breathing 8s ease-in-out infinite;
  will-change: opacity, transform;
}

/* 图层显示控制 */
.VPHome .tk-banner::before,
.VPHome .tk-banner::after {
  display: block;
}

.VPHome .tk-banner.has-layer-a::before {
  opacity: var(--layer-a-opacity);
}

.VPHome .tk-banner.has-layer-b::after {
  opacity: var(--layer-b-opacity);
}

/* 壁纸加载完成后移除预设背景 */
.VPHome .tk-banner.background-loaded {
  background: none !important;
}

/* 暂停动画 */
.VPHome .tk-banner.paused::before,
.VPHome .tk-banner.paused::after {
  animation-play-state: paused;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .VPHome .tk-banner::before,
  .VPHome .tk-banner::after {
    animation-duration: 12s;
  }
}
</style>
