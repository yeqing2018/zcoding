const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameContainer = document.querySelector('.game-container');

const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const newRecordElement = document.getElementById('newRecord');
const highScoreValue = document.getElementById('highScoreValue');
const pauseScoreElement = document.getElementById('pauseScore');
const pauseLevelElement = document.getElementById('pauseLevel');
const currentScoreDisplay = document.querySelector('.current-score');
const levelValueDisplay = document.querySelector('.level-value');
const comboValueDisplay = document.querySelector('.combo-value');
const bestScoreDisplay = document.querySelector('.best-score');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;
const PLAYER_MAX_SPEED = 520;
const PLAYER_ACCELERATION = 2000;
const PLAYER_DECELERATION = 2500;

const BASE_OBSTACLE_SPEED = 280;
const BASE_SPAWN_INTERVAL = 1100;
const MIN_SPAWN_INTERVAL = 350;

const OBSTACLE_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

let lastTime = 0;
let spawnTimer = 0;
let gameState = 'start';
let score = 0;
let combo = 0;
let highScore = 0;
let difficultyLevel = 1;
let player = null;
let obstacles = [];
let keys = {};
let lastSpawnX = -1;
let isShaking = false;
let isFlashing = false;

function loadHighScore() {
    const saved = localStorage.getItem('dodgeBlockHighScore');
    if (saved) {
        highScore = parseInt(saved, 10);
    }
    updateHighScoreDisplay();
}

function saveHighScore(newScore) {
    if (newScore > highScore) {
        highScore = newScore;
        localStorage.setItem('dodgeBlockHighScore', highScore.toString());
        return true;
    }
    return false;
}

function updateHighScoreDisplay() {
    highScoreValue.textContent = highScore;
    bestScoreDisplay.textContent = highScore;
}

function updateScoreDisplay() {
    currentScoreDisplay.textContent = score;
    levelValueDisplay.textContent = difficultyLevel;
    comboValueDisplay.textContent = combo;
}

function getCurrentSpawnInterval() {
    const reduction = (difficultyLevel - 1) * 70;
    return Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - reduction);
}

function getCurrentObstacleSpeed() {
    const speedIncrease = (difficultyLevel - 1) * 25;
    return BASE_OBSTACLE_SPEED + speedIncrease;
}

function updateDifficulty() {
    const newLevel = Math.floor(score / 15) + 1;
    if (newLevel !== difficultyLevel) {
        difficultyLevel = newLevel;
        updateScoreDisplay();
    }
}

function initPlayer() {
    player = {
        x: (GAME_WIDTH - PLAYER_WIDTH) / 2,
        y: GAME_HEIGHT - PLAYER_HEIGHT - 30,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        velocityX: 0,
        maxSpeed: PLAYER_MAX_SPEED,
        acceleration: PLAYER_ACCELERATION,
        deceleration: PLAYER_DECELERATION
    };
}

function initGame() {
    score = 0;
    combo = 0;
    difficultyLevel = 1;
    spawnTimer = 0;
    obstacles = [];
    keys = {};
    isShaking = false;
    isFlashing = false;
    lastSpawnX = -1;
    initPlayer();
    updateScoreDisplay();
}

function getRandomObstacleSize() {
    const sizes = [
        { width: 35, height: 35 },
        { width: 40, height: 40 },
        { width: 50, height: 50 },
        { width: 45, height: 35 },
        { width: 35, height: 50 }
    ];
    return sizes[Math.floor(Math.random() * sizes.length)];
}

function getRandomColor() {
    return OBSTACLE_COLORS[Math.floor(Math.random() * OBSTACLE_COLORS.length)];
}

function spawnObstacle() {
    const size = getRandomObstacleSize();
    let x;
    const maxAttempts = 20;
    
    for (let i = 0; i < maxAttempts; i++) {
        x = Math.random() * (GAME_WIDTH - size.width);
        
        if (lastSpawnX === -1 || Math.abs(x - lastSpawnX) > size.width + 20) {
            let tooClose = false;
            for (const obstacle of obstacles) {
                if (Math.abs(x - obstacle.x) < Math.max(size.width, obstacle.width) + 10) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                break;
            }
        }
    }
    
    lastSpawnX = x;
    
    obstacles.push({
        x: x,
        y: -size.height,
        width: size.width,
        height: size.height,
        speed: getCurrentObstacleSpeed() * (0.85 + Math.random() * 0.3),
        color: getRandomColor()
    });
}

function updatePlayer(deltaTime) {
    let isMovingLeft = keys['ArrowLeft'] || keys['KeyA'];
    let isMovingRight = keys['ArrowRight'] || keys['KeyD'];
    
    if (isMovingLeft && !isMovingRight) {
        player.velocityX -= player.acceleration * deltaTime;
    } else if (isMovingRight && !isMovingLeft) {
        player.velocityX += player.acceleration * deltaTime;
    } else {
        if (player.velocityX > 0) {
            player.velocityX -= player.deceleration * deltaTime;
            if (player.velocityX < 0) player.velocityX = 0;
        } else if (player.velocityX < 0) {
            player.velocityX += player.deceleration * deltaTime;
            if (player.velocityX > 0) player.velocityX = 0;
        }
    }
    
    player.velocityX = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.velocityX));
    
    player.x += player.velocityX * deltaTime;
    
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > GAME_WIDTH) {
        player.x = GAME_WIDTH - player.width;
        player.velocityX = 0;
    }
}

function updateObstacles(deltaTime) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += obstacles[i].speed * deltaTime;
        
        if (obstacles[i].y > GAME_HEIGHT) {
            obstacles.splice(i, 1);
            combo++;
            
            let comboBonus = 0;
            if (combo >= 10) comboBonus = 2;
            else if (combo >= 5) comboBonus = 1;
            
            score += 1 + comboBonus;
            updateDifficulty();
            updateScoreDisplay();
        }
    }
}

function checkCollision(rect1, rect2) {
    const padding = 2;
    return rect1.x + padding < rect2.x + rect2.width - padding &&
           rect1.x + rect1.width - padding > rect2.x + padding &&
           rect1.y + padding < rect2.y + rect2.height - padding &&
           rect1.y + rect1.height - padding > rect2.y + padding;
}

function checkCollisions() {
    for (const obstacle of obstacles) {
        if (checkCollision(player, obstacle)) {
            return true;
        }
    }
    return false;
}

function triggerCollisionEffect() {
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    gameContainer.classList.remove('shake');
    void gameContainer.offsetWidth;
    gameContainer.classList.add('shake');
    
    canvas.style.filter = 'brightness(2)';
    setTimeout(() => {
        canvas.style.filter = '';
    }, 100);
}

function drawPlayer() {
    if (!player) return;
    
    ctx.save();
    
    const gradient = ctx.createLinearGradient(
        player.x, player.y,
        player.x, player.y + player.height
    );
    gradient.addColorStop(0, '#818cf8');
    gradient.addColorStop(1, '#4f46e5');
    
    ctx.fillStyle = gradient;
    
    const radius = 4;
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 20;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + 3, y + 3, w - 6, 4);
    
    ctx.restore();
}

function drawObstacles() {
    for (const obstacle of obstacles) {
        ctx.save();
        
        const gradient = ctx.createLinearGradient(
            obstacle.x, obstacle.y,
            obstacle.x + obstacle.width, obstacle.y + obstacle.height
        );
        
        const color = obstacle.color;
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, shadeColor(color, -30));
        
        ctx.fillStyle = gradient;
        
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + radius, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width - radius, obstacle.y);
        ctx.quadraticCurveTo(obstacle.x + obstacle.width, obstacle.y, obstacle.x + obstacle.width, obstacle.y + radius);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height - radius);
        ctx.quadraticCurveTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height, obstacle.x + obstacle.width - radius, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + radius, obstacle.y + obstacle.height);
        ctx.quadraticCurveTo(obstacle.x, obstacle.y + obstacle.height, obstacle.x, obstacle.y + obstacle.height - radius);
        ctx.lineTo(obstacle.x, obstacle.y + radius);
        ctx.quadraticCurveTo(obstacle.x, obstacle.y, obstacle.x + radius, obstacle.y);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(obstacle.x + 3, obstacle.y + 3, obstacle.width - 6, 4);
        
        ctx.restore();
    }
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_HEIGHT);
        ctx.stroke();
    }
    
    for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_WIDTH, y);
        ctx.stroke();
    }
}

function gameLoop(currentTime) {
    try {
        if (!lastTime) {
            lastTime = currentTime;
        }
        
        let deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        deltaTime = Math.min(deltaTime, 0.1);
        
        drawBackground();
        
        if (gameState === 'playing' && player) {
            spawnTimer += deltaTime * 1000;
            
            if (spawnTimer >= getCurrentSpawnInterval()) {
                spawnObstacle();
                spawnTimer = 0;
            }
            
            updatePlayer(deltaTime);
            updateObstacles(deltaTime);
            
            if (checkCollisions()) {
                triggerCollisionEffect();
                const isNewRecord = saveHighScore(score);
                updateHighScoreDisplay();
                
                gameState = 'gameOver';
                finalScoreElement.textContent = score;
                finalLevelElement.textContent = difficultyLevel;
                newRecordElement.style.display = isNewRecord ? 'flex' : 'none';
                gameOverScreen.classList.remove('hidden');
            }
            
            drawPlayer();
            drawObstacles();
        } else if (player) {
            drawPlayer();
            drawObstacles();
        }
    } catch (e) {
        console.error('游戏循环错误:', e);
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'playing';
    initGame();
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseScoreElement.textContent = score;
        pauseLevelElement.textContent = difficultyLevel;
        pauseScreen.classList.remove('hidden');
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        pauseScreen.classList.add('hidden');
        keys = {};
    }
}

function handleKeyDown(e) {
    if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
        return;
    }
    
    keys[e.code] = true;
    
    if (gameState === 'start' || gameState === 'gameOver') {
        startGame();
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

document.addEventListener('DOMContentLoaded', function() {
    loadHighScore();
    initPlayer();
    updateScoreDisplay();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    gameLoop();
});
