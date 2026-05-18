const PLAYER = (function() {
    const STORAGE_KEY = 'golf_player_data';

    const defaultStats = {
        name: '高尔夫球手',
        level: 1,
        experience: 0,
        experienceToNext: 100,
        stats: {
            power: 0,
            accuracy: 0,
            mental: 0,
            putting: 0,
            shortGame: 0
        },
        attributePoints: 0,
        achievements: [],
        bestScores: {},
        totalRounds: 0,
        totalHoles: 0,
        holesInOne: 0,
        eagles: 0,
        birdies: 0
    };

    let currentPlayer = loadPlayer();

    function loadPlayer() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('加载球员数据失败:', e);
        }
        return JSON.parse(JSON.stringify(defaultStats));
    }

    function savePlayer() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPlayer));
        } catch (e) {
            console.error('保存球员数据失败:', e);
        }
    }

    function getPlayer() {
        return JSON.parse(JSON.stringify(currentPlayer));
    }

    function addExperience(exp) {
        currentPlayer.experience += exp;
        while (currentPlayer.experience >= currentPlayer.experienceToNext) {
            currentPlayer.experience -= currentPlayer.experienceToNext;
            currentPlayer.level++;
            currentPlayer.attributePoints += 2;
            currentPlayer.experienceToNext = Math.floor(currentPlayer.experienceToNext * 1.5);
        }
        savePlayer();
        return getPlayer();
    }

    function upgradeAttribute(attribute) {
        if (currentPlayer.attributePoints <= 0) return false;
        if (!currentPlayer.stats.hasOwnProperty(attribute)) return false;
        if (currentPlayer.stats[attribute] >= 20) return false;
        
        currentPlayer.stats[attribute]++;
        currentPlayer.attributePoints--;
        savePlayer();
        return true;
    }

    function recordRound(courseId, totalStrokes, totalPar) {
        currentPlayer.totalRounds++;
        currentPlayer.totalHoles += 18;
        
        const scoreKey = `${courseId}_best`;
        if (!currentPlayer.bestScores[scoreKey] || totalStrokes < currentPlayer.bestScores[scoreKey]) {
            currentPlayer.bestScores[scoreKey] = totalStrokes;
        }
        
        const diff = totalStrokes - totalPar;
        let exp = 50;
        if (diff < 0) exp += 100;
        else if (diff === 0) exp += 50;
        else if (diff <= 5) exp += 20;
        
        addExperience(exp);
        savePlayer();
    }

    function recordHole(strokes, par) {
        const diff = strokes - par;
        if (strokes === 1) currentPlayer.holesInOne++;
        else if (diff <= -2) currentPlayer.eagles++;
        else if (diff === -1) currentPlayer.birdies++;
        
        let exp = 5;
        if (strokes === 1) exp += 100;
        else if (diff <= -2) exp += 50;
        else if (diff === -1) exp += 25;
        else if (diff === 0) exp += 10;
        
        addExperience(exp);
    }

    function unlockAchievement(achievementId) {
        if (!currentPlayer.achievements.includes(achievementId)) {
            currentPlayer.achievements.push(achievementId);
            addExperience(50);
            return true;
        }
        return false;
    }

    function resetPlayer() {
        currentPlayer = JSON.parse(JSON.stringify(defaultStats));
        savePlayer();
        return getPlayer();
    }

    function getStatModifier(stat) {
        return currentPlayer.stats[stat] || 0;
    }

    return {
        getPlayer,
        addExperience,
        upgradeAttribute,
        recordRound,
        recordHole,
        unlockAchievement,
        resetPlayer,
        getStatModifier
    };
})();
