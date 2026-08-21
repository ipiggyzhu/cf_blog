<script setup lang="ts" name="TeekLayoutProvider">
import Teek, { teekConfigContext, clockIcon } from "vitepress-theme-teek";
import { useData } from "vitepress";
import { watch, nextTick, ref, provide } from "vue";
// Teek 运行期配置的唯一来源，config.ts 里的 defineTeekConfig 用的是同一个对象
import { teekThemeConfig } from "../config/teekConfig";
import { useRibbon } from "../composables/useRibbon";
import { useRuntime } from "../composables/useRuntime";
import { defineAsyncComponent } from "vue";
const ContributeChart = defineAsyncComponent(() => import("./ContributeChart.vue"));
import NotFound from "./404.vue";
import BannerImgArrow from "./BannerImgArrow.vue"; //导入横幅图片箭头组件

import NoticeContent from "./NoticeContent.vue"; //导入公告组件
import TitleChange from "./TitleChange.vue" //导入网页标题变化
import ScrollProgressBar from "./ScrollProgressBar.vue" //导入顶部滚动条组件

import DocFooterCopyright from "./DocFooterCopyright.vue"; //导入文档页脚版权组件

import BackTop from "./BackTop.vue"; //导入回到顶部组件
import Clock from "./Clock.vue"; // 时钟组件
import NavWeather from "./NavWeather.vue"; // 导航栏天气组件
import DynamicWallpaperManager from "./DynamicWallpaperManager.vue"; //导入动态壁纸管理器

import NoticeCard from "./NoticeCard.vue";
import QuoteCard from "./QuoteCard.vue";

const { frontmatter } = useData();

provide(teekConfigContext, ref(teekThemeConfig));

// 彩带背景
const { start: startRibbon, stop: stopRibbon } = useRibbon({ immediate: false, clickReRender: true });

// 页脚运行时间
const { start: startRuntime, stop: stopRuntime } = useRuntime("2025-09-21 00:00:00", {
  prefix: `<span style="width: 16px; display: inline-block; vertical-align: -3px; margin-right: 3px;">${clockIcon}</span>小破站已运行 `,
});

// 只有首页显示运行时长；彩带目前是关闭状态
const watchRuntimeAndRibbon = async (layout: string) => {
  await nextTick();

  if (layout === "home") startRuntime();
  else stopRuntime();

  stopRibbon();
  // 如需恢复彩带背景，把上面一行换成 startRibbon()
};

watch(frontmatter, async newVal => watchRuntimeAndRibbon(newVal.layout), { immediate: true });
</script>



<template>
  <Teek.Layout>
    <template #layout-top>
      <!-- 动态壁纸管理器 -->
      <DynamicWallpaperManager />
      <!-- 顶部滚动条组件 -->
      <ScrollProgressBar />
      <!--网页标题切换组件  -->
      <TitleChange />
    </template>

    <template #teek-archives-top-before>
      <ContributeChart />
    </template>

    <template #not-found>
      <NotFound />
    </template>

    <template #teek-notice-content>
      <!-- 公告组件 -->
      <NoticeContent />
    </template>

    <template #teek-home-banner-feature-after>
      <!-- 横幅图片箭头组件 -->
      <BannerImgArrow />
    </template>

    <!-- 自定义公告卡片 -->
    <template #teek-home-card-my-after>
      <NoticeCard />
    </template>

    <!-- 英语格言卡片 -->
    <template #teek-home-card-doc-analysis-after>
      <QuoteCard />
    </template>

    <!-- 回到顶部组件 -->
    <template #teek-home-bottom-after>
      <BackTop />
      <DocFooterCopyright />
    </template>

    <!-- 右上角天气和时钟组件 -->
    <template #nav-bar-content-after>
      <div class="nav-extra-content">
        <NavWeather />
      </div>
      <Clock/>
    </template>

    <!-- 文章末尾版权说明 -->
    <template #doc-footer-before>
      <DocFooterCopyright />
    </template>
  </Teek.Layout>
</template>

<style lang="scss">
.tk-my.is-circle-bg {
  // margin-bottom: 15px;

  .tk-my__avatar.circle-rotate {
    margin-top: 0; // 由 flex 布局控制居中


    .tk-avatar:not(.avatar-sticker) {
      border: 5px solid var(--vp-c-bg-elv);
    }    
  }
}

.nav-extra-content {
  display: flex;
  align-items: center;
  gap: 0;
}

/* 右上角分组容器，统一控制天气与时钟之间的间距 */
/* 控制书本icon（tk-theme-enhance）与时钟的顺序和间距 */
.tk-theme-enhance.flx-align-center { 
  order: 98 !important; 
  margin-left: 3px !important;
  margin-right: 3px !important;
}

#clock { 
  order: 99; 
  margin-left: 3px !important; 
  margin-right: 3px !important; 
}

/* 时钟左右间距统一为3px */
#clock {
  margin-left: 3px !important;
  margin-right: 3px !important;
}

/* 隐藏时钟后面tk-theme-enhance的左侧竖线（与天气组件右侧竖线重复） */
.tk-theme-enhance.flx-align-center::before {
  display: none !important;
}
</style>
