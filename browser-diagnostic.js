/**
 * WebKernel Demo - 浏览器端诊断脚本
 * 
 * 使用方法：
 * 1. 打开 http://localhost:5173
 * 2. 打开 DevTools (F12) → Console
 * 3. 复制粘贴此脚本并运行
 */

console.log('🔍 WebKernel Demo 诊断工具');
console.log('='.repeat(50));
console.log('');

// 1. 检查 localStorage
console.log('1️⃣ 检查 localStorage');
console.log('-'.repeat(50));
const deviceId = localStorage.getItem('sunbay_demo_device_id');
const imei = localStorage.getItem('sunbay_demo_imei');

console.log('Device ID:', deviceId || '(未设置)');
console.log('IMEI:', imei || '(未设置)');

// 验证 device_id 格式
if (deviceId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deviceId);
    const isDemoFormat = deviceId.startsWith('demo-device-');
    
    if (isUUID) {
        console.log('✅ Device ID 格式正确 (UUID)');
    } else if (isDemoFormat) {
        console.error('❌ Device ID 格式错误！使用了旧的 demo-device- 格式');
        console.error('   需要清除并重新注册');
    } else {
        console.warn('⚠️ Device ID 格式未知');
    }
} else {
    console.log('ℹ️ 未找到 device_id，将在首次访问时注册');
}
console.log('');

// 2. 检查配置
console.log('2️⃣ 检查应用配置');
console.log('-'.repeat(50));
try {
    // 尝试获取配置（如果已加载）
    const config = window.AppConfig || {};
    console.log('Backend URL:', config.backendUrl || '(未加载)');
    console.log('Default IMEI:', config.defaultImei || '(未加载)');
    console.log('Device Model:', config.deviceModel || '(未加载)');
} catch (e) {
    console.log('ℹ️ 配置尚未加载');
}
console.log('');

// 3. 建议操作
console.log('3️⃣ 建议操作');
console.log('-'.repeat(50));

if (deviceId && deviceId.startsWith('demo-device-')) {
    console.log('❌ 发现错误的 device_id 格式！');
    console.log('');
    console.log('请执行以下命令清除并重新注册：');
    console.log('');
    console.log('  localStorage.clear();');
    console.log('  location.reload();');
    console.log('');
} else if (!deviceId) {
    console.log('ℹ️ 未找到 device_id');
    console.log('');
    console.log('刷新页面将自动注册设备：');
    console.log('');
    console.log('  location.reload();');
    console.log('');
} else {
    console.log('✅ Device ID 看起来正常');
    console.log('');
    console.log('如果仍有问题，请检查：');
    console.log('1. 浏览器 Network 标签中的 API 请求');
    console.log('2. 后端日志中收到的 deviceId');
    console.log('3. 是否需要硬刷新清除缓存 (Cmd+Shift+R)');
    console.log('');
}

// 4. 快捷操作
console.log('4️⃣ 快捷操作');
console.log('-'.repeat(50));
console.log('');
console.log('// 清除所有数据并重新加载');
console.log('localStorage.clear(); location.reload();');
console.log('');
console.log('// 只清除 device_id');
console.log('localStorage.removeItem("sunbay_demo_device_id"); location.reload();');
console.log('');
console.log('// 查看当前 device_id');
console.log('console.log(localStorage.getItem("sunbay_demo_device_id"));');
console.log('');

console.log('='.repeat(50));
console.log('✅ 诊断完成');
console.log('');
