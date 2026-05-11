const STORAGE_KEY = '2048_leaderboard';
const MAX_RECORDS = 10;

export class Leaderboard {
    constructor() {
        this.records = this.loadRecords();
    }

    loadRecords() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('加载排行榜失败:', e);
            return [];
        }
    }

    saveRecords() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
        } catch (e) {
            console.error('保存排行榜失败:', e);
        }
    }

    addRecord(score, moves, timeInSeconds) {
        const record = {
            id: Date.now(),
            score: score,
            moves: moves,
            time: timeInSeconds,
            date: new Date().toISOString()
        };

        this.records.push(record);

        this.records.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.time !== b.time) return a.time - b.time;
            return a.moves - b.moves;
        });

        if (this.records.length > MAX_RECORDS) {
            this.records = this.records.slice(0, MAX_RECORDS);
        }

        this.saveRecords();

        const rank = this.records.findIndex(r => r.id === record.id) + 1;
        return { record, rank, isNewRecord: rank === 1 };
    }

    getRecords() {
        return [...this.records];
    }

    clearRecords() {
        this.records = [];
        this.saveRecords();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const mins = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${mins}`;
    }

    render(tableBody, emptyElement, tableElement) {
        tableBody.innerHTML = '';

        if (this.records.length === 0) {
            emptyElement.classList.add('show');
            tableElement.classList.remove('show');
            return;
        }

        emptyElement.classList.remove('show');
        tableElement.classList.add('show');

        this.records.forEach((record, index) => {
            const row = document.createElement('tr');

            const rankEmojis = ['🥇', '🥈', '🥉'];
            const rankCell = document.createElement('td');
            rankCell.textContent = rankEmojis[index] || (index + 1);
            row.appendChild(rankCell);

            const scoreCell = document.createElement('td');
            scoreCell.textContent = record.score.toLocaleString();
            scoreCell.style.fontWeight = 'bold';
            row.appendChild(scoreCell);

            const movesCell = document.createElement('td');
            movesCell.textContent = record.moves;
            row.appendChild(movesCell);

            const timeCell = document.createElement('td');
            timeCell.textContent = this.formatTime(record.time);
            row.appendChild(timeCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = this.formatDate(record.date);
            row.appendChild(dateCell);

            tableBody.appendChild(row);
        });
    }
}
