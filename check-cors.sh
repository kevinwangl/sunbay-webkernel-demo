#!/bin/bash

# CORS 诊断脚本
# 检查后端是否返回正确的 CORS 头

BACKEND_URL="http://10.162.24.174:8180/api/v1/public/kernels/latest"

echo "🔍 检查后端 CORS 配置..."
echo ""
echo "测试 URL: $BACKEND_URL"
echo ""

# 发送 OPTIONS 请求（预检请求）
echo "1️⃣ 检查 OPTIONS 预检请求:"
curl -X OPTIONS -i "$BACKEND_URL" \
  -H "Origin: http://10.162.24.174" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"

echo ""
echo ""

# 发送 GET 请求
echo "2️⃣ 检查 GET 请求的 CORS 头:"
curl -i "$BACKEND_URL" \
  -H "Origin: http://10.162.24.174"

echo ""
echo ""
echo "✅ 应该包含以下响应头:"
echo "   Access-Control-Allow-Origin: *"
echo "   Access-Control-Allow-Methods: GET, POST, OPTIONS"
echo "   Access-Control-Allow-Headers: Content-Type"
echo ""
echo "❌ 如果缺少这些头，需要在后端配置 CORS"
