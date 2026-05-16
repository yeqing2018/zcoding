const BASE_COLORS = [
    { name: '红色', value: '#FF0000' },
    { name: '黄色', value: '#FFFF00' },
    { name: '蓝色', value: '#0000FF' },
    { name: '绿色', value: '#00FF00' },
    { name: '黑色', value: '#000000' },
    { name: '白色', value: '#FFFFFF' },
    { name: '橙色', value: '#FFA500' },
    { name: '紫色', value: '#800080' },
    { name: '粉色', value: '#FFC0CB' },
    { name: '棕色', value: '#A52A2A' },
    { name: '灰色', value: '#808080' },
    { name: '青色', value: '#00FFFF' },
    { name: '深蓝', value: '#00008B' },
    { name: '深绿', value: '#006400' },
    { name: '深红', value: '#8B0000' },
    { name: '金色', value: '#FFD700' },
    { name: '银色', value: '#C0C0C0' },
    { name: '靛蓝', value: '#4B0082' }
];

const GAME_MODES = {
    BASIC: 'basic',
    COMBO: 'combo',
    MEMORY: 'memory'
};

const MODE_NAMES = {
    basic: '基础',
    combo: '组合',
    memory: '记忆'
};

const QUESTIONS_PER_LEVEL = 5;
const MAX_LEVEL = 30;
const LEVEL_TIME = 45;
const MEMORY_DISPLAY_TIME = 3;

const STAGE_CONFIG = [
    { stage: 1, levels: [1, 5], modes: [GAME_MODES.BASIC], choices: 6, similarity: 0.9 },
    { stage: 2, levels: [6, 10], modes: [GAME_MODES.BASIC, GAME_MODES.COMBO], choices: 7, similarity: 0.85 },
    { stage: 3, levels: [11, 15], modes: [GAME_MODES.BASIC, GAME_MODES.MEMORY], choices: 7, similarity: 0.8 },
    { stage: 4, levels: [16, 20], modes: [GAME_MODES.COMBO, GAME_MODES.MEMORY], choices: 8, similarity: 0.75 },
    { stage: 5, levels: [21, 25], modes: [GAME_MODES.BASIC, GAME_MODES.COMBO, GAME_MODES.MEMORY], choices: 8, similarity: 0.72 },
    { stage: 6, levels: [26, 30], modes: [GAME_MODES.BASIC, GAME_MODES.COMBO, GAME_MODES.MEMORY], choices: 8, similarity: 0.7 }
];

const SHAPES = ['square', 'circle', 'triangle'];

let gameState = {
    score: 0,
    level: 1,
    stage: 1,
    questionsAnswered: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    currentMode: GAME_MODES.BASIC,
    currentTargets: [],
    currentChoices: [],
    selectedChoices: [],
    isPlaying: false,
    isMemoryPhase: false,
    isQuestionAnswered: false,
    timeLeft: LEVEL_TIME,
    timerInterval: null,
    startTime: 0,
    hintsUsed: 0,
    currentShape: 'square',
    useIrregularLayout: false
};

let gameStats = {
    totalGames: 0,
    bestAccuracy: 0,
    bestTime: null,
    totalHints: 0
};

const targetContainer = document.getElementById('targetContainer');
const targetColorNameEl = document.getElementById('targetColorName');
const choicesEl = document.getElementById('choices');
const choicesTitleEl = document.getElementById('choicesTitle');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const stageEl = document.getElementById('stage');
const gameModeEl = document.getElementById('gameMode');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const gameHintEl = document.getElementById('gameHint');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const selectedIndicator = document.getElementById('selectedIndicator');
const selectedCountEl = document.getElementById('selectedCount');
const memoryTimerEl = document.getElementById('memoryTimer');
const memoryCountdownEl = document.getElementById('memoryCountdown');
const effectsContainer = document.getElementById('effectsContainer');
const simpleThemeBtn = document.getElementById('simpleTheme');
const dreamyThemeBtn = document.getElementById('dreamyTheme');
const statsBtn = document.getElementById('statsBtn');
const rankingBtn = document.getElementById('rankingBtn');
const statsModal = document.getElementById('statsModal');
const rankingModal = document.getElementById('rankingModal');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const finalAccuracyEl = document.getElementById('finalAccuracy');
const finalTimeEl = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgainBtn');
const totalGamesEl = document.getElementById('totalGames');
const bestAccuracyEl = document.getElementById('bestAccuracy');
const bestTimeEl = document.getElementById('bestTime');
const totalHintsEl = document.getElementById('totalHints');
const rankingListEl = document.getElementById('rankingList');
const resetRankingBtn = document.getElementById('resetRankingBtn');

function init() {
    loadStats();
    setupEventListeners();
    updateStatsDisplay();
    loadTheme();
}

function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    hintBtn.addEventListener('click', useHint);
    playAgainBtn.addEventListener('click', () => {
        hideModal(gameOverModal);
        resetGame();
        startGame();
    });

    simpleThemeBtn.addEventListener('click', () => setTheme('simple'));
    dreamyThemeBtn.addEventListener('click', () => setTheme('dreamy'));
    statsBtn.addEventListener('click', showStatsModal);
    rankingBtn.addEventListener('click', showRankingModal);

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal);
        });
    });

    resetRankingBtn.addEventListener('click', resetRanking);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
}

function setTheme(theme) {
    document.body.classList.remove('theme-dreamy');
    if (theme === 'dreamy') {
        document.body.classList.add('theme-dreamy');
    }
    simpleThemeBtn.classList.toggle('active', theme === 'simple');
    dreamyThemeBtn.classList.toggle('active', theme === 'dreamy');
    localStorage.setItem('colorGameTheme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('colorGameTheme') || 'simple';
    setTheme(savedTheme);
}

function loadStats() {
    const saved = localStorage.getItem('colorGameStats');
    if (saved) {
        gameStats = JSON.parse(saved);
    }
}

function saveStats() {
    localStorage.setItem('colorGameStats', JSON.stringify(gameStats));
}

function getRanking() {
    const saved = localStorage.getItem('colorGameRanking');
    return saved ? JSON.parse(saved) : [];
}

function saveToRanking(score, level, accuracy, time) {
    const ranking = getRanking();
    ranking.push({
        score,
        level,
        accuracy,
        time,
        date: new Date().toLocaleDateString('zh-CN')
    });
    ranking.sort((a, b) => b.score - a.score);
    const top10 = ranking.slice(0, 10);
    localStorage.setItem('colorGameRanking', JSON.stringify(top10));
}

function resetRanking() {
    if (confirm('确定要重置排行榜吗？')) {
        localStorage.removeItem('colorGameRanking');
        showRankingModal();
    }
}

function updateStatsDisplay() {
    totalGamesEl.textContent = gameStats.totalGames;
    bestAccuracyEl.textContent = gameStats.bestAccuracy + '%';
    bestTimeEl.textContent = gameStats.bestTime ? gameStats.bestTime + 's' : '--';
    totalHintsEl.textContent = gameStats.totalHints;
}

function showStatsModal() {
    updateStatsDisplay();
    showModal(statsModal);
}

function showRankingModal() {
    const ranking = getRanking();
    if (ranking.length === 0) {
        rankingListEl.innerHTML = '<p class="empty-ranking">暂无记录</p>';
    } else {
        rankingListEl.innerHTML = ranking.map((item, index) => `
            <div class="ranking-item ${index < 3 ? 'top-' + (index + 1) : ''}">
                <span class="rank-position">${index + 1}</span>
                <span class="rank-info">第${item.level}关 · ${item.accuracy}% · ${item.date}</span>
                <span class="rank-score">${item.score}分</span>
            </div>
        `).join('');
    }
    showModal(rankingModal);
}

function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function generateSimilarColor(baseColor, similarity) {
    const rgb = hexToRgb(baseColor.value);
    if (!rgb) return baseColor;

    const maxDiff = Math.round(255 * (1 - similarity));
    const variation = () => Math.floor(Math.random() * maxDiff * 2) - maxDiff;

    return {
        name: baseColor.name + ' (相似)',
        value: rgbToHex(rgb.r + variation(), rgb.g + variation(), rgb.b + variation())
    };
}

function generateGradientColors(baseColor, count) {
    const rgb = hexToRgb(baseColor.value);
    if (!rgb) return [];

    const gradients = [];
    for (let i = 1; i <= count; i++) {
        const factor = 0.3 + (i / (count + 1)) * 0.4;
        gradients.push({
            name: baseColor.name + ' (渐变)',
            value: rgbToHex(
                rgb.r + (255 - rgb.r) * factor,
                rgb.g + (255 - rgb.g) * factor,
                rgb.b + (255 - rgb.b) * factor
            )
        });
    }
    return gradients;
}

function getStageConfig(level) {
    for (const config of STAGE_CONFIG) {
        if (level >= config.levels[0] && level <= config.levels[1]) {
            return config;
        }
    }
    return STAGE_CONFIG[STAGE_CONFIG.length - 1];
}

function selectGameMode(level) {
    const config = getStageConfig(level);
    return config.modes[Math.floor(Math.random() * config.modes.length)];
}

function generateQuestion() {
    const config = getStageConfig(gameState.level);
    gameState.currentMode = selectGameMode(gameState.level);
    gameState.stage = config.stage;
    gameState.useIrregularLayout = gameState.level > 10;
    gameState.isQuestionAnswered = false;

    gameState.currentShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    const shuffled = [...BASE_COLORS].sort(() => Math.random() - 0.5);
    const targetCount = gameState.currentMode === GAME_MODES.COMBO ? 2 : 1;
    gameState.currentTargets = shuffled.slice(0, targetCount);

    let allChoices = [...gameState.currentTargets];

    const similarCount = Math.floor(config.choices * 0.4);
    const gradientCount = Math.floor(config.choices * 0.3);
    const randomCount = config.choices - targetCount - similarCount - gradientCount;

    gameState.currentTargets.forEach(target => {
        for (let i = 0; i < Math.ceil(similarCount / targetCount); i++) {
            allChoices.push(generateSimilarColor(target, config.similarity));
        }
        const gradients = generateGradientColors(target, Math.ceil(gradientCount / targetCount));
        allChoices.push(...gradients);
    });

    const remainingColors = shuffled.slice(targetCount);
    allChoices.push(...remainingColors.slice(0, randomCount));

    gameState.currentChoices = allChoices
        .filter((c, i, arr) => arr.findIndex(x => x.value === c.value) === i)
        .sort(() => Math.random() - 0.5);

    renderTarget();
    renderChoices();
    updateModeUI();
}

function updateModeUI() {
    gameModeEl.textContent = MODE_NAMES[gameState.currentMode];
    stageEl.textContent = gameState.stage;

    if (gameState.currentMode === GAME_MODES.COMBO) {
        selectedIndicator.classList.remove('hidden');
        choicesTitleEl.textContent = '选择2个匹配的颜色';
        gameHintEl.textContent = '组合模式：点击选择2个与目标匹配的颜色';
    } else if (gameState.currentMode === GAME_MODES.MEMORY) {
        selectedIndicator.classList.add('hidden');
        choicesTitleEl.textContent = '凭记忆选择匹配的颜色';
        gameHintEl.textContent = '记忆模式：记住目标颜色，3秒后隐藏';
    } else {
        selectedIndicator.classList.add('hidden');
        choicesTitleEl.textContent = '选择匹配的颜色';
        gameHintEl.textContent = '基础模式：点击与目标匹配的颜色';
    }

    if (gameState.useIrregularLayout) {
        choicesEl.classList.add('irregular');
    } else {
        choicesEl.classList.remove('irregular');
    }
}

function renderTarget() {
    targetContainer.innerHTML = '';
    targetContainer.classList.remove('memory-hidden');

    gameState.currentTargets.forEach(target => {
        const box = createColorBox(target, gameState.currentShape, false);
        targetContainer.appendChild(box);
    });

    targetColorNameEl.textContent = gameState.currentTargets.map(t => t.name).join(' + ');

    if (gameState.currentMode === GAME_MODES.MEMORY) {
        startMemoryPhase();
    }
}

function createColorBox(color, shape, isChoice = false) {
    const box = document.createElement('div');
    box.className = `color-box shape-${shape}`;
    
    if (shape === 'triangle') {
        box.style.borderBottomColor = color.value;
    } else {
        box.style.backgroundColor = color.value;
    }

    if (isChoice && gameState.useIrregularLayout) {
        const rotation = (Math.random() - 0.5) * 20;
        box.style.setProperty('--rotation', rotation + 'deg');
    }

    return box;
}

function startMemoryPhase() {
    gameState.isMemoryPhase = true;
    let count = MEMORY_DISPLAY_TIME;
    memoryTimerEl.classList.remove('hidden');
    memoryCountdownEl.textContent = count;

    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            memoryCountdownEl.textContent = count;
            memoryCountdownEl.style.animation = 'none';
            setTimeout(() => {
                memoryCountdownEl.style.animation = 'countdownPulse 1s ease-in-out';
            }, 10);
        } else {
            clearInterval(countInterval);
            memoryTimerEl.classList.add('hidden');
            targetContainer.classList.add('memory-hidden');
            targetColorNameEl.textContent = '???';
            gameState.isMemoryPhase = false;
            startTimer();
        }
    }, 1000);
}

function renderChoices() {
    choicesEl.innerHTML = '';
    gameState.selectedChoices = [];
    selectedCountEl.textContent = '0';

    gameState.currentChoices.forEach((color, index) => {
        const box = document.createElement('div');
        box.className = 'choice-box';
        box.style.backgroundColor = color.value;
        box.dataset.index = index;
        box.dataset.value = color.value;

        if (gameState.useIrregularLayout) {
            const rotation = (Math.random() - 0.5) * 20;
            box.style.setProperty('--rotation', rotation + 'deg');
        }

        box.addEventListener('click', () => handleChoice(index));
        choicesEl.appendChild(box);
    });
}

function handleChoice(index) {
    if (!gameState.isPlaying || gameState.isMemoryPhase || gameState.isQuestionAnswered) return;

    const color = gameState.currentChoices[index];
    const choiceBox = choicesEl.querySelector(`[data-index="${index}"]`);

    if (gameState.currentMode === GAME_MODES.COMBO) {
        if (gameState.selectedChoices.includes(index)) {
            gameState.selectedChoices = gameState.selectedChoices.filter(i => i !== index);
            choiceBox.classList.remove('selected');
        } else {
            gameState.selectedChoices.push(index);
            choiceBox.classList.add('selected');
        }
        selectedCountEl.textContent = gameState.selectedChoices.length;

        if (gameState.selectedChoices.length === 2) {
            checkComboAnswer();
        }
        return;
    }

    checkSingleAnswer(index);
}

function checkSingleAnswer(index) {
    stopTimer();
    gameState.isQuestionAnswered = true;
    gameState.totalQuestions++;

    const selectedColor = gameState.currentChoices[index];
    const targetColor = gameState.currentTargets[0];
    const isCorrect = selectedColor.value.toLowerCase() === targetColor.value.toLowerCase();

    const choiceBoxes = document.querySelectorAll('.choice-box');
    choiceBoxes.forEach((box, i) => {
        const boxColor = gameState.currentChoices[i];
        if (boxColor.value.toLowerCase() === targetColor.value.toLowerCase()) {
            box.classList.add('correct');
        } else if (i === index && !isCorrect) {
            box.classList.add('wrong');
        }
        box.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(targetColor.name);
    }
}

function checkComboAnswer() {
    stopTimer();
    gameState.isQuestionAnswered = true;
    gameState.totalQuestions++;

    const selectedValues = gameState.selectedChoices.map(i => 
        gameState.currentChoices[i].value.toLowerCase()
    );
    const targetValues = gameState.currentTargets.map(t => t.value.toLowerCase());

    const allSelected = targetValues.every(t => selectedValues.includes(t));
    const noExtra = selectedValues.every(s => targetValues.includes(s));
    const isCorrect = allSelected && noExtra;

    const choiceBoxes = document.querySelectorAll('.choice-box');
    choiceBoxes.forEach((box, i) => {
        const boxColor = gameState.currentChoices[i];
        if (targetValues.includes(boxColor.value.toLowerCase())) {
            box.classList.add('correct');
        } else if (gameState.selectedChoices.includes(i) && !isCorrect) {
            box.classList.add('wrong');
        }
        box.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        handleCorrectAnswer(20);
    } else {
        const targetNames = gameState.currentTargets.map(t => t.name).join('、');
        handleWrongAnswer(targetNames);
    }
}

function handleCorrectAnswer(basePoints = 10) {
    gameState.correctAnswers++;
    const timeBonus = Math.floor(gameState.timeLeft * 2);
    const levelBonus = gameState.level * 5;
    const modeBonus = gameState.currentMode === GAME_MODES.MEMORY ? 15 : 
                      gameState.currentMode === GAME_MODES.COMBO ? 10 : 0;
    const points = basePoints + timeBonus + levelBonus + modeBonus;
    
    gameState.score += points;
    showMessage(`答对了！+${points}分`, 'success');
    playSuccessEffect();
    createFireworkEffect();
    createColorSplash();

    proceedToNext();
}

function handleWrongAnswer(correctAnswer) {
    showMessage(`答错了！正确答案是：${correctAnswer}`, 'error');
    playErrorSound();

    proceedToNext();
}

function proceedToNext() {
    gameState.questionsAnswered++;
    updateStats();

    setTimeout(() => {
        if (gameState.questionsAnswered >= QUESTIONS_PER_LEVEL) {
            if (gameState.level >= MAX_LEVEL) {
                gameOver();
            } else {
                levelUp();
            }
        } else {
            generateQuestion();
            if (gameState.currentMode !== GAME_MODES.MEMORY) {
                startTimer();
            }
        }
    }, 2000);
}

function levelUp() {
    gameState.level++;
    gameState.questionsAnswered = 0;
    gameState.timeLeft = LEVEL_TIME;

    showMessage(`恭喜！进入第 ${gameState.level} 关！`, 'info');
    updateStats();

    setTimeout(() => {
        generateQuestion();
        if (gameState.currentMode !== GAME_MODES.MEMORY) {
            startTimer();
        }
    }, 1500);
}

function startGame() {
    gameState = {
        score: 0,
        level: 1,
        stage: 1,
        questionsAnswered: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        currentMode: GAME_MODES.BASIC,
        currentTargets: [],
        currentChoices: [],
        selectedChoices: [],
        isPlaying: true,
        isMemoryPhase: false,
        isQuestionAnswered: false,
        timeLeft: LEVEL_TIME,
        timerInterval: null,
        startTime: Date.now(),
        hintsUsed: 0,
        currentShape: 'square',
        useIrregularLayout: false
    };

    startBtn.disabled = true;
    hintBtn.disabled = false;
    messageEl.textContent = '';
    messageEl.className = 'message';

    updateStats();
    generateQuestion();
    if (gameState.currentMode !== GAME_MODES.MEMORY) {
        startTimer();
    }
}

function resetGame() {
    stopTimer();
    
    gameState = {
        score: 0,
        level: 1,
        stage: 1,
        questionsAnswered: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        currentMode: GAME_MODES.BASIC,
        currentTargets: [],
        currentChoices: [],
        selectedChoices: [],
        isPlaying: false,
        isMemoryPhase: false,
        isQuestionAnswered: false,
        timeLeft: LEVEL_TIME,
        timerInterval: null,
        startTime: 0,
        hintsUsed: 0,
        currentShape: 'square',
        useIrregularLayout: false
    };

    targetContainer.innerHTML = '';
    targetColorNameEl.textContent = '请开始游戏';
    choicesEl.innerHTML = '';
    choicesEl.classList.remove('irregular');
    messageEl.textContent = '';
    messageEl.className = 'message';
    gameHintEl.textContent = '点击开始游戏';
    startBtn.disabled = false;
    hintBtn.disabled = true;
    selectedIndicator.classList.add('hidden');
    timerEl.textContent = LEVEL_TIME + 's';
    timerEl.classList.remove('warning');
    gameModeEl.textContent = '基础';
    stageEl.textContent = '1';

    updateStats();
}

function startTimer() {
    gameState.timeLeft = LEVEL_TIME;
    timerEl.textContent = gameState.timeLeft + 's';
    timerEl.classList.remove('warning');

    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerEl.textContent = gameState.timeLeft + 's';

        if (gameState.timeLeft <= 10) {
            timerEl.classList.add('warning');
        }

        if (gameState.timeLeft <= 0) {
            stopTimer();
            timeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    timerEl.classList.remove('warning');
}

function timeUp() {
    gameState.isQuestionAnswered = true;
    gameState.totalQuestions++;
    const targetNames = gameState.currentTargets.map(t => t.name).join('、');

    const choiceBoxes = document.querySelectorAll('.choice-box');
    choiceBoxes.forEach((box, i) => {
        const boxColor = gameState.currentChoices[i];
        if (gameState.currentTargets.some(t => t.value.toLowerCase() === boxColor.value.toLowerCase())) {
            box.classList.add('correct');
        }
        box.style.pointerEvents = 'none';
    });

    showMessage(`时间到！正确答案是：${targetNames}`, 'error');
    playErrorSound();

    proceedToNext();
}

function gameOver() {
    gameState.isPlaying = false;
    stopTimer();

    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const accuracy = gameState.totalQuestions > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) 
        : 0;

    finalScoreEl.textContent = gameState.score;
    finalLevelEl.textContent = gameState.level;
    finalAccuracyEl.textContent = accuracy + '%';
    finalTimeEl.textContent = totalTime + 's';

    gameStats.totalGames++;
    gameStats.totalHints += gameState.hintsUsed;
    if (accuracy > gameStats.bestAccuracy) {
        gameStats.bestAccuracy = accuracy;
    }
    if (gameState.level >= MAX_LEVEL) {
        if (!gameStats.bestTime || totalTime < gameStats.bestTime) {
            gameStats.bestTime = totalTime;
        }
    }
    saveStats();

    saveToRanking(gameState.score, gameState.level, accuracy, totalTime);

    showModal(gameOverModal);
    startBtn.disabled = false;
    hintBtn.disabled = true;
}

function useHint() {
    if (!gameState.isPlaying || gameState.isMemoryPhase) return;
    if (gameState.hintsUsed >= 3) {
        showMessage('提示次数已用完！', 'error');
        return;
    }

    gameState.hintsUsed++;
    const correctIndexes = [];

    gameState.currentChoices.forEach((color, index) => {
        if (gameState.currentTargets.some(t => t.value.toLowerCase() === color.value.toLowerCase())) {
            correctIndexes.push(index);
        }
    });

    if (correctIndexes.length > 0) {
        const randomIndex = correctIndexes[Math.floor(Math.random() * correctIndexes.length)];
        const box = choicesEl.querySelector(`[data-index="${randomIndex}"]`);
        if (box) {
            box.classList.add('hint');
            setTimeout(() => box.classList.remove('hint'), 2000);
        }
    }

    showMessage(`提示已使用 (${gameState.hintsUsed}/3)`, 'info');
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function updateStats() {
    scoreEl.textContent = gameState.score;
    levelEl.textContent = `${gameState.level}/${MAX_LEVEL}`;
    stageEl.textContent = gameState.stage;
    gameModeEl.textContent = MODE_NAMES[gameState.currentMode];
}

function playSuccessEffect() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
    }
}

function playErrorSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
    }
}

function createFireworkEffect() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#a8d8ea'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 30; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        firework.style.left = centerX + 'px';
        firework.style.top = centerY + 'px';

        const angle = (Math.PI * 2 / 30) * i;
        const distance = 100 + Math.random() * 150;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        firework.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 500,
            easing: 'ease-out'
        });

        effectsContainer.appendChild(firework);
        setTimeout(() => firework.remove(), 1500);
    }
}

function createColorSplash() {
    const targetColor = gameState.currentTargets[0]?.value || '#667eea';
    const splash = document.createElement('div');
    splash.className = 'color-splash';
    splash.style.backgroundColor = targetColor;
    splash.style.width = '100px';
    splash.style.height = '100px';
    splash.style.left = '50%';
    splash.style.top = '50%';
    splash.style.transform = 'translate(-50%, -50%)';

    effectsContainer.appendChild(splash);
    setTimeout(() => splash.remove(), 800);
}

document.addEventListener('DOMContentLoaded', init);
