const description = [
  "欢迎来到 Casual 的技术博客",
  "记录技术成长之路，分享运维实战经验",
  "专注于 Linux、Docker、Kubernetes、云原生等技术领域，打造个人知识库与技术分享平台",
].toString();

const keywords = "Casual,技术博客,运维,Linux,Docker,Kubernetes,云原生,前端,VitePress";

// 导出head.ts
export const HeadData = [
  // 已移除 Vercel Analytics，因为部署在 Cloudflare Pages
  // Vercel Analytics 只能在 Vercel 平台使用
  
  // Cloudflare Analytics (可选，需要在 Cloudflare Dashboard 中启用)
  // [
  //   "script",
  //   {
  //     defer: true,
  //     src: "https://static.cloudflareinsights.com/beacon.min.js",
  //     "data-cf-beacon": '{"token": "your-token-here"}'
  //   },
  // ],
  ["meta", { name: "author", content: "Casual" }],
  ['meta', { property: 'og:description', content: '明心静性，爱自己' }],
  ['meta', { property: 'og:image', content: '/img/logo.png' }],

  // PWA 配置
  ["link", { rel: "manifest", href: "/manifest.json" }],
  ["meta", { name: "theme-color", content: "#5086a1" }],
  ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "default" }],
  ["meta", { name: "apple-mobile-web-app-title", content: "Casual Blog" }],
  ["link", { rel: "apple-touch-icon", href: "/img/logo.png" }],

  // 预连接优化 - 添加 crossorigin 以提高加载性能
  ["link", { rel: "preconnect", href: "https://at.alicdn.com", crossorigin: "" }],
  ["link", { rel: "preconnect", href: "https://image.itpiggy.us", crossorigin: "" }],
  ["link", { rel: "dns-prefetch", href: "https://busuanzi.ibruce.info" }],
  ["link", { rel: "dns-prefetch", href: "https://bszi.eryajf.net" }],

  [
    "meta",
    {
      name: "viewport",
      content:
        "width=device-width,initial-scale=1.0,viewport-fit=cover",
    },
  ],
  [
    "meta",
    {
      name: "description",
      content: description,
    },
  ],
  ["meta", { name: "keywords", content: keywords }],
  ["meta", { name: "baidu-site-verification", content: "codeva-QnY1Xh758j" }], // 百度收录
  [
    "meta",
    { name: "msvalidate.01", content: "48CABE70F538B8D117567176ABF325AF" },
  ], // Bing 收录验证
  ["link", { rel: "icon", href: "/img/logo.png", type: "image/png" }],
  // 阿里在线矢量库 - 异步加载避免渲染阻塞
  [
    "link",
    {
      rel: "preload",
      as: "style",
      href: "https://at.alicdn.com/t/font_2989306_w303erbip9.css",
      crossorigin: "anonymous",
      onload: "this.onload=null;this.rel='stylesheet'",
    },
  ],
  [
    // 阿里图标库symbol 引用 - 异步加载
    "script",
    {
      src: "https://at.alicdn.com/t/c/font_4899452_xj7acblxpxj.js",
      async: true,
      crossorigin: "anonymous",
      onerror: "console.warn('Icon font failed to load')",
    },
  ],
  // 说明：此处原有一段 <noscript> meta refresh，会把不执行 JS 的客户端
  // （含部分搜索引擎爬虫）直接跳转到百度，与站点做 sitemap / 百度收录的目标冲突，已移除。



  // //免费的音乐播放器
  // [
  //   "script",
  //   {
  //     type: "text/javascript",
  //     src: "https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js",
  //     // src: "https://myhkw.cn/player/js/jquery.min.js",
  //   },
  // ], 
  // [
  //   "script",
  //   {
  //     type: "text/javascript",
  //     id: "myhk",
  //     src: "https://myhkw.cn/api/player/1741345067120",
  //     key: "1741345067120",
  //     m: "1",
  //     lr: "r",
  //     defer: "defer",  // 添加defer属性，确保脚本在DOM加载完成后执行
  //   },
  // ],

  // 阿里图标库symbol 引用 - 异步加载并添加错误处理
  [
    "script",
    {
      src: "https://at.alicdn.com/t/c/font_4686603_33kna2v5qcm.js",
      async: true,
      crossorigin: "anonymous",
      onerror: "console.warn('Icon font 2 failed to load')",
    },
  ],  
];
