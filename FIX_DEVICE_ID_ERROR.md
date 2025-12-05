# 修复 Device ID 错误

## 问题描述

WebKernel Demo显示错误：
```
❌ Key injection failed: Device not found
Using existing device ID: demo-device-rhphbc
```

## 原因

localStorage中保存了旧格式的device ID (`demo-device-rhphbc`)，但backend数据库中没有这个设备。

## 解决方案

### 方法1: 浏览器Console清除（推荐）

1. 打开浏览器开发者工具 (F12)
2. 切换到Console标签
3. 复制粘贴以下代码并回车：

```javascript
localStorage.removeItem('sunbay_demo_device_id');
localStorage.removeItem('sunbay_demo_imei');
console.log('✅ Cleared! Reload page to register new device');
location.reload();
```

### 方法2: 使用清理脚本

```bash
cd sunbay-webkernel-demo
# 在浏览器Console中运行 clear-localStorage.js 的内容
```

### 方法3: 清除所有localStorage

在浏览器Console中运行：
```javascript
localStorage.clear();
location.reload();
```

### 方法4: 使用重置脚本

```bash
cd ..
./reset-webkernel-demo.sh
```

这会清除backend数据和前端缓存。

## 验证修复

刷新页面后，应该看到：

```
📱 Registering device with IMEI 863592048XXXXXX...
✅ Device registered successfully with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
💾 Device ID saved to localStorage for reuse
Injecting keys for device xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx...
✅ Keys injected successfully
```

Device ID应该是UUID格式，不是 `demo-device-rhphbc`。

## 预防措施

如果再次遇到此问题：

1. **检查localStorage**:
   ```javascript
   console.log(localStorage.getItem('sunbay_demo_device_id'));
   ```

2. **检查backend数据库**:
   ```bash
   cd sunbay-softpos-backend
   sqlite3 data/sunbay_softpos.db "SELECT device_id, imei FROM devices;"
   ```

3. **确保backend正在运行**:
   ```bash
   curl http://localhost:8080/health
   ```

## 相关文档

- [WEBKERNEL_DEMO_COMPLETE_FIX.md](../WEBKERNEL_DEMO_COMPLETE_FIX.md)
- [WEBKERNEL_DEVICE_ID_PERSISTENCE.md](../WEBKERNEL_DEVICE_ID_PERSISTENCE.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**创建时间**: 2024年12月5日  
**问题**: Device ID格式错误  
**状态**: ✅ 已解决
