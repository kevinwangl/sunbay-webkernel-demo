# WebKernel Demo 故障排查指南

## 设备注册失败问题

### 常见原因

#### 1. 后端未运行
**症状**: 浏览器Console显示网络错误或CORS错误

**检查**:
```bash
curl http://localhost:8080/health/check
```

**解决**:
```bash
cd sunbay-softpos-backend
cargo run
```

#### 2. IMEI已存在
**症状**: 注册返回 "IMEI already exists" 错误

**原因**: 数据库中已有相同IMEI的设备

**解决方案1 - 清除localStorage重新注册**:
```javascript
// 在浏览器Console运行
localStorage.removeItem('sunbay_demo_device_id');
localStorage.removeItem('sunbay_demo_imei');
location.reload();
```

**解决方案2 - 清除数据库**:
```bash
cd sunbay-softpos-backend
./clear_test_data.sh
```

**解决方案3 - 修改IMEI**:
编辑 `config.json`:
```json
{
  "defaultImei": "863592048725999"  // 改成不同的15位数字
}
```

#### 3. IMEI格式错误
**症状**: 注册返回 "IMEI must be 15 digits" 或 "IMEI must contain only digits"

**检查**: IMEI必须是15位纯数字

**解决**: 修改 `config.json` 中的 `defaultImei`

#### 4. 配置文件未加载
**症状**: 使用默认IMEI而不是配置的IMEI

**检查**:
```javascript
// 在浏览器Console运行
console.log(localStorage.getItem('sunbay_demo_imei'));
```

**解决**:
1. 确认 `config.json` 存在于项目根目录
2. 检查浏览器Network标签，确认 `config.json` 被成功加载
3. 清除localStorage重新加载

#### 5. 密钥注入失败
**症状**: 设备注册成功但密钥注入失败

**可能原因**:
- 设备ID格式错误
- 设备状态不是PENDING或ACTIVE
- 后端服务异常

**检查**:
```bash
# 查看后端日志
tail -f sunbay-softpos-backend/backend.log

# 检查设备状态
cd sunbay-softpos-backend
sqlite3 data/sunbay_softpos.db "SELECT id, status FROM devices;"
```

### 调试步骤

#### 步骤1: 打开浏览器开发者工具
按 F12 打开开发者工具

#### 步骤2: 查看Console日志
查找错误信息：
- `Device registration failed:` - 注册失败
- `Key injection failed:` - 密钥注入失败
- `Kernel load failed:` - 内核加载失败

#### 步骤3: 查看Network标签
检查API请求：
1. `POST /api/v1/devices/register` - 设备注册
2. `POST /api/v1/public/keys/inject` - 密钥注入
3. `GET /api/v1/public/kernels/latest` - 获取最新内核

查看每个请求的：
- Status Code (应该是200或201)
- Request Payload (发送的数据)
- Response (返回的数据)

#### 步骤4: 检查localStorage
```javascript
// 查看所有存储的数据
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(key, ':', localStorage.getItem(key));
}
```

应该看到：
- `sunbay_demo_device_id`: 设备ID (UUID格式)
- `sunbay_demo_imei`: IMEI (15位数字)

### 完整测试流程

#### 1. 清理环境
```bash
# 清除数据库
cd sunbay-softpos-backend
./clear_test_data.sh

# 清除localStorage (在浏览器Console)
localStorage.clear();
```

#### 2. 启动后端
```bash
cd sunbay-softpos-backend
cargo run
```

#### 3. 配置Demo
```bash
cd sunbay-webkernel-demo
cp config.example.json config.json
# 编辑config.json修改IMEI等配置
```

#### 4. 启动Demo
```bash
npm run dev
```

#### 5. 访问并测试
访问 `http://localhost:5173`

观察初始化流程：
1. BOOTING - 加载内核
2. REGISTERING - 注册设备
3. INJECTING_KEYS - 注入密钥
4. READY - 就绪

### 使用测试脚本

运行自动化测试脚本：
```bash
./test-webkernel-demo-registration.sh
```

这个脚本会：
1. 检查后端健康状态
2. 测试设备注册
3. 测试密钥注入
4. 显示数据库中的设备信息

### 常见错误代码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查IMEI格式、必填字段 |
| 409 | IMEI已存在 | 更换IMEI或清除数据库 |
| 404 | 设备不存在 | 检查device_id是否正确 |
| 500 | 服务器内部错误 | 查看后端日志 |

### 手动注册设备

如果自动注册失败，可以手动注册：

```bash
curl -X POST http://localhost:8080/api/v1/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "imei": "863592048725123",
    "model": "Sunbay-Web-Demo",
    "os_version": "1.0.0",
    "tee_type": "QTEE",
    "public_key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
    "device_mode": "FULL_POS",
    "nfc_present": true
  }'
```

然后在浏览器Console设置localStorage：
```javascript
localStorage.setItem('sunbay_demo_device_id', '返回的device_id');
localStorage.setItem('sunbay_demo_imei', '863592048725123');
location.reload();
```

### 检查后端日志

```bash
# 实时查看日志
tail -f sunbay-softpos-backend/backend.log

# 搜索特定设备的日志
grep "863592048725123" sunbay-softpos-backend/backend.log

# 搜索错误
grep "ERROR" sunbay-softpos-backend/backend.log
```

### 数据库查询

```bash
cd sunbay-softpos-backend

# 查看所有设备
sqlite3 data/sunbay_softpos.db "SELECT id, imei, model, status FROM devices;"

# 查看特定IMEI的设备
sqlite3 data/sunbay_softpos.db "SELECT * FROM devices WHERE imei='863592048725123';"

# 删除特定设备
sqlite3 data/sunbay_softpos.db "DELETE FROM devices WHERE imei='863592048725123';"
```

### 联系支持

如果以上方法都无法解决问题，请提供：
1. 浏览器Console的完整错误日志
2. Network标签中失败请求的详细信息
3. 后端日志 (`backend.log`)
4. 使用的配置文件 (`config.json`)
5. 数据库中的设备信息
