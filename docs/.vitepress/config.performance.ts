/**
 * VitePress 性能优化配置
 * 针对 Cloudflare Pages 部署优化
 */

import type { UserConfig } from 'vite'

export const performanceConfig: UserConfig = {
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router'],
          // VitePress 核心
          'vitepress-vendor': ['vitepress'],
          // 图表库（如果使用）
          'charts': ['echarts'],
          // 其他大型库
          'utils': ['nprogress-v2'],
        },
        // 优化资源文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log'], // 移除特定函数调用
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 设置 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用 sourcemap（可选，调试用）
    sourcemap: false,
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'vitepress',
      '@vercel/analytics',
      '@vercel/speed-insights',
    ],
    // exclude: [] // 已清理 - 移除了oh-my-live2d等不需要的依赖项
  },
  
  // 服务器配置
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './theme/index.ts',
        './theme/components/*.vue',
      ],
    },
  },
  
  // CSS 优化
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        // 减少 SCSS 编译时间
        charset: false,
      },
    },
  },
}

/**
 * 图片优化建议
 */
export const imageOptimizationTips = {
  // 使用 WebP 格式
  webp: true,
  // 使用 Cloudflare Images 或 R2
  cloudflareR2: true,
  // 图片 CDN 加速
  cdn: 'https://image.itpiggy.top',
  // 懒加载
  lazyLoad: true,
}

/**
 * 字体优化建议
 */
export const fontOptimizationTips = {
  // 使用 font-display: swap
  fontDisplay: 'swap',
  // 预加载关键字体
  preload: true,
  // 使用系统字体作为后备
  systemFontFallback: true,
}
