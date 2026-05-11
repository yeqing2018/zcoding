const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');
const messageTitle = document.getElementById('messageTitle');
const messageText = document.getElementById('messageText');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const mainLeaderboardBtn = document.getElementById('mainLeaderboardBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const leaderboardOverlay = document.getElementById('leaderboardOverlay');
const leaderboardList = document.getElementById('leaderboardList');
const resumeBtn = document.getElementById('resumeBtn');
const pauseRestartBtn = document.getElementById('pauseRestartBtn');
const pauseLeaderboardBtn = document.getElementById('pauseLeaderboardBtn');
const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');

const CONFIG = {
    BRICK_ROWS: 5,
    BRICK_COLS: 10,
    BRICK_WIDTH: 70,
    BRICK_HEIGHT: 25,
    BRICK_PADDING: 8,
    BRICK_OFFSET_TOP: 60,
    BRICK_OFFSET_LEFT: 35,
    PADDLE_WIDTH: 120,
    PADDLE_HEIGHT: 15,
    PADDLE_SPEED: 10,
    BALL_RADIUS: 10,
    BALL_SPEED: 5,
    INITIAL_LIVES: 3,
    MAX_LEADERBOARD_ENTRIES: 10
};

const BRICK_TYPES = [
    { color: '#ff6b6b', score: 50, name: '红色砖块' },
    { color: '#feca57', score: 40, name: '黄色砖块' },
    { color: '#48dbfb', score: 30, name: '蓝色砖块' },
    { color: '#1dd1a1', score: 20, name: '绿色砖块' },
    { color: '#ff9ff3', score: 10, name: '粉色砖块' }
];

const STORAGE_KEYS = {
    HIGH_SCORE: 'brickBreaker_highScore',
    LEADERBOARD: 'brickBreaker_leaderboard'
};

let gameState = {
    score: 0,
    highScore: 0,
    lives: CONFIG.INITIAL_LIVES,
    isPlaying: false,
    isGameOver: false,
    isWin: false,
    isWaiting: true,
    isPaused: false,
    isLeaderboardOpen: false,
    wasPausedBeforeLeaderboard: false
};

let paddle = {
    x: (canvas.width - CONFIG.PADDLE_WIDTH) / 2,
    y: canvas.height - 40,
    width: CONFIG.PADDLE_WIDTH,
    height: CONFIG.PADDLE_HEIGHT,
    speed: CONFIG.PADDLE_SPEED,
    dx: 0
};

let ball = {
    x: canvas.width / 2,
    y: paddle.y - CONFIG.BALL_RADIUS,
    radius: CONFIG.BALL_RADIUS,
    speed: CONFIG.BALL_SPEED,
    dx: CONFIG.BALL_SPEED,
    dy: -CONFIG.BALL_SPEED
};

let bricks = [];

let keys = {
    left: false,
    right: false
};

let leaderboard = [];

function getStoredHighScore() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
        return stored ? parseInt(stored, 10) : 0;
    } catch (e) {
        console.warn('无法读取最高分:', e);
        return 0;
    }
}

function saveHighScore(score) {
    try {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    } catch (e) {
        console.warn('无法保存最高分:', e);
    }
}

function getStoredLeaderboard() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('无法读取排行榜:', e);
        return [];
    }
}

function saveLeaderboard(data) {
    try {
        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(data));
    } catch (e) {
        console.warn('无法保存排行榜:', e);
    }
}

function addToLeaderboard(score) {
    const entry = {
        name: `玩家${Math.floor(Math.random() * 1000)}`,
        score: score,
        date: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, CONFIG.MAX_LEADERBOARD_ENTRIES);
    
    saveLeaderboard(leaderboard);
}

function formatDate(dateString) {
    return dateString;
}

function updateHighScoreDisplay() {
    highScoreElement.textContent = gameState.highScore;
}

function renderLeaderboard() {
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p class="no-records">暂无记录</p>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((entry, index) => {
        const rankClass = `rank-${index + 1}`;
        return `
            <div class="leaderboard-item">
                <span class="rank ${index < 3 ? rankClass : ''}">${index + 1}</span>
                <div class="player-info">
                    <div class="player-name">${entry.name}</div>
                    <div class="player-date">${entry.date}</div>
                </div>
                <span class="player-score">${entry.score}</span>
            </div>
        `;
    }).join('');
}

function createBricks() {
    bricks = [];
    for (let row = 0; row < CONFIG.BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < CONFIG.BRICK_COLS; col++) {
            const x = col * (CONFIG.BRICK_WIDTH + CONFIG.BRICK_PADDING) + CONFIG.BRICK_OFFSET_LEFT;
            const y = row * (CONFIG.BRICK_HEIGHT + CONFIG.BRICK_PADDING) + CONFIG.BRICK_OFFSET_TOP;
            const brickType = BRICK_TYPES[row % BRICK_TYPES.length];
            bricks[row][col] = {
                x: x,
                y: y,
                width: CONFIG.BRICK_WIDTH,
                height: CONFIG.BRICK_HEIGHT,
                color: brickType.color,
                score: brickType.score,
                visible: true
            };
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = '#4facfe';
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fill();
    
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    const gradient = ctx.createRadialGradient(
        ball.x - 3, ball.y - 3, 1,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#ff6b6b');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#ee5a5a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawBricks() {
    for (let row = 0; row < CONFIG.BRICK_ROWS; row++) {
        for (let col = 0; col < CONFIG.BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                ctx.fillStyle = brick.color;
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 5);
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height / 3);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(brick.score, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
            }
        }
    }
}

function updatePaddle() {
    if (gameState.isPaused || gameState.isLeaderboardOpen) return;
    
    if (keys.left && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    if (keys.right && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.speed;
    }
}

function updateBall() {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isLeaderboardOpen) {
        return;
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
    }
    
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        ball.y = ball.radius;
    }
    
    if (ball.y + ball.radius > paddle.y && 
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x + ball.radius > paddle.x && 
        ball.x - ball.radius < paddle.x + paddle.width) {
        
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI * 0.7;
        
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -Math.abs(ball.speed * Math.cos(angle));
        
        ball.y = paddle.y - ball.radius;
    }
    
    if (ball.y + ball.radius > canvas.height) {
        loseLife();
    }
    
    checkBrickCollisions();
    checkWin();
}

function checkBrickCollisions() {
    for (let row = 0; row < CONFIG.BRICK_ROWS; row++) {
        for (let col = 0; col < CONFIG.BRICK_COLS; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                if (ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height) {
                    
                    brick.visible = false;
                    gameState.score += brick.score;
                    updateScore();
                    
                    if (gameState.score > gameState.highScore) {
                        gameState.highScore = gameState.score;
                        updateHighScoreDisplay();
                        saveHighScore(gameState.highScore);
                    }
                    
                    const ballLeft = ball.x - ball.radius;
                    const ballRight = ball.x + ball.radius;
                    const ballTop = ball.y - ball.radius;
                    const ballBottom = ball.y + ball.radius;
                    
                    const brickLeft = brick.x;
                    const brickRight = brick.x + brick.width;
                    const brickTop = brick.y;
                    const brickBottom = brick.y + brick.height;
                    
                    const overlapLeft = ballRight - brickLeft;
                    const overlapRight = brickRight - ballLeft;
                    const overlapTop = ballBottom - brickTop;
                    const overlapBottom = brickBottom - ballTop;
                    
                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);
                    
                    if (minOverlapX < minOverlapY) {
                        ball.dx = -ball.dx;
                    } else {
                        ball.dy = -ball.dy;
                    }
                }
            }
        }
    }
}

function checkWin() {
    let allCleared = true;
    for (let row = 0; row < CONFIG.BRICK_ROWS; row++) {
        for (let col = 0; col < CONFIG.BRICK_COLS; col++) {
            if (bricks[row][col].visible) {
                allCleared = false;
                break;
            }
        }
        if (!allCleared) break;
    }
    
    if (allCleared) {
        gameState.isWin = true;
        gameState.isGameOver = true;
        gameState.isPlaying = false;
        
        addToLeaderboard(gameState.score);
        
        showMessage('🎉 恭喜通关！', `你的分数: ${gameState.score}`);
    }
}

function loseLife() {
    gameState.lives--;
    updateLives();
    
    if (gameState.lives <= 0) {
        gameState.isGameOver = true;
        gameState.isPlaying = false;
        
        addToLeaderboard(gameState.score);
        
        showMessage('💔 游戏结束', `最终分数: ${gameState.score}`);
    } else {
        resetBallAndPaddle();
        gameState.isWaiting = true;
        gameState.isPlaying = false;
    }
}

function resetBallAndPaddle() {
    paddle.x = (canvas.width - paddle.width) / 2;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dx = CONFIG.BALL_SPEED;
    ball.dy = -CONFIG.BALL_SPEED;
    ball.speed = CONFIG.BALL_SPEED;
}

function updateScore() {
    scoreElement.textContent = gameState.score;
}

function updateLives() {
    livesElement.textContent = gameState.lives;
}

function showMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageElement.classList.remove('hidden');
}

function hideMessage() {
    messageElement.classList.add('hidden');
}

function launchBall() {
    if (gameState.isWaiting && !gameState.isGameOver && !gameState.isPaused && !gameState.isLeaderboardOpen) {
        gameState.isPlaying = true;
        gameState.isWaiting = false;
        hideMessage();
    }
}

function togglePause() {
    if (gameState.isGameOver || gameState.isLeaderboardOpen) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
    }
}

function showLeaderboard() {
    renderLeaderboard();
    gameState.isLeaderboardOpen = true;
    leaderboardOverlay.classList.remove('hidden');
    
    gameState.wasPausedBeforeLeaderboard = gameState.isPaused;
    
    if (gameState.isPlaying && !gameState.isPaused) {
        gameState.isPaused = true;
    }
    
    pauseOverlay.classList.add('hidden');
}

function hideLeaderboard() {
    gameState.isLeaderboardOpen = false;
    leaderboardOverlay.classList.add('hidden');
    
    if (!gameState.wasPausedBeforeLeaderboard) {
        gameState.isPaused = false;
    } else {
        pauseOverlay.classList.remove('hidden');
    }
}

function resumeGame() {
    gameState.isPaused = false;
    pauseOverlay.classList.add('hidden');
}

function initGame() {
    gameState.score = 0;
    gameState.lives = CONFIG.INITIAL_LIVES;
    gameState.isPlaying = false;
    gameState.isGameOver = false;
    gameState.isWin = false;
    gameState.isWaiting = true;
    gameState.isPaused = false;
    gameState.isLeaderboardOpen = false;
    
    paddle.x = (canvas.width - CONFIG.PADDLE_WIDTH) / 2;
    paddle.width = CONFIG.PADDLE_WIDTH;
    paddle.height = CONFIG.PADDLE_HEIGHT;
    paddle.speed = CONFIG.PADDLE_SPEED;
    
    ball.x = canvas.width / 2;
    ball.y = paddle.y - CONFIG.BALL_RADIUS;
    ball.radius = CONFIG.BALL_RADIUS;
    ball.speed = CONFIG.BALL_SPEED;
    ball.dx = CONFIG.BALL_SPEED;
    ball.dy = -CONFIG.BALL_SPEED;
    
    createBricks();
    updateScore();
    updateLives();
    hideMessage();
    pauseOverlay.classList.add('hidden');
    leaderboardOverlay.classList.add('hidden');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawPaddle();
    drawBall();
    
    if (gameState.isWaiting && !gameState.isGameOver) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按空格键或点击"开始游戏"按钮发球', canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    updatePaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (gameState.isLeaderboardOpen) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        keys.right = true;
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!gameState.isGameOver && !gameState.isPaused) {
            launchBall();
        }
    }
    if (e.key === 'p' || e.key === 'P') {
        if (!gameState.isGameOver && !gameState.isWaiting) {
            togglePause();
        }
    }
    if (e.key === 'Escape') {
        if (gameState.isLeaderboardOpen) {
            hideLeaderboard();
        } else if (gameState.isPaused) {
            resumeGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        keys.right = false;
    }
});

restartBtn.addEventListener('click', () => {
    initGame();
});

startBtn.addEventListener('click', () => {
    if (!gameState.isGameOver) {
        launchBall();
    }
});

pauseBtn.addEventListener('click', () => {
    if (!gameState.isGameOver && !gameState.isWaiting) {
        togglePause();
    }
});

leaderboardBtn.addEventListener('click', () => {
    showLeaderboard();
});

mainLeaderboardBtn.addEventListener('click', () => {
    showLeaderboard();
});

resumeBtn.addEventListener('click', () => {
    resumeGame();
});

pauseRestartBtn.addEventListener('click', () => {
    initGame();
});

pauseLeaderboardBtn.addEventListener('click', () => {
    pauseOverlay.classList.add('hidden');
    showLeaderboard();
});

leaderboardBackBtn.addEventListener('click', () => {
    hideLeaderboard();
});

gameState.highScore = getStoredHighScore();
leaderboard = getStoredLeaderboard();
updateHighScoreDisplay();
initGame();
gameLoop();
