# 玻璃态效果 (Glassmorphism Effect)

为 VitePress 博客网站添加现代化的玻璃态视觉效果。

## 功能特性

- ✨ 全局玻璃态效果
- 🎨 支持亮色/暗色模式
- 📱 移动端响应式优化
- 🚀 性能优化和硬件加速
- 🔧 浏览器降级方案
- 🎯 与动态壁纸系统完美兼容

## 效果预览

玻璃效果应用于以下元素：
- **导航栏** - 模糊强度 16px
- **侧边栏** - 模糊强度 14px
- **内容区** - 模糊强度 12px
- **卡片** - 模糊强度 10px

## 如何使用

### 启用玻璃效果

玻璃效果已自动集成到主题中，无需额外配置即可使用。

### 禁用玻璃效果

如果需要禁用玻璃效果，在 `docs/.vitepress/theme/style/index.scss` 中注释掉以下行：

```scss
// @use "./glassmorphism/index.scss" as *; // 玻璃态效果
```

### 自定义玻璃效果参数

可以通过修改 CSS 变量来自定义玻璃效果：

```scss
:root {
  /* 调整模糊强度 */
  --glass-blur-nav: 20px;        /* 导航栏 */
  --glass-blur-sidebar: 16px;    /* 侧边栏 */
  --glass-blur-content: 14px;    /* 内容区 */
  --glass-blur-card: 12px;       /* 卡片 */
  
  /* 调整透明度 */
  --glass-opacity-nav: 0.80;     /* 导航栏 */
  --glass-opacity-sidebar: 0.75; /* 侧边栏 */
  --glass-opacity-content: 0.72; /* 内容区 */
  --glass-opacity-card: 0.70;    /* 卡片 */
  
  /* 调整背景色 */
  --glass-bg-nav: rgba(255, 255, 255, 0.80);
  --glass-bg-sidebar: rgba(255, 255, 255, 0.75);
  --glass-bg-content: rgba(255, 255, 255, 0.72);
  --glass-bg-card: rgba(255, 255, 255, 0.70);
}
```

### 为自定义元素添加玻璃效果

使用提供的工具类：

```html
<!-- 轻度玻璃效果 -->
<div class="glass-light">内容</div>

<!-- 中度玻璃效果 -->
<div class="glass-medium">内容</div>

<!-- 重度玻璃效果 -->
<div class="glass-heavy">内容</div>
```

或使用 SCSS Mixin：

```scss
@use './glassmorphism/mixins' as *;

.my-custom-element {
  @include glass-card;
  
  &:hover {
    @include glass-hover;
  }
}
```

## 浏览器兼容性

### 完整支持
- Chrome/Edge 76+
- Firefox 103+
- Safari 9+

### 降级支持
不支持 `backdrop-filter` 的浏览器会自动使用更高透明度的纯色背景作为降级方案。

## 性能优化

### 移动端优化
- 自动降低模糊强度 50%
- 略微提高透明度
- 优化动画性能

### 硬件加速
所有玻璃效果元素都启用了硬件加速：
- `will-change: transform, opacity`
- `backface-visibility: hidden`
- `transform: translateZ(0)`

### 减少动画偏好
支持 `prefers-reduced-motion` 媒体查询，为偏好减少动画的用户提供更简洁的体验。

## 与动态壁纸系统的兼容性

玻璃效果与动态壁纸系统完美兼容：
- 正确的 z-index 层级设置
- 不干扰壁纸切换动画
- 保持呼吸动画效果
- 首页 Banner 区域保持透明

## 常见问题

### Q: 玻璃效果看起来不明显？
A: 确保背景有足够的内容（如动态壁纸）。玻璃效果需要背后有内容才能显示模糊效果。

### Q: 移动端性能不佳？
A: 移动端已自动降低模糊强度。如需进一步优化，可以在 `_variables.scss` 中调整移动端的模糊值。

### Q: 暗色模式下效果不理想？
A: 可以在 `.dark` 选择器下调整暗色模式的 CSS 变量值。

### Q: 如何只为特定页面启用玻璃效果？
A: 可以使用页面特定的类名来限制样式作用范围：

```scss
.my-special-page {
  .VPDoc {
    @include glass-effect(var(--glass-blur-content), var(--glass-bg-content));
  }
}
```

### Q: 打印时玻璃效果会影响输出吗？
A: 不会。打印时会自动移除玻璃效果，使用纯色背景以确保打印质量。

## 文件结构

```
glassmorphism/
├── _variables.scss    # CSS 变量定义
├── _mixins.scss       # 可复用的 Mixin
├── _nav.scss          # 导航栏样式
├── _content.scss      # 内容区样式
├── _card.scss         # 卡片样式
├── _sidebar.scss      # 侧边栏样式
├── index.scss         # 主入口文件
└── README.md          # 使用文档
```

## 技术细节

### CSS 变量系统
使用 CSS 自定义属性实现主题化和动态调整。

### SCSS Mixin
提供可复用的 Mixin 简化样式编写。

### 渐进增强
采用渐进增强策略，确保在不支持的浏览器中也能正常显示。

### 性能优先
使用硬件加速、优化选择器、减少重绘和回流。

## 更新日志

### v1.0.0 (2025-01-17)
- ✨ 初始版本发布
- 🎨 支持全局玻璃态效果
- 📱 移动端响应式优化
- 🚀 性能优化
- 🔧 浏览器降级方案

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
