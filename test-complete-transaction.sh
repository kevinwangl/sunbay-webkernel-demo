#!/bin/bash

# 测试 WebKernel Demo 完整交易流程
# 包括：设备注册 -> 密钥注入 -> 请求交易令牌 -> 处理交易

set -e

BACKEND_URL="http://localhost:8080"
DEVICE_ID=""
TRANSACTION_TOKEN=""

echo "=========================================="
echo "WebKernel Demo - 完整交易流程测试"
echo "=========================================="
echo ""

# Step 1: 注册设备
echo "📱 Step 1: 注册设备..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/v1/devices/register" \
  -H "Content-Type: application/json" \
  -d '{
    "imei": "WEBKERNEL-DEMO-001",
    "model": "WebKernel Demo",
    "os_version": "1.0.0",
    "tee_type": "WebAssembly",
    "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
    "device_mode": "demo",
    "nfc_present": true
  }')

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ 设备注册失败 (HTTP $HTTP_CODE)"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi

DEVICE_ID=$(echo "$RESPONSE_BODY" | jq -r '.device_id')

if [ -z "$DEVICE_ID" ] || [ "$DEVICE_ID" = "null" ]; then
  echo "❌ 无法解析 device_id"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi

echo "✅ 设备注册成功: $DEVICE_ID"
echo ""

# Step 2: 审批设备（需要管理员权限）
echo "✅ Step 2: 审批设备..."
echo "   (假设设备已被审批，跳过此步骤)"
echo ""

# Step 3: 注入密钥
echo "🔑 Step 3: 注入密钥..."
INJECT_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/v1/keys/inject" \
  -H "Content-Type: application/json" \
  -d "{
    \"device_id\": \"$DEVICE_ID\"
  }")

echo "$INJECT_RESPONSE" | jq .

if echo "$INJECT_RESPONSE" | jq -e '.message' > /dev/null; then
  echo "✅ 密钥注入成功"
else
  echo "⚠️  密钥注入可能失败，但继续测试..."
fi
echo ""

# Step 4: 请求交易令牌
echo "🔐 Step 4: 请求交易令牌..."
TOKEN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/v1/transactions/request-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"device_id\": \"$DEVICE_ID\",
    \"health_check\": {
      \"root_detection\": false,
      \"emulator_detection\": false,
      \"debugger_detection\": false,
      \"hook_detection\": false,
      \"tamper_detection\": false,
      \"security_score\": 95
    }
  }")

TRANSACTION_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.transaction_token')

if [ -z "$TRANSACTION_TOKEN" ] || [ "$TRANSACTION_TOKEN" = "null" ]; then
  echo "❌ 交易令牌请求失败"
  echo "$TOKEN_RESPONSE" | jq .
  exit 1
fi

echo "✅ 交易令牌获取成功"
echo "   Token: ${TRANSACTION_TOKEN:0:50}..."
echo "   Max Amount: $(echo "$TOKEN_RESPONSE" | jq -r '.max_amount')"
echo "   Expires At: $(echo "$TOKEN_RESPONSE" | jq -r '.expires_at')"
echo ""

# Step 5: 处理交易
echo "💳 Step 5: 处理交易..."
TRANSACTION_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/v1/transactions/process" \
  -H "Content-Type: application/json" \
  -d "{
    \"device_id\": \"$DEVICE_ID\",
    \"transaction_token\": \"$TRANSACTION_TOKEN\",
    \"amount\": 5000,
    \"currency\": \"USD\",
    \"card_number\": \"4111111111111111\",
    \"expiry_date\": \"12/25\",
    \"cvv\": \"123\",
    \"cardholder_name\": \"TEST USER\",
    \"latitude\": 37.7749,
    \"longitude\": -122.4194
  }")

TRANSACTION_ID=$(echo "$TRANSACTION_RESPONSE" | jq -r '.transaction_id')

if [ -z "$TRANSACTION_ID" ] || [ "$TRANSACTION_ID" = "null" ]; then
  echo "❌ 交易处理失败"
  echo "$TRANSACTION_RESPONSE" | jq .
  exit 1
fi

echo "✅ 交易处理成功！"
echo ""
echo "=========================================="
echo "交易详情:"
echo "=========================================="
echo "$TRANSACTION_RESPONSE" | jq .
echo ""
echo "=========================================="
echo "✅ 完整交易流程测试成功！"
echo "=========================================="
echo ""
echo "设备ID: $DEVICE_ID"
echo "交易ID: $TRANSACTION_ID"
echo ""
