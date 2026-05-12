const CONFIG = {
    MAX_GUESSES: 7,
    MIN_NUMBER: 1,
    MAX_NUMBER: 100,
    MAX_HINTS: 3,
    STORAGE_KEYS: {
        NICKNAME: 'guess_number_nickname',
        LEADERBOARD_GUESSES: 'guess_number_leaderboard_guesses',
        LEADERBOARD_TIME: 'guess_number_leaderboard_time',
        PERSONAL_STATS: 'guess_number_personal_stats',
        THEME: 'guess_number_theme',
        SHOW_TUTORIAL: 'guess_number_show_tutorial',
        OPERATION_LOGS: 'guess_number_operation_logs'
    }
};

let gameState = {
    secretNumber: 0,
    remainingGuesses: CONFIG.MAX_GUESSES,
    guessesMade: 0,
    usedNumbers: new Set(),
    gameOver: false,
    startTime: 0,
    timerInterval: null,
    currentTime: 0,
    hintsUsed: 0,
    hintBounds: {
        min: CONFIG.MIN_NUMBER,
        max: CONFIG.MAX_NUMBER
    },
    playerNickname: '访客',
    isDarkMode: false
};

let tutorialState = {
    currentPage: 0,
    totalPages: 4
};

let confirmState = {
    callback: null,
    showWarning: false
};

const DOM = {
    guessInput: document.getElementById('guess-input'),
    guessButton: document.getElementById('guess-button'),
    restartButton: document.getElementById('restart-button'),
    remainingGuesses: document.getElementById('remaining-guesses'),
    guessesMade: document.getElementById('guesses-made'),
    message: document.getElementById('message'),
    guessHistory: document.getElementById('guess-history'),
    gameTimer: document.getElementById('game-timer'),
    hintButton: document.getElementById('hint-button'),
    playerNickname: document.getElementById('player-nickname'),
    changeNameBtn: document.getElementById('change-name-btn'),
    showLeaderboardBtn: document.getElementById('show-leaderboard-btn'),
    nicknameModal: document.getElementById('nickname-modal'),
    nicknameInput: document.getElementById('nickname-input'),
    saveNicknameBtn: document.getElementById('save-nickname-btn'),
    cancelNicknameBtn: document.getElementById('cancel-nickname-btn'),
    hintModal: document.getElementById('hint-modal'),
    hintRemaining: document.getElementById('hint-remaining'),
    confirmHintBtn: document.getElementById('confirm-hint-btn'),
    cancelHintBtn: document.getElementById('cancel-hint-btn'),
    leaderboardModal: document.getElementById('leaderboard-modal'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    leaderboardGuesses: document.getElementById('leaderboard-guesses'),
    leaderboardTime: document.getElementById('leaderboard-time'),
    personalGuesses: document.getElementById('personal-guesses'),
    personalTime: document.getElementById('personal-time'),
    personalGames: document.getElementById('personal-games'),
    closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
    winModal: document.getElementById('win-modal'),
    winGuesses: document.getElementById('win-guesses'),
    winTime: document.getElementById('win-time'),
    newRecord: document.getElementById('new-record'),
    playAgainBtn: document.getElementById('play-again-btn'),
    showLeaderboardWinBtn: document.getElementById('show-leaderboard-win-btn'),
    themeBtn: document.getElementById('theme-btn'),
    themeIcon: document.getElementById('theme-icon'),
    helpBtn: document.getElementById('help-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    clearLeaderboardBtn: document.getElementById('clear-leaderboard-btn'),
    clearLogsBtn: document.getElementById('clear-logs-btn'),
    logContainer: document.getElementById('log-container'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmWarning: document.getElementById('confirm-warning'),
    confirmOkBtn: document.getElementById('confirm-ok-btn'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    tutorialModal: document.getElementById('tutorial-modal'),
    tutorialPages: document.querySelectorAll('.tutorial-page'),
    progressDots: document.querySelectorAll('.progress-dot'),
    tutorialPrev: document.getElementById('tutorial-prev'),
    tutorialNext: document.getElementById('tutorial-next'),
    tutorialClose: document.getElementById('tutorial-close'),
    dontShowAgain: document.getElementById('dont-show-again'),
    toast: document.getElementById('toast')
};

function initGame() {
    gameState.secretNumber = Math.floor(Math.random() * (CONFIG.MAX_NUMBER - CONFIG.MIN_NUMBER + 1)) + CONFIG.MIN_NUMBER;
    gameState.remainingGuesses = CONFIG.MAX_GUESSES;
    gameState.guessesMade = 0;
    gameState.usedNumbers = new Set();
    gameState.gameOver = false;
    gameState.hintsUsed = 0;
    gameState.hintBounds = {
        min: CONFIG.MIN_NUMBER,
        max: CONFIG.MAX_NUMBER
    };

    stopTimer();
    gameState.currentTime = 0;
    DOM.gameTimer.textContent = '0s';

    updateUI();
    clearMessage();
    clearHistory();

    DOM.guessInput.value = '';
    DOM.guessInput.disabled = false;
    DOM.guessButton.disabled = false;
    DOM.hintButton.disabled = false;
    DOM.guessInput.focus();

    startTimer();
}

function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    gameState.currentTime = elapsed;
    DOM.gameTimer.textContent = elapsed + 's';
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateUI() {
    DOM.remainingGuesses.textContent = gameState.remainingGuesses;
    DOM.guessesMade.textContent = gameState.guessesMade;
}

function showMessage(text, type) {
    DOM.message.textContent = text;
    DOM.message.className = 'message ' + type;
    DOM.message.classList.remove('hidden');
}

function clearMessage() {
    DOM.message.classList.add('hidden');
}

function clearHistory() {
    DOM.guessHistory.innerHTML = '<li class="no-history">还没有猜测记录</li>';
}

function addToHistory(guess, result) {
    const noHistory = DOM.guessHistory.querySelector('.no-history');
    if (noHistory) {
        noHistory.remove();
    }

    const listItem = document.createElement('li');
    listItem.className = result;
    
    let resultText;
    switch (result) {
        case 'high':
            resultText = '猜大了';
            break;
        case 'low':
            resultText = '猜小了';
            break;
        case 'correct':
            resultText = '猜对了！';
            break;
        case 'hint':
            resultText = '使用提示';
            break;
        default:
            resultText = '';
    }

    listItem.innerHTML = `<span>第 ${gameState.guessesMade} 次: ${guess}</span><span>${resultText}</span>`;
    DOM.guessHistory.appendChild(listItem);
    DOM.guessHistory.scrollTop = DOM.guessHistory.scrollHeight;
}

function showToast(message, type = 'info', duration = 3000) {
    DOM.toast.textContent = message;
    DOM.toast.className = `toast ${type}`;
    DOM.toast.classList.remove('hidden');

    setTimeout(() => {
        DOM.toast.classList.add('hidden');
    }, duration);
}

function checkGuess() {
    if (gameState.gameOver) {
        return;
    }

    const rawInput = DOM.guessInput.value.trim();

    if (rawInput === '') {
        showMessage('请输入一个数字！', 'error');
        DOM.guessInput.value = '';
        DOM.guessInput.focus();
        return;
    }

    if (!/^-?\d+$/.test(rawInput)) {
        showMessage('请输入一个整数！小数、科学计数法等格式不被接受。', 'error');
        DOM.guessInput.value = '';
        DOM.guessInput.focus();
        return;
    }

    const guess = parseInt(rawInput, 10);

    if (guess < CONFIG.MIN_NUMBER || guess > CONFIG.MAX_NUMBER) {
        showMessage(`请输入 ${CONFIG.MIN_NUMBER} 到 ${CONFIG.MAX_NUMBER} 之间的数字！`, 'error');
        DOM.guessInput.value = '';
        DOM.guessInput.focus();
        return;
    }

    if (gameState.usedNumbers.has(guess)) {
        showMessage(`数字 ${guess} 已经猜过了！请换一个数字试试。`, 'duplicate');
        DOM.guessInput.value = '';
        DOM.guessInput.focus();
        return;
    }

    gameState.usedNumbers.add(guess);
    gameState.guessesMade++;
    gameState.remainingGuesses--;
    updateUI();

    if (guess === gameState.secretNumber) {
        handleWin();
    } else if (gameState.remainingGuesses === 0) {
        handleGameOver(guess);
    } else if (guess > gameState.secretNumber) {
        showMessage('猜大了！再试试小一点的数字。', 'high');
        addToHistory(guess, 'high');
    } else {
        showMessage('猜小了！再试试大一点的数字。', 'low');
        addToHistory(guess, 'low');
    }

    DOM.guessInput.value = '';
    DOM.guessInput.focus();
}

function handleWin() {
    stopTimer();
    gameState.gameOver = true;

    const timeTaken = gameState.currentTime;
    const guessesCount = gameState.guessesMade;

    addToHistory(gameState.secretNumber, 'correct');
    disableGame();

    const isGuessRecord = updateLeaderboardGuesses(guessesCount);
    const isTimeRecord = updateLeaderboardTime(timeTaken);
    const isPersonalRecord = updatePersonalStats(guessesCount, timeTaken);

    DOM.winGuesses.textContent = guessesCount;
    DOM.winTime.textContent = timeTaken;

    if (isGuessRecord || isTimeRecord || isPersonalRecord) {
        DOM.newRecord.classList.remove('hidden');
    } else {
        DOM.newRecord.classList.add('hidden');
    }

    showMessage(`🎉 恭喜你猜对了！神秘数字就是 ${gameState.secretNumber}！`, 'correct');
    
    setTimeout(() => {
        DOM.winModal.classList.remove('hidden');
    }, 500);
}

function handleGameOver(guess) {
    stopTimer();
    gameState.gameOver = true;
    addToHistory(guess, guess > gameState.secretNumber ? 'high' : 'low');
    disableGame();
    showMessage(`😢 游戏结束！你已经用完了所有猜测次数。神秘数字是 ${gameState.secretNumber}。`, 'game-over');
    updatePersonalStats(0, 0, true);
}

function disableGame() {
    DOM.guessInput.disabled = true;
    DOM.guessButton.disabled = true;
    DOM.hintButton.disabled = true;
}

function useHint() {
    if (gameState.gameOver) {
        return;
    }

    if (gameState.remainingGuesses <= 1) {
        showMessage('剩余次数不足，无法使用提示！', 'error');
        return;
    }

    if (gameState.hintsUsed >= CONFIG.MAX_HINTS) {
        showMessage(`你已经使用了 ${CONFIG.MAX_HINTS} 次提示，无法再使用！`, 'error');
        return;
    }

    DOM.hintRemaining.textContent = gameState.remainingGuesses;
    DOM.hintModal.classList.remove('hidden');
}

function confirmUseHint() {
    DOM.hintModal.classList.add('hidden');

    gameState.hintsUsed++;
    gameState.remainingGuesses--;
    gameState.guessesMade++;
    updateUI();

    const hint = generateHint();
    showMessage(`💡 提示：答案在 ${hint.min} - ${hint.max} 之间`, 'hint');
    
    addHintToHistory(hint);

    if (gameState.remainingGuesses === 0) {
        handleGameOverWithoutGuess();
    }

    if (gameState.hintsUsed >= CONFIG.MAX_HINTS) {
        DOM.hintButton.disabled = true;
    }
}

function generateHint() {
    let { min, max } = gameState.hintBounds;
    const target = gameState.secretNumber;

    const range = max - min;
    const reduction = Math.max(1, Math.floor(range * 0.25));

    if (Math.random() > 0.5 && max > target) {
        max = Math.max(target, max - reduction);
    } else if (min < target) {
        min = Math.min(target, min + reduction);
    } else if (max > target) {
        max = Math.max(target, max - reduction);
    }

    min = Math.max(min, CONFIG.MIN_NUMBER);
    max = Math.min(max, CONFIG.MAX_NUMBER);

    gameState.hintBounds.min = min;
    gameState.hintBounds.max = max;

    return { min, max };
}

function addHintToHistory(hint) {
    const noHistory = DOM.guessHistory.querySelector('.no-history');
    if (noHistory) {
        noHistory.remove();
    }

    const listItem = document.createElement('li');
    listItem.className = 'hint';
    listItem.innerHTML = `<span>第 ${gameState.guessesMade} 次: 提示</span><span>${hint.min}-${hint.max}</span>`;
    DOM.guessHistory.appendChild(listItem);
    DOM.guessHistory.scrollTop = DOM.guessHistory.scrollHeight;
}

function handleGameOverWithoutGuess() {
    stopTimer();
    gameState.gameOver = true;
    disableGame();
    showMessage(`😢 游戏结束！你已经用完了所有猜测次数。神秘数字是 ${gameState.secretNumber}。`, 'game-over');
    updatePersonalStats(0, 0, true);
}

function openNicknameModal() {
    DOM.nicknameInput.value = gameState.playerNickname === '访客' ? '' : gameState.playerNickname;
    DOM.nicknameModal.classList.remove('hidden');
    DOM.nicknameInput.focus();
}

function saveNickname() {
    const nickname = DOM.nicknameInput.value.trim();
    
    if (nickname === '') {
        gameState.playerNickname = '访客';
    } else {
        gameState.playerNickname = nickname.substring(0, 10);
    }

    localStorage.setItem(CONFIG.STORAGE_KEYS.NICKNAME, gameState.playerNickname);
    DOM.playerNickname.textContent = gameState.playerNickname;
    DOM.nicknameModal.classList.add('hidden');
}

function loadNickname() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.NICKNAME);
    if (saved) {
        gameState.playerNickname = saved;
        DOM.playerNickname.textContent = saved;
    }
}

function toggleTheme() {
    gameState.isDarkMode = !gameState.isDarkMode;
    applyTheme();
    saveTheme();
}

function applyTheme() {
    if (gameState.isDarkMode) {
        document.body.classList.add('dark-mode');
        DOM.themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        DOM.themeIcon.textContent = '🌙';
    }
}

function saveTheme() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, gameState.isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    if (saved === 'dark') {
        gameState.isDarkMode = true;
        applyTheme();
    }
}

function openSettings() {
    renderLogs();
    DOM.settingsModal.classList.remove('hidden');
}

function closeSettings() {
    DOM.settingsModal.classList.add('hidden');
}

function showConfirmDialog(title, message, showWarning, callback) {
    DOM.confirmTitle.textContent = title;
    DOM.confirmMessage.textContent = message;
    
    if (showWarning) {
        DOM.confirmWarning.classList.remove('hidden');
    } else {
        DOM.confirmWarning.classList.add('hidden');
    }

    confirmState.callback = callback;
    confirmState.showWarning = showWarning;
    
    DOM.confirmModal.classList.remove('hidden');
}

function closeConfirmDialog() {
    DOM.confirmModal.classList.add('hidden');
    confirmState.callback = null;
}

function handleConfirmOk() {
    if (confirmState.callback) {
        confirmState.callback();
    }
    closeConfirmDialog();
}

function clearCurrentHistory() {
    showConfirmDialog(
        '确认清空历史',
        '确定要清空当前游戏的猜测历史记录吗？',
        false,
        () => {
            clearHistory();
            addOperationLog('clear-history', '清空当前猜测历史');
            showToast('历史记录已清空', 'success');
        }
    );
}

function clearAllLeaderboards() {
    showConfirmDialog(
        '确认清空排行榜',
        '确定要清空所有排行榜数据吗？此操作不可恢复！',
        true,
        () => {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.LEADERBOARD_GUESSES);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.LEADERBOARD_TIME);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.PERSONAL_STATS);
            addOperationLog('clear-leaderboard', '清空所有排行榜数据');
            showToast('排行榜已清空', 'success');
        }
    );
}

function clearAllLogs() {
    showConfirmDialog(
        '确认清空日志',
        '确定要清空所有操作日志吗？',
        false,
        () => {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.OPERATION_LOGS);
            renderLogs();
            showToast('操作日志已清空', 'success');
        }
    );
}

function addOperationLog(type, description) {
    const logs = loadOperationLogs();
    const newLog = {
        type: type,
        description: description,
        player: gameState.playerNickname,
        timestamp: new Date().toLocaleString()
    };
    logs.unshift(newLog);
    const trimmedLogs = logs.slice(0, 50);
    saveOperationLogs(trimmedLogs);
}

function loadOperationLogs() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.OPERATION_LOGS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveOperationLogs(logs) {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.OPERATION_LOGS, JSON.stringify(logs));
    } catch (e) {
        console.error('Failed to save operation logs:', e);
    }
}

function renderLogs() {
    const logs = loadOperationLogs();
    
    if (logs.length === 0) {
        DOM.logContainer.innerHTML = '<p class="no-logs">暂无操作记录</p>';
        return;
    }

    DOM.logContainer.innerHTML = logs.map(log => `
        <div class="log-entry ${log.type}">
            <strong>[${log.timestamp}]</strong> ${log.player} - ${log.description}
        </div>
    `).join('');
}

function updateLeaderboardGuesses(guesses) {
    const data = loadLeaderboard(CONFIG.STORAGE_KEYS.LEADERBOARD_GUESSES);
    
    const entry = {
        nickname: gameState.playerNickname,
        value: guesses,
        date: new Date().toLocaleDateString()
    };

    data.push(entry);
    data.sort((a, b) => a.value - b.value);
    const top = data.slice(0, 10);
    
    saveLeaderboard(CONFIG.STORAGE_KEYS.LEADERBOARD_GUESSES, top);
    
    return top[0]?.nickname === gameState.playerNickname && top[0]?.value === guesses;
}

function updateLeaderboardTime(time) {
    const data = loadLeaderboard(CONFIG.STORAGE_KEYS.LEADERBOARD_TIME);
    
    const entry = {
        nickname: gameState.playerNickname,
        value: time,
        date: new Date().toLocaleDateString()
    };

    data.push(entry);
    data.sort((a, b) => a.value - b.value);
    const top = data.slice(0, 10);
    
    saveLeaderboard(CONFIG.STORAGE_KEYS.LEADERBOARD_TIME, top);
    
    return top[0]?.nickname === gameState.playerNickname && top[0]?.value === time;
}

function loadLeaderboard(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveLeaderboard(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save leaderboard:', e);
    }
}

function updatePersonalStats(guesses, time, lost = false) {
    const stats = loadPersonalStats();
    let hasNewRecord = false;

    stats.gamesPlayed++;

    if (!lost) {
        stats.gamesWon++;
        
        if (stats.bestGuesses === 0 || guesses < stats.bestGuesses) {
            stats.bestGuesses = guesses;
            hasNewRecord = true;
        }
        
        if (stats.bestTime === 0 || time < stats.bestTime) {
            stats.bestTime = time;
            hasNewRecord = true;
        }
    }

    savePersonalStats(stats);
    return hasNewRecord;
}

function loadPersonalStats() {
    try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEYS.PERSONAL_STATS);
        return data ? JSON.parse(data) : {
            gamesPlayed: 0,
            gamesWon: 0,
            bestGuesses: 0,
            bestTime: 0
        };
    } catch (e) {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            bestGuesses: 0,
            bestTime: 0
        };
    }
}

function savePersonalStats(stats) {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PERSONAL_STATS, JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save personal stats:', e);
    }
}

function openLeaderboard() {
    renderLeaderboard();
    DOM.leaderboardModal.classList.remove('hidden');
}

function closeLeaderboard() {
    DOM.leaderboardModal.classList.add('hidden');
}

function renderLeaderboard() {
    const guessesData = loadLeaderboard(CONFIG.STORAGE_KEYS.LEADERBOARD_GUESSES);
    const timeData = loadLeaderboard(CONFIG.STORAGE_KEYS.LEADERBOARD_TIME);
    const personalStats = loadPersonalStats();

    DOM.leaderboardGuesses.innerHTML = renderLeaderboardList(guessesData, '次');
    DOM.leaderboardTime.innerHTML = renderLeaderboardList(timeData, '秒');

    DOM.personalGuesses.textContent = personalStats.bestGuesses > 0 ? personalStats.bestGuesses + ' 次' : '--';
    DOM.personalTime.textContent = personalStats.bestTime > 0 ? personalStats.bestTime + ' 秒' : '--';
    DOM.personalGames.textContent = `${personalStats.gamesPlayed} (胜: ${personalStats.gamesWon})`;
}

function renderLeaderboardList(data, unit) {
    if (data.length === 0) {
        return '<p class="no-records">暂无记录</p>';
    }

    return data.slice(0, 3).map((entry, index) => `
        <div class="leaderboard-item rank-${index + 1}">
            <div class="player-info-leader">
                <span class="rank-badge">${index + 1}</span>
                <span class="player-name-leader">${entry.nickname}</span>
            </div>
            <span class="record-value">${entry.value} ${unit}</span>
        </div>
    `).join('');
}

function switchTab(tabName) {
    DOM.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    DOM.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

function openTutorial() {
    tutorialState.currentPage = 0;
    DOM.dontShowAgain.checked = false;
    updateTutorialPage();
    DOM.tutorialModal.classList.remove('hidden');
}

function closeTutorial() {
    if (DOM.dontShowAgain.checked) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SHOW_TUTORIAL, 'false');
    }
    DOM.tutorialModal.classList.add('hidden');
}

function updateTutorialPage() {
    DOM.tutorialPages.forEach((page, index) => {
        page.classList.toggle('active', index === tutorialState.currentPage);
    });

    DOM.progressDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === tutorialState.currentPage);
    });

    if (tutorialState.currentPage === 0) {
        DOM.tutorialPrev.classList.add('hidden');
    } else {
        DOM.tutorialPrev.classList.remove('hidden');
    }

    if (tutorialState.currentPage === tutorialState.totalPages - 1) {
        DOM.tutorialNext.classList.add('hidden');
        DOM.tutorialClose.classList.remove('hidden');
    } else {
        DOM.tutorialNext.classList.remove('hidden');
        DOM.tutorialClose.classList.add('hidden');
    }
}

function nextTutorialPage() {
    if (tutorialState.currentPage < tutorialState.totalPages - 1) {
        tutorialState.currentPage++;
        updateTutorialPage();
    }
}

function prevTutorialPage() {
    if (tutorialState.currentPage > 0) {
        tutorialState.currentPage--;
        updateTutorialPage();
    }
}

function shouldShowTutorial() {
    const show = localStorage.getItem(CONFIG.STORAGE_KEYS.SHOW_TUTORIAL);
    return show !== 'false';
}

DOM.guessButton.addEventListener('click', checkGuess);

DOM.guessInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

DOM.restartButton.addEventListener('click', initGame);

DOM.hintButton.addEventListener('click', useHint);
DOM.confirmHintBtn.addEventListener('click', confirmUseHint);
DOM.cancelHintBtn.addEventListener('click', () => DOM.hintModal.classList.add('hidden'));

DOM.changeNameBtn.addEventListener('click', openNicknameModal);
DOM.saveNicknameBtn.addEventListener('click', saveNickname);
DOM.cancelNicknameBtn.addEventListener('click', () => DOM.nicknameModal.classList.add('hidden'));
DOM.nicknameInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        saveNickname();
    }
});

DOM.showLeaderboardBtn.addEventListener('click', openLeaderboard);
DOM.closeLeaderboardBtn.addEventListener('click', closeLeaderboard);

DOM.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

DOM.playAgainBtn.addEventListener('click', () => {
    DOM.winModal.classList.add('hidden');
    initGame();
});

DOM.showLeaderboardWinBtn.addEventListener('click', () => {
    DOM.winModal.classList.add('hidden');
    openLeaderboard();
});

DOM.themeBtn.addEventListener('click', toggleTheme);

DOM.helpBtn.addEventListener('click', openTutorial);

DOM.settingsBtn.addEventListener('click', openSettings);
DOM.closeSettingsBtn.addEventListener('click', closeSettings);
DOM.clearHistoryBtn.addEventListener('click', clearCurrentHistory);
DOM.clearLeaderboardBtn.addEventListener('click', clearAllLeaderboards);
DOM.clearLogsBtn.addEventListener('click', clearAllLogs);

DOM.confirmOkBtn.addEventListener('click', handleConfirmOk);
DOM.confirmCancelBtn.addEventListener('click', closeConfirmDialog);

DOM.tutorialNext.addEventListener('click', nextTutorialPage);
DOM.tutorialPrev.addEventListener('click', prevTutorialPage);
DOM.tutorialClose.addEventListener('click', closeTutorial);

DOM.progressDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        tutorialState.currentPage = index;
        updateTutorialPage();
    });
});

[DOM.nicknameModal, DOM.hintModal, DOM.leaderboardModal, DOM.winModal, DOM.settingsModal, DOM.confirmModal, DOM.tutorialModal].forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
});

loadTheme();
loadNickname();
initGame();

if (shouldShowTutorial()) {
    setTimeout(openTutorial, 500);
}
