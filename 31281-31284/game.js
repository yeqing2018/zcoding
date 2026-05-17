const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const GROUND_HEIGHT = 100;

const GAME_STATE = {
    MENU: 'menu',
    READY: 'ready',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
};

const GAME_MODE = {
    SINGLE: 'single',
    DUAL: 'dual',
    CHALLENGE: 'challenge'
};

const BIRD_TYPES = [
    { id: 'yellow', name: '小黄鸟', body: '#FFD700', wing: '#FF8C00', beak: '#FF6B35', unlockCondition: null },
    { id: 'blue', name: '小蓝鸟', body: '#4FC3F7', wing: '#0288D1', beak: '#FF6B35', unlockCondition: { type: 'totalScore', value: 100 } },
    { id: 'red', name: '小红鸟', body: '#EF5350', wing: '#C62828', beak: '#FFD700', unlockCondition: { type: 'totalScore', value: 500 } },
    { id: 'green', name: '小绿鸟', body: '#66BB6A', wing: '#2E7D32', beak: '#FF6B35', unlockCondition: { type: 'consecutive', value: 20 } },
    { id: 'purple', name: '紫罗鸟', body: '#AB47BC', wing: '#6A1B9A', beak: '#FFD700', unlockCondition: { type: 'playTime', value: 600 } },
    { id: 'rainbow', name: '彩虹鸟', body: 'rainbow', wing: '#FF6B35', beak: '#FFD700', unlockCondition: { type: 'allAchievements', value: true } }
];

const THEMES = {
    day: {
        skyTop: '#70c5ce',
        skyBottom: '#c4e9e5',
        cloud: '#FFFFFF',
        ground: '#ded895',
        groundDark: '#d2b048',
        groundAccent: '#b8860b',
        pipe: '#73bf2e',
        pipeDark: '#558b2f',
        pipeBorder: '#2e5f1f'
    },
    night: {
        skyTop: '#0f0c29',
        skyBottom: '#302b63',
        cloud: '#4a4a6a',
        ground: '#3a3a5a',
        groundDark: '#2a2a4a',
        groundAccent: '#1a1a3a',
        pipe: '#b0bec5',
        pipeDark: '#607d8b',
        pipeBorder: '#37474f'
    },
    snow: {
        skyTop: '#a8c0ff',
        skyBottom: '#e0eafc',
        cloud: '#ffffff',
        ground: '#f5f5f5',
        groundDark: '#e0e0e0',
        groundAccent: '#bdbdbd',
        pipe: '#2e7d32',
        pipeDark: '#1b5e20',
        pipeBorder: '#0d3d12'
    },
    desert: {
        skyTop: '#f5af19',
        skyBottom: '#f12711',
        cloud: '#ffe0b2',
        ground: '#d4a574',
        groundDark: '#a67c52',
        groundAccent: '#8b5a2b',
        pipe: '#6d4c41',
        pipeDark: '#4e342e',
        pipeBorder: '#3e2723'
    }
};

const PIPE_TYPES = {
    NORMAL: 'normal',
    MOVING: 'moving',
    DISAPPEARING: 'disappearing'
};

const POWER_UP_TYPES = {
    SHIELD: { id: 'shield', name: '无敌护盾', icon: '🛡️', duration: 300, color: '#4FC3F7' },
    SHRINK: { id: 'shrink', name: '缩小药水', icon: '🔮', duration: 480, color: '#AB47BC' },
    MAGNET: { id: 'magnet', name: '磁铁', icon: '🧲', duration: 600, color: '#FF5722' }
};

const ACHIEVEMENTS = [
    { id: 'first_flight', name: '初次飞行', desc: '完成第一局游戏', icon: '🐦', condition: { type: 'gamesPlayed', value: 1 } },
    { id: 'score_10', name: '小有成就', desc: '单局得分达到10', icon: '⭐', condition: { type: 'score', value: 10 } },
    { id: 'score_50', name: '飞行高手', desc: '单局得分达到50', icon: '🌟', condition: { type: 'score', value: 50 } },
    { id: 'score_100', name: '传奇飞行员', desc: '单局得分达到100', icon: '💫', condition: { type: 'score', value: 100 } },
    { id: 'consecutive_10', name: '连续穿越', desc: '连续穿越10根管道', icon: '🎯', condition: { type: 'consecutive', value: 10 } },
    { id: 'consecutive_30', name: '完美穿越', desc: '连续穿越30根管道', icon: '🎖️', condition: { type: 'consecutive', value: 30 } },
    { id: 'collect_shield', name: '护盾收集者', desc: '收集5个护盾道具', icon: '🛡️', condition: { type: 'collectPowerUp', powerUp: 'shield', value: 5 } },
    { id: 'collect_all', name: '道具大师', desc: '收集所有类型的道具', icon: '🎒', condition: { type: 'collectAllPowerUps', value: true } },
    { id: 'games_50', name: '游戏达人', desc: '游玩50局游戏', icon: '🎮', condition: { type: 'gamesPlayed', value: 50 } },
    { id: 'playtime_10min', name: '坚持不懈', desc: '累计游戏时间10分钟', icon: '⏱️', condition: { type: 'playTime', value: 600 } }
];

let gameState = GAME_STATE.MENU;
let gameMode = GAME_MODE.SINGLE;
let score = 0;
let bestScore = parseInt(localStorage.getItem('pixelBirdBestScore')) || 0;
let totalScore = parseInt(localStorage.getItem('pixelBirdTotalScore')) || 0;
let totalPlayTime = parseInt(localStorage.getItem('pixelBirdTotalPlayTime')) || 0;
let gamesPlayed = parseInt(localStorage.getItem('pixelBirdGamesPlayed')) || 0;
let maxConsecutive = parseInt(localStorage.getItem('pixelBirdMaxConsecutive')) || 0;
let frameCount = 0;
let currentTheme = localStorage.getItem('pixelBirdSelectedTheme') || 'day';
let selectedBirdId = localStorage.getItem('pixelBirdSelectedBird') || 'yellow';
let unlockedBirds = JSON.parse(localStorage.getItem('pixelBirdUnlockedBirds')) || ['yellow'];
let achievements = JSON.parse(localStorage.getItem('pixelBirdAchievements')) || {};
let leaderboard = JSON.parse(localStorage.getItem('pixelBirdLeaderboard')) || [];
let powerUpCollectCount = JSON.parse(localStorage.getItem('pixelBirdPowerUpCount')) || {};
let newAchievementsThisGame = [];
let currentConsecutive = 0;

const GRAVITY = 0.4;
const FLAP_STRENGTH = -8;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPAWN_INTERVAL = 90;
const POWER_UP_SPAWN_CHANCE = 0.02;

class Bird {
    constructor(x, y, playerId = 1) {
        this.x = x;
        this.y = y;
        this.baseWidth = 34;
        this.baseHeight = 24;
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.velocity = 0;
        this.rotation = 0;
        this.wingFrame = 0;
        this.wingTimer = 0;
        this.playerId = playerId;
        this.powerUps = {};
        this.isInvincible = false;
        this.isShrunk = false;
        this.alive = true;
        this.score = 0;
    }

    flap() {
        if (!this.alive) return;
        this.velocity = FLAP_STRENGTH;
        this.wingFrame = 1;
        this.wingTimer = 10;
    }

    update() {
        if (!this.alive) return;
        
        this.velocity += GRAVITY;
        this.y += this.velocity;
        this.rotation = Math.min(Math.max(this.velocity * 3, -25), 90);
        
        this.wingTimer--;
        if (this.wingTimer <= 0) {
            this.wingFrame = (this.wingFrame + 1) % 3;
            this.wingTimer = 6;
        }
        
        this.updatePowerUps();
    }

    updatePowerUps() {
        for (const [type, powerUp] of Object.entries(this.powerUps)) {
            powerUp.frames--;
            if (powerUp.frames <= 0) {
                this.removePowerUp(type);
            }
        }
    }

    addPowerUp(type) {
        const powerUpInfo = POWER_UP_TYPES[type.toUpperCase()];
        if (!powerUpInfo) return;
        
        this.powerUps[type] = {
            frames: powerUpInfo.duration,
            maxFrames: powerUpInfo.duration
        };
        
        if (type === 'shield') {
            this.isInvincible = true;
        } else if (type === 'shrink') {
            this.isShrunk = true;
            this.width = this.baseWidth * 0.6;
            this.height = this.baseHeight * 0.6;
        }
    }

    removePowerUp(type) {
        delete this.powerUps[type];
        
        if (type === 'shield') {
            this.isInvincible = false;
        } else if (type === 'shrink') {
            this.isShrunk = false;
            this.width = this.baseWidth;
            this.height = this.baseHeight;
        }
    }

    draw(ctx, theme) {
        if (!this.alive) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        const birdType = BIRD_TYPES.find(b => b.id === selectedBirdId) || BIRD_TYPES[0];
        const bw = this.width;
        const bh = this.height;
        
        if (birdType.body === 'rainbow') {
            const gradient = ctx.createLinearGradient(-bw/2, 0, bw/2, 0);
            gradient.addColorStop(0, '#FF0000');
            gradient.addColorStop(0.2, '#FF7F00');
            gradient.addColorStop(0.4, '#FFFF00');
            gradient.addColorStop(0.6, '#00FF00');
            gradient.addColorStop(0.8, '#0000FF');
            gradient.addColorStop(1, '#8B00FF');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = birdType.body;
        }
        
        ctx.fillRect(-bw/2 + 4, -bh/2 + 2, bw - 8, bh - 4);
        ctx.fillRect(-bw/2 + 8, -bh/2, bw - 16, bh);
        
        ctx.fillStyle = birdType.beak;
        ctx.fillRect(bw/2 - 10, -bh/2 + 6, 12, 6);
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(bw/2 - 4, -bh/2 + 7, 8, 4);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(2, -bh/2 + 4, 8, 8);
        ctx.fillStyle = '#000000';
        ctx.fillRect(6, -bh/2 + 6, 4, 4);
        
        const wingY = this.wingFrame === 0 ? 0 : (this.wingFrame === 1 ? -4 : 4);
        ctx.fillStyle = birdType.wing;
        ctx.fillRect(-bw/2 + 2, -2 + wingY, 14, 8);
        ctx.fillStyle = '#FF6B35';
        ctx.fillRect(-bw/2 + 2, -2 + wingY, 14, 2);
        
        if (this.isInvincible) {
            ctx.strokeStyle = '#4FC3F7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(bw, bh) / 2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#4FC3F7';
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(bw, bh) / 2 + 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        ctx.restore();
    }
}

let birds = [];
let pipes = [];
let powerUps = [];
let coins = [];
let clouds = [];
let stars = [];
let snowflakes = [];
let groundOffset = 0;

function initClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * CANVAS_WIDTH,
            y: 30 + Math.random() * 200,
            size: 20 + Math.random() * 30,
            speed: 0.3 + Math.random() * 0.3
        });
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT),
            size: 1 + Math.random() * 2,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function initSnowflakes() {
    snowflakes = [];
    for (let i = 0; i < 30; i++) {
        snowflakes.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: 2 + Math.random() * 4,
            speed: 0.5 + Math.random() * 1,
            drift: -0.5 + Math.random()
        });
    }
}

function resetGame() {
    pipes = [];
    powerUps = [];
    coins = [];
    frameCount = 0;
    score = 0;
    currentConsecutive = 0;
    newAchievementsThisGame = [];
    
    if (gameMode === GAME_MODE.DUAL) {
        birds = [
            new Bird(80, CANVAS_HEIGHT / 4, 1),
            new Bird(80, CANVAS_HEIGHT * 3 / 4, 2)
        ];
    } else {
        birds = [new Bird(80, CANVAS_HEIGHT / 2, 1)];
    }
    
    if (currentTheme === 'night') {
        initStars();
    } else if (currentTheme === 'snow') {
        initSnowflakes();
    }
    initClouds();
}

function spawnPipe() {
    const theme = THEMES[currentTheme];
    const minHeight = 50;
    const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight - GROUND_HEIGHT;
    const topPipeHeight = minHeight + Math.random() * maxHeight;
    
    let pipeType = PIPE_TYPES.NORMAL;
    if (score >= 10 && Math.random() < 0.3) {
        pipeType = PIPE_TYPES.MOVING;
    } else if (score >= 20 && Math.random() < 0.2) {
        pipeType = PIPE_TYPES.DISAPPEARING;
    }
    
    const pipe = {
        x: CANVAS_WIDTH,
        topHeight: topPipeHeight,
        bottomY: topPipeHeight + PIPE_GAP,
        passed: false,
        type: pipeType,
        moveDirection: 1,
        moveSpeed: 1,
        visible: true,
        disappearTimer: 0
    };
    
    pipes.push(pipe);
    
    if (Math.random() < POWER_UP_SPAWN_CHANCE && powerUps.length < 2) {
        const types = Object.keys(POWER_UP_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        powerUps.push({
            x: CANVAS_WIDTH + PIPE_WIDTH / 2,
            y: topPipeHeight + PIPE_GAP / 2,
            type: POWER_UP_TYPES[randomType].id,
            collected: false
        });
    }
}

function checkCollision(bird, pipe) {
    if (!bird.alive || bird.isInvincible) return false;
    if (pipe.type === PIPE_TYPES.DISAPPEARING && !pipe.visible) return false;
    
    const birdLeft = bird.x - bird.width / 2 + 4;
    const birdRight = bird.x + bird.width / 2 - 4;
    const birdTop = bird.y - bird.height / 2 + 4;
    const birdBottom = bird.y + bird.height / 2 - 4;
    
    if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
            return true;
        }
    }
    
    if (birdBottom > CANVAS_HEIGHT - GROUND_HEIGHT || birdTop < 0) {
        return true;
    }
    
    return false;
}

function checkPowerUpCollision(bird, powerUp) {
    if (!bird.alive || powerUp.collected) return false;
    
    const dx = bird.x - powerUp.x;
    const dy = bird.y - powerUp.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < 30;
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
        
        if (pipe.type === PIPE_TYPES.MOVING) {
            pipe.topHeight += pipe.moveDirection * pipe.moveSpeed;
            pipe.bottomY = pipe.topHeight + PIPE_GAP;
            
            if (pipe.topHeight < 60) {
                pipe.topHeight = 60;
                pipe.moveDirection = 1;
            }
            if (pipe.bottomY > CANVAS_HEIGHT - GROUND_HEIGHT - 60) {
                pipe.bottomY = CANVAS_HEIGHT - GROUND_HEIGHT - 60;
                pipe.topHeight = pipe.bottomY - PIPE_GAP;
                pipe.moveDirection = -1;
            }
        }
        
        if (pipe.type === PIPE_TYPES.DISAPPEARING) {
            pipe.disappearTimer++;
            if (pipe.disappearTimer % 180 < 60) {
                pipe.visible = false;
            } else {
                pipe.visible = true;
            }
        }
    });
    
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
}

function updatePowerUps() {
    powerUps.forEach(powerUp => {
        powerUp.x -= PIPE_SPEED;
    });
    
    powerUps = powerUps.filter(powerUp => powerUp.x > -30 && !powerUp.collected);
}

function updateEnvironment() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) {
            cloud.x = CANVAS_WIDTH + cloud.size;
            cloud.y = 30 + Math.random() * 200;
        }
    });
    
    if (currentTheme === 'snow') {
        snowflakes.forEach(snowflake => {
            snowflake.y += snowflake.speed;
            snowflake.x += snowflake.drift;
            if (snowflake.y > CANVAS_HEIGHT - GROUND_HEIGHT) {
                snowflake.y = 0;
                snowflake.x = Math.random() * CANVAS_WIDTH;
            }
        });
    }
    
    if (currentTheme === 'night') {
        stars.forEach(star => {
            star.twinkle += 0.05;
        });
    }
    
    groundOffset = (groundOffset + PIPE_SPEED) % 24;
}

function update() {
    if (gameState === GAME_STATE.MENU) {
        frameCount++;
        updateEnvironment();
        return;
    }
    
    if (gameState === GAME_STATE.READY) {
        frameCount++;
        birds.forEach((bird, index) => {
            if (gameMode === GAME_MODE.DUAL) {
                const baseY = index === 0 ? CANVAS_HEIGHT / 4 : CANVAS_HEIGHT * 3 / 4;
                bird.y = baseY + Math.sin(frameCount * 0.05) * 10;
            } else {
                bird.y = CANVAS_HEIGHT / 2 + Math.sin(frameCount * 0.05) * 10;
            }
            bird.wingTimer--;
            if (bird.wingTimer <= 0) {
                bird.wingFrame = (bird.wingFrame + 1) % 3;
                bird.wingTimer = 8;
            }
        });
        updateEnvironment();
        return;
    }
    
    if (gameState !== GAME_STATE.PLAYING) return;
    
    frameCount++;
    
    if (frameCount % 60 === 0) {
        totalPlayTime++;
        savePersistentData();
    }
    
    birds.forEach(bird => bird.update());
    
    if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
        spawnPipe();
    }
    
    updatePipes();
    updatePowerUps();
    
    for (const pipe of pipes) {
        for (const bird of birds) {
            if (checkCollision(bird, pipe)) {
                bird.alive = false;
            }
        }
    }
    
    for (const bird of birds) {
        if (bird.alive) {
            for (const powerUp of powerUps) {
                if (checkPowerUpCollision(bird, powerUp)) {
                    powerUp.collected = true;
                    bird.addPowerUp(powerUp.type);
                    
                    powerUpCollectCount[powerUp.type] = (powerUpCollectCount[powerUp.type] || 0) + 1;
                    localStorage.setItem('pixelBirdPowerUpCount', JSON.stringify(powerUpCollectCount));
                    
                    checkAchievements();
                }
            }
        }
    }
    
    for (const pipe of pipes) {
        if (!pipe.passed) {
            if (gameMode === GAME_MODE.DUAL) {
                birds.forEach(bird => {
                    if (bird.alive && !pipe[`passedPlayer${bird.playerId}`] && pipe.x + PIPE_WIDTH < bird.x) {
                        pipe[`passedPlayer${bird.playerId}`] = true;
                        bird.score++;
                    }
                });
                
                const allPassed = birds.every(bird => 
                    !bird.alive || pipe[`passedPlayer${bird.playerId}`]
                );
                if (allPassed) {
                    pipe.passed = true;
                }
            } else {
                const allPassed = birds.every(bird => 
                    !bird.alive || pipe.x + PIPE_WIDTH < bird.x
                );
                if (allPassed) {
                    pipe.passed = true;
                    score++;
                    currentConsecutive++;
                    
                    if (currentConsecutive > maxConsecutive) {
                        maxConsecutive = currentConsecutive;
                        localStorage.setItem('pixelBirdMaxConsecutive', maxConsecutive);
                    }
                }
            }
        }
    }
    
    updateEnvironment();
    
    if (gameMode === GAME_MODE.DUAL) {
        const aliveBirds = birds.filter(b => b.alive);
        if (aliveBirds.length <= 1) {
            dualGameOver();
        }
    } else {
        if (birds[0] && !birds[0].alive) {
            gameOver();
        }
    }
}

function gameOver() {
    gameState = GAME_STATE.GAME_OVER;
    gamesPlayed++;
    totalScore += score;
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('pixelBirdBestScore', bestScore);
    }
    
    leaderboard.push({
        score: score,
        date: new Date().toLocaleDateString(),
        bird: selectedBirdId,
        theme: currentTheme
    });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('pixelBirdLeaderboard', JSON.stringify(leaderboard));
    
    savePersistentData();
    checkBirdUnlocks();
    checkAchievements();
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('bestScore').textContent = bestScore;
    
    if (newAchievementsThisGame.length > 0) {
        const listEl = document.getElementById('newAchievementsList');
        listEl.innerHTML = newAchievementsThisGame.map(a => `<li>${a.icon} ${a.name}</li>`).join('');
        document.getElementById('newAchievements').classList.remove('hidden');
    } else {
        document.getElementById('newAchievements').classList.add('hidden');
    }
    
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('powerUpDisplay').classList.add('hidden');
}

function dualGameOver() {
    gameState = GAME_STATE.GAME_OVER;
    gamesPlayed++;
    savePersistentData();
    
    const bird1 = birds[0];
    const bird2 = birds[1];
    let winner = 0;
    
    if (bird1.alive && !bird2.alive) {
        winner = 1;
    } else if (!bird1.alive && bird2.alive) {
        winner = 2;
    } else {
        if (bird1.score > bird2.score) {
            winner = 1;
        } else if (bird2.score > bird1.score) {
            winner = 2;
        } else {
            winner = 0;
        }
    }
    
    if (winner > 0) {
        document.getElementById('winnerText').textContent = `玩家${winner}获胜！`;
    } else {
        document.getElementById('winnerText').textContent = '平局！';
    }
    
    document.getElementById('player1FinalScore').textContent = bird1 ? bird1.score : 0;
    document.getElementById('player2FinalScore').textContent = bird2 ? bird2.score : 0;
    
    document.getElementById('dualGameOverScreen').classList.remove('hidden');
    document.getElementById('powerUpDisplay').classList.add('hidden');
    document.getElementById('dualControls').classList.add('hidden');
}

function savePersistentData() {
    localStorage.setItem('pixelBirdTotalScore', totalScore);
    localStorage.setItem('pixelBirdTotalPlayTime', totalPlayTime);
    localStorage.setItem('pixelBirdGamesPlayed', gamesPlayed);
    localStorage.setItem('pixelBirdAchievements', JSON.stringify(achievements));
}

function checkBirdUnlocks() {
    BIRD_TYPES.forEach(bird => {
        if (unlockedBirds.includes(bird.id)) return;
        if (!bird.unlockCondition) {
            unlockedBirds.push(bird.id);
            return;
        }
        
        const cond = bird.unlockCondition;
        let unlocked = false;
        
        switch (cond.type) {
            case 'totalScore':
                unlocked = totalScore >= cond.value;
                break;
            case 'consecutive':
                unlocked = maxConsecutive >= cond.value;
                break;
            case 'playTime':
                unlocked = totalPlayTime >= cond.value;
                break;
            case 'allAchievements':
                unlocked = ACHIEVEMENTS.every(a => achievements[a.id]);
                break;
        }
        
        if (unlocked) {
            unlockedBirds.push(bird.id);
            showAchievementToast(bird.name + ' 已解锁！');
        }
    });
    
    localStorage.setItem('pixelBirdUnlockedBirds', JSON.stringify(unlockedBirds));
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (achievements[achievement.id]) return;
        
        const cond = achievement.condition;
        let unlocked = false;
        
        switch (cond.type) {
            case 'score':
                unlocked = score >= cond.value;
                break;
            case 'consecutive':
                unlocked = maxConsecutive >= cond.value;
                break;
            case 'gamesPlayed':
                unlocked = gamesPlayed >= cond.value;
                break;
            case 'playTime':
                unlocked = totalPlayTime >= cond.value;
                break;
            case 'collectPowerUp':
                unlocked = (powerUpCollectCount[cond.powerUp] || 0) >= cond.value;
                break;
            case 'collectAllPowerUps':
                unlocked = Object.keys(POWER_UP_TYPES).every(t => 
                    (powerUpCollectCount[POWER_UP_TYPES[t].id] || 0) > 0
                );
                break;
        }
        
        if (unlocked) {
            achievements[achievement.id] = true;
            newAchievementsThisGame.push(achievement);
            showAchievementToast(achievement.name);
        }
    });
    
    localStorage.setItem('pixelBirdAchievements', JSON.stringify(achievements));
    checkBirdUnlocks();
}

function showAchievementToast(name) {
    const toast = document.getElementById('achievementToast');
    document.getElementById('toastName').textContent = name;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function drawBackground() {
    const theme = THEMES[currentTheme];
    
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    gradient.addColorStop(0, theme.skyTop);
    gradient.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);
    
    if (currentTheme === 'night') {
        stars.forEach(star => {
            const alpha = 0.5 + Math.sin(star.twinkle) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
    
    clouds.forEach(cloud => {
        ctx.fillStyle = theme.cloud;
        const s = cloud.size;
        ctx.fillRect(cloud.x, cloud.y, s, s * 0.6);
        ctx.fillRect(cloud.x + s * 0.2, cloud.y - s * 0.3, s * 0.6, s * 0.5);
        ctx.fillRect(cloud.x - s * 0.2, cloud.y + s * 0.1, s * 0.4, s * 0.4);
        ctx.fillRect(cloud.x + s * 0.8, cloud.y + s * 0.1, s * 0.4, s * 0.4);
    });
    
    if (currentTheme === 'snow') {
        ctx.fillStyle = '#FFFFFF';
        snowflakes.forEach(snowflake => {
            ctx.fillRect(snowflake.x, snowflake.y, snowflake.size, snowflake.size);
        });
    }
}

function drawPipe(pipe) {
    const theme = THEMES[currentTheme];
    
    if (pipe.type === PIPE_TYPES.DISAPPEARING && !pipe.visible) {
        ctx.globalAlpha = 0.2;
    }
    
    const pipeX = pipe.x;
    const capWidth = PIPE_WIDTH + 8;
    const capHeight = 20;
    
    ctx.fillStyle = theme.pipe;
    ctx.fillRect(pipeX, 0, PIPE_WIDTH, pipe.topHeight);
    
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(pipeX, 0, 8, pipe.topHeight);
    ctx.fillRect(pipeX + PIPE_WIDTH - 8, 0, 8, pipe.topHeight);
    
    ctx.fillStyle = theme.pipe;
    ctx.fillRect(pipeX - 4, pipe.topHeight - capHeight, capWidth, capHeight);
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(pipeX - 4, pipe.topHeight - capHeight, 8, capHeight);
    ctx.fillRect(pipeX + capWidth - 12, pipe.topHeight - capHeight, 8, capHeight);
    ctx.strokeStyle = theme.pipeBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(pipeX - 4, pipe.topHeight - capHeight, capWidth, capHeight);
    
    ctx.fillStyle = theme.pipe;
    ctx.fillRect(pipeX, pipe.bottomY, PIPE_WIDTH, CANVAS_HEIGHT - pipe.bottomY - GROUND_HEIGHT);
    
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(pipeX, pipe.bottomY, 8, CANVAS_HEIGHT - pipe.bottomY - GROUND_HEIGHT);
    ctx.fillRect(pipeX + PIPE_WIDTH - 8, pipe.bottomY, 8, CANVAS_HEIGHT - pipe.bottomY - GROUND_HEIGHT);
    
    ctx.fillStyle = theme.pipe;
    ctx.fillRect(pipeX - 4, pipe.bottomY, capWidth, capHeight);
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(pipeX - 4, pipe.bottomY, 8, capHeight);
    ctx.fillRect(pipeX + capWidth - 12, pipe.bottomY, 8, capHeight);
    ctx.strokeStyle = theme.pipeBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(pipeX - 4, pipe.bottomY, capWidth, capHeight);
    
    if (pipe.type === PIPE_TYPES.MOVING) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.fillRect(pipeX + PIPE_WIDTH / 2 - 8, pipe.topHeight - 30, 16, 16);
    }
    
    ctx.globalAlpha = 1;
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        if (powerUp.collected) return;
        
        const info = POWER_UP_TYPES[powerUp.type.toUpperCase()];
        if (!info) return;
        
        const pulse = Math.sin(frameCount * 0.1) * 3;
        
        ctx.fillStyle = info.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 20 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = info.color;
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(info.icon, powerUp.x, powerUp.y);
    });
}

function drawGround() {
    const theme = THEMES[currentTheme];
    const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
    
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);
    
    ctx.fillStyle = theme.groundDark;
    ctx.fillRect(0, groundY, CANVAS_WIDTH, 16);
    
    ctx.fillStyle = theme.ground;
    for (let x = -groundOffset; x < CANVAS_WIDTH; x += 24) {
        ctx.fillRect(x, groundY + 4, 12, 8);
    }
    
    ctx.fillStyle = theme.groundAccent;
    for (let x = -groundOffset; x < CANVAS_WIDTH; x += 48) {
        ctx.fillRect(x + 24, groundY + 8, 8, 4);
    }
    
    if (gameMode === GAME_MODE.DUAL) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT / 2);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.font = 'bold 14px Courier New';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'left';
        ctx.fillText('玩家2', 10, 25);
        ctx.textAlign = 'left';
        ctx.fillText('玩家1', 10, CANVAS_HEIGHT / 2 + 25);
    }
}

function drawScore() {
    if (gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.READY) {
        if (gameMode === GAME_MODE.DUAL) {
            ctx.font = 'bold 36px Courier New';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            
            const bird1 = birds[0];
            const bird2 = birds[1];
            
            ctx.strokeText((bird1 ? bird1.score : 0).toString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
            ctx.fillStyle = '#FFD700';
            ctx.fillText((bird1 ? bird1.score : 0).toString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
            
            ctx.strokeText((bird2 ? bird2.score : 0).toString(), CANVAS_WIDTH / 2, 80);
            ctx.fillStyle = '#4FC3F7';
            ctx.fillText((bird2 ? bird2.score : 0).toString(), CANVAS_WIDTH / 2, 80);
        } else {
            ctx.font = 'bold 48px Courier New';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 80);
            ctx.fillStyle = '#fff';
            ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 80);
            
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'right';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText('最高分: ' + bestScore, CANVAS_WIDTH - 16, 30);
        }
    }
}

function drawPowerUpDisplay() {
    const container = document.getElementById('activePowerUps');
    const bird = birds[0];
    
    if (!bird || Object.keys(bird.powerUps).length === 0) {
        document.getElementById('powerUpDisplay').classList.add('hidden');
        return;
    }
    
    document.getElementById('powerUpDisplay').classList.remove('hidden');
    
    let html = '';
    for (const [type, powerUp] of Object.entries(bird.powerUps)) {
        const info = POWER_UP_TYPES[type.toUpperCase()];
        if (!info) continue;
        
        const seconds = Math.ceil(powerUp.frames / 60);
        html += `
            <div class="power-up-item" style="border-color: ${info.color}">
                <span class="power-up-icon">${info.icon}</span>
                <span class="power-up-timer">${seconds}s</span>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function render() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawBackground();
    
    pipes.forEach(pipe => drawPipe(pipe));
    
    drawPowerUps();
    
    drawGround();
    
    birds.forEach(bird => bird.draw(ctx, THEMES[currentTheme]));
    
    drawScore();
    
    if (gameState === GAME_STATE.PLAYING) {
        drawPowerUpDisplay();
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function handleFlap(playerId = 1) {
    if (gameState === GAME_STATE.MENU) return;
    
    if (gameState === GAME_STATE.READY) {
        gameState = GAME_STATE.PLAYING;
        document.getElementById('startScreen').classList.add('hidden');
    }
    
    if (gameState === GAME_STATE.PLAYING) {
        if (gameMode === GAME_MODE.DUAL) {
            const bird = birds.find(b => b.playerId === playerId);
            if (bird) bird.flap();
        } else {
            if (birds[0]) birds[0].flap();
        }
    }
}

function handleCanvasClick(e) {
    e.preventDefault();
    if (gameState === GAME_STATE.GAME_OVER) return;
    
    if (gameMode === GAME_MODE.DUAL) {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const playerId = y < CANVAS_HEIGHT / 2 ? 2 : 1;
        handleFlap(playerId);
    } else {
        handleFlap(1);
    }
}

canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleFlap(1);
    } else if (e.code === 'ArrowUp' && gameMode === GAME_MODE.DUAL) {
        e.preventDefault();
        handleFlap(2);
    }
});

const startScreen = document.getElementById('startScreen');
startScreen.addEventListener('click', (e) => {
    e.preventDefault();
    if (gameMode === GAME_MODE.DUAL) {
        handleFlap(1);
        handleFlap(2);
    } else {
        handleFlap(1);
    }
});
startScreen.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameMode === GAME_MODE.DUAL) {
        handleFlap(1);
        handleFlap(2);
    } else {
        handleFlap(1);
    }
}, { passive: false });

function renderBirdSelector() {
    const container = document.getElementById('birdSelector');
    container.innerHTML = '';
    
    BIRD_TYPES.forEach(bird => {
        const isUnlocked = unlockedBirds.includes(bird.id);
        const isSelected = selectedBirdId === bird.id;
        
        const card = document.createElement('div');
        card.className = `bird-card ${isSelected ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
        card.dataset.birdId = bird.id;
        
        if (!isUnlocked) {
            card.innerHTML = `
                <div class="lock-icon">🔒</div>
                <div class="bird-mini" style="opacity: 0.5;"></div>
            `;
            card.title = bird.name + ' - 未解锁';
        } else {
            card.innerHTML = `<div class="bird-mini" id="mini-${bird.id}"></div>`;
            card.title = bird.name;
            card.addEventListener('click', () => {
                selectedBirdId = bird.id;
                localStorage.setItem('pixelBirdSelectedBird', selectedBirdId);
                renderBirdSelector();
            });
        }
        
        container.appendChild(card);
        
        if (isUnlocked) {
            const miniCanvas = document.getElementById(`mini-${bird.id}`);
            if (miniCanvas) {
                miniCanvas.style.width = '34px';
                miniCanvas.style.height = '24px';
                if (bird.body === 'rainbow') {
                    miniCanvas.style.background = 'linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #8B00FF)';
                } else {
                    miniCanvas.style.background = bird.body;
                }
                miniCanvas.style.borderRadius = '4px';
                miniCanvas.style.position = 'relative';
            }
        }
    });
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">暂无记录，快来创造第一个记录吧！</div>';
        return;
    }
    
    container.innerHTML = leaderboard.map((entry, index) => {
        let rankClass = '';
        let rankIcon = '';
        if (index === 0) { rankClass = 'gold'; rankIcon = '🥇'; }
        else if (index === 1) { rankClass = 'silver'; rankIcon = '🥈'; }
        else if (index === 2) { rankClass = 'bronze'; rankIcon = '🥉'; }
        else { rankIcon = `${index + 1}`; }
        
        return `
            <div class="leaderboard-item">
                <span class="leaderboard-rank ${rankClass}">${rankIcon}</span>
                <span>${entry.date}</span>
                <span class="leaderboard-score">${entry.score}</span>
            </div>
        `;
    }).join('');
}

function renderAchievements() {
    const container = document.getElementById('achievementsList');
    
    container.innerHTML = ACHIEVEMENTS.map(achievement => {
        const isUnlocked = achievements[achievement.id];
        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : ''}">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateMenuStats() {
    document.getElementById('menuBestScore').textContent = bestScore;
    document.getElementById('menuTotalScore').textContent = totalScore;
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameMode = btn.dataset.mode;
    });
});

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;
        localStorage.setItem('pixelBirdSelectedTheme', currentTheme);
        
        if (currentTheme === 'night') {
            initStars();
        } else if (currentTheme === 'snow') {
            initSnowflakes();
        }
    });
});

document.getElementById('startGameBtn').addEventListener('click', () => {
    resetGame();
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('startBestScore').textContent = bestScore;
    
    if (gameMode === GAME_MODE.DUAL) {
        document.getElementById('controlHint').textContent = '玩家1按空格，玩家2按上箭头';
        document.getElementById('dualControls').classList.remove('hidden');
    } else {
        document.getElementById('controlHint').textContent = '按空格键或点击屏幕让小鸟拍翅';
        document.getElementById('dualControls').classList.add('hidden');
    }
    
    gameState = GAME_STATE.READY;
});

document.getElementById('showLeaderboardBtn').addEventListener('click', () => {
    renderLeaderboard();
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('leaderboardPanel').classList.remove('hidden');
});

document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
    document.getElementById('leaderboardPanel').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('showAchievementsBtn').addEventListener('click', () => {
    renderAchievements();
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('achievementsPanel').classList.remove('hidden');
});

document.getElementById('closeAchievementsBtn').addEventListener('click', () => {
    document.getElementById('achievementsPanel').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    resetGame();
    gameState = GAME_STATE.READY;
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('startBestScore').textContent = bestScore;
});

document.getElementById('backToMenuBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    gameState = GAME_STATE.MENU;
    updateMenuStats();
    renderBirdSelector();
});

document.getElementById('dualRestartBtn').addEventListener('click', () => {
    document.getElementById('dualGameOverScreen').classList.add('hidden');
    resetGame();
    gameState = GAME_STATE.READY;
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('dualControls').classList.remove('hidden');
    document.getElementById('startBestScore').textContent = bestScore;
});

document.getElementById('dualBackToMenuBtn').addEventListener('click', () => {
    document.getElementById('dualGameOverScreen').classList.add('hidden');
    document.getElementById('dualControls').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    gameState = GAME_STATE.MENU;
    updateMenuStats();
    renderBirdSelector();
});

function init() {
    checkBirdUnlocks();
    renderBirdSelector();
    updateMenuStats();
    
    document.querySelector(`.theme-btn[data-theme="${currentTheme}"]`)?.classList.add('active');
    
    initClouds();
    if (currentTheme === 'night') initStars();
    if (currentTheme === 'snow') initSnowflakes();
    
    gameLoop();
}

init();
