#!/bin/bash

# Sunbay WebKernel Demo - 发布脚本
# 构建生产版本（端口80需要 nginx 或其他 Web 服务器）

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔨 构建 Sunbay WebKernel Demo 发布版本...${NC}"
echo ""

# 构建生产版本
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ 构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}📁 发布文件位置: ./dist${NC}"
echo ""
echo -e "${YELLOW}部署方式（选择一种）：${NC}"
echo ""
echo "1. 使用 nginx (推荐):"
echo "   - 将 dist 目录内容复制到 nginx 网站目录"
echo "   - 配置 nginx 监听端口 80"
echo ""
echo "2. 使用 Apache:"
echo "   - 将 dist 目录内容复制到 Apache 网站目录"
echo "   - 配置虚拟主机监听端口 80"
echo ""
echo "3. 使用 Python (快速测试):"
echo "   cd dist && sudo python3 -m http.server 80"
echo ""
echo "4. 使用 Node.js http-server:"
echo "   npm install -g http-server"
echo "   cd dist && sudo http-server -p 80"
echo ""
