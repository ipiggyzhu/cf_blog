<template>
  <div class="quote-card">
    <div class="quote-content">
      <div class="quote-header">
        <div class="quote-icon">💭</div>
        <h3 class="quote-title">Daily Quote</h3>
      </div>
      
      <div class="quote-main">
        <div class="quote-image-container">
          <img :src="currentQuote.image" :alt="currentQuote.alt" class="quote-image" />
          <div class="quote-overlay"></div>
        </div>
        
        <div class="quote-text-container">
          <blockquote class="quote-text">
            "{{ currentQuote.text }}"
          </blockquote>
          <div class="quote-meta">
            <span class="quote-author">{{ currentQuote.author }}</span>
            <span class="quote-source">{{ currentQuote.source }}</span>
          </div>
        </div>
      </div>
      
      <div class="quote-footer">
        <button @click="nextQuote" class="refresh-btn">
          <span class="refresh-icon">🔄</span>
          <span>Next Quote</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 英语格言和电影金句数据
const quotes = [
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    source: "Entrepreneur",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    alt: "Beautiful sunrise over mountains"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    source: "Beautiful Boy",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    alt: "Peaceful nature scene"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    source: "Speech",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    alt: "Dream-like sky"
  },
  {
    text: "You have been my friend. That in itself is a tremendous thing.",
    author: "Charlotte",
    source: "Charlotte's Web",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    alt: "Friendship theme"
  },
  {
    text: "After all, tomorrow is another day!",
    author: "Scarlett O'Hara",
    source: "Gone with the Wind",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    alt: "New day sunrise"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    source: "Scientist",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
    alt: "Opportunity landscape"
  },
  {
    text: "You're braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne",
    source: "Winnie the Pooh",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    alt: "Inspiring forest scene"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    source: "Autobiography",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    alt: "Rising sun motivation"
  }
]

const currentQuoteIndex = ref(0)
const currentQuote = ref(quotes[0])

// 获取随机格言
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  currentQuoteIndex.value = randomIndex
  currentQuote.value = quotes[randomIndex]
}

// 下一个格言
const nextQuote = () => {
  getRandomQuote()
}

// 组件挂载时随机选择一个格言
onMounted(() => {
  getRandomQuote()
})
</script>

<style scoped>
.quote-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--vp-c-border);
}

.quote-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.quote-content {
  padding: 0;
}

.quote-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--vp-c-border);
}

.quote-icon {
  font-size: 20px;
}

.quote-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.quote-main {
  position: relative;
  padding: 0;
}

.quote-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.quote-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.quote-card:hover .quote-image {
  transform: scale(1.05);
}

.quote-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.quote-text-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  color: white;
  z-index: 2;
}

.quote-text {
  margin: 0 0 12px 0;
  font-size: 16px;
  line-height: 1.6;
  font-style: italic;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  border: none;
  padding: 0;
}

.quote-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quote-author {
  font-weight: 600;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.quote-source {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.quote-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: center;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.refresh-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.refresh-btn:hover .refresh-icon {
  transform: rotate(180deg);
}

/* 深色模式适配 */
html.dark .quote-card {
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-border);
}

html.dark .quote-header {
  border-color: var(--vp-c-border);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .quote-image-container {
    height: 160px;
  }
  
  .quote-text {
    font-size: 14px;
  }
  
  .quote-text-container {
    padding: 16px;
  }
}
</style>


