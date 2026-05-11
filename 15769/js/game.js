const GRID_SIZE = 4;
const WIN_VALUE = 2048;

export class Game {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.initGrid();
    }

    initGrid() {
        this.grid = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    loadBestScore() {
        const saved = localStorage.getItem('bestScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    saveBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore.toString());
        }
    }

    getEmptyCells() {
        const empty = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid[row][col] === null) {
                    empty.push({ row, col });
                }
            }
        }
        return empty;
    }

    addRandomTile() {
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) return null;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;

        this.grid[randomCell.row][randomCell.col] = {
            value,
            isNew: true,
            isMerged: false
        };

        return randomCell;
    }

    move(direction) {
        this.clearTileFlags();

        const vectors = this.getVectors();
        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);
        let moved = false;

        this.prepareTilesForMove();

        traversals.rows.forEach(row => {
            traversals.cols.forEach(col => {
                const cell = { row, col };
                const tile = this.grid[row][col];

                if (tile) {
                    const positions = this.findFarthestPosition(cell, vector);
                    const next = this.grid[positions.next.row]?.[positions.next.col];

                    if (next && next.value === tile.value && !next.isMerged) {
                        const mergedValue = tile.value * 2;
                        this.grid[positions.next.row][positions.next.col] = {
                            value: mergedValue,
                            isNew: false,
                            isMerged: true,
                            fromRow: row,
                            fromCol: col
                        };
                        this.grid[row][col] = null;
                        this.score += mergedValue;

                        if (mergedValue === WIN_VALUE && !this.keepPlaying) {
                            this.won = true;
                        }

                        moved = true;
                    } else if (positions.farthest.row !== row || positions.farthest.col !== col) {
                        this.grid[positions.farthest.row][positions.farthest.col] = {
                            ...tile,
                            fromRow: row,
                            fromCol: col
                        };
                        this.grid[row][col] = null;
                        moved = true;
                    }
                }
            });
        });

        if (moved) {
            this.saveBestScore();
        }

        return moved;
    }

    prepareTilesForMove() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].fromRow = row;
                    this.grid[row][col].fromCol = col;
                }
            }
        }
    }

    clearTileFlags() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].isNew = false;
                    this.grid[row][col].isMerged = false;
                }
            }
        }
    }

    getVectors() {
        return {
            up: { row: -1, col: 0 },
            down: { row: 1, col: 0 },
            left: { row: 0, col: -1 },
            right: { row: 0, col: 1 }
        };
    }

    buildTraversals(vector) {
        const traversals = { rows: [], cols: [] };

        for (let i = 0; i < GRID_SIZE; i++) {
            traversals.rows.push(i);
            traversals.cols.push(i);
        }

        if (vector.row === 1) traversals.rows.reverse();
        if (vector.col === 1) traversals.cols.reverse();

        return traversals;
    }

    findFarthestPosition(cell, vector) {
        let previous;

        do {
            previous = cell;
            cell = { row: previous.row + vector.row, col: previous.col + vector.col };
        } while (this.withinBounds(cell) && this.grid[cell.row][cell.col] === null);

        return {
            farthest: previous,
            next: cell
        };
    }

    withinBounds(cell) {
        return cell.row >= 0 && cell.row < GRID_SIZE &&
               cell.col >= 0 && cell.col < GRID_SIZE;
    }

    canMove() {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (this.grid[row][col] === null) return true;
            }
        }

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const tile = this.grid[row][col];
                if (tile) {
                    if (col + 1 < GRID_SIZE && this.grid[row][col + 1]?.value === tile.value) return true;
                    if (row + 1 < GRID_SIZE && this.grid[row + 1][col]?.value === tile.value) return true;
                }
            }
        }

        return false;
    }

    isGameOver() {
        return !this.canMove();
    }

    hasWon() {
        return this.won && !this.keepPlaying;
    }

    continueGame() {
        this.keepPlaying = true;
        this.won = false;
    }

    getGrid() {
        return this.grid;
    }

    getScore() {
        return this.score;
    }

    getBestScore() {
        return this.bestScore;
    }
}
