const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const gameOverlay = document.getElementById('game-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const GAME_SPEED = 150;

let gameLoop = null;
let isPlaying = false;
let isPaused = false;
let gameOver = false;

let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = 0;

function init() {
    loadHighScore();
    updateHighScoreDisplay();
    setupEventListeners();
    showOverlay('准备开始', '点击开始按钮开始游戏');
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);
}

function handleKeyPress(e) {
    const key = e.key;
    if (!isPlaying || isPaused || gameOver) return;

    switch (key) {
        case 'ArrowUp':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
    }
}

function startGame() {
    if (gameOver) {
        resetGameState();
    }
    
    if (!isPlaying) {
        initGame();
        hideOverlay();
        isPlaying = true;
        isPaused = false;
        gameOver = false;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        startBtn.textContent = '游戏中';
        pauseBtn.textContent = '暂停';
        gameLoop = setInterval(update, GAME_SPEED);
    }
}

function togglePause() {
    if (!isPlaying || gameOver) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameLoop);
        pauseBtn.textContent = '继续';
        showOverlay('游戏暂停', '点击继续按钮继续游戏');
    } else {
        pauseBtn.textContent = '暂停';
        hideOverlay();
        gameLoop = setInterval(update, GAME_SPEED);
    }
}

function resetGame() {
    clearInterval(gameLoop);
    resetGameState();
    initGame();
    showOverlay('准备开始', '点击开始按钮开始游戏');
}

function resetGameState() {
    isPlaying = false;
    isPaused = false;
    gameOver = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '开始游戏';
    pauseBtn.textContent = '暂停';
    score = 0;
    updateScoreDisplay();
}

function initGame() {
    const startX = Math.floor(TILE_COUNT / 3);
    const startY = Math.floor(TILE_COUNT / 2);
    
    snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
    ];
    
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    updateScoreDisplay();
    generateFood();
    draw();
}

function generateFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function update() {
    direction = { ...nextDirection };
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    if (checkCollision(head)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScoreDisplay();
        checkHighScore();
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

function checkCollision(head) {
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        return true;
    }
    
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    
    return false;
}

function endGame() {
    clearInterval(gameLoop);
    isPlaying = false;
    gameOver = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.textContent = '重新开始';
    showOverlay('游戏结束', `最终得分: ${score} 分`);
}

function draw() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    drawFood();
    drawSnake();
}

function drawGrid() {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            (segment.x + 1) * GRID_SIZE,
            (segment.y + 1) * GRID_SIZE
        );
        
        if (index === 0) {
            gradient.addColorStop(0, '#22c55e');
            gradient.addColorStop(1, '#16a34a');
            ctx.fillStyle = gradient;
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 10;
        } else {
            const alpha = 1 - (index / snake.length) * 0.5;
            gradient.addColorStop(0, `rgba(74, 222, 128, ${alpha})`);
            gradient.addColorStop(1, `rgba(34, 197, 94, ${alpha})`);
            ctx.fillStyle = gradient;
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        }
        
        const padding = 1;
        ctx.fillRect(
            segment.x * GRID_SIZE + padding,
            segment.y * GRID_SIZE + padding,
            GRID_SIZE - padding * 2,
            GRID_SIZE - padding * 2
        );
        
        if (index === 0) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            drawEyes(segment);
        }
    });
}

function drawEyes(head) {
    ctx.fillStyle = '#ffffff';
    const eyeSize = 4;
    const eyeOffset = 5;
    
    let eye1X, eye1Y, eye2X, eye2Y;
    
    if (direction.x === 1) {
        eye1X = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
        eye1Y = head.y * GRID_SIZE + eyeOffset;
        eye2X = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
        eye2Y = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
    } else if (direction.x === -1) {
        eye1X = head.x * GRID_SIZE + eyeOffset;
        eye1Y = head.y * GRID_SIZE + eyeOffset;
        eye2X = head.x * GRID_SIZE + eyeOffset;
        eye2Y = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
    } else if (direction.y === -1) {
        eye1X = head.x * GRID_SIZE + eyeOffset;
        eye1Y = head.y * GRID_SIZE + eyeOffset;
        eye2X = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
        eye2Y = head.y * GRID_SIZE + eyeOffset;
    } else {
        eye1X = head.x * GRID_SIZE + eyeOffset;
        eye1Y = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
        eye2X = head.x * GRID_SIZE + GRID_SIZE - eyeOffset;
        eye2Y = head.y * GRID_SIZE + GRID_SIZE - eyeOffset;
    }
    
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
}

function drawFood() {
    const gradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        0,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2
    );
    
    gradient.addColorStop(0, '#f87171');
    gradient.addColorStop(1, '#dc2626');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function updateScoreDisplay() {
    currentScoreEl.textContent = score;
}

function updateHighScoreDisplay() {
    highScoreEl.textContent = highScore;
}

function checkHighScore() {
    if (score > highScore) {
        highScore = score;
        updateHighScoreDisplay();
        saveHighScore();
    }
}

function saveHighScore() {
    try {
        localStorage.setItem('snakeHighScore', highScore.toString());
    } catch (e) {
        console.warn('无法保存最高分到本地存储:', e);
    }
}

function loadHighScore() {
    try {
        const saved = localStorage.getItem('snakeHighScore');
        if (saved) {
            highScore = parseInt(saved, 10) || 0;
        }
    } catch (e) {
        console.warn('无法从本地存储读取最高分:', e);
        highScore = 0;
    }
}

function showOverlay(title, message) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    gameOverlay.classList.remove('hidden');
}

function hideOverlay() {
    gameOverlay.classList.add('hidden');
}

window.addEventListener('DOMContentLoaded', init);
