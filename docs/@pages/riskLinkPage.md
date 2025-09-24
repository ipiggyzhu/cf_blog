---
date: 2025-01-27 21:15:00
title: 风险链接提示页
permalink: /risk-link
layout: false
article: false
---

<div style="
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
">

  <!-- 警告图标 -->
  <div style="
    font-size: 80px;
    margin-bottom: 30px;
    animation: pulse 2s ease-in-out infinite;
  ">
    ⚠️
  </div>

  <!-- 标题 -->
  <h1 style="
    font-size: 48px;
    margin: 0 0 20px 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    animation: fadeInUp 1s ease-out;
  ">
    风险链接警告 🚨
  </h1>

  <!-- 描述 -->
  <p style="
    font-size: 20px;
    margin: 0 0 40px 0;
    opacity: 0.9;
    max-width: 600px;
    line-height: 1.6;
    animation: fadeInUp 1s ease-out 0.2s both;
  ">
    您即将访问的链接可能存在安全风险！<br>
    请谨慎点击，确保链接来源可信 🔒
  </p>

  <!-- 安全提示 -->
  <div style="
    background: rgba(255,255,255,0.1);
    padding: 30px;
    border-radius: 20px;
    margin: 30px 0;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255,255,255,0.2);
    animation: fadeInUp 1s ease-out 0.4s both;
  ">
    <h3 style="margin: 0 0 20px 0; font-size: 24px;">🛡️ 安全提示</h3>
    <ul style="
      text-align: left;
      max-width: 500px;
      margin: 0 auto;
      font-size: 16px;
      line-height: 1.8;
    ">
      <li>✅ 确认链接来源可信</li>
      <li>✅ 检查网站是否有安全证书</li>
      <li>✅ 避免输入敏感信息</li>
      <li>✅ 使用杀毒软件保护设备</li>
    </ul>
  </div>

  <!-- 操作按钮 -->
  <div style="
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    animation: fadeInUp 1s ease-out 0.6s both;
  ">
    <a href="/" style="
      display: inline-block;
      padding: 15px 30px;
      background: rgba(255,255,255,0.2);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
    " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'" 
       onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
      🏠 返回首页
    </a>
    
    <a href="javascript:history.back()" style="
      display: inline-block;
      padding: 15px 30px;
      background: rgba(255,255,255,0.2);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
    " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='translateY(-2px)'" 
       onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'">
      ⬅️ 返回上页
    </a>
  </div>

  <!-- 底部装饰 -->
  <div style="
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    opacity: 0.7;
    animation: fadeInUp 1s ease-out 0.8s both;
  ">
    <div style="display: flex; gap: 10px; align-items: center;">
      <span>🛡️</span>
      <span>安全第一，谨慎上网！</span>
      <span>🛡️</span>
    </div>
  </div>

</div>

<style>
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container h1 {
    font-size: 36px !important;
  }
  
  .container p {
    font-size: 16px !important;
  }
  
  .container .buttons {
    flex-direction: column !important;
    align-items: center !important;
  }
}
</style>
