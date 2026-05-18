const COURSES = (function() {
    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 600;

    const courseTypes = {
        parkland: {
            name: '公园球场',
            description: '经典公园风格，树木茂密，球道宽阔',
            grassColor: '#4caf50',
            roughColor: '#2e7d32',
            bunkerColor: '#f4d35e',
            treeColor: '#1b5e20',
            windBase: 3,
            windVariance: 5
        },
        links: {
            name: '林地球场',
            description: '海风强劲，地形起伏，长草区深',
            grassColor: '#8bc34a',
            roughColor: '#689f38',
            bunkerColor: '#ffd54f',
            treeColor: '#558b2f',
            windBase: 8,
            windVariance: 10
        },
        coastal: {
            name: '海滨球场',
            description: '水景众多，海风大，果岭速度快',
            grassColor: '#66bb6a',
            roughColor: '#43a047',
            bunkerColor: '#ffe082',
            treeColor: '#2e7d32',
            windBase: 10,
            windVariance: 8
        },
        desert: {
            name: '沙漠球场',
            description: '干旱少雨，沙坑众多，视觉冲击力强',
            grassColor: '#81c784',
            roughColor: '#a1887f',
            bunkerColor: '#ffe0b2',
            treeColor: '#5d4037',
            windBase: 12,
            windVariance: 10
        }
    };

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

    function generateFairway(teeX, teeY, cupX, cupY) {
        const points = [];
        const angle = Math.atan2(cupY - teeY, cupX - teeX);
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

    function generateObstacles(teeX, teeY, cupX, cupY, courseType) {
        const obstacles = [];
        const dist = Math.sqrt((cupX - teeX) ** 2 + (cupY - teeY) ** 2);
        const angle = Math.atan2(cupY - teeY, cupX - teeX);
        
        const numBunkers = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numBunkers; i++) {
            const t = 0.3 + Math.random() * 0.5;
            const baseX = teeX + (cupX - teeX) * t;
            const baseY = teeY + (cupY - teeY) * t;
            const offset = (Math.random() - 0.5) * 80;
            const perpX = -Math.sin(angle) * offset;
            const perpY = Math.cos(angle) * offset;
            obstacles.push({
                type: 'bunker',
                x: baseX + perpX,
                y: baseY + perpY,
                radius: 35 + Math.random() * 25
            });
        }
        
        if (Math.random() > 0.4 && dist > 200) {
            const t = 0.4 + Math.random() * 0.3;
            obstacles.push({
                type: 'water',
                x: teeX + (cupX - teeX) * t,
                y: teeY + (cupY - teeY) * t,
                width: 80 + Math.random() * 60,
                height: 60 + Math.random() * 60
            });
        }
        
        const numTrees = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numTrees; i++) {
            const t = Math.random();
            const baseX = teeX + (cupX - teeX) * t;
            const baseY = teeY + (cupY - teeY) * t;
            const offset = -60 + Math.random() * 120;
            const perpX = -Math.sin(angle) * offset;
            const perpY = Math.cos(angle) * offset;
            obstacles.push({
                type: 'tree',
                x: baseX + perpX,
                y: baseY + perpY,
                radius: 20 + Math.random() * 15
            });
        }
        
        return obstacles;
    }

    function createHole(id, par, teeX, teeY, cupX, cupY, courseType) {
        return {
            id,
            par,
            name: `${courseType.name} 第${id}洞`,
            tee: { x: teeX, y: teeY },
            cup: { x: cupX, y: cupY },
            heightMap: generateHeightMap(30, 20, 0, 3),
            obstacles: generateObstacles(teeX, teeY, cupX, cupY, courseType),
            fairway: {
                points: generateFairway(teeX, teeY, cupX, cupY)
            }
        };
    }

    function generateCourse(courseTypeId) {
        const courseType = courseTypes[courseTypeId] || courseTypes.parkland;
        const holes = [];
        
        const holeConfigs = [
            { par: 3, tee: [100, 500], cup: [750, 100] },
            { par: 4, tee: [80, 300], cup: [820, 300] },
            { par: 3, tee: [150, 150], cup: [750, 450] },
            { par: 4, tee: [100, 500], cup: [800, 150] },
            { par: 5, tee: [80, 550], cup: [820, 50] },
            { par: 3, tee: [450, 550], cup: [450, 50] },
            { par: 4, tee: [100, 100], cup: [800, 500] },
            { par: 3, tee: [80, 300], cup: [500, 500] },
            { par: 4, tee: [100, 50], cup: [800, 550] },
            { par: 4, tee: [100, 550], cup: [800, 100] },
            { par: 3, tee: [450, 50], cup: [450, 550] },
            { par: 4, tee: [80, 100], cup: [820, 500] },
            { par: 5, tee: [80, 300], cup: [820, 300] },
            { par: 3, tee: [150, 450], cup: [750, 150] },
            { par: 4, tee: [100, 50], cup: [800, 550] },
            { par: 3, tee: [80, 500], cup: [500, 100] },
            { par: 4, tee: [100, 300], cup: [820, 300] },
            { par: 5, tee: [100, 550], cup: [800, 50] }
        ];
        
        holeConfigs.forEach((config, index) => {
            holes.push(createHole(
                index + 1,
                config.par,
                config.tee[0],
                config.tee[1],
                config.cup[0],
                config.cup[1],
                courseType
            ));
        });
        
        return {
            id: courseTypeId,
            name: courseType.name,
            description: courseType.description,
            type: courseType,
            holes,
            wind: {
                speed: courseType.windBase + Math.random() * courseType.windVariance,
                direction: Math.random() * Math.PI * 2
            }
        };
    }

    const courses = {
        parkland: generateCourse('parkland'),
        links: generateCourse('links'),
        coastal: generateCourse('coastal'),
        desert: generateCourse('desert')
    };

    function getCourse(courseId) {
        return courses[courseId] || courses.parkland;
    }

    function getHole(courseId, holeIndex) {
        const course = getCourse(courseId);
        return course.holes[holeIndex % course.holes.length];
    }

    function getAllCourses() {
        return Object.values(courses);
    }

    function getCourseTypes() {
        return Object.entries(courseTypes).map(([id, type]) => ({
            id,
            name: type.name,
            description: type.description
        }));
    }

    function regenerateWind(courseId) {
        const course = getCourse(courseId);
        course.wind.speed = course.type.windBase + Math.random() * course.type.windVariance;
        course.wind.direction = Math.random() * Math.PI * 2;
        return course.wind;
    }

    return {
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        getCourse,
        getHole,
        getAllCourses,
        getCourseTypes,
        regenerateWind,
        courseTypes
    };
})();
