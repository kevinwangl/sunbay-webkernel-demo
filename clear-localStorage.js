// 在浏览器Console中运行此脚本来清除旧的device ID
// Clear old device ID and IMEI from localStorage

console.log('🧹 Clearing WebKernel Demo localStorage...');

// Show current values
console.log('Current values:');
console.log('  device_id:', localStorage.getItem('sunbay_demo_device_id'));
console.log('  imei:', localStorage.getItem('sunbay_demo_imei'));

// Clear the values
localStorage.removeItem('sunbay_demo_device_id');
localStorage.removeItem('sunbay_demo_imei');

console.log('✅ localStorage cleared!');
console.log('🔄 Please reload the page to register a new device');
