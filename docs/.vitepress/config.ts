import { defineConfig } from "vitepress";
import { defineTeekConfig } from "vitepress-theme-teek/config";
import { Cover } from "./ConfigHyde/Cover"; // 导入封面图模块

import { Nav } from "./ConfigHyde/Nav"; // 导入Nav模块
import { SocialLinks } from "./ConfigHyde/SocialLinks"; //导入社交链接配置

// Teek 主题运行期配置的唯一来源，同时被 TeekLayoutProvider.vue 注入使用
import { teekThemeConfig } from "./theme/config/teekConfig";

import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons"; // 导入代码组图标插件

import timeline from "vitepress-markdown-timeline"; // 导入时间线插件

import type { HeadConfig } from "vitepress"; // 在文件顶部添加类型导入
import { HeadData } from "./ConfigHyde/Head"; // 导入 HeadData 导入和类型断言

import { createRewrites } from "vitepress-theme-teek/config";

import AutoFrontmatter, {FileInfo} from "vitepress-plugin-auto-frontmatter";
import { useTransformByRules, type TransformRule } from "./theme/composables/useTransform";

const description = [
  "欢迎来到 Casual 的技术博客",
  "记录技术成长之路，分享运维实战经验",
  "专注于 Linux、Docker、Kubernetes、云原生等技术领域，打造个人知识库与技术分享平台",
].toString();
const CoverImgList = Cover; // 获取封面图列表

const teekConfig = defineTeekConfig({
  // 运行期配置全部来自 theme/config/teekConfig.ts，不要在这里重复声明，
  // 否则会被 TeekLayoutProvider 注入的那份按 key 覆盖掉。
  ...teekThemeConfig,

  // 以下是构建期专属配置，只在这里出现
  vitePlugins: {
    permalink: true,
    sidebar: true, // 启用自动侧边栏

    sidebarOption: {
      collapsed: true, //打开侧边栏自动收缩功能
      ignoreList: [/^_.*$/],
      resolveRule: "rewrites", // 根据 permalink（rewrites）而不是文件路径生成侧边栏
      checkRewritesPrefix: true,
      ignoreIndexMd: true,
    },

    autoFrontmatter: true, // 自动生成 frontmatter

    // 自动 frontmatter 插件 添加文章封面图
    autoFrontmatterOption: {
      transform: frontmatter => {
       // 如果文件本身存在了 coverImg，则不生成
       if (frontmatter.coverImg) return;

       const list = CoverImgList;

       const coverImg = list[Math.floor(Math.random() * list.length)];

       const transformResult = { ...frontmatter, coverImg };

       return Object.keys(transformResult).length ? transformResult : undefined;
      },
    },
  },

  markdown: {
    config: (md) => {
      md.use(timeline); //时间线插件
      md.use(groupIconMdPlugin); // 代码组图标插件
    },
    demo: {
      githubUrl: "https://github.com/ipiggyzhu/blog/main/docs",
    },
  },
});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  rewrites: createRewrites({
    srcDir: 'docs',
  }),

  extends: teekConfig,
  base: '/', // 确保 base 路径正确
  title: "Casual", //左上角网站名称
  description: description,
  cleanUrls: true,  //设置为true就是让链接后不默认添加.html
  lastUpdated: true,
  lang: "zh-CN",
  head: HeadData as HeadConfig[],
  markdown: {
    // 开启行号
    lineNumbers: true,
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true,
    },
    // 更改容器默认值标题
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },
  sitemap: {
    hostname: "https://blog.itpiggy.us",
    // transformItems: items => {
    //   const permalinkItemBak: typeof items = [];
    //   // 使用永久链接生成 sitemap
    //   const permalinks = (globalThis as any).VITEPRESS_CONFIG.site.themeConfig.permalinks;
    //   items.forEach(item => {
    //     const permalink = permalinks?.map[item.url];
    //     if (permalink) permalinkItemBak.push({ url: permalink, lastmod: item.lastmod });
    //   });
    //   return [...items, ...permalinkItemBak];
    // },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // logo: "/teek-logo-mini.svg",
    logo: "/img/logo.png",   //网站logo
    darkModeSwitchLabel: "主题",
    sidebarMenuLabel: "菜单",
    returnToTopLabel: "返回顶部",
    // lastUpdatedText: "上次更新时间",
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },    
    outline: {
      level: [2, 4],
      label: "本页导航",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    nav: Nav, // 导航栏配置    
    // socialLinks: [{ icon: "github", link: "https://github.com/Kele-Bingtang/vitepress-theme-teek" }],
    socialLinks: SocialLinks, // 社交链接配置




    // 本地搜索 - 支持模糊搜索和忽略大小写
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // algolia搜索（已停用，改用本地搜索）
    // search: {
    //   provider: 'algolia',
    //   options: {
    //     appId: '6AC1N60WH4',
    //     apiKey: '90f7d1ece3094d290fe42fcaf6cdfd3c',
    //     indexName: '50094988',
    //     locales: {
    //       root: {
    //         placeholder: '搜索文档',
    //         translations: {
    //           button: {
    //             buttonText: '搜索文档',
    //             buttonAriaLabel: '搜索文档'
    //           },
    //           modal: {
    //             searchBox: {
    //               resetButtonTitle: '清除查询条件',
    //               resetButtonAriaLabel: '清除查询条件',
    //               cancelButtonText: '取消',
    //               cancelButtonAriaLabel: '取消'
    //             },
    //             startScreen: {
    //               recentSearchesTitle: '搜索历史',
    //               noRecentSearchesText: '没有搜索历史',
    //               saveRecentSearchButtonTitle: '保存至搜索历史',
    //               removeRecentSearchButtonTitle: '从搜索历史中移除',
    //               favoriteSearchesTitle: '收藏',
    //               removeFavoriteSearchButtonTitle: '从收藏中移除'
    //             },
    //             errorScreen: {
    //               titleText: '无法获取结果',
    //               helpText: '你可能需要检查你的网络连接'
    //             },
    //             footer: {
    //               selectText: '选择',
    //               navigateText: '切换',
    //               closeText: '关闭',
    //               searchByText: '搜索提供者'
    //             },
    //             noResultsScreen: {
    //               noResultsText: '无法找到相关结果',
    //               suggestedQueryText: '你可以尝试查询',
    //               reportMissingResultsText: '你认为该查询应该有结果？',
    //               reportMissingResultsLinkText: '点击反馈'
    //             },
    //           },
    //         },
    //       },
    //     },        
    //   }
    // },

    
    editLink: {
      text: "在 GitHub 上编辑此页",
      // pattern: "https://github.com/Kele-Bingtang/vitepress-theme-teek/edit/master/docs/:path",
      pattern: "https://github.com/ipiggyzhu/blog/edit/main/docs/:path",
    },
  },

  vite: {
    server: {
      // host: "127.0.0.1", // 指定服务器应该监听哪个 IP 地址
      // port: 5173, // 指定开发服务器端口
      // strictPort: true, // 若端口已被占用则会直接退出
      // open: true, // 运行后自动打开网页
      warmup: {
        clientFiles: [
          './docs/.vitepress/theme/index.ts',
          './docs/.vitepress/theme/components/*.vue'
        ]
      }
    },

    // 构建优化 - 专注于速度和兼容性
    build: {
      chunkSizeWarningLimit: 1000, // 减小 chunk 大小警告阈值
      cssCodeSplit: true, // CSS 代码分割
      reportCompressedSize: false, // 禁用压缩大小报告，加快构建
      sourcemap: false, // 禁用 sourcemap，加快构建并减小体积
      minify: 'esbuild', // 使用 esbuild 替代 terser，速度更快
      target: 'es2020', // 现代浏览器，更小 bundle
      // 移除 manualChunks 避免与 VitePress 的外部模块配置冲突
    },

    // SSR 优化 - 确保主题和插件正确打包
    ssr: {
      noExternal: ['vitepress-theme-teek', 'canvas-confetti']
    },

    // 优化依赖预构建
    optimizeDeps: {
      include: ['vue'],
      exclude: ['echarts', 'vitepress', 'vitepress-theme-teek']
    },    

    plugins: [
      // 自动注入一级前缀（rewrite模式）
      AutoFrontmatter({
          pattern: "**/*.md",
          // exclude 指定的对象如果在 markdown frontmatter 存在，则忽略该文件。当 include 和 exclude 存在相同文件时，exclude 优先级高
          //exclude: { coverImg: true},
          recoverTransform: true, // false 只添加不存在的字段
          // 返回一个新的 frontmatter 或只返回 undefined，如果返回 {}，则清空 MD 文件本身存在的 frontmatter
          transform: (frontMatter: Record<string, any>, fileInfo: FileInfo) => {

              // 定义需要处理的所有规则（可扩展多个）
              const rules: TransformRule[] = [
                  // { folderName: "95.Teek", prefix: "/teek" }, // 添加前缀
                  // { folderName: "10.Teek", prefix: "/teek" }, // 添加前缀
                  // { folderName: "20.工具资源/01.SSL证书", prefix: "/tool", removeLevel: 1 }, // 移除一层前缀后再添加前缀
                  // { folderName: "10.笔记专栏/99.博客搭建", prefix: "/note", clear: true }, // 清空 permalink，优先级最高
                  // { folderName: "20.文档", prefix: "/note", clear: true }, // 清空 permalink，优先级最高
                  // { folderName: "01.前端/01.vite/", prefix: "/testa/$uuid5/$uuid1/$uuid10/$uuid99", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "10.运维", prefix: "/linux/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "15.前端", prefix: "/qianduan/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "20.编程", prefix: "/code/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "25.黑客", prefix: "/hacker/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "30.专题", prefix: "/zhuanti/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "35.工具", prefix: "/tools/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "50.小屋/10.精神小屋", prefix: "/xiaowu/inner/$uuid5", removeLevel: 99}, // 精神小屋
                  { folderName: "50.小屋/20.时间管理", prefix: "/xiaowu/time/$uuid5", removeLevel: 99}, // 时间管理
                  { folderName: "50.小屋/30.情感文案", prefix: "/xiaowu/wenan/$uuid5", removeLevel: 99}, // 情感文案
                  { folderName: "45.娱乐/10.电影", prefix: "/yule/movie/$uuid5", removeLevel: 99}, // 电影
                  { folderName: "45.娱乐/20.音乐", prefix: "/yule/music/$uuid5", removeLevel: 99}, // 音乐
                  { folderName: "45.娱乐/30.相册", prefix: "/yule/photo/$uuid5", removeLevel: 99}, // 相册
                  { folderName: "55.兴趣/10.读书", prefix: "/xingqu/reading/$uuid5", removeLevel: 99}, // 读书
                  { folderName: "55.兴趣/15.旅行", prefix: "/xingqu/travel/$uuid5", removeLevel: 99}, // 旅行
                  // 兜底规则：必须排在上面各自的二级目录规则之后（首个命中生效）。
                  // 没有这三条时，45.娱乐 / 50.小屋 / 55.兴趣 下新建的子目录（如 90.资料库）匹配不到任何规则，
                  // permalink 不会被转换，文章会落到基于物理路径的中文 URL 上。
                  { folderName: "45.娱乐", prefix: "/yule/$uuid5", removeLevel: 99}, // 娱乐兜底
                  { folderName: "50.小屋", prefix: "/xiaowu/$uuid5", removeLevel: 99}, // 小屋兜底
                  { folderName: "55.兴趣", prefix: "/xingqu/$uuid5", removeLevel: 99}, // 兴趣兜底
                  { folderName: "60.关于", prefix: "/about/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  { folderName: "65.Teek", prefix: "/teek/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  // { folderName: "40.专题/10.博客搭建/45.静态站点构建器", prefix: "/zhuanti/$uuid5", removeLevel: 99}, // 清空前缀并且添加前缀使用随机数
                  // { folderName: "40.专题/10.博客搭建/45.静态站点构建器", prefix: "/zhuanti", clear: true }, // 清空前缀并且添加前缀使用随机数
              ];
              // 应用规则转换
              return useTransformByRules(frontMatter, fileInfo, rules);

  /*            // 如果文件本身存在了 coverImg，则不生成
              if (frontMatter.coverImg) return; // 随机获取 coverImg
              const list = [...Wallpaper, ...BlogCover];
              const coverImg = list[Math.floor(Math.random() * list.length)];
              const transformResult = { ...frontMatter, coverImg };
              console.log("transformResult", transformResult)
              return Object.keys(transformResult).length
                  ? transformResult
                  : undefined;*/
          },
      }),      

    ],

  },  

  transformHtml: (code, id, context) => {
    if (context.page !== "404.md") return code;
    return code.replace("404 | ", "");
  },

});
