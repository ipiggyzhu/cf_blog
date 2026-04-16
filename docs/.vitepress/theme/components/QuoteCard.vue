<template>
  <div class="quote-card" :class="{ 'quote-fade': isChanging }">
    <div class="quote-content">
      <div class="quote-header">
        <div class="quote-info">
          <div class="quote-icon">📖</div>
          <h3 class="quote-title">每日英语</h3>
        </div>
      </div>
      
      <div class="quote-main">
        <div class="quote-image-container">
          <img 
            :src="currentImageUrl" 
            :alt="currentQuote.alt" 
            class="quote-image" 
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <div class="quote-overlay"></div>
        </div>
        
        <div class="quote-text-container">
          <blockquote class="quote-text-en">
            "{{ currentQuote.english }}"
          </blockquote>
          <blockquote class="quote-text-zh">
            "{{ currentQuote.chinese }}"
          </blockquote>
          <div class="quote-meta">
            <span class="quote-author">{{ currentQuote.author }}</span>
            <span class="quote-source">{{ currentQuote.source }}</span>
          </div>
        </div>
      </div>
      

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 中英文对照的每日英语数据 - 使用 R2 存储的图片，确保国内访问稳定
const quotes = [
  {
    english: "The way to get started is to quit talking and begin doing.",
    chinese: "开始行动的方法就是停止空谈，开始实干。",
    author: "华特·迪士尼",
    source: "Walt Disney",
    image: "https://image.itpiggy.us/Cover/1.webp",
    alt: "Beautiful sunrise over mountains"
  },
  {
    english: "Life is what happens to you while you're busy making other plans.",
    chinese: "生活就是在你忙于制定其他计划时，在你身上发生的事。",
    author: "约翰·列侬",
    source: "John Lennon",
    image: "https://image.itpiggy.us/Cover/2.webp",
    alt: "Peaceful nature scene"
  },
  {
    english: "The future belongs to those who believe in the beauty of their dreams.",
    chinese: "未来属于那些相信梦想之美的人。",
    author: "埃莉诺·罗斯福",
    source: "Eleanor Roosevelt",
    image: "https://image.itpiggy.us/Cover/3.webp",
    alt: "Dream-like sky"
  },
  {
    english: "You have been my friend. That in itself is a tremendous thing.",
    chinese: "你一直是我的朋友，这本身就是一件了不起的事。",
    author: "夏洛特",
    source: "Charlotte's Web",
    image: "https://image.itpiggy.us/Cover/4.webp",
    alt: "Friendship theme"
  },
  {
    english: "After all, tomorrow is another day!",
    chinese: "毕竟，明天又是新的一天！",
    author: "郝思嘉",
    source: "Gone with the Wind",
    image: "https://image.itpiggy.us/Cover/5.webp",
    alt: "New day sunrise"
  },
  {
    english: "In the middle of difficulty lies opportunity.",
    chinese: "困难之中蕴含着机遇。",
    author: "阿尔伯特·爱因斯坦",
    source: "Albert Einstein",
    image: "https://image.itpiggy.us/Cover/6.webp",
    alt: "Opportunity landscape"
  },
  {
    english: "You're braver than you believe, stronger than you seem, and smarter than you think.",
    chinese: "你比你想象的更勇敢，比你看起来更强大，比你认为的更聪明。",
    author: "A.A.米尔恩",
    source: "Winnie the Pooh",
    image: "https://image.itpiggy.us/Cover/7.webp",
    alt: "Inspiring forest scene"
  },
  {
    english: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    chinese: "生命中最大的荣耀不在于从不跌倒，而在于每次跌倒后都能重新站起。",
    author: "纳尔逊·曼德拉",
    source: "Nelson Mandela",
    image: "https://image.itpiggy.us/Cover/8.webp",
    alt: "Rising sun motivation"
  },
  {
    english: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    chinese: "成功不是终点，失败不是致命的：重要的是继续前进的勇气。",
    author: "温斯顿·丘吉尔",
    source: "Winston Churchill",
    image: "https://image.itpiggy.us/Cover/9.webp",
    alt: "Mountain peak success"
  },
  {
    english: "It does not matter how slowly you go as long as you do not stop.",
    chinese: "前进缓慢没关系，只要你不停止脚步。",
    author: "孔子",
    source: "Confucius",
    image: "https://image.itpiggy.us/Cover/10.webp",
    alt: "Steady progress"
  }
]

const currentQuoteIndex = ref(0)
const currentQuote = ref(quotes[0])
const isChanging = ref(false)
const currentImageUrl = ref('')
const isImageLoading = ref(true)
const imageRetryCount = ref(0)
const maxRetries = 3

// 备用图片URLs - 使用 R2 存储的图片作为备用，确保稳定性
const fallbackImages = [
  'https://image.itpiggy.us/Cover/1.webp',
  'https://image.itpiggy.us/Cover/2.webp',
  'https://image.itpiggy.us/Cover/3.webp',
  'https://image.itpiggy.us/Cover/4.webp',
  'https://image.itpiggy.us/Cover/5.webp',
  '/img/logo.png', // 本地备用图片
]

// 获取随机格言
const getRandomQuote = () => {
  let randomIndex
  do {
    randomIndex = Math.floor(Math.random() * quotes.length)
  } while (randomIndex === currentQuoteIndex.value && quotes.length > 1)
  
  currentQuoteIndex.value = randomIndex
  return quotes[randomIndex]
}

// 处理图片加载错误
const handleImageError = () => {
  console.warn('图片加载失败:', currentImageUrl.value)
  
  // 尝试使用备用图片
  if (imageRetryCount.value < fallbackImages.length) {
    console.log(`尝试使用备用图片 ${imageRetryCount.value + 1}/${fallbackImages.length}`)
    currentImageUrl.value = fallbackImages[imageRetryCount.value]
    imageRetryCount.value++
  } else {
    // 所有备用图片都失败，隐藏图片使用默认背景
    console.log('所有图片都加载失败，使用默认渐变背景')
    currentImageUrl.value = '' // 清空src，触发默认背景
    isImageLoading.value = false
  }
}

// 处理图片加载成功
const handleImageLoad = () => {
  console.log('图片加载成功:', currentImageUrl.value)
  isImageLoading.value = false
  imageRetryCount.value = 0 // 重置重试计数
}

// 初始化图片URL
const initializeImage = (quote) => {
  isImageLoading.value = true
  imageRetryCount.value = 0
  
  // 尝试使用CDN加速的URL
  const originalUrl = quote.image
  // 使用jsDelivr CDN加速（如果是GitHub资源）
  if (originalUrl.includes('github.com')) {
    currentImageUrl.value = originalUrl.replace('github.com', 'cdn.jsdelivr.net/gh')
  } else {
    currentImageUrl.value = originalUrl
  }
}

// 自动轮询切换格言
let autoSwitchTimer = null
const SWITCH_INTERVAL = 8000 // 8秒切换一次

const switchQuote = () => {
  isChanging.value = true
  setTimeout(() => {
    const newQuote = getRandomQuote()
    currentQuote.value = newQuote
    initializeImage(newQuote)
    isChanging.value = false
  }, 300) // 等淡出动画完成再切换内容
}

// 组件挂载时初始化
onMounted(() => {
  // 随机选择一条格言显示
  const initialQuote = getRandomQuote()
  currentQuote.value = initialQuote
  initializeImage(initialQuote)

  // 启动自动轮询
  autoSwitchTimer = setInterval(switchQuote, SWITCH_INTERVAL)
})

onUnmounted(() => {
  if (autoSwitchTimer) {
    clearInterval(autoSwitchTimer)
    autoSwitchTimer = null
  }
})
</script>

<style scoped>
.quote-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--vp-c-border);
  position: relative;
  min-height: 320px; /* 调整为合适的高度，与站点信息卡片对齐 */
  height: auto; /* 允许高度自动调整 */
  display: flex;
  flex-direction: column;
  width: 280px !important; /* 锁死宽度，与站点信息卡片右边对齐 (250px内容 + 30px padding) */
  max-width: 280px !important; /* 锁死最大宽度 */
  box-sizing: border-box; /* 包含边框和内边距在宽度内 */
  min-width: 0; /* 允许flex项目收缩 */
  flex-shrink: 1; /* 允许收缩 */
}

.quote-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
}

.quote-fade {
  opacity: 0.7;
  transform: scale(0.98);
}

.quote-content {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.quote-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid var(--vp-c-border);
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg-alt) 100%);
}

.quote-header .quote-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quote-icon {
  font-size: 22px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.quote-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: 0.5px;
}



.quote-main {
  position: relative;
  padding: 0;
  flex: 1; /* 让主内容区域填充剩余空间 */
}

.quote-image-container {
  position: relative;
  width: 100%;
  height: 240px; /* 调整图片容器为合适高度 */
  overflow: hidden;
  flex-shrink: 0; /* 图片容器不收缩 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 默认渐变背景 */
}

.quote-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: block; /* 移除img元素默认的底部间隙 */
}

.quote-card:hover .quote-image {
  transform: scale(1.08);
}

.quote-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.quote-text-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
  z-index: 2;
  min-height: 120px; /* 确保文字区域有足够高度 */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-sizing: border-box; /* 确保内边距包含在宽度内 */
  max-width: 100%; /* 防止文字容器超出边界 */
}

.quote-text-en {
  margin: 0 0 10px 0;
  font-size: 14px;
  line-height: 1.5;
  font-style: italic;
  font-weight: 500;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
  border: none;
  padding: 0;
  letter-spacing: 0.3px;
  word-wrap: break-word; /* 长单词换行 */
  overflow-wrap: break-word; /* 确保文字换行 */
  max-width: 100%; /* 防止文字超出容器 */
}

.quote-text-zh {
  margin: 0 0 12px 0;
  font-size: 13px;
  line-height: 1.4;
  font-style: normal;
  font-weight: 400;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
  border: none;
  padding: 0;
  opacity: 0.95;
  border-left: 3px solid rgba(255, 255, 255, 0.6);
  padding-left: 10px;
  margin-left: 4px;
  word-wrap: break-word; /* 长单词换行 */
  overflow-wrap: break-word; /* 确保文字换行 */
  max-width: calc(100% - 14px); /* 减去左边距和内边距 */
}

.quote-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quote-author {
  font-weight: 600;
  font-size: 13px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.3px;
}

.quote-source {
  font-size: 11px;
  opacity: 0.85;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
  font-style: italic;
}



/* 图片加载动画 */
.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: white;
  z-index: 3;
  font-size: 14px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 图片加载失败时的默认样式 */
.quote-image-container:has(.quote-image[src=""]) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quote-image-container:has(.quote-image[src=""]) .quote-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%);
}

/* 深色模式适配 */
html.dark .quote-card {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

html.dark .quote-header {
  border-color: var(--vp-c-border);
  background: linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 100%);
}

html.dark .quote-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .quote-card {
    border-radius: 12px;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 280px !important; /* 移动端合适高度 */
    flex-shrink: 1;
  }
  
  .quote-header {
    padding: 14px 18px 10px;
  }
  
  .quote-title {
    font-size: 16px;
  }
  
  .quote-image-container {
    height: 200px; /* 移动端合适的图片高度 */
  }
  
  .quote-text-container {
    padding: 16px;
    min-height: 100px; /* 移动端确保足够的文字空间 */
  }
  
  .quote-text-en {
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .quote-text-zh {
    font-size: 12px;
    line-height: 1.4;
    margin-bottom: 10px;
  }
  
  .quote-author {
    font-size: 13px;
  }
  
  .quote-source {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .quote-image-container {
    height: 170px; /* 小屏设备适当增加高度 */
  }
  
  .quote-text-container {
    padding: 14px;
    min-height: 90px; /* 小屏设备确保文字空间 */
  }
  
  .quote-text-en {
    font-size: 12px;
    line-height: 1.5;
  }
  
  .quote-text-zh {
    font-size: 11px;
    line-height: 1.4;
  }
}
</style>


