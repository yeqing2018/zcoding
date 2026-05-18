const COURSES = (function() {
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 600;

    function generateHeightMap(width, height, baseHeight, roughness) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = baseHeight + (Math.random() - 0.5) * roughness;
            }
        }
        return map;
    }

    function createHole(id, par, teeX, teeY, cupX, cupY, obstacles, name) {
        return {
            id,
            par,
            name,
            tee: { x: teeX, y: teeY },
            cup: { x: cupX, y: cupY },
            heightMap: generateHeightMap(30, 20, 0, 2),
            obstacles: obstacles || [],
            fairway: {
                points: generateFairway(teeX, teeY, cupX, cupY)
            }
        };
    }

    function generateFairway(teeX, teeY, cupX, cupY) {
        const points = [];
        const angle = Math.atan2(cupY - teeY, cupX - teeX);
        const dist = Math.sqrt((cupX - teeX) ** 2 + (cupY - teeY) ** 2);
        const steps = 8;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const baseX = teeX + (cupX - teeX) * t;
            const baseY = teeY + (cupY - teeY) * t;
            const offset = (Math.random() - 0.5) * 60;
            const perpX = -Math.sin(angle) * offset;
            const perpY = Math.cos(angle) * offset;
            points.push({ x: baseX + perpX, y: baseY + perpY });
        }
        return points;
    }

    const holes = [
        createHole(1, 3, 100, 500, 750, 100, [
            { type: 'bunker', x: 400, y: 350, radius: 50 },
            { type: 'bunker', x: 500, y: 200, radius: 40 }
        ], '发球台'),
        createHole(2, 4, 80, 300, 820, 300, [
            { type: 'water', x: 450, y: 300, width: 120, height: 150 },
            { type: 'tree', x: 300, y: 200, radius: 25 },
            { type: 'tree', x: 600, y: 400, radius: 25 }
        ], '水道挑战'),
        createHole(3, 3, 150, 150, 750, 450, [
            { type: 'bunker', x: 450, y: 300, radius: 60 },
            { type: 'tree', x: 350, y: 400, radius: 30 }
        ], '沙坑守护'),
        createHole(4, 4, 100, 500, 800, 150, [
            { type: 'tree', x: 250, y: 400, radius: 28 },
            { type: 'tree', x: 400, y: 300, radius: 28 },
            { type: 'tree', x: 550, y: 200, radius: 28 },
            { type: 'bunker', x: 700, y: 250, radius: 45 }
        ], '林荫大道'),
        createHole(5, 5, 80, 550, 820, 50, [
            { type: 'water', x: 350, y: 200, width: 150, height: 200 },
            { type: 'bunker', x: 600, y: 150, radius: 50 },
            { type: 'tree', x: 200, y: 350, radius: 30 },
            { type: 'tree', x: 700, y: 350, radius: 30 }
        ], '长距离'),
        createHole(6, 3, 450, 550, 450, 50, [
            { type: 'bunker', x: 350, y: 300, radius: 40 },
            { type: 'bunker', x: 550, y: 300, radius: 40 },
            { type: 'tree', x: 450, y: 200, radius: 25 }
        ], '直线进攻'),
        createHole(7, 4, 100, 100, 800, 500, [
            { type: 'water', x: 400, y: 250, width: 100, height: 180 },
            { type: 'tree', x: 250, y: 300, radius: 28 },
            { type: 'tree', x: 650, y: 350, radius: 28 },
            { type: 'bunker', x: 700, y: 450, radius: 45 }
        ], '蜿蜒小径'),
        createHole(8, 3, 80, 300, 500, 500, [
            { type: 'bunker', x: 300, y: 400, radius: 50 },
            { type: 'tree', x: 400, y: 250, radius: 30 },
            { type: 'tree', x: 200, y: 200, radius: 25 }
        ], '短杆挑战'),
        createHole(9, 4, 100, 50, 800, 550, [
            { type: 'water', x: 300, y: 300, width: 180, height: 120 },
            { type: 'bunker', x: 600, y: 450, radius: 55 },
            { type: 'tree', x: 500, y: 150, radius: 30 },
            { type: 'tree', x: 700, y: 300, radius: 28 }
        ], '半场结束'),
        createHole(10, 4, 100, 550, 800, 100, [
            { type: 'tree', x: 300, y: 450, radius: 30 },
            { type: 'tree', x: 450, y: 350, radius: 30 },
            { type: 'tree', x: 600, y: 250, radius: 30 },
            { type: 'bunker', x: 700, y: 180, radius: 45 }
        ], '后九开始'),
        createHole(11, 3, 450, 50, 450, 550, [
            { type: 'water', x: 350, y: 250, width: 200, height: 100 },
            { type: 'bunker', x: 450, y: 400, radius: 50 }
        ], '越过水障'),
        createHole(12, 4, 80, 100, 820, 500, [
            { type: 'tree', x: 200, y: 200, radius: 28 },
            { type: 'tree', x: 400, y: 350, radius: 32 },
            { type: 'tree', x: 600, y: 250, radius: 28 },
            { type: 'bunker', x: 750, y: 400, radius: 50 },
            { type: 'bunker', x: 500, y: 450, radius: 40 }
        ], '森林之路'),
        createHole(13, 5, 80, 300, 820, 300, [
            { type: 'water', x: 250, y: 150, width: 120, height: 150 },
            { type: 'water', x: 550, y: 350, width: 120, height: 150 },
            { type: 'bunker', x: 400, y: 300, radius: 50 },
            { type: 'tree', x: 700, y: 200, radius: 30 },
            { type: 'tree', x: 700, y: 400, radius: 30 }
        ], '双水障碍'),
        createHole(14, 3, 150, 450, 750, 150, [
            { type: 'bunker', x: 300, y: 350, radius: 45 },
            { type: 'bunker', x: 500, y: 250, radius: 45 },
            { type: 'tree', x: 650, y: 350, radius: 28 }
        ], '沙坑连环'),
        createHole(15, 4, 100, 50, 800, 550, [
            { type: 'tree', x: 250, y: 150, radius: 30 },
            { type: 'tree', x: 350, y: 300, radius: 30 },
            { type: 'tree', x: 500, y: 450, radius: 30 },
            { type: 'water', x: 600, y: 250, width: 100, height: 120 },
            { type: 'bunker', x: 700, y: 480, radius: 50 }
        ], '迂回曲折'),
        createHole(16, 3, 80, 500, 500, 100, [
            { type: 'water', x: 250, y: 300, width: 150, height: 150 },
            { type: 'bunker', x: 600, y: 200, radius: 45 },
            { type: 'tree', x: 400, y: 400, radius: 28 }
        ], '精准打击'),
        createHole(17, 4, 100, 300, 820, 300, [
            { type: 'water', x: 350, y: 200, width: 100, height: 200 },
            { type: 'water', x: 550, y: 200, width: 100, height: 200 },
            { type: 'tree', x: 450, y: 100, radius: 28 },
            { type: 'tree', x: 450, y: 500, radius: 28 },
            { type: 'bunker', x: 720, y: 300, radius: 50 }
        ], '岛屿果岭'),
        createHole(18, 5, 100, 550, 800, 50, [
            { type: 'water', x: 300, y: 350, width: 200, height: 120 },
            { type: 'bunker', x: 550, y: 200, radius: 55 },
            { type: 'bunker', x: 650, y: 100, radius: 45 },
            { type: 'tree', x: 200, y: 400, radius: 32 },
            { type: 'tree', x: 700, y: 300, radius: 30 }
        ], '收官之洞')
    ];

    return {
        holes,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        getHole: function(index) {
            return this.holes[index % this.holes.length];
        },
        getTotalPar: function() {
            return this.holes.reduce((sum, hole) => sum + hole.par, 0);
        }
    };
})();
