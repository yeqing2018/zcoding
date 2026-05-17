const calculator = {
    currentExpression: '',
    lastExpression: '',
    lastResult: null,
    variables: {},
    customFunctions: {},
    customRules: {},
    history: [],
    historyStack: [],
    historyRedoStack: [],
    decimalPlaces: 6,
    fontSize: 16,
    btnSize: 16,
    btnRadius: 10,
    theme: 'light',
    angleUnit: 'rad',
    bgImage: null,
    bgColor: null,
    bgOpacity: 100,
    textColor: null,
    customShortcuts: {
        undo: 'Ctrl+Z',
        repeat: 'F5'
    },
    selectedHistoryItems: new Set(),
    
    exchangeRates: {
        CNY: 1,
        USD: 0.138,
        EUR: 0.128,
        JPY: 21.5,
        GBP: 0.109,
        HKD: 1.07,
        AUD: 0.215,
        CAD: 0.19
    },
    
    presetSkins: {
        minimal: {
            bgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            textColor: '#2c3e50',
            containerBg: 'rgba(255, 255, 255, 0.98)',
            btnRadius: 8
        },
        business: {
            bgGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            textColor: '#ecf0f1',
            containerBg: 'rgba(30, 40, 60, 0.95)',
            btnRadius: 4
        },
        retro: {
            bgGradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
            textColor: '#2c3e50',
            containerBg: 'rgba(255, 248, 220, 0.95)',
            btnRadius: 20
        },
        cool: {
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textColor: '#ffffff',
            containerBg: 'rgba(255, 255, 255, 0.1)',
            btnRadius: 12
        },
        nature: {
            bgGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            textColor: '#ffffff',
            containerBg: 'rgba(255, 255, 255, 0.95)',
            btnRadius: 10
        }
    }
};

function appendInput(value) {
    clearError();
    saveToHistoryStack();
    calculator.currentExpression += value;
    updateDisplay();
}

function appendFunction(func) {
    clearError();
    saveToHistoryStack();
    calculator.currentExpression += func + '(';
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('expressionDisplay').textContent = formatExpression(calculator.currentExpression);
    try {
        if (calculator.currentExpression && !calculator.currentExpression.endsWith('=')) {
            const preview = evaluateExpression(calculator.currentExpression, true);
            if (preview !== null && !isNaN(preview) && isFinite(preview)) {
                document.getElementById('resultDisplay').textContent = formatNumber(preview);
            }
        }
    } catch (e) {
    }
}

function formatExpression(expr) {
    return expr
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−')
        .replace(/\^/g, '^');
}

function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
    
    const rounded = Number(num.toFixed(calculator.decimalPlaces));
    return rounded.toString();
}

function clearError() {
    document.getElementById('errorDisplay').textContent = '';
}

function showError(message, suggestion = '') {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.innerHTML = `<strong>错误:</strong> ${message}${suggestion ? `<br><em>建议:</em> ${suggestion}` : ''}`;
}

function tokenize(expr) {
    const tokens = [];
    let i = 0;
    
    while (i < expr.length) {
        const char = expr[i];
        
        if (/\s/.test(char)) {
            i++;
            continue;
        }
        
        if (/\d/.test(char) || char === '.') {
            let num = '';
            while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
                num += expr[i];
                i++;
            }
            if (num === '.') {
                throw new Error('无效的小数点');
            }
            if ((num.match(/\./g) || []).length > 1) {
                throw new Error('数字包含多个小数点');
            }
            tokens.push({ type: 'number', value: parseFloat(num) });
            continue;
        }
        
        if (/[a-zA-Z_π]/.test(char)) {
            let name = '';
            while (i < expr.length && /[a-zA-Z0-9_π]/.test(expr[i])) {
                name += expr[i];
                i++;
            }
            if (name.toLowerCase() === 'pi' || name === 'π') {
                tokens.push({ type: 'number', value: Math.PI });
                continue;
            }
            if (name.toLowerCase() === 'e') {
                tokens.push({ type: 'number', value: Math.E });
                continue;
            }
            tokens.push({ type: 'identifier', value: name });
            continue;
        }
        
        if ('+-*/^%(),'.includes(char)) {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
        }
        
        if (char === '=') {
            tokens.push({ type: 'operator', value: '=' });
            i++;
            continue;
        }
        
        if (char === '!') {
            tokens.push({ type: 'operator', value: '!' });
            i++;
            continue;
        }
        
        throw new Error(`无法识别的字符: "${char}"`);
    }
    
    return tokens;
}

function parse(tokens) {
    let pos = 0;
    
    function peek() {
        return tokens[pos];
    }
    
    function consume() {
        return tokens[pos++];
    }
    
    function expect(type, value = null) {
        const token = peek();
        if (!token || token.type !== type || (value !== null && token.value !== value)) {
            const expected = value ? `${type} "${value}"` : type;
            const got = token ? `${token.type} "${token.value}"` : 'end of input';
            throw new Error(`期望 ${expected}, 但得到 ${got}`);
        }
        return consume();
    }
    
    function parseAssignment() {
        const startPos = pos;
        const token = peek();
        
        if (token && token.type === 'identifier') {
            const nextToken = tokens[pos + 1];
            if (nextToken && nextToken.type === 'operator' && nextToken.value === '=') {
                consume();
                consume();
                const value = parseExpression();
                return { type: 'assignment', name: token.value, value: value };
            }
        }
        
        pos = startPos;
        return parseExpression();
    }
    
    function parseExpression() {
        let left = parseTerm();
        
        while (peek() && peek().type === 'operator' && (peek().value === '+' || peek().value === '-')) {
            const op = consume().value;
            const right = parseTerm();
            left = { type: 'binary', op: op, left: left, right: right };
        }
        
        return left;
    }
    
    function parseTerm() {
        let left = parseFactor();
        
        while (peek() && peek().type === 'operator' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
            const op = consume().value;
            const right = parseFactor();
            left = { type: 'binary', op: op, left: left, right: right };
        }
        
        return left;
    }
    
    function parseFactor() {
        let left = parseUnary();
        
        while (peek() && peek().type === 'operator' && peek().value === '^') {
            const op = consume().value;
            const right = parseFactor();
            left = { type: 'binary', op: op, left: left, right: right };
        }
        
        return left;
    }
    
    function parseUnary() {
        if (peek() && peek().type === 'operator' && (peek().value === '+' || peek().value === '-')) {
            const op = consume().value;
            const operand = parseUnary();
            return { type: 'unary', op: op, operand: operand };
        }
        return parsePostfix();
    }
    
    function parsePostfix() {
        let left = parsePrimary();
        
        while (peek() && peek().type === 'operator' && peek().value === '!') {
            consume();
            left = { type: 'postfix', op: '!', operand: left };
        }
        
        return left;
    }
    
    function parsePrimary() {
        const token = peek();
        
        if (!token) {
            throw new Error('表达式不完整');
        }
        
        if (token.type === 'number') {
            consume();
            return { type: 'number', value: token.value };
        }
        
        if (token.type === 'identifier') {
            consume();
            if (peek() && peek().type === 'operator' && peek().value === '(') {
                consume();
                const args = [];
                if (peek() && peek().type !== 'operator' && peek().value !== ')') {
                    args.push(parseExpression());
                    while (peek() && peek().type === 'operator' && peek().value === ',') {
                        consume();
                        args.push(parseExpression());
                    }
                }
                expect('operator', ')');
                return { type: 'function', name: token.value, arguments: args };
            }
            return { type: 'variable', name: token.value };
        }
        
        if (token.type === 'operator' && token.value === '(') {
            consume();
            const expr = parseExpression();
            expect('operator', ')');
            return expr;
        }
        
        throw new Error(`意外的标记: "${token.value}"`);
    }
    
    const ast = parseAssignment();
    
    if (pos < tokens.length) {
        throw new Error(`表达式中存在多余内容: "${tokens.slice(pos).map(t => t.value).join('')}"`);
    }
    
    return ast;
}

function factorial(n) {
    if (n < 0) throw new Error('阶乘的参数不能为负数');
    if (!Number.isInteger(n)) throw new Error('阶乘的参数必须是整数');
    if (n > 170) throw new Error('阶乘数值过大');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function evaluate(ast, preview = false) {
    switch (ast.type) {
        case 'number':
            return ast.value;
            
        case 'variable':
            if (calculator.variables.hasOwnProperty(ast.name)) {
                return calculator.variables[ast.name];
            }
            if (calculator.customFunctions.hasOwnProperty(ast.name)) {
                throw new Error(`"${ast.name}" 是一个函数，需要使用括号调用`);
            }
            throw new Error(`变量 "${ast.name}" 未定义`);
            
        case 'unary':
            const val = evaluate(ast.operand, preview);
            return ast.op === '-' ? -val : val;
            
        case 'postfix':
            const postVal = evaluate(ast.operand, preview);
            if (ast.op === '!') {
                return factorial(postVal);
            }
            throw new Error(`未知后缀运算符: ${ast.op}`);
            
        case 'binary':
            const left = evaluate(ast.left, preview);
            const right = evaluate(ast.right, preview);
            
            switch (ast.op) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/':
                    if (right === 0) {
                        throw new Error('除数不能为零');
                    }
                    return left / right;
                case '%':
                    if (right === 0) {
                        throw new Error('取余运算中除数不能为零');
                    }
                    return left % right;
                case '^': return Math.pow(left, right);
                default: throw new Error(`未知运算符: ${ast.op}`);
            }
            
        case 'function':
            const funcName = ast.name.toLowerCase();
            const args = ast.arguments.map(arg => evaluate(arg, preview));
            
            if (calculator.customFunctions.hasOwnProperty(funcName)) {
                const customFunc = calculator.customFunctions[funcName];
                const tempVars = {};
                customFunc.params.forEach((param, idx) => {
                    tempVars[param] = args[idx] || 0;
                });
                const originalVars = { ...calculator.variables };
                Object.assign(calculator.variables, tempVars);
                try {
                    const result = evaluateExpression(customFunc.expression);
                    calculator.variables = originalVars;
                    return result;
                } catch (e) {
                    calculator.variables = originalVars;
                    throw new Error(`自定义函数 "${funcName}" 执行错误: ${e.message}`);
                }
            }
            
            if (calculator.customRules.hasOwnProperty(funcName)) {
                try {
                    const ruleFunc = new Function('a', 'b', 'c', 'd', calculator.customRules[funcName]);
                    return ruleFunc(args[0], args[1], args[2], args[3]);
                } catch (e) {
                    throw new Error(`自定义规则 "${funcName}" 执行错误: ${e.message}`);
                }
            }
            
            switch (funcName) {
                case 'sqrt':
                    if (args[0] < 0) {
                        throw new Error('平方根的参数不能为负数');
                    }
                    return Math.sqrt(args[0]);
                case 'abs':
                    return Math.abs(args[0]);
                case 'sin':
                    return calculator.angleUnit === 'deg' ? Math.sin(args[0] * Math.PI / 180) : Math.sin(args[0]);
                case 'cos':
                    return calculator.angleUnit === 'deg' ? Math.cos(args[0] * Math.PI / 180) : Math.cos(args[0]);
                case 'tan':
                    return calculator.angleUnit === 'deg' ? Math.tan(args[0] * Math.PI / 180) : Math.tan(args[0]);
                case 'asin':
                    const asinVal = Math.asin(args[0]);
                    return calculator.angleUnit === 'deg' ? asinVal * 180 / Math.PI : asinVal;
                case 'acos':
                    const acosVal = Math.acos(args[0]);
                    return calculator.angleUnit === 'deg' ? acosVal * 180 / Math.PI : acosVal;
                case 'atan':
                    const atanVal = Math.atan(args[0]);
                    return calculator.angleUnit === 'deg' ? atanVal * 180 / Math.PI : atanVal;
                case 'sinh':
                    return Math.sinh(args[0]);
                case 'cosh':
                    return Math.cosh(args[0]);
                case 'tanh':
                    return Math.tanh(args[0]);
                case 'log':
                    if (args[0] <= 0) {
                        throw new Error('对数的参数必须大于零');
                    }
                    return Math.log(args[0]);
                case 'log10':
                    if (args[0] <= 0) {
                        throw new Error('对数的参数必须大于零');
                    }
                    return Math.log10(args[0]);
                case 'log2':
                    if (args[0] <= 0) {
                        throw new Error('对数的参数必须大于零');
                    }
                    return Math.log2(args[0]);
                case 'exp':
                    return Math.exp(args[0]);
                case 'pow':
                    return Math.pow(args[0], args[1] || 2);
                case 'floor':
                    return Math.floor(args[0]);
                case 'ceil':
                    return Math.ceil(args[0]);
                case 'round':
                    return Math.round(args[0]);
                case 'min':
                    return Math.min(...args);
                case 'max':
                    return Math.max(...args);
                case 'sign':
                    return Math.sign(args[0]);
                case 'cbrt':
                    return Math.cbrt(args[0]);
                case 'hypot':
                    return Math.hypot(...args);
                case 'deg':
                    return args[0] * 180 / Math.PI;
                case 'rad':
                    return args[0] * Math.PI / 180;
                default:
                    throw new Error(`未知函数: ${ast.name}`);
            }
            
        case 'assignment':
            if (preview) {
                return evaluate(ast.value, preview);
            }
            const value = evaluate(ast.value, preview);
            if (calculator.customFunctions.hasOwnProperty(ast.name)) {
                throw new Error(`"${ast.name}" 已被定义为函数，不能用作变量名`);
            }
            calculator.variables[ast.name] = value;
            updateVariablesDisplay();
            saveToLocalStorage();
            return value;
            
        default:
            throw new Error(`未知节点类型: ${ast.type}`);
    }
}

function evaluateExpression(expr, preview = false) {
    if (!expr || expr.trim() === '') {
        return null;
    }
    
    if (expr.includes('%')) {
        expr = expr.replace(/(\d+\.?\d*)%/g, '($1/100)');
        expr = expr.replace(/%(\d+\.?\d*)/g, '*(($1)/100)');
    }
    
    const tokens = tokenize(expr);
    const ast = parse(tokens);
    return evaluate(ast, preview);
}

function calculate() {
    clearError();
    
    if (!calculator.currentExpression || calculator.currentExpression.trim() === '') {
        showError('请输入要计算的表达式');
        return;
    }
    
    try {
        const result = evaluateExpression(calculator.currentExpression);
        
        if (result !== null && !isNaN(result)) {
            calculator.lastExpression = calculator.currentExpression;
            calculator.lastResult = result;
            
            addToHistory(calculator.currentExpression, result);
            
            document.getElementById('resultDisplay').textContent = formatNumber(result);
            document.getElementById('expressionDisplay').textContent = formatExpression(calculator.currentExpression) + ' =';
            
            calculator.historyRedoStack = [];
        }
    } catch (e) {
        const suggestion = getErrorSuggestion(e.message, calculator.currentExpression);
        showError(e.message, suggestion);
    }
}

function getErrorSuggestion(errorMsg, expression) {
    if (errorMsg.includes('除数不能为零')) {
        return '请检查分母是否为0，例如将 "5/0" 改为 "5/2"';
    }
    if (errorMsg.includes('平方根') && errorMsg.includes('负数')) {
        return '平方根函数的参数必须是非负数，例如将 "sqrt(-4)" 改为 "sqrt(4)"';
    }
    if (errorMsg.includes('阶乘') && errorMsg.includes('负数')) {
        return '阶乘的参数必须是非负整数，例如将 "(-3)!" 改为 "3!"';
    }
    if (errorMsg.includes('阶乘') && errorMsg.includes('整数')) {
        return '阶乘的参数必须是整数，例如将 "3.5!" 改为 "3!"';
    }
    if (errorMsg.includes('对数') && errorMsg.includes('大于零')) {
        return '对数函数的参数必须大于0，例如将 "log(-1)" 改为 "log(10)"';
    }
    if (errorMsg.includes('变量') && errorMsg.includes('未定义')) {
        const match = errorMsg.match(/"([^"]+)"/);
        if (match) {
            return `请先定义变量 "${match[1]}"，例如输入 "${match[1]}=10"`;
        }
    }
    if (errorMsg.includes('无法识别的字符')) {
        return '请只输入数字、运算符(+-*/^%!)、括号和函数名';
    }
    if (errorMsg.includes('表达式不完整')) {
        return '表达式似乎不完整，请检查括号是否匹配或运算符是否完整';
    }
    if (errorMsg.includes('多余内容')) {
        return '表达式中可能有多余的字符，请检查语法';
    }
    if (errorMsg.includes('未知函数')) {
        return '支持的函数有: sqrt, abs, sin, cos, tan, asin, acos, atan, log, log10, exp, pow, floor, ceil, round, min, max 等';
    }
    if (errorMsg.includes('多个小数点')) {
        return '一个数字只能包含一个小数点';
    }
    if (expression.includes('×') || expression.includes('÷') || expression.includes('−')) {
        return '请使用标准运算符: * (乘), / (除), - (减)';
    }
    return '请检查表达式语法是否正确，或参考内置函数列表';
}

function toggleSign() {
    clearError();
    saveToHistoryStack();
    const expr = calculator.currentExpression;
    if (expr.length === 0) return;
    
    let endIndex = expr.length;
    let startIndex = endIndex;
    
    while (startIndex > 0 && /[0-9.]/.test(expr[startIndex - 1])) {
        startIndex--;
    }
    
    if (startIndex === endIndex) return;
    
    const numberStr = expr.substring(startIndex, endIndex);
    if (!/\d/.test(numberStr)) return;
    
    let hasNegSign = false;
    let negSignIndex = -1;
    
    if (startIndex > 0 && expr[startIndex - 1] === '-') {
        if (startIndex === 1) {
            hasNegSign = true;
            negSignIndex = startIndex - 1;
        } else {
            const prevChar = expr[startIndex - 2];
            if ('+-*/^%('.includes(prevChar)) {
                hasNegSign = true;
                negSignIndex = startIndex - 1;
            }
        }
    }
    
    if (hasNegSign) {
        calculator.currentExpression = expr.substring(0, negSignIndex) + numberStr + expr.substring(endIndex);
    } else {
        calculator.currentExpression = expr.substring(0, startIndex) + '-' + numberStr + expr.substring(endIndex);
    }
    
    updateDisplay();
}

function saveToHistoryStack() {
    calculator.historyStack.push(calculator.currentExpression);
    if (calculator.historyStack.length > 50) {
        calculator.historyStack.shift();
    }
}

function undoInput() {
    clearError();
    if (calculator.historyStack.length > 0) {
        calculator.historyRedoStack.push(calculator.currentExpression);
        calculator.currentExpression = calculator.historyStack.pop();
        updateDisplay();
    } else if (calculator.currentExpression.length > 0) {
        calculator.currentExpression = calculator.currentExpression.slice(0, -1);
        updateDisplay();
    }
}

function redoInput() {
    clearError();
    if (calculator.historyRedoStack.length > 0) {
        calculator.historyStack.push(calculator.currentExpression);
        calculator.currentExpression = calculator.historyRedoStack.pop();
        updateDisplay();
    }
}

function repeatLast() {
    clearError();
    if (calculator.lastExpression) {
        saveToHistoryStack();
        calculator.currentExpression = calculator.lastExpression;
        updateDisplay();
        calculate();
    } else {
        showError('没有可重复的计算');
    }
}

function clearAll() {
    clearError();
    saveToHistoryStack();
    calculator.currentExpression = '';
    document.getElementById('expressionDisplay').textContent = '';
    document.getElementById('resultDisplay').textContent = '0';
}

function addToHistory(expression, result) {
    const historyItem = {
        id: Date.now(),
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString()
    };
    calculator.history.unshift(historyItem);
    updateHistoryDisplay();
    saveToLocalStorage();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (calculator.history.length === 0) {
        historyList.innerHTML = '<div class="empty-hint">暂无计算记录</div>';
        return;
    }
    
    historyList.innerHTML = calculator.history.map((item) => `
        <div class="history-item" data-id="${item.id}">
            <input type="checkbox" ${calculator.selectedHistoryItems.has(item.id) ? 'checked' : ''} 
                   onchange="toggleHistorySelection(${item.id}, event)" onclick="event.stopPropagation()">
            <div style="flex: 1; cursor: pointer;" onclick="loadHistoryById(${item.id})">
                <div class="history-expr">${formatExpression(item.expression)}</div>
                <div style="font-size: 0.75em; opacity: 0.5;">${item.timestamp}</div>
            </div>
            <div class="history-result">= ${formatNumber(item.result)}</div>
            <button class="delete-history-btn" onclick="deleteHistoryItem(${item.id}, event)">×</button>
        </div>
    `).join('');
}

function loadHistoryById(id) {
    const item = calculator.history.find(h => h.id === id);
    if (item) {
        saveToHistoryStack();
        calculator.currentExpression = item.expression;
        updateDisplay();
    }
}

function toggleHistorySelection(id, event) {
    event.stopPropagation();
    if (calculator.selectedHistoryItems.has(id)) {
        calculator.selectedHistoryItems.delete(id);
    } else {
        calculator.selectedHistoryItems.add(id);
    }
}

function toggleSelectAllHistory() {
    const selectAll = document.getElementById('selectAllHistory').checked;
    if (selectAll) {
        calculator.history.forEach(item => calculator.selectedHistoryItems.add(item.id));
    } else {
        calculator.selectedHistoryItems.clear();
    }
    updateHistoryDisplay();
}

function deleteHistoryItem(id, event) {
    event.stopPropagation();
    calculator.history = calculator.history.filter(h => h.id !== id);
    calculator.selectedHistoryItems.delete(id);
    updateHistoryDisplay();
    saveToLocalStorage();
}

function deleteSelectedHistory() {
    if (calculator.selectedHistoryItems.size === 0) {
        showError('请先选择要删除的记录');
        return;
    }
    calculator.history = calculator.history.filter(h => !calculator.selectedHistoryItems.has(h.id));
    calculator.selectedHistoryItems.clear();
    document.getElementById('selectAllHistory').checked = false;
    updateHistoryDisplay();
    saveToLocalStorage();
}

function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
        calculator.history = [];
        calculator.selectedHistoryItems.clear();
        updateHistoryDisplay();
        saveToLocalStorage();
    }
}

function repeatAllHistory() {
    if (calculator.history.length === 0) {
        showError('暂无历史记录');
        return;
    }
    const results = [];
    calculator.history.forEach(item => {
        try {
            const result = evaluateExpression(item.expression);
            results.push({ expr: item.expression, oldResult: item.result, newResult: result });
        } catch (e) {
        }
    });
    alert(`已重新计算 ${results.length} 条记录`);
}

function exportHistory() {
    if (calculator.history.length === 0) {
        showError('暂无历史记录可导出');
        return;
    }
    
    let content = '=== 计算历史记录 ===\n\n';
    calculator.history.forEach((item, index) => {
        content += `${index + 1}. [${item.timestamp}]\n`;
        content += `   表达式: ${item.expression}\n`;
        content += `   结果: ${formatNumber(item.result)}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator_history_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function updateVariablesDisplay() {
    const variablesList = document.getElementById('variablesList');
    const varNames = Object.keys(calculator.variables);
    
    if (varNames.length === 0) {
        variablesList.innerHTML = '<div class="empty-hint">暂无变量，使用形如 a=10 进行赋值</div>';
        return;
    }
    
    variablesList.innerHTML = varNames.map(name => `
        <div class="variable-item" onclick="loadVariable('${name}')">
            <span class="variable-name">${name}</span>
            <span class="variable-value">= ${formatNumber(calculator.variables[name])}</span>
        </div>
    `).join('');
}

function loadVariable(name) {
    saveToHistoryStack();
    calculator.currentExpression += name;
    updateDisplay();
}

function executeBatch() {
    clearError();
    const batchInput = document.getElementById('batchInput');
    const lines = batchInput.value.trim().split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
        showError('请输入至少一个表达式');
        return;
    }
    
    let results = [];
    let hasError = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        try {
            const result = evaluateExpression(line);
            if (result !== null && !isNaN(result)) {
                results.push({ expr: line, result: result });
                addToHistory(line, result);
            }
        } catch (e) {
            showError(`第 ${i + 1} 行: ${e.message}`, getErrorSuggestion(e.message, line));
            hasError = true;
            break;
        }
    }
    
    if (!hasError && results.length > 0) {
        const lastResult = results[results.length - 1];
        calculator.lastExpression = lastResult.expr;
        calculator.lastResult = lastResult.result;
        calculator.currentExpression = lastResult.expr;
        document.getElementById('resultDisplay').textContent = formatNumber(lastResult.result);
        document.getElementById('expressionDisplay').textContent = formatExpression(lastResult.expr) + ' =';
    }
}

function importFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('batchInput').value = content;
    };
    reader.readAsText(file);
    event.target.value = '';
}

function switchTab(tabName) {
    const tabs = ['variables', 'history', 'currency', 'shortcuts'];
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach((btn, index) => {
        btn.classList.toggle('active', tabs[index] === tabName);
    });
    
    tabContents.forEach((content, index) => {
        content.classList.toggle('hidden', tabs[index] !== tabName);
    });
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const overlay = document.getElementById('panelOverlay');
    
    const isHidden = panel.classList.contains('hidden');
    closeAllPanels();
    
    if (isHidden) {
        panel.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

function closeAllPanels() {
    document.querySelectorAll('.side-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    document.getElementById('panelOverlay').classList.add('hidden');
}

function applyPresetSkin(skinName) {
    const skin = calculator.presetSkins[skinName];
    if (!skin) return;
    
    calculator.theme = skinName;
    document.body.className = 'theme-' + skinName;
    
    document.body.style.background = skin.bgGradient;
    document.body.style.color = skin.textColor;
    
    document.getElementById('calcContainer').style.background = skin.containerBg;
    changeBtnRadius(skin.btnRadius);
    document.getElementById('btnRadiusSlider').value = skin.btnRadius;
    document.getElementById('btnRadiusValue').textContent = skin.btnRadius + 'px';
    
    calculator.bgImage = null;
    calculator.bgColor = null;
    calculator.textColor = skin.textColor;
    
    saveToLocalStorage();
}

function uploadBackground(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        calculator.bgImage = e.target.result;
        applyBackground();
        saveToLocalStorage();
    };
    reader.readAsDataURL(file);
}

function changeBgColor(color) {
    calculator.bgColor = color;
    calculator.bgImage = null;
    applyBackground();
    saveToLocalStorage();
}

function changeBgOpacity(opacity) {
    calculator.bgOpacity = parseInt(opacity);
    applyBackground();
    saveToLocalStorage();
}

function applyBackground() {
    const body = document.body;
    const customBg = document.getElementById('customBg');
    const opacity = calculator.bgOpacity / 100;
    
    if (calculator.bgImage) {
        customBg.style.backgroundImage = `url(${calculator.bgImage})`;
        customBg.style.backgroundSize = 'cover';
        customBg.style.backgroundPosition = 'center';
        customBg.style.opacity = opacity;
        body.style.background = 'none';
    } else if (calculator.bgColor) {
        customBg.style.backgroundImage = 'none';
        customBg.style.backgroundColor = calculator.bgColor;
        customBg.style.opacity = opacity;
        body.style.background = 'none';
    }
}

function changeTextColor(color) {
    calculator.textColor = color;
    document.body.style.color = color;
    saveToLocalStorage();
}

function changeFontSize(size) {
    calculator.fontSize = parseInt(size);
    document.getElementById('fontSizeValue').textContent = size + 'px';
    document.getElementById('calcContainer').style.fontSize = size + 'px';
    saveToLocalStorage();
}

function changeBtnSize(size) {
    calculator.btnSize = parseInt(size);
    document.getElementById('btnSizeValue').textContent = size + 'px';
    document.querySelectorAll('.btn').forEach(btn => {
        btn.style.padding = (size * 0.9) + 'px';
        btn.style.fontSize = (size * 0.7) + 'px';
    });
    saveToLocalStorage();
}

function changeBtnRadius(radius) {
    calculator.btnRadius = parseInt(radius);
    document.getElementById('btnRadiusValue').textContent = radius + 'px';
    document.querySelectorAll('.btn').forEach(btn => {
        btn.style.borderRadius = radius + 'px';
    });
    saveToLocalStorage();
}

function changeDecimalPlaces(places) {
    calculator.decimalPlaces = parseInt(places);
    saveToLocalStorage();
    
    if (calculator.lastResult !== null) {
        document.getElementById('resultDisplay').textContent = formatNumber(calculator.lastResult);
    }
    updateHistoryDisplay();
}

function changeAngleUnit(unit) {
    calculator.angleUnit = unit;
    saveToLocalStorage();
}

function saveCustomSkin() {
    const skinData = {
        bgImage: calculator.bgImage,
        bgColor: calculator.bgColor,
        bgOpacity: calculator.bgOpacity,
        textColor: calculator.textColor,
        fontSize: calculator.fontSize,
        btnSize: calculator.btnSize,
        btnRadius: calculator.btnRadius,
        theme: calculator.theme
    };
    localStorage.setItem('customCalculatorSkin', JSON.stringify(skinData));
    alert('自定义皮肤已保存！');
}

function loadCustomSkin() {
    try {
        const saved = localStorage.getItem('customCalculatorSkin');
        if (saved) {
            const skin = JSON.parse(saved);
            if (skin.bgImage) {
                calculator.bgImage = skin.bgImage;
                applyBackground();
            }
            if (skin.bgColor) {
                calculator.bgColor = skin.bgColor;
                applyBackground();
            }
            if (skin.bgOpacity) {
                calculator.bgOpacity = skin.bgOpacity;
                document.getElementById('bgOpacity').value = skin.bgOpacity;
            }
            if (skin.textColor) {
                calculator.textColor = skin.textColor;
                document.body.style.color = skin.textColor;
                document.getElementById('textColorPicker').value = skin.textColor;
            }
            if (skin.fontSize) {
                calculator.fontSize = skin.fontSize;
                document.getElementById('fontSizeSlider').value = skin.fontSize;
                document.getElementById('fontSizeValue').textContent = skin.fontSize + 'px';
                document.getElementById('calcContainer').style.fontSize = skin.fontSize + 'px';
            }
            if (skin.btnSize) {
                changeBtnSize(skin.btnSize);
                document.getElementById('btnSizeSlider').value = skin.btnSize;
            }
            if (skin.btnRadius) {
                changeBtnRadius(skin.btnRadius);
                document.getElementById('btnRadiusSlider').value = skin.btnRadius;
            }
            if (skin.theme) {
                calculator.theme = skin.theme;
                document.body.className = 'theme-' + skin.theme;
            }
        }
    } catch (e) {
    }
}

function resetToDefault() {
    if (confirm('确定要恢复默认设置吗？这将清除所有自定义设置。')) {
        calculator.bgImage = null;
        calculator.bgColor = null;
        calculator.bgOpacity = 100;
        calculator.textColor = null;
        calculator.fontSize = 16;
        calculator.btnSize = 16;
        calculator.btnRadius = 10;
        calculator.theme = 'light';
        calculator.angleUnit = 'rad';
        calculator.decimalPlaces = 6;
        
        document.getElementById('customBg').style.backgroundImage = 'none';
        document.getElementById('customBg').style.backgroundColor = 'transparent';
        document.body.style.background = '';
        document.body.style.color = '';
        document.body.className = 'theme-light';
        
        document.getElementById('fontSizeSlider').value = 16;
        document.getElementById('fontSizeValue').textContent = '16px';
        document.getElementById('calcContainer').style.fontSize = '16px';
        
        document.getElementById('btnSizeSlider').value = 16;
        document.getElementById('btnSizeValue').textContent = '16px';
        document.getElementById('btnRadiusSlider').value = 10;
        document.getElementById('btnRadiusValue').textContent = '10px';
        document.getElementById('decimalPlaces').value = 6;
        document.getElementById('angleUnit').value = 'rad';
        document.getElementById('bgOpacity').value = 100;
        
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.padding = '';
            btn.style.fontSize = '';
            btn.style.borderRadius = '';
        });
        
        localStorage.removeItem('customCalculatorSkin');
        saveToLocalStorage();
    }
}

function addCustomFunction() {
    const name = document.getElementById('funcName').value.trim().toLowerCase();
    const params = document.getElementById('funcParams').value.trim();
    const expr = document.getElementById('funcExpr').value.trim();
    
    if (!name) {
        showError('请输入函数名');
        return;
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        showError('函数名只能包含字母、数字和下划线，且不能以数字开头');
        return;
    }
    if (!params) {
        showError('请输入参数列表');
        return;
    }
    if (!expr) {
        showError('请输入函数表达式');
        return;
    }
    
    const paramList = params.split(',').map(p => p.trim()).filter(p => p);
    if (paramList.some(p => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(p))) {
        showError('参数名格式不正确');
        return;
    }
    
    calculator.customFunctions[name] = {
        params: paramList,
        expression: expr
    };
    
    updateCustomFunctionsDisplay();
    saveToLocalStorage();
    
    document.getElementById('funcName').value = '';
    document.getElementById('funcParams').value = '';
    document.getElementById('funcExpr').value = '';
    
    setTimeout(() => { clearError(); }, 1000);
    alert(`函数 "${name}(${params}) = ${expr}" 已添加！`);
}

function updateCustomFunctionsDisplay() {
    const list = document.getElementById('customFunctionsList');
    const funcNames = Object.keys(calculator.customFunctions);
    
    if (funcNames.length === 0) {
        list.innerHTML = '<div class="empty-hint">暂无自定义函数</div>';
        return;
    }
    
    list.innerHTML = funcNames.map(name => {
        const func = calculator.customFunctions[name];
        return `
            <div class="custom-function-item">
                <code>${name}(${func.params.join(', ')}) = ${func.expression}</code>
                <button class="delete-func-btn" onclick="deleteCustomFunction('${name}')">×</button>
            </div>
        `;
    }).join('');
}

function deleteCustomFunction(name) {
    if (confirm(`确定要删除函数 "${name}" 吗？`)) {
        delete calculator.customFunctions[name];
        updateCustomFunctionsDisplay();
        saveToLocalStorage();
    }
}

function addCustomRule() {
    const name = document.getElementById('ruleName').value.trim();
    const code = document.getElementById('ruleCode').value.trim();
    
    if (!name) {
        showError('请输入规则名称');
        return;
    }
    if (!code) {
        showError('请输入规则代码');
        return;
    }
    
    try {
        new Function('a', 'b', 'c', 'd', code);
    } catch (e) {
        showError('规则代码语法错误: ' + e.message);
        return;
    }
    
    calculator.customRules[name] = code;
    saveToLocalStorage();
    
    document.getElementById('ruleName').value = '';
    document.getElementById('ruleCode').value = '';
    
    alert(`规则 "${name}" 已添加！`);
}

function saveCustomShortcut(action, shortcut) {
    if (shortcut) {
        calculator.customShortcuts[action] = shortcut;
        saveToLocalStorage();
    }
}

function parseShortcut(shortcutStr) {
    const parts = shortcutStr.toLowerCase().split('+').map(s => s.trim());
    const modifiers = {
        ctrl: parts.includes('ctrl') || parts.includes('control'),
        alt: parts.includes('alt') || parts.includes('option'),
        shift: parts.includes('shift'),
        meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command')
    };
    const key = parts.find(p => !['ctrl', 'control', 'alt', 'option', 'shift', 'meta', 'cmd', 'command'].includes(p));
    return { ...modifiers, key: key || '' };
}

function matchShortcut(event, shortcutStr) {
    if (!shortcutStr) return false;
    const shortcut = parseShortcut(shortcutStr);
    
    if (shortcut.ctrl && !event.ctrlKey) return false;
    if (shortcut.alt && !event.altKey) return false;
    if (shortcut.shift && !event.shiftKey) return false;
    if (shortcut.meta && !event.metaKey) return false;
    
    if (shortcut.key.length === 1) {
        return event.key.toLowerCase() === shortcut.key;
    }
    return event.key === shortcut.key || event.code.toLowerCase() === shortcut.key.toLowerCase();
}

function saveToLocalStorage() {
    try {
        const data = {
            variables: calculator.variables,
            customFunctions: calculator.customFunctions,
            customRules: calculator.customRules,
            history: calculator.history,
            decimalPlaces: calculator.decimalPlaces,
            fontSize: calculator.fontSize,
            btnSize: calculator.btnSize,
            btnRadius: calculator.btnRadius,
            theme: calculator.theme,
            angleUnit: calculator.angleUnit,
            bgImage: calculator.bgImage,
            bgColor: calculator.bgColor,
            bgOpacity: calculator.bgOpacity,
            textColor: calculator.textColor,
            customShortcuts: calculator.customShortcuts
        };
        localStorage.setItem('calculatorData', JSON.stringify(data));
    } catch (e) {
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('calculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            
            if (data.variables) calculator.variables = data.variables;
            if (data.customFunctions) calculator.customFunctions = data.customFunctions;
            if (data.customRules) calculator.customRules = data.customRules;
            if (data.history) calculator.history = data.history;
            if (data.decimalPlaces) calculator.decimalPlaces = data.decimalPlaces;
            if (data.fontSize) calculator.fontSize = data.fontSize;
            if (data.btnSize) calculator.btnSize = data.btnSize;
            if (data.btnRadius) calculator.btnRadius = data.btnRadius;
            if (data.theme) calculator.theme = data.theme;
            if (data.angleUnit) calculator.angleUnit = data.angleUnit;
            if (data.bgImage) calculator.bgImage = data.bgImage;
            if (data.bgColor) calculator.bgColor = data.bgColor;
            if (data.bgOpacity) calculator.bgOpacity = data.bgOpacity;
            if (data.textColor) calculator.textColor = data.textColor;
            if (data.customShortcuts) calculator.customShortcuts = data.customShortcuts;
            
            document.getElementById('decimalPlaces').value = calculator.decimalPlaces;
            document.getElementById('fontSizeSlider').value = calculator.fontSize;
            document.getElementById('fontSizeValue').textContent = calculator.fontSize + 'px';
            document.getElementById('calcContainer').style.fontSize = calculator.fontSize + 'px';
            document.getElementById('btnSizeSlider').value = calculator.btnSize;
            document.getElementById('btnSizeValue').textContent = calculator.btnSize + 'px';
            document.getElementById('btnRadiusSlider').value = calculator.btnRadius;
            document.getElementById('btnRadiusValue').textContent = calculator.btnRadius + 'px';
            document.getElementById('angleUnit').value = calculator.angleUnit;
            document.getElementById('bgOpacity').value = calculator.bgOpacity;
            
            if (calculator.textColor) {
                document.getElementById('textColorPicker').value = calculator.textColor;
            }
            if (calculator.bgColor) {
                document.getElementById('bgColorPicker').value = calculator.bgColor;
            }
            
            document.body.className = 'theme-' + calculator.theme;
            
            applyBackground();
            
            if (calculator.textColor) {
                document.body.style.color = calculator.textColor;
            }
            
            if (calculator.btnSize !== 16) {
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.style.padding = (calculator.btnSize * 0.9) + 'px';
                    btn.style.fontSize = (calculator.btnSize * 0.7) + 'px';
                });
            }
            if (calculator.btnRadius !== 10) {
                document.querySelectorAll('.btn').forEach(btn => {
                    btn.style.borderRadius = calculator.btnRadius + 'px';
                });
            }
            
            updateHistoryDisplay();
            updateVariablesDisplay();
            updateCustomFunctionsDisplay();
        }
        
        loadCustomSkin();
    } catch (e) {
    }
}

document.addEventListener('keydown', function(e) {
    const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                           document.activeElement.tagName === 'TEXTAREA' ||
                           document.activeElement.tagName === 'SELECT';
    
    if (matchShortcut(e, calculator.customShortcuts.undo)) {
        e.preventDefault();
        undoInput();
        return;
    }
    
    if (matchShortcut(e, calculator.customShortcuts.repeat)) {
        e.preventDefault();
        repeatLast();
        return;
    }
    
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redoInput();
        return;
    }
    
    if (isInputFocused) {
        return;
    }
    
    if (/^[0-9]$/.test(e.key)) {
        appendInput(e.key);
    } else if (e.key === '.') {
        appendInput('.');
    } else if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(e.key)) {
        appendInput(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Backspace') {
        undoInput();
    } else if (e.key === 'Escape') {
        clearAll();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});
