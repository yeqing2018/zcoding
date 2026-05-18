const AI = (function() {
    const difficultyLevels = {
        beginner: {
            name: '新手',
            powerMultiplier: 0.7,
            accuracyMultiplier: 0.5,
            windEffect: 1.5,
            mistakeChance: 0.3
        },
        amateur: {
            name: '业余',
            powerMultiplier: 0.85,
            accuracyMultiplier: 0.7,
            windEffect: 1.2,
            mistakeChance: 0.15
        },
        pro: {
            name: '职业',
            powerMultiplier: 1.0,
            accuracyMultiplier: 0.9,
            windEffect: 1.0,
            mistakeChance: 0.05
        },
        master: {
            name: '大师',
            powerMultiplier: 1.1,
            accuracyMultiplier: 1.0,
            windEffect: 0.8,
            mistakeChance: 0.01
        }
    };

    function createAIPlayer(difficulty = 'amateur', name = 'AI球友') {
        const level = difficultyLevels[difficulty] || difficultyLevels.amateur;
        return {
            name,
            difficulty,
            level,
            currentStrokes: 0,
            totalStrokes: 0,
            ball: null
        };
    }

    function calculateShot(aiPlayer, ball, hole, wind) {
        const level = aiPlayer.level;
        const distance = Math.sqrt(
            (hole.cup.x - ball.x) ** 2 + (hole.cup.y - ball.y) ** 2
        );
        
        const idealAngle = Math.atan2(hole.cup.y - ball.y, hole.cup.x - ball.x);
        
        const accuracy = level.accuracyMultiplier;
        const angleDeviation = (1 - accuracy) * 0.3;
        let finalAngle = idealAngle + (Math.random() - 0.5) * angleDeviation;
        
        if (Math.random() < level.mistakeChance) {
            finalAngle += (Math.random() - 0.5) * 0.5;
        }
        
        const windAdjustment = wind.speed * 0.01 * level.windEffect;
        finalAngle -= Math.sin(wind.direction - finalAngle) * windAdjustment;
        
        let power;
        if (distance < 60) {
            power = Math.min(distance * 1.2, 100);
        } else if (distance < 150) {
            power = Math.min(distance * 0.9, 85);
        } else if (distance < 250) {
            power = Math.min(distance * 0.75, 90);
        } else {
            power = 95 + Math.random() * 5;
        }
        
        power *= level.powerMultiplier;
        power = Math.min(power, 100);
        
        if (Math.random() < level.mistakeChance) {
            power *= 0.8 + Math.random() * 0.3;
        }
        
        return {
            angle: finalAngle,
            power: power,
            estimatedDistance: distance
        };
    }

    function selectClub(ball, hole) {
        return CLUBS.getRecommendedClub(ball, hole);
    }

    function simulateShot(aiPlayer, ball, hole, wind) {
        const club = selectClub(ball, hole);
        const shot = calculateShot(aiPlayer, ball, hole, wind);
        
        const tempBall = PHYSICS.createBall(ball.x, ball.y);
        PHYSICS.hitBall(tempBall, shot.power, shot.angle, club, { power: 10 });
        
        let steps = 0;
        while ((tempBall.isFlying || tempBall.isRolling) && steps < 500) {
            PHYSICS.updateBall(tempBall, hole, 0.5);
            steps++;
        }
        
        return {
            club,
            shot,
            finalPosition: { x: tempBall.x, y: tempBall.y },
            inHole: tempBall.inHole
        };
    }

    function getDifficultyLevels() {
        return Object.keys(difficultyLevels).map(key => ({
            id: key,
            ...difficultyLevels[key]
        }));
    }

    return {
        createAIPlayer,
        calculateShot,
        selectClub,
        simulateShot,
        getDifficultyLevels
    };
})();
