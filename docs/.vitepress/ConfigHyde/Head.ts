const description = [
  "欢迎来到 vitepress-theme-teek 使用文档",
  "Teek 是一个基于 VitePress 构建的主题，是在默认主题的基础上进行拓展，支持 VitePress 的所有功能、配置",
  "Teek 拥有三种典型的知识管理形态：结构化、碎片化、体系化，可以轻松构建一个结构化知识库，适用个人博客、文档站、知识库等场景",
].toString();

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

  // 预连接优化
  ["link", { rel: "preconnect", href: "https://at.alicdn.com" }],
  ["link", { rel: "preconnect", href: "https://image.itpiggy.top" }],
  ["link", { rel: "dns-prefetch", href: "https://busuanzi.ibruce.info" }],

  [
    "meta",
    {
      name: "viewport",
      content:
        "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no",
    },
  ],
  [
    "meta",
    {
      name: "description",
      description,
    },
  ],
  ["meta", { name: "keywords", description }],
  ["meta", { name: "baidu-site-verification", content: "codeva-QnY1Xh758j" }], // 百度收录
  [
    "meta",
    { name: "msvalidate.01", content: "48CABE70F538B8D117567176ABF325AF" },
  ], // Bing 收录验证
  ["link", { rel: "icon", href: "/img/logo.png", type: "image/png" }],
  // 阿里在线矢量库
  [
    "link",
    {
      rel: "stylesheet",
      href: "//at.alicdn.com/t/font_2989306_w303erbip9.css",
    },
  ],
  [
    // 阿里图标库symbol 引用
    "script",
    {
      src: "https://at.alicdn.com/t/c/font_4899452_xj7acblxpxj.js",
      media: "print",
      onload: "this.media='all'",
    },
  ],
  // umami统计
  [
    "script",
    {
      // src: "https://umami.onedayxyy.cn/script.js", // 原作者的统计服务，已禁用
      "data-website-id": "0d806f5d-cffa-41ec-98bf-862b2273ce4a",
      defer: "defer",
    },
  ],
  [
    "noscript",
    {},
    '<meta http-equiv="refresh" content="0; url={https://www.baidu.com/}">',
  ], // 禁用js跳转



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

  // 阿里图标库symbol 引用
  ["script",{src: "https://at.alicdn.com/t/c/font_4686603_33kna2v5qcm.js",defer: "defer",},],  
];
