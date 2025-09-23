<template>
  <div class="link-item-card">
    <a :href="data.link" :title="data.name" target="_blank" rel="noopener">
      <!-- 头像 -->
      <div class="link-avatar">
        <img
          v-if="!imageFailed && data.avatar"
          :src="data.avatar"
          :alt="data.name"
          @error="handleImageError"
          :class="{ irregular: data.irregular }"
        />
        <span v-else class="avatar-placeholder">
          {{ data.name ? data.name.charAt(0).toUpperCase() : '?' }}
        </span>
      </div>

      <!-- 信息 -->
      <div class="link-content">
        <div class="link-name">{{ data.name }}</div>
        <div class="link-desc" :title="data.descr">
          {{ data.descr }}
        </div>
      </div>
    </a>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})

import { ref } from 'vue'
const imageFailed = ref(false)

const handleImageError = () => {
  imageFailed.value = true
}
</script>

<style scoped>
.link-item-card {
  height: 100px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
  overflow: hidden;
}

.link-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.link-item-card a {
  display: flex;
  align-items: center;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.link-avatar {
  flex: 0 0 100px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.link-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.link-avatar img.irregular {
  border-radius: 8px;
  object-fit: contain;
}

.link-avatar .avatar-placeholder {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #555;
  font-size: 1.2rem;
}

.link-item-card:hover .link-avatar img,
.link-item-card:hover .avatar-placeholder {
  transform: scale(1.2);
}

.link-content {
  flex: 1;
  padding: 0 16px 0 0px;
}

.link-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
}

.link-desc {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  display: -webkit-box; /* 兼容 WebKit 旧版本 */
  display: box;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  -webkit-line-clamp: 2; /* 兼容旧版 */
  line-clamp: 2; /* 标准属性（核心） */
  overflow: hidden;
  line-height: 1.4;
}
</style>