const PHYSICS = (function() {
    const GRAVITY = 0.5;
    const AIR_RESISTANCE = 0.995;
    const STOP_THRESHOLD = 0.3;
    const BALL_RADIUS = 8;
    const CUP_RADIUS = 12;

    const GRASS_TYPES = {
        GREEN: { name: '果岭', friction: 0.995, color: '#8bc34a' },
        FAIRWAY: { name: '球道', friction: 0.97, color: '#4caf50' },
        ROUGH: { name: '长草', friction: 0.92, color: '#388e3c' },
        DEEP_ROUGH: { name: '深长草', friction: 0.85, color: '#2e7d32' },
        SAND: { name: '沙坑', friction: 0.75, color: '#f4d35e' },
        WATER: { name: '水域', friction: 0, color: '#4fc3f7' }
    };

    let wind = { speed: 0, direction: 0 };

    function createBall(x, y) {
        return {
            x,
            y,
            vx: 0,
            vy: 0,
            vz: 0,
            z: 0,
            spin: {
                x: 0,
                y: 0,
                z: 0,
                rate: 0
            },
            isFlying: false,
            isRolling: false,
            inHole: false,
            grassType: 'FAIRWAY'
        };
    }

    function setWind(speed, direction) {
        wind.speed = speed;
        wind.direction = direction;
    }

    function getWind() {
        return { ...wind };
    }

    function hitBall(ball, power, angle, club, playerStats) {
        const loftRad = (club.loft || 10.5) * Math.PI / 180;
        const powerMultiplier = 1 + (playerStats?.power || 0) * 0.01;
        const speed = power * 0.25 * club.powerMultiplier * powerMultiplier;
        
        ball.vx = Math.cos(angle) * Math.cos(loftRad) * speed;
        ball.vy = Math.sin(angle) * Math.cos(loftRad) * speed;
        ball.vz = Math.sin(loftRad) * speed;
        
        ball.spin.rate = club.spinRate * power * 0.01;
        ball.spin.x = -Math.sin(angle) * ball.spin.rate;
        ball.spin.y = Math.cos(angle) * ball.spin.rate;
        ball.spin.z = ball.spin.rate * 0.5;
        
        ball.isFlying = true;
        ball.isRolling = false;
        ball.inHole = false;
    }

    function updateBall(ball, course, deltaTime = 1) {
        if (ball.inHole) return;

        if (ball.isFlying) {
            updateFlying(ball, course, deltaTime);
        } else if (ball.isRolling) {
            updateRolling(ball, course, deltaTime);
        }

        checkHoleCollision(ball, course);
    }

    function updateFlying(ball, course, deltaTime) {
        const windEffect = wind.speed * 0.002;
        const windX = Math.cos(wind.direction) * windEffect;
        const windY = Math.sin(wind.direction) * windEffect;
        
        const magnusEffect = 0.001 * ball.spin.rate;
        ball.vx += windX + ball.spin.x * magnusEffect;
        ball.vy += windY + ball.spin.y * magnusEffect;
        
        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;
        ball.z += ball.vz * deltaTime;
        ball.vz -= GRAVITY * deltaTime;
        
        ball.vx *= AIR_RESISTANCE;
        ball.vy *= AIR_RESISTANCE;
        ball.spin.rate *= 0.99;

        if (ball.z <= 0) {
            ball.z = 0;
            ball.isFlying = false;
            ball.isRolling = true;
            
            const bounceFactor = 0.3 + (ball.spin.z * 0.02);
            ball.vx *= bounceFactor;
            ball.vy *= bounceFactor;
            
            if (ball.spin.z > 0) {
                ball.vx *= 0.8;
                ball.vy *= 0.8;
            }
            
            ball.grassType = getGrassType(ball.x, ball.y, course);
        }

        checkWaterCollision(ball, course);
        checkBounds(ball);
    }

    function updateRolling(ball, course, deltaTime) {
        ball.grassType = getGrassType(ball.x, ball.y, course);
        
        if (ball.grassType === 'WATER') {
            checkWaterCollision(ball, course);
            return;
        }
        
        const grass = GRASS_TYPES[ball.grassType];
        const friction = grass.friction;
        
        applySlopeEffect(ball, course);
        
        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;
        
        ball.vx *= friction;
        ball.vy *= friction;

        checkTreeCollision(ball, course);
        checkBounds(ball);

        const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
        if (speed < STOP_THRESHOLD) {
            ball.isRolling = false;
            ball.vx = 0;
            ball.vy = 0;
        }
    }

    function getGrassType(x, y, course) {
        const distToCup = Math.sqrt((x - course.cup.x) ** 2 + (y - course.cup.y) ** 2);
        if (distToCup < 50) return 'GREEN';
        
        for (const obstacle of course.obstacles) {
            if (obstacle.type === 'bunker') {
                const dist = Math.sqrt((x - obstacle.x) ** 2 + (y - obstacle.y) ** 2);
                if (dist < obstacle.radius) return 'SAND';
            }
            if (obstacle.type === 'water') {
                if (x > obstacle.x - obstacle.width/2 && x < obstacle.x + obstacle.width/2 &&
                    y > obstacle.y - obstacle.height/2 && y < obstacle.y + obstacle.height/2) {
                    return 'WATER';
                }
            }
        }
        
        if (course.fairway && course.fairway.points) {
            const distToFairway = distanceToPath(x, y, course.fairway.points);
            if (distToFairway < 40) return 'FAIRWAY';
            if (distToFairway < 80) return 'ROUGH';
        }
        
        return 'DEEP_ROUGH';
    }

    function distanceToPath(x, y, points) {
        let minDist = Infinity;
        for (let i = 0; i < points.length - 1; i++) {
            const dist = distanceToSegment(x, y, points[i], points[i + 1]);
            if (dist < minDist) minDist = dist;
        }
        return minDist;
    }

    function distanceToSegment(px, py, p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const t = Math.max(0, Math.min(1, ((px - p1.x) * dx + (py - p1.y) * dy) / (dx * dx + dy * dy)));
        const nearestX = p1.x + t * dx;
        const nearestY = p1.y + t * dy;
        return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2);
    }

    function applySlopeEffect(ball, course) {
        const slope = getSlope(ball.x, ball.y, course);
        if (slope) {
            const slopeMultiplier = ball.grassType === 'GREEN' ? 0.03 : 0.02;
            ball.vx += slope.dx * slopeMultiplier;
            ball.vy += slope.dy * slopeMultiplier;
        }
    }

    function getSlope(x, y, course) {
        const gridX = Math.floor(x / 30);
        const gridY = Math.floor(y / 30);
        const map = course.heightMap;
        
        if (gridX >= 0 && gridX < map[0].length - 1 && gridY >= 0 && gridY < map.length - 1) {
            const h1 = map[gridY][gridX];
            const h2 = map[gridY][gridX + 1];
            const h3 = map[gridY + 1][gridX];
            return {
                dx: (h2 - h1) / 30,
                dy: (h3 - h1) / 30
            };
        }
        return { dx: 0, dy: 0 };
    }

    function checkWaterCollision(ball, course) {
        for (const obstacle of course.obstacles) {
            if (obstacle.type === 'water') {
                if (ball.x > obstacle.x - obstacle.width/2 && 
                    ball.x < obstacle.x + obstacle.width/2 &&
                    ball.y > obstacle.y - obstacle.height/2 && 
                    ball.y < obstacle.y + obstacle.height/2) {
                    
                    if (ball.z < 5 || ball.isRolling) {
                        ball.x = course.tee.x;
                        ball.y = course.tee.y;
                        ball.vx = 0;
                        ball.vy = 0;
                        ball.vz = 0;
                        ball.z = 0;
                        ball.isFlying = false;
                        ball.isRolling = false;
                        ball.grassType = 'FAIRWAY';
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function checkTreeCollision(ball, course) {
        for (const obstacle of course.obstacles) {
            if (obstacle.type === 'tree') {
                const dist = Math.sqrt((ball.x - obstacle.x) ** 2 + (ball.y - obstacle.y) ** 2);
                if (dist < obstacle.radius + BALL_RADIUS) {
                    const angle = Math.atan2(ball.y - obstacle.y, ball.x - obstacle.x);
                    const overlap = (obstacle.radius + BALL_RADIUS) - dist;
                    ball.x += Math.cos(angle) * overlap;
                    ball.y += Math.sin(angle) * overlap;
                    
                    const normalX = Math.cos(angle);
                    const normalY = Math.sin(angle);
                    const dot = ball.vx * normalX + ball.vy * normalY;
                    ball.vx -= 2 * dot * normalX;
                    ball.vy -= 2 * dot * normalY;
                    ball.vx *= 0.7;
                    ball.vy *= 0.7;
                }
            }
        }
    }

    function checkBounds(ball) {
        const margin = 20;
        if (ball.x < margin) { ball.x = margin; ball.vx = Math.abs(ball.vx) * 0.5; }
        if (ball.x > COURSES.CANVAS_WIDTH - margin) { 
            ball.x = COURSES.CANVAS_WIDTH - margin; 
            ball.vx = -Math.abs(ball.vx) * 0.5; 
        }
        if (ball.y < margin) { ball.y = margin; ball.vy = Math.abs(ball.vy) * 0.5; }
        if (ball.y > COURSES.CANVAS_HEIGHT - margin) { 
            ball.y = COURSES.CANVAS_HEIGHT - margin; 
            ball.vy = -Math.abs(ball.vy) * 0.5; 
        }
    }

    function checkHoleCollision(ball, course) {
        const dist = Math.sqrt((ball.x - course.cup.x) ** 2 + (ball.y - course.cup.y) ** 2);
        const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
        
        if (dist < CUP_RADIUS && speed < 8 && !ball.isFlying) {
            ball.inHole = true;
            ball.isRolling = false;
            ball.isFlying = false;
            ball.x = course.cup.x;
            ball.y = course.cup.y;
            ball.vx = 0;
            ball.vy = 0;
            return true;
        }
        return false;
    }

    function predictTrajectory(ball, power, angle, club, course, playerStats) {
        const points = [];
        const tempBall = createBall(ball.x, ball.y);
        hitBall(tempBall, power, angle, club, playerStats);
        
        for (let i = 0; i < 150; i++) {
            updateBall(tempBall, course, 0.5);
            points.push({ 
                x: tempBall.x, 
                y: tempBall.y, 
                z: tempBall.z,
                isFlying: tempBall.isFlying,
                grassType: tempBall.grassType
            });
            if (!tempBall.isFlying && !tempBall.isRolling) break;
        }
        
        return points;
    }

    return {
        createBall,
        hitBall,
        updateBall,
        predictTrajectory,
        setWind,
        getWind,
        getGrassType,
        GRASS_TYPES,
        BALL_RADIUS,
        CUP_RADIUS
    };
})();
