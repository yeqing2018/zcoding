const GAME = (function() {
    let canvas, ctx;
    let currentHoleIndex = 0;
    let currentHole = null;
    let currentCourse = null;
    let ball = null;
    let gameState = 'menu';
    let gameMode = 'single';
    let strokes = [];
    let currentStrokes = 0;
    let aimStart = null;
    let aimEnd = null;
    let isAiming = false;
    let holeCompleteAnimation = 0;
    let trajectoryPoints = [];
    let selectedClub = null;
    let aiPlayers = [];
    let currentPlayerTurn = 0;
    let currentRound = 1;
    let totalRounds = 1;
    let replayCanvas, replayCtx;
    let selectedCourseId = 'parkland';
    let selectedDifficulty = 'amateur';
    let lastShotAnalysis = null;

    const elements = {};

    function init() {
        try {
            canvas = document.getElementById('game-canvas');
            replayCanvas = document.getElementById('replay-canvas');
            if (!canvas || !replayCanvas) {
                console.error('核心Canvas元素缺失');
                alert('游戏初始化失败：核心元素缺失，请刷新页面');
                return;
            }
            replayCtx = replayCanvas.getContext('2d');
            RENDERER.init(canvas);
            
            cacheElements();
            
            const statsModalElements = [
                'power-bar-fill', 'power-value',
                'accuracy-bar-fill', 'accuracy-value',
                'mental-bar-fill', 'mental-value',
                'available-points', 'stats-modal'
            ];
            if (!validateElements(statsModalElements)) {
                console.warn('部分DOM元素缺失，部分功能可能受限');
            }
            
            bindEvents();
            initializeStartScreen();
            updatePlayerUI();
            updateClubUI();
            
            console.log('游戏初始化完成');
            gameLoop();
        } catch (error) {
            console.error('游戏初始化失败:', error);
            alert('游戏初始化失败，请刷新页面重试');
        }
    }

    function cacheElements() {
        elements.startScreen = document.getElementById('start-screen');
        elements.startBtn = document.getElementById('start-btn');
        elements.holeComplete = document.getElementById('hole-complete');
        elements.holeResultTitle = document.getElementById('hole-result-title');
        elements.holeResultText = document.getElementById('hole-result-text');
        elements.continueBtn = document.getElementById('continue-btn');
        elements.gameComplete = document.getElementById('game-complete');
        elements.finalResults = document.getElementById('final-results');
        elements.restartBtn = document.getElementById('restart-btn');
        elements.mainMenuBtn = document.getElementById('main-menu-btn');
        elements.nextHoleBtn = document.getElementById('next-hole-btn');
        elements.currentHole = document.getElementById('current-hole');
        elements.par = document.getElementById('par');
        elements.strokes = document.getElementById('strokes');
        elements.totalStrokes = document.getElementById('total-strokes');
        elements.powerFill = document.getElementById('power-fill');
        elements.scoreList = document.getElementById('score-list');
        elements.totalPar = document.getElementById('total-par');
        elements.yourTotal = document.getElementById('your-total');
        elements.scoreDiff = document.getElementById('score-diff');
        elements.courseName = document.getElementById('course-name');
        elements.clubList = document.getElementById('club-list');
        elements.selectedClubName = document.getElementById('selected-club-name');
        elements.clubDistance = document.getElementById('club-distance');
        elements.clubAccuracy = document.getElementById('club-accuracy');
        elements.playerName = document.getElementById('player-name');
        elements.playerLevel = document.getElementById('player-level');
        elements.expFill = document.getElementById('exp-fill');
        elements.expText = document.getElementById('exp-text');
        elements.statPower = document.getElementById('stat-power');
        elements.statAccuracy = document.getElementById('stat-accuracy');
        elements.statMental = document.getElementById('stat-mental');
        elements.attrPoints = document.getElementById('attr-points');
        elements.attrPointsValue = document.getElementById('attr-points-value');
        elements.windArrow = document.getElementById('wind-arrow');
        elements.windSpeed = document.getElementById('wind-speed');
        elements.windDirection = document.getElementById('wind-direction');
        elements.aiPanel = document.getElementById('ai-panel');
        elements.aiList = document.getElementById('ai-list');
        elements.replayBtn = document.getElementById('replay-btn');
        elements.statsBtn = document.getElementById('stats-btn');
        elements.replayModal = document.getElementById('replay-modal');
        elements.playReplayBtn = document.getElementById('play-replay-btn');
        elements.pauseReplayBtn = document.getElementById('pause-replay-btn');
        elements.rewindReplayBtn = document.getElementById('rewind-replay-btn');
        elements.replaySlider = document.getElementById('replay-slider');
        elements.closeReplayBtn = document.getElementById('close-replay-btn');
        elements.trajectoryAnalysis = document.getElementById('trajectory-analysis');
        elements.statsModal = document.getElementById('stats-modal');
        elements.closeStatsBtn = document.getElementById('close-stats-btn');
        elements.availablePoints = document.getElementById('available-points');
        elements.powerBarFill = document.getElementById('power-bar-fill');
        elements.powerValue = document.getElementById('power-value');
        elements.accuracyBarFill = document.getElementById('accuracy-bar-fill');
        elements.accuracyValue = document.getElementById('accuracy-value');
        elements.mentalBarFill = document.getElementById('mental-bar-fill');
        elements.mentalValue = document.getElementById('mental-value');
        elements.shotAnalysis = document.getElementById('shot-analysis');
        elements.replayShotBtn = document.getElementById('replay-shot-btn');
        elements.leaderboard = document.getElementById('leaderboard');
        elements.courseButtons = document.getElementById('course-buttons');
        elements.difficultySelection = document.getElementById('difficulty-selection');
        elements.difficultyButtons = document.getElementById('difficulty-buttons');
    }

    function safeSetStyle(element, property, value) {
        if (element && element.style) {
            element.style[property] = value;
        } else {
            console.warn('安全警告：尝试设置样式的元素不存在', { element, property, value });
        }
    }

    function safeSetText(element, text) {
        if (element) {
            element.textContent = text;
        } else {
            console.warn('安全警告：尝试设置文本的元素不存在', { element, text });
        }
    }

    function safeRemoveClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        } else {
            console.warn('安全警告：尝试移除类名的元素不存在', { element, className });
        }
    }

    function safeAddClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        } else {
            console.warn('安全警告：尝试添加类名的元素不存在', { element, className });
        }
    }

    function validateElements(elementIds) {
        const missing = [];
        elementIds.forEach(id => {
            if (!document.getElementById(id)) {
                missing.push(id);
            }
        });
        if (missing.length > 0) {
            console.error('以下DOM元素缺失:', missing);
        }
        return missing.length === 0;
    }

    function bindEvents() {
        elements.startBtn.addEventListener('click', startGame);
        elements.continueBtn.addEventListener('click', continueGame);
        elements.restartBtn.addEventListener('click', restartGame);
        elements.mainMenuBtn.addEventListener('click', returnToMenu);
        elements.nextHoleBtn.addEventListener('click', nextHole);
        elements.replayBtn.addEventListener('click', showReplayModal);
        elements.statsBtn.addEventListener('click', showStatsModal);
        elements.closeReplayBtn.addEventListener('click', hideReplayModal);
        elements.closeStatsBtn.addEventListener('click', hideStatsModal);
        elements.playReplayBtn.addEventListener('click', playReplay);
        elements.pauseReplayBtn.addEventListener('click', pauseReplay);
        elements.rewindReplayBtn.addEventListener('click', rewindReplay);
        elements.replaySlider.addEventListener('input', seekReplay);
        elements.replayShotBtn.addEventListener('click', () => {
            elements.holeComplete.classList.add('hidden');
            showReplayModal();
        });

        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => upgradeAttribute(btn.dataset.stat));
        });

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    }

    function initializeStartScreen() {
        const courseTypes = COURSES.getCourseTypes();
        elements.courseButtons.innerHTML = '';
        courseTypes.forEach((course, index) => {
            const btn = document.createElement('button');
            btn.className = `course-btn ${index === 0 ? 'active' : ''}`;
            btn.dataset.courseId = course.id;
            btn.innerHTML = `
                <div class="course-btn-name">${course.name}</div>
                <div class="course-btn-desc">${course.description}</div>
            `;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.course-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedCourseId = course.id;
            });
            elements.courseButtons.appendChild(btn);
        });

        const difficulties = AI.getDifficultyLevels();
        elements.difficultyButtons.innerHTML = '';
        difficulties.forEach((diff, index) => {
            const btn = document.createElement('button');
            btn.className = `difficulty-btn ${index === 1 ? 'active' : ''}`;
            btn.dataset.difficulty = diff.id;
            btn.textContent = diff.name;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedDifficulty = diff.id;
            });
            elements.difficultyButtons.appendChild(btn);
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameMode = btn.dataset.mode;
                
                if (gameMode === 'ai' || gameMode === 'tournament') {
                    elements.difficultySelection.style.display = 'block';
                } else {
                    elements.difficultySelection.style.display = 'none';
                }
            });
        });
    }

    function updatePlayerUI() {
        const player = PLAYER.getPlayer();
        elements.playerName.textContent = player.name;
        elements.playerLevel.textContent = player.level;
        elements.expFill.style.width = `${(player.experience / player.experienceToNext) * 100}%`;
        elements.expText.textContent = `${player.experience}/${player.experienceToNext}`;
        elements.statPower.textContent = player.stats.power;
        elements.statAccuracy.textContent = player.stats.accuracy;
        elements.statMental.textContent = player.stats.mental;
        
        if (player.attributePoints > 0) {
            elements.attrPoints.style.display = 'block';
            elements.attrPointsValue.textContent = player.attributePoints;
        } else {
            elements.attrPoints.style.display = 'none';
        }
    }

    function updateClubUI() {
        const clubs = CLUBS.getAllClubs();
        elements.clubList.innerHTML = '';
        clubs.forEach((club, index) => {
            const btn = document.createElement('button');
            btn.className = `club-btn type-${club.type} ${index === 0 ? 'active' : ''}`;
            btn.textContent = club.shortName;
            btn.title = club.description;
            btn.addEventListener('click', () => selectClub(club.id));
            elements.clubList.appendChild(btn);
        });
        selectedClub = clubs[0];
        updateClubInfo();
    }

    function selectClub(clubId) {
        selectedClub = CLUBS.getClub(clubId);
        document.querySelectorAll('.club-btn').forEach((btn, index) => {
            const clubs = CLUBS.getAllClubs();
            btn.classList.toggle('active', clubs[index].id === clubId);
        });
        updateClubInfo();
    }

    function updateClubInfo() {
        if (selectedClub) {
            elements.selectedClubName.textContent = selectedClub.name;
            elements.clubDistance.textContent = Math.round((selectedClub.minDistance + selectedClub.maxDistance) / 2);
            elements.clubAccuracy.textContent = Math.round(selectedClub.accuracy * 100);
        }
    }

    function updateWindUI() {
        if (currentCourse && currentCourse.wind) {
            const wind = currentCourse.wind;
            elements.windArrow.style.transform = `rotate(${wind.direction}rad)`;
            elements.windSpeed.textContent = wind.speed.toFixed(1);
            
            const directions = ['东风', '东南风', '南风', '西南风', '西风', '西北风', '北风', '东北风'];
            const index = Math.round(((wind.direction % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 4)) % 8;
            elements.windDirection.textContent = directions[index];
        }
    }

    function updateAIUI() {
        if (gameMode === 'ai' || gameMode === 'tournament') {
            elements.aiPanel.style.display = 'block';
            elements.aiList.innerHTML = '';
            
            aiPlayers.forEach((ai, index) => {
                const div = document.createElement('div');
                div.className = `ai-player ${currentPlayerTurn === index + 1 ? 'current' : ''}`;
                
                const aiStrokes = strokes.filter(s => s !== null).reduce((sum, s) => sum + s, 0);
                const totalPar = getTotalParForCompletedHoles();
                const diff = aiStrokes - totalPar;
                
                div.innerHTML = `
                    <span class="ai-name">${ai.name}</span>
                    <span class="ai-score ${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}">
                        ${diff >= 0 ? '+' : ''}${diff}
                    </span>
                `;
                elements.aiList.appendChild(div);
            });
        } else {
            elements.aiPanel.style.display = 'none';
        }
    }

    function getTotalParForCompletedHoles() {
        if (!currentCourse) return 0;
        return currentCourse.holes.slice(0, currentHoleIndex).reduce((sum, h) => sum + h.par, 0);
    }

    function startGame() {
        elements.startScreen.classList.add('hidden');
        currentCourse = COURSES.getCourse(selectedCourseId);
        currentHoleIndex = 0;
        currentRound = 1;
        strokes = new Array(currentCourse.holes.length).fill(null);
        
        if (gameMode === 'tournament') {
            totalRounds = 4;
        } else {
            totalRounds = 1;
        }
        
        if (gameMode === 'ai' || gameMode === 'tournament') {
            setupAIPlayers();
        }
        
        loadHole(currentHoleIndex);
        gameState = 'aiming';
    }

    function setupAIPlayers() {
        aiPlayers = [];
        const aiNames = ['李明', '王强', '张华', '刘洋'];
        const numAI = gameMode === 'tournament' ? 3 : 1;
        
        for (let i = 0; i < numAI; i++) {
            const difficulty = i === 0 ? selectedDifficulty : 
                ['beginner', 'amateur', 'pro'][Math.min(i, 2)];
            aiPlayers.push(AI.createAIPlayer(difficulty, aiNames[i]));
        }
    }

    function loadHole(index) {
        currentHole = currentCourse.holes[index % currentCourse.holes.length];
        ball = PHYSICS.createBall(currentHole.tee.x, currentHole.tee.y);
        currentStrokes = 0;
        currentPlayerTurn = 0;
        gameState = 'aiming';
        holeCompleteAnimation = 0;
        trajectoryPoints = [];
        
        PHYSICS.setWind(currentCourse.wind.speed, currentCourse.wind.direction);
        
        const recommendedClub = CLUBS.getRecommendedClub(ball, currentHole);
        if (recommendedClub) {
            selectClub(recommendedClub.id);
        }
        
        updateUI();
        updateWindUI();
        updateScoreboard();
        updateAIUI();
        REPLAY.startRecording();
    }

    function updateUI() {
        elements.courseName.textContent = currentCourse.name;
        elements.currentHole.textContent = currentHole.id;
        elements.par.textContent = currentHole.par;
        elements.strokes.textContent = currentStrokes;
        elements.totalStrokes.textContent = getTotalStrokes();
        elements.nextHoleBtn.classList.add('hidden');
    }

    function getTotalStrokes() {
        return strokes.filter(s => s !== null).reduce((sum, s) => sum + s, 0) + currentStrokes;
    }

    function getTotalPar() {
        return currentCourse.holes.reduce((sum, hole) => sum + hole.par, 0);
    }

    function updateScoreboard() {
        elements.scoreList.innerHTML = '';
        
        currentCourse.holes.forEach((hole, index) => {
            const row = document.createElement('div');
            row.className = 'score-row';
            
            if (index < currentHoleIndex) {
                row.classList.add('completed');
            } else if (index === currentHoleIndex) {
                row.classList.add('current');
            }
            
            const holeNum = document.createElement('span');
            holeNum.className = 'hole-num';
            holeNum.textContent = `H${hole.id}`;
            
            const par = document.createElement('span');
            par.className = 'par';
            par.textContent = `Par ${hole.par}`;
            
            const strokeSpan = document.createElement('span');
            strokeSpan.className = 'strokes';
            
            if (strokes[index] !== null) {
                strokeSpan.textContent = strokes[index];
                const diff = strokes[index] - hole.par;
                if (diff < 0) {
                    strokeSpan.classList.add('below');
                } else if (diff > 0) {
                    strokeSpan.classList.add('above');
                }
            } else if (index === currentHoleIndex) {
                strokeSpan.textContent = currentStrokes || '-';
            } else {
                strokeSpan.textContent = '-';
            }
            
            row.appendChild(holeNum);
            row.appendChild(par);
            row.appendChild(strokeSpan);
            elements.scoreList.appendChild(row);
        });
        
        const totalPar = getTotalPar();
        const totalStrokes = getTotalStrokes();
        const diff = totalStrokes - totalPar;
        
        elements.totalPar.textContent = totalPar;
        elements.yourTotal.textContent = totalStrokes;
        elements.scoreDiff.textContent = diff >= 0 ? `+${diff}` : diff;
        elements.scoreDiff.className = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : '');
    }

    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const scale = RENDERER.getScale();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        return {
            x: (clientX - rect.left) / scale,
            y: (clientY - rect.top) / scale
        };
    }

    function onMouseDown(e) {
        if (gameState !== 'aiming' || ball.isFlying || ball.isRolling || currentPlayerTurn !== 0) return;
        isAiming = true;
        aimStart = getCanvasCoords(e);
        aimEnd = { ...aimStart };
    }

    function onMouseMove(e) {
        if (!isAiming || gameState !== 'aiming') return;
        aimEnd = getCanvasCoords(e);
        updatePowerMeter();
        updateTrajectoryPrediction();
    }

    function onMouseUp(e) {
        if (!isAiming || gameState !== 'aiming') return;
        isAiming = false;
        
        if (aimStart && aimEnd) {
            const dx = aimStart.x - aimEnd.x;
            const dy = aimStart.y - aimEnd.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const power = Math.min(distance / 2, 100);
                const angle = Math.atan2(dy, dx);
                
                const playerStats = PLAYER.getPlayer().stats;
                const accuracyBonus = playerStats.accuracy * 0.005;
                const mentalBonus = playerStats.mental * 0.003;
                const finalPower = Math.max(10, Math.min(100, power * (1 + accuracyBonus + mentalBonus)));
                
                PHYSICS.hitBall(ball, finalPower, angle, selectedClub, playerStats);
                currentStrokes++;
                gameState = 'playing';
                updateUI();
                
                REPLAY.startRecording();
                REPLAY.recordFrame({
                    ball: { ...ball },
                    club: selectedClub,
                    power: finalPower,
                    angle: angle,
                    targetX: currentHole.cup.x,
                    targetY: currentHole.cup.y
                });
            }
        }
        
        aimStart = null;
        aimEnd = null;
        trajectoryPoints = [];
        elements.powerFill.style.width = '0%';
    }

    function onTouchStart(e) {
        e.preventDefault();
        onMouseDown(e);
    }

    function onTouchMove(e) {
        e.preventDefault();
        onMouseMove(e);
    }

    function onTouchEnd(e) {
        e.preventDefault();
        onMouseUp(e);
    }

    function updatePowerMeter() {
        if (!aimStart || !aimEnd) return;
        const dx = aimStart.x - aimEnd.x;
        const dy = aimStart.y - aimEnd.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min((distance / 200) * 100, 100);
        elements.powerFill.style.width = power + '%';
    }

    function updateTrajectoryPrediction() {
        if (!aimStart || !aimEnd || !selectedClub) return;
        
        const dx = aimStart.x - aimEnd.x;
        const dy = aimStart.y - aimEnd.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const power = Math.min(distance / 2, 100);
        const angle = Math.atan2(dy, dx);
        
        const playerStats = PLAYER.getPlayer().stats;
        trajectoryPoints = PHYSICS.predictTrajectory(ball, power, angle, selectedClub, currentHole, playerStats);
    }

    function update() {
        if (gameState === 'menu') return;
        
        if (gameState === 'playing') {
            PHYSICS.updateBall(ball, currentHole);
            
            REPLAY.recordFrame({
                ball: { ...ball },
                club: selectedClub
            });
            
            if (ball.inHole) {
                onHoleComplete();
            } else if (!ball.isFlying && !ball.isRolling) {
                if (currentPlayerTurn === 0 && (gameMode === 'ai' || gameMode === 'tournament')) {
                    processAITurn();
                } else {
                    gameState = 'aiming';
                }
            }
        } else if (gameState === 'holeComplete') {
            holeCompleteAnimation += 0.02;
            if (holeCompleteAnimation > 1.5) {
                showHoleComplete();
            }
        }
    }

    function processAITurn() {
        currentPlayerTurn++;
        
        if (currentPlayerTurn > aiPlayers.length) {
            gameState = 'aiming';
            currentPlayerTurn = 0;
            return;
        }
        
        const ai = aiPlayers[currentPlayerTurn - 1];
        gameState = 'aiPlaying';
        
        setTimeout(() => {
            const wind = PHYSICS.getWind();
            const aiBall = PHYSICS.createBall(currentHole.tee.x, currentHole.tee.y);
            const result = AI.simulateShot(ai, aiBall, currentHole, wind);
            
            ai.currentStrokes++;
            
            if (result.inHole) {
                setTimeout(() => {
                    processAITurn();
                }, 500);
            } else {
                gameState = 'aiming';
                currentPlayerTurn = 0;
            }
        }, 1000);
    }

    function onHoleComplete() {
        gameState = 'holeComplete';
        holeCompleteAnimation = 0;
        strokes[currentHoleIndex] = currentStrokes;
        
        PLAYER.recordHole(currentStrokes, currentHole.par);
        updatePlayerUI();
        
        lastShotAnalysis = REPLAY.analyzeShot();
        updateScoreboard();
    }

    function showHoleComplete() {
        const diff = currentStrokes - currentHole.par;
        let title, text;
        
        if (currentStrokes === 1) {
            title = '🏌️ 一杆进洞！';
            text = `太厉害了！你在第${currentHole.id}洞打出了一杆进洞！`;
        } else if (diff <= -3) {
            title = '🦅 信天翁！';
            text = `精彩！低于标准杆${Math.abs(diff)}杆完成！`;
        } else if (diff === -2) {
            title = '🦅 老鹰球！';
            text = '太棒了！低于标准杆2杆！';
        } else if (diff === -1) {
            title = '🐦 小鸟球！';
            text = '干得好！低于标准杆1杆！';
        } else if (diff === 0) {
            title = '✅ 标准杆';
            text = '不错的发挥，平标准杆完成！';
        } else if (diff === 1) {
            title = '⛳ 柏忌';
            text = '高于标准杆1杆，继续加油！';
        } else {
            title = '⛳ 完成';
            text = `高于标准杆${diff}杆完成。`;
        }
        
        elements.holeResultTitle.textContent = title;
        elements.holeResultText.textContent = text;
        
        if (lastShotAnalysis) {
            elements.shotAnalysis.innerHTML = `
                <div class="analysis-row"><span class="label">使用球杆</span><span class="value">${lastShotAnalysis.club?.name || '-'}</span></div>
                <div class="analysis-row"><span class="label">击球力度</span><span class="value">${Math.round(lastShotAnalysis.power)}%</span></div>
                <div class="analysis-row"><span class="label">飞行距离</span><span class="value">${lastShotAnalysis.flightDistance}码</span></div>
                <div class="analysis-row"><span class="label">滚动距离</span><span class="value">${lastShotAnalysis.rollDistance}码</span></div>
                <div class="analysis-row"><span class="label">总距离</span><span class="value">${lastShotAnalysis.totalDistance}码</span></div>
                <div class="analysis-row"><span class="label">最高高度</span><span class="value">${lastShotAnalysis.maxHeight}米</span></div>
            `;
        }
        
        if (currentHoleIndex < currentCourse.holes.length - 1) {
            elements.nextHoleBtn.classList.remove('hidden');
            elements.holeComplete.classList.remove('hidden');
        } else {
            if (currentRound < totalRounds) {
                currentRound++;
                currentHoleIndex = 0;
                COURSES.regenerateWind(selectedCourseId);
                loadHole(0);
            } else {
                showGameComplete();
            }
        }
    }

    function continueGame() {
        elements.holeComplete.classList.add('hidden');
        nextHole();
    }

    function nextHole() {
        currentHoleIndex++;
        COURSES.regenerateWind(selectedCourseId);
        loadHole(currentHoleIndex);
    }

    function showGameComplete() {
        const totalPar = getTotalPar();
        const totalStrokes = strokes.reduce((sum, s) => sum + s, 0);
        const diff = totalStrokes - totalPar;
        
        PLAYER.recordRound(selectedCourseId, totalStrokes, totalPar);
        updatePlayerUI();
        
        let resultText = '';
        if (diff < 0) {
            resultText = `🎉 太棒了！低于标准杆${Math.abs(diff)}杆！`;
        } else if (diff === 0) {
            resultText = '👍 不错！打出了标准杆的成绩！';
        } else if (diff <= 5) {
            resultText = `⛳ 高于标准杆${diff}杆，继续努力！`;
        } else {
            resultText = `💪 高于标准杆${diff}杆，多加练习！`;
        }
        
        let html = `
            <p style="font-size: 18px; margin-bottom: 20px;">${resultText}</p>
            <div class="final-score">
                <span>标准杆总计</span>
                <span>${totalPar}</span>
            </div>
            <div class="final-score">
                <span>您的总杆数</span>
                <span>${totalStrokes}</span>
            </div>
            <div class="final-score total">
                <span>成绩差</span>
                <span>${diff >= 0 ? '+' : ''}${diff}</span>
            </div>
        `;
        
        elements.finalResults.innerHTML = html;
        
        if (gameMode === 'ai' || gameMode === 'tournament') {
            showLeaderboard(totalStrokes, diff);
        }
        
        elements.gameComplete.classList.remove('hidden');
    }

    function showLeaderboard(playerScore, playerDiff) {
        const leaderboardData = [
            { name: '您', score: playerScore, diff: playerDiff, isPlayer: true },
            ...aiPlayers.map((ai, i) => ({
                name: ai.name,
                score: playerScore + Math.floor(Math.random() * 10) - 3,
                diff: playerDiff + Math.floor(Math.random() * 10) - 3,
                isPlayer: false
            }))
        ].sort((a, b) => a.score - b.score);
        
        let leaderboardHtml = '<div class="leaderboard-title">🏆 排行榜</div>';
        leaderboardHtml += '<div class="leaderboard-row header"><span class="rank">排名</span><span class="name">球员</span><span class="score">杆数</span><span class="diff">成绩</span></div>';
        
        leaderboardData.forEach((entry, index) => {
            leaderboardHtml += `
                <div class="leaderboard-row ${entry.isPlayer ? 'player' : ''}">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${entry.name}</span>
                    <span class="score">${entry.score}</span>
                    <span class="diff ${entry.diff > 0 ? 'positive' : entry.diff < 0 ? 'negative' : ''}">${entry.diff >= 0 ? '+' : ''}${entry.diff}</span>
                </div>
            `;
        });
        
        elements.leaderboard.innerHTML = leaderboardHtml;
    }

    function restartGame() {
        elements.gameComplete.classList.add('hidden');
        elements.holeComplete.classList.add('hidden');
        startGame();
    }

    function returnToMenu() {
        elements.gameComplete.classList.add('hidden');
        elements.startScreen.classList.remove('hidden');
        gameState = 'menu';
    }

    function showReplayModal() {
        elements.replayModal.classList.remove('hidden');
        drawReplayFrame(REPLAY.getCurrentFrame());
        
        const analysis = REPLAY.analyzeShot();
        if (analysis) {
            elements.trajectoryAnalysis.innerHTML = `
                <div class="analysis-row"><span class="label">使用球杆</span><span class="value">${analysis.club?.name || '-'}</span></div>
                <div class="analysis-row"><span class="label">击球力度</span><span class="value">${Math.round(analysis.power)}%</span></div>
                <div class="analysis-row"><span class="label">飞行距离</span><span class="value">${analysis.flightDistance}码</span></div>
                <div class="analysis-row"><span class="label">滚动距离</span><span class="value">${analysis.rollDistance}码</span></div>
                <div class="analysis-row"><span class="label">总距离</span><span class="value">${analysis.totalDistance}码</span></div>
                <div class="analysis-row"><span class="label">最高高度</span><span class="value">${analysis.maxHeight}米</span></div>
                ${analysis.landingAccuracy !== null ? `<div class="analysis-row"><span class="label">落点偏差</span><span class="value">${analysis.landingAccuracy}码</span></div>` : ''}
            `;
        }
    }

    function hideReplayModal() {
        elements.replayModal.classList.add('hidden');
        REPLAY.stop();
    }

    function playReplay() {
        REPLAY.setOnUpdate((frame, index, total) => {
            drawReplayFrame(frame);
            elements.replaySlider.value = (index / total) * 100;
        });
        REPLAY.setOnComplete(() => {
            console.log('回放完成');
        });
        REPLAY.play(2);
    }

    function pauseReplay() {
        REPLAY.pause();
    }

    function rewindReplay() {
        REPLAY.seek(0);
        drawReplayFrame(REPLAY.getCurrentFrame());
        elements.replaySlider.value = 0;
    }

    function seekReplay(e) {
        const index = Math.floor((e.target.value / 100) * (REPLAY.getTotalFrames() - 1));
        REPLAY.seek(index);
        drawReplayFrame(REPLAY.getCurrentFrame());
    }

    function drawReplayFrame(frame) {
        if (!frame || !frame.ball) return;
        
        replayCtx.clearRect(0, 0, replayCanvas.width, replayCanvas.height);
        
        const scale = replayCanvas.width / COURSES.CANVAS_WIDTH;
        
        replayCtx.fillStyle = '#4caf50';
        replayCtx.fillRect(0, 0, replayCanvas.width, replayCanvas.height);
        
        if (currentHole) {
            replayCtx.fillStyle = '#8bc34a';
            replayCtx.beginPath();
            replayCtx.arc(currentHole.cup.x * scale, currentHole.cup.y * scale, 50 * scale, 0, Math.PI * 2);
            replayCtx.fill();
            
            replayCtx.fillStyle = '#212121';
            replayCtx.beginPath();
            replayCtx.arc(currentHole.cup.x * scale, currentHole.cup.y * scale, PHYSICS.CUP_RADIUS * scale, 0, Math.PI * 2);
            replayCtx.fill();
            
            replayCtx.fillStyle = '#8d6e63';
            replayCtx.fillRect(
                (currentHole.tee.x - 12) * scale, 
                (currentHole.tee.y - 12) * scale, 
                25 * scale, 
                25 * scale
            );
        }
        
        const x = frame.ball.x * scale;
        const y = frame.ball.y * scale - (frame.ball.z || 0) * scale * 0.5;
        const r = PHYSICS.BALL_RADIUS * scale;
        
        replayCtx.beginPath();
        replayCtx.arc(x, y, r, 0, Math.PI * 2);
        replayCtx.fillStyle = '#ffffff';
        replayCtx.fill();
        replayCtx.strokeStyle = '#bdbdbd';
        replayCtx.lineWidth = 1;
        replayCtx.stroke();
    }

    function showStatsModal() {
        try {
            const player = PLAYER.getPlayer();
            if (!player) {
                console.error('球员数据加载失败');
                return;
            }

            const requiredElements = [
                elements.powerBarFill, elements.powerValue,
                elements.accuracyBarFill, elements.accuracyValue,
                elements.mentalBarFill, elements.mentalValue,
                elements.availablePoints, elements.statsModal
            ];
            
            const missingElements = requiredElements.filter(el => !el);
            if (missingElements.length > 0) {
                console.error('球员属性模态框缺少必要的DOM元素');
                alert('页面元素加载不完整，请刷新页面重试');
                return;
            }

            safeSetStyle(elements.powerBarFill, 'width', `${(player.stats.power / 20) * 100}%`);
            safeSetText(elements.powerValue, `${player.stats.power}/20`);
            safeSetStyle(elements.accuracyBarFill, 'width', `${(player.stats.accuracy / 20) * 100}%`);
            safeSetText(elements.accuracyValue, `${player.stats.accuracy}/20`);
            safeSetStyle(elements.mentalBarFill, 'width', `${(player.stats.mental / 20) * 100}%`);
            safeSetText(elements.mentalValue, `${player.stats.mental}/20`);
            safeSetText(elements.availablePoints, player.attributePoints);
            
            const upgradeBtns = document.querySelectorAll('.upgrade-btn');
            upgradeBtns.forEach(btn => {
                btn.disabled = player.attributePoints <= 0;
            });
            
            safeRemoveClass(elements.statsModal, 'hidden');
        } catch (error) {
            console.error('显示球员属性模态框时发生错误:', error);
            alert('显示球员属性时发生错误，请刷新页面重试');
        }
    }

    function hideStatsModal() {
        try {
            safeAddClass(elements.statsModal, 'hidden');
        } catch (error) {
            console.error('隐藏球员属性模态框时发生错误:', error);
        }
    }

    function upgradeAttribute(stat) {
        try {
            const success = PLAYER.upgradeAttribute(stat);
            if (success) {
                showStatsModal();
                updatePlayerUI();
            }
        } catch (error) {
            console.error('升级属性时发生错误:', error);
            alert('升级属性失败，请刷新页面重试');
        }
    }

    function render() {
        RENDERER.clear();
        
        if (currentHole && currentCourse) {
            RENDERER.setCourseType(currentCourse.type);
            RENDERER.drawCourse(currentHole);
            
            RENDERER.drawWind(currentCourse.wind);
            RENDERER.drawGrassIndicator(ball?.grassType || 'FAIRWAY');
            
            if (isAiming && aimStart && aimEnd && trajectoryPoints.length > 0) {
                RENDERER.drawTrajectory(trajectoryPoints);
            }
            
            if (isAiming && aimStart && aimEnd) {
                const dx = aimStart.x - aimEnd.x;
                const dy = aimStart.y - aimEnd.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const power = Math.min(distance / 200, 1);
                
                RENDERER.drawAimLine(ball.x, ball.y, aimStart.x + dx * 2, aimStart.y + dy * 2, power);
            }
            
            if (ball) {
                RENDERER.drawBall(ball);
            }
            
            if (gameState === 'holeComplete') {
                RENDERER.drawHoleCompleteAnimation(currentHole, holeCompleteAnimation);
            }
        }
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    window.addEventListener('load', init);

    return {
        init,
        restartGame
    };
})();
