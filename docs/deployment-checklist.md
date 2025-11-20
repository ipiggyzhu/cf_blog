---
date: 2025-11-20 23:51:29
title: deployment-checklist
permalink: /pages/a432fd
categories:
  - 
coverImg: https://image.itpiggy.top/Cover/10.webp
---
# Cloudflare Pages 部署检查清单

## 构建前检查

### 依赖版本
- [ ] Node.js 版本 >= 18.0.0
- [ ] pnpm 版本 >= 8.0.0
- [ ] 所有依赖已安装 (`pnpm install`)
- [ ] 没有安全漏洞 (`pnpm audit`)

### 配置正确性
- [ ] `docs/.vitepress/config.ts` 中 `base` 路径正确
- [ ] `wrangler.toml` 配置正确
- [ ] R2 绑定配置正确（如使用）
- [ ] 环境变量已设置（如需要）

### 代码质量
- [ ] 没有 TypeScript 错误
- [ ] 没有 ESLint 警告
- [ ] 所有测试通过（如有）

## 构建检查

### 执行构建
```bash
pnpm docs:build
```

### 构建输出检查
- [ ] 构建成功完成，无错误
- [ ] 输出目录存在：`docs/.vitepress/dist`
- [ ] 关键文件存在：
  - [ ] `index.html`
  - [ ] `assets/` 目录
  - [ ] `img/` 目录（如有静态图片）
- [ ] 文件大小合理（总大小 < 25MB）
- [ ] JavaScript chunks 大小合理（< 500KB 每个）

### 本地测试
```bash
# Windows
scripts\test-local.bat

# Linux/Mac
bash scripts/test-local.sh
```

- [ ] 本地服务器启动成功
- [ ] 首页加载正常
- [ ] 导航功能正常
- [ ] API 端点响应正常：
  - [ ] `/api/images` 返回图片列表
  - [ ] `/geo` 返回地理位置
  - [ ] `/api/geo` 返回地理位置

## 部署配置

### Cloudflare Pages 设置
- [ ] 项目已创建
- [ ] 构建命令：`pnpm docs:build`
- [ ] 构建输出目录：`docs/.vitepress/dist`
- [ ] 根目录：`/`
- [ ] 环境变量已配置：
  - [ ] `NODE_VERSION=18`
  - [ ] `PNPM_VERSION=8`

### Functions 配置
- [ ] Functions 目录：`functions`
- [ ] 兼容日期：`2024-01-01`
- [ ] R2 绑定已配置（如使用）

## 部署后验证

### 基础功能
- [ ] 网站可访问
- [ ] 首页加载正常（< 3 秒）
- [ ] 没有 404 错误
- [ ] 没有控制台错误

### 资源加载
- [ ] CSS 文件加载正常
- [ ] JavaScript 文件加载正常
- [ ] 图片加载正常
- [ ] 字体加载正常（如有）

### API 功能
- [ ] `/api/images` 正常工作
- [ ] `/geo` 正常工作
- [ ] `/api/geo` 正常工作
- [ ] CORS 头正确设置

### 性能指标
使用 Chrome DevTools Lighthouse 测试：
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1

### 错误处理
- [ ] 错误被正确捕获（检查控制台）
- [ ] API 失败时有降级方案
- [ ] 资源加载失败不影响页面

### 多浏览器测试
- [ ] Chrome/Edge 正常
- [ ] Firefox 正常
- [ ] Safari 正常（如可测试）
- [ ] 移动浏览器正常

### 网络条件测试
- [ ] 快速 3G 网络下可用
- [ ] 慢速 3G 网络下可用
- [ ] 离线时显示友好提示（如有 SW）

## 监控和日志

### 查看日志
- [ ] Cloudflare Pages 构建日志无错误
- [ ] Functions 日志无异常错误
- [ ] 浏览器控制台无错误

### 性能监控
- [ ] Cloudflare Analytics 正常工作
- [ ] Google Analytics 正常工作（如配置）
- [ ] 百度统计正常工作（如配置）

## 回滚计划

如果部署出现问题：

1. 在 Cloudflare Pages 控制台找到上一个成功的部署
2. 点击 "Rollback to this deployment"
3. 等待回滚完成
4. 验证网站恢复正常
5. 在本地修复问题后重新部署

## 常见问题

### 构建失败
- 检查 Node.js 和 pnpm 版本
- 检查依赖是否完整安装
- 查看构建日志中的错误信息

### 资源 404
- 检查 `base` 路径配置
- 检查文件是否在构建输出中
- 检查文件路径大小写

### API 不工作
- 检查 Functions 目录结构
- 检查 R2 绑定配置
- 查看 Functions 日志

### 性能问题
- 检查资源大小
- 启用缓存
- 优化图片
- 减少 JavaScript 体积

## 联系支持

如果遇到无法解决的问题：
- Cloudflare 社区：https://community.cloudflare.com/
- Cloudflare 支持：https://dash.cloudflare.com/support
- VitePress 文档：https://vitepress.dev/
