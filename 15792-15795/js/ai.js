const GomokuAI = (function() {
    const directions = [
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 }
    ];

    const SCORES = {
        FIVE: 1000000,
        OPEN_FOUR: 100000,
        BROKEN_FOUR: 10000,
        OPEN_THREE: 10000,
        BROKEN_THREE: 1000,
        OPEN_TWO: 1000,
        BROKEN_TWO: 100,
        OPEN_ONE: 100,
        BROKEN_ONE: 10
    };

    const DIFFICULTY = {
        easy: {
            searchDepth: 1,
            randomness: 0.4,
            considerMoves: 8
        },
        medium: {
            searchDepth: 2,
            randomness: 0.2,
            considerMoves: 12
        },
        hard: {
            searchDepth: 2,
            randomness: 0,
            considerMoves: 16
        }
    };

    function isValidPosition(board, row, col) {
        return row >= 0 && row < board.length && 
               col >= 0 && col < board[0].length;
    }

    function hasNeighbor(board, row, col, range) {
        for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                if (i === 0 && j === 0) continue;
                const r = row + i;
                const c = col + j;
                if (isValidPosition(board, r, c) && board[r][c] !== null) {
                    return true;
                }
            }
        }
        return false;
    }

    function getCandidateMoves(board, difficulty) {
        const moves = [];
        const boardSize = board.length;
        const config = DIFFICULTY[difficulty] || DIFFICULTY.medium;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === null && hasNeighbor(board, row, col, 2)) {
                    moves.push({ row, col });
                }
            }
        }

        if (moves.length === 0) {
            const center = Math.floor(boardSize / 2);
            moves.push({ row: center, col: center });
        }

        return moves;
    }

    function evaluateLine(board, row, col, dx, dy, player) {
        let count = 0;
        let open = 0;
        let r = row;
        let c = col;

        for (let i = 0; i < 5; i++) {
            r = row + i * dx;
            c = col + i * dy;
            if (!isValidPosition(board, r, c) || board[r][c] !== player) {
                break;
            }
            count++;
        }

        const checkOpen = (dr, dc) => {
            const r2 = row + (count * dr);
            const c2 = col + (count * dc);
            if (isValidPosition(board, r2, c2) && board[r2][c2] === null) {
                return 1;
            }
            return 0;
        };

        open += checkOpen(dx, dy);

        let blockCheck = 1;
        while (blockCheck <= 4) {
            const r3 = row - blockCheck * dx;
            const c3 = col - blockCheck * dy;
            if (!isValidPosition(board, r3, c3) || board[r3][c3] === null) {
                if (isValidPosition(board, r3, c3)) {
                    open++;
                }
                break;
            }
            if (board[r3][c3] !== player) {
                break;
            }
            count++;
            blockCheck++;
        }

        return { count, open };
    }

    function evaluatePosition(board, row, col, player) {
        let score = 0;

        for (const dir of directions) {
            const { count, open } = evaluateLine(board, row, col, dir.dx, dir.dy, player);
            
            if (count >= 5) {
                score += SCORES.FIVE;
            } else if (count === 4) {
                if (open >= 2) {
                    score += SCORES.OPEN_FOUR;
                } else if (open === 1) {
                    score += SCORES.BROKEN_FOUR;
                }
            } else if (count === 3) {
                if (open >= 2) {
                    score += SCORES.OPEN_THREE;
                } else if (open === 1) {
                    score += SCORES.BROKEN_THREE;
                }
            } else if (count === 2) {
                if (open >= 2) {
                    score += SCORES.OPEN_TWO;
                } else if (open === 1) {
                    score += SCORES.BROKEN_TWO;
                }
            } else if (count === 1) {
                if (open >= 2) {
                    score += SCORES.OPEN_ONE;
                } else if (open === 1) {
                    score += SCORES.BROKEN_ONE;
                }
            }
        }

        return score;
    }

    function evaluateBoard(board, aiPlayer, humanPlayer) {
        let score = 0;
        const boardSize = board.length;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] !== null) {
                    if (board[row][col] === aiPlayer) {
                        score += evaluatePosition(board, row, col, aiPlayer);
                    } else {
                        score -= evaluatePosition(board, row, col, humanPlayer) * 1.1;
                    }
                }
            }
        }

        return score;
    }

    function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer, difficulty) {
        const config = DIFFICULTY[difficulty] || DIFFICULTY.medium;
        
        if (depth === 0) {
            return evaluateBoard(board, aiPlayer, humanPlayer);
        }

        const candidates = getCandidateMoves(board, difficulty);
        
        if (candidates.length === 0) {
            return evaluateBoard(board, aiPlayer, humanPlayer);
        }

        candidates.sort((a, b) => {
            board[a.row][a.col] = isMaximizing ? aiPlayer : humanPlayer;
            const scoreA = evaluateBoard(board, aiPlayer, humanPlayer);
            board[a.row][a.col] = null;
            
            board[b.row][b.col] = isMaximizing ? aiPlayer : humanPlayer;
            const scoreB = evaluateBoard(board, aiPlayer, humanPlayer);
            board[b.row][b.col] = null;
            
            return isMaximizing ? scoreB - scoreA : scoreA - scoreB;
        });

        const considerCount = Math.min(candidates.length, config.considerMoves);
        const movesToConsider = candidates.slice(0, considerCount);

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of movesToConsider) {
                board[move.row][move.col] = aiPlayer;
                const score = minimax(board, depth - 1, alpha, beta, false, aiPlayer, humanPlayer, difficulty);
                board[move.row][move.col] = null;
                
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break;
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of movesToConsider) {
                board[move.row][move.col] = humanPlayer;
                const score = minimax(board, depth - 1, alpha, beta, true, aiPlayer, humanPlayer, difficulty);
                board[move.row][move.col] = null;
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break;
                }
            }
            return minScore;
        }
    }

    function copyBoard(board) {
        return board.map(row => [...row]);
    }

    function getBestMove(board, aiPlayer, humanPlayer, difficulty) {
        const config = DIFFICULTY[difficulty] || DIFFICULTY.medium;
        const candidates = getCandidateMoves(board, difficulty);
        
        if (candidates.length === 0) {
            const center = Math.floor(board.length / 2);
            return { row: center, col: center };
        }

        let bestMove = null;
        let bestScore = -Infinity;
        const moveScores = [];

        for (const move of candidates) {
            const tempBoard = copyBoard(board);
            tempBoard[move.row][move.col] = aiPlayer;
            
            const score = minimax(
                tempBoard, 
                config.searchDepth, 
                -Infinity, 
                Infinity, 
                false, 
                aiPlayer, 
                humanPlayer,
                difficulty
            );

            moveScores.push({ move, score });

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (config.randomness > 0 && moveScores.length > 1) {
            moveScores.sort((a, b) => b.score - a.score);
            const topCount = Math.min(moveScores.length, 3);
            if (Math.random() < config.randomness) {
                const randomIndex = Math.floor(Math.random() * topCount);
                return moveScores[randomIndex].move;
            }
        }

        return bestMove;
    }

    return {
        getBestMove,
        DIFFICULTY
    };
})();
