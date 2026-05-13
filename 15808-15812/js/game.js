const DIFFICULTIES = {
    easy: { rows: 9, cols: 9, mines: 10, name: '简单' },
    medium: { rows: 16, cols: 16, mines: 40, name: '中等' },
    hard: { rows: 16, cols: 30, mines: 99, name: '困难' }
};

const CUSTOM_CONFIG = {
    maxRows: 30,
    maxCols: 50,
    minRows: 5,
    minCols: 5,
    minMines: 1
};

let board = [];
let gameOver = false;
let gameWon = false;
let firstClick = true;
let flaggedCount = 0;
let currentDifficulty = 'easy';
let isCustomDifficulty = false;
let customConfig = null;
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let safeModeEnabled = false;

const gameBoard = document.getElementById('game-board');
const mineCountDisplay = document.getElementById('mine-count');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty');
const modalOverlay = document.getElementById('modal-overlay');
const modalIcon = document.getElementById('modal-icon');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalTime = document.getElementById('modal-time');
const modalClose = document.getElementById('modal-close');
const safeModeCheckbox = document.getElementById('safe-mode');
const safeModeToast = document.getElementById('safe-mode-toast');
const customRowsInput = document.getElementById('custom-rows');
const customColsInput = document.getElementById('custom-cols');
const customMinesInput = document.getElementById('custom-mines');
const minesHint = document.getElementById('mines-hint');
const startCustomBtn = document.getElementById('start-custom');
const leaderboardList = document.getElementById('leaderboard-list');

function getCurrentDifficulty() {
    if (isCustomDifficulty && customConfig) {
        return { ...customConfig, name: '自定义' };
    }
    return DIFFICULTIES[currentDifficulty];
}

function initGame() {
    const { rows, cols, mines } = getCurrentDifficulty();
    
    board = [];
    gameOver = false;
    gameWon = false;
    firstClick = true;
    flaggedCount = 0;
    elapsedTime = 0;
    
    stopTimer();
    updateTimer();
    updateMineCount();
    closeModal();
    
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
    
    renderBoard();
}

function placeMines(excludeRow, excludeCol) {
    const { rows, cols, mines } = getCurrentDifficulty();
    let minesPlaced = 0;
    
    while (minesPlaced < mines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;
        
        if (!board[row][col].isMine && !isExcluded) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    calculateNeighborMines();
}

function calculateNeighborMines() {
    const { rows, cols } = getCurrentDifficulty();
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!board[i][j].isMine) {
                board[i][j].neighborMines = countNeighborMines(i, j);
            }
        }
    }
}

function countNeighborMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (isValidCell(newRow, newCol) && board[newRow][newCol].isMine) {
                count++;
            }
        }
    }
    return count;
}

function isValidCell(row, col) {
    const { rows, cols } = getCurrentDifficulty();
    return row >= 0 && row < rows && col >= 0 && col < cols;
}

function renderBoard() {
    const { rows, cols } = getCurrentDifficulty();
    
    gameBoard.innerHTML = '';
    gameBoard.style.setProperty('--cols', cols);
    gameBoard.style.setProperty('--rows', rows);
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', (e) => handleClick(i, j, e));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(i, j);
            });
            cell.addEventListener('dblclick', () => handleDoubleClick(i, j));
            
            gameBoard.appendChild(cell);
        }
    }
}

function handleClick(row, col, event) {
    if (gameOver || gameWon) return;
    if (board[row][col].isRevealed || board[row][col].isFlagged) return;
    
    if (safeModeEnabled && !firstClick) {
        const risk = calculateRisk(row, col);
        if (risk > 0.5) {
            showToast('⚠️ 误触保护: 该位置可能有雷，请先标记周围');
            return;
        }
    }
    
    if (firstClick) {
        firstClick = false;
        placeMines(row, col);
        startTimer();
    }
    
    if (board[row][col].isMine) {
        gameOver = true;
        stopTimer();
        revealAllMines();
        showModal('lose');
        return;
    }
    
    revealCell(row, col);
    checkWin();
}

function calculateRisk(row, col) {
    const neighbors = [];
    let revealedWithNumber = 0;
    let totalUnrevealed = 0;
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (isValidCell(newRow, newCol)) {
                const cell = board[newRow][newCol];
                if (cell.isRevealed && cell.neighborMines > 0) {
                    revealedWithNumber++;
                }
                if (!cell.isRevealed && !cell.isFlagged) {
                    totalUnrevealed++;
                }
            }
        }
    }
    
    if (revealedWithNumber > 0) {
        return Math.min(1, (revealedWithNumber * 2) / (totalUnrevealed + 1));
    }
    return 0;
}

function showToast(message) {
    safeModeToast.innerHTML = `<span>${message}</span>`;
    safeModeToast.classList.add('show');
    setTimeout(() => {
        safeModeToast.classList.remove('show');
    }, 2000);
}

function handleRightClick(row, col) {
    if (gameOver || gameWon) return;
    if (board[row][col].isRevealed) return;
    
    const { mines } = getCurrentDifficulty();
    const cell = getCellElement(row, col);
    
    if (board[row][col].isFlagged) {
        board[row][col].isFlagged = false;
        cell.classList.remove('flagged');
        flaggedCount--;
    } else {
        if (flaggedCount >= mines) {
            showToast('⚠️ 旗子数量已达上限！');
            return;
        }
        board[row][col].isFlagged = true;
        cell.classList.add('flagged');
        flaggedCount++;
    }
    
    updateMineCount();
}

function handleDoubleClick(row, col) {
    if (gameOver || gameWon) return;
    if (!board[row][col].isRevealed) return;
    if (board[row][col].neighborMines === 0) return;
    
    const flaggedNeighbors = countFlaggedNeighbors(row, col);
    if (flaggedNeighbors !== board[row][col].neighborMines) return;
    
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (isValidCell(newRow, newCol) && 
                !board[newRow][newCol].isFlagged && 
                !board[newRow][newCol].isRevealed) {
                handleClick(newRow, newCol, null);
            }
        }
    }
}

function countFlaggedNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (isValidCell(newRow, newCol) && board[newRow][newCol].isFlagged) {
                count++;
            }
        }
    }
    return count;
}

function revealCell(row, col) {
    if (!isValidCell(row, col)) return;
    if (board[row][col].isRevealed || board[row][col].isFlagged || board[row][col].isMine) return;
    
    board[row][col].isRevealed = true;
    const cell = getCellElement(row, col);
    cell.classList.add('revealed');
    
    if (board[row][col].neighborMines > 0) {
        cell.textContent = board[row][col].neighborMines;
        cell.dataset.num = board[row][col].neighborMines;
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}

function revealAllMines() {
    const { rows, cols } = getCurrentDifficulty();
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].isMine) {
                const cell = getCellElement(i, j);
                cell.classList.add('revealed');
                if (board[i][j].isFlagged) {
                    cell.classList.add('correct-flag');
                } else {
                    cell.classList.add('mine');
                }
            }
        }
    }
}

function checkWin() {
    const { rows, cols, mines } = getCurrentDifficulty();
    let revealedCount = 0;
    const totalCells = rows * cols;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].isRevealed) {
                revealedCount++;
            }
        }
    }
    
    if (revealedCount === totalCells - mines) {
        gameWon = true;
        stopTimer();
        if (!isCustomDifficulty) {
            saveScore(currentDifficulty, elapsedTime);
        }
        showModal('win');
    }
}

function getCellElement(row, col) {
    const { cols } = getCurrentDifficulty();
    return gameBoard.children[row * cols + col];
}

function updateMineCount() {
    const { mines } = getCurrentDifficulty();
    mineCountDisplay.textContent = mines - flaggedCount;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        updateTimer();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showModal(type) {
    const diff = getCurrentDifficulty();
    
    if (type === 'win') {
        modalIcon.textContent = '🎉';
        modalTitle.textContent = '恭喜胜利!';
        modalMessage.textContent = `你成功清除了所有地雷!`;
    } else {
        modalIcon.textContent = '💥';
        modalTitle.textContent = '游戏失败';
        modalMessage.textContent = `很遗憾，你踩到地雷了!`;
    }
    
    modalTime.textContent = `用时: ${timerDisplay.textContent} | 难度: ${diff.name}`;
    modalOverlay.classList.add('show');
}

function closeModal() {
    modalOverlay.classList.remove('show');
}

function saveScore(difficulty, time) {
    const scores = getLeaderboard(difficulty);
    const newScore = {
        time: time,
        date: new Date().toLocaleDateString('zh-CN')
    };
    
    scores.push(newScore);
    scores.sort((a, b) => a.time - b.time);
    const topScores = scores.slice(0, 10);
    
    localStorage.setItem(`minesweeper_${difficulty}`, JSON.stringify(topScores));
    renderLeaderboard(difficulty);
}

function getLeaderboard(difficulty) {
    const data = localStorage.getItem(`minesweeper_${difficulty}`);
    return data ? JSON.parse(data) : [];
}

function renderLeaderboard(difficulty = 'easy') {
    const scores = getLeaderboard(difficulty);
    const difficultyNames = {
        easy: '简单',
        medium: '中等',
        hard: '困难'
    };
    
    document.querySelectorAll('.lb-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.diff === difficulty);
    });
    
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<p class="empty-message">暂无记录，快去挑战吧！</p>';
        return;
    }
    
    const html = scores.map((score, index) => {
        const minutes = Math.floor(score.time / 60);
        const seconds = score.time % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        let rankClass = 'lb-rank-other';
        if (index === 0) rankClass = 'lb-rank-1';
        else if (index === 1) rankClass = 'lb-rank-2';
        else if (index === 2) rankClass = 'lb-rank-3';
        
        const rankDisplay = index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1);
        
        return `
            <div class="leaderboard-item">
                <div class="lb-rank ${rankClass}">${rankDisplay}</div>
                <div class="lb-info">
                    <div class="lb-time">${timeStr}</div>
                    <div class="lb-date">${score.date}</div>
                </div>
            </div>
        `;
    }).join('');
    
    leaderboardList.innerHTML = html;
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
}

function validateCustomConfig() {
    const rows = parseInt(customRowsInput.value) || CUSTOM_CONFIG.minRows;
    const cols = parseInt(customColsInput.value) || CUSTOM_CONFIG.minCols;
    
    const maxMines = Math.floor((rows * cols - 9) * 0.8);
    minesHint.textContent = `建议: ${CUSTOM_CONFIG.minMines}-${maxMines}`;
    customMinesInput.max = maxMines;
    
    if (parseInt(customMinesInput.value) > maxMines) {
        customMinesInput.value = maxMines;
    }
}

function startCustomGame() {
    const rows = Math.max(CUSTOM_CONFIG.minRows, Math.min(CUSTOM_CONFIG.maxRows, 
        parseInt(customRowsInput.value) || CUSTOM_CONFIG.minRows));
    const cols = Math.max(CUSTOM_CONFIG.minCols, Math.min(CUSTOM_CONFIG.maxCols, 
        parseInt(customColsInput.value) || CUSTOM_CONFIG.minCols));
    const maxMines = Math.floor((rows * cols - 9) * 0.8);
    const mines = Math.max(CUSTOM_CONFIG.minMines, Math.min(maxMines, 
        parseInt(customMinesInput.value) || 1));
    
    customConfig = { rows, cols, mines };
    isCustomDifficulty = true;
    switchTab('game');
    initGame();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

document.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => renderLeaderboard(tab.dataset.diff));
});

restartBtn.addEventListener('click', initGame);
modalClose.addEventListener('click', initGame);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        initGame();
    }
});

difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    isCustomDifficulty = false;
    customConfig = null;
    initGame();
});

safeModeCheckbox.addEventListener('change', (e) => {
    safeModeEnabled = e.target.checked;
    if (safeModeEnabled) {
        showToast('🛡️ 误触保护已开启');
    }
});

customRowsInput.addEventListener('input', validateCustomConfig);
customColsInput.addEventListener('input', validateCustomConfig);
startCustomBtn.addEventListener('click', startCustomGame);

renderLeaderboard('easy');
validateCustomConfig();
initGame();
