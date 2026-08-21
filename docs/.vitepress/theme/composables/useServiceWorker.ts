/**
 * Service Worker 注册
 *
 * 关键点：sw.js 在 install 时就 skipWaiting()、activate 时 clients.claim()，
 * 所以首次访问时也会触发一次 controllerchange。如果无条件 reload，
 * 用户第一次打开站点就会白刷一次页面。这里用「进入页面时是否已有 controller」
 * 来区分「首次接管」与「真正的版本更新」，只有后者才刷新。
 */
export function useServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  // 页面加载时就已经被某个 SW 控制 => 之后的 controllerchange 意味着版本更新
  const hadController = !!navigator.serviceWorker.controller
  let reloading = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      console.log('[SW] Service Worker registered successfully:', registration.scope)

      // 发现新版本：让新 SW 立即接管，接管后由 controllerchange 统一刷新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[SW] New content available, activating...')
            newWorker.postMessage({ type: 'SKIP_WAITING' })
          }
        })
      })

      // 每小时检查一次更新
      setInterval(() => registration.update(), 60 * 60 * 1000)
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error)
    }
  })
}

// 清空所有缓存
export function clearCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
    console.log('[SW] Cache cleared')
  }
}

// 手动检查更新
export function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update()
        console.log('[SW] Checking for updates...')
      }
    })
  }
}
