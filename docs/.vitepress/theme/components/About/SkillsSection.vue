<template>
  <div class="skills-section" :class="{ visible: isVisible }">
    <h2 class="skills-title">关于我</h2>
    <div class="skills-content">
      <div class="skills-left" :class="{ visible: skillsLeftVisible }" ref="skillsLeftRef">
        <div class="skills-subtitle">个人兴趣</div>
        <div v-for="skill in majorSkills" 
             :key="skill.name" 
             class="skill-bar-item"
             v-memo="[skill]">
          <div class="skill-bar-label">
            <span>{{ skill.name }}</span>
            <span>{{ skill.percent }}%</span>
          </div>
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" 
                 :style="{ width: skill.percent + '%', background: skill.color }">
            </div>
          </div>
          <div class="skill-bar-tags" v-if="skill.tags">
            <span class="skill-tag" 
                  v-for="tag in skill.tags" 
                  :key="tag.name"
                  :style="{ background: tag.bg, color: tag.color }">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="skills-right" :class="{ visible: skillsRightVisible }" ref="skillsRightRef">
        <div class="skills-subtitle">{{ selfIntroduction.title }}</div>
        <div class="self-introduction">
          <p v-for="(paragraph, index) in introductionParagraphs" 
             :key="index" 
             class="intro-paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TkIcon } from "vitepress-theme-teek";
import { useIntersectionObserver } from './useIntersectionObserver';
import { majorSkills, selfIntroduction } from './data';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
});

// 使用组合函数创建监听动画
const { isVisible: skillsLeftVisible, targetRef: skillsLeftRef } = useIntersectionObserver(0.1);
const { isVisible: skillsRightVisible, targetRef: skillsRightRef } = useIntersectionObserver(0.1);

// 自我介绍段落分割
const introductionParagraphs = computed(() => {
  return selfIntroduction.content.split('\n').filter(paragraph => paragraph.trim() !== '');
});
</script>

<style scoped>
.skills-section {
  margin: auto;
  border-radius: 24px;
  max-width: 1200px;
  padding: 2.5rem 2rem 2.5rem 2rem;
  transition: box-shadow 0.22s, transform 0.18s, border 0.18s, opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  opacity: 0;
  transform: scale(0.8);
}

.skills-section.visible {
  opacity: 1;
  transform: scale(1);
}

/* 修复移动端动画问题 */
.skills-left,
.skills-right {
  opacity: 0;
  /* 修改为缩放动画 */
  transform: scale(0.8);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.skills-left.visible,
.skills-right.visible {
  opacity: 1;
  /* 移除 translateY */
  transform: scale(1);
}

.skills-title {
  text-align: center;
  font-size: 2.3rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  letter-spacing: 2px;
}

.skills-title::after {
  /* 我的技能下划线 */
  content: '';
  display: block;
  margin: 0.6rem auto 0 auto;
  width: 150px;
  height: 4px;
  border-radius: 2px;
  background: var(--vp-c-brand-1);
}

.skills-content {
  display: flex;
  gap: 2.5rem;
  margin-top: 2.5rem;
}

.skills-left {
  flex: 1.1;
  min-width: 260px;
}

.skills-right {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
}

.skills-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.skill-bar-item {
  margin-bottom: 0.8rem;
}

.skill-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 1.08rem;
  margin-bottom: 0.3rem;
}

.skill-bar-bg {
  width: 100%;
  height: 8px;
  background: #e5eaf3;
  border-radius: 6px;
  overflow: hidden;
}

.skill-bar-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
}

.skill-bar-tags {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.skill-tag {
  border-radius: 16px;
  padding: 0.05rem 0.5rem;
  font-size: 0.98rem;
  font-weight: 500;
  display: inline-block;
  letter-spacing: 0.5px;
  transition: background 0.18s;
}

.self-introduction {
  margin-top: 0.8rem;
  padding: 1.2rem;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border-radius: 12px;
  border: 1px solid #e8ecf7;
}

.intro-paragraph {
  margin: 0 0 1rem 0;
  line-height: 1.8;
  color: #4a5568;
  font-size: 0.95rem;
  text-align: justify;
}

.intro-paragraph:last-child {
  margin-bottom: 0;
}

/* 移动端样式修复 */
@media (max-width: 768px) {
  .skills-title {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
  }

  .skills-title::after {
    width: 100px;
    height: 3px;
    margin: 0.4rem auto 0 auto;
  }

  .skills-content {
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.2rem;
  }

  .skills-left,
  .skills-right {
    min-width: 0;
  }

  .skills-subtitle {
    font-size: 1.08rem;
    margin-bottom: 1rem;
  }

  .self-introduction {
    padding: 1rem;
  }

  .intro-paragraph {
    font-size: 0.9rem;
    line-height: 1.7;
  }
}

@media (max-width: 960px) {
  .skills-title {
    font-size: 1.4rem;
    margin-bottom: 0.8rem;
  }

  .skills-title::after {
    width: 100px;
    height: 3px;
    margin: 0.4rem auto 0 auto;
  }

  .skills-content {
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.2rem;
  }

  .skills-left,
  .skills-right {
    min-width: 0;
  }

  .skills-subtitle {
    font-size: 1.08rem;
    margin-bottom: 1rem;
  }
}
</style>
