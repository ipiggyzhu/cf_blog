---
date: 2025-01-27 21:15:00
title: 风险链接提示页
permalink: /risk-link
layout: false
article: false
---

<div class="risk-warning-container">
  <div class="warning-icon">⚠️</div>
  
  <h1 class="warning-title">风险链接警告 🚨</h1>
  
  <p class="warning-description">
    您即将访问的链接可能存在安全风险！<br>
    请谨慎点击，确保链接来源可信 🔒
  </p>

  <div class="safety-tips">
    <h3>🛡️ 安全提示</h3>
    <ul>
      <li>✅ 确认链接来源可信</li>
      <li>✅ 检查网站是否有安全证书</li>
      <li>✅ 避免输入敏感信息</li>
      <li>✅ 使用杀毒软件保护设备</li>
    </ul>
  </div>

  <div class="action-buttons">
    <a href="/" class="btn btn-primary">🏠 返回首页</a>
    <a href="javascript:history.back()" class="btn btn-secondary">⬅️ 返回上页</a>
  </div>

  <div class="footer-message">
    <span>🛡️</span>
    <span>安全第一，谨慎上网！</span>
    <span>🛡️</span>
  </div>
</div>

<style>
.risk-warning-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
  padding: 40px 20px 80px 20px;
  box-sizing: border-box;
  position: relative;
}

.warning-icon {
  font-size: 80px;
  margin-bottom: 30px;
  animation: pulse 2s ease-in-out infinite;
}

.warning-title {
  font-size: 48px;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  animation: fadeInUp 1s ease-out;
}

.warning-description {
  font-size: 20px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.safety-tips {
  background: rgba(255,255,255,0.1);
  padding: 30px;
  border-radius: 20px;
  margin: 30px 0;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.2);
  animation: fadeInUp 1s ease-out 0.4s both;
  max-width: 600px;
  width: 100%;
}

.safety-tips h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  text-align: center;
}

.safety-tips ul {
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.8;
  list-style: none;
  padding: 0;
}

.safety-tips li {
  margin: 10px 0;
}

.action-buttons {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeInUp 1s ease-out 0.6s both;
  margin: 40px 0;
}

.btn {
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
}

.btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.footer-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  opacity: 0.7;
  animation: fadeInUp 1s ease-out 0.8s both;
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 10;
}

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

@media (max-width: 768px) {
  .warning-title {
    font-size: 36px;
  }
  
  .warning-description {
    font-size: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
