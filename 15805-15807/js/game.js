const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;
const PLAYER_MAX_SPEED = 520;
const PLAYER_ACCELERATION = 2000;
const PLAYER_DECELERATION = 2500;
const DASH_DISTANCE = 150;
const DASH_DURATION = 0.15;
const MAX_LIVES = 3;

const BASE_OBSTACLE_SPEED = 280;
const BASE_SPAWN_INTERVAL = 1100;
const MIN_SPAWN_INTERVAL = 350;

const OBSTACLE_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const SKINS = [
    { id: 'default', name: '经典蓝', color1: '#818cf8', color2: '#4f46e5', unlocked: true },
    { id: 'fire', name: '烈焰红', color1: '#f97316', color2: '#dc2626', unlocked: false, requirement: 'reachLevel', value: 5 },
    { id: 'nature', name: '翡翠绿', color1: '#4ade80', color2: '#16a34a', unlocked: false, requirement: 'unlockAchievement', value: 'dodgeMaster' },
    { id: 'gold', name: '黄金传说', color1: '#fbbf24', color2: '#d97706', unlocked: false, requirement: 'score', value: 1000 },
    { id: 'purple', name: '神秘紫', color1: '#c084fc', color2: '#9333ea', unlocked: false, requirement: 'reachLevel', value: 10 },
    { id: 'cyan', name: '冰霜蓝', color1: '#22d3ee', color2: '#0891b2', unlocked: false, requirement: 'unlockAchievement', value: 'invincible' }
];

const ACHIEVEMENTS = [
    { id: 'firstWin', name: '初次胜利', desc: '完成第一关', icon: '🏅', unlocked: false },
    { id: 'dodge100', name: '躲避达人', desc: '累计躲避100个方块', icon: '🎯', unlocked: false, progress: 0, target: 100 },
    { id: 'dodgeMaster', name: '躲避大师', desc: '累计躲避500个方块', icon: '🏆', unlocked: false, progress: 0, target: 500 },
    { id: 'comboKing', name: '连击之王', desc: '单次连击达到50', icon: '🔥', unlocked: false, progress: 0, target: 50 },
    { id: 'score500', name: '分数挑战者', desc: '单局达到500分', icon: '⭐', unlocked: false },
    { id: 'score1000', name: '高分达人', desc: '单局达到1000分', icon: '🌟', unlocked: false },
    { id: 'invincible', name: '无伤害大师', desc: '单次游戏无伤存活60秒', icon: '🛡️', unlocked: false },
    { id: 'level5', name: '新手毕业', desc: '通过第5关', icon: '📚', unlocked: false },
    { id: 'level10', name: '进阶玩家', desc: '通过第10关', icon: '🎮', unlocked: false },
    { id: 'allSkills', name: '技能娴熟', desc: '在一局中使用所有技能各一次', icon: '⚡', unlocked: false },
    { id: 'collector', name: '道具收藏家', desc: '收集10个道具', icon: '🎁', unlocked: false, progress: 0, target: 10 },
    { id: 'dailyChampion', name: '每日冠军', desc: '完成每日挑战', icon: '📅', unlocked: false }
];

const LEVELS = [
    { level: 1, targetScore: 30, name: '新手村', specialRule: null, obstacleTypes: ['normal'] },
    { level: 2, targetScore: 60, name: '初露锋芒', specialRule: null, obstacleTypes: ['normal', 'multi'] },
    { level: 3, targetScore: 100, name: '速度提升', specialRule: 'faster', obstacleTypes: ['normal', 'multi', 'diagonal'] },
    { level: 4, targetScore: 150, name: '摇摆威胁', specialRule: null, obstacleTypes: ['normal', 'multi', 'diagonal', 'swing'] },
    { level: 5, targetScore: 200, name: '追踪者', specialRule: null, obstacleTypes: ['normal', 'multi', 'diagonal', 'swing', 'tracking'] },
    { level: 6, targetScore: 280, name: '密集打击', specialRule: 'moreObstacles', obstacleTypes: ['normal', 'multi', 'diagonal', 'swing', 'tracking'] },
    { level: 7, targetScore: 380, name: '极限挑战', specialRule: 'noShield', obstacleTypes: ['normal', 'multi', 'diagonal', 'swing', 'tracking'] },
    { level: 8, targetScore: 500, name: '最终试炼', specialRule: 'ultimate', obstacleTypes: ['normal', 'multi', 'diagonal', 'swing', 'tracking'] }
];

const POWERUP_TYPES = {
    SHIELD: { id: 'shield', name: '护盾', color: '#3b82f6', icon: '🛡️', duration: 10000 },
    SLOW: { id: 'slow', name: '减速', color: '#06b6d4', icon: '⏰', duration: 5000 },
    CLEAR: { id: 'clear', name: '清屏', color: '#10b981', icon: '💥', duration: 0 }
};

const SKILL_TYPES = {
    DASH: { id: 'dash', name: '冲刺', cooldown: 5000, key: 'KeyW' },
    SHIELD: { id: 'shield', name: '护盾', cooldown: 8000, duration: 2000, key: 'KeyE' },
    DOUBLE: { id: 'double', name: '双倍分数', cooldown: 15000, duration: 5000, key: 'KeyQ' }
};

const OBSTACLE_TYPES = {
    NORMAL: 'normal',
    MULTI: 'multi',
    DIAGONAL: 'diagonal',
    SWING: 'swing',
    TRACKING: 'tracking'
};

let gameState = 'start';
let gameMode = 'endless';
let score = 0;
let combo = 0;
let highScore = 0;
let difficultyLevel = 1;
let currentLevel = 1;
let lives = MAX_LIVES;
let totalDodges = 0;
let sessionDodges = 0;
let gameTime = 0;
let noDamageTime = 0;
let sessionUsedSkills = new Set();
let sessionCollectedPowerups = 0;

let player = null;
let obstacles = [];
let powerups = [];
let particles = [];

let keys = {};
let lastTime = 0;
let spawnTimer = 0;
let powerupSpawnTimer = 0;
let lastSpawnX = -1;
let isShaking = false;

let skills = {
    dash: { cooldown: 0, active: false, activeTime: 0 },
    shield: { cooldown: 0, active: false, activeTime: 0 },
    double: { cooldown: 0, active: false, activeTime: 0 }
};

let buffs = {
    shield: { active: false, endTime: 0, hits: 0 },
    slow: { active: false, endTime: 0 },
    double: { active: false, endTime: 0 }
};

let gameData = {
    highScore: 0,
    totalDodges: 0,
    unlockedLevel: 1,
    currentSkin: 'default',
    unlockedSkins: ['default'],
    achievements: ACHIEVEMENTS.map(a => ({
        id: a.id,
        unlocked: false,
        progress: a.progress || 0,
        target: a.target
    })),
    lastDailyChallenge: null
};

const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const achievementsScreen = document.getElementById('achievementsScreen');
const skinsScreen = document.getElementById('skinsScreen');
const gameContainer = document.querySelector('.game-container');

const currentScoreDisplay = document.querySelector('.current-score');
const levelValueDisplay = document.querySelector('.level-value');
const comboValueDisplay = document.querySelector('.combo-value');
const bestScoreDisplay = document.querySelector('.best-score');
const livesDisplay = document.querySelector('.lives-display');
const highScoreValue = document.getElementById('highScoreValue');

const finalScoreElement = document.getElementById('finalScore');
const finalLevelElement = document.getElementById('finalLevel');
const finalDodgesElement = document.getElementById('finalDodges');
const finalTimeElement = document.getElementById('finalTime');
const newRecordElement = document.getElementById('newRecord');

const pauseScoreElement = document.getElementById('pauseScore');
const pauseLevelElement = document.getElementById('pauseLevel');

const skillDash = document.getElementById('skillDash');
const skillShield = document.getElementById('skillShield');
const skillDouble = document.getElementById('skillDouble');

const buffShield = document.getElementById('buffShield');
const buffDouble = document.getElementById('buffDouble');
const buffSlow = document.getElementById('buffSlow');

function loadGameData() {
    const saved = localStorage.getItem('dodgeBlockGameData');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameData = { ...gameData, ...parsed };
            highScore = gameData.highScore;
            totalDodges = gameData.totalDodges;
            ACHIEVEMENTS.forEach(a => {
                const savedAch = gameData.achievements.find(sa => sa.id === a.id);
                if (savedAch) {
                    a.unlocked = savedAch.unlocked;
                    if (a.progress !== undefined) a.progress = savedAch.progress;
                }
            });
        } catch (e) {
            console.error('加载存档失败:', e);
        }
    }
    updateHighScoreDisplay();
    checkSkinsUnlock();
}

function saveGameData() {
    gameData.highScore = highScore;
    gameData.totalDodges = totalDodges;
    gameData.achievements = ACHIEVEMENTS.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        progress: a.progress || 0,
        target: a.target
    }));
    localStorage.setItem('dodgeBlockGameData', JSON.stringify(gameData));
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

function updateLivesDisplay() {
    let hearts = '';
    for (let i = 0; i < MAX_LIVES; i++) {
        hearts += i < lives ? '❤️' : '🖤';
    }
    livesDisplay.textContent = hearts;
}

function updateSkillsDisplay() {
    updateSkillUI(skillDash, skills.dash, SKILL_TYPES.DASH);
    updateSkillUI(skillShield, skills.shield, SKILL_TYPES.SHIELD);
    updateSkillUI(skillDouble, skills.double, SKILL_TYPES.DOUBLE);
}

function updateSkillUI(element, skill, type) {
    const cooldownDisplay = element.querySelector('.skill-cooldown');
    element.classList.remove('on-cooldown', 'active');
    
    if (skill.active) {
        element.classList.add('active');
        const remaining = Math.ceil((skill.endTime - Date.now()) / 1000);
        cooldownDisplay.textContent = remaining > 0 ? `${remaining}s` : '激活中';
    } else if (skill.cooldown > 0) {
        element.classList.add('on-cooldown');
        const remaining = Math.ceil(skill.cooldown / 1000);
        cooldownDisplay.textContent = `${remaining}s`;
    } else {
        cooldownDisplay.textContent = '就绪';
    }
}

function updateBuffsDisplay() {
    updateBuffUI(buffShield, buffs.shield);
    updateBuffUI(buffDouble, buffs.double);
    updateBuffUI(buffSlow, buffs.slow);
}

function updateBuffUI(element, buff) {
    if (buff.active) {
        element.classList.remove('hidden');
        const remaining = Math.ceil((buff.endTime - Date.now()) / 1000);
        element.querySelector('.buff-time').textContent = `${remaining}s`;
    } else {
        element.classList.add('hidden');
    }
}

function checkSkinsUnlock() {
    SKINS.forEach(skin => {
        if (skin.unlocked || gameData.unlockedSkins.includes(skin.id)) return;
        
        let shouldUnlock = false;
        switch (skin.requirement) {
            case 'reachLevel':
                shouldUnlock = gameData.unlockedLevel >= skin.value;
                break;
            case 'score':
                shouldUnlock = highScore >= skin.value;
                break;
            case 'unlockAchievement':
                const ach = ACHIEVEMENTS.find(a => a.id === skin.value);
                shouldUnlock = ach && ach.unlocked;
                break;
        }
        
        if (shouldUnlock) {
            skin.unlocked = true;
            if (!gameData.unlockedSkins.includes(skin.id)) {
                gameData.unlockedSkins.push(skin.id);
            }
        }
    });
}

function checkAchievements() {
    let newUnlocks = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.unlocked) return;
        
        let shouldUnlock = false;
        
        switch (achievement.id) {
            case 'firstWin':
                shouldUnlock = gameData.unlockedLevel >= 2;
                break;
            case 'dodge100':
            case 'dodgeMaster':
                shouldUnlock = totalDodges >= achievement.target;
                break;
            case 'comboKing':
                shouldUnlock = combo >= achievement.target;
                if (achievement.progress === undefined || combo > achievement.progress) {
                    achievement.progress = combo;
                }
                break;
            case 'score500':
                shouldUnlock = score >= 500;
                break;
            case 'score1000':
                shouldUnlock = score >= 1000;
                break;
            case 'invincible':
                shouldUnlock = noDamageTime >= 60;
                break;
            case 'level5':
                shouldUnlock = gameData.unlockedLevel >= 6;
                break;
            case 'level10':
                shouldUnlock = gameData.unlockedLevel >= 11;
                break;
            case 'allSkills':
                shouldUnlock = sessionUsedSkills.size >= 3;
                break;
            case 'collector':
                if (sessionCollectedPowerups > 0) {
                    if (achievement.progress === undefined) achievement.progress = 0;
                    achievement.progress += sessionCollectedPowerups;
                    sessionCollectedPowerups = 0;
                }
                shouldUnlock = (achievement.progress || 0) >= achievement.target;
                break;
        }
        
        if (shouldUnlock && !achievement.unlocked) {
            achievement.unlocked = true;
            newUnlocks.push(achievement);
        }
    });
    
    if (newUnlocks.length > 0) {
        checkSkinsUnlock();
        saveGameData();
    }
    
    return newUnlocks;
}

function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievementPopup');
    const nameElement = document.getElementById('achievementName');
    nameElement.textContent = achievement.name;
    popup.classList.remove('hidden');
    
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
}

function getCurrentSkin() {
    return SKINS.find(s => s.id === gameData.currentSkin) || SKINS[0];
}

function getCurrentSpawnInterval() {
    let interval = BASE_SPAWN_INTERVAL;
    const level = LEVELS.find(l => l.level === currentLevel);
    
    if (gameMode === 'level' && level) {
        if (level.specialRule === 'moreObstacles') {
            interval *= 0.7;
        }
        if (level.specialRule === 'ultimate') {
            interval *= 0.6;
        }
    } else {
        interval -= (difficultyLevel - 1) * 70;
        interval = Math.max(MIN_SPAWN_INTERVAL, interval);
    }
    
    if (gameMode === 'daily') {
        interval *= 0.85;
    }
    
    return interval;
}

function getCurrentObstacleSpeed() {
    let speed = BASE_OBSTACLE_SPEED;
    const level = LEVELS.find(l => l.level === currentLevel);
    
    if (gameMode === 'level' && level) {
        speed += (currentLevel - 1) * 30;
        if (level.specialRule === 'faster') {
            speed *= 1.3;
        }
        if (level.specialRule === 'ultimate') {
            speed *= 1.5;
        }
    } else {
        speed += (difficultyLevel - 1) * 25;
    }
    
    if (gameMode === 'daily') {
        speed *= 1.2;
    }
    
    if (buffs.slow.active) {
        speed *= 0.5;
    }
    
    return speed;
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
        deceleration: PLAYER_DECELERATION,
        isDashing: false,
        dashDirection: 0,
        dashStartTime: 0,
        isInvincible: false,
        invincibleTime: 0
    };
}

function initGame() {
    score = 0;
    combo = 0;
    difficultyLevel = 1;
    lives = MAX_LIVES;
    gameTime = 0;
    noDamageTime = 0;
    sessionDodges = 0;
    sessionUsedSkills = new Set();
    sessionCollectedPowerups = 0;
    
    spawnTimer = 0;
    powerupSpawnTimer = 0;
    obstacles = [];
    powerups = [];
    particles = [];
    keys = {};
    lastSpawnX = -1;
    
    skills = {
        dash: { cooldown: 0, active: false, endTime: 0 },
        shield: { cooldown: 0, active: false, endTime: 0 },
        double: { cooldown: 0, active: false, endTime: 0 }
    };
    
    buffs = {
        shield: { active: false, endTime: 0, hits: 0 },
        slow: { active: false, endTime: 0 },
        double: { active: false, endTime: 0 }
    };
    
    initPlayer();
    updateScoreDisplay();
    updateLivesDisplay();
    updateSkillsDisplay();
    updateBuffsDisplay();
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

function getAvailableObstacleTypes() {
    if (gameMode === 'level') {
        const level = LEVELS.find(l => l.level === currentLevel);
        if (level) return level.obstacleTypes;
    }
    
    if (difficultyLevel < 3) return ['normal'];
    if (difficultyLevel < 5) return ['normal', 'multi'];
    if (difficultyLevel < 7) return ['normal', 'multi', 'diagonal'];
    if (difficultyLevel < 10) return ['normal', 'multi', 'diagonal', 'swing'];
    return ['normal', 'multi', 'diagonal', 'swing', 'tracking'];
}

function selectObstacleType() {
    const available = getAvailableObstacleTypes();
    
    if (available.length === 1) return available[0];
    
    const weights = {
        normal: 50,
        multi: 20,
        diagonal: 15,
        swing: 10,
        tracking: 5
    };
    
    const weighted = [];
    available.forEach(type => {
        const count = weights[type] || 10;
        for (let i = 0; i < count; i++) weighted.push(type);
    });
    
    return weighted[Math.floor(Math.random() * weighted.length)];
}

function spawnObstacle() {
    const type = selectObstacleType();
    const baseSpeed = getCurrentObstacleSpeed();
    
    switch (type) {
        case OBSTACLE_TYPES.MULTI:
            spawnMultiObstacle(baseSpeed);
            break;
        case OBSTACLE_TYPES.DIAGONAL:
            spawnDiagonalObstacle(baseSpeed);
            break;
        case OBSTACLE_TYPES.SWING:
            spawnSwingObstacle(baseSpeed);
            break;
        case OBSTACLE_TYPES.TRACKING:
            spawnTrackingObstacle(baseSpeed);
            break;
        default:
            spawnNormalObstacle(baseSpeed);
    }
}

function spawnNormalObstacle(speed) {
    const size = getRandomObstacleSize();
    const x = findSafeSpawnX(size.width);
    
    lastSpawnX = x;
    obstacles.push({
        type: OBSTACLE_TYPES.NORMAL,
        x: x,
        y: -size.height,
        width: size.width,
        height: size.height,
        speed: speed * (0.85 + Math.random() * 0.3),
        color: getRandomColor()
    });
}

function spawnMultiObstacle(speed) {
    const isRow = Math.random() > 0.5;
    const count = isRow ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 2;
    const size = getRandomObstacleSize();
    const gap = 15;
    const color = getRandomColor();
    
    let baseX, baseY;
    
    if (isRow) {
        const totalWidth = size.width * count + gap * (count - 1);
        baseX = Math.random() * (GAME_WIDTH - totalWidth);
        baseY = -size.height;
        
        for (let i = 0; i < count; i++) {
            obstacles.push({
                type: OBSTACLE_TYPES.MULTI,
                x: baseX + i * (size.width + gap),
                y: baseY,
                width: size.width,
                height: size.height,
                speed: speed * (0.85 + Math.random() * 0.3),
                color: color
            });
        }
    } else {
        baseX = findSafeSpawnX(size.width);
        baseY = -size.height * count - gap * (count - 1);
        
        for (let i = 0; i < count; i++) {
            obstacles.push({
                type: OBSTACLE_TYPES.MULTI,
                x: baseX,
                y: baseY + i * (size.height + gap),
                width: size.width,
                height: size.height,
                speed: speed * (0.85 + Math.random() * 0.3),
                color: color
            });
        }
    }
    
    lastSpawnX = baseX;
}

function spawnDiagonalObstacle(speed) {
    const size = getRandomObstacleSize();
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction > 0 ? -size.width : GAME_WIDTH;
    
    obstacles.push({
        type: OBSTACLE_TYPES.DIAGONAL,
        x: startX,
        y: -size.height,
        width: size.width,
        height: size.height,
        speed: speed * (0.85 + Math.random() * 0.3),
        horizontalSpeed: (80 + Math.random() * 80) * direction,
        color: getRandomColor()
    });
    
    lastSpawnX = startX;
}

function spawnSwingObstacle(speed) {
    const size = getRandomObstacleSize();
    const x = findSafeSpawnX(size.width);
    
    obstacles.push({
        type: OBSTACLE_TYPES.SWING,
        x: x,
        y: -size.height,
        width: size.width,
        height: size.height,
        speed: speed * (0.8 + Math.random() * 0.2),
        swingAmplitude: 60 + Math.random() * 60,
        swingFrequency: 2 + Math.random() * 2,
        swingTime: 0,
        baseX: x,
        color: getRandomColor()
    });
    
    lastSpawnX = x;
}

function spawnTrackingObstacle(speed) {
    const size = { width: 30, height: 30 };
    const x = findSafeSpawnX(size.width);
    
    obstacles.push({
        type: OBSTACLE_TYPES.TRACKING,
        x: x,
        y: -size.height,
        width: size.width,
        height: size.height,
        speed: speed * 0.5,
        trackingSpeed: 100,
        color: '#ef4444'
    });
    
    lastSpawnX = x;
}

function findSafeSpawnX(width) {
    let x;
    const maxAttempts = 20;
    
    for (let i = 0; i < maxAttempts; i++) {
        x = Math.random() * (GAME_WIDTH - width);
        
        if (lastSpawnX === -1 || Math.abs(x - lastSpawnX) > width + 20) {
            let tooClose = false;
            for (const obstacle of obstacles) {
                if (Math.abs(x - obstacle.x) < Math.max(width, obstacle.width) + 10) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                return x;
            }
        }
    }
    
    return x || Math.random() * (GAME_WIDTH - width);
}

function spawnPowerup() {
    if (gameMode === 'level') {
        const level = LEVELS.find(l => l.level === currentLevel);
        if (level && level.specialRule === 'noShield') return;
    }
    
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 30;
    
    powerups.push({
        type: type.id,
        x: Math.random() * (GAME_WIDTH - size),
        y: -size,
        width: size,
        height: size,
        speed: 150,
        color: type.color,
        icon: type.icon
    });
}

function updatePlayer(deltaTime) {
    if (!player) return;
    
    let isMovingLeft = keys['ArrowLeft'] || keys['KeyA'];
    let isMovingRight = keys['ArrowRight'] || keys['KeyD'];
    
    if (player.isDashing) {
        const dashProgress = (Date.now() - player.dashStartTime) / (DASH_DURATION * 1000);
        if (dashProgress >= 1) {
            player.isDashing = false;
            player.velocityX = 0;
        } else {
            player.x += player.dashDirection * DASH_DISTANCE / (DASH_DURATION * 1000) * deltaTime * 1000;
        }
    } else {
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
        
        let maxSpeed = player.maxSpeed;
        if (skills.dash.active) {
            maxSpeed *= 2;
        }
        
        player.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, player.velocityX));
        player.x += player.velocityX * deltaTime;
    }
    
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }
    if (player.x + player.width > GAME_WIDTH) {
        player.x = GAME_WIDTH - player.width;
        player.velocityX = 0;
    }
    
    if (player.isInvincible) {
        player.invincibleTime -= deltaTime;
        if (player.invincibleTime <= 0) {
            player.isInvincible = false;
            player.invincibleTime = 0;
        }
    }
}

function updateObstacles(deltaTime) {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        
        obstacle.y += obstacle.speed * deltaTime;
        
        switch (obstacle.type) {
            case OBSTACLE_TYPES.DIAGONAL:
                obstacle.x += obstacle.horizontalSpeed * deltaTime;
                break;
            case OBSTACLE_TYPES.SWING:
                obstacle.swingTime += deltaTime;
                obstacle.x = obstacle.baseX + Math.sin(obstacle.swingTime * obstacle.swingFrequency) * obstacle.swingAmplitude;
                break;
            case OBSTACLE_TYPES.TRACKING:
                if (player) {
                    const targetX = player.x + player.width / 2 - obstacle.width / 2;
                    const diffX = targetX - obstacle.x;
                    obstacle.x += Math.sign(diffX) * Math.min(Math.abs(diffX), obstacle.trackingSpeed * deltaTime);
                }
                break;
        }
        
        if (obstacle.y > GAME_HEIGHT) {
            obstacles.splice(i, 1);
            combo++;
            sessionDodges++;
            totalDodges++;
            gameData.totalDodges = totalDodges;
            
            let comboBonus = 0;
            if (combo >= 10) comboBonus = 2;
            else if (combo >= 5) comboBonus = 1;
            
            let points = 1 + comboBonus;
            if (buffs.double.active || skills.double.active) {
                points *= 2;
            }
            
            score += points;
            updateDifficulty();
            updateScoreDisplay();
            
            const achievements = checkAchievements();
            achievements.forEach(a => showAchievementPopup(a));
        }
    }
}

function updatePowerups(deltaTime) {
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].y += powerups[i].speed * deltaTime;
        
        if (powerups[i].y > GAME_HEIGHT) {
            powerups.splice(i, 1);
        }
    }
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;
        p.alpha = Math.max(0, p.life / p.maxLife);
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function createExplosion(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = 100 + Math.random() * 150;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            size: 3 + Math.random() * 4,
            life: 0.5,
            maxLife: 0.5,
            alpha: 1
        });
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
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (checkCollision(player, obstacles[i])) {
            if (skills.shield.active || buffs.shield.active) {
                createExplosion(
                    obstacles[i].x + obstacles[i].width / 2,
                    obstacles[i].y + obstacles[i].height / 2,
                    obstacles[i].color
                );
                obstacles.splice(i, 1);
                combo = 0;
                updateScoreDisplay();
                
                if (buffs.shield.active) {
                    buffs.shield.hits--;
                    if (buffs.shield.hits <= 0) {
                        buffs.shield.active = false;
                    }
                }
                continue;
            }
            
            if (player.isDashing) {
                createExplosion(
                    obstacles[i].x + obstacles[i].width / 2,
                    obstacles[i].y + obstacles[i].height / 2,
                    obstacles[i].color
                );
                obstacles.splice(i, 1);
                continue;
            }
            
            return true;
        }
    }
    return false;
}

function checkPowerupCollisions() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        if (checkCollision(player, powerups[i])) {
            const powerup = powerups[i];
            activatePowerup(powerup.type);
            createExplosion(
                powerup.x + powerup.width / 2,
                powerup.y + powerup.height / 2,
                powerup.color,
                8
            );
            powerups.splice(i, 1);
            sessionCollectedPowerups++;
            
            const achievements = checkAchievements();
            achievements.forEach(a => showAchievementPopup(a));
        }
    }
}

function activatePowerup(type) {
    switch (type) {
        case POWERUP_TYPES.SHIELD.id:
            buffs.shield.active = true;
            buffs.shield.endTime = Date.now() + POWERUP_TYPES.SHIELD.duration;
            buffs.shield.hits = 1;
            break;
        case POWERUP_TYPES.SLOW.id:
            buffs.slow.active = true;
            buffs.slow.endTime = Date.now() + POWERUP_TYPES.SLOW.duration;
            break;
        case POWERUP_TYPES.CLEAR.id:
            obstacles.forEach(o => {
                createExplosion(
                    o.x + o.width / 2,
                    o.y + o.height / 2,
                    o.color,
                    5
                );
            });
            obstacles = [];
            break;
    }
    updateBuffsDisplay();
}

function handleCollision() {
    lives--;
    combo = 0;
    noDamageTime = 0;
    updateLivesDisplay();
    updateScoreDisplay();
    
    triggerCollisionEffect();
    
    if (lives <= 0) {
        gameOver();
    } else {
        player.isInvincible = true;
        player.invincibleTime = 2.0;
    }
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

function gameOver() {
    const isNewRecord = saveHighScore(score);
    updateHighScoreDisplay();
    
    const achievements = checkAchievements();
    
    gameState = 'gameOver';
    finalScoreElement.textContent = score;
    finalLevelElement.textContent = difficultyLevel;
    finalDodgesElement.textContent = sessionDodges;
    finalTimeElement.textContent = `${Math.floor(gameTime)}s`;
    newRecordElement.style.display = isNewRecord ? 'flex' : 'none';
    
    if (achievements.length > 0) {
        showAchievementPopup(achievements[0]);
    }
    
    if (gameMode === 'daily') {
        const dailyAch = ACHIEVEMENTS.find(a => a.id === 'dailyChampion');
        if (dailyAch && !dailyAch.unlocked) {
            dailyAch.unlocked = true;
            saveGameData();
        }
    }
    
    gameOverScreen.classList.remove('hidden');
    saveGameData();
}

function saveHighScore(newScore) {
    if (newScore > highScore) {
        highScore = newScore;
        return true;
    }
    return false;
}

function checkLevelComplete() {
    if (gameMode !== 'level') return;
    
    const level = LEVELS.find(l => l.level === currentLevel);
    if (level && score >= level.targetScore) {
        gameState = 'levelComplete';
        
        if (currentLevel > gameData.unlockedLevel) {
            gameData.unlockedLevel = currentLevel;
        }
        
        const achievements = checkAchievements();
        
        document.getElementById('completedLevel').textContent = currentLevel;
        document.getElementById('levelScore').textContent = score;
        document.getElementById('targetScore').textContent = level.targetScore;
        
        levelCompleteScreen.classList.remove('hidden');
        saveGameData();
    }
}

function nextLevel() {
    currentLevel++;
    if (currentLevel > LEVELS.length) {
        gameMode = 'endless';
        currentLevel = 1;
    }
    
    levelCompleteScreen.classList.add('hidden');
    startGame();
}

function useSkill(skillType) {
    const skill = skills[skillType];
    if (skill.cooldown > 0 || skill.active) return;
    
    const type = Object.values(SKILL_TYPES).find(t => t.id === skillType);
    if (!type) return;
    
    sessionUsedSkills.add(skillType);
    checkAchievements();
    
    switch (skillType) {
        case 'dash':
            let dashDirection = 0;
            if (keys['ArrowLeft'] || keys['KeyA']) dashDirection = -1;
            else if (keys['ArrowRight'] || keys['KeyD']) dashDirection = 1;
            else dashDirection = player.velocityX >= 0 ? 1 : -1;
            
            player.isDashing = true;
            player.dashDirection = dashDirection;
            player.dashStartTime = Date.now();
            
            skill.active = true;
            skill.endTime = Date.now() + DASH_DURATION * 1000;
            
            createExplosion(
                player.x + player.width / 2,
                player.y + player.height / 2,
                '#6366f1',
                8
            );
            break;
            
        case 'shield':
            skill.active = true;
            skill.endTime = Date.now() + type.duration;
            break;
            
        case 'double':
            skill.active = true;
            skill.endTime = Date.now() + type.duration;
            break;
    }
    
    skill.cooldown = type.cooldown;
    updateSkillsDisplay();
}

function updateSkillTimers(deltaTime) {
    Object.keys(skills).forEach(key => {
        const skill = skills[key];
        
        if (skill.cooldown > 0) {
            skill.cooldown -= deltaTime * 1000;
            if (skill.cooldown < 0) skill.cooldown = 0;
        }
        
        if (skill.active && Date.now() >= skill.endTime) {
            skill.active = false;
        }
    });
    
    Object.keys(buffs).forEach(key => {
        const buff = buffs[key];
        if (buff.active && Date.now() >= buff.endTime) {
            buff.active = false;
        }
    });
}

function drawPlayer() {
    if (!player) return;
    
    ctx.save();
    
    const skin = getCurrentSkin();
    const gradient = ctx.createLinearGradient(
        player.x, player.y,
        player.x, player.y + player.height
    );
    gradient.addColorStop(0, skin.color1);
    gradient.addColorStop(1, skin.color2);
    
    ctx.fillStyle = gradient;
    
    let globalAlpha = 1;
    if (player.isInvincible) {
        globalAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.3;
    }
    if (player.isDashing) {
        globalAlpha = 0.7;
    }
    ctx.globalAlpha = globalAlpha;
    
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
    
    ctx.shadowColor = skin.color1;
    ctx.shadowBlur = player.isDashing ? 30 : 20;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = globalAlpha * 0.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + 3, y + 3, w - 6, 4);
    
    if (skills.shield.active || buffs.shield.active) {
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 100) * 0.1;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, Math.max(w, h) * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 20;
        ctx.stroke();
    }
    
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
        
        const radius = obstacle.type === OBSTACLE_TYPES.TRACKING ? obstacle.width / 2 : 4;
        ctx.beginPath();
        
        if (obstacle.type === OBSTACLE_TYPES.TRACKING) {
            const cx = obstacle.x + obstacle.width / 2;
            const cy = obstacle.y + obstacle.height / 2;
            const r = obstacle.width / 2;
            
            const angle = Math.PI / 4;
            ctx.moveTo(cx + Math.cos(0) * r, cy + Math.sin(0) * r);
            for (let i = 1; i <= 4; i++) {
                ctx.lineTo(cx + Math.cos(i * Math.PI / 2) * r, cy + Math.sin(i * Math.PI / 2) * r);
            }
            ctx.closePath();
        } else {
            const x = obstacle.x;
            const y = obstacle.y;
            const w = obstacle.width;
            const h = obstacle.height;
            
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
        }
        
        ctx.fill();
        
        ctx.shadowColor = color;
        ctx.shadowBlur = obstacle.type === OBSTACLE_TYPES.TRACKING ? 25 : 12;
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        if (obstacle.type !== OBSTACLE_TYPES.TRACKING) {
            ctx.fillRect(obstacle.x + 3, obstacle.y + 3, obstacle.width - 6, 4);
        }
        
        ctx.restore();
    }
}

function drawPowerups() {
    for (const powerup of powerups) {
        ctx.save();
        
        ctx.shadowColor = powerup.color;
        ctx.shadowBlur = 15 + Math.sin(Date.now() / 200) * 5;
        
        ctx.fillStyle = powerup.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(
            powerup.x + powerup.width / 2,
            powerup.y + powerup.height / 2,
            powerup.width * 0.8,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(
            powerup.x + powerup.width / 2,
            powerup.y + powerup.height / 2,
            powerup.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.font = `${powerup.width * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            powerup.icon,
            powerup.x + powerup.width / 2,
            powerup.y + powerup.height / 2
        );
        
        ctx.restore();
    }
}

function drawParticles() {
    for (const particle of particles) {
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
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
    
    if (gameMode === 'level') {
        const level = LEVELS.find(l => l.level === currentLevel);
        if (level) {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.font = 'bold 16px "Segoe UI"';
            ctx.textAlign = 'center';
            ctx.fillText(`第${currentLevel}关: ${level.name}`, GAME_WIDTH / 2, 30);
            
            const progress = Math.min(score / level.targetScore, 1);
            const barWidth = 200;
            const barHeight = 8;
            const barX = GAME_WIDTH / 2 - barWidth / 2;
            const barY = 45;
            
            ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#10b981';
            ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        }
    } else if (gameMode === 'daily') {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.5)';
        ctx.font = 'bold 16px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('📅 每日挑战模式', GAME_WIDTH / 2, 30);
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
            gameTime += deltaTime;
            noDamageTime += deltaTime;
            
            spawnTimer += deltaTime * 1000;
            powerupSpawnTimer += deltaTime * 1000;
            
            if (spawnTimer >= getCurrentSpawnInterval()) {
                spawnObstacle();
                spawnTimer = 0;
            }
            
            if (powerupSpawnTimer >= 8000) {
                if (Math.random() < 0.4) {
                    spawnPowerup();
                }
                powerupSpawnTimer = 0;
            }
            
            updateSkillTimers(deltaTime);
            updatePlayer(deltaTime);
            updateObstacles(deltaTime);
            updatePowerups(deltaTime);
            updateParticles(deltaTime);
            
            checkPowerupCollisions();
            
            const hitObstacle = checkCollisions();
            if (hitObstacle && !player.isInvincible && !player.isDashing) {
                handleCollision();
            }
            
            updateSkillsDisplay();
            updateBuffsDisplay();
            checkLevelComplete();
        }
        
        drawParticles();
        drawPowerups();
        drawObstacles();
        if (player) drawPlayer();
        
    } catch (e) {
        console.error('游戏循环错误:', e);
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'playing';
    
    if (gameMode === 'level') {
        currentLevel = Math.max(1, Math.min(currentLevel, LEVELS.length));
    } else {
        currentLevel = 1;
    }
    
    initGame();
    startScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    achievementsScreen.classList.add('hidden');
    skinsScreen.classList.add('hidden');
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

function goToMenu() {
    gameState = 'start';
    startScreen.classList.remove('hidden');
    pauseScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    levelCompleteScreen.classList.add('hidden');
    achievementsScreen.classList.add('hidden');
    skinsScreen.classList.add('hidden');
}

function showAchievements() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    
    ACHIEVEMENTS.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        let progressHTML = '';
        if (!achievement.unlocked && achievement.target !== undefined) {
            const progress = achievement.progress || 0;
            const percent = Math.min(100, (progress / achievement.target) * 100);
            progressHTML = `
                <div class="achievement-card-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="progress-text">${progress}/${achievement.target}</div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="achievement-card-header">
                <div class="achievement-card-icon">${achievement.icon}</div>
                <div class="achievement-card-title">${achievement.name}</div>
            </div>
            <div class="achievement-card-desc">${achievement.desc}</div>
            ${achievement.unlocked ? '<div class="achievement-card-unlocked">✓ 已解锁</div>' : ''}
            ${progressHTML}
        `;
        
        list.appendChild(card);
    });
    
    achievementsScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
}

function showSkins() {
    const list = document.getElementById('skinsList');
    list.innerHTML = '';
    
    SKINS.forEach(skin => {
        const isUnlocked = skin.unlocked || gameData.unlockedSkins.includes(skin.id);
        const isSelected = gameData.currentSkin === skin.id;
        
        const card = document.createElement('div');
        card.className = `skin-card ${!isUnlocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`;
        
        let requirementText = '';
        if (!isUnlocked && skin.requirement) {
            switch (skin.requirement) {
                case 'reachLevel':
                    requirementText = `达到第${skin.value}关解锁`;
                    break;
                case 'score':
                    requirementText = `达到${skin.value}分解锁`;
                    break;
                case 'unlockAchievement':
                    const ach = ACHIEVEMENTS.find(a => a.id === skin.value);
                    requirementText = ach ? `解锁「${ach.name}」成就` : '完成成就解锁';
                    break;
            }
        }
        
        card.innerHTML = `
            <div class="skin-preview" style="background: linear-gradient(180deg, ${skin.color1} 0%, ${skin.color2} 100%); color: ${skin.color1}"></div>
            <div class="skin-name">${skin.name}</div>
            <div class="skin-status ${isUnlocked ? (isSelected ? 'selected' : '') : 'locked'}">
                ${isSelected ? '✓ 使用中' : (isUnlocked ? '点击选择' : requirementText)}
            </div>
        `;
        
        if (isUnlocked && !isSelected) {
            card.addEventListener('click', () => {
                gameData.currentSkin = skin.id;
                saveGameData();
                showSkins();
            });
        }
        
        list.appendChild(card);
    });
    
    skinsScreen.classList.remove('hidden');
    startScreen.classList.add('hidden');
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
    
    if (gameState === 'playing') {
        if (e.code === SKILL_TYPES.DASH.key) {
            useSkill('dash');
        } else if (e.code === SKILL_TYPES.SHIELD.key) {
            useSkill('shield');
        } else if (e.code === SKILL_TYPES.DOUBLE.key) {
            useSkill('double');
        }
    } else if (gameState === 'start') {
        startGame();
    } else if (gameState === 'gameOver') {
        startGame();
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameMode = btn.dataset.mode;
            
            if (gameMode === 'level') {
                currentLevel = gameData.unlockedLevel;
            }
        });
    });
    
    document.getElementById('btnAchievements').addEventListener('click', showAchievements);
    document.getElementById('btnSkins').addEventListener('click', showSkins);
    document.getElementById('btnCloseAchievements').addEventListener('click', goToMenu);
    document.getElementById('btnCloseSkins').addEventListener('click', goToMenu);
    
    document.getElementById('btnResume').addEventListener('click', resumeGame);
    document.getElementById('btnMenu').addEventListener('click', goToMenu);
    
    document.getElementById('btnRestart').addEventListener('click', startGame);
    document.getElementById('btnGameOverMenu').addEventListener('click', goToMenu);
    
    document.getElementById('btnNextLevel').addEventListener('click', nextLevel);
    document.getElementById('btnLevelMenu').addEventListener('click', goToMenu);
    
    skillDash.addEventListener('click', () => {
        if (gameState === 'playing') useSkill('dash');
    });
    skillShield.addEventListener('click', () => {
        if (gameState === 'playing') useSkill('shield');
    });
    skillDouble.addEventListener('click', () => {
        if (gameState === 'playing') useSkill('double');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadGameData();
    initPlayer();
    updateScoreDisplay();
    updateLivesDisplay();
    setupEventListeners();
    gameLoop();
});
