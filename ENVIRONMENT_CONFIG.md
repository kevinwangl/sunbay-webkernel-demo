# 环境配置说明

## 配置方式

sunbay-webkernel-demo 支持多种配置方式，按优先级从高到低：

1. **运行时配置** (`config.json`) - 最高优先级
2. **环境变量** (`.env` 文件)
3. **默认配置** (代码中的 fallback)

---

## 环境变量配置（推荐）

### 开发环境

本地调试时自动使用 `.env.development`：

```bash
# .env.development
VITE_BACKEND_URL=http://localhost:8080
```

**启动开发服务器：**
```bash
npm run dev
```

### 生产环境

构建 dist 时自动使用 `.env.production`：

```bash
# .env.production
VITE_BACKEND_URL=https://softpay.sunbay.dev
```

**构建生产版本：**
```bash
npm run build
```

### 自定义配置

创建 `.env.local` 文件可以覆盖任何环境的配置：

```bash
# .env.local (不会被 git 追踪)
VITE_BACKEND_URL=http://192.168.1.100:8080
```

---

## 运行时配置（可选）

如果需要在部署后动态修改配置，可以使用 `config.json`：

1. **复制示例文件：**
   ```bash
   cp public/config.example.json public/config.json
   ```

2. **修改配置：**
   ```json
   {
     "backendUrl": "https://your-custom-backend.com",
     "defaultImei": "863592048725123",
     "deviceModel": "Sunbay-Web-Demo",
     "teeType": "QTEE",
     "deviceMode": "FULL_POS",
     "debug": false,
     "autoRegister": true
   }
   ```

3. **部署时包含 config.json：**
   ```bash
   npm run build
   cp public/config.json dist/
   ```

---

## 配置优先级示例

假设有以下配置：

```bash
# .env.production
VITE_BACKEND_URL=https://softpay.sunbay.dev

# public/config.json
{
  "backendUrl": "https://custom.example.com"
}
```

**最终使用：** `https://custom.example.com` (config.json 优先级更高)

---

## 环境变量说明

| 变量名 | 说明 | 开发环境默认值 | 生产环境默认值 |
|--------|------|---------------|---------------|
| `VITE_BACKEND_URL` | 后端 API 地址 | `http://localhost:8080` | `https://softpay.sunbay.dev` |

---

## 常见场景

### 场景 1: 本地开发

```bash
# 使用默认配置
npm run dev

# 访问 http://localhost:5173
# 后端: http://localhost:8080
```

### 场景 2: 连接测试服务器

创建 `.env.local`：
```bash
VITE_BACKEND_URL=http://test-server.example.com:8080
```

然后：
```bash
npm run dev
```

### 场景 3: 生产部署

```bash
# 构建（自动使用 .env.production）
npm run build

# 部署 dist 目录
# 后端: https://softpay.sunbay.dev
```

### 场景 4: 多环境部署

为不同环境创建不同的 `.env` 文件：

```bash
# .env.staging
VITE_BACKEND_URL=https://staging.softpay.sunbay.dev

# .env.production
VITE_BACKEND_URL=https://softpay.sunbay.dev
```

构建时指定环境：
```bash
# 构建 staging 版本
npm run build -- --mode staging

# 构建 production 版本
npm run build -- --mode production
```

---

## 验证配置

启动应用后，打开浏览器控制台，查看日志：

```
✅ Configuration loaded from config.json: {
  backendUrl: "https://softpay.sunbay.dev",
  defaultImei: "863592048725123",
  ...
}
```

或者在代码中：
```typescript
import { getConfig } from './config';

console.log('Backend URL:', getConfig().backendUrl);
```

---

## 注意事项

1. **环境变量必须以 `VITE_` 开头** 才能在前端代码中访问
2. **`.env.local` 不会被 git 追踪**，适合存放敏感配置
3. **修改 `.env` 文件后需要重启开发服务器**
4. **`config.json` 可以在运行时动态加载**，无需重新构建
5. **生产环境建议使用环境变量**，避免在代码中硬编码
