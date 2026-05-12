const GameConfig = {
    BOARD_SIZE: 15,
    BASE_CELL_SIZE: 36,
    PADDING: 20,
    WIN_COUNT: 5
};

const GameState = {
    board: [],
    currentPlayer: 'black',
    gameOver: false,
    winner: null,
    moveCount: 0,
    gameMode: 'pvp',
    difficulty: 'medium',
    moveHistory: [],
    isAIGame: false
};

let canvas, ctx, boardPixelSize, cellSize;

const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 }
];

function initGame() {
    try {
        canvas = document.getElementById('game-board');
        if (!canvas) {
            throw new Error('Canvas元素未找到');
        }
        
        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法获取Canvas绘图上下文');
        }
        
        setupCanvas();
        initializeBoard();
        setupEventListeners();
        renderBoard();
        updateUI();
        loadLeaderboards();
    } catch (error) {
        console.error('游戏初始化失败:', error);
        showError('游戏初始化失败，请刷新页面重试');
    }
}

function setupCanvas() {
    const baseBoardPixelSize = GameConfig.BOARD_SIZE * GameConfig.BASE_CELL_SIZE + GameConfig.PADDING * 2;
    
    const maxSize = Math.min(window.innerWidth - 80, 560);
    const scale = Math.min(maxSize / baseBoardPixelSize, 1);
    
    if (scale < 1) {
        boardPixelSize = maxSize;
        cellSize = (boardPixelSize - GameConfig.PADDING * 2) / GameConfig.BOARD_SIZE;
    } else {
        boardPixelSize = baseBoardPixelSize;
        cellSize = GameConfig.BASE_CELL_SIZE;
    }
    
    canvas.width = boardPixelSize;
    canvas.height = boardPixelSize;
}

function initializeBoard() {
    GameState.board = [];
    for (let i = 0; i < GameConfig.BOARD_SIZE; i++) {
        GameState.board[i] = [];
        for (let j = 0; j < GameConfig.BOARD_SIZE; j++) {
            GameState.board[i][j] = null;
        }
    }
    GameState.currentPlayer = 'black';
    GameState.gameOver = false;
    GameState.winner = null;
    GameState.moveCount = 0;
    GameState.moveHistory = [];
    GameState.isAIGame = GameState.gameMode === 'pve';
}

function setupEventListeners() {
    canvas.addEventListener('click', handleBoardClick);
    
    const resetBtn = document.getElementById('reset-btn');
    const undoBtn = document.getElementById('undo-btn');
    const modalResetBtn = document.getElementById('modal-reset-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const clearRecordsBtn = document.getElementById('clear-records');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }
    
    if (undoBtn) {
        undoBtn.addEventListener('click', undoMove);
    }
    
    if (modalResetBtn) {
        modalResetBtn.addEventListener('click', () => {
            hideModal();
            resetGame();
        });
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', hideModal);
    }
    
    if (clearRecordsBtn) {
        clearRecordsBtn.addEventListener('click', handleClearRecords);
    }
    
    setupModeButtons();
    setupDifficultySelect();
    setupLeaderboardTabs();
    
    window.addEventListener('resize', handleResize);
}

function setupModeButtons() {
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setGameMode(mode);
        });
    });
}

function setupDifficultySelect() {
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            GameState.difficulty = e.target.value;
            if (!GameState.gameOver && GameState.moveCount === 0) {
                resetGame();
            }
        });
    }
}

function setupLeaderboardTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchLeaderboardTab(tab);
        });
    });
}

function switchLeaderboardTab(tab) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    const pvpContent = document.getElementById('leaderboard-pvp');
    const pveContent = document.getElementById('leaderboard-pve');
    
    if (pvpContent && pveContent) {
        pvpContent.classList.toggle('hidden', tab !== 'pvp');
        pveContent.classList.toggle('hidden', tab !== 'pve');
    }
}

function setGameMode(mode) {
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    const difficultySelect = document.getElementById('difficulty-select');
    if (difficultySelect) {
        difficultySelect.classList.toggle('hidden', mode !== 'pve');
    }
    
    GameState.gameMode = mode;
    resetGame();
}

function handleResize() {
    const prevCellSize = cellSize;
    setupCanvas();
    
    if (cellSize !== prevCellSize) {
        renderBoard();
    }
}

function renderBoard() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawStarPoints();
    drawAllPieces();
}

function drawGrid() {
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < GameConfig.BOARD_SIZE; i++) {
        const position = GameConfig.PADDING + i * cellSize;
        
        ctx.moveTo(position, GameConfig.PADDING);
        ctx.lineTo(position, boardPixelSize - GameConfig.PADDING);
        
        ctx.moveTo(GameConfig.PADDING, position);
        ctx.lineTo(boardPixelSize - GameConfig.PADDING, position);
    }
    
    ctx.stroke();
}

function drawStarPoints() {
    if (!ctx) return;
    
    const starPoints = [
        { x: 3, y: 3 },
        { x: 3, y: 11 },
        { x: 11, y: 3 },
        { x: 11, y: 11 },
        { x: 7, y: 7 }
    ];
    
    ctx.fillStyle = '#5D4037';
    
    starPoints.forEach(point => {
        const x = GameConfig.PADDING + point.x * cellSize;
        const y = GameConfig.PADDING + point.y * cellSize;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAllPieces() {
    for (let row = 0; row < GameConfig.BOARD_SIZE; row++) {
        for (let col = 0; col < GameConfig.BOARD_SIZE; col++) {
            if (GameState.board[row][col]) {
                drawPiece(row, col, GameState.board[row][col]);
            }
        }
    }
}

function drawPiece(row, col, color) {
    if (!ctx) return;
    
    const x = GameConfig.PADDING + col * cellSize;
    const y = GameConfig.PADDING + row * cellSize;
    const radius = cellSize * 0.42;
    
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        0,
        x,
        y,
        radius
    );
    
    if (color === 'black') {
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#111');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    if (color === 'white') {
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function handleBoardClick(event) {
    if (GameState.gameOver) {
        return;
    }
    
    if (GameState.isAIGame && GameState.currentPlayer !== 'black') {
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const col = Math.round((clickX - GameConfig.PADDING) / cellSize);
    const row = Math.round((clickY - GameConfig.PADDING) / cellSize);
    
    if (!isValidPosition(row, col)) {
        flashPosition(row, col, 'invalid');
        return;
    }
    
    if (GameState.board[row][col] !== null) {
        flashPosition(row, col, 'occupied');
        return;
    }
    
    placePiece(row, col);
}

function isValidPosition(row, col) {
    return row >= 0 && row < GameConfig.BOARD_SIZE && 
           col >= 0 && col < GameConfig.BOARD_SIZE;
}

function flashPosition(row, col, type) {
    if (!isValidPosition(row, col) || !ctx) {
        return;
    }
    
    const x = GameConfig.PADDING + col * cellSize;
    const y = GameConfig.PADDING + row * cellSize;
    const radius = cellSize * 0.35;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = type === 'occupied' ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 165, 0, 0.5)';
    ctx.fill();
    
    setTimeout(() => {
        renderBoard();
    }, 200);
}

function placePiece(row, col) {
    GameState.board[row][col] = GameState.currentPlayer;
    GameState.moveCount++;
    
    GameState.moveHistory.push({
        row,
        col,
        player: GameState.currentPlayer
    });
    
    drawPiece(row, col, GameState.currentPlayer);
    updateUI();
    
    if (checkWin(row, col)) {
        GameState.gameOver = true;
        GameState.winner = GameState.currentPlayer;
        handleGameEnd();
        return;
    }
    
    GameState.currentPlayer = GameState.currentPlayer === 'black' ? 'white' : 'black';
    updateUI();
    
    if (GameState.isAIGame && GameState.currentPlayer === 'white') {
        setTimeout(() => {
            makeAIMove();
        }, 300);
    }
}

function makeAIMove() {
    if (GameState.gameOver) {
        return;
    }
    
    try {
        const aiMove = GomokuAI.getBestMove(
            GameState.board,
            'white',
            'black',
            GameState.difficulty
        );
        
        if (aiMove && isValidPosition(aiMove.row, aiMove.col) && GameState.board[aiMove.row][aiMove.col] === null) {
            placePiece(aiMove.row, aiMove.col);
        }
    } catch (error) {
        console.error('AI下棋失败:', error);
    }
}

function checkWin(row, col) {
    const color = GameState.board[row][col];
    if (!color) return false;
    
    for (const dir of directions) {
        const count = 1 + 
            countInDirection(row, col, dir.dx, dir.dy, color) + 
            countInDirection(row, col, -dir.dx, -dir.dy, color);
        
        if (count >= GameConfig.WIN_COUNT) {
            return true;
        }
    }
    
    return false;
}

function countInDirection(startRow, startCol, dx, dy, color) {
    let count = 0;
    let row = startRow + dx;
    let col = startCol + dy;
    
    while (isValidPosition(row, col) && GameState.board[row][col] === color) {
        count++;
        row += dx;
        col += dy;
    }
    
    return count;
}

function handleGameEnd() {
    let winnerType, winnerText;
    
    if (GameState.gameMode === 'pvp') {
        winnerType = GameState.winner;
        winnerText = GameState.winner === 'black' ? '黑棋' : '白棋';
    } else {
        if (GameState.winner === 'black') {
            winnerType = 'player';
            winnerText = '玩家';
        } else {
            winnerType = 'computer';
            winnerText = '电脑';
        }
    }
    
    Leaderboard.addRecord(
        GameState.gameMode,
        winnerType,
        GameState.moveCount,
        GameState.gameMode === 'pve' ? GameState.difficulty : null
    );
    
    loadLeaderboards();
    showWinModal(winnerText, winnerType);
}

function updateUI() {
    updateTurnIndicator();
    updateMoveCount();
    updateModeDisplay();
    updateUndoButton();
}

function updateTurnIndicator() {
    const indicator = document.getElementById('current-player');
    if (!indicator) return;
    
    let playerText, playerClass;
    
    if (GameState.isAIGame && GameState.currentPlayer === 'white') {
        playerText = '电脑';
        playerClass = 'white';
    } else if (GameState.isAIGame) {
        playerText = '玩家';
        playerClass = 'black';
    } else {
        playerText = GameState.currentPlayer === 'black' ? '黑棋' : '白棋';
        playerClass = GameState.currentPlayer;
    }
    
    indicator.textContent = playerText;
    indicator.className = 'player-indicator ' + playerClass;
}

function updateMoveCount() {
    const moveCountEl = document.getElementById('move-count');
    if (moveCountEl) {
        moveCountEl.textContent = GameState.moveCount.toString();
    }
}

function updateModeDisplay() {
    const modeDisplay = document.getElementById('game-mode');
    if (modeDisplay) {
        if (GameState.gameMode === 'pve') {
            const difficultyLabels = { easy: '简单', medium: '中等', hard: '困难' };
            modeDisplay.textContent = `人机对战 (${difficultyLabels[GameState.difficulty] || '中等'})`;
        } else {
            modeDisplay.textContent = '双人对战';
        }
    }
}

function updateUndoButton() {
    const undoBtn = document.getElementById('undo-btn');
    if (!undoBtn) return;
    
    const canUndo = !GameState.gameOver && GameState.moveHistory.length > 0;
    undoBtn.disabled = !canUndo;
}

function undoMove() {
    if (GameState.gameOver || GameState.moveHistory.length === 0) {
        return;
    }
    
    const movesToUndo = GameState.isAIGame && GameState.currentPlayer === 'black' && GameState.moveHistory.length >= 2 ? 2 : 1;
    
    for (let i = 0; i < movesToUndo && GameState.moveHistory.length > 0; i++) {
        const lastMove = GameState.moveHistory.pop();
        GameState.board[lastMove.row][lastMove.col] = null;
        GameState.currentPlayer = lastMove.player;
        GameState.moveCount--;
    }
    
    renderBoard();
    updateUI();
}

function showWinModal(winnerText, winnerType) {
    const modal = document.getElementById('game-modal');
    const winnerMessage = document.getElementById('winner-message');
    const statsInfo = document.getElementById('game-stats-info');
    
    if (!modal || !winnerMessage) return;
    
    winnerMessage.innerHTML = `🎉 <span class="winner-${winnerType}">${winnerText}</span> 获胜！`;
    
    if (statsInfo) {
        statsInfo.textContent = `总步数：${GameState.moveCount} 步`;
    }
    
    modal.classList.remove('hidden');
}

function hideModal() {
    const modal = document.getElementById('game-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function resetGame() {
    hideModal();
    initializeBoard();
    renderBoard();
    updateUI();
}

function loadLeaderboards() {
    if (typeof Leaderboard !== 'undefined') {
        Leaderboard.renderLeaderboard('pvp', 'leaderboard-pvp');
        Leaderboard.renderLeaderboard('pve', 'leaderboard-pve');
    }
}

function handleClearRecords() {
    if (confirm('确定要清空所有排行榜记录吗？此操作不可恢复。')) {
        if (typeof Leaderboard !== 'undefined') {
            Leaderboard.clearAllRecords();
            loadLeaderboards();
        }
    }
}

function showError(message) {
    alert(message);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
