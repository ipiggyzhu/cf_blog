#!/bin/bash

# Cloudflare Pages 本地测试脚本
# 用于在本地测试 Functions 和静态网站

echo "🚀 开始本地测试..."
echo ""

# 检查是否已构建
if [ ! -d "docs/.vitepress/dist" ]; then
  echo "❌ 构建目录不存在，请先运行: pnpm docs:build"
  exit 1
fi

echo "✅ 构建目录存在"
echo ""

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler 未安装，请运行: npm install -g wrangler"
  exit 1
fi

echo "✅ Wrangler 已安装"
echo ""

echo "📦 启动本地开发服务器..."
echo "   访问: http://localhost:8788"
echo ""
echo "🧪 测试 API 端点:"
echo "   - http://localhost:8788/api/images"
echo "   - http://localhost:8788/geo"
echo "   - http://localhost:8788/api/geo"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动 Wrangler Pages 开发服务器
wrangler pages dev docs/.vitepress/dist --compatibility-date=2024-01-01 --port=8788
