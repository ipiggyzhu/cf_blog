/**
 * Analytics 延迟加载工具
 * @description 延迟加载分析脚本，避免阻塞首屏渲染
 */

/**
 * 延迟加载百度统计
 * @param id 百度统计ID
 */
export function loadBaiduAnalytics(id: string): void {
  if (typeof window === 'undefined') return

  // 延迟3秒加载，避免影响首屏
  setTimeout(() => {
    const hm = document.createElement('script')
    hm.src = `https://hm.baidu.com/hm.js?${id}`
    hm.async = true
    hm.onerror = () => console.warn('[Analytics] Baidu Analytics failed to load')

    const s = document.getElementsByTagName('script')[0]
    s.parentNode?.insertBefore(hm, s)

    console.log('[Analytics] 📊 Baidu Analytics loaded (delayed)')
  }, 3000)
}

/**
 * 延迟加载Google Analytics
 * @param id Google Analytics ID
 */
export function loadGoogleAnalytics(id: string): void {
  if (typeof window === 'undefined') return

  // 延迟3秒加载
  setTimeout(() => {
    // 加载gtag.js
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    script.async = true
    script.onerror = () => console.warn('[Analytics] Google Analytics failed to load')
    document.head.appendChild(script)

    // 初始化gtag
    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || []
      function gtag(...args: any[]) {
        ;(window as any).dataLayer.push(arguments)
      }
      ;(window as any).gtag = gtag
      gtag('js', new Date())
      gtag('config', id)

      console.log('[Analytics] 📊 Google Analytics loaded (delayed)')
    }
  }, 3000)
}

/**
 * 统一初始化所有分析工具（延迟加载）
 */
export function initAnalytics(config: {
  baidu?: string
  google?: string
}): void {
  if (typeof window === 'undefined') return

  // 等待页面完全加载
  if (document.readyState === 'complete') {
    loadAnalytics(config)
  } else {
    window.addEventListener('load', () => loadAnalytics(config))
  }
}

function loadAnalytics(config: { baidu?: string; google?: string }): void {
  if (config.baidu) {
    loadBaiduAnalytics(config.baidu)
  }
  if (config.google) {
    loadGoogleAnalytics(config.google)
  }
}
