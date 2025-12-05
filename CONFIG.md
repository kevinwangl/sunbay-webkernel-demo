# SUNBAY WebKernel Demo - 配置说明

## 配置文件

本项目支持通过外部配置文件进行配置，无需修改代码即可更改设置。

### 配置文件位置

- **生产配置**: `config.json` (项目根目录)
- **示例配置**: `config.example.json` (模板文件)

### 快速开始

1. 复制示例配置文件：
```bash
cp config.example.json config.json
```

2. 编辑 `config.json` 修改配置：
```bash
nano config.json
# 或使用你喜欢的编辑器
```

3. 启动应用：
```bash
npm run dev
```

应用会自动加载 `config.json` 中的配置。

## 配置项说明

### backendUrl
- **类型**: `string`
- **默认值**: `"http://localhost:8080"`
- **说明**: SUNBAY SoftPOS 后端服务地址
- **示例**: 
  - 本地开发: `"http://localhost:8080"`
  - 生产环境: `"https://api.sunbay.com"`

### kernelServiceUrl
- **类型**: `string`
- **默认值**: `"http://localhost:3000"`
- **说明**: Kernel服务地址（用于下载WASM内核）
- **示例**:
  - 本地开发: `"http://localhost:3000"`
  - 生产环境: `"https://kernel.sunbay.com"`

### defaultImei
- **类型**: `string`
- **默认值**: `"863592048725123"`
- **说明**: 设备IMEI号，用于标识设备身份
- **格式**: 15位数字
- **示例**: `"863592048725123"`
- **注意**: 每个设备应使用唯一的IMEI

### deviceModel
- **类型**: `string`
- **默认值**: `"Sunbay-Web-Demo"`
- **说明**: 设备型号名称
- **示例**: 
  - `"Sunbay-Web-Demo"`
  - `"Chrome-Browser-v120"`
  - `"Safari-iOS-v17"`

### teeType
- **类型**: `"QTEE" | "TRUST_ZONE"`
- **默认值**: `"QTEE"`
- **说明**: TEE（可信执行环境）类型
- **可选值**:
  - `"QTEE"`: Qualcomm TEE
  - `"TRUST_ZONE"`: ARM TrustZone
- **注意**: Web环境通常使用 `"QTEE"`

### deviceMode
- **类型**: `"FULL_POS" | "PIN_PAD"`
- **默认值**: `"FULL_POS"`
- **说明**: 设备工作模式
- **可选值**:
  - `"FULL_POS"`: 完整POS终端模式（支持完整交易流程）
  - `"PIN_PAD"`: PIN输入设备模式（仅支持PIN加密）

### debug
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用调试模式
- **效果**:
  - `true`: 显示详细日志，启用开发者工具
  - `false`: 仅显示关键信息

### autoRegister
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否在启动时自动注册设备
- **效果**:
  - `true`: 应用启动时自动向后端注册设备
  - `false`: 需要手动触发设备注册

### kernelVersion
- **类型**: `string`
- **默认值**: `"v1.0.0"`
- **说明**: 首选的内核版本
- **格式**: `vX.Y.Z` (语义化版本)
- **示例**: `"v1.0.0"`, `"v2.1.3"`
- **注意**: 如果指定版本不存在，会使用最新稳定版

## 配置示例

### 开发环境配置
```json
{
  "backendUrl": "http://localhost:8080",
  "kernelServiceUrl": "http://localhost:3000",
  "defaultImei": "863592048725123",
  "deviceModel": "Sunbay-Web-Demo-Dev",
  "teeType": "QTEE",
  "deviceMode": "FULL_POS",
  "debug": true,
  "autoRegister": true,
  "kernelVersion": "v1.0.0"
}
```

### 生产环境配置
```json
{
  "backendUrl": "https://api.sunbay.com",
  "kernelServiceUrl": "https://kernel.sunbay.com",
  "defaultImei": "863592048725456",
  "deviceModel": "Sunbay-Web-Prod",
  "teeType": "QTEE",
  "deviceMode": "FULL_POS",
  "debug": false,
  "autoRegister": true,
  "kernelVersion": "v2.0.0"
}
```

### 测试环境配置
```json
{
  "backendUrl": "https://test-api.sunbay.com",
  "kernelServiceUrl": "https://test-kernel.sunbay.com",
  "defaultImei": "863592048725789",
  "deviceModel": "Sunbay-Web-Test",
  "teeType": "QTEE",
  "deviceMode": "FULL_POS",
  "debug": true,
  "autoRegister": false,
  "kernelVersion": "v1.5.0-beta"
}
```

### PIN Pad模式配置
```json
{
  "backendUrl": "http://localhost:8080",
  "kernelServiceUrl": "http://localhost:3000",
  "defaultImei": "863592048725999",
  "deviceModel": "Sunbay-PinPad",
  "teeType": "QTEE",
  "deviceMode": "PIN_PAD",
  "debug": true,
  "autoRegister": true,
  "kernelVersion": "v1.0.0"
}
```

## 配置加载顺序

1. 应用启动时尝试加载 `config.json`
2. 如果 `config.json` 存在且有效，使用其中的配置
3. 如果 `config.json` 不存在或无效，使用默认配置
4. 配置加载完成后，应用继续启动

## 运行时配置更新

除了通过配置文件，还可以在运行时通过代码更新配置：

```typescript
import { updateConfig, getConfig } from './config';

// 更新配置
updateConfig({
  backendUrl: 'https://new-api.sunbay.com',
  debug: false
});

// 获取当前配置
const config = getConfig();
console.log(config);
```

## 配置验证

应用会在启动时验证配置的有效性：

- ✅ **backendUrl**: 必须是有效的URL
- ✅ **kernelServiceUrl**: 必须是有效的URL
- ✅ **defaultImei**: 必须是15位数字
- ✅ **teeType**: 必须是 `"QTEE"` 或 `"TRUST_ZONE"`
- ✅ **deviceMode**: 必须是 `"FULL_POS"` 或 `"PIN_PAD"`
- ✅ **kernelVersion**: 必须符合 `vX.Y.Z` 格式

如果配置无效，应用会：
1. 在控制台显示警告信息
2. 使用默认值替代无效配置
3. 继续运行

## 故障排除

### 配置文件未加载

**问题**: 应用使用默认配置而不是 `config.json`

**解决方案**:
1. 确认 `config.json` 在项目根目录（与 `index.html` 同级）
2. 检查 `config.json` 的JSON格式是否正确
3. 查看浏览器控制台的错误信息
4. 确认文件权限允许读取

### 配置格式错误

**问题**: 应用启动失败或显示错误

**解决方案**:
1. 使用JSON验证工具检查 `config.json` 格式
2. 确保所有字符串使用双引号
3. 确保没有多余的逗号
4. 参考 `config.example.json` 的格式

### CORS错误

**问题**: 无法连接到后端服务

**解决方案**:
1. 确认 `backendUrl` 配置正确
2. 检查后端服务是否启动
3. 确认后端CORS配置允许前端域名
4. 在开发环境使用代理或配置CORS

## 最佳实践

1. **不要提交 `config.json` 到版本控制**
   - 将 `config.json` 添加到 `.gitignore`
   - 仅提交 `config.example.json` 作为模板

2. **为不同环境使用不同配置**
   - 开发: `config.dev.json`
   - 测试: `config.test.json`
   - 生产: `config.prod.json`

3. **定期备份配置文件**
   - 在修改前备份当前配置
   - 记录配置变更历史

4. **使用环境变量**
   - 敏感信息（如密钥）使用环境变量
   - 配置文件仅存储非敏感配置

5. **文档化自定义配置**
   - 记录为什么使用特定配置值
   - 说明配置的业务含义

## 相关文件

- `config.json` - 生产配置文件
- `config.example.json` - 配置模板
- `src/config.ts` - 配置加载逻辑
- `src/App.tsx` - 配置初始化
- `.gitignore` - 忽略配置文件

## 技术支持

如有配置相关问题，请：
1. 查看浏览器控制台日志
2. 参考本文档的故障排除部分
3. 联系技术支持团队
