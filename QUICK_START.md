# WebKernel Demo - 快速开始

## 🚀 5分钟快速启动

### 1. 启动后端服务

```bash
# 终端 1 - 启动 Backend
cd sunbay-softpos-backend
cargo run

# 终端 2 - 启动 Kernel Service (可选)
cd sunbay-kernel-service
cargo run
```

### 2. 启动 Demo

```bash
# 终端 3 - 启动 WebKernel Demo
cd sunbay-webkernel-demo
npm install
npm run dev
```

### 3. 访问应用

打开浏览器访问：`http://localhost:5173`

应用会自动：
1. ✅ 下载最新内核
2. ✅ 注册设备（首次）或重用已保存的 device_id
3. ✅ 注入密钥
4. ✅ 进入就绪状态

### 4. 测试交易

1. 输入金额（例如：10.00）
2. 点击 "PAY" 按钮
3. 等待交易处理
4. 查看交易结果

## 📱 Device ID 管理

### 首次使用

应用会自动注册设备并保存 device_id 到 localStorage。

**Console 输出**：
```
📱 Registering device with IMEI 863592048725123...
✅ Device registered successfully with ID: 7940cc7e-f5dc-4091-8e32-4adaf051e53f
💾 Device ID saved to localStorage for reuse
```

### 后续使用

刷新页面时会自动重用已保存的 device_id。

**Console 输出**：
```
✅ Using existing device ID: 7940cc7e-f5dc-4091-8e32-4adaf051e53f
```

### 重新注册

如需重新注册（例如测试）：

```javascript
// 浏览器 Console
localStorage.clear();
location.reload();
```

## 🔍 验证设备注册

### 方法 1: 浏览器 DevTools

1. 打开 DevTools (F12)
2. Application → Local Storage → `http://localhost:5173`
3. 查找：
   - `sunbay_demo_device_id`: 设备ID
   - `sunbay_demo_imei`: IMEI

### 方法 2: 数据库查询

```bash
cd sunbay-softpos-backend
sqlite3 data/sunbay_softpos.db "SELECT id, imei, model, status FROM devices;"
```

### 方法 3: 测试脚本

```bash
./test-webkernel-demo-registration.sh
```

## 🎯 常见场景

### 场景 1: 正常使用

```
访问页面 → 自动初始化 → 输入金额 → 支付 → 成功
```

### 场景 2: 刷新页面

```
刷新 → 重用 device_id → 自动初始化 → 继续使用
```

### 场景 3: 清除数据重新开始

```javascript
// Console
localStorage.clear();
location.reload();
```

```bash
# 清除后端数据
cd sunbay-softpos-backend
./clear_test_data.sh
```

## ⚙️ 配置（可选）

如需自定义配置：

```bash
cd sunbay-webkernel-demo
cp config.example.json config.json
# 编辑 config.json
```

配置项：
- `backendUrl`: 后端地址
- `defaultImei`: 默认 IMEI
- `deviceModel`: 设备型号
- `debug`: 调试模式

详细说明：[CONFIG.md](./CONFIG.md)

## 🐛 故障排查

### 问题：设备注册失败

**检查**：
1. 后端是否运行？访问 `http://localhost:8080/health/check`
2. 查看浏览器 Console 错误信息
3. 查看 Network 标签中的 API 响应

**解决**：
```bash
# 重启后端
cd sunbay-softpos-backend
cargo run
```

### 问题：每次都重新注册

**检查**：
1. 浏览器是否启用隐私模式？
2. localStorage 是否被禁用？
3. 是否有扩展程序清除 localStorage？

**解决**：
- 使用普通模式（非隐私模式）
- 禁用自动清除 Cookie/Storage 的扩展

### 问题：内核加载失败

**检查**：
1. Kernel Service 是否运行？
2. 后端数据库中是否有内核记录？

**解决**：
```bash
# 启动 Kernel Service
cd sunbay-kernel-service
cargo run

# 或使用 Mock 内核（自动 fallback）
# 应用会自动使用 public/mock_kernel.wasm
```

详细故障排查：[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📚 更多文档

- [README.md](./README.md) - 完整文档
- [CONFIG.md](./CONFIG.md) - 配置说明
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 故障排查
- [verify-device-persistence.md](./verify-device-persistence.md) - 设备持久化验证

## 💡 提示

1. **首次使用**：确保后端服务正常运行
2. **开发调试**：启用 `debug: true` 查看详细日志
3. **测试交易**：可以多次测试，device_id 会自动重用
4. **清理数据**：使用 `localStorage.clear()` 和 `clear_test_data.sh`

## ✅ 成功标志

如果看到以下内容，说明一切正常：

1. ✅ Console 显示 "Ready for Transaction"
2. ✅ 终端底部显示 device_id
3. ✅ 可以输入金额并支付
4. ✅ 交易成功显示 "APPROVED"

享受使用 WebKernel Demo！🎉
