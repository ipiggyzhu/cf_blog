// 组件导入
import Teek from "vitepress-theme-teek";
import TeekLayoutProvider from "./components/TeekLayoutProvider.vue";
import { defineComponent, h, defineAsyncComponent } from "vue";
import { useData } from "vitepress";
// import notice from "./components/notice.vue";
// import MNavLinks from "./components/MNavLinks.vue"; // 引入导航组件
import confetti from "./components/Confetti.vue"; //导入五彩纸屑组件
// import NavIcon from "./components/NavIcon.vue"; //导入导航栏图标

// Teek 在线主题包引用（需安装 Teek 在线版本）
import "vitepress-theme-teek/index.css"; // 引入主题样式
import "vitepress-theme-teek/theme-chalk/tk-code-block-mobile.css"; // 引入移动端代码块样式
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css"; // 引入侧边栏样式
import "vitepress-theme-teek/theme-chalk/tk-nav.css"; // 引入导航栏样式
import "vitepress-theme-teek/theme-chalk/tk-aside.css"; // 文章目录样式
import "vitepress-theme-teek/theme-chalk/tk-doc-h1-gradient.css"; // 文档以及标题样式
import "vitepress-theme-teek/theme-chalk/tk-table.css"; // 表格样式
import "vitepress-theme-teek/theme-chalk/tk-mark.css"; // 文章 mark 标签样式
import "vitepress-theme-teek/theme-chalk/tk-blockquote.css"; //引用样式
import "vitepress-theme-teek/theme-chalk/tk-index-rainbow.css"; // Vitepress 首页彩虹渐变样式
// import "vitepress-theme-teek/theme-chalk/tk-doc-fade-in.css"; // 文档淡入效果样式
import "vitepress-theme-teek/theme-chalk/tk-banner-desc-gradient.css"; // Banner 描述渐变样式

// 主题增强样式
import "vitepress-theme-teek/theme-chalk/tk-nav-blur.css"; // 导航栏毛玻璃样式
// import "vitepress-theme-teek/theme-chalk/tk-container.css"; // Markdown 容器样式
// import "vitepress-theme-teek/theme-chalk/tk-container-left.css"; // Markdown 容器左框样式
// import "vitepress-theme-teek/theme-chalk/tk-container-flow.css"; // Markdown 容器流体样式
import "vitepress-theme-teek/tk-plus/banner-full-img-scale.scss"; // Banner 全屏图片放大样式

import "./styles/code-bg.scss";
import "./styles/iframe.scss";
import "./style/index.scss"; // 引入全局样式

// import "virtual:group-icons.css"; //代码组图标样式
import "vitepress-markdown-timeline/dist/theme/index.css"; // 引入时间线样式

//切换进度条
import { NProgress } from "nprogress-v2/dist/index.js"; // 进度条组件
import "nprogress-v2/dist/index.css"; // 进度条样式

import "vitepress-theme-teek/tk-plus/fade-up-animation.scss";// 首次加载的动画效果


import SLink from "./components/SLink/index.vue"; //友链

// 导入关于我组件
import About from "./components/About.vue"; //关于我

// 🚀 性能优化：大型组件懒加载
// 情侣相册组件 - 按需加载（大组件，包含图片处理）
const CoupleAlbum = defineAsyncComponent(() =>
  import('./components/CoupleAlbum/CoupleAlbum.vue')
)
const PhotoCard = defineAsyncComponent(() =>
  import('./components/CoupleAlbum/PhotoCard.vue')
)

// 导入天气组件（保持同步加载，因为在导航栏显示）
import NavWeather from './components/NavWeather.vue'

// 导入Service Worker
import { useServiceWorker } from './composables/useServiceWorker'

// 导入错误处理器
import { errorHandler } from './utils/errorHandler'

// import "./style/sidebar-icon.scss";

export default {
  extends: Teek,
  async enhanceApp({ app, router }) {
    // 配置 Vue 错误处理
    app.config.errorHandler = (err, instance, info) => {
      console.error('[Vue Error]', err, info);
      errorHandler.captureError(
        err instanceof Error ? err : new Error(String(err)),
        'vue',
        { info, component: instance?.$options.name }
      );
      // 不阻止应用继续运行
    };

    app.config.warnHandler = (msg, instance, trace) => {
      if (import.meta.env.DEV) {
        console.warn('[Vue Warning]', msg, trace);
      }
    };
    // 注册组件
    // app.component("MNavLinks", MNavLinks); // 注册导航组件
    app.component("confetti", confetti); // 注册五彩纸屑组件
    app.component("About", About); // 注册关于我组件

    // 🚀 性能优化：懒加载组件注册
    app.component('CoupleAlbum', CoupleAlbum) // 情侣相册（懒加载）
    app.component('PhotoCard', PhotoCard) // 相册卡片（懒加载）

    app.component("NavWeather", NavWeather); // 注册导航栏天气组件

    // 注册全局组件
    app.component("friend-link", SLink);

    // 非SSR环境下配置路由进度条、错误处理和Service Worker
    // @ts-expect-error
    if (!import.meta.env.SSR) {
      // 初始化错误处理器
      errorHandler.init();

      NProgress.configure({ showSpinner: false });
      router.onBeforeRouteChange = () => NProgress.start();
      router.onAfterRouteChange = () => {
        setTimeout(() => {
          NProgress.done();
        }, 100);
      };

      // 注册 Service Worker
      useServiceWorker();

      // 确保字体加载完成后再渲染（仅开发环境输出日志）
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (import.meta.env.DEV) {
            console.log('[Fonts] All fonts loaded');
          }
        }).catch((err) => {
          if (import.meta.env.DEV) {
            console.warn('[Fonts] Font loading failed:', err);
          }
        });
      }
    }
      // 不蒜子环境下配置路由进度条
    // if (inBrowser) {
    //   NProgress.configure({ showSpinner: false });
    //   router.onBeforeRouteChange = () => {
    //     NProgress.start(); // 开始进度条
    //   };
    //   router.onAfterRouteChanged = () => {
    //     NProgress.done(); // 停止进度条
    //   };
    // },  
    
  },
  Layout: defineComponent({
    name: "LayoutProvider",
    setup() {
      const props: Record<string, any> = {};
      const { frontmatter } = useData();

      // 添加自定义 class 逻辑
      if (frontmatter.value?.layoutClass) {
        props.class = frontmatter.value.layoutClass;
      }

      return () => h(TeekLayoutProvider, props);
    },
  }),
};
