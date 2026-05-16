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

const categoryNames = {
    prose: "散文随笔",
    poetry: "古诗词",
    english: "英文经典",
    code: "程序员代码",
    internet: "网络文案",
    custom: "自定义文本"
};

const difficultyNames = {
    easy: "简单",
    normal: "普通",
    hard: "困难"
};

const rankLevels = [
    { name: "新手", icon: "🥉", minChars: 0, maxChars: 499, desc: "刚开始打字之旅" },
    { name: "入门", icon: "🥈", minChars: 500, maxChars: 2999, desc: "打字基础逐渐稳固" },
    { name: "熟练", icon: "🥇", minChars: 3000, maxChars: 9999, desc: "打字速度稳步提升" },
    { name: "大神", icon: "👑", minChars: 10000, maxChars: Infinity, desc: "打字如飞，登峰造极" }
];

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
    currentCategory: "all",
    errorChars: [],
    keystrokeTimes: [],
    lastKeystrokeTime: null
};

let imeState = {
    isComposing: false,
    preInputLength: 0
};

let isUpdatingInput = false;
let speedHistory = [];

let practiceState = {
    isActive: false,
    timerId: null,
    startTime: null,
    elapsedTime: 0,
    targetText: "",
    currentIndex: 0,
    correctCount: 0,
    errorCount: 0,
    selectedCategory: "all",
    selectedDifficulty: "normal"
};

let pkState = {
    isActive: false,
    mode: "ai",
    timerId: null,
    startTime: null,
    timeRemaining: 60,
    targetText: "",
    player1: {
        currentIndex: 0,
        correctCount: 0,
        errorCount: 0,
        totalTyped: 0
    },
    player2: {
        currentIndex: 0,
        correctCount: 0,
        errorCount: 0,
        totalTyped: 0
    },
    aiInterval: null
};

let mistakePracticeState = {
    isActive: false,
    mistakes: [],
    currentIndex: 0,
    correctCount: 0,
    wrongCount: 0
};

let elements = {};

function initElements() {
    elements = {
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
        chartStats: document.getElementById('chart-stats'),
        
        practiceDifficulty: document.getElementById('practice-difficulty'),
        practiceCategory: document.getElementById('practice-category'),
        practiceTime: document.getElementById('practice-time'),
        practiceCorrect: document.getElementById('practice-correct'),
        practiceErrors: document.getElementById('practice-errors'),
        practiceTyped: document.getElementById('practice-typed'),
        practiceTextDisplay: document.getElementById('practice-text-display'),
        practiceInputArea: document.getElementById('practice-input-area'),
        practiceStartBtn: document.getElementById('practice-start-btn'),
        practiceResetBtn: document.getElementById('practice-reset-btn'),
        practiceNextBtn: document.getElementById('practice-next-btn'),
        
        rankIcon: document.getElementById('rank-icon'),
        rankTitle: document.getElementById('rank-title'),
        rankDesc: document.getElementById('rank-desc'),
        rankProgressFill: document.getElementById('rank-progress-fill'),
        rankProgressText: document.getElementById('rank-progress-text'),
        rankTotalSessions: document.getElementById('rank-total-sessions'),
        rankTotalChars: document.getElementById('rank-total-chars'),
        rankMaxCpm: document.getElementById('rank-max-cpm'),
        rankAvgAccuracy: document.getElementById('rank-avg-accuracy'),
        
        leaderboardContent: document.getElementById('leaderboard-content'),
        leaderboardTabBtns: document.querySelectorAll('.leaderboard-tab-btn'),
        generateMockLeaderboard: document.getElementById('generate-mock-leaderboard'),
        
        pkMode: document.getElementById('pk-mode'),
        pkDuration: document.getElementById('pk-duration'),
        pkDifficulty: document.getElementById('pk-difficulty'),
        pkPlayer1Name: document.getElementById('pk-player1-name'),
        pkPlayer1Score: document.getElementById('pk-player1-score'),
        pkPlayer1Cpm: document.getElementById('pk-player1-cpm'),
        pkPlayer1Accuracy: document.getElementById('pk-player1-accuracy'),
        pkProgress1: document.getElementById('pk-progress1'),
        pkPlayer2Name: document.getElementById('pk-player2-name'),
        pkPlayer2Score: document.getElementById('pk-player2-score'),
        pkPlayer2Cpm: document.getElementById('pk-player2-cpm'),
        pkPlayer2Accuracy: document.getElementById('pk-player2-accuracy'),
        pkProgress2: document.getElementById('pk-progress2'),
        pkTextDisplay: document.getElementById('pk-text-display'),
        pkInput1: document.getElementById('pk-input1'),
        pkStartBtn: document.getElementById('pk-start-btn'),
        pkResetBtn: document.getElementById('pk-reset-btn'),
        pkResultModal: document.getElementById('pk-result-modal'),
        pkResultTitle: document.getElementById('pk-result-title'),
        pkResultWinner: document.getElementById('pk-result-winner'),
        pkResultPlayer1: document.getElementById('pk-result-player1'),
        pkResultPlayer2Name: document.getElementById('pk-result-player2-name'),
        pkResultPlayer2: document.getElementById('pk-result-player2'),
        pkRestartBtn: document.getElementById('pk-restart-btn'),
        pkCloseBtn: document.getElementById('pk-close-btn'),
        pkAiProgress: document.getElementById('pk-ai-progress'),
        
        mistakeTotal: document.getElementById('mistake-total'),
        mistakeMastered: document.getElementById('mistake-mastered'),
        mistakesList: document.getElementById('mistakes-list'),
        practiceMistakesBtn: document.getElementById('practice-mistakes-btn'),
        clearMistakesBtn: document.getElementById('clear-mistakes-btn'),
        mistakesPracticeModal: document.getElementById('mistakes-practice-modal'),
        mistakePracticeTarget: document.getElementById('mistake-practice-target'),
        mistakePracticeInput: document.getElementById('mistake-practice-input'),
        mistakePracticeCorrect: document.getElementById('mistake-practice-correct'),
        mistakePracticeWrong: document.getElementById('mistake-practice-wrong'),
        mistakePracticeRemaining: document.getElementById('mistake-practice-remaining'),
        mistakePracticeCloseBtn: document.getElementById('mistake-practice-close-btn'),
        
        avgKeystrokeSpeed: document.getElementById('avg-keystroke-speed'),
        fastestKeystroke: document.getElementById('fastest-keystroke'),
        slowestKeystroke: document.getElementById('slowest-keystroke'),
        avgInterval: document.getElementById('avg-interval'),
        minInterval: document.getElementById('min-interval'),
        maxInterval: document.getElementById('max-interval'),
        analysisMistakes: document.getElementById('analysis-mistakes'),
        compositeScore: document.getElementById('composite-score'),
        refreshAnalysisBtn: document.getElementById('refresh-analysis-btn')
    };
}

function generateRandomText(category = "all", difficulty = "normal", useCustom = false, customText = "") {
    if (useCustom && customText.trim()) {
        return customText.trim();
    }
    
    let candidates = [];
    
    if (category === "all") {
        Object.values(materials).forEach(categoryItems => {
            categoryItems.forEach(item => {
                if (item.difficulty === difficulty) {
                    candidates.push(item);
                }
            });
        });
    } else {
        const categoryItems = materials[category] || [];
        candidates = categoryItems.filter(item => item.difficulty === difficulty);
        
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

function renderTextDisplay(textDisplayElement, targetText, currentIndex) {
    textDisplayElement.innerHTML = '';
    for (let i = 0; i < targetText.length; i++) {
        const char = document.createElement('span');
        char.className = 'char';
        char.textContent = targetText[i];
        char.dataset.index = i;
        
        if (i < currentIndex) {
            char.classList.add('correct');
        } else if (i === currentIndex) {
            char.classList.add('current');
        } else {
            char.classList.add('remaining');
        }
        
        textDisplayElement.appendChild(char);
    }
    
    const currentChar = textDisplayElement.querySelector('.char.current');
    if (currentChar) {
        currentChar.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}

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

function updateTimeDisplay() {
    elements.timeRemaining.textContent = gameState.timeRemaining;
}

function syncInputArea() {
    isUpdatingInput = true;
    
    const correctText = gameState.targetText.substring(0, gameState.currentIndex);
    elements.inputArea.value = correctText;
    
    setTimeout(() => {
        isUpdatingInput = false;
    }, 0);
}

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

function startGame() {
    gameState.selectedDuration = parseInt(elements.durationSelect.value);
    gameState.selectedDifficulty = elements.difficultySelect.value;
    gameState.selectedCategory = elements.categorySelect.value;
    gameState.timeRemaining = gameState.selectedDuration;
    gameState.targetText = generateRandomText(
        gameState.selectedCategory, 
        gameState.selectedDifficulty, 
        gameState.useCustomText, 
        gameState.customText
    );
    gameState.currentIndex = 0;
    gameState.correctCount = 0;
    gameState.errorCount = 0;
    gameState.totalTyped = 0;
    gameState.backspaceCount = 0;
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    gameState.errorChars = [];
    gameState.keystrokeTimes = [];
    gameState.lastKeystrokeTime = null;
    
    imeState.isComposing = false;
    imeState.preInputLength = 0;
    
    speedHistory = [];
    
    renderTextDisplay(elements.textDisplay, gameState.targetText, gameState.currentIndex);
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
}

function endGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPlaying = false;
    clearInterval(gameState.timerId);
    
    elements.inputArea.disabled = true;
    elements.startBtn.disabled = false;
    elements.resetBtn.disabled = false;
    elements.endBtn.disabled = true;
    elements.durationSelect.disabled = false;
    elements.difficultySelect.disabled = false;
    elements.categorySelect.disabled = false;
    
    saveHistory();
    saveMistakes();
    saveAnalysisData();
    updateRank();
    updateLeaderboard();
    showResults();
    updateHistoryUI();
}

function resetGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timerId);
    
    gameState.selectedDuration = parseInt(elements.durationSelect.value);
    gameState.timeRemaining = gameState.selectedDuration;
    gameState.targetText = generateRandomText(
        gameState.selectedCategory, 
        gameState.selectedDifficulty, 
        gameState.useCustomText, 
        gameState.customText
    );
    gameState.currentIndex = 0;
    gameState.correctCount = 0;
    gameState.errorCount = 0;
    gameState.totalTyped = 0;
    gameState.backspaceCount = 0;
    
    imeState.isComposing = false;
    imeState.preInputLength = 0;
    
    speedHistory = [];
    
    renderTextDisplay(elements.textDisplay, gameState.targetText, gameState.currentIndex);
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

function saveHistory() {
    const elapsedTime = gameState.startTime ? (Date.now() - gameState.startTime) / 1000 / 60 : 0;
    const minutes = elapsedTime || 0.01;
    const actualDuration = gameState.selectedDuration - gameState.timeRemaining;
    
    const record = {
        id: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        timestamp: Date.now(),
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
        targetText: gameState.targetText,
        errorChars: [...gameState.errorChars],
        keystrokeTimes: [...gameState.keystrokeTimes]
    };
    
    let history = JSON.parse(localStorage.getItem('typingHistory') || '[]');
    history.unshift(record);
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('typingHistory', JSON.stringify(history));
}

function loadHistory() {
    return JSON.parse(localStorage.getItem('typingHistory') || '[]');
}

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

function processSingleChar(typedChar) {
    const targetChar = gameState.targetText[gameState.currentIndex];
    
    const now = Date.now();
    if (gameState.lastKeystrokeTime !== null) {
        const keystrokeTime = now - gameState.lastKeystrokeTime;
        gameState.keystrokeTimes.push(keystrokeTime);
    }
    gameState.lastKeystrokeTime = now;
    
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
        const currentChar2 = elements.textDisplay.querySelector('.char.current');
        if (currentChar2) {
            currentChar2.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
        syncInputArea();
        
        if (gameState.currentIndex >= gameState.targetText.length) {
            endGame();
            return { correct: true, finished: true };
        }
        
        return { correct: true, finished: false };
    } else {
        gameState.errorCount++;
        gameState.errorChars.push({
            target: targetChar,
            typed: typedChar,
            timestamp: Date.now()
        });
        
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
    const currentChar2 = elements.textDisplay.querySelector('.char.current');
    if (currentChar2) {
        currentChar2.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}

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

function handleCompositionStart(event) {
    if (!gameState.isPlaying) return;
    
    imeState.isComposing = true;
    imeState.preInputLength = gameState.currentIndex;
}

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

function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    if (tabName === 'rank') {
        updateRankUI();
    } else if (tabName === 'leaderboard') {
        updateLeaderboardUI('daily');
    } else if (tabName === 'mistakes') {
        updateMistakesUI();
    } else if (tabName === 'analysis') {
        updateAnalysisUI();
    }
}

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

function loadSampleText() {
    const samples = [
        "生活不止眼前的苟且，还有诗和远方的田野。你赤手空拳来到人世间，为找到那片海不顾一切。",
        "程序的世界里，没有什么是一行代码解决不了的。如果有，那就两行。",
        "The best way to predict the future is to create it. Success is not final, failure is not fatal."
    ];
    elements.customTextInput.value = samples[Math.floor(Math.random() * samples.length)];
}

function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
        localStorage.removeItem('typingHistory');
        updateHistoryUI();
        elements.chartHistorySelect.innerHTML = '<option value="">选择历史记录查看</option>';
    }
}

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

function startPractice() {
    practiceState.selectedDifficulty = elements.practiceDifficulty.value;
    practiceState.selectedCategory = elements.practiceCategory.value;
    practiceState.targetText = generateRandomText(
        practiceState.selectedCategory, 
        practiceState.selectedDifficulty
    );
    practiceState.currentIndex = 0;
    practiceState.correctCount = 0;
    practiceState.errorCount = 0;
    practiceState.isActive = true;
    practiceState.startTime = Date.now();
    practiceState.elapsedTime = 0;
    
    renderTextDisplay(elements.practiceTextDisplay, practiceState.targetText, practiceState.currentIndex);
    updatePracticeStats();
    
    elements.practiceInputArea.value = '';
    elements.practiceInputArea.disabled = false;
    elements.practiceInputArea.focus();
    
    elements.practiceStartBtn.disabled = true;
    elements.practiceResetBtn.disabled = false;
    elements.practiceNextBtn.disabled = false;
    
    practiceState.timerId = setInterval(() => {
        practiceState.elapsedTime = Math.floor((Date.now() - practiceState.startTime) / 1000);
        elements.practiceTime.textContent = practiceState.elapsedTime;
    }, 1000);
}

function resetPractice() {
    practiceState.isActive = false;
    clearInterval(practiceState.timerId);
    
    practiceState.elapsedTime = 0;
    practiceState.currentIndex = 0;
    practiceState.correctCount = 0;
    practiceState.errorCount = 0;
    
    practiceState.targetText = generateRandomText(
        practiceState.selectedCategory, 
        practiceState.selectedDifficulty
    );
    
    renderTextDisplay(elements.practiceTextDisplay, practiceState.targetText, practiceState.currentIndex);
    updatePracticeStats();
    
    elements.practiceInputArea.value = '';
    elements.practiceInputArea.disabled = true;
    
    elements.practiceStartBtn.disabled = false;
    elements.practiceResetBtn.disabled = true;
    elements.practiceNextBtn.disabled = true;
}

function nextPracticeText() {
    practiceState.currentIndex = 0;
    practiceState.targetText = generateRandomText(
        practiceState.selectedCategory, 
        practiceState.selectedDifficulty
    );
    
    renderTextDisplay(elements.practiceTextDisplay, practiceState.targetText, practiceState.currentIndex);
    
    elements.practiceInputArea.value = '';
    elements.practiceInputArea.focus();
}

function updatePracticeStats() {
    elements.practiceCorrect.textContent = practiceState.correctCount;
    elements.practiceErrors.textContent = practiceState.errorCount;
    elements.practiceTyped.textContent = practiceState.currentIndex;
}

function handlePracticeInput(event) {
    if (!practiceState.isActive) return;
    
    const inputValue = event.target.value;
    const expectedLength = practiceState.currentIndex;
    
    if (inputValue.length > expectedLength) {
        const newCharsStart = expectedLength;
        const newChars = inputValue.substring(newCharsStart);
        
        for (let i = 0; i < newChars.length; i++) {
            const typedChar = newChars[i];
            const targetChar = practiceState.targetText[practiceState.currentIndex];
            
            if (typedChar === targetChar) {
                practiceState.correctCount++;
                
                const currentChar = elements.practiceTextDisplay.querySelector(`.char[data-index="${practiceState.currentIndex}"]`);
                if (currentChar) {
                    currentChar.classList.remove('current');
                    currentChar.classList.add('correct');
                }
                
                practiceState.currentIndex++;
                
                const nextChar = elements.practiceTextDisplay.querySelector(`.char[data-index="${practiceState.currentIndex}"]`);
                if (nextChar) {
                    nextChar.classList.remove('remaining');
                    nextChar.classList.add('current');
                }
            } else {
                practiceState.errorCount++;
                
                const currentChar = elements.practiceTextDisplay.querySelector(`.char[data-index="${practiceState.currentIndex}"]`);
                if (currentChar) {
                    currentChar.classList.remove('current');
                    currentChar.classList.add('incorrect');
                    setTimeout(() => {
                        currentChar.classList.remove('incorrect');
                        currentChar.classList.add('current');
                    }, 300);
                }
            }
            
            updatePracticeStats();
            
            if (practiceState.currentIndex >= practiceState.targetText.length) {
                nextPracticeText();
                return;
            }
        }
    } else if (inputValue.length < expectedLength) {
        const backspaceCount = expectedLength - inputValue.length;
        
        for (let i = 0; i < backspaceCount; i++) {
            if (practiceState.currentIndex > 0) {
                practiceState.currentIndex--;
                practiceState.correctCount--;
                
                const prevChar = elements.practiceTextDisplay.querySelector(`.char[data-index="${practiceState.currentIndex}"]`);
                if (prevChar) {
                    prevChar.classList.remove('correct');
                    prevChar.classList.add('current');
                }
                
                const currentChar = elements.practiceTextDisplay.querySelector(`.char[data-index="${practiceState.currentIndex + 1}"]`);
                if (currentChar) {
                    currentChar.classList.remove('current');
                    currentChar.classList.add('remaining');
                }
            }
        }
        
        updatePracticeStats();
    }
}

function getRank(totalChars) {
    for (let i = rankLevels.length - 1; i >= 0; i--) {
        if (totalChars >= rankLevels[i].minChars) {
            return { ...rankLevels[i], index: i };
        }
    }
    return { ...rankLevels[0], index: 0 };
}

function getRankProgress(totalChars) {
    const rank = getRank(totalChars);
    
    if (rank.maxChars === Infinity) {
        return 100;
    }
    
    const range = rank.maxChars - rank.minChars + 1;
    const current = totalChars - rank.minChars;
    return Math.min(100, Math.round((current / range) * 100));
}

function updateRank() {
    let rankData = JSON.parse(localStorage.getItem('typingRank') || '{"totalChars": 0, "totalSessions": 0, "maxCpm": 0, "totalAccuracy": 0, "accuracyCount": 0}');
    
    const history = loadHistory();
    if (history.length > 0) {
        const latest = history[0];
        rankData.totalChars += latest.totalChars;
        rankData.totalSessions++;
        if (latest.cpm > rankData.maxCpm) {
            rankData.maxCpm = latest.cpm;
        }
        rankData.totalAccuracy += latest.accuracy;
        rankData.accuracyCount++;
    }
    
    localStorage.setItem('typingRank', JSON.stringify(rankData));
}

function updateRankUI() {
    const rankData = JSON.parse(localStorage.getItem('typingRank') || '{"totalChars": 0, "totalSessions": 0, "maxCpm": 0, "totalAccuracy": 0, "accuracyCount": 0}');
    
    const rank = getRank(rankData.totalChars);
    const progress = getRankProgress(rankData.totalChars);
    
    elements.rankIcon.textContent = rank.icon;
    elements.rankTitle.textContent = rank.name;
    elements.rankDesc.textContent = rank.desc;
    elements.rankProgressFill.style.width = progress + '%';
    elements.rankProgressText.textContent = `经验值: ${rankData.totalChars} / ${rank.maxChars === Infinity ? '∞' : rank.maxChars}`;
    
    elements.rankTotalSessions.textContent = rankData.totalSessions;
    elements.rankTotalChars.textContent = rankData.totalChars;
    elements.rankMaxCpm.textContent = rankData.maxCpm;
    elements.rankAvgAccuracy.textContent = rankData.accuracyCount > 0 
        ? Math.round(rankData.totalAccuracy / rankData.accuracyCount) 
        : 0;
}

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('typingLeaderboard') || '[]');
    const history = loadHistory();
    
    if (history.length > 0) {
        const latest = history[0];
        
        leaderboard.push({
            id: Date.now(),
            name: '我',
            cpm: latest.cpm,
            accuracy: latest.accuracy,
            totalChars: latest.totalChars,
            timestamp: Date.now(),
            date: latest.date
        });
        
        if (leaderboard.length > 100) {
            leaderboard = leaderboard.slice(0, 100);
        }
        
        localStorage.setItem('typingLeaderboard', JSON.stringify(leaderboard));
    }
}

function getLeaderboard(period) {
    const leaderboard = JSON.parse(localStorage.getItem('typingLeaderboard') || '[]');
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    let filtered = leaderboard;
    
    if (period === 'daily') {
        filtered = leaderboard.filter(item => now - item.timestamp < dayMs);
    } else if (period === 'weekly') {
        filtered = leaderboard.filter(item => now - item.timestamp < 7 * dayMs);
    }
    
    return filtered.sort((a, b) => b.cpm - a.cpm).slice(0, 20);
}

function updateLeaderboardUI(period) {
    const leaderboard = getLeaderboard(period);
    
    if (leaderboard.length === 0) {
        elements.leaderboardContent.innerHTML = `
            <div class="empty-state">
                <p>暂无排行数据</p>
                <p class="sub-text">完成打字测试后将自动计入排行榜</p>
            </div>
        `;
        return;
    }
    
    elements.leaderboardContent.innerHTML = leaderboard.map((item, index) => `
        <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''}">
            <div class="leaderboard-rank">
                ${index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
            </div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${item.name}</div>
                <div class="leaderboard-date">${item.date}</div>
            </div>
            <div class="leaderboard-stats">
                <div class="leaderboard-cpm">${item.cpm} 字/分</div>
                <div class="leaderboard-accuracy">正确率 ${item.accuracy}%</div>
            </div>
        </div>
    `).join('');
}

function generateMockLeaderboard() {
    const mockNames = ['打字狂人', '键盘侠', '速度之王', '打字达人', '指法大师', '键盘精灵', '打字忍者', '速度达人', '按键高手', '指尖舞者'];
    const leaderboard = JSON.parse(localStorage.getItem('typingLeaderboard') || '[]');
    
    for (let i = 0; i < 10; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
        
        leaderboard.push({
            id: Date.now() + i,
            name: mockNames[i % mockNames.length],
            cpm: Math.floor(Math.random() * 80) + 40,
            accuracy: Math.floor(Math.random() * 15) + 85,
            totalChars: Math.floor(Math.random() * 200) + 100,
            timestamp: timestamp,
            date: new Date(timestamp).toLocaleString('zh-CN')
        });
    }
    
    localStorage.setItem('typingLeaderboard', JSON.stringify(leaderboard));
    
    const activeTab = document.querySelector('.leaderboard-tab-btn.active');
    if (activeTab) {
        updateLeaderboardUI(activeTab.dataset.period);
    }
}

function saveMistakes() {
    const mistakeBook = JSON.parse(localStorage.getItem('typingMistakes') || '{}');
    
    gameState.errorChars.forEach(error => {
        const key = error.target;
        if (!mistakeBook[key]) {
            mistakeBook[key] = {
                char: key,
                count: 0,
                mastered: false,
                correctCount: 0,
                history: []
            };
        }
        mistakeBook[key].count++;
        mistakeBook[key].history.push({
            typed: error.typed,
            timestamp: error.timestamp
        });
    });
    
    localStorage.setItem('typingMistakes', JSON.stringify(mistakeBook));
}

function loadMistakes() {
    return JSON.parse(localStorage.getItem('typingMistakes') || '{}');
}

function updateMistakesUI() {
    const mistakeBook = loadMistakes();
    const mistakes = Object.values(mistakeBook);
    const mastered = mistakes.filter(m => m.mastered).length;
    
    elements.mistakeTotal.textContent = mistakes.length;
    elements.mistakeMastered.textContent = mastered;
    
    if (mistakes.length === 0) {
        elements.mistakesList.innerHTML = `
            <div class="empty-state">
                <p>暂无错题记录</p>
                <p class="sub-text">完成打字测试后，易错字将自动收录到这里</p>
            </div>
        `;
        return;
    }
    
    mistakes.sort((a, b) => b.count - a.count);
    
    elements.mistakesList.innerHTML = mistakes.map(mistake => `
        <div class="mistake-item ${mistake.mastered ? 'mastered' : ''}" data-char="${mistake.char}">
            <div class="mistake-char">${mistake.char}</div>
            <div class="mistake-info">
                <div class="mistake-count">错误 ${mistake.count} 次</div>
                <div class="mistake-history">最近错误: ${mistake.history.length > 0 ? mistake.history[mistake.history.length - 1].typed : '-'}</div>
            </div>
            <div class="mistake-status">
                ${mistake.mastered ? '<span class="status-mastered">已掌握</span>' : '<span class="status-pending">待练习</span>'}
            </div>
        </div>
    `).join('');
}

function startMistakePractice() {
    const mistakeBook = loadMistakes();
    const mistakes = Object.values(mistakeBook).filter(m => !m.mastered);
    
    if (mistakes.length === 0) {
        alert('暂无待练习的错题！');
        return;
    }
    
    mistakePracticeState.mistakes = mistakes;
    mistakePracticeState.currentIndex = 0;
    mistakePracticeState.correctCount = 0;
    mistakePracticeState.wrongCount = 0;
    mistakePracticeState.isActive = true;
    
    updateMistakePracticeStats();
    showNextMistakeChar();
    
    elements.mistakesPracticeModal.classList.add('show');
    elements.mistakePracticeInput.disabled = false;
    elements.mistakePracticeInput.value = '';
    elements.mistakePracticeInput.focus();
}

function updateMistakePracticeStats() {
    elements.mistakePracticeCorrect.textContent = mistakePracticeState.correctCount;
    elements.mistakePracticeWrong.textContent = mistakePracticeState.wrongCount;
    elements.mistakePracticeRemaining.textContent = mistakePracticeState.mistakes.length - mistakePracticeState.currentIndex;
}

function showNextMistakeChar() {
    if (mistakePracticeState.currentIndex < mistakePracticeState.mistakes.length) {
        const current = mistakePracticeState.mistakes[mistakePracticeState.currentIndex];
        elements.mistakePracticeTarget.textContent = current.char;
        elements.mistakePracticeInput.value = '';
        elements.mistakePracticeInput.focus();
    } else {
        endMistakePractice();
    }
}

function endMistakePractice() {
    mistakePracticeState.isActive = false;
    elements.mistakesPracticeModal.classList.remove('show');
    elements.mistakePracticeInput.disabled = true;
    updateMistakesUI();
    
    if (mistakePracticeState.correctCount + mistakePracticeState.wrongCount > 0) {
        alert(`练习完成！正确: ${mistakePracticeState.correctCount}，错误: ${mistakePracticeState.wrongCount}`);
    }
}

function handleMistakePracticeInput(event) {
    if (!mistakePracticeState.isActive) return;
    
    const input = event.target.value;
    const currentMistake = mistakePracticeState.mistakes[mistakePracticeState.currentIndex];
    
    if (input.length >= 1) {
        if (input[0] === currentMistake.char) {
            mistakePracticeState.correctCount++;
            const mistakeBook = loadMistakes();
            if (mistakeBook[currentMistake.char]) {
                mistakeBook[currentMistake.char].correctCount++;
                if (mistakeBook[currentMistake.char].correctCount >= 3) {
                    mistakeBook[currentMistake.char].mastered = true;
                }
                localStorage.setItem('typingMistakes', JSON.stringify(mistakeBook));
            }
        } else {
            mistakePracticeState.wrongCount++;
        }
        
        mistakePracticeState.currentIndex++;
        updateMistakePracticeStats();
        showNextMistakeChar();
    }
}

function clearMistakes() {
    if (confirm('确定要清空所有错题记录吗？此操作不可撤销。')) {
        localStorage.removeItem('typingMistakes');
        updateMistakesUI();
    }
}

function saveAnalysisData() {
    let analysisData = JSON.parse(localStorage.getItem('typingAnalysis') || '{"keystrokeTimes": [], "intervals": [], "mistakes": {}}');
    
    if (gameState.keystrokeTimes.length > 0) {
        analysisData.keystrokeTimes = [...analysisData.keystrokeTimes, ...gameState.keystrokeTimes];
        
        for (let i = 1; i < gameState.keystrokeTimes.length; i++) {
            analysisData.intervals.push(gameState.keystrokeTimes[i]);
        }
    }
    
    gameState.errorChars.forEach(error => {
        const key = `${error.target}→${error.typed}`;
        if (!analysisData.mistakes[key]) {
            analysisData.mistakes[key] = {
                target: error.target,
                typed: error.typed,
                count: 0
            };
        }
        analysisData.mistakes[key].count++;
    });
    
    if (analysisData.keystrokeTimes.length > 1000) {
        analysisData.keystrokeTimes = analysisData.keystrokeTimes.slice(-1000);
    }
    if (analysisData.intervals.length > 1000) {
        analysisData.intervals = analysisData.intervals.slice(-1000);
    }
    
    localStorage.setItem('typingAnalysis', JSON.stringify(analysisData));
}

function loadAnalysisData() {
    return JSON.parse(localStorage.getItem('typingAnalysis') || '{"keystrokeTimes": [], "intervals": [], "mistakes": {}}');
}

function updateAnalysisUI() {
    const analysisData = loadAnalysisData();
    
    if (analysisData.keystrokeTimes.length > 0) {
        const avgKeystroke = Math.round(analysisData.keystrokeTimes.reduce((a, b) => a + b, 0) / analysisData.keystrokeTimes.length);
        const fastestKeystroke = Math.min(...analysisData.keystrokeTimes);
        const slowestKeystroke = Math.max(...analysisData.keystrokeTimes);
        
        elements.avgKeystrokeSpeed.textContent = avgKeystroke;
        elements.fastestKeystroke.textContent = fastestKeystroke;
        elements.slowestKeystroke.textContent = slowestKeystroke;
    } else {
        elements.avgKeystrokeSpeed.textContent = '0';
        elements.fastestKeystroke.textContent = '0';
        elements.slowestKeystroke.textContent = '0';
    }
    
    if (analysisData.intervals.length > 0) {
        const avgInterval = Math.round(analysisData.intervals.reduce((a, b) => a + b, 0) / analysisData.intervals.length);
        const minInterval = Math.min(...analysisData.intervals);
        const maxInterval = Math.max(...analysisData.intervals);
        
        elements.avgInterval.textContent = avgInterval;
        elements.minInterval.textContent = minInterval;
        elements.maxInterval.textContent = maxInterval;
    } else {
        elements.avgInterval.textContent = '0';
        elements.minInterval.textContent = '0';
        elements.maxInterval.textContent = '0';
    }
    
    const mistakes = Object.values(analysisData.mistakes);
    if (mistakes.length > 0) {
        mistakes.sort((a, b) => b.count - a.count);
        elements.analysisMistakes.innerHTML = mistakes.slice(0, 8).map(mistake => `
            <div class="mistake-item analysis">
                <div class="mistake-char">${mistake.target}</div>
                <div class="mistake-info">
                    <div class="mistake-count">打成: ${mistake.typed}</div>
                    <div class="mistake-history">共 ${mistake.count} 次</div>
                </div>
            </div>
        `).join('');
    } else {
        elements.analysisMistakes.innerHTML = `
            <div class="empty-state small">
                <p>暂无错键数据</p>
            </div>
        `;
    }
    
    const history = loadHistory();
    if (history.length > 0) {
        const avgCpm = Math.round(history.reduce((sum, r) => sum + r.cpm, 0) / history.length);
        const avgAccuracy = Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / history.length);
        
        const cpmScore = Math.min(100, avgCpm * 0.8);
        const accuracyScore = avgAccuracy;
        const consistencyScore = Math.min(100, 100 - (history.length > 1 ? Math.abs(history[0].cpm - history[history.length - 1].cpm) : 0));
        
        const compositeScore = Math.round((cpmScore * 0.4 + accuracyScore * 0.4 + consistencyScore * 0.2));
        elements.compositeScore.textContent = compositeScore;
    } else {
        elements.compositeScore.textContent = '0';
    }
}

function startPK() {
    pkState.mode = elements.pkMode.value;
    pkState.timeRemaining = parseInt(elements.pkDuration.value);
    const pkDifficulty = elements.pkDifficulty.value;
    
    pkState.targetText = generateRandomText("all", pkDifficulty);
    pkState.player1 = { currentIndex: 0, correctCount: 0, errorCount: 0, totalTyped: 0 };
    pkState.player2 = { currentIndex: 0, correctCount: 0, errorCount: 0, totalTyped: 0 };
    pkState.isActive = true;
    pkState.startTime = Date.now();
    
    if (pkState.mode === 'local') {
        elements.pkPlayer2Name.textContent = '玩家2';
        elements.pkResultPlayer2Name.textContent = '玩家2';
    } else {
        elements.pkPlayer2Name.textContent = 'AI对手';
        elements.pkResultPlayer2Name.textContent = 'AI对手';
    }
    
    renderTextDisplay(elements.pkTextDisplay, pkState.targetText, 0);
    updatePKStats();
    
    elements.pkInput1.value = '';
    elements.pkInput1.disabled = false;
    elements.pkInput1.focus();
    
    elements.pkStartBtn.disabled = true;
    elements.pkResetBtn.disabled = false;
    
    pkState.timerId = setInterval(() => {
        pkState.timeRemaining--;
        updatePKStats();
        
        if (pkState.timeRemaining <= 0) {
            endPK();
        }
    }, 1000);
    
    if (pkState.mode === 'ai') {
        startAI();
    }
}

function startAI() {
    const aiSpeed = 150 + Math.random() * 100;
    
    pkState.aiInterval = setInterval(() => {
        if (!pkState.isActive || pkState.player2.currentIndex >= pkState.targetText.length) return;
        
        const nextChar = pkState.targetText[pkState.player2.currentIndex];
        const isCorrect = Math.random() > 0.05;
        
        if (isCorrect) {
            pkState.player2.currentIndex++;
            pkState.player2.correctCount++;
        } else {
            pkState.player2.errorCount++;
        }
        pkState.player2.totalTyped++;
        
        updatePKStats();
        
        if (pkState.player2.currentIndex >= pkState.targetText.length) {
            endPK();
        }
    }, aiSpeed);
}

function updatePKStats() {
    const elapsedTime = pkState.startTime ? (Date.now() - pkState.startTime) / 1000 / 60 : 0;
    const minutes = elapsedTime || 0.01;
    
    const player1Cpm = Math.round(pkState.player1.correctCount / minutes);
    const player2Cpm = Math.round(pkState.player2.correctCount / minutes);
    
    elements.pkPlayer1Score.textContent = pkState.player1.currentIndex;
    elements.pkPlayer1Cpm.textContent = player1Cpm;
    elements.pkPlayer1Accuracy.textContent = pkState.player1.totalTyped > 0 
        ? Math.round((pkState.player1.correctCount / pkState.player1.totalTyped) * 100) 
        : 100;
    elements.pkProgress1.style.width = Math.round((pkState.player1.currentIndex / pkState.targetText.length) * 100) + '%';
    
    elements.pkPlayer2Score.textContent = pkState.player2.currentIndex;
    elements.pkPlayer2Cpm.textContent = player2Cpm;
    elements.pkPlayer2Accuracy.textContent = pkState.player2.totalTyped > 0 
        ? Math.round((pkState.player2.correctCount / pkState.player2.totalTyped) * 100) 
        : 100;
    elements.pkProgress2.style.width = Math.round((pkState.player2.currentIndex / pkState.targetText.length) * 100) + '%';
    
    if (pkState.mode === 'ai') {
        elements.pkAiProgress.textContent = `AI进度: ${pkState.player2.currentIndex}/${pkState.targetText.length}`;
    }
}

function handlePKInput(event) {
    if (!pkState.isActive) return;
    
    const inputValue = event.target.value;
    const expectedLength = pkState.player1.currentIndex;
    
    if (inputValue.length > expectedLength) {
        const newCharsStart = expectedLength;
        const newChars = inputValue.substring(newCharsStart);
        
        for (let i = 0; i < newChars.length; i++) {
            const typedChar = newChars[i];
            const targetChar = pkState.targetText[pkState.player1.currentIndex];
            
            pkState.player1.totalTyped++;
            
            if (typedChar === targetChar) {
                pkState.player1.correctCount++;
                pkState.player1.currentIndex++;
                
                const currentChar = elements.pkTextDisplay.querySelector(`.char[data-index="${pkState.player1.currentIndex - 1}"]`);
                if (currentChar) {
                    currentChar.classList.remove('current');
                    currentChar.classList.add('correct');
                }
                
                const nextChar = elements.pkTextDisplay.querySelector(`.char[data-index="${pkState.player1.currentIndex}"]`);
                if (nextChar) {
                    nextChar.classList.remove('remaining');
                    nextChar.classList.add('current');
                }
            } else {
                pkState.player1.errorCount++;
                
                const currentChar = elements.pkTextDisplay.querySelector(`.char[data-index="${pkState.player1.currentIndex}"]`);
                if (currentChar) {
                    currentChar.classList.remove('current');
                    currentChar.classList.add('incorrect');
                    setTimeout(() => {
                        currentChar.classList.remove('incorrect');
                        currentChar.classList.add('current');
                    }, 200);
                }
            }
            
            updatePKStats();
            
            if (pkState.player1.currentIndex >= pkState.targetText.length) {
                endPK();
                return;
            }
        }
    }
}

function endPK() {
    if (!pkState.isActive) return;
    
    pkState.isActive = false;
    clearInterval(pkState.timerId);
    clearInterval(pkState.aiInterval);
    
    elements.pkInput1.disabled = true;
    elements.pkStartBtn.disabled = false;
    elements.pkResetBtn.disabled = true;
    
    const elapsedTime = pkState.startTime ? (Date.now() - pkState.startTime) / 1000 / 60 : 0;
    const minutes = elapsedTime || 0.01;
    
    const player1Cpm = Math.round(pkState.player1.correctCount / minutes);
    const player2Cpm = Math.round(pkState.player2.correctCount / minutes);
    
    elements.pkResultPlayer1.textContent = `${player1Cpm} 字/分 (${pkState.player1.currentIndex}字)`;
    elements.pkResultPlayer2.textContent = `${player2Cpm} 字/分 (${pkState.player2.currentIndex}字)`;
    
    if (pkState.player1.currentIndex > pkState.player2.currentIndex) {
        elements.pkResultWinner.textContent = '🎉 玩家获胜！';
    } else if (pkState.player1.currentIndex < pkState.player2.currentIndex) {
        elements.pkResultWinner.textContent = '😢 对手获胜！';
    } else {
        elements.pkResultWinner.textContent = '🤝 平局！';
    }
    
    elements.pkResultModal.classList.add('show');
}

function resetPK() {
    pkState.isActive = false;
    clearInterval(pkState.timerId);
    clearInterval(pkState.aiInterval);
    
    pkState.timeRemaining = parseInt(elements.pkDuration.value);
    pkState.player1 = { currentIndex: 0, correctCount: 0, errorCount: 0, totalTyped: 0 };
    pkState.player2 = { currentIndex: 0, correctCount: 0, errorCount: 0, totalTyped: 0 };
    
    renderTextDisplay(elements.pkTextDisplay, pkState.targetText || generateRandomText("all", "normal"), 0);
    updatePKStats();
    
    elements.pkInput1.value = '';
    elements.pkInput1.disabled = true;
    
    elements.pkStartBtn.disabled = false;
    elements.pkResetBtn.disabled = true;
    
    elements.pkResultModal.classList.remove('show');
}

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
    
    elements.practiceStartBtn.addEventListener('click', startPractice);
    elements.practiceResetBtn.addEventListener('click', resetPractice);
    elements.practiceNextBtn.addEventListener('click', nextPracticeText);
    elements.practiceInputArea.addEventListener('input', handlePracticeInput);
    
    elements.leaderboardTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.leaderboardTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateLeaderboardUI(btn.dataset.period);
        });
    });
    elements.generateMockLeaderboard.addEventListener('click', generateMockLeaderboard);
    
    elements.pkStartBtn.addEventListener('click', startPK);
    elements.pkResetBtn.addEventListener('click', resetPK);
    elements.pkInput1.addEventListener('input', handlePKInput);
    elements.pkRestartBtn.addEventListener('click', () => {
        elements.pkResultModal.classList.remove('show');
        resetPK();
    });
    elements.pkCloseBtn.addEventListener('click', () => {
        elements.pkResultModal.classList.remove('show');
    });
    
    elements.practiceMistakesBtn.addEventListener('click', startMistakePractice);
    elements.clearMistakesBtn.addEventListener('click', clearMistakes);
    elements.mistakePracticeInput.addEventListener('input', handleMistakePracticeInput);
    elements.mistakePracticeCloseBtn.addEventListener('click', endMistakePractice);
    
    elements.refreshAnalysisBtn.addEventListener('click', updateAnalysisUI);
}

function init() {
    initElements();
    gameState.targetText = generateRandomText();
    renderTextDisplay(elements.textDisplay, gameState.targetText, gameState.currentIndex);
    updateStats();
    updateTimeDisplay();
    updateHistoryUI();
    initEventListeners();
    drawSpeedChart();
    updateRankUI();
    updateMistakesUI();
    updateAnalysisUI();
}

document.addEventListener('DOMContentLoaded', init);
