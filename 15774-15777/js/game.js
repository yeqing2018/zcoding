const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetBtn');
const timerDisplay = document.getElementById('timer');
const xWinsDisplay = document.getElementById('xWins');
const oWinsDisplay = document.getElementById('oWins');
const drawsDisplay = document.getElementById('draws');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

let gameStartTime = null;
let timerInterval = null;
let elapsedSeconds = 0;

let stats = {
    xWins: 0,
    oWins: 0,
    draws: 0
};

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function loadStats() {
    const savedStats = localStorage.getItem('ticTacToeStats');
    if (savedStats) {
        try {
            const parsedStats = JSON.parse(savedStats);
            if (
                typeof parsedStats === 'object' &&
                parsedStats !== null &&
                typeof parsedStats.xWins === 'number' &&
                typeof parsedStats.oWins === 'number' &&
                typeof parsedStats.draws === 'number'
            ) {
                stats.xWins = Math.max(0, Math.floor(parsedStats.xWins));
                stats.oWins = Math.max(0, Math.floor(parsedStats.oWins));
                stats.draws = Math.max(0, Math.floor(parsedStats.draws));
            }
        } catch (e) {
            console.warn('读取战绩数据失败，已重置为默认值:', e);
        }
    }
    updateStatsDisplay();
}

function saveStats() {
    try {
        localStorage.setItem('ticTacToeStats', JSON.stringify(stats));
    } catch (e) {
        console.warn('保存战绩数据失败:', e);
    }
}

function updateStatsDisplay() {
    xWinsDisplay.textContent = stats.xWins;
    oWinsDisplay.textContent = stats.oWins;
    drawsDisplay.textContent = stats.draws;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `用时: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    stopTimer();
    gameStartTime = Date.now();
    elapsedSeconds = 0;
    timerDisplay.textContent = formatTime(0);
    
    timerInterval = setInterval(() => {
        elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
        timerDisplay.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    if (!timerInterval) {
        startTimer();
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('filled', currentPlayer.toLowerCase());

    handleResultValidation();
}

function handleResultValidation() {
    let roundWon = false;
    let winningCombination = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winningCondition = winningConditions[i];
        let a = gameState[winningCondition[0]];
        let b = gameState[winningCondition[1]];
        let c = gameState[winningCondition[2]];

        if (a === '' || b === '' || c === '') {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningCombination = winningCondition;
            break;
        }
    }

    if (roundWon) {
        stopTimer();
        statusDisplay.textContent = `玩家 ${currentPlayer} 获胜！`;
        winningCombination.forEach(index => {
            cells[index].classList.add('winner');
        });
        gameActive = false;
        
        if (currentPlayer === 'X') {
            stats.xWins++;
        } else {
            stats.oWins++;
        }
        saveStats();
        updateStatsDisplay();
        return;
    }

    let roundDraw = !gameState.includes('');
    if (roundDraw) {
        stopTimer();
        statusDisplay.textContent = '平局！';
        gameActive = false;
        stats.draws++;
        saveStats();
        updateStatsDisplay();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `玩家 ${currentPlayer} 的回合`;
}

function handleResetGame() {
    stopTimer();
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    elapsedSeconds = 0;
    statusDisplay.textContent = '玩家 X 的回合';
    timerDisplay.textContent = formatTime(0);

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('filled', 'x', 'o', 'winner');
    });
}

loadStats();
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleResetGame);
