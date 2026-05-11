import { Game } from './game.js';
import { InputManager } from './input.js';
import { Leaderboard } from './leaderboard.js';
import { HintAI } from './hint.js';

class GameController {
    constructor() {
        this.game = new Game();
        this.input = new InputManager();
        this.leaderboard = new Leaderboard();
        this.hintAI = new HintAI();

        this.gridContainer = document.getElementById('grid-container');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.messageTitle = document.getElementById('message-title');

        this.newGameBtn = document.getElementById('new-game-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.retryBtn = document.getElementById('retry-btn');

        this.movesCountElement = document.getElementById('moves-count');
        this.timeCountElement = document.getElementById('time-count');
        this.hintBtn = document.getElementById('hint-btn');
        this.autoHintToggle = document.getElementById('auto-hint-toggle');

        this.leaderboardBtn = document.getElementById('leaderboard-btn');
        this.leaderboardModal = document.getElementById('leaderboard-modal');
        this.leaderboardClose = document.getElementById('leaderboard-close');
        this.leaderboardTable = document.getElementById('leaderboard-table');
        this.leaderboardTbody = document.getElementById('leaderboard-tbody');
        this.leaderboardEmpty = document.getElementById('leaderboard-empty');
        this.closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
        this.resetLeaderboardBtn = document.getElementById('reset-leaderboard-btn');

        this.hintArrowUp = document.getElementById('hint-arrow-up');
        this.hintArrowDown = document.getElementById('hint-arrow-down');
        this.hintArrowLeft = document.getElementById('hint-arrow-left');
        this.hintArrowRight = document.getElementById('hint-arrow-right');

        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.gameActive = false;
        this.autoHintEnabled = false;

        this.init();
    }

    init() {
        this.setupGrid();
        this.bindEvents();
        this.newGame();
    }

    setupGrid() {
        this.gridContainer.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridContainer.appendChild(cell);
        }
    }

    bindEvents() {
        this.input.on('move', (direction) => this.handleMove(direction));

        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.continueBtn.addEventListener('click', () => this.continueGame());
        this.retryBtn.addEventListener('click', () => this.newGame());

        window.addEventListener('resize', () => this.render());

        this.hintBtn.addEventListener('click', () => this.showHint());
        this.autoHintToggle.addEventListener('change', (e) => {
            this.autoHintEnabled = e.target.checked;
            if (this.autoHintEnabled && this.gameActive) {
                this.showHint();
            } else {
                this.clearHint();
            }
        });

        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.leaderboardClose.addEventListener('click', () => this.hideLeaderboard());
        this.closeLeaderboardBtn.addEventListener('click', () => this.hideLeaderboard());
        this.resetLeaderboardBtn.addEventListener('click', () => this.resetLeaderboard());

        this.leaderboardModal.addEventListener('click', (e) => {
            if (e.target === this.leaderboardModal) {
                this.hideLeaderboard();
            }
        });
    }

    newGame() {
        this.stopTimer();
        this.game = new Game();
        this.moves = 0;
        this.gameActive = true;

        this.hideMessage();
        this.clearHint();
        this.updateStats();

        this.game.addRandomTile();
        this.game.addRandomTile();
        this.render();

        this.startTimer();

        if (this.autoHintEnabled) {
            setTimeout(() => this.showHint(), 300);
        }
    }

    continueGame() {
        this.game.continueGame();
        this.hideMessage();

        if (this.game.isGameOver()) {
            setTimeout(() => this.showGameOverMessage(), 100);
        }
    }

    handleMove(direction) {
        if (this.game.hasWon() || this.game.isGameOver()) return;

        const moved = this.game.move(direction);

        if (moved) {
            this.moves++;
            this.game.addRandomTile();
            this.updateStats();
            this.render();

            if (this.game.hasWon()) {
                this.showWinMessage();
            } else if (this.game.isGameOver()) {
                this.endGame();
            } else if (this.autoHintEnabled) {
                setTimeout(() => this.showHint(), 300);
            } else {
                this.clearHint();
            }
        }
    }

    endGame() {
        this.gameActive = false;
        this.stopTimer();
        this.clearHint();

        const score = this.game.getScore();
        if (score > 0) {
            const elapsed = this.getElapsedSeconds();
            this.leaderboard.addRecord(score, this.moves, elapsed);
        }

        this.showGameOverMessage();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    getElapsedSeconds() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    updateTime() {
        const seconds = this.getElapsedSeconds();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.timeCountElement.textContent =
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateStats() {
        this.movesCountElement.textContent = this.moves;
        this.updateScore();
    }

    render() {
        this.updateScore();
        this.renderTiles();
    }

    updateScore() {
        this.scoreElement.textContent = this.game.getScore();
        this.bestScoreElement.textContent = this.game.getBestScore();
    }

    renderTiles() {
        this.tileContainer.innerHTML = '';
        const grid = this.game.getGrid();

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const tile = grid[row][col];
                if (tile) {
                    this.addTile(row, col, tile);
                }
            }
        }
    }

    addTile(row, col, tile) {
        const tileElement = document.createElement('div');
        let classes = ['tile', `tile-${tile.value}`];

        if (tile.isNew) classes.push('tile-new');
        if (tile.isMerged) classes.push('tile-merged');

        if (tile.value > 2048) {
            classes = ['tile', 'tile-super'];
        }

        tileElement.className = classes.join(' ');
        tileElement.textContent = tile.value;

        const position = this.getTilePosition(row, col);
        tileElement.style.left = position.left;
        tileElement.style.top = position.top;
        tileElement.style.width = position.width;
        tileElement.style.height = position.height;

        this.tileContainer.appendChild(tileElement);
    }

    getTilePosition(row, col) {
        const isMobile = window.innerWidth <= 520;
        const padding = isMobile ? 10 : 15;
        const gap = isMobile ? 10 : 15;
        const totalFixed = 2 * padding + 3 * gap;

        return {
            left: `calc(${padding}px + ${col} * ((100% - ${totalFixed}px) / 4 + ${gap}px))`,
            top: `calc(${padding}px + ${row} * ((100% - ${totalFixed}px) / 4 + ${gap}px))`,
            width: `calc((100% - ${totalFixed}px) / 4)`,
            height: `calc((100% - ${totalFixed}px) / 4)`
        };
    }

    showHint() {
        if (!this.gameActive || this.game.hasWon() || this.game.isGameOver()) return;

        const grid = this.game.getGrid();
        const bestDirection = this.hintAI.getBestMove(grid);

        if (bestDirection) {
            this.clearHint();

            const arrowMap = {
                up: this.hintArrowUp,
                down: this.hintArrowDown,
                left: this.hintArrowLeft,
                right: this.hintArrowRight
            };

            if (arrowMap[bestDirection]) {
                arrowMap[bestDirection].classList.add('active');
            }
        }
    }

    clearHint() {
        this.hintArrowUp.classList.remove('active');
        this.hintArrowDown.classList.remove('active');
        this.hintArrowLeft.classList.remove('active');
        this.hintArrowRight.classList.remove('active');
    }

    showLeaderboard() {
        this.leaderboard.render(
            this.leaderboardTbody,
            this.leaderboardEmpty,
            this.leaderboardTable
        );
        this.leaderboardModal.classList.add('show');
    }

    hideLeaderboard() {
        this.leaderboardModal.classList.remove('show');
    }

    resetLeaderboard() {
        if (confirm('确定要清空所有排行榜记录吗？此操作不可撤销。')) {
            this.leaderboard.clearRecords();
            this.leaderboard.render(
                this.leaderboardTbody,
                this.leaderboardEmpty,
                this.leaderboardTable
            );
        }
    }

    showWinMessage() {
        this.gameActive = false;
        this.stopTimer();
        this.clearHint();

        const score = this.game.getScore();
        if (score > 0) {
            const elapsed = this.getElapsedSeconds();
            this.leaderboard.addRecord(score, this.moves, elapsed);
        }

        this.messageTitle.textContent = '你赢了！';
        this.gameMessage.classList.add('show', 'win');
    }

    showGameOverMessage() {
        this.gameActive = false;
        this.stopTimer();
        this.clearHint();

        this.messageTitle.textContent = '游戏结束！';
        this.gameMessage.classList.add('show');
        this.gameMessage.classList.remove('win');
    }

    hideMessage() {
        this.gameMessage.classList.remove('show', 'win');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameController();
});
