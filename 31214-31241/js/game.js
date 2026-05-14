class SlidingPuzzle {
    constructor() {
        this.size = 3;
        this.mode = 'classic';
        this.board = [];
        this.emptyIndex = 0;
        this.steps = 0;
        this.lastMove = null;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        this.isTimerRunning = false;
        this.countdown = 0;
        this.countdownInterval = null;
        this.isCountdownRunning = false;
        this.leaderboard = this.loadLeaderboard();
        this.gameData = this.loadGameData();
        this.dragging = null;
        
        this.powerUps = {
            hint: 3,
            refresh: 2,
            freeze: 2,
            skip: 1
        };
        
        this.currentLevel = 1;
        this.maxLevel = 10;
        
        this.p1 = { board: [], emptyIndex: 0, steps: 0, timer: 0, gameOver: false };
        this.p2 = { board: [], emptyIndex: 0, steps: 0, timer: 0, gameOver: false };
        this.p1TimerInterval = null;
        this.p2TimerInterval = null;
        this.battleStarted = false;
        
        this.init();
    }

    init() {
        this.winState = this.createWinState();
        this.bindElements();
        this.bindEvents();
    }

    createWinState() {
        const state = [];
        for (let i = 1; i < this.size * this.size; i++) {
            state.push(i);
        }
        state.push(0);
        return state;
    }

    bindElements() {
        this.modeSelector = document.getElementById('modeSelector');
        this.gameArea = document.getElementById('gameArea');
        this.gameTitle = document.getElementById('gameTitle');
        this.gameLevel = document.getElementById('gameLevel');
        this.singlePlayerGame = document.getElementById('singlePlayerGame');
        this.battleGame = document.getElementById('battleGame');
        
        this.gameBoard = document.getElementById('gameBoard');
        this.stepsElement = document.getElementById('steps');
        this.timerElement = document.getElementById('timer');
        this.timerContainer = document.getElementById('timerContainer');
        this.countdownElement = document.getElementById('countdown');
        this.countdownContainer = document.getElementById('countdownContainer');
        this.resetBtn = document.getElementById('resetBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.backBtn = document.getElementById('backBtn');
        
        this.hintBtn = document.getElementById('hintBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.freezeBtn = document.getElementById('freezeBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.hintCount = document.getElementById('hintCount');
        this.refreshCount = document.getElementById('refreshCount');
        this.freezeCount = document.getElementById('freezeCount');
        this.skipCount = document.getElementById('skipCount');
        
        this.p1Board = document.getElementById('p1Board');
        this.p2Board = document.getElementById('p2Board');
        this.p1Steps = document.getElementById('p1Steps');
        this.p2Steps = document.getElementById('p2Steps');
        this.p1Timer = document.getElementById('p1Timer');
        this.p2Timer = document.getElementById('p2Timer');
        this.p1Status = document.getElementById('p1Status');
        this.p2Status = document.getElementById('p2Status');
        this.battleStartBtn = document.getElementById('battleStartBtn');
        this.battleResetBtn = document.getElementById('battleResetBtn');
        
        this.winModal = document.getElementById('winModal');
        this.winTitle = document.getElementById('winTitle');
        this.winMessage = document.getElementById('winMessage');
        this.loseModal = document.getElementById('loseModal');
        this.loseTitle = document.getElementById('loseTitle');
        this.loseMessage = document.getElementById('loseMessage');
        this.leaderboardModal = document.getElementById('leaderboardModal');
        this.leaderboardList = document.getElementById('leaderboardList');
        this.levelCompleteModal = document.getElementById('levelCompleteModal');
        this.levelCompleteMessage = document.getElementById('levelCompleteMessage');
        this.battleResultModal = document.getElementById('battleResultModal');
        this.battleResultTitle = document.getElementById('battleResultTitle');
        this.battleResultMessage = document.getElementById('battleResultMessage');
        
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
        this.modeCards = document.querySelectorAll('.mode-card');
        
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.tryAgainBtn = document.getElementById('tryAgainBtn');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        this.battleAgainBtn = document.getElementById('battleAgainBtn');
        this.winBackBtn = document.getElementById('winBackBtn');
        this.loseBackBtn = document.getElementById('loseBackBtn');
        this.levelBackBtn = document.getElementById('levelBackBtn');
        this.battleBackBtn = document.getElementById('battleBackBtn');
        this.closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    }

    bindEvents() {
        this.modeCards.forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.selectMode(mode);
            });
        });

        this.backBtn.addEventListener('click', () => this.backToModeSelector());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        
        this.hintBtn.addEventListener('click', () => this.useHint());
        this.refreshBtn.addEventListener('click', () => this.useRefresh());
        this.freezeBtn.addEventListener('click', () => this.useFreeze());
        this.skipBtn.addEventListener('click', () => this.useSkip());
        
        this.battleStartBtn.addEventListener('click', () => this.startBattle());
        this.battleResetBtn.addEventListener('click', () => this.resetBattle());
        
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                this.changeDifficulty(size);
            });
        });

        this.leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const size = parseInt(tab.dataset.size);
                this.switchLeaderboardTab(size);
            });
        });

        this.playAgainBtn.addEventListener('click', () => {
            this.winModal.classList.remove('show');
            this.reset();
        });
        this.tryAgainBtn.addEventListener('click', () => {
            this.loseModal.classList.remove('show');
            this.reset();
        });
        this.nextLevelBtn.addEventListener('click', () => {
            this.levelCompleteModal.classList.remove('show');
            this.nextLevel();
        });
        this.battleAgainBtn.addEventListener('click', () => {
            this.battleResultModal.classList.remove('show');
            this.resetBattle();
        });
        this.winBackBtn.addEventListener('click', () => {
            this.winModal.classList.remove('show');
            this.backToModeSelector();
        });
        this.loseBackBtn.addEventListener('click', () => {
            this.loseModal.classList.remove('show');
            this.backToModeSelector();
        });
        this.levelBackBtn.addEventListener('click', () => {
            this.levelCompleteModal.classList.remove('show');
            this.backToModeSelector();
        });
        this.battleBackBtn.addEventListener('click', () => {
            this.battleResultModal.classList.remove('show');
            this.backToModeSelector();
        });
        this.closeLeaderboardBtn.addEventListener('click', () => {
            this.leaderboardModal.classList.remove('show');
        });
    }

    selectMode(mode) {
        this.mode = mode;
        this.modeSelector.classList.add('hidden');
        this.gameArea.classList.remove('hidden');
        
        this.stopAllTimers();
        
        if (mode === 'battle') {
            this.singlePlayerGame.classList.add('hidden');
            this.battleGame.classList.remove('hidden');
            this.gameTitle.textContent = '⚔️ 双人对战';
            this.gameLevel.textContent = '';
            this.initBattle();
        } else {
            this.singlePlayerGame.classList.remove('hidden');
            this.battleGame.classList.add('hidden');
            this.setupSinglePlayer();
        }
    }

    backToModeSelector() {
        this.stopAllTimers();
        this.gameArea.classList.add('hidden');
        this.modeSelector.classList.remove('hidden');
    }

    setupSinglePlayer() {
        const modeConfig = {
            classic: { title: '🎯 经典模式', showCountdown: false, showDifficulty: true, showLevel: false },
            timed: { title: '⏱️ 限时挑战', showCountdown: true, showDifficulty: true, showLevel: false },
            daily: { title: '📅 每日一题', showCountdown: false, showDifficulty: false, showLevel: true },
            level: { title: '🏆 闯关模式', showCountdown: false, showDifficulty: false, showLevel: true }
        };

        const config = modeConfig[this.mode];
        this.gameTitle.textContent = config.title;
        
        const difficultySelector = document.querySelector('.difficulty-selector');
        if (difficultySelector) {
            difficultySelector.style.display = config.showDifficulty ? 'block' : 'none';
        }
        
        this.timerContainer.style.display = config.showCountdown ? 'none' : 'block';
        this.countdownContainer.style.display = config.showCountdown ? 'block' : 'none';
        
        if (this.mode === 'level') {
            this.currentLevel = this.gameData.lastLevel || 1;
            this.gameLevel.textContent = `第 ${this.currentLevel} 关`;
            this.size = this.getLevelSize(this.currentLevel);
        } else if (this.mode === 'daily') {
            const today = new Date().toDateString();
            if (this.gameData.lastDailyDate !== today) {
                this.gameData.dailyCompleted = false;
                this.gameData.lastDailyDate = today;
                this.saveGameData();
            }
            this.gameLevel.textContent = this.gameData.dailyCompleted ? '已完成 ✓' : today;
            this.size = 4;
        }
        
        this.resetPowerUps();
        this.winState = this.createWinState();
        this.shuffle();
        this.render();
    }

    getLevelSize(level) {
        if (level <= 3) return 3;
        if (level <= 6) return 4;
        return 5;
    }

    resetPowerUps() {
        this.powerUps = {
            hint: 3,
            refresh: 2,
            freeze: 2,
            skip: 1
        };
        this.updatePowerUpDisplay();
    }

    updatePowerUpDisplay() {
        this.hintCount.textContent = this.powerUps.hint;
        this.refreshCount.textContent = this.powerUps.refresh;
        this.freezeCount.textContent = this.powerUps.freeze;
        this.skipCount.textContent = this.powerUps.skip;
        
        this.hintBtn.disabled = this.powerUps.hint <= 0;
        this.refreshBtn.disabled = this.powerUps.refresh <= 0;
        this.freezeBtn.disabled = this.powerUps.freeze <= 0 || this.mode !== 'timed';
        this.skipBtn.disabled = this.powerUps.skip <= 0 || (this.mode !== 'level' && this.mode !== 'daily');
    }

    useHint() {
        if (this.powerUps.hint <= 0 || this.gameOver) return;
        
        const neighbors = this.getNeighbors(this.emptyIndex);
        const validMoves = neighbors.filter(idx => {
            const row = Math.floor(idx / this.size);
            const emptyRow = Math.floor(this.emptyIndex / this.size);
            const col = idx % this.size;
            const emptyCol = this.emptyIndex % this.size;
            
            const targetValue = this.emptyIndex + 1;
            if (this.board[idx] === targetValue) return true;
            return false;
        });
        
        let hintIndex = null;
        if (validMoves.length > 0) {
            hintIndex = validMoves[0];
        } else {
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            hintIndex = randomNeighbor;
        }
        
        this.clearHints();
        const tiles = this.gameBoard.querySelectorAll('.tile:not(.empty)');
        tiles.forEach(tile => {
            if (parseInt(tile.dataset.index) === hintIndex) {
                tile.classList.add('hint');
            }
        });
        
        this.powerUps.hint--;
        this.updatePowerUpDisplay();
        
        setTimeout(() => this.clearHints(), 3000);
    }

    clearHints() {
        const hintTiles = this.gameBoard.querySelectorAll('.tile.hint');
        hintTiles.forEach(tile => tile.classList.remove('hint'));
    }

    useRefresh() {
        if (this.powerUps.refresh <= 0 || this.gameOver) return;
        this.powerUps.refresh--;
        this.updatePowerUpDisplay();
        this.shuffle();
        this.render();
    }

    useFreeze() {
        if (this.powerUps.freeze <= 0 || !this.isCountdownRunning || this.gameOver) return;
        
        this.stopCountdown();
        this.powerUps.freeze--;
        this.updatePowerUpDisplay();
        
        const originalColor = this.countdownContainer.style.background;
        this.countdownContainer.style.background = 'linear-gradient(145deg, #d4edda, #c3e6cb)';
        this.countdownContainer.style.border = '2px solid #28a745';
        
        setTimeout(() => {
            this.countdownContainer.style.background = originalColor;
            this.countdownContainer.style.border = '';
            if (!this.gameOver) {
                this.startCountdown();
            }
        }, 5000);
    }

    useSkip() {
        if (this.powerUps.skip <= 0 || this.gameOver) return;
        if (this.mode !== 'level' && this.mode !== 'daily') return;
        
        this.powerUps.skip--;
        this.updatePowerUpDisplay();
        this.gameOver = true;
        this.stopAllTimers();
        
        if (this.mode === 'level') {
            this.showLevelComplete('使用道具跳过当前关卡！');
        } else {
            this.gameData.dailyCompleted = true;
            this.saveGameData();
            this.showWin('每日一题完成！', '使用道具跳过了今日关卡');
        }
    }

    changeDifficulty(size) {
        if (size === this.size) return;

        this.stopAllTimers();

        this.difficultyBtns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.size) === size) {
                btn.classList.add('active');
            }
        });

        this.size = size;
        this.winState = this.createWinState();
        this.shuffle();
        this.render();
    }

    shuffle() {
        this.board = [...this.winState];
        this.emptyIndex = this.size * this.size - 1;

        const moves = 100 + this.size * 50;
        for (let i = 0; i < moves; i++) {
            const neighbors = this.getNeighbors(this.emptyIndex);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.swap(randomNeighbor, this.emptyIndex, false);
        }

        while (this.isWinState()) {
            const neighbors = this.getNeighbors(this.emptyIndex);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.swap(randomNeighbor, this.emptyIndex, false);
        }

        this.steps = 0;
        this.lastMove = null;
        this.gameOver = false;
        this.timer = 0;
        this.stopAllTimers();
        
        if (this.mode === 'timed') {
            this.countdown = this.size === 3 ? 180 : (this.size === 4 ? 300 : 480);
        }
    }

    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;

        if (row > 0) neighbors.push(index - this.size);
        if (row < this.size - 1) neighbors.push(index + this.size);
        if (col > 0) neighbors.push(index - 1);
        if (col < this.size - 1) neighbors.push(index + 1);

        return neighbors;
    }

    swap(fromIndex, toIndex, recordMove = true) {
        if (recordMove) {
            this.lastMove = { from: fromIndex, to: toIndex };
        }

        const temp = this.board[fromIndex];
        this.board[fromIndex] = this.board[toIndex];
        this.board[toIndex] = temp;

        if (this.board[fromIndex] === 0) {
            this.emptyIndex = fromIndex;
        } else if (this.board[toIndex] === 0) {
            this.emptyIndex = toIndex;
        }

        if (recordMove) {
            this.steps++;
            if (!this.isTimerRunning && this.mode !== 'timed') {
                this.startTimer();
            }
            if (!this.isCountdownRunning && this.mode === 'timed') {
                this.startCountdown();
            }
        }
    }

    moveTile(index) {
        if (this.gameOver) return;
        if (this.board[index] === 0) return;

        const neighbors = this.getNeighbors(index);
        if (neighbors.includes(this.emptyIndex)) {
            this.swap(index, this.emptyIndex, true);
            this.render();
            this.checkWin();
        }
    }

    undo() {
        if (this.gameOver) return;
        if (!this.lastMove) return;

        this.swap(this.lastMove.to, this.lastMove.from, false);
        this.steps = Math.max(0, this.steps - 1);
        this.lastMove = null;
        this.render();
    }

    reset() {
        this.stopAllTimers();
        this.resetPowerUps();
        this.shuffle();
        this.render();
    }

    isWinState() {
        return this.board.every((tile, index) => tile === this.winState[index]);
    }

    checkWin() {
        if (this.isWinState()) {
            this.gameOver = true;
            this.stopAllTimers();
            
            if (this.mode === 'level') {
                this.gameData.lastLevel = Math.min(this.currentLevel + 1, this.maxLevel);
                this.saveGameData();
                this.saveScore();
                this.showLevelComplete(`恭喜完成第 ${this.currentLevel} 关！<br>用时：${this.formatTime(this.timer)} | 步数：${this.steps}`);
            } else if (this.mode === 'daily') {
                this.gameData.dailyCompleted = true;
                this.saveGameData();
                this.saveScore();
                this.showWin('每日一题完成！', `用时：${this.formatTime(this.timer)} | 步数：${this.steps}`);
            } else {
                this.saveScore();
                this.showWin('恭喜你赢了！', `难度：${this.size}×${this.size}<br>用时：${this.formatTime(this.timer)} | 步数：${this.steps}`);
            }
        }
    }

    nextLevel() {
        if (this.currentLevel >= this.maxLevel) {
            this.showWin('🎉 全部通关！', `恭喜你完成了所有 ${this.maxLevel} 关！`);
            return;
        }
        
        this.currentLevel++;
        this.gameLevel.textContent = `第 ${this.currentLevel} 关`;
        this.size = this.getLevelSize(this.currentLevel);
        this.winState = this.createWinState();
        this.resetPowerUps();
        this.shuffle();
        this.render();
    }

    showWin(title, message) {
        this.winTitle.textContent = '🎉 ' + title;
        this.winMessage.innerHTML = message;
        this.winModal.classList.add('show');
    }

    showLevelComplete(message) {
        this.levelCompleteMessage.innerHTML = message;
        if (this.currentLevel >= this.maxLevel) {
            this.nextLevelBtn.style.display = 'none';
        } else {
            this.nextLevelBtn.style.display = 'inline-block';
        }
        this.levelCompleteModal.classList.add('show');
    }

    startTimer() {
        if (this.isTimerRunning) return;
        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isTimerRunning = false;
    }

    startCountdown() {
        if (this.isCountdownRunning) return;
        this.isCountdownRunning = true;
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            this.updateCountdownDisplay();
            
            if (this.countdown <= 0) {
                this.gameOver = true;
                this.stopCountdown();
                this.showLose();
            }
        }, 1000);
    }

    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.isCountdownRunning = false;
    }

    stopAllTimers() {
        this.stopTimer();
        this.stopCountdown();
    }

    showLose() {
        this.loseTitle.textContent = '⏰ 时间到！';
        this.loseMessage.textContent = `很遗憾，时间用完了。你走了 ${this.steps} 步。`;
        this.loseModal.classList.add('show');
    }

    updateTimerDisplay() {
        this.timerElement.textContent = this.formatTime(this.timer);
    }

    updateCountdownDisplay() {
        this.countdownElement.textContent = this.formatTime(this.countdown);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    loadLeaderboard() {
        try {
            const data = localStorage.getItem('slidingPuzzleLeaderboard');
            return data ? JSON.parse(data) : { '3': [], '4': [], '5': [] };
        } catch {
            return { '3': [], '4': [], '5': [] };
        }
    }

    saveLeaderboard() {
        try {
            localStorage.setItem('slidingPuzzleLeaderboard', JSON.stringify(this.leaderboard));
        } catch (e) {
            console.warn('无法保存排行榜到本地存储:', e);
        }
    }

    loadGameData() {
        try {
            const data = localStorage.getItem('slidingPuzzleGameData');
            return data ? JSON.parse(data) : { lastLevel: 1, dailyCompleted: false, lastDailyDate: '' };
        } catch {
            return { lastLevel: 1, dailyCompleted: false, lastDailyDate: '' };
        }
    }

    saveGameData() {
        try {
            localStorage.setItem('slidingPuzzleGameData', JSON.stringify(this.gameData));
        } catch (e) {
            console.warn('无法保存游戏数据到本地存储:', e);
        }
    }

    saveScore() {
        const sizeKey = this.size.toString();
        const score = {
            steps: this.steps,
            time: this.timer,
            mode: this.mode,
            date: new Date().toLocaleDateString('zh-CN')
        };

        if (!this.leaderboard[sizeKey]) {
            this.leaderboard[sizeKey] = [];
        }

        this.leaderboard[sizeKey].push(score);
        this.leaderboard[sizeKey].sort((a, b) => {
            if (a.steps !== b.steps) return a.steps - b.steps;
            return a.time - b.time;
        });

        this.leaderboard[sizeKey] = this.leaderboard[sizeKey].slice(0, 10);
        this.saveLeaderboard();
    }

    showLeaderboard() {
        this.switchLeaderboardTab(this.size);
        this.leaderboardModal.classList.add('show');
    }

    switchLeaderboardTab(size) {
        this.leaderboardTabs.forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.dataset.size) === size) {
                tab.classList.add('active');
            }
        });

        this.renderLeaderboard(size);
    }

    renderLeaderboard(size) {
        const sizeKey = size.toString();
        const scores = this.leaderboard[sizeKey] || [];

        if (scores.length === 0) {
            this.leaderboardList.innerHTML = '<div class="leaderboard-empty">暂无记录，快来挑战吧！</div>';
            return;
        }

        this.leaderboardList.innerHTML = scores.map((score, index) => `
            <div class="leaderboard-item rank-${index + 1}">
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-steps">${score.steps}步</span>
                <span class="leaderboard-time">${this.formatTime(score.time)}</span>
                <span class="leaderboard-date">${score.date}</span>
            </div>
        `).join('');
    }

    render() {
        this.gameBoard.dataset.size = this.size;
        this.stepsElement.textContent = this.steps;
        this.updateTimerDisplay();
        this.updateCountdownDisplay();
        this.undoBtn.disabled = !this.lastMove;
        this.updatePowerUpDisplay();
        this.clearHints();

        this.gameBoard.innerHTML = '';
        this.board.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile';
            tileElement.dataset.index = index;

            if (tile === 0) {
                tileElement.classList.add('empty');
            } else {
                tileElement.textContent = tile;
                tileElement.dataset.number = tile;
                tileElement.addEventListener('click', () => this.moveTile(index));
                this.setupDragEvents(tileElement, index, 'single');
            }

            this.gameBoard.appendChild(tileElement);
        });
    }

    setupDragEvents(element, index, player) {
        let isDragging = false;
        let startX, startY;

        element.addEventListener('mousedown', (e) => {
            if (this.gameOver && player === 'single') return;
            if (player === 'p1' && this.p1.gameOver) return;
            if (player === 'p2' && this.p2.gameOver) return;
            if (player !== 'single' && !this.battleStarted) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            this.dragging = { element, index, player };
            element.classList.add('dragging');
        });

        element.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        element.addEventListener('mouseup', (e) => {
            if (!isDragging || !this.dragging) return;
            isDragging = false;
            element.classList.remove('dragging');
            element.style.transform = '';

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            this.handleDragEnd(index, dx, dy, player);
            this.dragging = null;
        });

        element.addEventListener('mouseleave', (e) => {
            if (!isDragging || !this.dragging) return;
            isDragging = false;
            element.classList.remove('dragging');
            element.style.transform = '';
            this.dragging = null;
        });

        element.addEventListener('touchstart', (e) => {
            if (this.gameOver && player === 'single') return;
            if (player === 'p1' && this.p1.gameOver) return;
            if (player === 'p2' && this.p2.gameOver) return;
            if (player !== 'single' && !this.battleStarted) return;
            
            e.preventDefault();
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.dragging = { element, index, player };
            element.classList.add('dragging');
        }, { passive: false });

        element.addEventListener('touchmove', (e) => {
            if (!isDragging || !this.dragging) return;
            e.preventDefault();
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            element.style.transform = `translate(${dx}px, ${dy}px)`;
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            if (!isDragging || !this.dragging) return;
            e.preventDefault();
            isDragging = false;
            element.classList.remove('dragging');
            element.style.transform = '';

            const touch = e.changedTouches[0];
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;

            this.handleDragEnd(index, dx, dy, player);
            this.dragging = null;
        }, { passive: false });
    }

    handleDragEnd(index, dx, dy, player) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) < 30) return;

        let targetIndex;
        const size = player === 'single' ? this.size : 3;

        if (absDx > absDy) {
            targetIndex = dx > 0 ? index + 1 : index - 1;
        } else {
            targetIndex = dy > 0 ? index + size : index - size;
        }

        if (player === 'single') {
            if (targetIndex === this.emptyIndex && this.getNeighbors(index).includes(targetIndex)) {
                this.moveTile(index);
            }
        } else {
            const playerData = player === 'p1' ? this.p1 : this.p2;
            if (targetIndex === playerData.emptyIndex && this.getBattleNeighbors(index, size).includes(targetIndex)) {
                this.moveBattleTile(index, player);
            }
        }
    }

    initBattle() {
        this.battleStarted = false;
        this.p1.gameOver = false;
        this.p2.gameOver = false;
        this.p1.steps = 0;
        this.p2.steps = 0;
        this.p1.timer = 0;
        this.p2.timer = 0;
        this.p1Status.textContent = '';
        this.p2Status.textContent = '';
        
        const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        const shuffledBoard = this.generateShuffledBoard(winState, 3);
        
        this.p1.board = [...shuffledBoard];
        this.p2.board = [...shuffledBoard];
        this.p1.emptyIndex = shuffledBoard.indexOf(0);
        this.p2.emptyIndex = shuffledBoard.indexOf(0);
        
        this.renderBattle();
    }

    generateShuffledBoard(winState, size) {
        const board = [...winState];
        let emptyIndex = size * size - 1;
        
        const moves = 150;
        for (let i = 0; i < moves; i++) {
            const neighbors = this.getBattleNeighbors(emptyIndex, size);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            const temp = board[randomNeighbor];
            board[randomNeighbor] = board[emptyIndex];
            board[emptyIndex] = temp;
            emptyIndex = randomNeighbor;
        }
        
        const isWin = board.every((tile, index) => tile === winState[index]);
        if (isWin) {
            return this.generateShuffledBoard(winState, size);
        }
        
        return board;
    }

    getBattleNeighbors(index, size) {
        const neighbors = [];
        const row = Math.floor(index / size);
        const col = index % size;

        if (row > 0) neighbors.push(index - size);
        if (row < size - 1) neighbors.push(index + size);
        if (col > 0) neighbors.push(index - 1);
        if (col < size - 1) neighbors.push(index + 1);

        return neighbors;
    }

    startBattle() {
        if (this.battleStarted) return;
        
        this.battleStarted = true;
        this.p1Status.textContent = '游戏中...';
        this.p2Status.textContent = '游戏中...';
        
        const startTime = Date.now();
        
        this.p1TimerInterval = setInterval(() => {
            if (!this.p1.gameOver) {
                this.p1.timer = Math.floor((Date.now() - startTime) / 1000);
                this.p1Timer.textContent = this.formatTime(this.p1.timer);
            }
        }, 1000);
        
        this.p2TimerInterval = setInterval(() => {
            if (!this.p2.gameOver) {
                this.p2.timer = Math.floor((Date.now() - startTime) / 1000);
                this.p2Timer.textContent = this.formatTime(this.p2.timer);
            }
        }, 1000);
    }

    resetBattle() {
        this.stopBattleTimers();
        this.initBattle();
    }

    stopBattleTimers() {
        if (this.p1TimerInterval) {
            clearInterval(this.p1TimerInterval);
            this.p1TimerInterval = null;
        }
        if (this.p2TimerInterval) {
            clearInterval(this.p2TimerInterval);
            this.p2TimerInterval = null;
        }
    }

    moveBattleTile(index, player) {
        const playerData = player === 'p1' ? this.p1 : this.p2;
        
        if (playerData.gameOver) return;
        if (playerData.board[index] === 0) return;

        const neighbors = this.getBattleNeighbors(index, 3);
        if (neighbors.includes(playerData.emptyIndex)) {
            const temp = playerData.board[index];
            playerData.board[index] = playerData.board[playerData.emptyIndex];
            playerData.board[playerData.emptyIndex] = temp;
            playerData.emptyIndex = index;
            playerData.steps++;
            
            this.renderBattle();
            this.checkBattleWin(player);
        }
    }

    checkBattleWin(player) {
        const playerData = player === 'p1' ? this.p1 : this.p2;
        const winState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        
        const isWin = playerData.board.every((tile, index) => tile === winState[index]);
        
        if (isWin) {
            playerData.gameOver = true;
            
            if (player === 'p1') {
                this.p1Status.textContent = '✓ 完成！';
            } else {
                this.p2Status.textContent = '✓ 完成！';
            }
            
            if (this.p1.gameOver && this.p2.gameOver) {
                this.endBattle();
            }
        }
    }

    endBattle() {
        this.stopBattleTimers();
        this.battleStarted = false;
        
        let winner, message;
        
        if (this.p1.steps < this.p2.steps) {
            winner = '玩家 1';
            message = `玩家 1 用 ${this.p1.steps} 步击败玩家 2 的 ${this.p2.steps} 步！`;
        } else if (this.p2.steps < this.p1.steps) {
            winner = '玩家 2';
            message = `玩家 2 用 ${this.p2.steps} 步击败玩家 1 的 ${this.p1.steps} 步！`;
        } else {
            if (this.p1.timer < this.p2.timer) {
                winner = '玩家 1';
                message = `步数相同！玩家 1 用时更短（${this.formatTime(this.p1.timer)}）`;
            } else if (this.p2.timer < this.p1.timer) {
                winner = '玩家 2';
                message = `步数相同！玩家 2 用时更短（${this.formatTime(this.p2.timer)}）`;
            } else {
                winner = '平局';
                message = `双方步数（${this.p1.steps}步）和用时（${this.formatTime(this.p1.timer)}）完全相同！`;
            }
        }
        
        this.battleResultTitle.textContent = winner === '平局' ? '🤝 平局！' : `🏆 ${winner} 获胜！`;
        this.battleResultMessage.innerHTML = message;
        this.battleResultModal.classList.add('show');
    }

    renderBattle() {
        this.p1Steps.textContent = this.p1.steps;
        this.p2Steps.textContent = this.p2.steps;
        this.p1Timer.textContent = this.formatTime(this.p1.timer);
        this.p2Timer.textContent = this.formatTime(this.p2.timer);
        
        this.renderPlayerBoard(this.p1Board, this.p1.board, 'p1');
        this.renderPlayerBoard(this.p2Board, this.p2.board, 'p2');
    }

    renderPlayerBoard(boardElement, board, player) {
        boardElement.dataset.size = 3;
        boardElement.innerHTML = '';
        
        board.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'tile';
            tileElement.dataset.index = index;

            if (tile === 0) {
                tileElement.classList.add('empty');
            } else {
                tileElement.textContent = tile;
                tileElement.dataset.number = tile;
                tileElement.addEventListener('click', () => this.moveBattleTile(index, player));
                this.setupDragEvents(tileElement, index, player);
            }

            boardElement.appendChild(tileElement);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SlidingPuzzle();
});
