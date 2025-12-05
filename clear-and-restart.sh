#!/bin/bash

echo "🧹 清理 WebKernel Demo 缓存和数据"
echo "===================================="
echo ""

# 1. 清理构建缓存
echo "1️⃣ 清理构建缓存..."
rm -rf node_modules/.vite
rm -rf dist
echo "✅ 构建缓存已清理"
echo ""

# 2. 提示清理浏览器
echo "2️⃣ 请在浏览器中执行以下操作："
echo ""
echo "   打开 DevTools (F12) → Console，运行："
echo "   ┌─────────────────────────────────────┐"
echo "   │ localStorage.clear();               │"
echo "   │ sessionStorage.clear();             │"
echo "   │ location.reload();                  │"
echo "   └─────────────────────────────────────┘"
echo ""
echo "   或者使用硬刷新："
echo "   - Mac: Cmd + Shift + R"
echo "   - Windows/Linux: Ctrl + Shift + R"
echo ""

# 3. 重启开发服务器
echo "3️⃣ 重启开发服务器..."
echo ""
echo "   请手动运行: npm run dev"
echo ""

echo "===================================="
echo "✅ 清理完成！"
echo ""
echo "💡 下一步："
echo "   1. 运行: npm run dev"
echo "   2. 访问: http://localhost:5173"
echo "   3. 清除浏览器缓存（见上方说明）"
echo "   4. 观察 Console 日志，确认 device_id 格式正确"
echo ""
