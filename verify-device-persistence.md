# 验证 Device ID 持久化

## 测试目标

验证 WebKernel Demo 正确保存和重用 device_id，避免重复注册。

## 测试步骤

### 1. 清理环境

```bash
# 清除后端数据库中的测试设备
cd sunbay-softpos-backend
./clear_test_data.sh
cd ..
```

在浏览器 Console 中：
```javascript
localStorage.clear();
```

### 2. 首次访问

1. 访问 `http://localhost:5173`
2. 打开浏览器 DevTools → Console
3. 观察日志输出：

```
📱 Registering device with IMEI 863592048725123...
✅ Device registered successfully with ID: 7940cc7e-f5dc-4091-8e32-4adaf051e53f
💾 Device ID saved to localStorage for reuse
```

4. 记录 device_id（例如：`7940cc7e-f5dc-4091-8e32-4adaf051e53f`）

### 3. 检查 localStorage

在 DevTools → Application → Local Storage → `http://localhost:5173`

应该看到：
- Key: `sunbay_demo_device_id`
- Value: `7940cc7e-f5dc-4091-8e32-4adaf051e53f`

### 4. 刷新页面（测试重用）

1. 刷新页面（F5 或 Cmd+R）
2. 观察 Console 日志：

```
✅ Using existing device ID: 7940cc7e-f5dc-4091-8e32-4adaf051e53f
```

**关键点**：应该看到 "Using existing device ID"，而不是 "Registering device"

### 5. 验证后端数据库

```bash
cd sunbay-softpos-backend
sqlite3 data/sunbay_softpos.db "SELECT id, imei, model, created_at FROM devices WHERE imei='863592048725123';"
```

应该只有**一条**记录，即使刷新了多次页面。

### 6. 多次刷新测试

1. 刷新页面 5-10 次
2. 每次都应该看到 "Using existing device ID"
3. 再次检查数据库，仍然只有一条记录

## 预期结果

### ✅ 成功标志

1. **首次访问**：
   - 看到 "Registering device" 日志
   - device_id 被保存到 localStorage
   - 数据库中创建一条新记录

2. **后续访问**：
   - 看到 "Using existing device ID" 日志
   - 不会调用注册 API
   - 数据库中没有新记录

3. **localStorage 持久化**：
   - `sunbay_demo_device_id` 存在
   - `sunbay_demo_imei` 存在
   - 值在刷新后保持不变

### ❌ 失败标志

1. 每次刷新都看到 "Registering device"
2. 数据库中有多条相同 IMEI 的记录
3. localStorage 中没有保存 device_id

## 故障排查

### 问题：每次都重新注册

**原因**：localStorage 未正确保存

**解决**：
1. 检查浏览器是否启用了隐私模式（会阻止 localStorage）
2. 检查浏览器 Console 是否有错误
3. 手动设置 localStorage：
```javascript
localStorage.setItem('sunbay_demo_device_id', 'YOUR_DEVICE_ID');
localStorage.setItem('sunbay_demo_imei', '863592048725123');
```

### 问题：device_id 为 null 或 undefined

**原因**：后端响应格式问题

**解决**：
1. 检查后端是否正常运行
2. 查看 Network 标签中的 API 响应
3. 确认响应格式为：
```json
{
  "code": 201,
  "data": {
    "device_id": "..."
  }
}
```

### 问题：localStorage 被清除

**原因**：浏览器设置或扩展程序

**解决**：
1. 禁用自动清除 Cookie/Storage 的扩展
2. 检查浏览器隐私设置
3. 使用普通模式（非隐私模式）

## 清理测试数据

### 清除 localStorage
```javascript
localStorage.removeItem('sunbay_demo_device_id');
localStorage.removeItem('sunbay_demo_imei');
// 或
localStorage.clear();
```

### 清除后端数据
```bash
cd sunbay-softpos-backend
./clear_test_data.sh
```

## 总结

Device ID 持久化确保：
- ✅ 避免重复注册
- ✅ 保持设备身份一致
- ✅ 减少后端负载
- ✅ 支持离线场景（已注册设备可以直接使用）

正确实现后，用户只需注册一次，后续访问会自动重用已保存的 device_id。
