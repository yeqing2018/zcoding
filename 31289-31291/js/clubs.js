const CLUBS = (function() {
    const clubs = [
        {
            id: 'driver',
            name: '一号木杆',
            shortName: 'D',
            type: 'wood',
            loft: 10.5,
            powerMultiplier: 1.4,
            accuracy: 0.7,
            forgiveness: 0.6,
            spinRate: 20,
            minDistance: 200,
            maxDistance: 320,
            description: '发球台开球用，距离最远但精度较低'
        },
        {
            id: '3wood',
            name: '三号木杆',
            shortName: '3W',
            type: 'wood',
            loft: 15,
            powerMultiplier: 1.2,
            accuracy: 0.75,
            forgiveness: 0.7,
            spinRate: 35,
            minDistance: 180,
            maxDistance: 260,
            description: '球道长打，距离和精度平衡'
        },
        {
            id: '5iron',
            name: '五号铁杆',
            shortName: '5I',
            type: 'iron',
            loft: 27,
            powerMultiplier: 1.0,
            accuracy: 0.8,
            forgiveness: 0.75,
            spinRate: 50,
            minDistance: 150,
            maxDistance: 200,
            description: '中远距进攻，弹道中等'
        },
        {
            id: '7iron',
            name: '七号铁杆',
            shortName: '7I',
            type: 'iron',
            loft: 34,
            powerMultiplier: 0.85,
            accuracy: 0.85,
            forgiveness: 0.8,
            spinRate: 65,
            minDistance: 120,
            maxDistance: 170,
            description: '中距离进攻，最常用的铁杆'
        },
        {
            id: '9iron',
            name: '九号铁杆',
            shortName: '9I',
            type: 'iron',
            loft: 42,
            powerMultiplier: 0.7,
            accuracy: 0.9,
            forgiveness: 0.85,
            spinRate: 80,
            minDistance: 90,
            maxDistance: 140,
            description: '短距离进攻，高弹道高旋转'
        },
        {
            id: 'wedge',
            name: '挖起杆',
            shortName: 'W',
            type: 'wedge',
            loft: 56,
            powerMultiplier: 0.5,
            accuracy: 0.95,
            forgiveness: 0.9,
            spinRate: 120,
            minDistance: 30,
            maxDistance: 100,
            description: '切杆和救球，高抛球和后旋'
        },
        {
            id: 'putter',
            name: '推杆',
            shortName: 'P',
            type: 'putter',
            loft: 3,
            powerMultiplier: 0.3,
            accuracy: 1.0,
            forgiveness: 0.95,
            spinRate: 10,
            minDistance: 5,
            maxDistance: 50,
            description: '果岭推球，精准控制距离'
        }
    ];

    function getClub(id) {
        return clubs.find(c => c.id === id) || clubs[0];
    }

    function getAllClubs() {
        return [...clubs];
    }

    function getRecommendedClub(ball, hole) {
        const distance = Math.sqrt(
            (hole.cup.x - ball.x) ** 2 + (hole.cup.y - ball.y) ** 2
        );
        
        const onGreen = distance < 50;
        if (onGreen) return getClub('putter');
        
        const inBunker = hole.obstacles.some(o => 
            o.type === 'bunker' && 
            Math.sqrt((ball.x - o.x) ** 2 + (ball.y - o.y) ** 2) < o.radius
        );
        if (inBunker) return getClub('wedge');
        
        if (distance > 280) return getClub('driver');
        if (distance > 220) return getClub('3wood');
        if (distance > 170) return getClub('5iron');
        if (distance > 120) return getClub('7iron');
        if (distance > 80) return getClub('9iron');
        return getClub('wedge');
    }

    function getClubsByType(type) {
        return clubs.filter(c => c.type === type);
    }

    return {
        getClub,
        getAllClubs,
        getRecommendedClub,
        getClubsByType
    };
})();
