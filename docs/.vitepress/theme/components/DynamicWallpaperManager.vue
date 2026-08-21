<template>
  <!-- 这是一个无渲染组件，仅用于管理动态壁纸 -->
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import { inBrowser } from 'vitepress'
import {
  fetchDynamicWallpapers,
  fetchWallpaperLibrary,
  FALLBACK_WALLPAPERS
} from '../../ConfigHyde/Wallaper'

// 路由检测 - 只在首页启用动态壁纸
const route = useRoute()
let isHomePage = false

// 检查是否为首页
function checkIsHomePage(): boolean {
  const path = route.path
  return path === '/' || path === '/index.html' || path === ''
}

// 停止所有动态壁纸相关功能
function stopWallpaperSystem() {
  if (initialFetchTimeoutId) {
    clearTimeout(initialFetchTimeoutId)
    initialFetchTimeoutId = null
  }
  if (stabilityTimeoutId) {
    clearTimeout(stabilityTimeoutId)
    stabilityTimeoutId = null
  }
  if (fetchLibraryIntervalId) {
    clearInterval(fetchLibraryIntervalId)
    fetchLibraryIntervalId = null
  }
  if (switchImageIntervalId) {
    clearInterval(switchImageIntervalId)
    switchImageIntervalId = null
  }
  stopServiceMonitoring()

  document.removeEventListener('visibilitychange', handleVisibilityChange)

  // 清理呼吸动画类
  document.querySelectorAll('.wallpaper-breathing').forEach(element => {
    element.classList.remove('wallpaper-breathing')
  })

  console.log('🖼️ 动态壁纸系统已停止')
}

// 定义时间间隔配置
const FETCH_LIBRARY_INTERVAL = 60 * 1000 // 60秒请求一次图集服务器获取图库
const SWITCH_IMAGE_INTERVAL = 10 * 1000 // 10秒从图库中随机选择一张图片展示
const SERVICE_CHECK_INTERVAL = 15 * 1000 // 15秒检测一次服务状态（当使用备用图片时）

let fetchLibraryIntervalId: number | null = null // 图库请求定时器
let switchImageIntervalId: number | null = null // 图片切换定时器
let serviceCheckIntervalId: number | null = null // 服务检测定时器
let initialFetchTimeoutId: number | null = null // 首次拉取图库的延迟定时器
let stabilityTimeoutId: number | null = null // banner 容器初始化的延迟定时器
let currentImages: string[] = [] // 当前图库
let currentDisplayImage: string = '' // 当前展示的图片
let isUsingFallback: boolean = false // 是否正在使用备用图片
let lastSuccessfulFetch: number = 0 // 上次成功获取图库的时间

// 双图层状态管理
let currentActiveLayer: 'A' | 'B' = 'A' // 当前活动图层
let isTransitioning: boolean = false // 是否正在切换中
let layerHistory: Array<{ layer: 'A' | 'B', image: string, timestamp: number }> = [] // 图层历史记录
let pendingSwitchQueue: Array<{ image: string, timestamp: number }> = [] // 待处理的切换队列

// 缓存相关
const CACHE_KEY = 'dynamic-wallpaper-cache'
const LAST_IMAGE_KEY = 'last-wallpaper-image'

// 保存图库到缓存
function saveImagesToCache(images: string[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(images))
  } catch (error) {
    console.warn('保存图库缓存失败:', error)
  }
}

// 从缓存加载图库
function loadImagesFromCache(): string[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : []
  } catch (error) {
    console.warn('加载图库缓存失败:', error)
    return []
  }
}

// 保存最后显示的图片
function saveLastImage(imageSrc: string) {
  try {
    localStorage.setItem(LAST_IMAGE_KEY, imageSrc)
  } catch (error) {
    console.warn('保存最后图片失败:', error)
  }
}

// 获取最后显示的图片
function getLastImage(): string | null {
  try {
    return localStorage.getItem(LAST_IMAGE_KEY)
  } catch (error) {
    console.warn('获取最后图片失败:', error)
    return null
  }
}

// 预加载图片以避免加载闪烁，检测图片是否可用
function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()

    // 设置5秒超时，给网络慢的用户更多时间
    const timeout = setTimeout(() => {
      img.onload = null
      img.onerror = null
      console.warn('⏰ 图片预加载超时:', src)
      resolve(false)
    }, 5000)

    img.onload = () => {
      clearTimeout(timeout)
      resolve(true) // 加载成功
    }
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false) // 加载失败
    }
    img.src = src
  })
}

// 获取图层状态信息
function getLayerStatus(): { currentLayer: 'A' | 'B', isTransitioning: boolean, history: typeof layerHistory } {
  return {
    currentLayer: currentActiveLayer,
    isTransitioning,
    history: [...layerHistory] // 返回副本
  }
}

// 记录图层状态到历史
function recordLayerState(layer: 'A' | 'B', image: string) {
  const now = Date.now()
  layerHistory.push({ layer, image, timestamp: now })

  // 保持历史记录在合理范围内（最多保留10条）
  if (layerHistory.length > 10) {
    layerHistory.shift()
  }

  console.log('📝 图层状态记录:', { layer, image, timestamp: now })
}

// 清理过期的待处理队列
function cleanPendingQueue() {
  const now = Date.now()
  const maxAge = 5000 // 5秒过期

  const beforeLength = pendingSwitchQueue.length
  pendingSwitchQueue = pendingSwitchQueue.filter(item => now - item.timestamp < maxAge)

  if (beforeLength !== pendingSwitchQueue.length) {
    console.log('🧹 清理过期的待处理队列:', beforeLength - pendingSwitchQueue.length, '个项目')
  }
}

// 处理待处理的切换队列
async function processPendingQueue() {
  if (isTransitioning || pendingSwitchQueue.length === 0) {
    return
  }

  // 清理过期项目
  cleanPendingQueue()

  // 获取最早的待处理项目
  const nextSwitch = pendingSwitchQueue.shift()
  if (nextSwitch) {
    console.log('📋 处理待切换队列:', nextSwitch.image)
    await updateBannerBackgroundWithCSS(nextSwitch.image)
  }
}

// 队列化切换请求
function queueSwitch(imageSrc: string) {
  const now = Date.now()

  // 如果队列中已有相同图片，移除旧的
  pendingSwitchQueue = pendingSwitchQueue.filter(item => item.image !== imageSrc)

  // 添加新的请求
  pendingSwitchQueue.push({ image: imageSrc, timestamp: now })

  console.log('📥 切换请求已加入队列:', imageSrc, '队列长度:', pendingSwitchQueue.length)

  // 尝试立即处理队列
  setTimeout(processPendingQueue, 100)
}

// 简化的内容层稳定性函数（CSS变量方案下不再需要复杂的DOM操作）
function ensureBannerContentStability() {
  // 仅确保banner容器有正确的基本设置
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement
  if (bannerEl) {
    bannerEl.style.overflow = 'hidden' // 隐藏背景溢出，避免滚动条
    bannerEl.style.isolation = 'isolate'

    // 彻底清理可能冲突的旧背景元素样式
    const oldBgElements = bannerEl.querySelectorAll('.tk-banner__bg, .tk-banner-bg, [class*="banner"][class*="bg"]')
    oldBgElements.forEach(el => {
      const element = el as HTMLElement
      // 完全隐藏旧的背景元素避免格子问题
      element.style.display = 'none'
      element.style.backgroundImage = 'none'
      element.style.background = 'none'
      element.style.opacity = '0'
      element.style.zIndex = '-1000'
    })

    // 清理banner本身可能的背景样式
    bannerEl.style.backgroundImage = 'none'
    bannerEl.style.background = 'transparent'
  }
}

// CSS变量方案下，不再需要复杂的保护和调试函数
// 保留简单的调试函数用于开发
function debugBannerState() {
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement
  if (bannerEl) {
    const bgImage = bannerEl.style.getPropertyValue('--banner-bg-image')
    const bgOpacity = bannerEl.style.getPropertyValue('--banner-bg-opacity')
    console.log('🔍 Banner状态:', { bgImage, bgOpacity })
  }
}

// 双图层初始化Banner背景
function initBannerBackground(imageSrc: string): boolean {
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement

  if (bannerEl) {
    // 使用主题背景色避免蓝色闪烁，与blogger-fix.scss保持一致
    bannerEl.style.background = 'var(--vp-c-bg)'
    bannerEl.style.backgroundColor = 'var(--vp-c-bg)'

    // 立即设置图层A并显示，避免透明状态
    bannerEl.style.setProperty('--layer-a-bg-image', `url("${imageSrc}")`)
    bannerEl.style.setProperty('--layer-a-opacity', '1') // 立即显示，不从0开始
    bannerEl.style.setProperty('--layer-b-opacity', '0')

    // 立即显示图层A类
    bannerEl.classList.remove('has-layer-b', 'dual-layer')
    bannerEl.classList.add('has-layer-a')
    currentActiveLayer = 'A'

    // 预加载图片用于验证
    const img = new Image()
    img.onload = () => {
      console.log('🎯 双图层初始化 - 图片验证成功:', imageSrc)
      // 图片加载成功后添加背景加载完成的类，移除预设背景色
      setTimeout(() => {
        bannerEl.classList.add('background-loaded')
      }, 300) // 确保图片已显示后再移除背景色
    }
    img.onerror = () => {
      console.warn('❌ 双图层初始化图片验证失败，保持预设背景:', imageSrc)
      // 图片加载失败时保持预设背景色，不添加background-loaded类
    }

    console.log('🔄 双图层系统 - 立即显示背景并验证图片:', imageSrc)
    img.src = imageSrc
    
    // 保存初始图片到缓存
    saveLastImage(imageSrc)
    
    return true
  }

  console.warn('❌ 未找到.tk-banner元素')
  return false
}

// 双图层无缝切换函数 - 解决白屏问题
async function updateBannerBackgroundWithCSS(imageSrc: string): Promise<boolean> {
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement

  if (!bannerEl) {
    console.warn('❌ 未找到.tk-banner元素')
    return false
  }

  // 如果正在切换中，将请求加入队列
  if (isTransitioning) {
    console.log('⏭️ 正在切换中，将请求加入队列:', imageSrc)
    queueSwitch(imageSrc)
    return false
  }

  try {
    // 预加载图片确保切换时不会有闪烁
    const preloadSuccess = await preloadImage(imageSrc)

    if (!preloadSuccess) {
      console.warn('❌ 双图层切换失败，图片预加载失败:', imageSrc)
      return false
    }

    console.log('🔄 双图层无缝切换开始 - 当前活动图层:', currentActiveLayer)

    isTransitioning = true
    const oldActiveLayer = currentActiveLayer
    const targetLayer = currentActiveLayer === 'A' ? 'B' : 'A'

    // 记录切换开始状态
    recordLayerState(oldActiveLayer, currentDisplayImage || '当前图片')

    // 1. 在非活动图层预加载新图片
    // 状态检查：确保banner元素仍然存在
    if (!document.querySelector('.tk-banner')) {
      console.warn('⚠️ Banner元素在切换过程中消失，中止切换')
      isTransitioning = false
      return false
    }

    if (targetLayer === 'A') {
      bannerEl.style.setProperty('--layer-a-bg-image', `url("${imageSrc}")`)
      bannerEl.style.setProperty('--layer-a-opacity', '0')
      bannerEl.classList.add('has-layer-a', 'dual-layer') // 启用双图层显示
    } else {
      bannerEl.style.setProperty('--layer-b-bg-image', `url("${imageSrc}")`)
      bannerEl.style.setProperty('--layer-b-opacity', '0')
      bannerEl.classList.add('has-layer-b', 'dual-layer') // 启用双图层显示
    }

    // 2. 新图层淡入（此时两个图层都显示，无白屏）
    await new Promise<void>(resolve => {
      setTimeout(() => {
        // 状态检查：验证banner元素仍然存在
        const currentBannerEl = document.querySelector('.tk-banner') as HTMLElement
        if (!currentBannerEl) {
          console.warn('⚠️ Banner元素在淡入阶段消失，中止切换')
          isTransitioning = false
          resolve()
          return
        }

        if (targetLayer === 'A') {
          currentBannerEl.style.setProperty('--layer-a-opacity', '1')
        } else {
          currentBannerEl.style.setProperty('--layer-b-opacity', '1')
        }
        console.log('🔄 新图层开始淡入:', targetLayer, '透明度设为1')
        resolve()
      }, 100) // 短暂延迟确保CSS生效
    })

    // 3. 等待新图层完全显示后，隐藏旧图层
    await new Promise<void>(resolve => {
      // 等待新图层过渡动画完全结束再隐藏旧图层
      setTimeout(() => {
        // 状态检查：验证banner元素仍然存在
        const currentBannerEl = document.querySelector('.tk-banner') as HTMLElement
        if (!currentBannerEl) {
          console.warn('⚠️ Banner元素在旧图层隐藏阶段消失，中止切换')
          isTransitioning = false
          resolve()
          return
        }

        console.log('🔄 新图层已完全可见，开始隐藏旧图层:', oldActiveLayer)

        // 现在开始隐藏旧图层
        if (oldActiveLayer === 'A') {
          currentBannerEl.style.setProperty('--layer-a-opacity', '0')
        } else {
          currentBannerEl.style.setProperty('--layer-b-opacity', '0')
        }

        // 等待旧图层完全隐藏后再清理类
        setTimeout(() => {
          // 状态检查：验证banner元素仍然存在
          const finalBannerEl = document.querySelector('.tk-banner') as HTMLElement
          if (!finalBannerEl) {
            console.warn('⚠️ Banner元素在清理阶段消失，中止切换')
            isTransitioning = false
            resolve()
            return
          }

          // 移除旧图层的显示类
          if (oldActiveLayer === 'A') {
            finalBannerEl.classList.remove('has-layer-a')
          } else {
            finalBannerEl.classList.remove('has-layer-b')
          }

          // 4. 切换完成，更新状态
          currentActiveLayer = targetLayer
          finalBannerEl.classList.remove('dual-layer') // 关闭双图层模式
          finalBannerEl.classList.add('background-loaded') // 确保移除预设背景

          // 记录新的图层状态
          recordLayerState(targetLayer, imageSrc)

          isTransitioning = false
          console.log('✅ 双图层无缝切换完成 - 新活动图层:', currentActiveLayer, '图片:', imageSrc)

          // 保存当前显示的图片到缓存
          saveLastImage(imageSrc)

          resolve()
        }, 2100) // 优化等待时间（2.1s确保新图层完全可见）
      }, 1000) // 优化新图层等待时间（1s后旧图层开始淡出，确保1.1秒重叠）
    })

    // 处理队列中可能的待处理请求
    setTimeout(processPendingQueue, 100)

    return true

  } catch (error) {
    console.error('❌ 双图层切换过程中发生错误:', error)
    // 确保切换过程中的异常不会导致状态锁死
    isTransitioning = false
    
    // 尝试恢复到安全状态
    try {
      const recoveryBannerEl = document.querySelector('.tk-banner') as HTMLElement
      if (recoveryBannerEl) {
        recoveryBannerEl.classList.remove('dual-layer')
        console.log('🔧 已尝试恢复到安全状态')
      }
    } catch (recoveryError) {
      console.error('❌ 状态恢复失败:', recoveryError)
    }
    
    return false
  }
}

// 从当前图库中随机选择一张图片展示（带去重逻辑）
async function displayRandomImage() {
  // 检查图库是否为空
  if (!currentImages || currentImages.length === 0) {
    console.warn('图库为空，使用备用图片')
    currentImages = getFallbackImages()
    isUsingFallback = true
    // 保存备用图库到缓存
    saveImagesToCache(currentImages)
  }
  
  let availableImages = currentImages
  
  // 如果图库中有多张图片，排除当前正在展示的图片
  if (currentImages.length > 1 && currentDisplayImage) {
    availableImages = currentImages.filter(img => img !== currentDisplayImage)
  }
  
  // 如果过滤后没有图片了，使用全部图片
  if (availableImages.length === 0) {
    availableImages = currentImages
  }
  
  const randomImg = availableImages[Math.floor(Math.random() * availableImages.length)]
  
  // 如果选中的图片和当前展示的相同，直接返回（避免不必要的更新）
  if (randomImg === currentDisplayImage) return
  
  try {
    // 预加载图片并检测是否成功
    const preloadSuccess = await preloadImage(randomImg)
    
    // 如果图片加载失败且当前使用的是动态图库，切换到备用图片
    if (!preloadSuccess && !isUsingFallback) {
      console.warn('🔌 动态图片加载失败，服务可能已停止，切换到备用图片')
      currentImages = getFallbackImages()
      isUsingFallback = true
      
      // 保存备用图库到缓存
      saveImagesToCache(currentImages)
      
      // 启动服务监控
      startServiceMonitoring()
      
      // 重新从备用图库选择图片
      const fallbackImg = currentImages[Math.floor(Math.random() * currentImages.length)]
      const fallbackPreloadSuccess = await preloadImage(fallbackImg)
      
      if (fallbackPreloadSuccess) {
        currentDisplayImage = fallbackImg
        await updateBannerBackgroundWithCSS(fallbackImg)
        return
      } else {
        console.error('备用图片也加载失败')
        return
      }
    } else if (!preloadSuccess) {
      // 备用图片也加载失败，跳过此次更新
      console.warn('图片加载失败，跳过此次更新')
      return
    }
    
    // 更新当前展示图片记录
    currentDisplayImage = randomImg

    // 使用新的CSS变量方法更新Banner背景
    // 注意：必须 await —— 不加 await 拿到的是 Promise（恒为真值），下面的重试分支永远进不去
    const success = await updateBannerBackgroundWithCSS(randomImg)

    if (!success) {
      // 如果立即更新失败，等待DOM更新后再试
      await nextTick()
      await updateBannerBackgroundWithCSS(randomImg)
    }
    
    // CSS变量方案下，呼吸动画通过伪元素自动应用，无需手动添加
    setTimeout(() => {
      debugBannerState() // 调试新的CSS变量状态
    }, 100)
    
    // 设置全局变量供其他组件使用
    ;(window as any).dynamicWallpapers = currentImages
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('wallpaper-updated', {
      detail: { images: currentImages, currentImage: randomImg, layerStatus: getLayerStatus() }
    }))

    // 开发环境下的状态检查
    if (typeof window !== 'undefined' && (window as any).location.hostname === 'localhost') {
      setTimeout(() => {
        const layerStatus = getLayerStatus()
        console.log('🔍 壁纸切换后状态检查:', {
          currentImage: randomImg,
          layerStatus,
          timestamp: new Date().toLocaleTimeString()
        })
      }, 2000) // 等待切换完全完成后检查
    }
    
    const imageType = isUsingFallback ? '备用' : '动态'
    console.log(`🎨 已切换${imageType}壁纸:`, randomImg)
    
  } catch (error) {
    console.warn('切换壁纸失败:', error)
  }
}


// 检测图集服务是否可用（复用统一的带超时请求，不再手写一份 fetch）
async function checkServiceAvailability(): Promise<boolean> {
  return (await fetchWallpaperLibrary()) !== null
}

// 服务状态监控（仅在使用备用图片时运行）
async function monitorServiceStatus() {
  if (!isUsingFallback) {
    // 如果不是使用备用图片，停止监控
    stopServiceMonitoring()
    return
  }
  
  console.log('🔍 检查图集服务状态...')
  const isServiceAvailable = await checkServiceAvailability()
  
  if (isServiceAvailable) {
    console.log('✅ 图集服务已恢复！切换回动态图库')
    
    // 停止服务监控
    stopServiceMonitoring()
    
    // 重新获取动态图库
    await fetchImageLibrary()
    
    // 立即切换到动态图片
    if (!isUsingFallback && currentImages.length > 0) {
      await displayRandomImage()
    }
  }
}

// 停止服务监控
function stopServiceMonitoring() {
  if (serviceCheckIntervalId) {
    clearInterval(serviceCheckIntervalId)
    serviceCheckIntervalId = null
    console.log('📴 停止图集服务监控')
  }
}

// 启动服务监控（仅在切换到备用图片时启动）
function startServiceMonitoring() {
  if (!serviceCheckIntervalId) {
    serviceCheckIntervalId = window.setInterval(monitorServiceStatus, SERVICE_CHECK_INTERVAL)
    console.log('👁️ 启动图集服务监控（15秒检测一次）')
  }
}

// 获取备用图片列表（唯一来源在 ConfigHyde/Wallaper.ts，这里只取副本避免被就地修改）
function getFallbackImages(): string[] {
  return [...FALLBACK_WALLPAPERS]
}

// 从图集服务器获取图库列表
async function fetchImageLibrary() {
  try {
    const images = await fetchDynamicWallpapers()
    
    // 检查是否获取到有效的动态图片（非备用图片）
    const fallbackImages = getFallbackImages()
    const isDynamicImages = images.some(img => !fallbackImages.includes(img))
    
    if (isDynamicImages && images.length > 0) {
      // 成功获取到动态图库
      currentImages = images
      lastSuccessfulFetch = Date.now()

      // 保存图库到缓存
      saveImagesToCache(images)

      if (isUsingFallback) {
        console.log('✅ 图集服务已恢复，切换回动态图库')
        isUsingFallback = false
        // 停止服务监控
        stopServiceMonitoring()
      }

      console.log(`📚 动态图库已更新: ${images.length} 张图片`)
    } else {
      // 没有获取到有效的动态图片，使用备用图片
      if (!isUsingFallback) {
        console.log('⚠️ 图集服务不可用，切换到备用图片')
        currentImages = fallbackImages
        isUsingFallback = true
        // 保存备用图库到缓存
        saveImagesToCache(fallbackImages)
        // 启动服务监控
        startServiceMonitoring()
      }
    }
  } catch (error) {
    console.warn('获取图库失败，使用备用图片:', error)
    
    if (!isUsingFallback) {
      currentImages = getFallbackImages()
      isUsingFallback = true
      // 保存备用图库到缓存
      saveImagesToCache(currentImages)
      // 启动服务监控
      startServiceMonitoring()
    }
  }
}

// 页面可见性变化监听 —— 必须是稳定引用，否则 removeEventListener 摘不掉
function handleVisibilityChange() {
  const bannerEl = document.querySelector('.tk-banner') as HTMLElement

  if (bannerEl) {
    bannerEl.classList.toggle('paused', document.hidden)
  }

  // 同时处理其他可能的背景元素
  document.querySelectorAll('.wallpaper-breathing').forEach(element => {
    element.classList.toggle('paused', document.hidden)
  })
}

// 首屏立即显示一张壁纸（缓存优先），避免黑色/闪烁背景
function showInitialWallpaper() {
  const lastImage = getLastImage()
  const cachedImages = loadImagesFromCache()

  if (cachedImages.length > 0) {
    currentImages = cachedImages
    console.log(`📦 加载缓存图库: ${cachedImages.length} 张图片`)
  } else {
    currentImages = getFallbackImages()
    saveImagesToCache(currentImages)
  }

  const initialImage =
    lastImage || currentImages[Math.floor(Math.random() * currentImages.length)]

  console.log('🎯 立即显示壁纸:', initialImage)
  currentDisplayImage = initialImage

  // 确保banner容器正确设置后再显示壁纸
  ensureBannerContentStability()
  initBannerBackground(initialImage)
}

// 启动动态壁纸系统（仅首页）
function startWallpaperSystem() {
  if (!isHomePage || switchImageIntervalId) return

  console.log('🖼️ 动态壁纸系统启动（首页）')

  showInitialWallpaper()

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 延迟拉取真实图库，先让缓存壁纸渲染出来
  // fetchImageLibrary 内部已带超时与降级，不需要再单独探活一次
  initialFetchTimeoutId = window.setTimeout(async () => {
    initialFetchTimeoutId = null
    console.log('🔍 开始更新图库...')
    await fetchImageLibrary()

    if (!fetchLibraryIntervalId) {
      fetchLibraryIntervalId = window.setInterval(fetchImageLibrary, FETCH_LIBRARY_INTERVAL)
    }
  }, 1000)

  // 设置定时器：每10秒切换图片
  switchImageIntervalId = window.setInterval(displayRandomImage, SWITCH_IMAGE_INTERVAL)
  console.log(`⏰ 壁纸切换定时器已启动，间隔: ${SWITCH_IMAGE_INTERVAL / 1000}秒`)

  // 初始化基本设置（CSS变量方案下大大简化）
  stabilityTimeoutId = window.setTimeout(() => {
    stabilityTimeoutId = null
    ensureBannerContentStability()
    console.log('🌟 CSS变量背景系统初始化完成')
  }, 500)
}

onMounted(() => {
  // 仅在浏览器环境运行
  if (!inBrowser) {
    console.log('⏹️ 服务端环境，动态壁纸系统不启动')
    return
  }

  isHomePage = checkIsHomePage()
  console.log('🖼️ 动态壁纸管理器挂载 - 当前页面:', route.path, '是否首页:', isHomePage)

  startWallpaperSystem()

  // 监听路由变化：离开首页停掉，回到首页重新启动（不再整页 reload）
  watch(() => route.path, () => {
    const newIsHomePage = checkIsHomePage()
    if (newIsHomePage === isHomePage) return

    isHomePage = newIsHomePage

    if (isHomePage) {
      console.log('🏠 切换到首页，启动动态壁纸系统')
      nextTick(() => startWallpaperSystem())
    } else {
      console.log('🚪 离开首页，停止动态壁纸系统')
      stopWallpaperSystem()
    }
  })
})

onUnmounted(() => {
  stopWallpaperSystem()
})
</script>

<style>
/* 壁纸呼吸动画效果 - 增强可见性版本 */
@keyframes wallpaper-breathing {
  0%, 100% {
    transform: scale(1) translateZ(0);
    filter: brightness(1) contrast(1) saturate(1);
  }
  50% {
    transform: scale(1.025) translateZ(0); /* 增加缩放幅度让效果更明显 */
    filter: brightness(1.12) contrast(1.05) saturate(1.05); /* 增强滤镜效果 */
  }
}

/* 呼吸动画类 - 限制为首页专用，避免影响其他页面 */
.VPHome .wallpaper-breathing,
.VPHome .tk-banner .wallpaper-breathing,
.VPHome .tk-banner .tk-banner__bg.wallpaper-breathing,
.VPHome .tk-banner .tk-banner-bg.wallpaper-breathing,
.VPHome [style*="background-image"].wallpaper-breathing {
  animation: wallpaper-breathing 6s ease-in-out infinite !important;
  transform-origin: center center !important;
  will-change: transform, filter;
}

/* 壁纸淡入淡出过渡样式 - 确保背景图片层次正确 */
.tk-banner .tk-banner__bg,
.tk-banner .tk-banner-bg,
.tk-banner [class*="banner"][class*="bg"],
.banner-bg,
.tk-banner-bg,
.background-image {
  background-blend-mode: normal;
  /* 确保多层背景正确显示 */
  /* 添加硬件加速以获得更流畅的过渡 */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  /* 预设过渡效果，使用最佳的缓动函数 */
  transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 确保图片切换时不会有空白背景 */
  background-color: transparent;
  /* 优化渲染性能 */
  will-change: opacity, transform;
}

/* 确保背景图片容器有足够的层级 */
[style*="background-image"] {
  position: relative;
  overflow: hidden;
  /* 添加硬件加速 */
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  /* 优化过渡效果 */
  transition: opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  /* 确保无背景色干扰 */
  background-color: transparent;
  /* 优化渲染性能 */
  will-change: opacity;
}

/* 双图层无缝切换背景系统 - 限制为首页专用 */
.VPHome .tk-banner {
  position: relative;
  z-index: 0;
  overflow: hidden; /* 隐藏背景溢出，避免产生滚动条 */
  /* 创建独立的层叠上下文但不影响子元素 */
  isolation: isolate;

  /* 使用主题背景色避免蓝色闪烁，与blogger-fix.scss保持一致 */
  background: var(--vp-c-bg);
  background-color: var(--vp-c-bg);

  /* 图层A的CSS变量 */
  --layer-a-bg-image: none;
  --layer-a-opacity: 0;

  /* 图层B的CSS变量 */
  --layer-b-bg-image: none;
  --layer-b-opacity: 0;

  /* 通用控制变量 */
  --bg-transition-duration: 2s;
}

/* 图层A - 使用::before伪元素 - 限制为首页专用 */
.VPHome .tk-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--layer-a-bg-image);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: transparent;
  opacity: var(--layer-a-opacity);
  transition: opacity var(--bg-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -2; /* 在图层B下方 */
  pointer-events: none;
  /* 硬件加速 */
  will-change: opacity, transform, filter;
  backface-visibility: hidden;
  transform: translateZ(0);
  /* 呼吸动画 - 图层A，同步时机 */
  animation: wallpaper-breathing 8s ease-in-out infinite;
  animation-delay: 0s;
  transform-origin: center center;
}

/* 图层B - 使用::after伪元素 - 限制为首页专用 */
.VPHome .tk-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--layer-b-bg-image);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: transparent;
  opacity: var(--layer-b-opacity);
  transition: opacity var(--bg-transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1; /* 在图层A上方 */
  pointer-events: none;
  /* 硬件加速 */
  will-change: opacity, transform, filter;
  backface-visibility: hidden;
  transform: translateZ(0);
  /* 呼吸动画 - 图层B，与图层A完全同步 */
  animation: wallpaper-breathing 8s ease-in-out infinite;
  animation-delay: 0s;
  transform-origin: center center;
}

/* 图层显示控制 - 限制为首页专用 */
/* 默认状态下两个图层都显示但透明 */
.VPHome .tk-banner::before,
.VPHome .tk-banner::after {
  display: block;
  opacity: 0;
}

/* 有背景时显示对应图层 */
.VPHome .tk-banner.has-layer-a::before {
  display: block;
  opacity: var(--layer-a-opacity);
}

.VPHome .tk-banner.has-layer-b::after {
  display: block;
  opacity: var(--layer-b-opacity);
}

/* 图层加载完成后移除预设背景 */
.VPHome .tk-banner.has-layer-a.background-loaded,
.VPHome .tk-banner.has-layer-b.background-loaded {
  background: none !important;
  background-color: transparent !important;
}

/* 双图层同时显示时用于无缝切换 */
.VPHome .tk-banner.dual-layer::before,
.VPHome .tk-banner.dual-layer::after {
  display: block;
}

/* 页面隐藏时暂停两个图层的动画 */
.VPHome .tk-banner.paused::before,
.VPHome .tk-banner.paused::after {
  animation-play-state: paused;
}

/* 动画时机优化 - 确保图层可见时播放动画 */
.VPHome .tk-banner.has-layer-a::before {
  animation-play-state: running;
}

.VPHome .tk-banner.has-layer-b::after {
  animation-play-state: running;
}

/* 默认情况下也允许动画运行，避免动画被意外暂停 */
.VPHome .tk-banner::before,
.VPHome .tk-banner::after {
  animation-play-state: running;
}

/* 双图层模式下确保两个动画同步 */
.VPHome .tk-banner.dual-layer::before,
.VPHome .tk-banner.dual-layer::after {
  animation-play-state: running;
  /* 确保两个图层的动画开始时间一致 */
  animation-delay: 0s;
}

/* 移动端优化呼吸动画 - 应用到双图层 - 限制为首页专用 */
@media (max-width: 768px) {
  .VPHome .tk-banner::before,
  .VPHome .tk-banner::after {
    animation-duration: 12s;
    /* 移动端减少性能消耗 */
    will-change: opacity;
  }

  /* 移动端呼吸动画重定义 */
  @keyframes wallpaper-breathing {
    0%, 100% {
      transform: scale(1) translateZ(0);
      filter: brightness(1);
    }
    50% {
      transform: scale(1.008) translateZ(0); /* 移动端进一步减少缩放 */
      filter: brightness(1.05);
    }
  }
}

/* 保留旧背景元素的动画支持，但优先使用伪元素 - 限制为首页专用 */
.VPHome .tk-banner .tk-banner__bg,
.VPHome .tk-banner .tk-banner-bg,
.VPHome .tk-banner [class*="banner"][class*="bg"] {
  animation: wallpaper-breathing 8s ease-in-out infinite;
  transform-origin: center center;
  will-change: transform, filter;
}

.VPHome .tk-banner .wallpaper-breathing {
  animation-duration: 10s;
}

/* 移动端旧背景元素呼吸动画优化 */
@media (max-width: 768px) {
  .VPHome .wallpaper-breathing {
    animation-duration: 12s; /* 移动端使用更缓慢的呼吸频率 */
  }
}

/* 暂停动画的类（用于页面切换时） - 限制为首页专用 */
.VPHome .wallpaper-breathing.paused {
  animation-play-state: paused;
}

/* 临时图层样式（现在主要用于向后兼容） */
.wallpaper-temp-layer {
  backface-visibility: hidden;
  transform: translateZ(-1px);
  will-change: opacity;
  z-index: -50;
  position: absolute;
  pointer-events: none;
}

/* 确保过渡期间不会有闪烁 */
.tk-banner .tk-banner__bg,
.tk-banner .tk-banner-bg,
.tk-banner [class*="banner"][class*="bg"] {
  /* 防止在切换时显示空白背景 */
  min-height: 100%;
  background-attachment: local;
}

/* 简化的内容层保护 - 基于CSS变量的稳定方案 */
.tk-banner-content,
.tk-banner .tk-banner-content,
.banner-content {
  position: relative;
  z-index: 10;
  /* 确保内容层稳定显示 */
  isolation: isolate;
  /* 确保内容区域不被隐藏的背景overflow影响 */
  overflow: visible;
}

/* 所有banner内容子元素的基本保护 */
.tk-banner-content *,
.tk-banner .tk-banner-content * {
  position: relative;
  z-index: 11;
}

/* 确保所有banner内部内容都不受背景overflow:hidden影响 */
.tk-banner > *:not(::before):not(::after) {
  position: relative;
  z-index: 5;
  /* 确保内容层有自己的显示空间 */
  overflow: visible;
}

/* 特别保护常见的banner内容元素 */
.tk-banner .tk-banner-title,
.tk-banner .tk-banner-subtitle,
.tk-banner .tk-banner-description,
.tk-banner .tk-banner-buttons,
.tk-banner .banner-content,
.tk-banner .banner-text {
  position: relative;
  z-index: 15;
  overflow: visible;
}

/* 确保旧的背景元素正确定位 */
.tk-banner .tk-banner__bg,
.tk-banner .tk-banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
}

/* 确保banner的层级结构正确 - 限制为首页专用 */
.VPHome .tk-banner {
  /* 确保banner容器有合适的层级上下文 */
  z-index: 1;
}

.VPHome .tk-banner > *:not(.tk-banner__bg):not(.tk-banner-bg):not([class*="banner"][class*="bg"]) {
  /* 确保所有非背景的banner子元素都在背景之上 */
  position: relative;
  z-index: 2;
}
</style>