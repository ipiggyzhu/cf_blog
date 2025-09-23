import {
  VscodeDark,
  WebstormDark,
  Postman,
  Html,
  Css,
  Javascript,
  Typescript,
  Sass,
  LessDark,
  TailwindcssDark,
  VuejsDark,
  ViteDark,
  PiniaDark,
  Electron,
  LinuxDark,
  Nginx,
  NodejsDark,
  MysqlDark,
  PnpmDark,
  ReactDark,
  Git,
  GithubDark,
  GitlabDark,
  Docker,
  JAVA,
  IDEA,
  DataGrip,
  RedisDark,
  RabbitMqDark,
  SpringDark,
  SpringBootDark,
  NpmDark,
  Android,
  MavenDark,
  Star,
  Fork,
  View,
} from "./TechIcons";

export const profile = {
  title: '你好，我是',
  name: 'Casual',
  desc: '心向暖阳，静待花开',
  avatar: '/img/xyy.webp',//头像
  buttons: [
    { text: '联系我', link: 'http://wpa.qq.com/msgrd?v=3&uin=50094988&site=qq&menu=yes', type: 'primary' },
    { text: 'GitHub', link: 'https://github.com/ipiggyzhu', type: 'default' }
  ],
};

export const majorSkills = [
  {
    name: "兴趣爱好",
    percent: 100,
    color: "#667eea",
    tags: [
      { name: "阅读", bg: "#eaf6ff", color: "#4298b4" },
      { name: "写作", bg: "#eafff3", color: "#33a474" },
      { name: "摄影", bg: "#fffbe6", color: "#e4ae3a" },
      { name: "旅行", bg: "#ffeaf6", color: "#d72660" },
    ],
  },
  {
    name: "学习方向",
    percent: 80,
    color: "#33a474",
    tags: [
      { name: "前端开发", bg: "#eaf6ff", color: "#4298b4" },
      { name: "博客写作", bg: "#eafff3", color: "#33a474" },
      { name: "生活记录", bg: "#fffbe6", color: "#e4ae3a" },
    ],
  },
];

export const selfIntroduction = {
  title: "自我介绍",
  content: `你好！我是一个热爱记录生活和代码的博主。

在这个数字化的时代，我选择用文字和代码来记录自己的成长轨迹。这里不仅是我分享技术心得的地方，更是我记录生活点滴的小天地。

我喜欢在代码的世界里探索，也喜欢在生活中发现美好。每一行代码都承载着思考，每一个文字都记录着感悟。

希望通过这个博客，能够与更多志同道合的朋友交流，一起在技术的道路上成长，一起在生活中发现更多可能。

欢迎来到我的小世界，让我们一起分享、学习、成长！`
};

export const ossProjects = [
  // 开源项目暂时为空，后续可以添加自己的项目
];

// 导出开源项目图标用于子组件
export { Star, Fork, View };
