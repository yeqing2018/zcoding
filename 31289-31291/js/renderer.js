const RENDERER = (function() {
    let canvas, ctx;
    let width, height;
    let currentCourseType = null;

    function init(canvasElement) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
    }

    function resize() {
        const container = canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 20, COURSES.CANVAS_WIDTH);
        const maxHeight = Math.min(window.innerHeight * 0.6, COURSES.CANVAS_HEIGHT);
        const scale = Math.min(maxWidth / COURSES.CANVAS_WIDTH, maxHeight / COURSES.CANVAS_HEIGHT);
        
        width = COURSES.CANVAS_WIDTH * scale;
        height = COURSES.CANVAS_HEIGHT * scale;
        
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }

    function setCourseType(courseType) {
        currentCourseType = courseType;
    }

    function getScale() {
        return width / COURSES.CANVAS_WIDTH;
    }

    function clear() {
        ctx.clearRect(0, 0, width, height);
    }

    function drawCourse(course) {
        const scale = getScale();
        
        drawGrass(course.type);
        drawFairway(course, scale);
        drawObstacles(course, scale);
        drawTee(course, scale);
        drawCup(course, scale);
    }

    function drawGrass(courseType) {
        const colors = courseType || { grassColor: '#4caf50', roughColor: '#2e7d32' };
        
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) / 1.5
        );
        gradient.addColorStop(0, colors.grassColor);
        gradient.addColorStop(1, colors.roughColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
    }

    function drawFairway(course, scale) {
        if (!course.fairway || !course.fairway.points) return;
        
        ctx.beginPath();
        ctx.moveTo(course.fairway.points[0].x * scale, course.fairway.points[0].y * scale);
        
        for (let i = 1; i < course.fairway.points.length; i++) {
            ctx.lineTo(course.fairway.points[i].x * scale, course.fairway.points[i].y * scale);
        }
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 80 * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        ctx.strokeStyle = course.type ? course.type.grassColor : 'rgba(76, 175, 80, 0.6)';
        ctx.lineWidth = 70 * scale;
        ctx.stroke();
    }

    function drawObstacles(course, scale) {
        for (const obstacle of course.obstacles) {
            if (obstacle.type === 'bunker') {
                drawBunker(obstacle, scale, course.type);
            } else if (obstacle.type === 'water') {
                drawWater(obstacle, scale);
            } else if (obstacle.type === 'tree') {
                drawTree(obstacle, scale, course.type);
            }
        }
    }

    function drawBunker(bunker, scale, courseType) {
        const x = bunker.x * scale;
        const y = bunker.y * scale;
        const r = bunker.radius * scale;
        const color = courseType?.bunkerColor || '#f4d35e';
        
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#c9a96e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(201, 169, 110, 0.3)';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = x + Math.cos(angle) * r * 0.6;
            const py = y + Math.sin(angle) * r * 0.6;
            ctx.beginPath();
            ctx.arc(px, py, r * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawWater(water, scale) {
        const x = (water.x - water.width / 2) * scale;
        const y = (water.y - water.height / 2) * scale;
        const w = water.width * scale;
        const h = water.height * scale;
        
        const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
        gradient.addColorStop(0, '#4fc3f7');
        gradient.addColorStop(1, '#0288d1');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + 10, y + h * (0.3 + i * 0.2));
            ctx.quadraticCurveTo(x + w / 2, y + h * (0.25 + i * 0.2), x + w - 10, y + h * (0.3 + i * 0.2));
            ctx.stroke();
        }
        
        ctx.strokeStyle = '#01579b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
    }

    function drawTree(tree, scale, courseType) {
        const x = tree.x * scale;
        const y = tree.y * scale;
        const r = tree.radius * scale;
        const treeColor = courseType?.treeColor || '#1b5e20';
        
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x - r * 0.2, y - r * 0.3, r * 0.4, r * 0.8);
        
        ctx.beginPath();
        ctx.arc(x, y - r * 0.2, r, 0, Math.PI * 2);
        ctx.fillStyle = treeColor;
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.4, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#388e3c';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + r * 0.3, y - r * 0.3, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#43a047';
        ctx.fill();
    }

    function drawTee(course, scale) {
        const x = course.tee.x * scale;
        const y = course.tee.y * scale;
        const size = 25 * scale;
        
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
        
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${12 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TEE', x, y);
    }

    function drawCup(course, scale) {
        const x = course.cup.x * scale;
        const y = course.cup.y * scale;
        const r = PHYSICS.CUP_RADIUS * scale;
        
        ctx.beginPath();
        ctx.arc(x, y, r + 8 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#8bc34a';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#212121';
        ctx.fill();
        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 2 * scale, y - 30 * scale, 4 * scale, 35 * scale);
        
        ctx.beginPath();
        ctx.moveTo(x + 2 * scale, y - 30 * scale);
        ctx.lineTo(x + 20 * scale, y - 22 * scale);
        ctx.lineTo(x + 2 * scale, y - 14 * scale);
        ctx.closePath();
        ctx.fillStyle = '#f44336';
        ctx.fill();
        ctx.strokeStyle = '#c62828';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function drawBall(ball) {
        const scale = getScale();
        const x = ball.x * scale;
        const y = ball.y * scale;
        const r = PHYSICS.BALL_RADIUS * scale;
        const zOffset = ball.z * scale * 0.5;
        
        if (ball.isFlying || ball.z > 0) {
            ctx.beginPath();
            ctx.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(x, y - zOffset, r, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(x - r * 0.3, y - zOffset - r * 0.3, 0, x, y - zOffset, r);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#f5f5f5');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const px = x + Math.cos(angle) * r * 0.5;
            const py = y - zOffset + Math.sin(angle) * r * 0.5;
            ctx.beginPath();
            ctx.arc(px, py, r * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (ball.spin && Math.abs(ball.spin.rate) > 1) {
            ctx.strokeStyle = 'rgba(33, 150, 243, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const spinAngle = ball.spin.rate > 0 ? 0 : Math.PI;
            ctx.arc(x, y - zOffset, r * 0.8, spinAngle, spinAngle + Math.PI);
            ctx.stroke();
        }
    }

    function drawAimLine(startX, startY, endX, endY, power) {
        const scale = getScale();
        const sx = startX * scale;
        const sy = startY * scale;
        const ex = endX * scale;
        const ey = endY * scale;
        
        const angle = Math.atan2(ey - sy, ex - sx);
        const length = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);
        const maxLength = 200 * scale;
        const clampedLength = Math.min(length, maxLength);
        
        const arrowEndX = sx + Math.cos(angle) * clampedLength;
        const arrowEndY = sy + Math.sin(angle) * clampedLength;
        
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + power * 0.5})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        const arrowSize = 15;
        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - arrowSize * Math.cos(angle - Math.PI / 6),
            arrowEndY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - arrowSize * Math.cos(angle + Math.PI / 6),
            arrowEndY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        const segments = 8;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const px = sx + Math.cos(angle) * clampedLength * t;
            const py = sy + Math.sin(angle) * clampedLength * t;
            const arcHeight = Math.sin(t * Math.PI) * 30 * scale * power;
            
            ctx.beginPath();
            ctx.arc(px, py - arcHeight, 4 * scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + t * 0.5})`;
            ctx.fill();
        }
    }

    function drawTrajectory(points) {
        const scale = getScale();
        
        ctx.beginPath();
        ctx.moveTo(points[0].x * scale, points[0].y * scale - points[0].z * scale * 0.5);
        
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            ctx.lineTo(p.x * scale, p.y * scale - p.z * scale * 0.5);
        }
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawWind(wind) {
        const scale = getScale();
        const x = 60 * scale;
        const y = 60 * scale;
        const size = 30 * scale;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(wind.direction);
        
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size * 0.5, 0);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 0.2, -size * 0.3);
        ctx.moveTo(size * 0.5, 0);
        ctx.lineTo(size * 0.2, size * 0.3);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        const barbs = Math.min(Math.floor(wind.speed / 5), 5);
        for (let i = 0; i < barbs; i++) {
            ctx.beginPath();
            ctx.moveTo(-size * 0.3 + i * size * 0.2, 0);
            ctx.lineTo(-size * 0.15 + i * size * 0.2, -size * 0.2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
        
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${14 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${wind.speed.toFixed(1)} m/s`, x, y + 40 * scale);
    }

    function drawGrassIndicator(grassType) {
        const scale = getScale();
        const grassInfo = PHYSICS.GRASS_TYPES[grassType];
        if (!grassInfo) return;
        
        const x = width - 100 * scale;
        const y = 50 * scale;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x - 70 * scale, y - 20 * scale, 140 * scale, 40 * scale);
        
        ctx.fillStyle = grassInfo.color;
        ctx.beginPath();
        ctx.arc(x - 45 * scale, y, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = `${12 * scale}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(grassInfo.name, x - 25 * scale, y);
    }

    function drawHoleCompleteAnimation(course, progress) {
        const scale = getScale();
        const x = course.cup.x * scale;
        const y = course.cup.y * scale;
        
        const maxRadius = 100 * scale * progress;
        const alpha = 1 - progress;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x, y, maxRadius * (0.5 + i * 0.25), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * (0.8 - i * 0.2)})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        ctx.font = `bold ${48 * scale * (1 + progress * 0.5)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillText('HOLE!', x, y - 80 * scale);
    }

    function drawAIBall(ball, color = '#ff9800') {
        const scale = getScale();
        const x = ball.x * scale;
        const y = ball.y * scale;
        const r = PHYSICS.BALL_RADIUS * scale;
        const zOffset = ball.z * scale * 0.5;
        
        if (ball.isFlying || ball.z > 0) {
            ctx.beginPath();
            ctx.ellipse(x, y, r, r * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(x, y - zOffset, r, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(x - r * 0.3, y - zOffset - r * 0.3, 0, x, y - zOffset, r);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#e65100');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#bf360c';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    return {
        init,
        resize,
        clear,
        drawCourse,
        drawBall,
        drawAimLine,
        drawTrajectory,
        drawWind,
        drawGrassIndicator,
        drawHoleCompleteAnimation,
        drawAIBall,
        setCourseType,
        getScale
    };
})();
