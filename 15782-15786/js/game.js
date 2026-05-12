const themes = {
    animals: {
        name: '🐶 动物',
        icons: ['🐶', '🐱', '🐼', '🦊', '🐨', '🐯', '🦁', '🐸', '🐷', '🐰', '🐻', '🐵']
    },
    fruits: {
        name: '🍎 水果',
        icons: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🍌', '🥝', '🍉', '🥭', '🍍']
    },
    emojis: {
        name: '😀 表情',
        icons: ['😀', '😎', '🥳', '😍', '🤩', '😜', '😊', '🤗', '😇', '🤔', '😴', '🥰']
    }
};

const levels = [
    { id: 1, pairs: 3, cols: 3, difficulty: 'easy', name: '入门', theme: 'animals' },
    { id: 2, pairs: 4, cols: 4, difficulty: 'easy', name: '简单', theme: 'animals' },
    { id: 3, pairs: 5, cols: 4, difficulty: 'medium', name: '普通', theme: 'fruits' },
    { id: 4, pairs: 6, cols: 4, difficulty: 'medium', name: '进阶', theme: 'fruits' },
    { id: 5, pairs: 7, cols: 4, difficulty: 'hard', name: '困难', theme: 'emojis' },
    { id: 6, pairs: 8, cols: 4, difficulty: 'hard', name: '专家', theme: 'emojis' },
    { id: 7, pairs: 9, cols: 6, difficulty: 'hard', name: '大师', theme: 'animals' },
    { id: 8, pairs: 10, cols: 5, difficulty: 'hard', name: '宗师', theme: 'fruits' },
    { id: 9, pairs: 12, cols: 6, difficulty: 'hard', name: '传说', theme: 'emojis' }
];

const difficultyMultipliers = {
    easy: { timeFactor: 1, moveFactor: 1 },
    medium: { timeFactor: 0.8, moveFactor: 0.85 },
    hard: { timeFactor: 0.7, moveFactor: 0.75 }
};

const STORAGE_KEYS = {
    PLAYER_NAME: 'memory_game_player_name',
    PLAYER_COINS: 'memory_game_coins',
    LEVEL_PROGRESS: 'memory_game_level_progress',
    SCORE_BOARD: 'memory_game_score_board',
    STARS_BOARD: 'memory_game_stars_board',
    SPEED_BOARD: 'memory_game_speed_board'
};

let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    winTimeout: null,
    mismatchTimeout: null,
    isProcessing: false,
    gameStarted: false,
    currentTheme: 'animals',
    currentLevel: 1,
    gameMode: 'level',
    freeModeConfig: { pairs: 4, cols: 4, theme: 'animals' }
};

let playerData = {
    name: '玩家',
    coins: 0,
    levelProgress: {}
};

let leaderboardData = {
    score: [],
    stars: [],
    speed: []
};

const screens = {
    home: document.getElementById('homeScreen'),
    levelSelect: document.getElementById('levelScreen'),
    game: document.getElementById('gameScreen'),
    leaderboard: document.getElementById('leaderboardScreen'),
    freeMode: document.getElementById('freeModeScreen')
};

const ui = {
    gameBoard: document.getElementById('gameBoard'),
    freeGameBoard: document.getElementById('freeGameBoard'),
    movesDisplay: document.getElementById('moves'),
    timerDisplay: document.getElementById('timer'),
    matchesDisplay: document.getElementById('matches'),
    totalPairsDisplay: document.getElementById('totalPairs'),
    freeMovesDisplay: document.getElementById('freeMoves'),
    freeTimerDisplay: document.getElementById('freeTimer'),
    freeMatchesDisplay: document.getElementById('freeMatches'),
    freeTotalPairsDisplay: document.getElementById('freeTotalPairs'),
    homePlayerName: document.getElementById('homePlayerName'),
    playerCoins: document.getElementById('playerCoins'),
    totalStars: document.getElementById('totalStars'),
    starFilled: document.getElementById('starFilled'),
    levelBadge: document.getElementById('currentLevelBadge'),
    themeBadge: document.getElementById('currentThemeBadge'),
    levelGrid: document.getElementById('levelGrid'),
    podiumArea: document.getElementById('podiumArea'),
    leaderboardList: document.getElementById('leaderboardList'),
    resultStars: document.getElementById('resultStars'),
    rewardItems: document.getElementById('rewardItems'),
    finalMoves: document.getElementById('finalMoves'),
    finalTime: document.getElementById('finalTime'),
    playerNameInput: document.getElementById('playerNameInput')
};

const modals = {
    win: document.getElementById('winModal'),
    name: document.getElementById('nameModal'),
    locked: document.getElementById('levelLockedModal')
};

function loadFromStorage() {
    const savedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    if (savedName) playerData.name = savedName;
    
    const savedCoins = localStorage.getItem(STORAGE_KEYS.PLAYER_COINS);
    if (savedCoins) playerData.coins = parseInt(savedCoins);
    
    const savedProgress = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
    if (savedProgress) playerData.levelProgress = JSON.parse(savedProgress);
    
    const scoreBoard = localStorage.getItem(STORAGE_KEYS.SCORE_BOARD);
    if (scoreBoard) leaderboardData.score = JSON.parse(scoreBoard);
    
    const starsBoard = localStorage.getItem(STORAGE_KEYS.STARS_BOARD);
    if (starsBoard) leaderboardData.stars = JSON.parse(starsBoard);
    
    const speedBoard = localStorage.getItem(STORAGE_KEYS.SPEED_BOARD);
    if (speedBoard) leaderboardData.speed = JSON.parse(speedBoard);
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, playerData.name);
    localStorage.setItem(STORAGE_KEYS.PLAYER_COINS, playerData.coins.toString());
    localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(playerData.levelProgress));
    localStorage.setItem(STORAGE_KEYS.SCORE_BOARD, JSON.stringify(leaderboardData.score));
    localStorage.setItem(STORAGE_KEYS.STARS_BOARD, JSON.stringify(leaderboardData.stars));
    localStorage.setItem(STORAGE_KEYS.SPEED_BOARD, JSON.stringify(leaderboardData.speed));
}

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function showModal(modal) {
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
}

function updatePlayerUI() {
    ui.homePlayerName.textContent = playerData.name;
    ui.playerCoins.textContent = playerData.coins;
}

function calculateTotalStars() {
    let total = 0;
    Object.values(playerData.levelProgress).forEach(progress => {
        total += progress.stars || 0;
    });
    return total;
}

function isLevelUnlocked(levelId) {
    if (levelId === 1) return true;
    const prevLevel = playerData.levelProgress[levelId - 1];
    return prevLevel && prevLevel.completed === true;
}

function getLevelStars(levelId) {
    const progress = playerData.levelProgress[levelId];
    return progress ? progress.stars || 0 : 0;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${padZero(mins)}:${padZero(secs)}`;
}

function calculateStars(levelId, moves, time) {
    const level = levels.find(l => l.id === levelId);
    if (!level) return 1;
    
    const minMoves = level.pairs;
    const moveRatio = moves / minMoves;
    const timePerPair = time / level.pairs;
    
    let stars = 1;
    
    if (moveRatio <= 1.5 && timePerPair <= 8) stars = 3;
    else if (moveRatio <= 2.5 && timePerPair <= 15) stars = 2;
    else stars = 1;
    
    return stars;
}

function calculateScore(levelId, stars, moves, time) {
    const level = levels.find(l => l.id === levelId);
    if (!level) return 0;
    
    const baseScore = level.pairs * 100;
    const timeBonus = Math.max(0, 300 - time * 3);
    const moveBonus = Math.max(0, 500 - moves * 8);
    const starMultiplier = 1 + (stars - 1) * 0.5;
    
    return Math.floor((baseScore + timeBonus + moveBonus) * starMultiplier);
}

function calculateRewards(levelId, stars) {
    const rewards = [];
    
    const coinBase = levelId * 50;
    const coinBonus = (stars - 1) * 25;
    rewards.push({ icon: '💰', name: '金币', value: coinBase + coinBonus });
    
    if (stars >= 2) {
        rewards.push({ icon: '⭐', name: '经验值', value: 50 * stars });
    }
    
    if (stars === 3) {
        rewards.push({ icon: '🎁', name: '神秘宝箱', value: 1 });
    }
    
    return rewards;
}

function getStarDisplayHTML(stars) {
    let html = '';
    for (let i = 0; i < 3; i++) {
        html += i < stars ? '⭐' : '<span class="empty">⭐</span>';
    }
    return html;
}

function renderLevelSelect() {
    const totalStars = calculateTotalStars();
    ui.totalStars.textContent = totalStars;
    
    ui.levelGrid.innerHTML = '';
    
    levels.forEach(level => {
        const unlocked = isLevelUnlocked(level.id);
        const stars = getLevelStars(level.id);
        
        const card = document.createElement('div');
        card.className = `level-card ${unlocked ? '' : 'locked'}`;
        card.dataset.levelId = level.id;
        
        card.innerHTML = `
            <div class="level-number">${level.id}</div>
            <div class="level-info">${level.name} · ${level.pairs}对</div>
            ${unlocked 
                ? `<div class="level-stars">${getStarDisplayHTML(stars)}</div>` 
                : '<div class="level-locked-icon">🔒</div>'
            }
        `;
        
        if (unlocked) {
            card.addEventListener('click', () => startLevel(level.id));
        } else {
            card.addEventListener('click', () => {
                document.getElementById('lockedMessage').textContent = `请先完成第 ${level.id - 1} 关解锁本关`;
                showModal(modals.locked);
            });
        }
        
        ui.levelGrid.appendChild(card);
    });
}

function startLevel(levelId) {
    if (!isLevelUnlocked(levelId)) return;
    
    gameState.currentLevel = levelId;
    gameState.gameMode = 'level';
    
    const level = levels.find(l => l.id === levelId);
    gameState.currentTheme = level.theme;
    
    ui.levelBadge.textContent = `第 ${levelId} 关 · ${level.name}`;
    ui.themeBadge.textContent = themes[level.theme].name;
    
    initGame();
    showScreen('game');
}

function initGame() {
    stopTimer();
    clearWinTimeout();
    clearMismatchTimeout();
    hideModal(modals.win);
    
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.isProcessing = false;
    gameState.gameStarted = false;
    
    updateGameStats();
    updateStarProgress(0);
    createCards();
}

function createCards() {
    let pairs, cols, theme;
    
    if (gameState.gameMode === 'level') {
        const level = levels.find(l => l.id === gameState.currentLevel);
        pairs = level.pairs;
        cols = level.cols;
        theme = gameState.currentTheme;
    } else {
        pairs = gameState.freeModeConfig.pairs;
        cols = gameState.freeModeConfig.cols;
        theme = gameState.freeModeConfig.theme;
    }
    
    const themeIcons = themes[theme].icons.slice(0, pairs);
    
    gameState.cards = [];
    
    themeIcons.forEach((icon, index) => {
        gameState.cards.push({ id: index * 2, icon, matched: false });
        gameState.cards.push({ id: index * 2 + 1, icon, matched: false });
    });
    
    gameState.cards = shuffleArray(gameState.cards);
    
    const board = gameState.gameMode === 'level' ? ui.gameBoard : ui.freeGameBoard;
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.innerHTML = '';
    
    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.style.animationDelay = `${index * 0.04}s`;
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-back">?</div>
                <div class="card-front">${card.icon}</div>
            </div>
        `;
        cardElement.addEventListener('click', () => flipCard(index));
        board.appendChild(cardElement);
    });
    
    if (gameState.gameMode === 'level') {
        ui.totalPairsDisplay.textContent = pairs;
    } else {
        ui.freeTotalPairsDisplay.textContent = pairs;
    }
}

function flipCard(index) {
    const card = gameState.cards[index];
    const board = gameState.gameMode === 'level' ? ui.gameBoard : ui.freeGameBoard;
    const cardElement = board.children[index];
    
    if (gameState.isProcessing || 
        card.matched || 
        cardElement.classList.contains('flipped') || 
        gameState.flippedCards.length >= 2) {
        return;
    }
    
    if (!gameState.gameStarted) {
        startTimer();
        gameState.gameStarted = true;
    }
    
    cardElement.classList.add('flipped');
    gameState.flippedCards.push(index);
    
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateGameStats();
        
        if (gameState.gameMode === 'level') {
            const level = levels.find(l => l.id === gameState.currentLevel);
            const predictedStars = calculateStars(
                gameState.currentLevel,
                gameState.moves,
                gameState.timer
            );
            updateStarProgress(predictedStars);
        }
        
        checkMatch();
    }
}

function checkMatch() {
    const [index1, index2] = gameState.flippedCards;
    const card1 = gameState.cards[index1];
    const card2 = gameState.cards[index2];
    
    if (card1.icon === card2.icon) {
        handleMatch(index1, index2);
    } else {
        handleMismatch(index1, index2);
    }
}

function handleMatch(index1, index2) {
    const board = gameState.gameMode === 'level' ? ui.gameBoard : ui.freeGameBoard;
    const cardElement1 = board.children[index1];
    const cardElement2 = board.children[index2];
    
    gameState.cards[index1].matched = true;
    gameState.cards[index2].matched = true;
    
    cardElement1.classList.add('matched');
    cardElement2.classList.add('matched');
    
    gameState.matchedPairs++;
    gameState.flippedCards = [];
    updateGameStats();
    
    let totalPairs;
    if (gameState.gameMode === 'level') {
        const level = levels.find(l => l.id === gameState.currentLevel);
        totalPairs = level.pairs;
    } else {
        totalPairs = gameState.freeModeConfig.pairs;
    }
    
    if (gameState.matchedPairs === totalPairs) {
        gameState.winTimeout = setTimeout(handleWin, 600);
    }
}

function handleMismatch(index1, index2) {
    gameState.isProcessing = true;
    const board = gameState.gameMode === 'level' ? ui.gameBoard : ui.freeGameBoard;
    const cardElement1 = board.children[index1];
    const cardElement2 = board.children[index2];
    
    cardElement1.classList.add('locked');
    cardElement2.classList.add('locked');
    
    gameState.mismatchTimeout = setTimeout(() => {
        cardElement1.classList.remove('flipped');
        cardElement2.classList.remove('flipped');
        cardElement1.classList.remove('locked');
        cardElement2.classList.remove('locked');
        gameState.flippedCards = [];
        gameState.isProcessing = false;
        gameState.mismatchTimeout = null;
    }, 1000);
}

function updateGameStats() {
    if (gameState.gameMode === 'level') {
        ui.movesDisplay.textContent = gameState.moves;
        ui.matchesDisplay.textContent = gameState.matchedPairs;
    } else {
        ui.freeMovesDisplay.textContent = gameState.moves;
        ui.freeMatchesDisplay.textContent = gameState.matchedPairs;
    }
}

function updateStarProgress(stars) {
    const starIcons = ['', '⭐', '⭐⭐', '⭐⭐⭐'];
    const filled = starIcons[stars] || '';
    ui.starFilled.textContent = filled;
}

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const timeStr = formatTime(gameState.timer);
    if (gameState.gameMode === 'level') {
        ui.timerDisplay.textContent = timeStr;
    } else {
        ui.freeTimerDisplay.textContent = timeStr;
    }
}

function clearWinTimeout() {
    if (gameState.winTimeout) {
        clearTimeout(gameState.winTimeout);
        gameState.winTimeout = null;
    }
}

function clearMismatchTimeout() {
    if (gameState.mismatchTimeout) {
        clearTimeout(gameState.mismatchTimeout);
        gameState.mismatchTimeout = null;
    }
}

function handleWin() {
    stopTimer();
    
    if (gameState.gameMode === 'level') {
        const level = levels.find(l => l.id === gameState.currentLevel);
        const stars = calculateStars(gameState.currentLevel, gameState.moves, gameState.timer);
        const score = calculateScore(gameState.currentLevel, stars, gameState.moves, gameState.timer);
        const rewards = calculateRewards(gameState.currentLevel, stars);
        
        saveLevelProgress(gameState.currentLevel, stars, gameState.moves, gameState.timer, score);
        updateLeaderboards(score, stars);
        
        ui.resultStars.innerHTML = getStarDisplayHTML(stars);
        ui.finalMoves.textContent = gameState.moves;
        ui.finalTime.textContent = formatTime(gameState.timer);
        
        ui.rewardItems.innerHTML = '';
        rewards.forEach((reward, index) => {
            const item = document.createElement('div');
            item.className = 'reward-item';
            item.style.animationDelay = `${index * 0.15}s`;
            item.innerHTML = `<span class="reward-icon">${reward.icon}</span>${reward.name} ×${reward.value}`;
            ui.rewardItems.appendChild(item);
            
            if (reward.icon === '💰') {
                playerData.coins += reward.value;
            }
        });
        
        saveToStorage();
        updatePlayerUI();
        
        const isLastLevel = gameState.currentLevel >= levels.length;
        const nextBtn = document.getElementById('nextLevelBtn');
        if (isLastLevel) {
            nextBtn.textContent = '返回关卡';
            nextBtn.onclick = () => {
                hideModal(modals.win);
                renderLevelSelect();
                showScreen('levelSelect');
            };
        } else {
            nextBtn.textContent = '下一关 →';
            nextBtn.onclick = () => {
                hideModal(modals.win);
                startLevel(gameState.currentLevel + 1);
            };
        }
        
        showModal(modals.win);
    } else {
        showToast('自由模式通关！可在排行榜查看成绩', 'success');
        
        const score = gameState.moves * 10 + Math.max(0, 1000 - gameState.timer * 5);
        addToScoreBoard(playerData.name, score, false);
    }
}

function saveLevelProgress(levelId, stars, moves, time, score) {
    const currentProgress = playerData.levelProgress[levelId] || { stars: 0 };
    const bestStars = Math.max(currentProgress.stars, stars);
    const bestTime = currentProgress.bestTime ? Math.min(currentProgress.bestTime, time) : time;
    const bestMoves = currentProgress.bestMoves ? Math.min(currentProgress.bestMoves, moves) : moves;
    const bestScore = currentProgress.bestScore ? Math.max(currentProgress.bestScore, score) : score;
    
    playerData.levelProgress[levelId] = {
        completed: true,
        stars: bestStars,
        bestTime: bestTime,
        bestMoves: bestMoves,
        bestScore: bestScore,
        lastPlayed: Date.now()
    };
}

function updateLeaderboards(score, stars) {
    addToScoreBoard(playerData.name, score, true);
    updateStarsBoard(playerData.name);
    
    let totalStars = 0;
    Object.values(playerData.levelProgress).forEach(p => {
        totalStars += p.stars || 0;
    });
    
    const allCompleted = Object.keys(playerData.levelProgress).length >= levels.length;
    if (allCompleted) {
        let totalTime = 0;
        Object.values(playerData.levelProgress).forEach(p => {
            totalTime += p.bestTime || 0;
        });
        addToSpeedBoard(playerData.name, totalTime);
    }
    
    saveToStorage();
}

function addToScoreBoard(name, score, isCampaign) {
    const entry = {
        name,
        score,
        date: Date.now(),
        isCampaign
    };
    
    leaderboardData.score.push(entry);
    leaderboardData.score.sort((a, b) => b.score - a.score);
    leaderboardData.score = leaderboardData.score.slice(0, 50);
}

function updateStarsBoard(name) {
    let totalStars = 0;
    let completedLevels = 0;
    
    Object.values(playerData.levelProgress).forEach(p => {
        if (p.completed) {
            totalStars += p.stars || 0;
            completedLevels++;
        }
    });
    
    const existingIndex = leaderboardData.stars.findIndex(e => e.name === name);
    const entry = {
        name,
        stars: totalStars,
        completedLevels,
        date: Date.now()
    };
    
    if (existingIndex >= 0) {
        leaderboardData.stars[existingIndex] = entry;
    } else {
        leaderboardData.stars.push(entry);
    }
    
    leaderboardData.stars.sort((a, b) => {
        if (b.stars !== a.stars) return b.stars - a.stars;
        return a.completedLevels - b.completedLevels;
    });
    leaderboardData.stars = leaderboardData.stars.slice(0, 50);
}

function addToSpeedBoard(name, totalTime) {
    const existingIndex = leaderboardData.speed.findIndex(e => e.name === name);
    const entry = {
        name,
        time: totalTime,
        date: Date.now()
    };
    
    if (existingIndex >= 0) {
        if (leaderboardData.speed[existingIndex].time > totalTime) {
            leaderboardData.speed[existingIndex] = entry;
        }
    } else {
        leaderboardData.speed.push(entry);
    }
    
    leaderboardData.speed.sort((a, b) => a.time - b.time);
    leaderboardData.speed = leaderboardData.speed.slice(0, 50);
}

function renderLeaderboard(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    let data = [];
    let valueLabel = '';
    let formatValue = null;
    
    switch (tabName) {
        case 'score':
            data = leaderboardData.score;
            valueLabel = '分';
            formatValue = (v) => `${v.score.toLocaleString()}${valueLabel}`;
            break;
        case 'stars':
            data = leaderboardData.stars;
            valueLabel = '星';
            formatValue = (v) => `${v.stars}${valueLabel} · ${v.completedLevels}关`;
            break;
        case 'speed':
            data = leaderboardData.speed;
            valueLabel = '秒';
            formatValue = (v) => formatTime(v.time);
            break;
    }
    
    ui.podiumArea.innerHTML = '';
    ui.leaderboardList.innerHTML = '';
    
    if (data.length === 0) {
        ui.leaderboardList.innerHTML = `
            <div class="leaderboard-empty">
                <p>暂无数据</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">完成游戏后将会显示排名</p>
            </div>
        `;
        return;
    }
    
    const topThree = data.slice(0, 3);
    const ranks = [2, 1, 3];
    const medals = ['🥈', '🥇', '🥉'];
    
    topThree.forEach((entry, idx) => {
        const actualRank = ranks[idx];
        if (entry) {
            const item = document.createElement('div');
            item.className = `podium-item podium-${actualRank}`;
            item.innerHTML = `
                <div class="podium-rank">${medals[idx]}</div>
                <div class="podium-player">${entry.name}</div>
                <div class="podium-value">${formatValue(entry)}</div>
                <div class="podium-stand">${actualRank}</div>
            `;
            ui.podiumArea.appendChild(item);
        }
    });
    
    const rest = data.slice(3);
    rest.forEach((entry, idx) => {
        const rank = 4 + idx;
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        let rankClass = 'rank-n';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';
        
        item.innerHTML = `
            <div class="rank-badge ${rankClass}">${rank}</div>
            <div class="leaderboard-player">${entry.name}</div>
            <div class="leaderboard-value">${formatValue(entry)}</div>
        `;
        ui.leaderboardList.appendChild(item);
    });
}

function bindEvents() {
    document.getElementById('startCampaignBtn').addEventListener('click', () => {
        renderLevelSelect();
        showScreen('levelSelect');
    });
    
    document.getElementById('startFreeBtn').addEventListener('click', () => {
        showScreen('freeMode');
    });
    
    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        renderLeaderboard('score');
        showScreen('leaderboard');
    });
    
    document.getElementById('editNameBtn').addEventListener('click', () => {
        ui.playerNameInput.value = playerData.name;
        showModal(modals.name);
        setTimeout(() => ui.playerNameInput.focus(), 100);
    });
    
    document.getElementById('saveNameBtn').addEventListener('click', () => {
        const name = ui.playerNameInput.value.trim();
        if (name && name.length > 0) {
            playerData.name = name.slice(0, 10);
            saveToStorage();
            updatePlayerUI();
            hideModal(modals.name);
            showToast('昵称已更新', 'success');
        } else {
            showToast('请输入有效昵称', 'error');
        }
    });
    
    document.getElementById('levelBackBtn').addEventListener('click', () => {
        showScreen('home');
    });
    
    document.getElementById('gameBackBtn').addEventListener('click', () => {
        stopTimer();
        clearWinTimeout();
        renderLevelSelect();
        showScreen('levelSelect');
    });
    
    document.getElementById('freeBackBtn').addEventListener('click', () => {
        stopTimer();
        clearWinTimeout();
        document.getElementById('freeModeGame').classList.add('hidden');
        document.getElementById('freeModeScreen').querySelector('.free-mode-setup').classList.remove('hidden');
        showScreen('home');
    });
    
    document.getElementById('leaderboardBackBtn').addEventListener('click', () => {
        showScreen('home');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            renderLeaderboard(btn.dataset.tab);
        });
    });
    
    document.getElementById('refreshLeaderboardBtn').addEventListener('click', () => {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        renderLeaderboard(activeTab);
        showToast('排行榜已刷新', 'success');
    });
    
    document.getElementById('startFreeGameBtn').addEventListener('click', () => {
        const difficulty = document.getElementById('difficultySelect').value;
        const theme = document.getElementById('freeThemeSelect').value;
        
        let pairs, cols;
        switch (difficulty) {
            case 'easy': pairs = 4; cols = 4; break;
            case 'medium': pairs = 6; cols = 4; break;
            case 'hard': pairs = 8; cols = 4; break;
            default: pairs = 4; cols = 4;
        }
        
        gameState.gameMode = 'free';
        gameState.freeModeConfig = { pairs, cols, theme };
        
        document.getElementById('freeModeScreen').querySelector('.free-mode-setup').classList.add('hidden');
        document.getElementById('freeModeGame').classList.remove('hidden');
        
        initGame();
    });
    
    document.getElementById('restartFreeBtn').addEventListener('click', () => {
        initGame();
    });
    
    document.getElementById('restartLevelBtn').addEventListener('click', () => {
        initGame();
    });
    
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        gameState.currentTheme = e.target.value;
        ui.themeBadge.textContent = themes[e.target.value].name;
        initGame();
    });
    
    document.getElementById('retryBtn').addEventListener('click', () => {
        hideModal(modals.win);
        initGame();
    });
    
    document.getElementById('closeLockedBtn').addEventListener('click', () => {
        hideModal(modals.locked);
    });
    
    modals.name.addEventListener('click', (e) => {
        if (e.target === modals.name) hideModal(modals.name);
    });
    
    ui.playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveNameBtn').click();
        }
    });
}

function init() {
    loadFromStorage();
    updatePlayerUI();
    bindEvents();
    showScreen('home');
}

document.addEventListener('DOMContentLoaded', init);
