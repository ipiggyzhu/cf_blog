---
date: 2025-01-27 21:15:00
title: 风险链接提示页
permalink: /risk-link
layout: false
article: false
---

<div class="risk-warning-container">
  <div class="warning-icon">⚠️</div>
  <h1 class="warning-title">风险链接警告</h1>
  
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
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
}

.warning-icon {
  font-size: 100px;
  margin-bottom: 60px; /* 增加底部间距，让标题往下移 */
  animation: pulse 2s ease-in-out infinite;
  display: block;
  z-index: 1;
  position: relative;
}

.warning-title {
  font-size: 42px;
  margin: 0 0 40px 0; /* 增加底部间距 */
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  font-weight: bold;
  letter-spacing: 2px;
  animation: fadeInUp 1s ease-out 0.3s both;
  position: relative;
  z-index: 2;
}

.warning-description {
  font-size: 20px;
  margin: 0 0 50px 0; /* 增加底部间距 */
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;
  animation: fadeInUp 1s ease-out 0.4s both; /* 延迟动画 */
}

.safety-tips {
  background: rgba(255,255,255,0.1);
  padding: 30px;
  border-radius: 20px;
  margin: 40px 0; /* 增加上下间距 */
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.2);
  animation: fadeInUp 1s ease-out 0.6s both; /* 进一步延迟动画 */
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
  animation: fadeInUp 1s ease-out 0.8s both; /* 进一步延迟动画 */
  margin: 50px 0; /* 增加上下间距 */
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
  position: relative;
  margin-top: 50px; /* 增加顶部间距 */
  font-size: 14px;
  opacity: 0.7;
  animation: fadeInUp 1s ease-out 1.0s both; /* 最后显示 */
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
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
  .warning-icon {
    font-size: 80px;
    margin-bottom: 15px;
  }
  
  .warning-title {
    font-size: 32px;
    letter-spacing: 1px;
  }
  
  .warning-description {
    font-size: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .safety-tips {
    padding: 20px;
    margin: 20px 0;
  }
}

@media (max-width: 480px) {
  .risk-warning-container {
    padding: 15px;
  }
  
  .warning-icon {
    font-size: 60px;
    margin-bottom: 10px;
  }
  
  .warning-title {
    font-size: 24px;
    letter-spacing: 0.5px;
  }
  
  .warning-description {
    font-size: 14px;
    margin: 0 0 30px 0;
  }
  
  .safety-tips {
    padding: 15px;
    margin: 15px 0;
  }
  
  .safety-tips h3 {
    font-size: 18px;
  }
  
  .safety-tips ul {
    font-size: 14px;
  }
}
</style>
