# 构建和部署指南

## 快速开始

### 本地开发
```bash
npm run dev
# 使用 http://localhost:8080 作为后端
```

### 生产构建
```bash
npm run build
# 使用 https://softpay.sunbay.dev 作为后端
```

---

## 配置说明

### 环境变量优先级

应用按以下优先级加载配置：

1. **运行时 config.json**（最高优先级）- 如果 `public/config.json` 存在
2. **环境变量** - `.env.production` 或 `.env.development`
3. **默认值** - 代码中的 fallback

### 当前配置

#### 开发环境 (`.env.development`)
```bash
VITE_BACKEND_URL=http://localhost:8080
```

#### 生产环境 (`.env.production`)
```bash
VITE_BACKEND_URL=https://softpay.sunbay.dev
```

---

## 构建流程

### 方式 1: 使用环境变量（推荐）

**优点：** 简单，不需要额外文件

```bash
# 构建生产版本
npm run build

# dist 目录会使用 .env.production 中的配置
# backendUrl: https://softpay.sunbay.dev
```

### 方式 2: 使用 config.json（可选）

如果需要在部署后动态修改配置：

```bash
# 1. 构建
npm run build

# 2. 复制配置文件到 dist
cp public/config.production.json dist/config.json

# 3. 部署 dist 目录
```

**注意：** `config.json` 会覆盖环境变量的配置。

---

## 验证构建结果

### 检查环境变量是否生效

构建后，检查打包的代码：

```bash
# 查看构建产物中的配置
grep -r "softpay.sunbay.dev" dist/assets/*.js

# 应该能看到 https://softpay.sunbay.dev
```

### 本地测试构建产物

```bash
# 安装 serve
npm install -g serve

# 启动静态服务器
serve -s dist -p 3000

# 访问 http://localhost:3000
# 打开浏览器控制台，查看配置日志
```

---

## 常见问题

### Q: 为什么构建后还是用的 IP 地址？

**A:** 可能的原因：

1. **存在 `public/config.json` 文件**
   ```bash
   # 删除它
   rm public/config.json
   ```

2. **环境变量没有生效**
   ```bash
   # 确认 .env.production 存在
   cat .env.production
   
   # 重新构建
   npm run build
   ```

3. **浏览器缓存**
   ```bash
   # 清除浏览器缓存或使用无痕模式
   ```

### Q: 如何使用自定义后端地址？

**方式 1: 创建 .env.local**
```bash
echo "VITE_BACKEND_URL=https://custom.example.com" > .env.local
npm run build
```

**方式 2: 命令行指定**
```bash
VITE_BACKEND_URL=https://custom.example.com npm run build
```

**方式 3: 部署后修改**
```bash
# 在 dist 目录创建 config.json
cat > dist/config.json << EOF
{
  "backendUrl": "https://custom.example.com",
  "defaultImei": "863592048725123",
  "deviceModel": "Sunbay-Web-Demo",
  "teeType": "QTEE",
  "deviceMode": "FULL_POS",
  "debug": false,
  "autoRegister": true
}
EOF
```

### Q: 如何确认使用的是哪个配置？

打开浏览器控制台，查看日志：

```
✅ Configuration loaded from config.json: { backendUrl: "https://..." }
```

或者在代码中：
```typescript
import { getConfig } from './config';
console.log('Backend URL:', getConfig().backendUrl);
```

---

## 部署检查清单

- [ ] 确认 `.env.production` 中的 `VITE_BACKEND_URL` 正确
- [ ] 删除 `public/config.json`（如果存在）
- [ ] 运行 `npm run build`
- [ ] 检查 `dist` 目录中的文件
- [ ] 本地测试构建产物
- [ ] 部署到服务器
- [ ] 在生产环境验证配置

---

## 推荐的部署流程

```bash
# 1. 清理旧的构建
rm -rf dist

# 2. 确认环境变量
cat .env.production

# 3. 构建
npm run build

# 4. 验证构建结果
grep -r "softpay.sunbay.dev" dist/assets/*.js

# 5. 部署
# 将 dist 目录上传到服务器
```
