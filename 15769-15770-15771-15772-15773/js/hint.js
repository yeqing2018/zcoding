const GRID_SIZE = 4;
const DIRECTIONS = ['up', 'down', 'left', 'right'];
const MAX_DEPTH = 3;

export class HintAI {
    constructor() {
        this.weights = {
            smoothness: 0.1,
            monotonicity: 1.0,
            maxValue: 1.0,
            emptyCells: 2.7,
            merges: 0.5
        };
    }

    cloneGrid(grid) {
        const newGrid = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            newGrid[row] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col]) {
                    newGrid[row][col] = { ...grid[row][col] };
                } else {
                    newGrid[row][col] = null;
                }
            }
        }
        return newGrid;
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

    withinBounds(cell) {
        return cell.row >= 0 && cell.row < GRID_SIZE &&
               cell.col >= 0 && cell.col < GRID_SIZE;
    }

    findFarthestPosition(grid, cell, vector) {
        let previous;
        do {
            previous = cell;
            cell = { row: previous.row + vector.row, col: previous.col + vector.col };
        } while (this.withinBounds(cell) && grid[cell.row][cell.col] === null);
        return { farthest: previous, next: cell };
    }

    simulateMove(grid, direction) {
        const vectors = this.getVectors();
        const vector = vectors[direction];
        const traversals = this.buildTraversals(vector);
        let moved = false;
        let score = 0;
        const newGrid = this.cloneGrid(grid);

        traversals.rows.forEach(row => {
            traversals.cols.forEach(col => {
                const tile = newGrid[row][col];
                if (tile) {
                    const positions = this.findFarthestPosition(newGrid, { row, col }, vector);
                    const next = newGrid[positions.next.row]?.[positions.next.col];

                    if (next && next.value === tile.value && !next.isMerged) {
                        const mergedValue = tile.value * 2;
                        newGrid[positions.next.row][positions.next.col] = {
                            value: mergedValue,
                            isMerged: true
                        };
                        newGrid[row][col] = null;
                        score += mergedValue;
                        moved = true;
                    } else if (positions.farthest.row !== row || positions.farthest.col !== col) {
                        newGrid[positions.farthest.row][positions.farthest.col] = { value: tile.value };
                        newGrid[row][col] = null;
                        moved = true;
                    }
                }
            });
        });

        return { grid: newGrid, moved, score };
    }

    getEmptyCells(grid) {
        const empty = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === null) {
                    empty.push({ row, col });
                }
            }
        }
        return empty;
    }

    getMaxValue(grid) {
        let max = 0;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col]) {
                    max = Math.max(max, grid[row][col].value);
                }
            }
        }
        return max;
    }

    getSmoothness(grid) {
        let smoothness = 0;
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const tile = grid[row][col];
                if (tile) {
                    if (col + 1 < GRID_SIZE && grid[row][col + 1]) {
                        smoothness -= Math.abs(Math.log2(tile.value) - Math.log2(grid[row][col + 1].value));
                    }
                    if (row + 1 < GRID_SIZE && grid[row + 1][col]) {
                        smoothness -= Math.abs(Math.log2(tile.value) - Math.log2(grid[row + 1][col].value));
                    }
                }
            }
        }
        return smoothness;
    }

    getMonotonicity(grid) {
        let up = 0, down = 0, left = 0, right = 0;

        for (let row = 0; row < GRID_SIZE; row++) {
            let current = 0;
            let next = current + 1;
            while (next < GRID_SIZE) {
                while (next < GRID_SIZE && grid[row][next] === null) next++;
                if (next >= GRID_SIZE) next = GRID_SIZE - 1;

                const currentValue = grid[row][current] ? Math.log2(grid[row][current].value) : 0;
                const nextValue = grid[row][next] ? Math.log2(grid[row][next].value) : 0;

                if (currentValue > nextValue) {
                    left += nextValue - currentValue;
                } else if (nextValue > currentValue) {
                    right += currentValue - nextValue;
                }

                current = next;
                next++;
            }
        }

        for (let col = 0; col < GRID_SIZE; col++) {
            let current = 0;
            let next = current + 1;
            while (next < GRID_SIZE) {
                while (next < GRID_SIZE && grid[next][col] === null) next++;
                if (next >= GRID_SIZE) next = GRID_SIZE - 1;

                const currentValue = grid[current][col] ? Math.log2(grid[current][col].value) : 0;
                const nextValue = grid[next][col] ? Math.log2(grid[next][col].value) : 0;

                if (currentValue > nextValue) {
                    up += nextValue - currentValue;
                } else if (nextValue > currentValue) {
                    down += currentValue - nextValue;
                }

                current = next;
                next++;
            }
        }

        return Math.max(left, right) + Math.max(up, down);
    }

    evaluate(grid) {
        const emptyCells = this.getEmptyCells(grid);
        const maxValue = this.getMaxValue(grid);
        const smoothness = this.getSmoothness(grid);
        const monotonicity = this.getMonotonicity(grid);

        let score = 0;
        score += this.weights.smoothness * smoothness;
        score += this.weights.monotonicity * monotonicity;
        score += this.weights.maxValue * maxValue;
        score += this.weights.emptyCells * (emptyCells.length ? Math.log(emptyCells.length) : 0);

        return score;
    }

    canMove(grid) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (grid[row][col] === null) return true;
            }
        }

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const tile = grid[row][col];
                if (tile) {
                    if (col + 1 < GRID_SIZE && grid[row][col + 1]?.value === tile.value) return true;
                    if (row + 1 < GRID_SIZE && grid[row + 1][col]?.value === tile.value) return true;
                }
            }
        }

        return false;
    }

    expectimax(grid, depth, isPlayerTurn) {
        if (depth === 0 || !this.canMove(grid)) {
            return this.evaluate(grid);
        }

        if (isPlayerTurn) {
            let maxScore = -Infinity;

            for (const direction of DIRECTIONS) {
                const result = this.simulateMove(grid, direction);
                if (result.moved) {
                    const score = this.expectimax(result.grid, depth - 1, false);
                    maxScore = Math.max(maxScore, score);
                }
            }

            return maxScore;
        } else {
            const emptyCells = this.getEmptyCells(grid);
            if (emptyCells.length === 0) return this.evaluate(grid);

            let totalScore = 0;
            let totalWeight = 0;

            for (const cell of emptyCells) {
                for (const [value, prob] of [[2, 0.9], [4, 0.1]]) {
                    const newGrid = this.cloneGrid(grid);
                    newGrid[cell.row][cell.col] = { value };
                    const score = this.expectimax(newGrid, depth - 1, true);
                    totalScore += score * prob;
                    totalWeight += prob;
                }
            }

            return totalScore / totalWeight;
        }
    }

    getBestMove(grid) {
        const startTime = performance.now();
        let bestDirection = null;
        let bestScore = -Infinity;

        for (const direction of DIRECTIONS) {
            const result = this.simulateMove(grid, direction);
            if (result.moved) {
                const score = this.expectimax(result.grid, MAX_DEPTH, false);
                if (score > bestScore) {
                    bestScore = score;
                    bestDirection = direction;
                }
            }
        }

        const elapsed = performance.now() - startTime;
        console.log(`AI 提示计算耗时: ${elapsed.toFixed(2)}ms`);

        return bestDirection;
    }
}
