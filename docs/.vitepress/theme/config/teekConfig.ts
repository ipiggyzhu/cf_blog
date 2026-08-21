/**
 * Teek 主题配置 —— 全站唯一来源
 *
 * 这份对象同时被两处消费，二者必须是同一个对象，否则会出现配置漂移：
 *   1. config.ts 里 `defineTeekConfig()` → 站点级配置（themeConfig）
 *   2. TeekLayoutProvider.vue 里 `provide(teekConfigContext, ...)` → 运行期注入
 *
 * Teek 的 useTeekConfig 取值优先级为 inject > frontmatter > themeConfig：
 * 对象类型的 key 做浅合并，标量类型的 key 由 inject 直接覆盖。
 * 以前两处各维护一份，标量冲突时站点级配置形同虚设
 * （例如 config.ts 写 homeCardListPosition: "right"，实际生效的一直是注入的 "left"）。
 * 合并成一份后就不存在这个问题了。
 *
 * 注意：只放运行期配置。vitePlugins / markdown 属于构建期，留在 config.ts。
 */
import type { TeekConfig } from "vitepress-theme-teek/config";
import { FooterInfo } from "../../ConfigHyde/FooterInfo"; // 底部信息配置
import { FriendLink } from "../../ConfigHyde/FriendLink"; // 友链配置
import { HitokotoDate } from "../../ConfigHyde/HitokotoDate"; // Banner 一言文案
import { Wallpaper } from "../../ConfigHyde/Wallaper"; // Banner 壁纸列表
import { Cover } from "../../ConfigHyde/Cover"; // 文章封面图列表
import { SocialDate } from "../../ConfigHyde/SocialDate"; // 卡片栏社交信息
import { CommentData } from "../../ConfigHyde/Comment"; // 评论配置

export const teekThemeConfig: TeekConfig = {
  teekTheme: true, // 启用 Teek 主题
  teekHome: true, // 启用 Teek 首页
  vpHome: false, // 禁用 VitePress 默认首页风格
  homeCardListPosition: "left", // 首页卡片栏列表位置
  themeSize: "large", // 首页尺寸变大
  loading: false, // 关闭 Loading 动画
  windowTransition: true,
  sidebarTrigger: true,

  // 首页顶部按 F11 开启壁纸模式
  wallpaper: {
    enabled: true, // 是否启用壁纸模式
    hideBanner: false, // 开启壁纸模式后，全屏是否显示打字机文案
    hideMask: true, // 开启壁纸模式后，是否隐藏 Banner 或 bodyBgImage 的遮罩层
  },

  themeEnhance: {
    themeColor: {
      defaultColorName: "ep-blue", // 默认主题色为蓝色
    },
    layoutSwitch: {
      defaultMode: "bothWidthAdjustable",
    },
  },

  banner: {
    enabled: true,
    name: "Casual Blog 🎉", // Banner 标题
    bgStyle: "fullImg", // pure 纯色 / partImg 局部图片 / fullImg 全屏图片
    pureBgColor: "#28282d", // bgStyle 为 pure 时生效
    imgSrc: Wallpaper, // bgStyle 为 partImg 或 fullImg 时生效
    imgInterval: 15000, // 多张图片时的切换间隔，单位：毫秒
    imgShuffle: true, // 图片是否随机切换
    imgWaves: true, // 是否开启 Banner 图片波浪纹，bgStyle 为 fullImg 时生效
    mask: false, // Banner 图片遮罩
    maskBg: "rgba(0, 0, 0, 0.4)", // Banner 遮罩颜色
    textColor: "#ffffff", // Banner 字体颜色
    titleFontSize: "3.2rem", // 标题字体大小
    descFontSize: "1.4rem", // 描述字体大小
    descStyle: "types", // default 纯文字 / types 打印 / switch 切换
    description: HitokotoDate, // 描述信息
    switchTime: 4000, // 描述信息切换间隔，descStyle 为 switch 时生效
    switchShuffle: true, // 描述信息是否随机切换
    typesInTime: 200, // 输出一个文字的时间，单位：毫秒
    typesOutTime: 100, // 删除一个文字的时间，单位：毫秒
    typesNextTime: 800, // 打字与删字的间隔时间，单位：毫秒
    typesShuffle: false, // 描述信息是否随机打字
  },

  blogger: {
    // 博主信息，显示在首页侧边栏
    avatar: "/img/logo.png", // 侧边栏个人头像
    shape: "circle-rotate", // square 方形 / circle 圆形 / circle-rotate 悬停旋转
    name: "Casual", // 侧边栏个人昵称
    slogan: "心向暖阳，静待花开", // 侧边栏个人座右铭
    circleBgImg: "https://image.itpiggy.us/WallPaper/22.webp", // 头像圆形背景图
    circleBgMask: false, // 头像圆形背景图是否显示遮罩层
    color: "#fff",

    // 状态，仅当 shape 为 circle 相关值时有效
    status: {
      icon: "😜", // 状态图标
      size: 24, // 图标大小
      title: "有趣", // 鼠标悬停图标的提示语
    },
  },

  // 文章配置
  post: {
    postStyle: "card", // 文章列表风格：card 卡片模式，list 列表模式
    excerptPosition: "top", // 文章摘要位置
    showMore: true, // 是否显示更多按钮
    moreLabel: "阅读全文 >", // 更多按钮文字
    emptyLabel: "暂无文章", // 文章列表为空时的标签
    coverImgMode: "default", // 文章封面图模式
    showCapture: true, // 是否在摘要位置显示文章部分文字
    splitSeparator: false, // 文章信息是否添加 | 分隔符
    transition: true, // 是否开启过渡动画
    transitionName: "tk-slide-fade", // 自定义过渡动画名称
    listStyleTitleTagPosition: "right", // 列表模式下的标题标签位置
    cardStyleTitleTagPosition: "left", // 卡片模式下的标题标签位置
    defaultCoverImg: Cover, // 封面图列表
  },

  // 分类卡片
  category: {
    enabled: true,
    limit: 8, // 一页显示的数量
    autoPage: false, // 是否自动翻页
    pageSpeed: 4000, // 翻页间隔时间，单位：毫秒
  },

  // 标签卡片
  tag: {
    enabled: true,
    limit: 21,
    autoPage: false,
    pageSpeed: 4000,
  },

  // 精选文章卡片
  topArticle: {
    enabled: true,
    limit: 5,
    autoPage: false,
    pageSpeed: 4000,
    dateFormat: "yyyy-MM-dd",
  },

  page: {
    pageSize: 10, // 首页 Post 文章列表的分页配置
    hideOnSinglePage: true, // 当只有一页时隐藏分页组件
    layout: "prev, pager, next, jumper", // 移除 total 组件，不显示总条数
  },

  // 不蒜子统计分析
  docAnalysis: {
    createTime: "2025-02-26",
    statistics: {
      provider: "busuanzi",
      url: "https://bszi.eryajf.net/jsonp?callback=BusuanziCallback",
      tryRequest: true,
      tryCount: 5,
      tryIterationTime: 2000,
    },
    wordCount: true,
    readingTime: true,
  },

  // 风险链接提示页
  riskLink: {
    enabled: true,
    whitelist: [
      "https://blog.itpiggy.us/",
      "https://image.itpiggy.us/",
      /https:\/\/github.com/,
      /https:\/\/giee.com/,
    ],
    blacklist: [],
  },

  // 右下角回到顶部
  backTop: {
    enabled: true,
    content: "icon", // progress | icon
    done: TkMessage => TkMessage.success("返回顶部成功"),
  },

  // 右下角滚动到评论区
  toComment: {
    enabled: true,
    done: TkMessage => TkMessage.success("已抵达评论区"),
  },

  // 新版代码块配置
  codeBlock: {
    collapseHeight: 700, // 超出高度后自动折叠
    overlay: true, // 代码块底部是否显示展开/折叠遮罩层
    overlayHeight: 400, // 出现遮罩层时代码块的显示高度
    copiedDone: TkMessage => TkMessage.success("复制成功！"),
  },

  articleShare: { enabled: true },

  articleAnalyze: {
    imageViewer: { hideOnClickModal: true }, // 图片预览是否点击遮罩层关闭
    showIcon: true, // 文章信息的图标是否显示
    dateFormat: "yyyy-MM-dd", // 文章日期格式
    showInfo: true, // 是否展示文章信息
    showAuthor: true,
    showCreateDate: true,
    showUpdateDate: true, // 仅在文章页显示
    showCategory: true,
    showTag: true,
  },

  // 超过半年的文章自动提示内容可能已过时
  articleTopTip: frontmatter => {
    const tip: Record<string, string> = {
      type: "warning",
      text: "文章发布较早，内容可能过时，阅读注意甄别。",
    };

    const longTime = 6 * 30 * 24 * 60 * 60 * 1000;
    if (frontmatter.date && Date.now() - new Date(frontmatter.date).getTime() > longTime) {
      return tip;
    }
  },

  comment: {
    provider: "twikoo",
    options: CommentData,
  },

  friendLink: FriendLink, // 友链配置
  social: SocialDate, // 社交信息配置
  footerInfo: FooterInfo, // 底部信息配置

  // 网站分析统计配置
  // 注意：ERR_BLOCKED_BY_CLIENT 是广告拦截器所致，不影响站点功能
  siteAnalytics: [
    {
      provider: "baidu",
      options: { id: "d5ee872d9aa1ef8021f4a3921b2e9c2a" },
    },
    {
      provider: "google",
      options: { id: "G-K5GNDW3L7K" },
    },
  ],

  // 赞赏在文章下方
  appreciation: {
    position: "doc-after",
    options: {
      icon: "weChatPay", // 内置 weChatPay 和 alipay
      expandTitle: "打赏支持",
      collapseTitle: "下次一定",
      content: `<img src='/img/alipay/1.png'><img src='/img/alipay/2.png'>`,
      expand: false,
    },
  },
};
