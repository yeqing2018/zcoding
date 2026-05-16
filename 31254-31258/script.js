const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const MATERIALS = {
    rubber: { elasticity: 0.85, friction: 0.8, color: '#e74c3c', name: '橡胶' },
    wood:   { elasticity: 0.65, friction: 0.4, color: '#8b4513', name: '木质' },
    metal:  { elasticity: 0.35, friction: 0.3, color: '#7f8c8d', name: '金属' },
    glass:  { elasticity: 0.90, friction: 0.2, color: '#3498db', name: '玻璃' },
    clay:   { elasticity: 0.10, friction: 0.9, color: '#d2691e', name: '黏土' }
};

const BALL_RADIUS = 20;
const GROUND_HEIGHT = 25;
const GROUND_COLOR = '#2c3e50';
const MAX_BALLS = 10;

let balls = [];
let obstacles = [];
let isRunning = false;
let isPaused = false;
let totalBounceCount = 0;
let totalCollisionCount = 0;
let simulationTime = 0;
let lastTime = 0;
let animationId = null;

let physicsParams = {
    gravity: 1800,
    gravityAngle: 90,
    airResistance: 0,
    groundFriction: 0.02,
    collisionMode: 'elastic'
};

let launchParams = {
    initialVelocity: 0,
    launchAngle: 0,
    scenePreset: 'freefall',
    showObstacles: true
};

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const addBallBtn = document.getElementById('addBallBtn');
const clearBallsBtn = document.getElementById('clearBallsBtn');
const addObstacleBtn = document.getElementById('addObstacleBtn');
const clearObstaclesBtn = document.getElementById('clearObstaclesBtn');

const ballCountSlider = document.getElementById('ballCount');
const ballCountValue = document.getElementById('ballCountValue');
const materialSelect = document.getElementById('materialSelect');
const gravitySlider = document.getElementById('gravity');
const gravityValue = document.getElementById('gravityValue');
const gravityAngleSlider = document.getElementById('gravityAngle');
const gravityAngleValue = document.getElementById('gravityAngleValue');
const airResistanceSlider = document.getElementById('airResistance');
const airResistanceValue = document.getElementById('airResistanceValue');
const frictionSlider = document.getElementById('friction');
const frictionValue = document.getElementById('frictionValue');
const collisionModeSelect = document.getElementById('collisionMode');
const initialVelocitySlider = document.getElementById('initialVelocity');
const initialVelocityValue = document.getElementById('initialVelocityValue');
const launchAngleSlider = document.getElementById('launchAngle');
const launchAngleValue = document.getElementById('launchAngleValue');
const scenePresetSelect = document.getElementById('scenePreset');
const showObstaclesCheckbox = document.getElementById('showObstacles');

const selectedBallSelect = document.getElementById('selectedBall');
const ballCountDisplay = document.getElementById('ballCountDisplay');
const totalBounceCountElement = document.getElementById('totalBounceCount');
const totalCollisionCountElement = document.getElementById('totalCollisionCount');
const simulationTimeElement = document.getElementById('simulationTime');

class Ball {
    constructor(x, y, vx, vy, material) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = BALL_RADIUS;
        this.material = material;
        this.mass = 1;
        this.bounceCount = 0;
        this.lastEnergyLoss = 0;
        this.flashEffect = false;
        this.flashTimer = 0;
        this.prevVx = vx;
        this.prevVy = vy;
        this.ax = 0;
        this.ay = 0;
    }

    get color() {
        return MATERIALS[this.material].color;
    }

    get elasticity() {
        let e = MATERIALS[this.material].elasticity;
        if (physicsParams.collisionMode === 'elastic') return 1.0;
        if (physicsParams.collisionMode === 'plastic') return 0;
        return e;
    }

    get friction() {
        return MATERIALS[this.material].friction;
    }

    get speed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    get momentum() {
        return this.mass * this.speed;
    }

    get kineticEnergy() {
        return 0.5 * this.mass * this.speed * this.speed;
    }

    update(deltaTime) {
        const dt = deltaTime / 1000;
        const gravAngleRad = physicsParams.gravityAngle * Math.PI / 180;
        const gx = physicsParams.gravity * Math.cos(gravAngleRad);
        const gy = -physicsParams.gravity * Math.sin(gravAngleRad);

        this.prevVx = this.vx;
        this.prevVy = this.vy;

        const airDrag = physicsParams.airResistance * 0.001;
        this.ax = gx - airDrag * this.vx;
        this.ay = gy - airDrag * this.vy;

        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.flashEffect) {
            this.flashTimer--;
            if (this.flashTimer <= 0) {
                this.flashEffect = false;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        if (this.flashEffect) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 25;
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(this.x - 6, this.y - 6, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        if (!launchParams.showObstacles) return;
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

function createBall(x, y, vx, vy, material) {
    if (balls.length >= MAX_BALLS) return null;
    const ball = new Ball(x, y, vx, vy, material);
    balls.push(ball);
    updateBallSelector();
    return ball;
}

function updateBallSelector() {
    ballCountDisplay.textContent = balls.length;
    selectedBallSelect.innerHTML = '';
    balls.forEach((ball, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `小球 ${index + 1} (${MATERIALS[ball.material].name})`;
        selectedBallSelect.appendChild(option);
    });
    if (balls.length > 0 && selectedBallSelect.value === '') {
        selectedBallSelect.value = 0;
    }
}

function drawGround() {
    ctx.fillStyle = GROUND_COLOR;
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(canvas.width, canvas.height - GROUND_HEIGHT);
    ctx.stroke();
}

function drawWalls() {
    ctx.strokeStyle = GROUND_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - GROUND_HEIGHT - 3);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function checkWallCollision(ball) {
    const groundY = canvas.height - GROUND_HEIGHT - ball.radius;
    let collided = false;

    if (ball.x < ball.radius) {
        ball.x = ball.radius;
        const energyBefore = ball.kineticEnergy;
        ball.vx = -ball.vx * ball.elasticity;
        ball.vy *= (1 - physicsParams.groundFriction * 0.5);
        const energyAfter = ball.kineticEnergy;
        ball.lastEnergyLoss = energyBefore > 0 ? ((energyBefore - energyAfter) / energyBefore * 100) : 0;
        ball.flashEffect = true;
        ball.flashTimer = 8;
        collided = true;
    }
    if (ball.x > canvas.width - ball.radius) {
        ball.x = canvas.width - ball.radius;
        const energyBefore = ball.kineticEnergy;
        ball.vx = -ball.vx * ball.elasticity;
        ball.vy *= (1 - physicsParams.groundFriction * 0.5);
        const energyAfter = ball.kineticEnergy;
        ball.lastEnergyLoss = energyBefore > 0 ? ((energyBefore - energyAfter) / energyBefore * 100) : 0;
        ball.flashEffect = true;
        ball.flashTimer = 8;
        collided = true;
    }
    if (ball.y < ball.radius) {
        ball.y = ball.radius;
        const energyBefore = ball.kineticEnergy;
        ball.vy = -ball.vy * ball.elasticity;
        ball.vx *= (1 - physicsParams.groundFriction * 0.5);
        const energyAfter = ball.kineticEnergy;
        ball.lastEnergyLoss = energyBefore > 0 ? ((energyBefore - energyAfter) / energyBefore * 100) : 0;
        ball.flashEffect = true;
        ball.flashTimer = 8;
        collided = true;
    }
    if (ball.y >= groundY) {
        ball.y = groundY;
        if (Math.abs(ball.vy) > 60 || Math.abs(ball.vx) > 30) {
            const energyBefore = ball.kineticEnergy;
            ball.vy = -ball.vy * ball.elasticity;
            ball.vx *= (1 - physicsParams.groundFriction);
            const energyAfter = ball.kineticEnergy;
            ball.lastEnergyLoss = energyBefore > 0 ? ((energyBefore - energyAfter) / energyBefore * 100) : 0;
            ball.bounceCount++;
            totalBounceCount++;
            ball.flashEffect = true;
            ball.flashTimer = 8;
            collided = true;
        } else {
            ball.vy = 0;
            if (Math.abs(ball.vx) < 10) {
                ball.vx = 0;
            }
        }
    }

    return collided;
}

function checkBallCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball1.radius + ball2.radius;

    if (distance < minDist && distance > 0) {
        const nx = dx / distance;
        const ny = dy / distance;

        const dvx = ball1.vx - ball2.vx;
        const dvy = ball1.vy - ball2.vy;
        const dvn = dvx * nx + dvy * ny;

        if (dvn > 0) return false;

        const overlap = minDist - distance;
        const separationX = (overlap / 2) * nx;
        const separationY = (overlap / 2) * ny;
        ball1.x -= separationX;
        ball1.y -= separationY;
        ball2.x += separationX;
        ball2.y += separationY;

        const e = Math.min(ball1.elasticity, ball2.elasticity);
        const m1 = ball1.mass;
        const m2 = ball2.mass;
        const totalMass = m1 + m2;

        const impulse = (-(1 + e) * dvn) / (1/m1 + 1/m2);
        const impulseX = impulse * nx;
        const impulseY = impulse * ny;

        const energyBefore1 = ball1.kineticEnergy;
        const energyBefore2 = ball2.kineticEnergy;

        ball1.vx += impulseX / m1;
        ball1.vy += impulseY / m1;
        ball2.vx -= impulseX / m2;
        ball2.vy -= impulseY / m2;

        const energyAfter1 = ball1.kineticEnergy;
        const energyAfter2 = ball2.kineticEnergy;
        const totalEnergyBefore = energyBefore1 + energyBefore2;
        const totalEnergyAfter = energyAfter1 + energyAfter2;

        if (totalEnergyBefore > 0) {
            const loss = ((totalEnergyBefore - totalEnergyAfter) / totalEnergyBefore * 100);
            ball1.lastEnergyLoss = loss;
            ball2.lastEnergyLoss = loss;
        }

        ball1.flashEffect = true;
        ball1.flashTimer = 8;
        ball2.flashEffect = true;
        ball2.flashTimer = 8;

        totalCollisionCount++;
        return true;
    }
    return false;
}

function checkObstacleCollision(ball, obstacle) {
    if (!launchParams.showObstacles) return false;

    const closestX = Math.max(obstacle.x, Math.min(ball.x, obstacle.x + obstacle.width));
    const closestY = Math.max(obstacle.y, Math.min(ball.y, obstacle.y + obstacle.height));
    const dx = ball.x - closestX;
    const dy = ball.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball.radius) {
        const energyBefore = ball.kineticEnergy;

        if (distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            const dotProduct = ball.vx * nx + ball.vy * ny;
            
            ball.vx -= 2 * dotProduct * nx;
            ball.vy -= 2 * dotProduct * ny;
            ball.vx *= ball.elasticity;
            ball.vy *= ball.elasticity;

            const overlap = ball.radius - distance;
            ball.x += nx * overlap;
            ball.y += ny * overlap;
        }

        const energyAfter = ball.kineticEnergy;
        ball.lastEnergyLoss = energyBefore > 0 ? ((energyBefore - energyAfter) / energyBefore * 100) : 0;
        ball.flashEffect = true;
        ball.flashTimer = 8;
        totalCollisionCount++;
        return true;
    }
    return false;
}

function updatePhysics(deltaTime) {
    balls.forEach(ball => {
        ball.update(deltaTime);
    });

    balls.forEach(ball => {
        checkWallCollision(ball);
    });

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            checkBallCollision(balls[i], balls[j]);
        }
    }

    if (launchParams.showObstacles) {
        balls.forEach(ball => {
            obstacles.forEach(obstacle => {
                checkObstacleCollision(ball, obstacle);
            });
        });
    }

    totalBounceCountElement.textContent = totalBounceCount;
    totalCollisionCountElement.textContent = totalCollisionCount;
}

function updateDataDisplay() {
    const selectedIndex = parseInt(selectedBallSelect.value);
    if (isNaN(selectedIndex) || selectedIndex >= balls.length) return;
    
    const ball = balls[selectedIndex];
    document.getElementById('dataPosX').textContent = ball.x.toFixed(2);
    document.getElementById('dataPosY').textContent = (canvas.height - ball.y).toFixed(2);
    document.getElementById('dataVelX').textContent = ball.vx.toFixed(2);
    document.getElementById('dataVelY').textContent = (-ball.vy).toFixed(2);
    document.getElementById('dataSpeed').textContent = ball.speed.toFixed(2);
    
    const accelMag = Math.sqrt(ball.ax * ball.ax + ball.ay * ball.ay);
    document.getElementById('dataAccel').textContent = accelMag.toFixed(2);
    document.getElementById('dataMomentum').textContent = ball.momentum.toFixed(2);
    document.getElementById('dataKE').textContent = ball.kineticEnergy.toFixed(2);
    document.getElementById('dataEnergyLoss').textContent = ball.lastEnergyLoss.toFixed(2) + '%';
    document.getElementById('dataBounceCount').textContent = ball.bounceCount;
}

function render(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (isRunning && !isPaused) {
        simulationTime += deltaTime / 1000;
        simulationTimeElement.textContent = simulationTime.toFixed(2);
        updatePhysics(deltaTime);
    }

    clearCanvas();
    drawWalls();
    drawGround();
    
    obstacles.forEach(obstacle => obstacle.draw());
    balls.forEach(ball => ball.draw());
    
    updateDataDisplay();

    const hasFlash = balls.some(b => b.flashEffect);
    if (isRunning || hasFlash) {
        animationId = requestAnimationFrame(render);
    } else {
        animationId = null;
    }
}

function getLaunchVelocity() {
    const angleRad = launchParams.launchAngle * Math.PI / 180;
    const vx = launchParams.initialVelocity * Math.cos(angleRad);
    const vy = -launchParams.initialVelocity * Math.sin(angleRad);
    return { vx, vy };
}

function startSimulation() {
    if (!isRunning && balls.length === 0) {
        const { vx, vy } = getLaunchVelocity();
        createBall(canvas.width / 2, 80, vx, vy, materialSelect.value);
    }
    
    if (!isRunning) {
        isRunning = true;
        isPaused = false;
        lastTime = 0;
        
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.textContent = '暂停';
        
        if (!animationId) {
            animationId = requestAnimationFrame(render);
        }
    }
}

function togglePause() {
    if (isRunning) {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '继续' : '暂停';
        if (isPaused) {
            lastTime = 0;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            if (!animationId) {
                animationId = requestAnimationFrame(render);
            }
        }
    }
}

function resetSimulation() {
    isRunning = false;
    isPaused = false;
    totalBounceCount = 0;
    totalCollisionCount = 0;
    simulationTime = 0;
    lastTime = 0;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    balls = [];
    updateBallSelector();
    
    totalBounceCountElement.textContent = '0';
    totalCollisionCountElement.textContent = '0';
    simulationTimeElement.textContent = '0.00';
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    
    const { vx, vy } = getLaunchVelocity();
    createBall(canvas.width / 2, 80, vx, vy, materialSelect.value);
    
    clearCanvas();
    drawWalls();
    drawGround();
    obstacles.forEach(obstacle => obstacle.draw());
    balls.forEach(ball => ball.draw());
}

function addBall() {
    if (balls.length >= MAX_BALLS) {
        alert(`最多只能添加 ${MAX_BALLS} 个小球！`);
        return;
    }
    
    const { vx, vy } = getLaunchVelocity();
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = Math.random() * 100;
    createBall(
        canvas.width / 2 + offsetX,
        80 + offsetY,
        vx + (Math.random() - 0.5) * 100,
        vy,
        materialSelect.value
    );
    
    if (!isRunning) {
        clearCanvas();
        drawWalls();
        drawGround();
        obstacles.forEach(obstacle => obstacle.draw());
        balls.forEach(ball => ball.draw());
    }
}

function clearBalls() {
    balls = [];
    updateBallSelector();
    
    if (!isRunning) {
        clearCanvas();
        drawWalls();
        drawGround();
        obstacles.forEach(obstacle => obstacle.draw());
    }
}

function addObstacle() {
    const x = 100 + Math.random() * (canvas.width - 300);
    const y = 150 + Math.random() * (canvas.height - GROUND_HEIGHT - 300);
    const width = 60 + Math.random() * 80;
    const height = 20 + Math.random() * 40;
    obstacles.push(new Obstacle(x, y, width, height));
    
    if (!isRunning) {
        clearCanvas();
        drawWalls();
        drawGround();
        obstacles.forEach(obstacle => obstacle.draw());
        balls.forEach(ball => ball.draw());
    }
}

function clearObstacles() {
    obstacles = [];
    
    if (!isRunning) {
        clearCanvas();
        drawWalls();
        drawGround();
        balls.forEach(ball => ball.draw());
    }
}

function applyScenePreset(preset) {
    switch (preset) {
        case 'freefall':
            launchParams.initialVelocity = 0;
            launchParams.launchAngle = 0;
            physicsParams.gravityAngle = 90;
            launchParams.showObstacles = false;
            obstacles = [];
            break;
        case 'projectile':
            launchParams.initialVelocity = 500;
            launchParams.launchAngle = 45;
            physicsParams.gravityAngle = 90;
            launchParams.showObstacles = false;
            obstacles = [];
            break;
        case 'obstacles':
            launchParams.initialVelocity = 300;
            launchParams.launchAngle = 60;
            physicsParams.gravityAngle = 90;
            launchParams.showObstacles = true;
            obstacles = [
                new Obstacle(150, 250, 100, 25),
                new Obstacle(350, 180, 80, 25),
                new Obstacle(500, 320, 120, 25),
                new Obstacle(250, 400, 90, 25)
            ];
            break;
    }
    
    initialVelocitySlider.value = launchParams.initialVelocity;
    initialVelocityValue.textContent = launchParams.initialVelocity;
    launchAngleSlider.value = launchParams.launchAngle;
    launchAngleValue.textContent = launchParams.launchAngle;
    gravityAngleSlider.value = physicsParams.gravityAngle;
    gravityAngleValue.textContent = physicsParams.gravityAngle;
    showObstaclesCheckbox.checked = launchParams.showObstacles;
}

ballCountSlider.addEventListener('input', (e) => {
    const targetCount = parseInt(e.target.value);
    ballCountValue.textContent = targetCount;
    
    if (isRunning) return;
    
    while (balls.length < targetCount && balls.length < MAX_BALLS) {
        const { vx, vy } = getLaunchVelocity();
        const offsetX = (Math.random() - 0.5) * 200;
        const offsetY = Math.random() * 100;
        createBall(
            canvas.width / 2 + offsetX,
            80 + offsetY,
            vx + (Math.random() - 0.5) * 100,
            vy,
            materialSelect.value
        );
    }
    
    while (balls.length > targetCount) {
        balls.pop();
        updateBallSelector();
    }
    
    clearCanvas();
    drawWalls();
    drawGround();
    obstacles.forEach(obstacle => obstacle.draw());
    balls.forEach(ball => ball.draw());
});

materialSelect.addEventListener('change', (e) => {
    if (balls.length > 0) {
        balls[balls.length - 1].material = e.target.value;
        if (!isRunning) {
            clearCanvas();
            drawWalls();
            drawGround();
            obstacles.forEach(obstacle => obstacle.draw());
            balls.forEach(ball => ball.draw());
        }
    }
});

gravitySlider.addEventListener('input', (e) => {
    physicsParams.gravity = parseInt(e.target.value);
    gravityValue.textContent = e.target.value;
});

gravityAngleSlider.addEventListener('input', (e) => {
    physicsParams.gravityAngle = parseInt(e.target.value);
    gravityAngleValue.textContent = e.target.value;
});

airResistanceSlider.addEventListener('input', (e) => {
    physicsParams.airResistance = parseFloat(e.target.value);
    airResistanceValue.textContent = parseFloat(e.target.value).toFixed(1);
});

frictionSlider.addEventListener('input', (e) => {
    physicsParams.groundFriction = parseFloat(e.target.value);
    frictionValue.textContent = parseFloat(e.target.value).toFixed(2);
});

collisionModeSelect.addEventListener('change', (e) => {
    physicsParams.collisionMode = e.target.value;
});

initialVelocitySlider.addEventListener('input', (e) => {
    launchParams.initialVelocity = parseInt(e.target.value);
    initialVelocityValue.textContent = e.target.value;
});

launchAngleSlider.addEventListener('input', (e) => {
    launchParams.launchAngle = parseInt(e.target.value);
    launchAngleValue.textContent = e.target.value;
});

scenePresetSelect.addEventListener('change', (e) => {
    launchParams.scenePreset = e.target.value;
    applyScenePreset(e.target.value);
    if (!isRunning) {
        clearCanvas();
        drawWalls();
        drawGround();
        obstacles.forEach(obstacle => obstacle.draw());
        balls.forEach(ball => ball.draw());
    }
});

showObstaclesCheckbox.addEventListener('change', (e) => {
    launchParams.showObstacles = e.target.checked;
    if (!isRunning) {
        clearCanvas();
        drawWalls();
        drawGround();
        if (launchParams.showObstacles) {
            obstacles.forEach(obstacle => obstacle.draw());
        }
        balls.forEach(ball => ball.draw());
    }
});

startBtn.addEventListener('click', startSimulation);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetSimulation);
addBallBtn.addEventListener('click', addBall);
clearBallsBtn.addEventListener('click', clearBalls);
addObstacleBtn.addEventListener('click', addObstacle);
clearObstaclesBtn.addEventListener('click', clearObstacles);
selectedBallSelect.addEventListener('change', updateDataDisplay);

resetSimulation();
