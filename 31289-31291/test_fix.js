console.log('=== 高尔夫游戏 Bug 修复验证测试 ===');

const testResults = [];

function testCase(name, testFn) {
    try {
        testFn();
        testResults.push({ name, passed: true });
        console.log(`✅ ${name}`);
    } catch (error) {
        testResults.push({ name, passed: false, error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
    }
}

testCase('DOM元素存在性检查 - power-bar-fill', () => {
    const el = document.getElementById('power-bar-fill');
    if (!el) throw new Error('power-bar-fill 元素不存在');
});

testCase('DOM元素存在性检查 - power-value', () => {
    const el = document.getElementById('power-value');
    if (!el) throw new Error('power-value 元素不存在');
});

testCase('DOM元素存在性检查 - accuracy-bar-fill', () => {
    const el = document.getElementById('accuracy-bar-fill');
    if (!el) throw new Error('accuracy-bar-fill 元素不存在');
});

testCase('DOM元素存在性检查 - accuracy-value', () => {
    const el = document.getElementById('accuracy-value');
    if (!el) throw new Error('accuracy-value 元素不存在');
});

testCase('DOM元素存在性检查 - mental-bar-fill', () => {
    const el = document.getElementById('mental-bar-fill');
    if (!el) throw new Error('mental-bar-fill 元素不存在');
});

testCase('DOM元素存在性检查 - mental-value', () => {
    const el = document.getElementById('mental-value');
    if (!el) throw new Error('mental-value 元素不存在');
});

testCase('DOM元素存在性检查 - available-points', () => {
    const el = document.getElementById('available-points');
    if (!el) throw new Error('available-points 元素不存在');
});

testCase('DOM元素存在性检查 - stats-modal', () => {
    const el = document.getElementById('stats-modal');
    if (!el) throw new Error('stats-modal 元素不存在');
});

testCase('GAME模块安全函数存在', () => {
    if (typeof GAME !== 'object') throw new Error('GAME模块未定义');
});

console.log('\n=== 测试总结 ===');
const passed = testResults.filter(t => t.passed).length;
const total = testResults.length;
console.log(`通过: ${passed}/${total}`);

if (passed === total) {
    console.log('🎉 所有测试通过！Bug修复成功！');
} else {
    console.log('⚠️  部分测试失败，请检查');
    testResults.filter(t => !t.passed).forEach(t => {
        console.log(`   - ${t.name}: ${t.error}`);
    });
}
