# SUNBAY WebKernel Demo

云端内核加载演示项目 - 展示如何从 Backend 动态加载 WebAssembly 内核并处理交易。

## 🎯 项目简介

这是一个 Web SoftPOS 演示应用，展示了：

- 从 **Backend** 动态加载 WASM 内核（需要认证）
- 使用 WebAssembly 处理支付交易
- **Device ID 持久化** - 自动保存并重用设备ID，避免重复注册
- Mock 数据 fallback 机制
- 完整的交易流程 UI
- JWT 认证和授权

## 🚀 快速开始

### 1. 配置应用

复制配置模板并根据需要修改：

```bash
cp config.example.json config.json
```

编辑 `config.json` 修改配置（可选）：
```json
{
  "backendUrl": "http://localhost:8080",
  "kernelServiceUrl": "http://localhost:3000",
  "defaultImei": "863592048725123",
  "deviceModel": "Sunbay-Web-Demo",
  "teeType": "QTEE",
  "deviceMode": "FULL_POS",
  "debug": true,
  "autoRegister": true,
  "kernelVersion": "v1.0.0"
}
```

详细配置说明请查看 [CONFIG.md](./CONFIG.md)

### 2. 安装依赖

```bash
npm install
```

### 3. 启动 Backend

确保 Backend 在 `http://localhost:8080` 运行：

```bash
cd ../sunbay-softpos-backend
cargo run
```

### 4. 启动 Kernel Service（可选）

Kernel Service 用于健康检查，在 `http://localhost:3000` 运行：

```bash
cd ../sunbay-kernel-service
cargo run
```

### 5. 启动 Demo

```bash
npm run dev
```

访问 `http://localhost:5173`

### 6. 登录

使用默认凭据登录：
- **用户名**: `admin`
- **密码**: `admin123`

## 📦 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **WebAssembly** - 内核运行时
- **JWT** - 认证授权

## 🏗️ 项目结构

```
sunbay-webkernel-demo/
├── src/
│   ├── api/
│   │   └── client.ts           # Backend API 客户端（含认证）
│   ├── components/
│   │   ├── LoginForm.tsx       # 登录表单
│   │   └── PosTerminal.tsx     # POS 终端 UI 组件
│   ├── services/
│   │   └── KernelLoader.ts     # WASM 内核加载器（从 Backend）
│   ├── config.ts               # 配置加载和管理
│   ├── App.tsx                 # 应用入口（含登录流程）
│   └── main.tsx
├── public/
│   └── mock_kernel.wasm        # Mock WASM 文件（fallback）
├── config.json                 # 运行时配置（不提交到Git）
├── config.example.json         # 配置模板
├── CONFIG.md                   # 配置说明文档
└── index.html
```

## 🔧 核心功能

### 认证流程

```typescript
import { backendApi, setAuthToken } from './api/client';

// 登录
const response = await backendApi.login('admin', 'admin123');
// Token 自动保存到 localStorage

// 登出
backendApi.logout();
```

### KernelLoader

负责从 Backend 加载和管理 WASM 内核：

```typescript
const loader = KernelLoader.getInstance();

// 加载最新内核（需要认证）
const version = await loader.loadLatestKernel();

// 注册设备（自动持久化 device_id）
const deviceId = await loader.registerDevice();
// 首次：注册新设备并保存到 localStorage
// 后续：直接使用已保存的 device_id

// 注入密钥
await loader.injectKeys(deviceId);

// 处理交易
const result = await loader.processTransaction(10000);

// 鉴证交易
const attested = await loader.attestTransaction(result.cryptogram);
```

### Device ID 持久化

应用会自动保存设备ID到 localStorage，避免重复注册：

```typescript
// 首次访问 - 注册新设备
📱 Registering device with IMEI 863592048725123...
✅ Device registered successfully with ID: 7940cc7e-f5dc-4091-8e32-4adaf051e53f
💾 Device ID saved to localStorage for reuse

// 后续访问 - 重用已保存的设备ID
✅ Using existing device ID: 7940cc7e-f5dc-4091-8e32-4adaf051e53f
```

**重新注册**（如需测试）：
```javascript
// 浏览器 Console
localStorage.clear();
location.reload();
```

详细测试步骤请查看 [verify-device-persistence.md](./verify-device-persistence.md)

### PosTerminal

模拟 POS 终端界面，支持：

- 金额输入
- 交易处理
- 状态显示
- 成功/失败反馈

## 🎨 UI 状态

- **BOOTING** - 启动中，加载内核
- **READY** - 就绪，等待输入
- **PROCESSING** - 处理中
- **SUCCESS** - 交易成功
- **ERROR** - 交易失败

## 🔄 Fallback 机制

如果 Backend 不可用或未认证，自动降级到 Mock 模式：

```typescript
try {
    const kernels = await backendApi.getKernels();
    const latest = kernels.filter(k => k.status === 'stable')[0];
    downloadUrl = backendApi.getDownloadUrl(latest.version);
} catch (e) {
    console.warn('Backend unreachable, using mock kernel', e);
    downloadUrl = '/mock_kernel.wasm';
}
```

## 🔐 认证说明

### Token 管理

- Token 存储在 `localStorage`
- 自动附加到所有 Backend API 请求
- 401 错误会提示重新登录

### API 端点

**Backend (http://localhost:8080):**
- `POST /api/v1/auth/login` - 登录
- `GET /api/v1/kernels` - 获取内核列表（需认证）
- `GET /api/v1/kernels/:version/download` - 下载内核（需认证）
- `POST /api/v1/kernels` - 上传内核（需认证）
- `POST /api/v1/kernels/:version/publish` - 发布内核（需认证）
- `DELETE /api/v1/kernels/:version` - 删除内核（需认证）

**Kernel Service (http://localhost:3000):**
- `GET /health` - 健康检查（设备能力检测）

## 📝 开发说明

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 🔗 相关项目

- [sunbay-softpos-backend](../sunbay-softpos-backend) - 主后端服务（内核管理）
- [sunbay-kernel-service](../sunbay-kernel-service) - EMV 处理服务
- [sunbay-softpos-frontend](../sunbay-softpos-frontend) - 管理后台

## 架构变更说明

### 旧架构
```
Demo → Kernel Service (下载内核)
```

### 新架构
```
Demo → Backend (认证 + 内核管理)
     → Kernel Service (EMV 处理 + 健康检查)
```

**原因**: 内核管理功能已从 Kernel Service 迁移到 Backend，实现集中管理和更好的安全控制。

## ⚙️ 配置管理

本项目支持通过外部配置文件进行配置，详细说明请查看 [CONFIG.md](./CONFIG.md)

### 配置文件

- `config.json` - 运行时配置（可手动修改）
- `config.example.json` - 配置模板
- `src/config.ts` - 配置加载逻辑

### 主要配置项

- `backendUrl` - 后端服务地址
- `kernelServiceUrl` - Kernel服务地址
- `defaultImei` - 设备IMEI号
- `deviceModel` - 设备型号
- `teeType` - TEE类型
- `deviceMode` - 设备模式
- `debug` - 调试模式
- `autoRegister` - 自动注册
- `kernelVersion` - 内核版本

## 📄 许可证

MIT
