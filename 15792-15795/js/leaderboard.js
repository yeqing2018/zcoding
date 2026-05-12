const Leaderboard = (function() {
    const STORAGE_KEYS = {
        PVP: 'gomoku_pvp_leaderboard',
        PVE: 'gomoku_pve_leaderboard'
    };

    const MAX_RECORDS = 10;

    function loadRecords(type) {
        const key = type === 'pvp' ? STORAGE_KEYS.PVP : STORAGE_KEYS.PVE;
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('加载排行榜数据失败:', e);
            return [];
        }
    }

    function saveRecords(type, records) {
        const key = type === 'pvp' ? STORAGE_KEYS.PVP : STORAGE_KEYS.PVE;
        try {
            localStorage.setItem(key, JSON.stringify(records));
        } catch (e) {
            console.error('保存排行榜数据失败:', e);
        }
    }

    function addRecord(type, winner, moves, difficulty = null) {
        const records = loadRecords(type);
        
        const record = {
            id: Date.now(),
            winner,
            moves,
            difficulty: difficulty || null,
            date: new Date().toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: Date.now()
        };

        records.push(record);
        records.sort((a, b) => a.moves - b.moves);
        
        const trimmedRecords = records.slice(0, MAX_RECORDS);
        saveRecords(type, trimmedRecords);
        
        return trimmedRecords;
    }

    function clearRecords(type) {
        const key = type === 'pvp' ? STORAGE_KEYS.PVP : STORAGE_KEYS.PVE;
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('清空排行榜数据失败:', e);
        }
    }

    function clearAllRecords() {
        clearRecords('pvp');
        clearRecords('pve');
    }

    function formatWinner(winner, type) {
        if (type === 'pvp') {
            return winner === 'black' ? '黑棋' : '白棋';
        } else {
            return winner === 'player' ? '玩家' : '电脑';
        }
    }

    function renderLeaderboard(type, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const records = loadRecords(type);

        if (records.length === 0) {
            container.innerHTML = '<p class="empty-text">暂无记录</p>';
            return;
        }

        let html = '<ul class="leaderboard-list">';
        
        records.forEach((record, index) => {
            const rank = index + 1;
            const winnerText = formatWinner(record.winner, type);
            
            html += `
                <li class="leaderboard-item">
                    <span class="rank">#${rank}</span>
                    <div class="info">
                        <div class="winner">${winnerText}${record.difficulty ? ` (${getDifficultyLabel(record.difficulty)})` : ''}</div>
                        <div class="date">${record.date}</div>
                    </div>
                    <span class="moves">${record.moves}步</span>
                </li>
            `;
        });

        html += '</ul>';
        container.innerHTML = html;
    }

    function getDifficultyLabel(difficulty) {
        const labels = {
            easy: '简单',
            medium: '中等',
            hard: '困难'
        };
        return labels[difficulty] || difficulty;
    }

    return {
        addRecord,
        loadRecords,
        clearRecords,
        clearAllRecords,
        renderLeaderboard
    };
})();
