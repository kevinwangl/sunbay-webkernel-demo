# WASM Kernel 日志输出指南

## 概述

WebKernel Demo 现在包含详细的日志输出功能，可以帮助你调试和理解 WASM kernel 的运行过程。

## 日志来源

### 1. WASM Kernel 内部日志（Rust 端）

WASM kernel 使用 `console.log` 输出日志，所有日志都带有 `[WASM Kernel]` 前缀。

**日志内容**：
- 初始化信息
- EMV 命令执行（SELECT PPSE, SELECT Application, READ RECORD, GPO, Generate AC）
- APDU 命令详情（CLA, INS, P1, P2）
- 卡片数据解析
- 错误信息

**示例**：
```
[WASM Kernel] Initialized successfully
[WASM Kernel] Initializing EMV processor (Country: 156, Currency: CNY)
[WASM Kernel] SELECT PPSE
[WASM Kernel] PPSE Command: CLA=00 INS=A4 P1=04 P2=00
[WASM Kernel] SELECT Application: AID=A000000333010101
[WASM Kernel] Application Command: CLA=00 INS=A4 P1=04 P2=00
```

### 2. KernelLoader 日志（TypeScript 端）

前端加载器使用 `console.log` 输出日志，所有日志都带有 `[KernelLoader]` 前缀。

**日志内容**：
- Kernel 下载过程
- WASM 模块初始化
- 交易处理流程
- 设备注册和密钥注入
- 错误和警告信息

**示例**：
```
[KernelLoader] Fetching latest kernel from backend...
[KernelLoader] Latest kernel version: v1.0.0
[KernelLoader] Downloading kernel v1.0.0...
[KernelLoader] Downloaded 1234567 bytes
[KernelLoader] Initializing WASM module...
[KernelLoader] WASM module initialized
[KernelLoader] Creating EMV processor instance...
[KernelLoader] ✅ Kernel v1.0.0 loaded successfully
[KernelLoader] 💳 Processing transaction: $10.00
[KernelLoader] Calling WASM kernel selectPpse()...
[KernelLoader] PPSE Selection Result: {...}
[KernelLoader] ✅ Transaction processed successfully
[KernelLoader] Generated cryptogram: TC_1234567890_10_ABC123
```

## 如何查看日志

### 方法 1：浏览器开发者工具（推荐）

1. 打开 WebKernel Demo：`http://localhost:5173`
2. 按 `F12` 或右键 → "检查" 打开开发者工具
3. 切换到 "Console" 标签
4. 查看实时日志输出

**过滤日志**：
- 只看 WASM Kernel 日志：在 Console 中输入 `[WASM Kernel]`
- 只看 KernelLoader 日志：在 Console 中输入 `[KernelLoader]`

### 方法 2：使用浏览器的日志级别过滤

在 Console 中可以按日志级别过滤：
- `Info`：普通信息日志
- `Warning`：警告日志（如 fallback 到 mock kernel）
- `Error`：错误日志

### 方法 3：保存日志到文件

在 Console 中右键 → "Save as..." 可以将日志保存到文件。

## 日志示例：完整交易流程

```
[KernelLoader] Fetching latest kernel from backend...
[KernelLoader] Latest kernel version: v1.0.0
[KernelLoader] Downloading kernel v1.0.0...
[KernelLoader] Downloaded 1234567 bytes
[KernelLoader] Initializing WASM module...
[WASM Kernel] Initialized successfully
[KernelLoader] WASM module initialized
[KernelLoader] Creating EMV processor instance...
[WASM Kernel] Initializing EMV processor (Country: 156, Currency: CNY)
[KernelLoader] ✅ Kernel v1.0.0 loaded successfully

[KernelLoader] 📱 Registering device with IMEI 863592048725123...
[KernelLoader] ✅ Device registered successfully with ID: 95a13b6f-720b-41ec-878b-0f4b846425a2

[KernelLoader] Injecting keys for device 95a13b6f-720b-41ec-878b-0f4b846425a2...
[KernelLoader] ✅ Keys injected successfully

[KernelLoader] 💳 Processing transaction: $10.00
[KernelLoader] Calling WASM kernel selectPpse()...
[WASM Kernel] SELECT PPSE
[WASM Kernel] PPSE Command: CLA=00 INS=A4 P1=04 P2=00
[KernelLoader] PPSE Selection Result: {cla: 0, ins: 164, p1: 4, p2: 0, data: null, le: 0}
[KernelLoader] ✅ Transaction processed successfully
[KernelLoader] Generated cryptogram: TC_1701234567890_10_ABC123

[KernelLoader] 💳 Processing transaction with backend...
[KernelLoader] ✅ Transaction attested successfully
[KernelLoader] ✅ Transaction processed successfully
```

## 调试技巧

### 1. 检查 Kernel 加载

如果 kernel 加载失败，查找以下日志：
```
[KernelLoader] ❌ Kernel load failed: ...
[KernelLoader] ⚠️  Falling back to mock kernel
```

### 2. 检查 WASM 初始化

确认 WASM 模块正确初始化：
```
[WASM Kernel] Initialized successfully
[WASM Kernel] Initializing EMV processor (Country: 156, Currency: CNY)
```

### 3. 检查交易处理

查看 EMV 命令执行：
```
[WASM Kernel] SELECT PPSE
[WASM Kernel] PPSE Command: CLA=00 INS=A4 P1=04 P2=00
```

### 4. 检查错误

所有错误都会以 `❌` 标记：
```
[KernelLoader] ❌ WASM processing error: ...
[WASM Kernel] ERROR: Invalid AID hex: ...
```

## 性能监控

### 查看 Kernel 下载大小

```
[KernelLoader] Downloaded 1234567 bytes
```

这可以帮助你了解 WASM 文件的大小，优化加载时间。

### 查看交易处理时间

在 Console 中使用 `console.time()` 和 `console.timeEnd()`：

```javascript
console.time('Transaction');
// 执行交易
console.timeEnd('Transaction');
```

## 生产环境

在生产环境中，你可能想要：

1. **减少日志输出**：修改 `config.json` 中的 `debug: false`
2. **使用日志聚合服务**：将日志发送到 Sentry、LogRocket 等服务
3. **只记录错误**：只保留 `console.error` 和 `console.warn`

### 禁用调试日志

在 `src/config.ts` 中：
```typescript
const defaultConfig: AppConfiguration = {
    // ...
    debug: false,  // 禁用调试日志
};
```

然后在代码中检查：
```typescript
if (AppConfig.debug) {
    console.log('[KernelLoader] Debug info...');
}
```

## 常见问题

### Q: 为什么看不到 WASM Kernel 日志？

A: 确保：
1. WASM 模块已正确加载
2. 浏览器 Console 没有过滤掉 `log` 级别的消息
3. 检查是否有 JavaScript 错误阻止了 WASM 初始化

### Q: 日志太多，如何过滤？

A: 在 Console 中使用过滤器：
- 输入 `[WASM Kernel]` 只看 WASM 日志
- 输入 `[KernelLoader]` 只看加载器日志
- 输入 `-[WASM Kernel]` 排除 WASM 日志

### Q: 如何在移动设备上查看日志？

A: 使用远程调试：
- Chrome: `chrome://inspect`
- Safari: 开发 → 连接到 iOS 设备
- 或使用 Eruda 等移动端调试工具

## 总结

通过这些详细的日志，你可以：
- ✅ 跟踪 WASM kernel 的加载和初始化过程
- ✅ 调试 EMV 交易处理流程
- ✅ 识别和解决错误
- ✅ 监控性能
- ✅ 理解系统的运行机制

所有日志都输出到浏览器的 Console，使用开发者工具即可查看。
