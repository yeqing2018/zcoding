const NETWORK = (function() {
    const SERVER_URL = 'http://localhost:3000/api';
    let isConnected = false;
    let currentUser = null;
    let currentRoom = null;
    let messageHandlers = {};
    let mockData = {
        users: [],
        rooms: [],
        clubs: []
    };

    function connect(userId, userName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                isConnected = true;
                currentUser = { id: userId, name: userName };
                mockData.users.push(currentUser);
                console.log(`[Network] 已连接: ${userName}`);
                resolve({ success: true, user: currentUser });
            }, 500);
        });
    }

    function disconnect() {
        if (currentRoom) {
            leaveRoom();
        }
        isConnected = false;
        currentUser = null;
        console.log('[Network] 已断开连接');
    }

    function createRoom(roomName, maxPlayers = 4) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const roomId = 'room_' + Date.now();
                currentRoom = {
                    id: roomId,
                    name: roomName,
                    maxPlayers,
                    players: [currentUser],
                    host: currentUser,
                    gameState: 'waiting'
                };
                mockData.rooms.push(currentRoom);
                console.log(`[Network] 房间已创建: ${roomName}`);
                resolve({ success: true, room: currentRoom });
            }, 300);
        });
    }

    function joinRoom(roomId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const room = mockData.rooms.find(r => r.id === roomId);
                if (room && room.players.length < room.maxPlayers) {
                    room.players.push(currentUser);
                    currentRoom = room;
                    console.log(`[Network] 加入房间: ${room.name}`);
                    resolve({ success: true, room: currentRoom });
                } else {
                    resolve({ success: false, error: '房间不存在或已满' });
                }
            }, 300);
        });
    }

    function leaveRoom() {
        if (currentRoom) {
            const index = currentRoom.players.findIndex(p => p.id === currentUser.id);
            if (index > -1) {
                currentRoom.players.splice(index, 1);
            }
            console.log(`[Network] 离开房间: ${currentRoom.name}`);
            currentRoom = null;
        }
    }

    function getRooms() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, rooms: [...mockData.rooms] });
            }, 200);
        });
    }

    function sendMessage(type, data) {
        if (!isConnected || !currentRoom) return false;
        
        const message = {
            type,
            data,
            from: currentUser,
            timestamp: Date.now()
        };
        
        setTimeout(() => {
            if (messageHandlers[type]) {
                messageHandlers[type](message);
            }
        }, 100);
        
        return true;
    }

    function onMessage(type, handler) {
        messageHandlers[type] = handler;
    }

    function offMessage(type) {
        delete messageHandlers[type];
    }

    function createClub(clubName, description) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const clubId = 'club_' + Date.now();
                const club = {
                    id: clubId,
                    name: clubName,
                    description,
                    members: [currentUser],
                    owner: currentUser,
                    created: Date.now()
                };
                mockData.clubs.push(club);
                console.log(`[Network] 俱乐部已创建: ${clubName}`);
                resolve({ success: true, club });
            }, 300);
        });
    }

    function joinClub(clubId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const club = mockData.clubs.find(c => c.id === clubId);
                if (club) {
                    club.members.push(currentUser);
                    console.log(`[Network] 加入俱乐部: ${club.name}`);
                    resolve({ success: true, club });
                } else {
                    resolve({ success: false, error: '俱乐部不存在' });
                }
            }, 300);
        });
    }

    function getClubs() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, clubs: [...mockData.clubs] });
            }, 200);
        });
    }

    function submitScore(courseId, totalStrokes, totalPar) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const score = {
                    id: 'score_' + Date.now(),
                    userId: currentUser?.id,
                    userName: currentUser?.name,
                    courseId,
                    totalStrokes,
                    totalPar,
                    scoreDiff: totalStrokes - totalPar,
                    timestamp: Date.now()
                };
                console.log(`[Network] 提交成绩: ${totalStrokes}杆`);
                resolve({ success: true, score });
            }, 200);
        });
    }

    function getLeaderboard(courseId, limit = 10) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const leaderboard = [
                    { rank: 1, name: '职业球手A', score: 68, diff: -4 },
                    { rank: 2, name: '职业球手B', score: 70, diff: -2 },
                    { rank: 3, name: '业余球手C', score: 72, diff: 0 },
                    { rank: 4, name: '业余球手D', score: 75, diff: +3 },
                    { rank: 5, name: currentUser?.name || '您', score: 80, diff: +8 }
                ].slice(0, limit);
                resolve({ success: true, leaderboard });
            }, 200);
        });
    }

    function getCurrentUser() {
        return currentUser;
    }

    function getCurrentRoom() {
        return currentRoom;
    }

    function isOnline() {
        return isConnected;
    }

    return {
        connect,
        disconnect,
        createRoom,
        joinRoom,
        leaveRoom,
        getRooms,
        sendMessage,
        onMessage,
        offMessage,
        createClub,
        joinClub,
        getClubs,
        submitScore,
        getLeaderboard,
        getCurrentUser,
        getCurrentRoom,
        isOnline
    };
})();
