const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const waveElement = document.getElementById('wave');
const livesElement = document.getElementById('lives');
const powerupDisplay = document.getElementById('powerupDisplay');
const powerupLevelElement = document.getElementById('powerupLevel');
const shieldDisplay = document.getElementById('shieldDisplay');
const bossHealthContainer = document.getElementById('bossHealthContainer');
const bossHealthBar = document.getElementById('bossHealthBar');
const bossHealthText = document.getElementById('bossHealthText');
const bombIndicator = document.getElementById('bombIndicator');
const bombCountElement = document.getElementById('bombCount');
const waveAnnouncement = document.getElementById('waveAnnouncement');
const waveNumberElement = document.getElementById('waveNumber');
const startPanel = document.getElementById('startPanel');
const startBtn = document.getElementById('startBtn');
const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
const gameOverPanel = document.getElementById('gameOverPanel');
const finalScoreElement = document.getElementById('finalScore');
const finalWaveElement = document.getElementById('finalWave');
const finalKillsElement = document.getElementById('finalKills');
const newHighScoreElement = document.getElementById('newHighScore');
const restartBtn = document.getElementById('restartBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const leaderboardList = document.getElementById('leaderboardList');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const pausePanel = document.getElementById('pausePanel');
const resumeBtn = document.getElementById('resumeBtn');
const quitBtn = document.getElementById('quitBtn');
const musicToggle = document.getElementById('musicToggle');
const soundToggle = document.getElementById('soundToggle');
const shakeToggle = document.getElementById('shakeToggle');
const particlesToggle = document.getElementById('particlesToggle');
const musicVolume = document.getElementById('musicVolume');
const soundVolume = document.getElementById('soundVolume');
const musicVolumeValue = document.getElementById('musicVolumeValue');
const soundVolumeValue = document.getElementById('soundVolumeValue');

const BASE_CANVAS_WIDTH = 800;
const BASE_CANVAS_HEIGHT = 600;
let CANVAS_WIDTH = canvas.width;
let CANVAS_HEIGHT = canvas.height;
let scaleX = 1;
let scaleY = 1;

const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const BULLET_INTERVAL = 150;
const ENEMY_BASE_SPEED = 2;
const ENEMY_BASE_SPAWN_INTERVAL = 1200;
const INITIAL_LIVES = 3;
const SCORE_PER_ENEMY = 10;
const SCORE_PER_BOSS_HIT = 5;
const ENEMIES_PER_WAVE = 10;
const BOSS_WAVE_INTERVAL = 5;
const POWERUP_DROP_CHANCE = 0.15;
const MAX_POWERUP_LEVEL = 3;
const SHIELD_DURATION = 8000;

let gameState = 'menu';
let score = 0;
let lives = INITIAL_LIVES;
let wave = 1;
let kills = 0;
let waveEnemiesRemaining = 0;
let waveInProgress = false;
let player = null;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let powerups = [];
let particles = [];
let stars = [];
let boss = null;
let keys = {};
let lastBulletTime = 0;
let lastEnemyTime = 0;
let animationId = null;
let lastTime = 0;
let deltaTime = 0;
let screenShake = { active: false, intensity: 0, duration: 0 };
let shieldActive = false;
let shieldEndTime = 0;
let powerupLevel = 1;
let bombs = 1;
let audioContext = null;
let musicGainNode = null;
let soundGainNode = null;
let bgMusicOscillator = null;
let settings = {
    musicEnabled: true,
    soundEnabled: true,
    shakeEnabled: true,
    particlesEnabled: true,
    musicVolume: 0.5,
    soundVolume: 0.7
};
let touchControls = { active: false, lastX: 0, lastY: 0 };
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

loadSettings();
resizeCanvas();

class Player {
    constructor() {
        this.width = 50;
        this.height = 60;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = CANVAS_HEIGHT - this.height - 20;
        this.speed = PLAYER_SPEED;
    }

    update(deltaTime) {
        const speed = this.speed * deltaTime * 60;
        if (touchControls.active) {
            this.x += (touchControls.targetX - this.x - this.width / 2) * 0.15 * deltaTime * 60;
            this.y += (touchControls.targetY - this.y - this.height / 2) * 0.15 * deltaTime * 60;
        } else {
            if (keys['ArrowLeft'] || keys['KeyA']) this.x -= speed;
            if (keys['ArrowRight'] || keys['KeyD']) this.x += speed;
            if (keys['ArrowUp'] || keys['KeyW']) this.y -= speed;
            if (keys['ArrowDown'] || keys['KeyS']) this.y += speed;
        }

        this.x = Math.max(0, Math.min(CANVAS_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(CANVAS_HEIGHT - this.height, this.y));

        if (shieldActive && Date.now() > shieldEndTime) {
            shieldActive = false;
            shieldDisplay.classList.add('hidden');
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (shieldActive) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, '#00ffcc');
        gradient.addColorStop(1, '#0088ff');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 4, this.height / 3);
        ctx.lineTo(0, this.height / 2 - 5);
        ctx.lineTo(this.width / 4, this.height / 3);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, -5, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff8800';
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 15;
        const flameHeight = 10 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(-8, this.height / 2 - 5);
        ctx.lineTo(0, this.height / 2 + flameHeight);
        ctx.lineTo(8, this.height / 2 - 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    shoot() {
        const now = Date.now();
        if (now - lastBulletTime >= BULLET_INTERVAL) {
            const centerX = this.x + this.width / 2;
            const topY = this.y;

            if (powerupLevel === 1) {
                bullets.push(new Bullet(centerX, topY, 0));
            } else if (powerupLevel === 2) {
                bullets.push(new Bullet(centerX - 10, topY, 0));
                bullets.push(new Bullet(centerX + 10, topY, 0));
            } else {
                bullets.push(new Bullet(centerX, topY, 0));
                bullets.push(new Bullet(centerX - 15, topY + 10, -0.1));
                bullets.push(new Bullet(centerX + 15, topY + 10, 0.1));
            }

            lastBulletTime = now;
            playSound('shoot');
        }
    }
}

class Bullet {
    constructor(x, y, angleOffset = 0) {
        this.width = 4;
        this.height = 15;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = BULLET_SPEED;
        this.angleOffset = angleOffset;
    }

    update(deltaTime) {
        const speed = this.speed * deltaTime * 60;
        this.y -= speed;
        this.x += this.angleOffset * speed;
    }

    draw() {
        ctx.save();
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(1, '#ff8800');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;

        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    isOffScreen() {
        return this.y + this.height < 0 || this.x < -this.width || this.x > CANVAS_WIDTH;
    }
}

class EnemyBullet {
    constructor(x, y, targetX, targetY) {
        this.width = 6;
        this.height = 6;
        this.x = x;
        this.y = y;
        const angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(angle) * 4;
        this.vy = Math.sin(angle) * 4;
    }

    update(deltaTime) {
        const speedMul = deltaTime * 60;
        this.x += this.vx * speedMul;
        this.y += this.vy * speedMul;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = '#ff0066';
        ctx.shadowColor = '#ff0066';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT || this.y < -this.height || 
               this.x < -this.width || this.x > CANVAS_WIDTH;
    }
}

class Enemy {
    constructor(type = 'normal') {
        this.type = type;
        this.width = type === 'fast' ? 30 : 40;
        this.height = type === 'fast' ? 35 : 45;
        this.x = Math.random() * (CANVAS_WIDTH - this.width);
        this.y = -this.height;
        this.baseSpeed = ENEMY_BASE_SPEED + (wave - 1) * 0.3;
        this.speed = type === 'fast' ? this.baseSpeed * 1.8 : this.baseSpeed;
        this.health = type === 'tank' ? 3 : 1;
        this.maxHealth = this.health;
        this.scoreValue = type === 'tank' ? 30 : (type === 'fast' ? 15 : 10);
        this.shootTimer = 0;
        this.shootInterval = type === 'tank' ? 2000 : 0;
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime * 60;

        if (this.shootInterval > 0 && player) {
            this.shootTimer += deltaTime * 1000;
            if (this.shootTimer >= this.shootInterval && this.y > 50) {
                this.shootTimer = 0;
                enemyBullets.push(new EnemyBullet(
                    this.x + this.width / 2,
                    this.y + this.height,
                    player.x + player.width / 2,
                    player.y + player.height / 2
                ));
                playSound('enemyShoot');
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const color1 = this.type === 'tank' ? '#8800ff' : (this.type === 'fast' ? '#ff8800' : '#ff4444');
        const color2 = this.type === 'tank' ? '#4400aa' : (this.type === 'fast' ? '#cc5500' : '#aa0000');

        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.shadowColor = color1;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(-this.width / 4, -this.height / 4);
        ctx.lineTo(0, -this.height / 2 + 5);
        ctx.lineTo(this.width / 4, -this.height / 4);
        ctx.lineTo(this.width / 2, -this.height / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#330000';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.ellipse(0, 5, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.maxHealth > 1) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(-this.width / 2, -this.height / 2 - 8, this.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(-this.width / 2, -this.height / 2 - 8, this.width * (this.health / this.maxHealth), 4);
        }

        ctx.restore();
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT;
    }

    hit() {
        this.health--;
        return this.health <= 0;
    }
}

class Boss {
    constructor() {
        this.width = 150;
        this.height = 120;
        this.x = CANVAS_WIDTH / 2 - this.width / 2;
        this.y = -this.height;
        this.targetY = 80;
        this.speed = 2;
        this.maxHealth = 100 + wave * 20;
        this.health = this.maxHealth;
        this.phase = 1;
        this.shootTimer = 0;
        this.moveTimer = 0;
        this.moveDirection = 1;
        this.entering = true;
    }

    update(deltaTime) {
        if (this.entering) {
            this.y += 60 * deltaTime;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.entering = false;
            }
            return;
        }

        this.moveTimer += deltaTime * 1000;
        if (this.moveTimer >= 30) {
            this.moveTimer = 0;
            this.x += this.moveDirection * this.speed * deltaTime * 60;
            if (this.x <= 20 || this.x >= CANVAS_WIDTH - this.width - 20) {
                this.moveDirection *= -1;
            }
        }

        this.shootTimer += deltaTime * 1000;
        const shootInterval = this.phase === 3 ? 500 : (this.phase === 2 ? 800 : 1200);

        if (this.shootTimer >= shootInterval && player) {
            this.shootTimer = 0;
            const centerX = this.x + this.width / 2;
            const bottomY = this.y + this.height;

            if (this.phase === 1) {
                for (let i = -1; i <= 1; i++) {
                    enemyBullets.push(new EnemyBullet(centerX, bottomY, 
                        player.x + player.width / 2 + i * 50, 
                        player.y + player.height / 2));
                }
            } else if (this.phase === 2) {
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI / 6) * (i - 2) + Math.PI / 2;
                    const bullet = new EnemyBullet(centerX, bottomY, 0, 0);
                    bullet.vx = Math.cos(angle) * 4;
                    bullet.vy = Math.sin(angle) * 4;
                    enemyBullets.push(bullet);
                }
            } else {
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    const bullet = new EnemyBullet(centerX, bottomY, 0, 0);
                    bullet.vx = Math.cos(angle) * 3;
                    bullet.vy = Math.sin(angle) * 3;
                    enemyBullets.push(bullet);
                }
            }
            playSound('enemyShoot');
        }

        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= 0.3 && this.phase < 3) {
            this.phase = 3;
            triggerScreenShake(15, 500);
        } else if (healthPercent <= 0.6 && this.phase < 2) {
            this.phase = 2;
            triggerScreenShake(10, 300);
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        if (this.phase === 3) {
            gradient.addColorStop(0, '#ff0000');
            gradient.addColorStop(1, '#880000');
        } else if (this.phase === 2) {
            gradient.addColorStop(0, '#ff6600');
            gradient.addColorStop(1, '#993300');
        } else {
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(1, '#660066');
        }

        ctx.fillStyle = gradient;
        ctx.shadowColor = this.phase === 3 ? '#ff0000' : (this.phase === 2 ? '#ff6600' : '#ff00ff');
        ctx.shadowBlur = 30;

        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.lineTo(-this.width / 3, -this.height / 2);
        ctx.lineTo(0, -this.height / 3);
        ctx.lineTo(this.width / 3, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        for (let i = -1; i <= 1; i += 2) {
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(i * 40, -20, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    hit() {
        this.health--;
        return this.health <= 0;
    }

    getHealthPercent() {
        return Math.max(0, this.health / this.maxHealth * 100);
    }
}

class Powerup {
    constructor(x, y) {
        this.width = 30;
        this.height = 30;
        this.x = x - this.width / 2;
        this.y = y;
        this.speed = 2;
        this.pulsePhase = 0;

        const types = ['power', 'shield', 'bomb', 'health'];
        this.type = types[Math.floor(Math.random() * types.length)];
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime * 60;
        this.pulsePhase += 0.1 * deltaTime * 60;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
        ctx.scale(pulse, pulse);

        let color, symbol;
        switch (this.type) {
            case 'power':
                color = '#ff8800';
                symbol = '🔥';
                break;
            case 'shield':
                color = '#00ffff';
                symbol = '🛡';
                break;
            case 'bomb':
                color = '#ff4444';
                symbol = '💣';
                break;
            case 'health':
                color = '#ff6699';
                symbol = '❤️';
                break;
        }

        ctx.fillStyle = 'rgba(10, 22, 40, 0.8)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        const x = -this.width / 2;
        const y = -this.height / 2;
        const w = this.width;
        const h = this.height;
        const r = 6;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, 0, 0);

        ctx.restore();
    }

    isOffScreen() {
        return this.y > CANVAS_HEIGHT;
    }
}

class Particle {
    constructor(x, y, color, speed = 8) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.color = color;
        this.size = 2 + Math.random() * 4;
    }

    update(deltaTime) {
        const speedMul = deltaTime * 60;
        this.x += this.vx * speedMul;
        this.y += this.vy * speedMul;
        this.life -= this.decay * speedMul;
        this.vx *= Math.pow(0.98, speedMul);
        this.vy *= Math.pow(0.98, speedMul);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * CANVAS_WIDTH;
        this.y = Math.random() * CANVAS_HEIGHT;
        this.size = Math.random() * 2;
        this.speed = 0.5 + Math.random() * 1.5;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime * 60;
        if (this.y > CANVAS_HEIGHT) {
            this.y = 0;
            this.x = Math.random() * CANVAS_WIDTH;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }
}

function createExplosion(x, y, color, count = 20) {
    if (!settings.particlesEnabled) return;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function createBigExplosion(x, y) {
    if (!settings.particlesEnabled) return;
    const colors = ['#ff4444', '#ff8800', '#ffff00', '#ffffff'];
    for (let i = 0; i < 60; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], 12));
    }
    triggerScreenShake(20, 800);
}

function triggerScreenShake(intensity, duration) {
    if (!settings.shakeEnabled) return;
    screenShake.active = true;
    screenShake.intensity = intensity;
    screenShake.duration = duration;
}

function updateScreenShake(deltaTime) {
    if (screenShake.active) {
        screenShake.duration -= deltaTime * 1000;
        if (screenShake.duration <= 0) {
            screenShake.active = false;
            screenShake.intensity = 0;
        }
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateLivesDisplay() {
    livesElement.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        livesElement.appendChild(heart);
    }
}

function updateScoreDisplay() {
    scoreElement.textContent = score;
}

function updateWaveDisplay() {
    waveElement.textContent = wave;
}

function updatePowerupDisplay() {
    powerupLevelElement.innerHTML = '';
    for (let i = 0; i < powerupLevel; i++) {
        const dot = document.createElement('div');
        dot.className = 'powerup-dot';
        powerupLevelElement.appendChild(dot);
    }
    if (powerupLevel > 1) {
        powerupDisplay.classList.remove('hidden');
    } else {
        powerupDisplay.classList.add('hidden');
    }
}

function updateBombDisplay() {
    bombCountElement.textContent = bombs;
    if (bombs > 0) {
        bombIndicator.classList.remove('hidden');
    } else {
        bombIndicator.classList.add('hidden');
    }
}

function updateBossHealthDisplay() {
    if (boss) {
        const percent = boss.getHealthPercent();
        bossHealthBar.style.width = percent + '%';
        bossHealthText.textContent = Math.round(percent) + '%';
    }
}

function showWaveAnnouncement() {
    waveNumberElement.textContent = wave;
    waveAnnouncement.classList.remove('hidden');
    setTimeout(() => {
        waveAnnouncement.classList.add('hidden');
    }, 2000);
}

function startWave() {
    if (wave % BOSS_WAVE_INTERVAL === 0) {
        boss = new Boss();
        waveEnemiesRemaining = 1;
        bossHealthContainer.classList.remove('hidden');
    } else {
        waveEnemiesRemaining = ENEMIES_PER_WAVE + Math.floor(wave * 1.5);
    }
    waveInProgress = true;
    showWaveAnnouncement();
    playSound('waveStart');
}

function spawnEnemy() {
    if (boss) return;
    if (waveEnemiesRemaining <= 0) return;

    const now = Date.now();
    const spawnInterval = Math.max(400, ENEMY_BASE_SPAWN_INTERVAL - wave * 50);

    if (now - lastEnemyTime >= spawnInterval) {
        let type = 'normal';
        const rand = Math.random();
        if (wave >= 3 && rand < 0.2) {
            type = 'fast';
        } else if (wave >= 5 && rand < 0.1) {
            type = 'tank';
        }

        enemies.push(new Enemy(type));
        waveEnemiesRemaining--;
        lastEnemyTime = now;
    }
}

function checkWaveComplete() {
    if (!waveInProgress) return;

    if (boss) {
        return;
    }

    if (waveEnemiesRemaining <= 0 && enemies.length === 0) {
        waveInProgress = false;
        wave++;
        updateWaveDisplay();
        setTimeout(() => {
            if (gameState === 'playing') {
                startWave();
            }
        }, 2000);
    }
}

function useBomb() {
    if (bombs <= 0 || gameState !== 'playing') return;

    bombs--;
    updateBombDisplay();

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff4444');
        score += enemy.scoreValue;
        kills++;
        enemies.splice(i, 1);
        waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1);
    }

    if (boss) {
        boss.health -= 20;
        updateBossHealthDisplay();
        createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff8800', 40);
        if (boss.health <= 0) {
            destroyBoss();
        }
    }

    enemyBullets = [];
    triggerScreenShake(25, 1000);
    playSound('bomb');
    updateScoreDisplay();
    checkWaveComplete();
}

function destroyBoss() {
    createBigExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2);
    score += 500 + wave * 100;
    kills++;
    boss = null;
    bossHealthContainer.classList.add('hidden');
    waveInProgress = false;
    wave++;
    updateWaveDisplay();
    updateScoreDisplay();
    playSound('bossDefeat');

    if (Math.random() < 0.5) {
        powerups.push(new Powerup(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3));
    }

    setTimeout(() => {
        if (gameState === 'playing') {
            startWave();
        }
    }, 3000);
}

function collectPowerup(powerup) {
    switch (powerup.type) {
        case 'power':
            powerupLevel = Math.min(MAX_POWERUP_LEVEL, powerupLevel + 1);
            updatePowerupDisplay();
            break;
        case 'shield':
            shieldActive = true;
            shieldEndTime = Date.now() + SHIELD_DURATION;
            shieldDisplay.classList.remove('hidden');
            break;
        case 'bomb':
            bombs++;
            updateBombDisplay();
            break;
        case 'health':
            lives = Math.min(5, lives + 1);
            updateLivesDisplay();
            break;
    }
    playSound('powerup');
    createExplosion(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, '#00ffcc', 15);
}

function playerHit() {
    if (shieldActive) {
        shieldActive = false;
        shieldDisplay.classList.add('hidden');
        playSound('shieldHit');
        triggerScreenShake(8, 200);
        return;
    }

    lives--;
    updateLivesDisplay();
    playSound('playerHit');
    triggerScreenShake(15, 400);
    powerupLevel = Math.max(1, powerupLevel - 1);
    updatePowerupDisplay();

    if (lives <= 0) {
        gameOver();
    }
}

function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        musicGainNode = audioContext.createGain();
        soundGainNode = audioContext.createGain();
        musicGainNode.connect(audioContext.destination);
        soundGainNode.connect(audioContext.destination);
        musicGainNode.gain.value = settings.musicEnabled ? settings.musicVolume : 0;
        soundGainNode.gain.value = settings.soundEnabled ? settings.soundVolume : 0;
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playSound(type) {
    if (!audioContext || !settings.soundEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(soundGainNode);

    switch (type) {
        case 'shoot':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'enemyShoot':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
        case 'explosion':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'playerHit':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'powerup':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
        case 'bomb':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'waveStart':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'bossDefeat':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'shieldHit':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
    }
}

function startBackgroundMusic() {
    if (!audioContext || !settings.musicEnabled || bgMusicOscillator) return;

    bgMusicOscillator = audioContext.createOscillator();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    bgMusicOscillator.type = 'triangle';
    bgMusicOscillator.frequency.setValueAtTime(110, audioContext.currentTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.5, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(10, audioContext.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bgMusicOscillator.frequency);
    bgMusicOscillator.connect(musicGainNode);

    lfo.start();
    bgMusicOscillator.start();
}

function stopBackgroundMusic() {
    if (bgMusicOscillator) {
        bgMusicOscillator.stop();
        bgMusicOscillator = null;
    }
}

function saveSettings() {
    localStorage.setItem('planeShooterSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('planeShooterSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
        if (musicToggle) musicToggle.checked = settings.musicEnabled;
        if (soundToggle) soundToggle.checked = settings.soundEnabled;
        if (shakeToggle) shakeToggle.checked = settings.shakeEnabled;
        if (particlesToggle) particlesToggle.checked = settings.particlesEnabled;
        if (musicVolume) musicVolume.value = settings.musicVolume * 100;
        if (soundVolume) soundVolume.value = settings.soundVolume * 100;
        if (musicVolumeValue) musicVolumeValue.textContent = Math.round(settings.musicVolume * 100) + '%';
        if (soundVolumeValue) soundVolumeValue.textContent = Math.round(settings.soundVolume * 100) + '%';
    }
}

function getLeaderboard() {
    const saved = localStorage.getItem('planeShooterLeaderboard');
    return saved ? JSON.parse(saved) : [];
}

function saveToLeaderboard(score, wave, kills) {
    const leaderboard = getLeaderboard();
    const entry = { score, wave, kills, date: new Date().toLocaleDateString() };
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10);
    localStorage.setItem('planeShooterLeaderboard', JSON.stringify(leaderboard));
    return leaderboard.findIndex(e => e.score === score && e.wave === wave && e.kills === kills);
}

function showLeaderboard() {
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">暂无记录，快来创造第一个记录吧！</div>';
    } else {
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="leaderboard-rank rank-${index + 1}">${index + 1}</div>
                <div class="leaderboard-score">${entry.score}</div>
                <div class="leaderboard-wave">第${entry.wave}波 · ${entry.kills}杀</div>
            `;
            leaderboardList.appendChild(item);
        });
    }

    leaderboardPanel.classList.remove('hidden');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(window.innerWidth - 30, BASE_CANVAS_WIDTH);
    const maxHeight = Math.min(window.innerHeight - 150, BASE_CANVAS_HEIGHT);

    scaleX = maxWidth / BASE_CANVAS_WIDTH;
    scaleY = maxHeight / BASE_CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    CANVAS_WIDTH = BASE_CANVAS_WIDTH * scale;
    CANVAS_HEIGHT = BASE_CANVAS_HEIGHT * scale;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';

    scaleX = CANVAS_WIDTH / BASE_CANVAS_WIDTH;
    scaleY = CANVAS_HEIGHT / BASE_CANVAS_HEIGHT;
}

function update(deltaTime) {
    if (gameState !== 'playing') return;

    player.update(deltaTime);

    if (isMobile || keys['Space']) {
        player.shoot();
    }

    bullets.forEach(bullet => bullet.update(deltaTime));
    bullets = bullets.filter(bullet => !bullet.isOffScreen());

    enemyBullets.forEach(bullet => bullet.update(deltaTime));
    enemyBullets = enemyBullets.filter(bullet => !bullet.isOffScreen());

    if (boss) {
        boss.update(deltaTime);
        updateBossHealthDisplay();
    } else {
        spawnEnemy();
    }

    enemies.forEach(enemy => enemy.update(deltaTime));

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.isOffScreen()) {
            playerHit();
            enemies.splice(i, 1);
            waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1);
        }
    }

    powerups.forEach(powerup => powerup.update(deltaTime));
    powerups = powerups.filter(powerup => !powerup.isOffScreen());

    for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = bullets[bulletIndex];
        for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
            const enemy = enemies[enemyIndex];
            if (checkCollision(bullet, enemy)) {
                if (enemy.hit()) {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff4444');
                    score += enemy.scoreValue;
                    kills++;
                    enemies.splice(enemyIndex, 1);
                    waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1);
                    playSound('explosion');

                    if (Math.random() < POWERUP_DROP_CHANCE && !boss) {
                        powerups.push(new Powerup(enemy.x + enemy.width / 2, enemy.y));
                    }
                }
                bullets.splice(bulletIndex, 1);
                updateScoreDisplay();
                break;
            }
        }
    }

    if (boss) {
        for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
            const bullet = bullets[bulletIndex];
            if (checkCollision(bullet, boss)) {
                if (boss.hit()) {
                    destroyBoss();
                } else {
                    createExplosion(bullet.x, bullet.y, '#ff8800', 5);
                    score += SCORE_PER_BOSS_HIT;
                    updateScoreDisplay();
                    updateBossHealthDisplay();
                }
                bullets.splice(bulletIndex, 1);
                break;
            }
        }
    }

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
        const enemy = enemies[enemyIndex];
        if (checkCollision(player, enemy)) {
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff4444');
            enemies.splice(enemyIndex, 1);
            waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1);
            playerHit();
        }
    }

    if (boss && checkCollision(player, boss)) {
        playerHit();
    }

    for (let bulletIndex = enemyBullets.length - 1; bulletIndex >= 0; bulletIndex--) {
        const bullet = enemyBullets[bulletIndex];
        if (checkCollision(player, bullet)) {
            enemyBullets.splice(bulletIndex, 1);
            playerHit();
        }
    }

    for (let powerupIndex = powerups.length - 1; powerupIndex >= 0; powerupIndex--) {
        const powerup = powerups[powerupIndex];
        if (checkCollision(player, powerup)) {
            collectPowerup(powerup);
            powerups.splice(powerupIndex, 1);
        }
    }

    particles.forEach(particle => particle.update(deltaTime));
    particles = particles.filter(particle => !particle.isDead());

    stars.forEach(star => star.update(deltaTime));

    updateScreenShake(deltaTime);

    if (!boss) {
        checkWaveComplete();
    }
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    if (screenShake.active) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake.intensity * 2,
            (Math.random() - 0.5) * screenShake.intensity * 2
        );
    }

    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#0a1628');
    bgGradient.addColorStop(1, '#1a2744');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    stars.forEach(star => star.draw());

    if (gameState === 'playing' || gameState === 'paused') {
        powerups.forEach(powerup => powerup.draw());
        bullets.forEach(bullet => bullet.draw());
        enemyBullets.forEach(bullet => bullet.draw());
        enemies.forEach(enemy => enemy.draw());
        if (boss) boss.draw();
        player.draw();
        particles.forEach(particle => particle.draw());
    }

    ctx.restore();
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(deltaTime);
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    initAudio();
    startBackgroundMusic();

    gameState = 'playing';
    score = 0;
    lives = INITIAL_LIVES;
    wave = 1;
    kills = 0;
    powerupLevel = 1;
    bombs = 1;
    shieldActive = false;
    boss = null;
    player = new Player();
    bullets = [];
    enemies = [];
    enemyBullets = [];
    powerups = [];
    particles = [];
    lastBulletTime = 0;
    lastEnemyTime = 0;
    waveInProgress = false;

    updateScoreDisplay();
    updateLivesDisplay();
    updateWaveDisplay();
    updatePowerupDisplay();
    updateBombDisplay();

    bossHealthContainer.classList.add('hidden');
    shieldDisplay.classList.add('hidden');
    startPanel.classList.add('hidden');
    gameOverPanel.classList.add('hidden');
    pausePanel.classList.add('hidden');

    setTimeout(() => startWave(), 1000);
}

function gameOver() {
    gameState = 'gameOver';
    stopBackgroundMusic();
    playSound('explosion');

    const rank = saveToLeaderboard(score, wave, kills);

    finalScoreElement.textContent = score;
    finalWaveElement.textContent = wave;
    finalKillsElement.textContent = kills;

    if (rank === 0) {
        newHighScoreElement.classList.remove('hidden');
    } else {
        newHighScoreElement.classList.add('hidden');
    }

    gameOverPanel.classList.remove('hidden');
}

function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pausePanel.classList.remove('hidden');
    }
}

function resumeGame() {
    if (gameState === 'paused') {
        gameState = 'playing';
        pausePanel.classList.add('hidden');
    }
}

function backToMenu() {
    gameState = 'menu';
    stopBackgroundMusic();
    gameOverPanel.classList.add('hidden');
    pausePanel.classList.add('hidden');
    bossHealthContainer.classList.add('hidden');
    startPanel.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
        e.preventDefault();
        initAudio();
    }
    if (e.code === 'KeyB') {
        useBomb();
    }
    if (e.code === 'Escape') {
        if (gameState === 'playing') pauseGame();
        else if (gameState === 'paused') resumeGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    touchControls.active = true;
    touchControls.lastX = coords.x;
    touchControls.lastY = coords.y;
    touchControls.targetX = coords.x;
    touchControls.targetY = coords.y;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!touchControls.active) return;
    const touch = e.touches[0];
    const coords = getCanvasCoords(touch.clientX, touch.clientY);
    touchControls.targetX = coords.x;
    touchControls.targetY = coords.y;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchControls.active = false;
});

canvas.addEventListener('click', () => {
    initAudio();
});

window.addEventListener('resize', resizeCanvas);

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
backToMenuBtn.addEventListener('click', backToMenu);
resumeBtn.addEventListener('click', resumeGame);
quitBtn.addEventListener('click', backToMenu);

leaderboardBtn.addEventListener('click', showLeaderboard);
showLeaderboardBtn.addEventListener('click', showLeaderboard);
closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardPanel.classList.add('hidden');
});

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settings.musicEnabled = musicToggle.checked;
    settings.soundEnabled = soundToggle.checked;
    settings.shakeEnabled = shakeToggle.checked;
    settings.particlesEnabled = particlesToggle.checked;
    settings.musicVolume = musicVolume.value / 100;
    settings.soundVolume = soundVolume.value / 100;
    saveSettings();

    if (musicGainNode) {
        musicGainNode.gain.value = settings.musicEnabled ? settings.musicVolume : 0;
    }
    if (soundGainNode) {
        soundGainNode.gain.value = settings.soundEnabled ? settings.soundVolume : 0;
    }

    if (settings.musicEnabled && gameState === 'playing') {
        startBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }

    settingsPanel.classList.add('hidden');
});

musicVolume.addEventListener('input', () => {
    musicVolumeValue.textContent = musicVolume.value + '%';
});

soundVolume.addEventListener('input', () => {
    soundVolumeValue.textContent = soundVolume.value + '%';
});

initStars();
gameLoop();
