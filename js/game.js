const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 30;
const NEXT_CELL_SIZE = 25;
const INITIAL_SPEED = 1000;
const SPEED_DECREASE = 50;
const MIN_SPEED = 100;
const LINES_PER_LEVEL = 10;

const SCORE = {
    1: 100,
    2: 300,
    3: 600,
    4: 1000
};

const COLORS = {
    I: '#00f5ff',
    O: '#ffd700',
    T: '#9b59b6',
    L: '#ff8c00',
    J: '#3498db',
    S: '#2ecc71',
    Z: '#e74c3c',
    EMPTY: 'rgba(255, 255, 255, 0.05)',
    GRID: 'rgba(255, 255, 255, 0.1)'
};

const SHAPES = {
    I: [
        [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
        [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
        [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
        [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
    ],
    O: [
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1], [1, 1]]
    ],
    T: [
        [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
        [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
    ],
    L: [
        [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
        [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
        [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
    ],
    J: [
        [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
        [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
        [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
    ],
    S: [
        [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
        [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
        [[1, 0, 0], [1, 1, 0], [0, 1, 0]]
    ],
    Z: [
        [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
        [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
        [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
        [[0, 1, 0], [1, 1, 0], [1, 0, 0]]
    ]
};

let canvas, ctx;
let nextCanvas, nextCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let gameSpeed = INITIAL_SPEED;
let isPlaying = false;
let isPaused = false;
let lastTime = 0;
let dropCounter = 0;

let gameOverlay, statusMessage, startBtn;
let scoreEl, levelEl, linesEl;
let gameBoardWrapper, effectLayer;

function init() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-piece');
    nextCtx = nextCanvas.getContext('2d');
    
    gameOverlay = document.getElementById('game-overlay');
    statusMessage = document.getElementById('game-status');
    startBtn = document.getElementById('start-btn');
    scoreEl = document.getElementById('score');
    levelEl = document.getElementById('level');
    linesEl = document.getElementById('lines');
    gameBoardWrapper = document.querySelector('.game-board-wrapper');
    effectLayer = document.getElementById('effect-layer');
    
    startBtn.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyDown);
    
    resetBoard();
    drawBoard();
    drawNextPiece();
}

function resetBoard() {
    board = [];
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }
}

function createPiece(type) {
    return {
        type: type,
        rotation: 0,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0][0].length / 2),
        y: 0,
        matrix: SHAPES[type][0]
    };
}

function getRandomPiece() {
    const types = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
    const randomIndex = Math.floor(Math.random() * types.length);
    return createPiece(types[randomIndex]);
}

function rotatePiece(piece) {
    const nextRotation = (piece.rotation + 1) % 4;
    const newMatrix = SHAPES[piece.type][nextRotation];
    
    const originalMatrix = piece.matrix;
    piece.matrix = newMatrix;
    piece.rotation = nextRotation;
    
    if (checkCollision(piece)) {
        if (!tryWallKick(piece, originalMatrix, nextRotation)) {
            piece.matrix = originalMatrix;
            piece.rotation = (nextRotation + 3) % 4;
        }
    }
}

function tryWallKick(piece, originalMatrix, nextRotation) {
    const kicks = [0, -1, 1, -2, 2];
    
    for (let kick of kicks) {
        piece.x += kick;
        if (!checkCollision(piece)) {
            return true;
        }
        piece.x -= kick;
    }
    
    return false;
}

function checkCollision(piece, offsetX = 0, offsetY = 0) {
    for (let row = 0; row < piece.matrix.length; row++) {
        for (let col = 0; col < piece.matrix[row].length; col++) {
            if (piece.matrix[row][col]) {
                const newX = piece.x + col + offsetX;
                const newY = piece.y + row + offsetY;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function movePiece(dx, dy) {
    if (!checkCollision(currentPiece, dx, dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

function dropPiece() {
    if (!movePiece(0, 1)) {
        lockPiece();
    }
}

function lockPiece() {
    for (let row = 0; row < currentPiece.matrix.length; row++) {
        for (let col = 0; col < currentPiece.matrix[row].length; col++) {
            if (currentPiece.matrix[row][col]) {
                const boardY = currentPiece.y + row;
                const boardX = currentPiece.x + col;
                
                if (boardY < 0) {
                    gameOver();
                    return;
                }
                
                board[boardY][boardX] = currentPiece.type;
            }
        }
    }
    
    clearLines();
    spawnNextPiece();
}

function clearLines() {
    let linesCleared = 0;
    let clearedRows = [];
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== null)) {
            linesCleared++;
            clearedRows.push(row);
            showLineClearEffect(row);
        }
    }
    
    if (linesCleared > 0) {
        for (let row of clearedRows) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(null));
        }
        
        lines += linesCleared;
        score += SCORE[linesCleared];
        
        const newLevel = Math.floor(lines / LINES_PER_LEVEL) + 1;
        if (newLevel > level) {
            level = newLevel;
            gameSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (level - 1) * SPEED_DECREASE);
        }
        
        updateUI();
        showScorePopup(linesCleared);
        triggerCelebrateEffect();
    }
}

function showLineClearEffect(row) {
    const effect = document.createElement('div');
    effect.className = 'line-clear-effect';
    effect.style.top = (row * CELL_SIZE) + 'px';
    effectLayer.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 500);
}

function showScorePopup(linesCleared) {
    const points = SCORE[linesCleared];
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;
    popup.style.left = '50%';
    popup.style.top = '40%';
    popup.style.transform = 'translateX(-50%)';
    effectLayer.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

function triggerCelebrateEffect() {
    gameBoardWrapper.classList.remove('celebrate-effect');
    void gameBoardWrapper.offsetWidth;
    gameBoardWrapper.classList.add('celebrate-effect');
    
    setTimeout(() => {
        gameBoardWrapper.classList.remove('celebrate-effect');
    }, 600);
}

function triggerFailEffect() {
    gameBoardWrapper.classList.remove('flash-effect');
    void gameBoardWrapper.offsetWidth;
    gameBoardWrapper.classList.add('flash-effect');
    
    setTimeout(() => {
        gameBoardWrapper.classList.remove('flash-effect');
    }, 500);
}

function spawnNextPiece() {
    currentPiece = nextPiece || getRandomPiece();
    nextPiece = getRandomPiece();
    
    if (checkCollision(currentPiece)) {
        gameOver();
        return;
    }
    
    drawNextPiece();
}

function drawBoard() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;
            
            if (board[row][col]) {
                drawCell(ctx, x, y, COLORS[board[row][col]], CELL_SIZE);
            } else {
                drawGridCell(ctx, x, y, CELL_SIZE);
            }
        }
    }
}

function drawGridCell(context, x, y, size) {
    context.fillStyle = COLORS.EMPTY;
    context.fillRect(x + 1, y + 1, size - 2, size - 2);
    
    context.strokeStyle = COLORS.GRID;
    context.lineWidth = 1;
    context.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}

function drawCell(context, x, y, color, size) {
    const gradient = context.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, lightenColor(color, 40));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, darkenColor(color, 30));
    
    context.fillStyle = gradient;
    context.fillRect(x + 2, y + 2, size - 4, size - 4);
    
    context.strokeStyle = lightenColor(color, 60);
    context.lineWidth = 2;
    context.strokeRect(x + 2, y + 2, size - 4, size - 4);
    
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x + 4, y + 4, (size - 8) / 2, (size - 8) / 4);
}

function drawCurrentPiece() {
    if (!currentPiece) return;
    
    for (let row = 0; row < currentPiece.matrix.length; row++) {
        for (let col = 0; col < currentPiece.matrix[row].length; col++) {
            if (currentPiece.matrix[row][col]) {
                const x = (currentPiece.x + col) * CELL_SIZE;
                const y = (currentPiece.y + row) * CELL_SIZE;
                
                if (y >= 0) {
                    drawCell(ctx, x, y, COLORS[currentPiece.type], CELL_SIZE);
                }
            }
        }
    }
}

function drawGhostPiece() {
    if (!currentPiece) return;
    
    let ghostY = currentPiece.y;
    while (!checkCollision(currentPiece, 0, ghostY - currentPiece.y + 1)) {
        ghostY++;
    }
    
    if (ghostY === currentPiece.y) return;
    
    ctx.globalAlpha = 0.3;
    for (let row = 0; row < currentPiece.matrix.length; row++) {
        for (let col = 0; col < currentPiece.matrix[row].length; col++) {
            if (currentPiece.matrix[row][col]) {
                const x = (currentPiece.x + col) * CELL_SIZE;
                const y = (ghostY + row) * CELL_SIZE;
                
                if (y >= 0) {
                    drawCell(ctx, x, y, COLORS[currentPiece.type], CELL_SIZE);
                }
            }
        }
    }
    ctx.globalAlpha = 1;
}

function drawNextPiece() {
    nextCtx.fillStyle = '#1a1a2e';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (!nextPiece) return;
    
    const matrix = nextPiece.matrix;
    const offsetX = (nextCanvas.width - matrix[0].length * NEXT_CELL_SIZE) / 2;
    const offsetY = (nextCanvas.height - matrix.length * NEXT_CELL_SIZE) / 2;
    
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col]) {
                const x = offsetX + col * NEXT_CELL_SIZE;
                const y = offsetY + row * NEXT_CELL_SIZE;
                drawCell(nextCtx, x, y, COLORS[nextPiece.type], NEXT_CELL_SIZE);
            }
        }
    }
}

function render() {
    drawBoard();
    drawGhostPiece();
    drawCurrentPiece();
}

function gameUpdate(time) {
    if (!isPlaying) {
        gameLoop = null;
        return;
    }
    
    if (isPaused) {
        gameLoop = requestAnimationFrame(gameUpdate);
        return;
    }
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > gameSpeed) {
        dropPiece();
        dropCounter = 0;
    }
    
    render();
    gameLoop = requestAnimationFrame(gameUpdate);
}

function startGame() {
    resetBoard();
    score = 0;
    level = 1;
    lines = 0;
    gameSpeed = INITIAL_SPEED;
    isPlaying = true;
    isPaused = false;
    dropCounter = 0;
    lastTime = performance.now();
    
    updateUI();
    
    nextPiece = getRandomPiece();
    spawnNextPiece();
    
    gameOverlay.classList.add('hidden');
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    gameLoop = requestAnimationFrame(gameUpdate);
}

function pauseGame() {
    if (!isPlaying) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        statusMessage.textContent = '游戏暂停';
        startBtn.textContent = '继续游戏';
        gameOverlay.classList.remove('hidden');
    } else {
        statusMessage.textContent = '按空格键暂停';
        gameOverlay.classList.add('hidden');
    }
}

function gameOver() {
    isPlaying = false;
    triggerFailEffect();
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    statusMessage.textContent = '游戏结束！最终分数：' + score;
    startBtn.textContent = '重新开始';
    gameOverlay.classList.remove('hidden');
}

function updateUI() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
}

function handleKeyDown(e) {
    if (!isPlaying) {
        if (e.code === 'Space') {
            e.preventDefault();
            startGame();
        }
        return;
    }
    
    if (e.code === 'Space') {
        e.preventDefault();
        pauseGame();
        return;
    }
    
    if (isPaused) return;
    
    switch (e.code) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (movePiece(0, 1)) {
                score += 1;
                updateUI();
            }
            dropCounter = 0;
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece(currentPiece);
            break;
    }
    
    render();
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

document.addEventListener('DOMContentLoaded', init);
