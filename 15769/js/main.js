import { Game } from './game.js';
import { InputManager } from './input.js';

class GameController {
    constructor() {
        this.game = new Game();
        this.input = new InputManager();
        
        this.gridContainer = document.getElementById('grid-container');
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.messageTitle = document.getElementById('message-title');
        
        this.newGameBtn = document.getElementById('new-game-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.retryBtn = document.getElementById('retry-btn');

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
    }

    newGame() {
        this.game = new Game();
        this.hideMessage();
        this.game.addRandomTile();
        this.game.addRandomTile();
        this.render();
    }

    continueGame() {
        this.game.continueGame();
        this.hideMessage();
    }

    handleMove(direction) {
        if (this.game.hasWon() || this.game.isGameOver()) return;

        const moved = this.game.move(direction);
        
        if (moved) {
            this.game.addRandomTile();
            this.render();
            
            if (this.game.hasWon()) {
                this.showWinMessage();
            } else if (this.game.isGameOver()) {
                this.showGameOverMessage();
            }
        }
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

        const { left, top } = this.getTilePosition(row, col);
        tileElement.style.left = `${left}%`;
        tileElement.style.top = `${top}%`;

        this.tileContainer.appendChild(tileElement);
    }

    getTilePosition(row, col) {
        const isMobile = window.innerWidth <= 520;
        const padding = isMobile ? 10 : 15;
        const gap = isMobile ? 10 : 15;

        const left = padding + col * (100 - 2 * padding) / 4 + col * (3 * gap) / 4;
        const top = padding + row * (100 - 2 * padding) / 4 + row * (3 * gap) / 4;

        return { left, top };
    }

    showWinMessage() {
        this.messageTitle.textContent = '你赢了！';
        this.gameMessage.classList.add('show', 'win');
    }

    showGameOverMessage() {
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
