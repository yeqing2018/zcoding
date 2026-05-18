const REPLAY = (function() {
    let replayData = [];
    let currentReplayIndex = 0;
    let isPlaying = false;
    let playbackSpeed = 1;
    let onUpdateCallback = null;
    let onCompleteCallback = null;

    function startRecording() {
        replayData = [];
        currentReplayIndex = 0;
    }

    function recordFrame(data) {
        replayData.push({
            timestamp: Date.now(),
            ...data
        });
    }

    function getReplayData() {
        return [...replayData];
    }

    function loadReplay(data) {
        replayData = [...data];
        currentReplayIndex = 0;
    }

    function play(speed = 1) {
        if (replayData.length === 0) return false;
        isPlaying = true;
        playbackSpeed = speed;
        currentReplayIndex = 0;
        playNextFrame();
        return true;
    }

    function playNextFrame() {
        if (!isPlaying || currentReplayIndex >= replayData.length) {
            isPlaying = false;
            if (onCompleteCallback) onCompleteCallback();
            return;
        }

        const frame = replayData[currentReplayIndex];
        if (onUpdateCallback) {
            onUpdateCallback(frame, currentReplayIndex, replayData.length);
        }

        currentReplayIndex++;
        
        if (currentReplayIndex < replayData.length) {
            const nextFrame = replayData[currentReplayIndex];
            const delay = (nextFrame.timestamp - frame.timestamp) / playbackSpeed;
            setTimeout(playNextFrame, Math.max(16, delay));
        } else {
            isPlaying = false;
            if (onCompleteCallback) onCompleteCallback();
        }
    }

    function pause() {
        isPlaying = false;
    }

    function stop() {
        isPlaying = false;
        currentReplayIndex = 0;
    }

    function seek(index) {
        currentReplayIndex = Math.max(0, Math.min(index, replayData.length - 1));
        if (replayData[currentReplayIndex] && onUpdateCallback) {
            onUpdateCallback(replayData[currentReplayIndex], currentReplayIndex, replayData.length);
        }
    }

    function getCurrentFrame() {
        return replayData[currentReplayIndex] || null;
    }

    function getTotalFrames() {
        return replayData.length;
    }

    function isReplayPlaying() {
        return isPlaying;
    }

    function setOnUpdate(callback) {
        onUpdateCallback = callback;
    }

    function setOnComplete(callback) {
        onCompleteCallback = callback;
    }

    function analyzeShot() {
        if (replayData.length < 2) return null;

        const startFrame = replayData[0];
        const endFrame = replayData[replayData.length - 1];
        
        let maxHeight = 0;
        let landingFrame = null;
        let totalDistance = 0;

        for (let i = 0; i < replayData.length; i++) {
            const frame = replayData[i];
            if (frame.ball && frame.ball.z > maxHeight) {
                maxHeight = frame.ball.z;
            }
            if (!landingFrame && i > 0 && frame.ball && !frame.ball.isFlying && replayData[i-1].ball.isFlying) {
                landingFrame = frame;
            }
            if (i > 0) {
                const prev = replayData[i-1].ball;
                const curr = frame.ball;
                if (prev && curr) {
                    totalDistance += Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
                }
            }
        }

        const flightDistance = landingFrame ? 
            Math.sqrt((landingFrame.ball.x - startFrame.ball.x) ** 2 + 
                      (landingFrame.ball.y - startFrame.ball.y) ** 2) : 0;
        
        const rollDistance = landingFrame ?
            Math.sqrt((endFrame.ball.x - landingFrame.ball.x) ** 2 + 
                      (endFrame.ball.y - landingFrame.ball.y) ** 2) : 0;

        return {
            club: startFrame.club,
            power: startFrame.power,
            angle: startFrame.angle,
            maxHeight: Math.round(maxHeight),
            totalDistance: Math.round(totalDistance),
            flightDistance: Math.round(flightDistance),
            rollDistance: Math.round(rollDistance),
            landingAccuracy: landingFrame ? Math.round(
                Math.sqrt((landingFrame.ball.x - endFrame.targetX) ** 2 + 
                          (landingFrame.ball.y - endFrame.targetY) ** 2)
            ) : null,
            finalPosition: { x: endFrame.ball.x, y: endFrame.ball.y },
            inHole: endFrame.ball.inHole,
            frames: replayData.length
        };
    }

    function exportReplay() {
        return JSON.stringify(replayData);
    }

    function importReplay(jsonString) {
        try {
            replayData = JSON.parse(jsonString);
            currentReplayIndex = 0;
            return true;
        } catch (e) {
            console.error('导入回放数据失败:', e);
            return false;
        }
    }

    return {
        startRecording,
        recordFrame,
        getReplayData,
        loadReplay,
        play,
        pause,
        stop,
        seek,
        getCurrentFrame,
        getTotalFrames,
        isReplayPlaying,
        setOnUpdate,
        setOnComplete,
        analyzeShot,
        exportReplay,
        importReplay
    };
})();
