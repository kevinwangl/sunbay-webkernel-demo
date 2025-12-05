#!/bin/bash

echo "=== SUNBAY WebKernel Demo - 配置设置 ==="
echo ""

# 检查config.json是否已存在
if [ -f "config.json" ]; then
    echo "⚠️  config.json 已存在"
    read -p "是否要覆盖现有配置? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "保持现有配置"
        exit 0
    fi
fi

# 复制示例配置
cp config.example.json config.json
echo "✅ 已创建 config.json"
echo ""

# 交互式配置
echo "请输入配置信息（直接回车使用默认值）:"
echo ""

# Backend URL
read -p "Backend URL [http://localhost:8080]: " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-http://localhost:8080}

# Kernel Service URL
read -p "Kernel Service URL [http://localhost:3000]: " KERNEL_URL
KERNEL_URL=${KERNEL_URL:-http://localhost:3000}

# IMEI
read -p "设备IMEI [863592048725123]: " IMEI
IMEI=${IMEI:-863592048725123}

# Device Model
read -p "设备型号 [Sunbay-Web-Demo]: " MODEL
MODEL=${MODEL:-Sunbay-Web-Demo}

# TEE Type
echo "TEE类型:"
echo "  1) QTEE (默认)"
echo "  2) TRUST_ZONE"
read -p "选择 [1]: " TEE_CHOICE
TEE_CHOICE=${TEE_CHOICE:-1}
if [ "$TEE_CHOICE" = "2" ]; then
    TEE_TYPE="TRUST_ZONE"
else
    TEE_TYPE="QTEE"
fi

# Device Mode
echo "设备模式:"
echo "  1) FULL_POS (默认)"
echo "  2) PIN_PAD"
read -p "选择 [1]: " MODE_CHOICE
MODE_CHOICE=${MODE_CHOICE:-1}
if [ "$MODE_CHOICE" = "2" ]; then
    DEVICE_MODE="PIN_PAD"
else
    DEVICE_MODE="FULL_POS"
fi

# Debug Mode
read -p "启用调试模式? (Y/n): " DEBUG_CHOICE
DEBUG_CHOICE=${DEBUG_CHOICE:-Y}
if [[ $DEBUG_CHOICE =~ ^[Yy]$ ]]; then
    DEBUG="true"
else
    DEBUG="false"
fi

# Auto Register
read -p "启用自动注册? (Y/n): " AUTO_REG
AUTO_REG=${AUTO_REG:-Y}
if [[ $AUTO_REG =~ ^[Yy]$ ]]; then
    AUTO_REGISTER="true"
else
    AUTO_REGISTER="false"
fi

# Kernel Version
read -p "内核版本 [v1.0.0]: " KERNEL_VER
KERNEL_VER=${KERNEL_VER:-v1.0.0}

# 生成配置文件
cat > config.json << EOF
{
  "backendUrl": "$BACKEND_URL",
  "kernelServiceUrl": "$KERNEL_URL",
  "defaultImei": "$IMEI",
  "deviceModel": "$MODEL",
  "teeType": "$TEE_TYPE",
  "deviceMode": "$DEVICE_MODE",
  "debug": $DEBUG,
  "autoRegister": $AUTO_REGISTER,
  "kernelVersion": "$KERNEL_VER"
}
EOF

echo ""
echo "✅ 配置已保存到 config.json"
echo ""
echo "配置内容:"
cat config.json
echo ""
echo "提示:"
echo "  - 可以直接编辑 config.json 修改配置"
echo "  - 运行 'npm run dev' 启动应用"
echo "  - 查看 CONFIG.md 了解详细配置说明"
