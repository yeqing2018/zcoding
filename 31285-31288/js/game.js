const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gameState = {
    currentScreen: 'menu',
    selectedMode: null,
    selectedTrack: null,
    selectedEquipment: {
        skis: 0,
        goggles: 0,
        outfit: 0
    },
    coins: parseInt(localStorage.getItem('skiCoins') || '1000'),
    unlockedEquipment: JSON.parse(localStorage.getItem('unlockedEquipment') || '{"skis":[0],"goggles":[0],"outfit":[0]}'),
    highScores: JSON.parse(localStorage.getItem('skiHighScores') || '{}'),
    ghostData: JSON.parse(localStorage.getItem('skiGhost') || 'null')
};

const SKI_MODES = [
    { id: 'downhill', name: '速降', description: '追求极致速度，最短时间冲线', icon: '⚡', speedMultiplier: 1.3, trickMultiplier: 0.5 },
    { id: 'slalom', name: '大回转', description: '穿越旗门，展现精准技巧', icon: '🎯', speedMultiplier: 1.0, trickMultiplier: 1.0, requireGates: true },
    { id: 'freestyle', name: '自由式', description: '跳台特技，获得风格加分', icon: '✨', speedMultiplier: 0.9, trickMultiplier: 2.0, hasRamps: true },
    { id: 'cross', name: '越野滑雪', description: '长距离耐力挑战', icon: '🏔️', speedMultiplier: 0.8, trickMultiplier: 0.8, longDistance: true }
];

const TRACKS = [
    { id: 'alps', name: '阿尔卑斯山', description: '欧洲最高山峰，雪质优良', icon: '🇫🇷', 
      theme: { sky: '#87CEEB', snow: '#FFFFFF', snowDark: '#E8F4F8', mountain: '#5D6D7E' },
      difficulty: 2, length: 3000, baseSpeed: 5 },
    { id: 'hokkaido', name: '北海道', description: '日本粉雪天堂，树林密布', icon: '🇯🇵',
      theme: { sky: '#B0E0E6', snow: '#F0F8FF', snowDark: '#E6F3FF', mountain: '#4A6741' },
      difficulty: 3, length: 3500, baseSpeed: 4, forest: true },
    { id: 'rockies', name: '落基山脉', description: '北美狂野雪山，地形多变', icon: '🇺🇸',
      theme: { sky: '#ADD8E6', snow: '#FFFAFA', snowDark: '#F0FFFF', mountain: '#8B7355' },
      difficulty: 4, length: 4000, baseSpeed: 6, rocky: true },
    { id: 'arctic', name: '北极圈', description: '极寒冰原，极光下的极限挑战', icon: '🇳🇴',
      theme: { sky: '#191970', snow: '#F5FFFA', snowDark: '#E0FFFF', mountain: '#2F4F4F' },
      difficulty: 5, length: 5000, baseSpeed: 7, arctic: true }
];

const EQUIPMENT = {
    skis: [
        { id: 0, name: '入门雪板', price: 0, stats: { speed: 0, control: 0, stability: 0 } },
        { id: 1, name: '竞速雪板', price: 500, stats: { speed: 2, control: -1, stability: 0 } },
        { id: 2, name: '技巧雪板', price: 800, stats: { speed: -1, control: 3, stability: 0 } },
        { id: 3, name: '全能雪板', price: 1500, stats: { speed: 1, control: 1, stability: 1 } },
        { id: 4, name: '碳纤极限板', price: 3000, stats: { speed: 3, control: 1, stability: -1 } }
    ],
    goggles: [
        { id: 0, name: '普通雪镜', price: 0, stats: { visibility: 0, antiFog: 0 } },
        { id: 1, name: '偏光雪镜', price: 300, stats: { visibility: 1, antiFog: 1 } },
        { id: 2, name: '专业竞技镜', price: 1000, stats: { visibility: 2, antiFog: 2 } },
        { id: 3, name: '智能AR镜', price: 2500, stats: { visibility: 3, antiFog: 3 } }
    ],
    outfit: [
        { id: 0, name: '基础滑雪服', price: 0, stats: { warmth: 0, aerodynamic: 0 } },
        { id: 1, name: '保暖滑雪服', price: 400, stats: { warmth: 2, aerodynamic: 0 } },
        { id: 2, name: '竞速紧身服', price: 1200, stats: { warmth: 1, aerodynamic: 2 } },
        { id: 3, name: '专业竞技服', price: 2800, stats: { warmth: 2, aerodynamic: 3 } }
    ]
};

const TRICKS = [
    { id: 'grab', name: '抓板', keys: '空格', points: 50, duration: 30 },
    { id: 'flip', name: '后空翻', keys: 'W', points: 150, duration: 60, rotation: true },
    { id: 'spin360', name: '360度旋转', keys: 'Q', points: 200, duration: 45, spin: 360 },
    { id: 'spin720', name: '720度旋转', keys: 'E', points: 400, duration: 75, spin: 720 }
];

const game = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    speed: 0,
    velocity: { x: 0, z: 0 },
    maxSpeed: 20,
    distance: 0,
    totalDistance: 3000,
    maxAchievedSpeed: 0,
    roadWidth: 200,
    segments: [],
    segmentLength: 100,
    drawDistance: 400,
    trackLength: 0,
    player: {
        x: 0,
        z: 0,
        y: 0,
        angle: 0,
        leanAngle: 0,
        inAir: false,
        airTime: 0,
        currentTrick: null,
        trickTimer: 0,
        trickRotation: 0,
        spinAngle: 0,
        combo: 0
    },
    physics: {
        friction: 0.995,
        slopeAccel: 0.15,
        turnSharpness: 0.08,
        airResistance: 0.998,
        gravity: 0.5
    },
    keys: {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
        q: false,
        w: false,
        e: false
    },
    obstacles: [],
    gates: [],
    ramps: [],
    invulnerable: false,
    invulnerableTimer: 0,
    particles: [],
    weather: {
        type: 'clear',
        intensity: 0,
        timer: 0,
        snowflakes: []
    },
    avalanche: {
        active: false,
        distance: 500,
        speed: 0,
        particles: []
    },
    ghost: null,
    ghostPath: [],
    pathRecorder: [],
    comboTimer: 0,
    modeConfig: null,
    trackConfig: null,
    equipmentBonus: { speed: 0, control: 0, stability: 0, warmth: 0, aerodynamic: 0, visibility: 0, antiFog: 0 }
};

let colors = {
    sky: '#87CEEB',
    snow: '#FFFFFF',
    snowDark: '#E8F4F8',
    tree: '#228B22',
    treeTrunk: '#8B4513',
    rock: '#696969',
    fence: '#8B4513',
    gate: '#FF4444',
    gatePole: '#FFFFFF',
    skier: '#FF6B6B',
    skierOutline: '#333333'
};

let mouseX = 0, mouseY = 0;

class Segment {
    constructor(index) {
        this.index = index;
        this.p1 = { world: { x: 0, y: 0, z: 0 }, camera: {}, screen: {} };
        this.p2 = { world: { x: 0, y: 0, z: 0 }, camera: {}, screen: {} };
        this.curve = 0;
        this.sprites = [];
        this.color = Math.floor(index / 3) % 2;
        this.looped = false;
        this.ramp = null;
    }
}

function initGame() {
    const mode = SKI_MODES.find(m => m.id === gameState.selectedMode) || SKI_MODES[0];
    const track = TRACKS.find(t => t.id === gameState.selectedTrack) || TRACKS[0];
    
    game.modeConfig = mode;
    game.trackConfig = track;
    game.totalDistance = mode.longDistance ? track.length * 1.5 : track.length;
    game.maxSpeed = 15 + track.baseSpeed + mode.speedMultiplier * 5;
    
    colors = { ...colors, ...track.theme };
    
    calculateEquipmentBonus();
    createSegments();
    generateTrackContent();
    
    if (gameState.ghostData && gameState.ghostData.track === gameState.selectedTrack && gameState.ghostData.mode === gameState.selectedMode) {
        game.ghost = { ...gameState.ghostData, x: 0, z: 0, currentIndex: 0 };
    }
    
    game.pathRecorder = [];
    game.score = 0;
    game.lives = 3;
    game.speed = 0;
    game.distance = 0;
    game.maxAchievedSpeed = 0;
    game.player.x = 0;
    game.player.xOffset = 0;
    game.player.z = 0;
    game.player.y = 0;
    game.player.leanAngle = 0;
    game.player.inAir = false;
    game.player.combo = 0;
    game.particles = [];
    game.weather.snowflakes = [];
    game.avalanche.active = false;
    game.avalanche.particles = [];
    game.invulnerable = false;
}

function calculateEquipmentBonus() {
    const skis = EQUIPMENT.skis[gameState.selectedEquipment.skis];
    const goggles = EQUIPMENT.goggles[gameState.selectedEquipment.goggles];
    const outfit = EQUIPMENT.outfit[gameState.selectedEquipment.outfit];
    
    game.equipmentBonus = {
        speed: (skis.stats.speed || 0) * 0.5 + (outfit.stats.aerodynamic || 0) * 0.3,
        control: (skis.stats.control || 0) * 0.01,
        stability: (skis.stats.stability || 0) * 0.02,
        warmth: (outfit.stats.warmth || 0),
        visibility: (goggles.stats.visibility || 0),
        antiFog: (goggles.stats.antiFog || 0)
    };
}

function createSegments() {
    game.segments = [];
    let z = 0;
    let x = 0;
    const totalSegments = Math.ceil(game.totalDistance / game.segmentLength) + game.drawDistance;
    
    for (let i = 0; i < totalSegments; i++) {
        const segment = new Segment(i);
        segment.p1.world.z = z;
        segment.p1.world.y = -z * 0.25 + Math.sin(z * 0.002) * 20;
        segment.p1.world.x = x;
        
        segment.curve = Math.sin(z * 0.001) * 0.8 + Math.sin(z * 0.003) * 0.4;
        x += segment.curve * game.segmentLength * 0.5;
        
        z += game.segmentLength;
        segment.p2.world.z = z;
        segment.p2.world.y = -z * 0.25 + Math.sin(z * 0.002) * 20;
        segment.p2.world.x = x;
        
        if (game.modeConfig?.hasRamps && i > 20 && i < totalSegments - 50 && i % 80 === 0) {
            segment.ramp = { height: 30, width: 100 };
        }
        
        game.segments.push(segment);
    }
    game.trackLength = game.segments.length * game.segmentLength;
}

function generateTrackContent() {
    game.obstacles = [];
    game.gates = [];
    game.ramps = [];
    
    const obstacleTypes = game.trackConfig?.forest ? 
        ['tree', 'tree', 'tree', 'rock', 'fence'] : 
        ['tree', 'rock', 'fence'];
    
    let trackX = 0;
    for (let z = 0; z < game.totalDistance + 1000; z += game.segmentLength) {
        const curve = Math.sin(z * 0.001) * 0.8 + Math.sin(z * 0.003) * 0.4;
        trackX += curve * game.segmentLength * 0.5;
        
        if (z > 300 && z < game.totalDistance && Math.random() > 0.5) {
            if (Math.random() > 0.4) {
                const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                const side = Math.random() > 0.5 ? -1 : 1;
                const offsetX = side * (60 + Math.random() * 70);
                game.obstacles.push({ type, x: trackX + offsetX, z: z });
            }
            
            if (game.modeConfig?.requireGates && Math.random() > 0.5) {
                const offsetX = (Math.random() - 0.5) * 120;
                game.gates.push({ x: trackX + offsetX, z: z, passed: false });
            } else if (Math.random() > 0.75) {
                const offsetX = (Math.random() - 0.5) * 100;
                game.gates.push({ x: trackX + offsetX, z: z, passed: false });
            }
        }
    }
}

function project(p, cameraX, cameraY, cameraZ, cameraDepth) {
    p.camera.x = (typeof p.world.x === 'number' ? p.world.x : 0) - cameraX;
    p.camera.y = (typeof p.world.y === 'number' ? p.world.y : 0) - cameraY;
    p.camera.z = (typeof p.world.z === 'number' ? p.world.z : 0) - cameraZ;
    p.screen.scale = cameraDepth / p.camera.z;
    p.screen.x = Math.round((canvas.width / 2) + (p.screen.scale * p.camera.x));
    p.screen.y = Math.round((canvas.height / 2) - (p.screen.scale * p.camera.y));
}

function getTrackCenterX(z) {
    let x = 0;
    for (let i = 0; i < z; i += game.segmentLength) {
        const curve = Math.sin(i * 0.001) * 0.8 + Math.sin(i * 0.003) * 0.4;
        x += curve * game.segmentLength * 0.5;
    }
    return x;
}

function updatePhysics(dt) {
    if (!game.running || game.paused) return;
    
    const controlBonus = 1 + game.equipmentBonus.control;
    const speedBonus = 1 + game.equipmentBonus.speed * 0.1;
    
    const baseAccel = game.physics.slopeAccel * speedBonus;
    game.speed += baseAccel * dt;
    
    const turnSpeed = game.physics.turnSharpness * controlBonus * (game.speed * 0.3 + 1);
    if (game.keys.left) {
        game.player.leanAngle = Math.max(game.player.leanAngle - 0.1, -0.8);
        game.player.xOffset -= turnSpeed * dt;
    } else if (game.keys.right) {
        game.player.leanAngle = Math.min(game.player.leanAngle + 0.1, 0.8);
        game.player.xOffset += turnSpeed * dt;
    } else {
        game.player.leanAngle *= 0.9;
        game.player.xOffset *= 0.95;
    }
    
    game.player.xOffset = Math.max(-game.roadWidth, Math.min(game.roadWidth, game.player.xOffset));
    
    const trackCenterX = getTrackCenterX(game.player.z);
    game.player.x = trackCenterX + game.player.xOffset;
    
    if (game.keys.down) {
        game.speed *= 0.99;
    }
    
    const turnLoss = Math.abs(game.player.leanAngle) * 0.02;
    game.speed *= (1 - turnLoss);
    
    const friction = game.physics.friction + game.equipmentBonus.aerodynamic * 0.001;
    game.speed *= Math.pow(friction, dt);
    
    game.speed = Math.max(0, Math.min(game.speed, game.maxSpeed));
    game.maxAchievedSpeed = Math.max(game.maxAchievedSpeed, game.speed);
    
    game.player.x = Math.max(-game.roadWidth, Math.min(game.roadWidth, game.player.x));
    game.player.z += game.speed * dt * 2;
    game.distance = game.player.z;
    
    if (game.player.inAir) {
        game.player.airTime += dt;
        game.player.y += game.physics.gravity * dt * game.player.airTime;
        
        if (game.player.currentTrick) {
            game.player.trickTimer -= dt;
            if (game.player.currentTrick.rotation) {
                game.player.trickRotation += 0.2 * dt;
            }
            if (game.player.currentTrick.spin) {
                game.player.spinAngle += (game.player.currentTrick.spin / game.player.currentTrick.duration) * dt;
            }
            if (game.player.trickTimer <= 0) {
                completeTrick();
            }
        }
    }
    
    checkRampCollision();
    checkTrickInput();
    updateWeather(dt);
    updateAvalanche(dt);
    
    game.pathRecorder.push({
        z: game.player.z,
        x: game.player.x,
        timestamp: Date.now()
    });
    
    if (game.ghost) {
        updateGhost(dt);
    }
}

function checkRampCollision() {
    if (game.player.inAir) {
        const currentY = -game.player.z * 0.25 + Math.sin(game.player.z * 0.002) * 20;
        if (game.player.y >= currentY) {
            game.player.y = currentY;
            game.player.inAir = false;
            
            if (game.player.currentTrick) {
                completeTrick();
            }
            
            game.player.airTime = 0;
            game.player.trickRotation = 0;
            game.player.spinAngle = 0;
        }
    } else {
        for (let i = 0; i < game.segments.length; i++) {
            const seg = game.segments[i];
            if (seg.ramp && Math.abs(seg.p1.world.z - game.player.z) < 50) {
                if (Math.abs(game.player.x) < seg.ramp.width / 2) {
                    game.player.inAir = true;
                    game.player.airTime = 0;
                    game.player.y = seg.p1.world.y - seg.ramp.height;
                    break;
                }
            }
        }
    }
}

function checkTrickInput() {
    if (!game.player.inAir || game.player.currentTrick) return;
    
    if (game.keys.space) {
        startTrick(TRICKS[0]);
    } else if (game.keys.w) {
        startTrick(TRICKS[1]);
    } else if (game.keys.q) {
        startTrick(TRICKS[2]);
    } else if (game.keys.e) {
        startTrick(TRICKS[3]);
    }
}

function startTrick(trick) {
    game.player.currentTrick = trick;
    game.player.trickTimer = trick.duration;
    showTrickNotification(trick.name + '!');
}

function completeTrick() {
    if (game.player.currentTrick) {
        const multiplier = game.modeConfig?.trickMultiplier || 1;
        const points = Math.floor(game.player.currentTrick.points * multiplier * (1 + game.player.combo * 0.1));
        game.score += points;
        game.player.combo++;
        game.comboTimer = 120;
        showScorePopup('+' + points + ' 特技分!');
        createParticles(canvas.width / 2, canvas.height - 150, 15, '#FFD700');
        game.player.currentTrick = null;
    }
}

function showTrickNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'trick-notification';
    notification.textContent = text;
    notification.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 32px;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        animation: floatUp 1s ease-out forwards;
        pointer-events: none;
        z-index: 200;
    `;
    document.getElementById('gameContainer').appendChild(notification);
    setTimeout(() => notification.remove(), 1000);
}

function showScorePopup(text) {
    const popup = document.createElement('div');
    popup.textContent = text;
    popup.style.cssText = `
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #4CAF50;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        animation: floatUp 0.8s ease-out forwards;
        pointer-events: none;
        z-index: 200;
    `;
    document.getElementById('gameContainer').appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

function updateWeather(dt) {
    game.weather.timer -= dt;
    
    if (game.weather.timer <= 0) {
        game.weather.timer = 300 + Math.random() * 600;
        
        if (Math.random() > 0.7) {
            const events = ['clear', 'snow', 'blizzard'];
            game.weather.type = events[Math.floor(Math.random() * events.length)];
            game.weather.intensity = Math.random();
            
            if (game.weather.type === 'blizzard') {
                showTrickNotification('❄️ 暴风雪来袭！');
            }
        }
    }
    
    if (game.weather.type !== 'clear') {
        const snowCount = game.weather.type === 'blizzard' ? 5 : 2;
        for (let i = 0; i < snowCount; i++) {
            game.weather.snowflakes.push({
                x: Math.random() * canvas.width,
                y: -10,
                speed: 2 + Math.random() * 3,
                size: 2 + Math.random() * 3,
                wind: (game.weather.type === 'blizzard' ? 2 : 0.5) * (Math.random() - 0.5)
            });
        }
        
        if (game.weather.type === 'blizzard') {
            game.speed *= 0.999;
        }
    }
    
    for (let i = game.weather.snowflakes.length - 1; i >= 0; i--) {
        const s = game.weather.snowflakes[i];
        s.x += s.wind;
        s.y += s.speed;
        if (s.y > canvas.height) {
            game.weather.snowflakes.splice(i, 1);
        }
    }
    
    if (Math.random() > 0.995 && !game.avalanche.active && game.trackConfig?.rocky) {
        triggerAvalanche();
    }
}

function triggerAvalanche() {
    game.avalanche.active = true;
    game.avalanche.distance = 800;
    game.avalanche.speed = 3;
    showTrickNotification('⚠️ 雪崩！快逃！');
}

function updateAvalanche(dt) {
    if (!game.avalanche.active) return;
    
    game.avalanche.distance += (game.speed - game.avalanche.speed) * dt;
    game.avalanche.speed += 0.01 * dt;
    
    if (game.avalanche.distance < 0) {
        game.lives = 0;
        gameOver(false);
        return;
    }
    
    if (game.avalanche.distance < 200) {
        for (let i = 0; i < 10; i++) {
            game.avalanche.particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height * 0.3 + Math.random() * canvas.height * 0.5,
                size: 5 + Math.random() * 10,
                alpha: 0.3 + Math.random() * 0.3
            });
        }
    }
    
    for (let i = game.avalanche.particles.length - 1; i >= 0; i--) {
        game.avalanche.particles[i].alpha -= 0.01;
        if (game.avalanche.particles[i].alpha <= 0) {
            game.avalanche.particles.splice(i, 1);
        }
    }
    
    if (game.distance > game.totalDistance * 0.8) {
        game.avalanche.active = false;
    }
}

function updateGhost(dt) {
    if (!game.ghost || !game.ghost.path) return;
    
    while (game.ghost.currentIndex < game.ghost.path.length - 1 &&
           game.ghost.path[game.ghost.currentIndex + 1].z < game.player.z) {
        game.ghost.currentIndex++;
    }
    
    if (game.ghost.currentIndex < game.ghost.path.length) {
        const point = game.ghost.path[game.ghost.currentIndex];
        game.ghost.x = point.x;
        game.ghost.z = point.z;
    }
}

function render() {
    if (gameState.currentScreen === 'menu') {
        renderMenu();
        return;
    }
    
    if (gameState.currentScreen === 'modeSelect') {
        renderModeSelect();
        return;
    }
    
    if (gameState.currentScreen === 'trackSelect') {
        renderTrackSelect();
        return;
    }
    
    if (gameState.currentScreen === 'equipment') {
        renderEquipmentShop();
        return;
    }
    
    if (gameState.currentScreen === 'leaderboard') {
        renderLeaderboard();
        return;
    }
    
    renderGame();
}

function renderMenu() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a2980');
    gradient.addColorStop(1, '#26d0ce');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc((i * 137) % canvas.width, (i * 89) % canvas.height, 2 + Math.sin(Date.now() * 0.001 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 64px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('⛷️ 极速滑雪挑战', canvas.width / 2, 180);
    
    ctx.font = '24px Microsoft YaHei';
    ctx.fillStyle = '#B0E0E6';
    ctx.fillText('Ski Challenge Pro', canvas.width / 2, 220);
    
    const menuItems = [
        { text: '开始游戏', y: 320 },
        { text: '装备商店', y: 390 },
        { text: '排行榜', y: 460 }
    ];
    
    const hoverY = Math.floor((mouseY - 280) / 70);
    
    menuItems.forEach((item, i) => {
        const isHover = i === hoverY && mouseY > 280 && mouseY < 530;
        ctx.fillStyle = isHover ? '#FFD700' : '#FFFFFF';
        ctx.font = 'bold 28px Microsoft YaHei';
        ctx.fillText(item.text, canvas.width / 2, item.y);
        
        if (isHover) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(canvas.width / 2 - 100, item.y - 30, 200, 40);
        }
    });
    
    ctx.fillStyle = '#B0E0E6';
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText(`💰 ${gameState.coins} 金币`, 100, canvas.height - 50);
}

function renderModeSelect() {
    ctx.fillStyle = '#1a2980';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('选择滑雪模式', canvas.width / 2, 100);
    
    const cardWidth = 170;
    const cardHeight = 220;
    const startX = (canvas.width - cardWidth * 4 - 30 * 3) / 2;
    
    SKI_MODES.forEach((mode, i) => {
        const x = startX + i * (cardWidth + 30);
        const y = 150;
        const isHover = mouseX > x && mouseX < x + cardWidth && mouseY > y && mouseY < y + cardHeight;
        
        ctx.fillStyle = isHover ? '#3a49a0' : '#2a3990';
        roundRect(ctx, x, y, cardWidth, cardHeight, 15, true, false);
        
        if (isHover) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            roundRect(ctx, x, y, cardWidth, cardHeight, 15, false, true);
        }
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px serif';
        ctx.fillText(mode.icon, x + cardWidth / 2, y + 70);
        
        ctx.font = 'bold 22px Microsoft YaHei';
        ctx.fillText(mode.name, x + cardWidth / 2, y + 110);
        
        ctx.font = '14px Microsoft YaHei';
        ctx.fillStyle = '#B0E0E6';
        wrapText(ctx, mode.description, x + cardWidth / 2, y + 140, cardWidth - 20, 18);
    });
    
    ctx.fillStyle = '#888';
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText('← 返回', 80, canvas.height - 40);
}

function renderTrackSelect() {
    ctx.fillStyle = '#1a2980';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('选择雪山赛道', canvas.width / 2, 100);
    
    const cardWidth = 170;
    const cardHeight = 280;
    const startX = (canvas.width - cardWidth * 4 - 30 * 3) / 2;
    
    TRACKS.forEach((track, i) => {
        const x = startX + i * (cardWidth + 30);
        const y = 140;
        const isHover = mouseX > x && mouseX < x + cardWidth && mouseY > y && mouseY < y + cardHeight;
        
        ctx.fillStyle = track.theme.sky;
        roundRect(ctx, x, y, cardWidth, cardHeight, 15, true, false);
        
        ctx.fillStyle = track.theme.mountain;
        ctx.beginPath();
        ctx.moveTo(x, y + 100);
        ctx.lineTo(x + cardWidth / 2, y + 20);
        ctx.lineTo(x + cardWidth, y + 100);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(x + cardWidth / 2 - 15, y + 50);
        ctx.lineTo(x + cardWidth / 2, y + 20);
        ctx.lineTo(x + cardWidth / 2 + 15, y + 50);
        ctx.closePath();
        ctx.fill();
        
        if (isHover) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            roundRect(ctx, x, y, cardWidth, cardHeight, 15, false, true);
        }
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '36px serif';
        ctx.fillText(track.icon, x + cardWidth / 2, y + 140);
        
        ctx.font = 'bold 20px Microsoft YaHei';
        ctx.fillText(track.name, x + cardWidth / 2, y + 175);
        
        ctx.font = '14px Microsoft YaHei';
        ctx.fillStyle = '#FFF';
        wrapText(ctx, track.description, x + cardWidth / 2, y + 200, cardWidth - 20, 16);
        
        ctx.fillText(`难度: ${'⭐'.repeat(track.difficulty)}`, x + cardWidth / 2, y + 255);
    });
    
    ctx.fillStyle = '#888';
    ctx.font = '20px Microsoft YaHei';
    ctx.fillText('← 返回', 80, canvas.height - 40);
}

function renderEquipmentShop() {
    ctx.fillStyle = '#1a2980';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('装备商店', canvas.width / 2, 80);
    
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Microsoft YaHei';
    ctx.fillText(`💰 ${gameState.coins}`, canvas.width / 2, 120);
    
    const categories = [
        { key: 'skis', name: '雪板', y: 160 },
        { key: 'goggles', name: '雪镜', y: 280 },
        { key: 'outfit', name: '服装', y: 400 }
    ];
    
    categories.forEach(cat => {
        ctx.fillStyle = '#B0E0E6';
        ctx.font = 'bold 22px Microsoft YaHei';
        ctx.textAlign = 'left';
        ctx.fillText(cat.name, 60, cat.y);
        
        const items = EQUIPMENT[cat.key];
        items.forEach((item, i) => {
            const x = 150 + i * 130;
            const y = cat.y - 25;
            const w = 120;
            const h = 80;
            const isSelected = gameState.selectedEquipment[cat.key] === item.id;
            const isUnlocked = gameState.unlockedEquipment[cat.key].includes(item.id);
            const isHover = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
            
            ctx.fillStyle = isSelected ? '#4CAF50' : (isHover ? '#3a49a0' : '#2a3990');
            roundRect(ctx, x, y, w, h, 8, true, false);
            
            if (!isUnlocked) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                roundRect(ctx, x, y, w, h, 8, true, false);
            }
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText(item.name, x + w / 2, y + 28);
            
            const stats = Object.entries(item.stats).map(([k, v]) => `${k}:${v > 0 ? '+' : ''}${v}`).join(' ');
            ctx.font = '11px Microsoft YaHei';
            ctx.fillText(stats, x + w / 2, y + 48);
            
            if (!isUnlocked) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 14px Microsoft YaHei';
                ctx.fillText(`🔒 ${item.price}`, x + w / 2, y + 68);
            } else if (isSelected) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillText('✓ 已装备', x + w / 2, y + 68);
            } else {
                ctx.fillStyle = '#888';
                ctx.fillText('点击装备', x + w / 2, y + 68);
            }
        });
    });
    
    ctx.fillStyle = '#888';
    ctx.font = '20px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText('← 返回', 60, canvas.height - 40);
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#B0E0E6';
    ctx.fillText('点击装备购买/装备 | 未解锁的装备点击可购买', canvas.width / 2, canvas.height - 40);
}

function renderLeaderboard() {
    ctx.fillStyle = '#1a2980';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 排行榜', canvas.width / 2, 100);
    
    const allScores = [];
    Object.entries(gameState.highScores).forEach(([key, scores]) => {
        const [mode, track] = key.split('_');
        scores.forEach(s => {
            allScores.push({ ...s, mode, track });
        });
    });
    
    allScores.sort((a, b) => b.score - a.score);
    
    const topScores = allScores.slice(0, 10);
    
    if (topScores.length === 0) {
        ctx.fillStyle = '#888';
        ctx.font = '24px Microsoft YaHei';
        ctx.fillText('暂无记录，快去创造历史吧！', canvas.width / 2, 300);
    } else {
        ctx.fillStyle = '#B0E0E6';
        ctx.font = '18px Microsoft YaHei';
        ctx.fillText('排名  模式    赛道        分数    距离    速度', canvas.width / 2, 160);
        
        topScores.forEach((s, i) => {
            const y = 200 + i * 35;
            const mode = SKI_MODES.find(m => m.id === s.mode)?.name || s.mode;
            const track = TRACKS.find(t => t.id === s.track)?.name || s.track;
            
            ctx.fillStyle = i === 0 ? '#FFD700' : (i === 1 ? '#C0C0C0' : (i === 2 ? '#CD7F32' : '#FFFFFF'));
            ctx.font = 'bold 18px Microsoft YaHei';
            ctx.textAlign = 'left';
            ctx.fillText(`${i + 1}.`, 120, y);
            ctx.fillText(mode, 180, y);
            ctx.fillText(track, 280, y);
            ctx.textAlign = 'right';
            ctx.fillText(s.score, 480, y);
            ctx.fillText(s.distance + 'm', 580, y);
            ctx.fillText(s.speed + 'km/h', 680, y);
        });
    }
    
    ctx.fillStyle = '#888';
    ctx.font = '20px Microsoft YaHei';
    ctx.textAlign = 'left';
    ctx.fillText('← 返回', 60, canvas.height - 40);
}

function renderGame() {
    const baseSegment = findSegment(game.player.z);
    const maxy = canvas.height;
    let maxy2 = maxy;
    
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (game.weather.type === 'blizzard') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    drawMountains();
    drawWeather();
    
    for (let n = 0; n < game.drawDistance; n++) {
        const segment = game.segments[(baseSegment.index + n) % game.segments.length];
        segment.looped = segment.index < baseSegment.index;
        
        const camZ = game.player.z - (segment.looped ? game.trackLength : 0);
        project(segment.p1, game.player.x, 300, camZ, 400);
        project(segment.p2, game.player.x, 300, camZ, 400);
        
        if (segment.p1.camera.z <= 1 || segment.p2.screen.y >= maxy || segment.p2.screen.y >= maxy2) continue;
        
        drawSegment(segment);
        maxy2 = segment.p2.screen.y;
    }
    
    drawObstacles(baseSegment);
    drawGates(baseSegment);
    
    if (game.ghost && game.ghost.z > 0) {
        drawGhost();
    }
    
    drawPlayer();
    drawParticles();
    drawAvalanche();
    
    if (game.avalanche.active) {
        drawAvalancheWarning();
    }
    
    if (game.player.combo > 1) {
        drawCombo();
    }
}

function drawMountains() {
    const mountainCount = 6;
    for (let i = 0; i < mountainCount; i++) {
        const x = (canvas.width / mountainCount) * i + canvas.width / mountainCount / 2 + Math.sin(game.player.z * 0.0005 + i) * 20;
        const y = canvas.height * 0.35;
        const width = 250 + Math.sin(i * 0.5) * 100;
        const height = 180 + Math.cos(i * 0.8) * 100;
        
        ctx.fillStyle = game.trackConfig?.theme.mountain || colors.rock;
        ctx.globalAlpha = 0.6 - i * 0.08;
        ctx.beginPath();
        ctx.moveTo(x - width / 2, y);
        ctx.lineTo(x, y - height);
        ctx.lineTo(x + width / 2, y);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(x - width * 0.15, y - height * 0.6);
        ctx.lineTo(x, y - height);
        ctx.lineTo(x + width * 0.15, y - height * 0.6);
        ctx.lineTo(x, y - height * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawWeather() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    game.weather.snowflakes.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSegment(segment) {
    const p1 = segment.p1.screen;
    const p2 = segment.p2.screen;
    const x1 = p1.x;
    const x2 = p2.x;
    const y1 = p1.y;
    const y2 = p2.y;
    
    const w1 = game.roadWidth * p1.scale;
    const w2 = game.roadWidth * p2.scale;
    
    const color1 = segment.color ? colors.snow : colors.snowDark;
    ctx.fillStyle = color1;
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(0, y2);
    ctx.lineTo(canvas.width, y2);
    ctx.lineTo(canvas.width, y1);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#B0E0E6';
    ctx.beginPath();
    ctx.moveTo(x1 - w1 * 1.5, y1);
    ctx.lineTo(x2 - w2 * 1.5, y2);
    ctx.lineTo(x2 + w2 * 1.5, y2);
    ctx.lineTo(x1 + w1 * 1.5, y1);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#ADD8E6';
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1);
    ctx.lineTo(x2 - w2, y2);
    ctx.lineTo(x2 + w2, y2);
    ctx.lineTo(x1 + w1, y1);
    ctx.closePath();
    ctx.fill();
    
    if (segment.ramp) {
        const rampH = segment.ramp.height * p1.scale;
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(x1 - w1 * 0.3, y1);
        ctx.lineTo(x1, y1 - rampH);
        ctx.lineTo(x1 + w1 * 0.3, y1);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x1 - w1 * 0.25, y1 - 2);
        ctx.lineTo(x1, y1 - rampH + 2);
        ctx.lineTo(x1 + w1 * 0.25, y1 - 2);
        ctx.closePath();
        ctx.fill();
    }
    
    if (Math.floor(segment.index / 2) % 2 === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawObstacles(baseSegment) {
    for (const obstacle of game.obstacles) {
        if (obstacle.z < game.player.z - 100 || obstacle.z > game.player.z + game.drawDistance * game.segmentLength) continue;
        
        const z = obstacle.z - game.player.z;
        if (z <= 1 || z > 5000) continue;
        
        const scale = 400 / z;
        const x = canvas.width / 2 + (obstacle.x - game.player.x) * scale;
        const y = canvas.height / 2 - (-300) * scale;
        
        const size = scale * 100;
        
        switch (obstacle.type) {
            case 'tree':
                drawTree(x, y, size);
                break;
            case 'rock':
                drawRock(x, y, size);
                break;
            case 'fence':
                drawFence(x, y, size);
                break;
        }
    }
}

function drawTree(x, y, size) {
    ctx.fillStyle = colors.treeTrunk;
    ctx.fillRect(x - size * 0.1, y - size * 0.3, size * 0.2, size * 0.5);
    
    ctx.fillStyle = game.trackConfig?.forest ? '#2D5016' : colors.tree;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.4, y - size * 0.2);
    ctx.lineTo(x + size * 0.4, y - size * 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.8);
    ctx.lineTo(x - size * 0.3, y);
    ctx.lineTo(x + size * 0.3, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.15, y - size * 0.7);
    ctx.lineTo(x + size * 0.15, y - size * 0.7);
    ctx.closePath();
    ctx.fill();
}

function drawRock(x, y, size) {
    ctx.fillStyle = colors.rock;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.3, size * 0.4, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.15, y - size * 0.45, size * 0.15, size * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawFence(x, y, size) {
    ctx.fillStyle = colors.fence;
    for (let i = -2; i <= 2; i++) {
        ctx.fillRect(x + i * size * 0.2 - size * 0.03, y - size * 0.5, size * 0.06, size * 0.5);
    }
    ctx.fillRect(x - size * 0.5, y - size * 0.4, size, size * 0.06);
    ctx.fillRect(x - size * 0.5, y - size * 0.2, size, size * 0.06);
}

function drawGates(baseSegment) {
    for (const gate of game.gates) {
        if (gate.z < game.player.z - 100 || gate.z > game.player.z + game.drawDistance * game.segmentLength) continue;
        
        const z = gate.z - game.player.z;
        if (z <= 1 || z > 5000) continue;
        
        const scale = 400 / z;
        const x = canvas.width / 2 + (gate.x - game.player.x) * scale;
        const y = canvas.height / 2 - (-300) * scale;
        
        const size = scale * 120;
        
        ctx.fillStyle = colors.gatePole;
        ctx.fillRect(x - size * 0.6, y - size, size * 0.08, size);
        ctx.fillRect(x + size * 0.52, y - size, size * 0.08, size);
        
        ctx.fillStyle = gate.passed ? '#888888' : colors.gate;
        ctx.fillRect(x - size * 0.6, y - size, size * 1.2, size * 0.15);
        
        if (!gate.passed) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x - size * 0.6, y - size * 0.85, size * 1.2, size * 0.08);
        }
    }
}

function drawPlayer() {
    const x = canvas.width / 2;
    const y = canvas.height - 120 + (game.player.inAir ? -game.player.airTime * 3 : 0);
    const size = 40;
    
    ctx.save();
    
    if (game.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    let targetX = x;
    if (game.keys.left) targetX -= 30;
    if (game.keys.right) targetX += 30;
    
    const actualX = x + (targetX - x) * 0.3;
    ctx.translate(actualX, y);
    
    if (game.player.spinAngle !== 0) {
        ctx.rotate(game.player.spinAngle * Math.PI / 180);
    }
    
    if (game.player.trickRotation !== 0) {
        ctx.rotate(game.player.trickRotation);
    }
    
    ctx.rotate(game.player.leanAngle * 0.5);
    
    const outfitColor = gameState.selectedEquipment.outfit === 0 ? '#FF6B6B' : 
                       gameState.selectedEquipment.outfit === 1 ? '#4169E1' :
                       gameState.selectedEquipment.outfit === 2 ? '#32CD32' : '#FFD700';
    
    ctx.fillStyle = outfitColor;
    ctx.strokeStyle = colors.skierOutline;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(0, -size * 0.95, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    if (gameState.selectedEquipment.goggles > 0) {
        ctx.fillStyle = '#333';
        ctx.fillRect(-size * 0.18, -size * 1.02, size * 0.36, size * 0.12);
        ctx.fillStyle = gameState.selectedEquipment.goggles >= 2 ? '#00BFFF' : '#87CEEB';
        ctx.fillRect(-size * 0.15, -size * 1.0, size * 0.13, size * 0.08);
        ctx.fillRect(size * 0.02, -size * 1.0, size * 0.13, size * 0.08);
    } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(-size * 0.15, -size * 1.05, size * 0.3, size * 0.1);
    }
    
    ctx.strokeStyle = gameState.selectedEquipment.skis === 0 ? '#4A90D9' :
                     gameState.selectedEquipment.skis === 1 ? '#FF4500' :
                     gameState.selectedEquipment.skis === 2 ? '#9932CC' :
                     gameState.selectedEquipment.skis === 3 ? '#228B22' : '#1a1a1a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, size * 0.2);
    ctx.lineTo(size * 0.4, size * 0.2);
    ctx.stroke();
    
    ctx.strokeStyle = '#6B4423';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.6);
    ctx.lineTo(-size * 0.5, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.3, -size * 0.6);
    ctx.lineTo(size * 0.5, 0);
    ctx.stroke();
    
    ctx.restore();
}

function drawGhost() {
    const z = game.ghost.z - game.player.z;
    if (z <= 0 || z > 1000) return;
    
    const scale = 400 / z;
    const x = canvas.width / 2 + (game.ghost.x - game.player.x) * scale;
    const y = canvas.height / 2 - (-300) * scale;
    const size = scale * 40;
    
    ctx.save();
    ctx.globalAlpha = 0.5;
    
    ctx.fillStyle = '#8B008B';
    ctx.strokeStyle = '#9932CC';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.5, size * 0.25, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y - size * 0.95, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function drawParticles() {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        ctx.fillStyle = p.color || `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        p.size *= 0.98;
        
        if (p.alpha <= 0) {
            game.particles.splice(i, 1);
        }
    }
    
    if (game.speed > 3 && !game.player.inAir) {
        if (Math.random() > 0.3) {
            game.particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 30,
                y: canvas.height - 80,
                vx: (Math.random() - 0.5) * 3 - (game.keys.left ? -2 : 0) - (game.keys.right ? 2 : 0),
                vy: -2 - Math.random() * 3,
                size: 2 + Math.random() * 3,
                alpha: 0.8
            });
        }
    }
}

function drawAvalanche() {
    game.avalanche.particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawAvalancheWarning() {
    const intensity = (800 - game.avalanche.distance) / 800;
    
    ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.3})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FF0000';
    ctx.font = 'bold 48px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ 雪崩追击！', canvas.width / 2, 150);
    ctx.font = '24px Microsoft YaHei';
    ctx.fillText(`距离: ${Math.floor(game.avalanche.distance)}m`, canvas.width / 2, 190);
}

function drawCombo() {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Microsoft YaHei';
    ctx.textAlign = 'center';
    ctx.fillText(`${game.player.combo}x 连击!`, canvas.width / 2, 200);
}

function createParticles(x, y, count, color = null) {
    for (let i = 0; i < count; i++) {
        game.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: 3 + Math.random() * 4,
            alpha: 1,
            color: color
        });
    }
}

function findSegment(z) {
    return game.segments[Math.floor(z / game.segmentLength) % game.segments.length];
}

function percentageRemaining(n, total) {
    return (n % total) / total;
}

function exponentialFog(distance, density) {
    return 1 / Math.pow(Math.E, distance * distance * density);
}

function checkCollisions() {
    const playerX = game.player.x;
    const playerZ = game.player.z;
    
    for (const obstacle of game.obstacles) {
        const dz = obstacle.z - playerZ;
        if (dz > -50 && dz < 80) {
            const dx = obstacle.x - playerX;
            if (Math.abs(dx) < 35 && !game.player.inAir) {
                if (!game.invulnerable) {
                    handleCollision();
                }
            }
        }
    }
    
    for (const gate of game.gates) {
        if (gate.passed) continue;
        const dz = gate.z - playerZ;
        if (dz > -50 && dz < 80) {
            const dx = gate.x - playerX;
            if (Math.abs(dx) < 60) {
                gate.passed = true;
                const bonus = game.modeConfig?.requireGates ? 150 : 100;
                game.score += bonus;
                createParticles(canvas.width / 2, canvas.height - 150, 20, '#FFD700');
            }
        }
    }
}

function handleCollision() {
    game.lives--;
    game.speed = Math.max(2, game.speed * 0.3);
    game.invulnerable = true;
    game.invulnerableTimer = 120;
    game.player.combo = 0;
    createParticles(canvas.width / 2, canvas.height - 100, 30, '#FF6B6B');
    
    if (game.lives <= 0) {
        gameOver(false);
    }
}

function updateGameState(dt) {
    if (!game.running || game.paused) return;
    
    if (game.invulnerable) {
        game.invulnerableTimer -= dt;
        if (game.invulnerableTimer <= 0) {
            game.invulnerable = false;
        }
    }
    
    if (game.comboTimer > 0) {
        game.comboTimer -= dt;
        if (game.comboTimer <= 0) {
            game.player.combo = 0;
        }
    }
    
    checkCollisions();
    
    if (game.distance >= game.totalDistance) {
        gameOver(true);
    }
}

function updateUI() {
    if (gameState.currentScreen !== 'game') return;
    
    document.getElementById('score').textContent = Math.floor(game.score);
    document.getElementById('speed').textContent = Math.floor(game.speed * 8);
    document.getElementById('distance').textContent = Math.floor(game.distance);
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, game.lives));
    
    const progress = Math.min(100, (game.distance / game.totalDistance) * 100);
    document.getElementById('progressFill').style.width = progress + '%';
    
    game.score += game.speed * 0.05;
}

function gameOver(won) {
    game.running = false;
    
    const title = document.getElementById('gameOverTitle');
    if (won) {
        title.textContent = '🎉 恭喜完成挑战！';
        game.score += game.lives * 500;
        
        const speedBonus = Math.floor(game.speed * 10);
        game.score += speedBonus;
        
        const modeKey = `${gameState.selectedMode}_${gameState.selectedTrack}`;
        if (!gameState.highScores[modeKey]) {
            gameState.highScores[modeKey] = [];
        }
        
        const newRecord = {
            score: Math.floor(game.score),
            distance: Math.floor(game.distance),
            speed: Math.floor(game.maxAchievedSpeed * 8),
            date: new Date().toLocaleDateString()
        };
        
        gameState.highScores[modeKey].push(newRecord);
        gameState.highScores[modeKey].sort((a, b) => b.score - a.score);
        gameState.highScores[modeKey] = gameState.highScores[modeKey].slice(0, 5);
        
        const earnedCoins = Math.floor(game.score / 10);
        gameState.coins += earnedCoins;
        
        localStorage.setItem('skiHighScores', JSON.stringify(gameState.highScores));
        localStorage.setItem('skiCoins', gameState.coins.toString());
        
        if (game.pathRecorder.length > 0) {
            localStorage.setItem('skiGhost', JSON.stringify({
                mode: gameState.selectedMode,
                track: gameState.selectedTrack,
                score: Math.floor(game.score),
                path: game.pathRecorder.filter((_, i) => i % 5 === 0)
            }));
        }
        
        showTrickNotification(`获得 ${earnedCoins} 金币!`);
    } else {
        title.textContent = '💥 比赛结束';
    }
    
    document.getElementById('finalScore').textContent = Math.floor(game.score);
    document.getElementById('finalDistance').textContent = Math.floor(game.distance);
    document.getElementById('finalSpeed').textContent = Math.floor(game.maxAchievedSpeed * 8);
    
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function startGame() {
    if (!gameState.selectedMode || !gameState.selectedTrack) return;
    
    initGame();
    gameState.currentScreen = 'game';
    game.running = true;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameUI').style.display = 'block';
}

function handleClick() {
    if (gameState.currentScreen === 'menu') {
        const hoverY = Math.floor((mouseY - 280) / 70);
        if (hoverY === 0 && mouseY > 280 && mouseY < 530) {
            gameState.currentScreen = 'modeSelect';
        } else if (hoverY === 1 && mouseY > 280 && mouseY < 530) {
            gameState.currentScreen = 'equipment';
        } else if (hoverY === 2 && mouseY > 280 && mouseY < 530) {
            gameState.currentScreen = 'leaderboard';
        }
    } else if (gameState.currentScreen === 'modeSelect') {
        const cardWidth = 170;
        const cardHeight = 220;
        const startX = (canvas.width - cardWidth * 4 - 30 * 3) / 2;
        
        for (let i = 0; i < SKI_MODES.length; i++) {
            const x = startX + i * (cardWidth + 30);
            const y = 150;
            if (mouseX > x && mouseX < x + cardWidth && mouseY > y && mouseY < y + cardHeight) {
                gameState.selectedMode = SKI_MODES[i].id;
                gameState.currentScreen = 'trackSelect';
                return;
            }
        }
    } else if (gameState.currentScreen === 'trackSelect') {
        const cardWidth = 170;
        const cardHeight = 280;
        const startX = (canvas.width - cardWidth * 4 - 30 * 3) / 2;
        
        for (let i = 0; i < TRACKS.length; i++) {
            const x = startX + i * (cardWidth + 30);
            const y = 140;
            if (mouseX > x && mouseX < x + cardWidth && mouseY > y && mouseY < y + cardHeight) {
                gameState.selectedTrack = TRACKS[i].id;
                startGame();
                return;
            }
        }
    } else if (gameState.currentScreen === 'equipment') {
        const categories = ['skis', 'goggles', 'outfit'];
        const catY = [160, 280, 400];
        
        for (let catIdx = 0; catIdx < categories.length; catIdx++) {
            const cat = categories[catIdx];
            const items = EQUIPMENT[cat];
            for (let i = 0; i < items.length; i++) {
                const x = 150 + i * 130;
                const y = catY[catIdx] - 25;
                const w = 120;
                const h = 80;
                
                if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
                    const item = items[i];
                    const isUnlocked = gameState.unlockedEquipment[cat].includes(item.id);
                    
                    if (isUnlocked) {
                        gameState.selectedEquipment[cat] = item.id;
                    } else if (gameState.coins >= item.price) {
                        gameState.coins -= item.price;
                        gameState.unlockedEquipment[cat].push(item.id);
                        gameState.selectedEquipment[cat] = item.id;
                        localStorage.setItem('skiCoins', gameState.coins.toString());
                        localStorage.setItem('unlockedEquipment', JSON.stringify(gameState.unlockedEquipment));
                        showTrickNotification(`购买成功: ${item.name}!`);
                    } else {
                        showTrickNotification('金币不足!');
                    }
                    return;
                }
            }
        }
    }
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

let lastTime = 0;
function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;
    const delta = Math.min(dt / 16.67, 3);
    
    if (gameState.currentScreen === 'game' && game.running) {
        updatePhysics(delta);
        updateGameState(delta);
        updateUI();
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        game.keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        game.keys.right = true;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        game.keys.down = true;
    }
    if (e.key === 'w' || e.key === 'W') {
        game.keys.w = true;
    }
    if (e.key === ' ') {
        e.preventDefault();
        game.keys.space = true;
    }
    if (e.key === 'q' || e.key === 'Q') {
        game.keys.q = true;
    }
    if (e.key === 'e' || e.key === 'E') {
        game.keys.e = true;
    }
    if (e.key === 'Escape') {
        if (gameState.currentScreen === 'game') {
            game.paused = !game.paused;
            const pauseScreen = document.getElementById('pauseScreen');
            if (game.paused) {
                pauseScreen.classList.remove('hidden');
            } else {
                pauseScreen.classList.add('hidden');
            }
        }
    }
    if (e.key === 'Backspace') {
        if (gameState.currentScreen === 'modeSelect' || gameState.currentScreen === 'trackSelect' || 
            gameState.currentScreen === 'equipment' || gameState.currentScreen === 'leaderboard') {
            if (gameState.currentScreen === 'trackSelect') {
                gameState.currentScreen = 'modeSelect';
            } else {
                gameState.currentScreen = 'menu';
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        game.keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        game.keys.right = false;
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        game.keys.down = false;
    }
    if (e.key === 'w' || e.key === 'W') {
        game.keys.w = false;
    }
    if (e.key === ' ') {
        game.keys.space = false;
    }
    if (e.key === 'q' || e.key === 'Q') {
        game.keys.q = false;
    }
    if (e.key === 'e' || e.key === 'E') {
        game.keys.e = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', handleClick);

document.getElementById('startBtn').addEventListener('click', () => {
    gameState.currentScreen = 'modeSelect';
});

document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    gameState.currentScreen = 'modeSelect';
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    game.paused = false;
    document.getElementById('pauseScreen').classList.add('hidden');
});

document.getElementById('gameUI').style.display = 'none';
createSegments();
requestAnimationFrame(gameLoop);