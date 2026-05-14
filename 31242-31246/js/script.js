// 多分类题库
const materials = {
    prose: [
        { text: "月光如流水一般，静静地泻在这一片叶子和花上。薄薄的青雾浮起在荷塘里。叶子和花仿佛在牛乳中洗过一样；又像笼着轻纱的梦。", difficulty: "easy" },
        { text: "燕子去了，有再来的时候；杨柳枯了，有再青的时候；桃花谢了，有再开的时候。但是，聪明的，你告诉我，我们的日子为什么一去不复返呢？", difficulty: "normal" },
        { text: "盼望着，盼望着，东风来了，春天的脚步近了。一切都像刚睡醒的样子，欣欣然张开了眼。山朗润起来了，水涨起来了，太阳的脸红起来了。", difficulty: "easy" },
        { text: "对于一个在北平住惯的人，像我，冬天要是不刮风，便觉得是奇迹；济南的冬天是没有风声的。对于一个刚由伦敦回来的人，像我，冬天要能看得见日光，便觉得是怪事。", difficulty: "normal" },
        { text: "幸福是什么？小时候，幸福是一件东西，拥有就幸福；长大后，幸福是一个目标，达到就幸福；成熟后，发现幸福原来是一种心态，领悟就幸福。", difficulty: "hard" },
        { text: "人生就像一杯茶，不会苦一辈子，但总会苦一阵子。没有开始的苦，就没有后来的甜。苦苦甜甜就像一部交响曲，汇成我们的一生。", difficulty: "hard" }
    ],
    poetry: [
        { text: "床前明月光，疑是地上霜。举头望明月，低头思故乡。", difficulty: "easy" },
        { text: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。", difficulty: "easy" },
        { text: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。", difficulty: "easy" },
        { text: "两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。", difficulty: "normal" },
        { text: "独在异乡为异客，每逢佳节倍思亲。遥知兄弟登高处，遍插茱萸少一人。", difficulty: "normal" },
        { text: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。", difficulty: "normal" },
        { text: "大漠孤烟直，长河落日圆。萧关逢候骑，都护在燕然。", difficulty: "hard" },
        { text: "明月几时有，把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。", difficulty: "hard" }
    ],
    english: [
        { text: "The quick brown fox jumps over the lazy dog.", difficulty: "easy" },
        { text: "A journey of a thousand miles begins with a single step.", difficulty: "easy" },
        { text: "Where there is a will, there is a way.", difficulty: "easy" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", difficulty: "normal" },
        { text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking.", difficulty: "normal" },
        { text: "In the middle of difficulty lies opportunity. Change your thoughts and you change your world.", difficulty: "hard" },
        { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", difficulty: "hard" }
    ],
    code: [
        { text: "console.log('Hello, World!');", difficulty: "easy" },
        { text: "function hello() { return 'Hello World'; }", difficulty: "easy" },
        { text: "const sum = (a, b) => a + b;", difficulty: "easy" },
        { text: "if (condition) { doSomething(); } else { doElse(); }", difficulty: "normal" },
        { text: "for (let i = 0; i < arr.length; i++) { process(arr[i]); }", difficulty: "normal" },
        { text: "const result = array.filter(x => x > 0).map(x => x * 2).reduce((a, b) => a + b);", difficulty: "hard" },
        { text: "try { await fetchData(); } catch (error) { console.error(error); } finally { cleanup(); }", difficulty: "hard" },
        { text: "class Person { constructor(name) { this.name = name; } greet() { return `Hello, ${this.name}`; } }", difficulty: "hard" }
    ],
    internet: [
        { text: "今天也要加油鸭！", difficulty: "easy" },
        { text: "点赞收藏关注不迷路~", difficulty: "easy" },
        { text: "一键三连，感谢支持！", difficulty: "easy" },
        { text: "家人们谁懂啊，这也太绝了吧！", difficulty: "normal" },
        { text: "主打一个陪伴，主打一个真诚。", difficulty: "normal" },
        { text: "我真的会谢，这个操作直接给我整破防了。", difficulty: "normal" },
        { text: "不是吧不是吧，难道单押也算押？这波操作我给满分，不怕你骄傲！", difficulty: "hard" },
        { text: "宝子们，今天给大家分享一个超实用的小技巧，亲测有效，赶紧码住收藏！", difficulty: "hard" }
    ]
};

// 分类名称映射
const categoryNames = {
    prose: "散文随笔",
    poetry: "古诗词",
    english: "英文经典",
    code: "程序员代码",
    internet: "网络文案",
    custom: "自定义文本"
};

// 难度名称映射
const difficultyNames = {
    easy: "简单",
    normal: "普通",
    hard: "困难"
};

// 游戏状态
let gameState = {
    isPlaying: false,
    selectedDuration: 60,
    timeRemaining: 60,
    timerId: null,
    startTime: null,
    targetText: "",
    currentIndex: 0,
    correctCount: 0,
    errorCount: 0,
    totalTyped: 0,
    backspaceCount: 0,
    selectedCategory: "all",
    selectedDifficulty: "normal",
    customText: "",
    useCustomText: false,
    currentCategory: "all"
};

// IME状态
let imeState = {
    isComposing: false,
    preInputLength: 0
};

// 同步标志
let isUpdatingInput = false;

// 速度曲线数据
let speedHistory = [];
let speedChartInterval = null;

// DOM元素
const elements = {
    durationSelect: document.getElementById('duration-select'),
    difficultySelect: document.getElementById('difficulty-select'),
    categorySelect: document.getElementById('category-select'),
    timeRemaining: document.getElementById('time-remaining'),
    wpm: document.getElementById('wpm'),
    cpm: document.getElementById('cpm'),
    accuracy: document.getElementById('accuracy'),
    errors: document.getElementById('errors'),
    backspaceCount: document.getElementById('backspace-count'),
    effectiveInput: document.getElementById('effective-input'),
    typed: document.getElementById('typed'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    textDisplay: document.getElementById('text-display'),
    inputArea: document.getElementById('input-area'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    endBtn: document.getElementById('end-btn'),
    resultModal: document.getElementById('result-modal'),
    resultWpm: document.getElementById('result-wpm'),
    resultCpm: document.getElementById('result-cpm'),
    resultAccuracy: document.getElementById('result-accuracy'),
    resultTotal: document.getElementById('result-total'),
    resultCorrect: document.getElementById('result-correct'),
    resultErrors: document.getElementById('result-errors'),
    resultBackspace: document.getElementById('result-backspace'),
    resultEffective: document.getElementById('result-effective'),
    resultDuration: document.getElementById('result-duration'),
    resultCategory: document.getElementById('result-category'),
    restartBtn: document.getElementById('restart-btn'),
    viewHistoryBtn: document.getElementById('view-history-btn'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    customTextInput: document.getElementById('custom-text-input'),
    useCustomBtn: document.getElementById('use-custom-btn'),
    clearCustomBtn: document.getElementById('clear-custom-btn'),
    loadSampleBtn: document.getElementById('load-sample-btn'),
    customStatus: document.getElementById('custom-status'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    chartHistorySelect: document.getElementById('chart-history-select'),
    refreshChartBtn: document.getElementById('refresh-chart-btn'),
    speedChart: document.getElementById('speed-chart'),
    chartStats: document.getElementById('chart-stats')
};

// 生成随机文本
function generateRandomText() {
    if (gameState.useCustomText && gameState.customText.trim()) {
        gameState.currentCategory = "custom";
        return gameState.customText.trim();
    }
    
    const difficulty = gameState.selectedDifficulty;
    const category = gameState.selectedCategory;
    
    let candidates = [];
    
    if (category === "all") {
        Object.values(materials).forEach(categoryItems => {
            categoryItems.forEach(item => {
                if (item.difficulty === difficulty) {
                    candidates.push(item);
                }
            });
        });
        gameState.currentCategory = "all";
    } else {
        const categoryItems = materials[category] || [];
        candidates = categoryItems.filter(item => item.difficulty === difficulty);
        gameState.currentCategory = category;
        
        if (candidates.length === 0) {
            candidates = categoryItems;
        }
    }
    
    if (candidates.length === 0) {
        Object.values(materials).forEach(categoryItems => {
            candidates = candidates.concat(categoryItems);
        });
    }
    
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    return selected.text;
}

// 渲染文本显示
function renderTextDisplay() {
    elements.textDisplay.innerHTML = '';
    for (let i = 0; i < gameState.targetText.length; i++) {
        const char = document.createElement('span');
        char.className = 'char';
        char.textContent = gameState.targetText[i];
        char.dataset.index = i;
        
        if (i < gameState.currentIndex) {
            char.classList.add('correct');
        } else if (i === gameState.currentIndex) {
            char.classList.add('current');
        } else {
            char.classList.add('remaining');
        }
        
        elements.textDisplay.appendChild(char);
    }
    
    scrollToCurrentChar();
}

// 滚动到当前字符位置（光标跟随）
function scrollToCurrentChar() {
    const currentChar = elements.textDisplay.querySelector('.char.current');
    if (currentChar) {
        currentChar.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}

// 更新统计数据
function updateStats() {
    const elapsedTime = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 / 60 : 0;
    const minutes = elapsedTime || 0.01;
    
    const wpm = Math.round((gameState.correctCount / 5) / minutes);
    const cpm = Math.round(gameState.correctCount / minutes);
    const accuracy = gameState.totalTyped > 0 ? Math.round((gameState.correctCount / gameState.totalTyped) * 100) : 100;
    const totalActions = gameState.totalTyped + gameState.backspaceCount;
    const effective = totalActions > 0 ? Math.round((gameState.correctCount / totalActions) * 100) : 100;
    const progress = Math.round((gameState.currentIndex / gameState.targetText.length) * 100);
    
    elements.wpm.textContent = wpm;
    elements.cpm.textContent = cpm;
    elements.accuracy.textContent = accuracy;
    elements.errors.textContent = gameState.errorCount;
    elements.backspaceCount.textContent = gameState.backspaceCount;
    elements.effectiveInput.textContent = effective;
    elements.typed.textContent = gameState.currentIndex;
    elements.progressBar.style.width = progress + '%';
    elements.progressText.textContent = progress + '%';
}

// 更新时间显示
function updateTimeDisplay() {
    elements.timeRemaining.textContent = gameState.timeRemaining;
}

// 同步textarea值
function syncInputArea() {
    isUpdatingInput = true;
    
    const correctText = gameState.targetText.substring(0, gameState.currentIndex);
    elements.inputArea.value = correctText;
    
    setTimeout(() => {
        isUpdatingInput = false;
    }, 0);
}

// 记录速度数据
function recordSpeed() {
    if (!gameState.isPlaying) return;
    
    const elapsedTime = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 : 0;
    const minutes = elapsedTime / 60 || 0.01;
    const cpm = Math.round(gameState.correctCount / minutes);
    
    speedHistory.push({
        time: Math.round(elapsedTime),
        cpm: cpm
    });
    
    drawSpeedChart();
}

// 绘制速度曲线
function drawSpeedChart() {
    const canvas = elements.speedChart;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    ctx.clearRect(0, 0, width, height);
    
    if (speedHistory.length < 2) {
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('开始测试后将显示实时速度曲线', width / 2, height / 2);
        return;
    }
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxTime = Math.max(...speedHistory.map(p => p.time), 60);
    const maxCpm = Math.max(...speedHistory.map(p => p.cpm), 100);
    
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    speedHistory.forEach((point, index) => {
        const x = padding + (point.time / maxTime) * chartWidth;
        const y = height - padding - (point.cpm / maxCpm) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    speedHistory.forEach((point, index) => {
        const x = padding + (point.time / maxTime) * chartWidth;
        const y = height - padding - (point.cpm / maxCpm) * chartHeight;
        
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('时间(秒)', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('速度(字/分)', 0, 0);
    ctx.restore();
    
    ctx.textAlign = 'right';
    ctx.fillText(maxCpm, padding - 5, padding);
    ctx.fillText('0', padding - 5, height - padding);
}

// 开始游戏
function startGame() {
    gameState.selectedDuration = parseInt(elements.durationSelect.value);
    gameState.selectedDifficulty = elements.difficultySelect.value;
    gameState.selectedCategory = elements.categorySelect.value;
    gameState.timeRemaining = gameState.selectedDuration;
    gameState.targetText = generateRandomText();
    gameState.currentIndex = 0;
    gameState.correctCount = 0;
    gameState.errorCount = 0;
    gameState.totalTyped = 0;
    gameState.backspaceCount = 0;
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    
    imeState.isComposing = false;
    imeState.preInputLength = 0;
    
    speedHistory = [];
    
    renderTextDisplay();
    updateStats();
    updateTimeDisplay();
    
    elements.inputArea.value = '';
    elements.inputArea.disabled = false;
    elements.inputArea.focus();
    
    elements.startBtn.disabled = true;
    elements.resetBtn.disabled = false;
    elements.endBtn.disabled = false;
    elements.durationSelect.disabled = true;
    elements.difficultySelect.disabled = true;
    elements.categorySelect.disabled = true;
    
    gameState.timerId = setInterval(() => {
        gameState.timeRemaining--;
        updateTimeDisplay();
        updateStats();
        recordSpeed();
        
        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
    
    speedChartInterval = setInterval(recordSpeed, 2000);
}

// 结束游戏
function endGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    clearInterval(gameState.timerId);
    clearInterval(speedChartInterval);
    
    elements.inputArea.disabled = true;
    elements.startBtn.disabled = false;
    elements.resetBtn.disabled = false;
    elements.endBtn.disabled = true;
    elements.durationSelect.disabled = false;
    elements.difficultySelect.disabled = false;
    elements.categorySelect.disabled = false;
    
    saveHistory();
    showResults();
    updateHistoryUI();
}

// 重置游戏
function resetGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerId);
    clearInterval(speedChartInterval);
    
    gameState.selectedDuration = parseInt(elements.durationSelect.value);
    gameState.timeRemaining = gameState.selectedDuration;
    gameState.targetText = generateRandomText();
    gameState.currentIndex = 0;
    gameState.correctCount = 0;
    gameState.errorCount = 0;
    gameState.totalTyped = 0;
    gameState.backspaceCount = 0;
    
    imeState.isComposing = false;
    imeState.preInputLength = 0;
    
    speedHistory = [];
    
    renderTextDisplay();
    updateStats();
    updateTimeDisplay();
    drawSpeedChart();
    
    elements.inputArea.value = '';
    elements.inputArea.disabled = true;
    
    elements.startBtn.disabled = false;
    elements.resetBtn.disabled = true;
    elements.endBtn.disabled = true;
    elements.durationSelect.disabled = false;
    elements.difficultySelect.disabled = false;
    elements.categorySelect.disabled = false;
    
    elements.resultModal.classList.remove('show');
}

// 保存历史记录
function saveHistory() {
    const elapsedTime = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 / 60 : 0;
    const minutes = elapsedTime || 0.01;
    const actualDuration = gameState.selectedDuration - gameState.timeRemaining;
    
    const record = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        duration: actualDuration,
        targetDuration: gameState.selectedDuration,
        wpm: Math.round((gameState.correctCount / 5) / minutes),
        cpm: Math.round(gameState.correctCount / minutes),
        accuracy: gameState.totalTyped > 0 ? Math.round((gameState.correctCount / gameState.totalTyped) * 100) : 100,
        totalChars: gameState.currentIndex,
        correctChars: gameState.correctCount,
        errorChars: gameState.errorCount,
        backspaceCount: gameState.backspaceCount,
        effectiveRate: (gameState.totalTyped + gameState.backspaceCount) > 0 
            ? Math.round((gameState.correctCount / (gameState.totalTyped + gameState.backspaceCount)) * 100) 
            : 100,
        category: gameState.currentCategory,
        difficulty: gameState.selectedDifficulty,
        speedHistory: [...speedHistory],
        targetText: gameState.targetText
    };
    
    let history = JSON.parse(localStorage.getItem('typingHistory') || '[]');
    history.unshift(record);
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('typingHistory', JSON.stringify(history));
}

// 加载历史记录
function loadHistory() {
    return JSON.parse(localStorage.getItem('typingHistory') || '[]');
}

// 更新历史记录UI
function updateHistoryUI() {
    const history = loadHistory();
    const historyList = elements.historyList;
    const chartSelect = elements.chartHistorySelect;
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <p>暂无历史记录</p>
                <p class="sub-text">完成打字测试后，成绩将自动保存到这里</p>
            </div>
        `;
        chartSelect.innerHTML = '<option value="">选择历史记录查看</option>';
        return;
    }
    
    historyList.innerHTML = history.map(record => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-item-date">${record.date}</span>
                <span class="history-item-category">${categoryNames[record.category] || '全部'} · ${difficultyNames[record.difficulty] || '普通'}</span>
            </div>
            <div class="history-item-stats">
                <div class="history-stat">
                    <span class="history-stat-label">速度</span>
                    <span class="history-stat-value">${record.cpm}字/分</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">正确率</span>
                    <span class="history-stat-value">${record.accuracy}%</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">字数</span>
                    <span class="history-stat-value">${record.totalChars}字</span>
                </div>
                <div class="history-stat">
                    <span class="history-stat-label">时长</span>
                    <span class="history-stat-value">${record.duration}秒</span>
                </div>
            </div>
        </div>
    `).join('');
    
    chartSelect.innerHTML = '<option value="">选择历史记录查看</option>' + 
        history.map((record, index) => `
            <option value="${index}">${record.date} - ${record.cpm}字/分</option>
        `).join('');
}

// 显示结果
function showResults() {
    const elapsedTime = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 / 60 : 0;
    const actualDuration = gameState.selectedDuration - gameState.timeRemaining;
    const minutes = elapsedTime || 0.01;
    const totalActions = gameState.totalTyped + gameState.backspaceCount;
    
    const wpm = Math.round((gameState.correctCount / 5) / minutes);
    const cpm = Math.round(gameState.correctCount / minutes);
    const accuracy = gameState.totalTyped > 0 ? Math.round((gameState.correctCount / gameState.totalTyped) * 100) : 100;
    const effective = totalActions > 0 ? Math.round((gameState.correctCount / totalActions) * 100) : 100;
    
    elements.resultWpm.textContent = wpm + ' WPM';
    elements.resultCpm.textContent = cpm + ' 字/分';
    elements.resultAccuracy.textContent = accuracy + '%';
    elements.resultTotal.textContent = gameState.currentIndex + ' 字';
    elements.resultCorrect.textContent = gameState.correctCount + ' 字';
    elements.resultErrors.textContent = gameState.errorCount + ' 个';
    elements.resultBackspace.textContent = gameState.backspaceCount + ' 次';
    elements.resultEffective.textContent = effective + '%';
    elements.resultDuration.textContent = actualDuration + ' 秒';
    elements.resultCategory.textContent = categoryNames[gameState.currentCategory] || '全部';
    
    elements.resultModal.classList.add('show');
}

// 处理单个字符输入
function processSingleChar(typedChar) {
    const targetChar = gameState.targetText[gameState.currentIndex];
    
    gameState.totalTyped++;
    
    if (typedChar === targetChar) {
        gameState.correctCount++;
        
        const currentChar = elements.textDisplay.querySelector(`.char[data-index="${gameState.currentIndex}"]`);
        if (currentChar) {
            currentChar.classList.remove('current');
            currentChar.classList.add('correct');
        }
        
        gameState.currentIndex++;
        
        const nextChar = elements.textDisplay.querySelector(`.char[data-index="${gameState.currentIndex}"]`);
        if (nextChar) {
            nextChar.classList.remove('remaining');
            nextChar.classList.add('current');
        }
        
        updateStats();
        scrollToCurrentChar();
        syncInputArea();
        
        if (gameState.currentIndex >= gameState.targetText.length) {
            endGame();
            return { correct: true, finished: true };
        }
        
        return { correct: true, finished: false };
    } else {
        gameState.errorCount++;
        
        const currentChar = elements.textDisplay.querySelector(`.char[data-index="${gameState.currentIndex}"]`);
        if (currentChar) {
            currentChar.classList.remove('current');
            currentChar.classList.add('incorrect');
        }
        
        setTimeout(() => {
            if (currentChar && gameState.isPlaying) {
                currentChar.classList.remove('incorrect');
                currentChar.classList.add('current');
            }
        }, 300);
        
        updateStats();
        syncInputArea();
        
        return { correct: false, finished: false };
    }
}

// 处理回退
function handleBackspace() {
    if (gameState.currentIndex <= 0) return;
    
    gameState.backspaceCount++;
    gameState.correctCount--;
    gameState.totalTyped--;
    gameState.currentIndex--;
    
    const prevChar = elements.textDisplay.querySelector(`.char[data-index="${gameState.currentIndex}"]`);
    if (prevChar) {
        prevChar.classList.remove('correct');
        prevChar.classList.add('current');
    }
    
    const currentChar = elements.textDisplay.querySelector(`.char[data-index="${gameState.currentIndex + 1}"]`);
    if (currentChar) {
        currentChar.classList.remove('current');
        currentChar.classList.add('remaining');
    }
    
    syncInputArea();
    updateStats();
    scrollToCurrentChar();
}

// 处理输入
function handleInput(event) {
    if (!gameState.isPlaying) return;
    
    if (isUpdatingInput) {
        return;
    }
    
    if (event.isComposing || imeState.isComposing) {
        return;
    }
    
    const inputValue = event.target.value;
    const expectedLength = gameState.currentIndex;
    
    if (inputValue.length > expectedLength) {
        const newCharsStart = expectedLength;
        const newChars = inputValue.substring(newCharsStart);
        
        for (let i = 0; i < newChars.length; i++) {
            const typedChar = newChars[i];
            const result = processSingleChar(typedChar);
            
            if (result.finished) return;
            
            if (!result.correct) {
                break;
            }
        }
    } else if (inputValue.length < expectedLength) {
        const backspaceCount = expectedLength - inputValue.length;
        
        for (let i = 0; i < backspaceCount; i++) {
            if (gameState.currentIndex > 0) {
                handleBackspace();
            }
        }
    }
}

// IME组合开始
function handleCompositionStart(event) {
    if (!gameState.isPlaying) return;
    
    imeState.isComposing = true;
    imeState.preInputLength = gameState.currentIndex;
}

// IME组合结束
function handleCompositionEnd(event) {
    if (!gameState.isPlaying) return;
    
    imeState.isComposing = false;
    
    const currentInputValue = elements.inputArea.value;
    const newCharsStart = imeState.preInputLength;
    const confirmedChars = currentInputValue.substring(newCharsStart);
    
    for (let i = 0; i < confirmedChars.length; i++) {
        const char = confirmedChars[i];
        const result = processSingleChar(char);
        
        if (result.finished) {
            return;
        }
        
        if (!result.correct) {
            break;
        }
    }
    
    syncInputArea();
}

// 切换标签页
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// 使用自定义文本
function useCustomText() {
    const text = elements.customTextInput.value.trim();
    if (!text) {
        alert('请输入自定义文本');
        return;
    }
    
    if (text.length < 10) {
        alert('自定义文本至少需要10个字符');
        return;
    }
    
    gameState.customText = text;
    gameState.useCustomText = true;
    elements.customStatus.textContent = `已设置 (${text.length}字)`;
    
    switchTab('typing');
    resetGame();
}

// 加载示例文本
function loadSampleText() {
    const samples = [
        "生活不止眼前的苟且，还有诗和远方的田野。你赤手空拳来到人世间，为找到那片海不顾一切。",
        "程序的世界里，没有什么是一行代码解决不了的。如果有，那就两行。",
        "The best way to predict the future is to create it. Success is not final, failure is not fatal."
    ];
    elements.customTextInput.value = samples[Math.floor(Math.random() * samples.length)];
}

// 清空历史记录
function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
        localStorage.removeItem('typingHistory');
        updateHistoryUI();
        elements.chartHistorySelect.innerHTML = '<option value="">选择历史记录查看</option>';
    }
}

// 查看历史记录的速度曲线
function viewHistoryChart(historyIndex) {
    const history = loadHistory();
    if (historyIndex >= 0 && historyIndex < history.length) {
        speedHistory = history[historyIndex].speedHistory;
        drawSpeedChart();
        
        const record = history[historyIndex];
        elements.chartStats.innerHTML = `
            <p><strong>${record.date}</strong></p>
            <p>速度: ${record.cpm}字/分 | 正确率: ${record.accuracy}% | 时长: ${record.duration}秒</p>
        `;
    }
}

// 事件监听器
function initEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.resetBtn.addEventListener('click', resetGame);
    elements.endBtn.addEventListener('click', endGame);
    elements.inputArea.addEventListener('input', handleInput);
    elements.inputArea.addEventListener('compositionstart', handleCompositionStart);
    elements.inputArea.addEventListener('compositionend', handleCompositionEnd);
    elements.restartBtn.addEventListener('click', () => {
        elements.resultModal.classList.remove('show');
        resetGame();
    });
    elements.viewHistoryBtn.addEventListener('click', () => {
        elements.resultModal.classList.remove('show');
        switchTab('history');
    });
    elements.closeModalBtn.addEventListener('click', () => {
        elements.resultModal.classList.remove('show');
    });
    elements.durationSelect.addEventListener('change', () => {
        if (!gameState.isPlaying) {
            gameState.selectedDuration = parseInt(elements.durationSelect.value);
            gameState.timeRemaining = gameState.selectedDuration;
            updateTimeDisplay();
        }
    });
    elements.difficultySelect.addEventListener('change', () => {
        if (!gameState.isPlaying) {
            gameState.selectedDifficulty = elements.difficultySelect.value;
        }
    });
    elements.categorySelect.addEventListener('change', () => {
        if (!gameState.isPlaying) {
            gameState.selectedCategory = elements.categorySelect.value;
            gameState.useCustomText = false;
            elements.customStatus.textContent = '未设置';
        }
    });
    
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    elements.useCustomBtn.addEventListener('click', useCustomText);
    elements.clearCustomBtn.addEventListener('click', () => {
        elements.customTextInput.value = '';
    });
    elements.loadSampleBtn.addEventListener('click', loadSampleText);
    
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    elements.chartHistorySelect.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        if (!isNaN(index)) {
            viewHistoryChart(index);
        }
    });
    elements.refreshChartBtn.addEventListener('click', drawSpeedChart);
}

// 初始化
function init() {
    gameState.targetText = generateRandomText();
    renderTextDisplay();
    updateStats();
    updateTimeDisplay();
    updateHistoryUI();
    initEventListeners();
    drawSpeedChart();
}

document.addEventListener('DOMContentLoaded', init);
