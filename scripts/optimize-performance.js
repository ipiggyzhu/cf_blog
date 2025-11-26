#!/usr/bin/env node

/**
 * 性能优化检查脚本
 * 自动检查和提示性能优化项
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 开始性能优化检查...\n')

const checks = []

// 1. 检查 _headers 文件
const headersPath = path.join(__dirname, '../docs/public/_headers')
if (fs.existsSync(headersPath)) {
  checks.push({ name: '_headers 文件', status: '✅', message: '已配置缓存策略' })
} else {
  checks.push({ name: '_headers 文件', status: '❌', message: '未找到，建议创建' })
}

// 2. 检查图片格式
const publicDir = path.join(__dirname, '../docs/public')
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir, { recursive: true })
  const images = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
  const webpImages = files.filter(f => /\.webp$/i.test(f))
  
  if (images.length > 0) {
    checks.push({ 
      name: '图片格式', 
      status: '⚠️', 
      message: `发现 ${images.length} 个非 WebP 图片，建议转换为 WebP` 
    })
  } else if (webpImages.length > 0) {
    checks.push({ 
      name: '图片格式', 
      status: '✅', 
      message: `所有图片都是 WebP 格式 (${webpImages.length} 个)` 
    })
  }
}

// 3. 检查 Service Worker
const swPath = path.join(__dirname, '../docs/public/sw.js')
if (fs.existsSync(swPath)) {
  checks.push({ name: 'Service Worker', status: '✅', message: '已配置' })
} else {
  checks.push({ name: 'Service Worker', status: 'ℹ️', message: '未配置（可选）' })
}

// 4. 检查字体优化
const fontScss = path.join(__dirname, '../docs/.vitepress/theme/style/font.scss')
if (fs.existsSync(fontScss)) {
  const content = fs.readFileSync(fontScss, 'utf-8')
  if (content.includes('font-display: swap')) {
    checks.push({ name: '字体优化', status: '✅', message: 'font-display: swap 已配置' })
  } else {
    checks.push({ name: '字体优化', status: '⚠️', message: '建议添加 font-display: swap' })
  }
}

// 5. 检查构建配置
const configPath = path.join(__dirname, '../docs/.vitepress/config.ts')
if (fs.existsSync(configPath)) {
  const content = fs.readFileSync(configPath, 'utf-8')
  if (content.includes('minify') || content.includes('terser')) {
    checks.push({ name: '代码压缩', status: '✅', message: '已配置' })
  } else {
    checks.push({ name: '代码压缩', status: 'ℹ️', message: '可以添加 Terser 配置' })
  }
}

// 6. 检查依赖大小
const packageJson = require('../package.json')
const deps = Object.keys(packageJson.dependencies || {})
const devDeps = Object.keys(packageJson.devDependencies || {})

checks.push({ 
  name: '依赖数量', 
  status: 'ℹ️', 
  message: `生产依赖: ${deps.length}, 开发依赖: ${devDeps.length}` 
})

// 输出检查结果
console.log('📊 检查结果:\n')
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.message}`)
})

console.log('\n' + '='.repeat(60))
console.log('\n💡 优化建议:\n')

const suggestions = [
  '1. 在 Cloudflare Dashboard 启用 Auto Minify (HTML, CSS, JS)',
  '2. 启用 Brotli 压缩',
  '3. 启用 HTTP/3 和 Early Hints',
  '4. 使用 Cloudflare R2 存储图片',
  '5. 添加预加载关键资源',
  '6. 使用 Lighthouse 测试性能',
  '7. 查看 PERFORMANCE_OPTIMIZATION.md 获取详细指南',
]

suggestions.forEach(s => console.log(s))

console.log('\n' + '='.repeat(60))
console.log('\n✨ 运行 `pnpm docs:build` 构建优化后的版本\n')
