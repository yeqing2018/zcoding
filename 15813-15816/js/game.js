const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let gameState = 'menu';
let score = 0;
let coins = [];
let particles = [];
let keys = { left: false, right: false };

let combo = 0;
let maxCombo = 0;
let comboTimer = null;
let comboTimerStartTime = 0;
let comboRemainingTime = 0;
const comboTimeout = 1500;

let isDoubleScore = false;
let doubleScoreTimer = null;
let doubleScoreTime = 0;

let level = 1;
let levelScore = 0;
const levelTargets = [20, 50, 100, 180, 300, 450, 650, 900, 1200, 1600];

let currentSkin = 'default';
let coinSpeed = 3;
let playerName = '玩家';

const player = {
    x: canvasWidth / 2 - 40,
    y: canvasHeight - 60,
    width: 80,
    height: 50,
    speed: 6
};

const coinConfig = {
    radius: 15,
    spawnInterval: 800
};

let lastCoinSpawn = 0;
let lastDoubleSpawn = 0;
const doubleCoinSpawnInterval = 10000;

const skins = {
    default: {
        basketColor: '#8B4513',
        basketBorder: '#654321',
        faceColor: '#DEB887',
        accessory: null
    },
    girl: {
        basketColor: '#FF69B4',
        basketBorder: '#FF1493',
        faceColor: '#FFE4E1',
        accessory: 'bow'
    },
    robot: {
        basketColor: '#708090',
        basketBorder: '#2C3E50',
        faceColor: '#C0C0C0',
        accessory: 'antenna'
    },
    ninja: {
        basketColor: '#2C3E50',
        basketBorder: '#1a252f',
        faceColor: '#34495E',
        accessory: 'mask'
    }
};

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const levelTargetElement = document.getElementById('levelTarget');
const comboElement = document.getElementById('combo');
const comboBoard = document.getElementById('comboBoard');
const doubleTimeElement = document.getElementById('doubleTime');
const doubleBoard = document.getElementById('doubleBoard');

const startMenu = document.getElementById('startMenu');
const gameOverPanel = document.getElementById('gameOver');
const levelUpPanel = document.getElementById('levelUp');
const leaderboardPanel = document.getElementById('leaderboardPanel');

const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const maxComboElement = document.getElementById('maxCombo');
const nextLevelElement = document.getElementById('nextLevel');
const nextLevelTargetElement = document.getElementById('nextLevelTarget');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const continueBtn = document.getElementById('continueBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboard');

const playerNameInput = document.getElementById('playerName');

const skinOptions = document.querySelectorAll('.skin-option');
const speedBtns = document.querySelectorAll('.speed-btn');

skinOptions.forEach(option => {
    option.addEventListener('click', () => {
        skinOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        currentSkin = option.dataset.skin;
    });
});

speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        coinSpeed = parseInt(btn.dataset.speed);
    });
});

function getLeaderboard() {
    const data = localStorage.getItem('coinGameLeaderboard');
    return data ? JSON.parse(data) : [];
}

function saveToLeaderboard(name, finalScore, finalLevel, mCombo) {
    const leaderboard = getLeaderboard();
    leaderboard.push({
        name: name || '匿名玩家',
        score: finalScore,
        level: finalLevel,
        maxCombo: mCombo,
        date: new Date().toLocaleDateString()
    });
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    localStorage.setItem('coinGameLeaderboard', JSON.stringify(top10));
}

function displayLeaderboard() {
    const leaderboard = getLeaderboard();
    const listEl = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        listEl.innerHTML = '<div class="leaderboard-empty">暂无记录，快来挑战吧！</div>';
        return;
    }
    
    listEl.innerHTML = leaderboard.map((entry, index) => `
        <div class="leaderboard-item">
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-name">${entry.name}</div>
            <div class="leaderboard-score">${entry.score}分</div>
        </div>
    `).join('');
}

function drawPlayer() {
    const skin = skins[currentSkin];
    
    ctx.fillStyle = skin.basketColor;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x + player.width - 10, player.y);
    ctx.lineTo(player.x + 10, player.y);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = skin.basketBorder;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(player.x + 5, player.y + (player.height / 4) * i);
        ctx.lineTo(player.x + player.width - 5, player.y + (player.height / 4) * i);
        ctx.stroke();
    }
    
    ctx.fillStyle = skin.faceColor;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 10, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = skin.basketBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    if (skin.accessory === 'bow') {
        ctx.fillStyle = '#FF1493';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width / 2 - 8, player.y - 28, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(player.x + player.width / 2 + 8, player.y - 28, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y - 28, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (skin.accessory === 'antenna') {
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y - 25);
        ctx.lineTo(player.x + player.width / 2, player.y - 40);
        ctx.stroke();
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y - 43, 5, 0, Math.PI * 2);
        ctx.fill();
    } else if (skin.accessory === 'mask') {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(player.x + player.width / 2, player.y - 8, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2 - 6, player.y - 8, 3, 0, Math.PI * 2);
        ctx.arc(player.x + player.width / 2 + 6, player.y - 8, 3, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 6, player.y - 12, 3, 0, Math.PI * 2);
    ctx.arc(player.x + player.width / 2 + 6, player.y - 12, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 8, 8, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
}

function drawCoin(coin) {
    ctx.save();
    
    const gradient = ctx.createRadialGradient(
        coin.x - 5, coin.y - 5, 2,
        coin.x, coin.y, coinConfig.radius
    );
    
    if (coin.isDouble) {
        gradient.addColorStop(0, '#FF69B4');
        gradient.addColorStop(0.7, '#FF1493');
        gradient.addColorStop(1, '#C71585');
    } else {
        gradient.addColorStop(0, '#FFF8DC');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coinConfig.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = coin.isDouble ? '#C71585' : '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = coin.isDouble ? '#FFF' : '#FFA500';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(coin.isDouble ? 'x2' : '$', coin.x, coin.y);
    
    if (coin.isDouble) {
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.2;
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coinConfig.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    drawCloud(80, 50 + Math.sin(Date.now() / 2000) * 5);
    drawCloud(350, 80 + Math.sin(Date.now() / 2500 + 1) * 5);
    drawCloud(500, 40 + Math.sin(Date.now() / 3000 + 2) * 5);
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);
    
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < canvasWidth; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, canvasHeight - 20);
        ctx.lineTo(i + 5, canvasHeight - 28);
        ctx.lineTo(i + 10, canvasHeight - 20);
        ctx.fill();
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 45, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 15, 20, 0, Math.PI * 2);
    ctx.fill();
}

function spawnCoin(isDouble = false) {
    const coin = {
        x: Math.random() * (canvasWidth - coinConfig.radius * 2) + coinConfig.radius,
        y: -coinConfig.radius,
        isDouble: isDouble,
        rotation: 0
    };
    coins.push(coin);
}

function createCollectParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3),
            radius: 3 + Math.random() * 3,
            color: color,
            life: 1,
            decay: 0.02 + Math.random() * 0.02
        });
    }
}

function createExplosionParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 4 + Math.random() * 4,
            color: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8C00'][Math.floor(Math.random() * 4)],
            life: 1,
            decay: 0.015 + Math.random() * 0.01
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= p.decay;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function updateCombo() {
    combo++;
    if (combo > maxCombo) {
        maxCombo = combo;
    }
    
    if (combo >= 3) {
        comboBoard.style.display = 'block';
        comboElement.textContent = combo;
    }
    
    if (comboTimer) {
        clearTimeout(comboTimer);
    }
    
    comboTimerStartTime = Date.now();
    comboTimer = setTimeout(() => {
        combo = 0;
        comboBoard.style.display = 'none';
        comboTimer = null;
    }, comboTimeout);
}

function resetCombo() {
    combo = 0;
    comboBoard.style.display = 'none';
    if (comboTimer) {
        clearTimeout(comboTimer);
        comboTimer = null;
    }
}

function getComboMultiplier() {
    if (combo >= 10) return 3;
    if (combo >= 5) return 2;
    if (combo >= 3) return 1.5;
    return 1;
}

function activateDoubleScore() {
    isDoubleScore = true;
    doubleScoreTime = 10;
    doubleBoard.style.display = 'block';
    
    if (doubleScoreTimer) {
        clearInterval(doubleScoreTimer);
    }
    
    doubleScoreTimer = setInterval(() => {
        doubleScoreTime--;
        doubleTimeElement.textContent = doubleScoreTime;
        
        if (doubleScoreTime <= 0) {
            isDoubleScore = false;
            doubleBoard.style.display = 'none';
            clearInterval(doubleScoreTimer);
        }
    }, 1000);
}

function updateCoins() {
    for (let i = coins.length - 1; i >= 0; i--) {
        coins[i].y += coinSpeed * (1 + (level - 1) * 0.1);
        
        if (coins[i].y - coinConfig.radius < player.y + player.height &&
            coins[i].y + coinConfig.radius > player.y &&
            coins[i].x + coinConfig.radius > player.x &&
            coins[i].x - coinConfig.radius < player.x + player.width) {
            
            updateCombo();
            
            let points = 1;
            let color = '#FFD700';
            
            if (coins[i].isDouble) {
                activateDoubleScore();
                points = 5;
                color = '#FF69B4';
                createExplosionParticles(coins[i].x, coins[i].y);
            } else {
                createCollectParticles(coins[i].x, coins[i].y, color);
            }
            
            points = Math.floor(points * getComboMultiplier());
            
            if (isDoubleScore) {
                points *= 2;
            }
            
            score += points;
            levelScore += points;
            scoreElement.textContent = score;
            
            checkLevelUp();
            
            coins.splice(i, 1);
            continue;
        }
        
        if (coins[i].y - coinConfig.radius > canvasHeight) {
            if (!coins[i].isDouble) {
                resetCombo();
                createExplosionParticles(coins[i].x, canvasHeight - 10);
                gameOver();
                return;
            }
            coins.splice(i, 1);
        }
    }
}

function checkLevelUp() {
    if (level <= levelTargets.length && levelScore >= levelTargets[level - 1]) {
        if (level < levelTargets.length) {
            showLevelUp();
        } else {
            gameOver();
        }
    }
}

function showLevelUp() {
    gameState = 'levelup';
    nextLevelElement.textContent = level + 1;
    nextLevelTargetElement.textContent = levelTargets[level] || '∞';
    levelUpPanel.style.display = 'block';
    
    if (comboTimer) {
        comboRemainingTime = comboTimeout - (Date.now() - comboTimerStartTime);
        clearTimeout(comboTimer);
        comboTimer = null;
    }
}

function updatePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvasWidth - player.width) {
        player.x += player.speed;
    }
}

function gameOver() {
    gameState = 'gameover';
    
    playerName = playerNameInput.value.trim() || '玩家';
    saveToLeaderboard(playerName, score, level, maxCombo);
    
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = level;
    maxComboElement.textContent = maxCombo;
    
    gameOverPanel.style.display = 'block';
}

function resetGame() {
    score = 0;
    levelScore = 0;
    level = 1;
    combo = 0;
    maxCombo = 0;
    coins = [];
    particles = [];
    player.x = canvasWidth / 2 - 40;
    lastCoinSpawn = 0;
    lastDoubleSpawn = 0;
    isDoubleScore = false;
    
    if (comboTimer) {
        clearTimeout(comboTimer);
        comboTimer = null;
    }
    if (doubleScoreTimer) {
        clearInterval(doubleScoreTimer);
        doubleScoreTimer = null;
    }
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    levelTargetElement.textContent = levelTargets[0];
    comboBoard.style.display = 'none';
    doubleBoard.style.display = 'none';
}

function startGame() {
    resetGame();
    startMenu.style.display = 'none';
    gameOverPanel.style.display = 'none';
    levelUpPanel.style.display = 'none';
    gameState = 'playing';
    requestAnimationFrame(gameLoop);
}

function continueGame() {
    level++;
    levelScore = 0;
    levelElement.textContent = level;
    levelTargetElement.textContent = levelTargets[level - 1] || '∞';
    coins = [];
    levelUpPanel.style.display = 'none';
    gameState = 'playing';
    
    if (combo > 0 && comboRemainingTime > 0) {
        comboTimerStartTime = Date.now();
        comboTimer = setTimeout(() => {
            combo = 0;
            comboBoard.style.display = 'none';
            comboTimer = null;
        }, comboRemainingTime);
        comboRemainingTime = 0;
    }
    
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (gameState !== 'playing') {
        return;
    }
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    drawBackground();
    drawPlayer();
    
    coins.forEach(coin => drawCoin(coin));
    drawParticles();
    
    updatePlayer();
    updateCoins();
    updateParticles();
    
    if (timestamp - lastCoinSpawn > coinConfig.spawnInterval) {
        spawnCoin(false);
        lastCoinSpawn = timestamp;
    }
    
    if (timestamp - lastDoubleSpawn > doubleCoinSpawnInterval) {
        spawnCoin(true);
        lastDoubleSpawn = timestamp;
    }
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
    gameOverPanel.style.display = 'none';
    startMenu.style.display = 'block';
    gameState = 'menu';
});
continueBtn.addEventListener('click', continueGame);

leaderboardBtn.addEventListener('click', () => {
    displayLeaderboard();
    leaderboardPanel.style.display = 'block';
});

closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardPanel.style.display = 'none';
});

levelTargetElement.textContent = levelTargets[0];
