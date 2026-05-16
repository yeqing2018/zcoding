class LotteryApp {
    constructor() {
        this.state = {
            groups: [],
            currentGroupId: null,
            isRolling: false,
            isLocked: false,
            lockPassword: null,
            rollInterval: null,
            titleInterval: null,
            originalTitle: document.title,
            settings: {
                layoutMode: 'center',
                bgColor: '#2c3e50',
                bgImage: null,
                fontColor: '#ecf0f1',
                fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
                resultSize: 100,
                animationEffect: 'blink',
                rollSpeed: 'medium',
                rollDuration: 3,
                titleBlink: true,
                popupAlert: true,
                showButtons: true,
                showGroups: true,
                showInput: true
            },
            history: []
        };

        this.speedMap = {
            slow: 150,
            medium: 50,
            fast: 20
        };

        this.init();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeAttr(text) {
        return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.createDefaultGroup();
        this.renderGroups();
        this.applySettings();
    }

    createDefaultGroup() {
        if (this.state.groups.length === 0) {
            const group = this.createGroup('默认分组');
            this.state.groups.push(group);
            this.state.currentGroupId = group.id;
        } else if (!this.state.currentGroupId) {
            this.state.currentGroupId = this.state.groups[0].id;
        }
        this.selectGroup(this.state.currentGroupId);
    }

    createGroup(name) {
        return {
            id: 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name,
            candidates: [],
            avoidList: [],
            weights: {},
            drawMode: 'random',
            winCount: 1,
            filterDuplicates: false,
            lastResult: null
        };
    }

    getCurrentGroup() {
        return this.state.groups.find(g => g.id === this.state.currentGroupId);
    }

    bindEvents() {
        document.getElementById('addGroupBtn').addEventListener('click', () => this.addGroup());
        document.getElementById('startBtn').addEventListener('click', () => this.toggleDraw());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetCurrent());
        document.getElementById('batchImportBtn').addEventListener('click', () => this.batchImport());
        document.getElementById('batchResetBtn').addEventListener('click', () => this.batchReset());

        document.getElementById('candidates').addEventListener('input', (e) => this.onCandidatesChange(e));
        document.getElementById('avoidList').addEventListener('input', (e) => this.onAvoidListChange(e));
        document.getElementById('filterDuplicates').addEventListener('change', (e) => this.onFilterDuplicatesChange(e));
        document.getElementById('drawMode').addEventListener('change', (e) => this.onDrawModeChange(e));
        document.getElementById('winCount').addEventListener('change', (e) => this.onWinCountChange(e));
        document.getElementById('clearAvoidBtn').addEventListener('click', () => this.clearAvoid());

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('importExcelBtn').addEventListener('click', () => document.getElementById('excelFile').click());
        document.getElementById('excelFile').addEventListener('change', (e) => this.handleExcelImport(e));
        document.getElementById('cancelExcelBtn').addEventListener('click', () => this.hideModal('excelModal'));
        document.getElementById('confirmExcelBtn').addEventListener('click', () => this.confirmExcelImport());

        document.getElementById('pasteFile').addEventListener('change', (e) => this.handlePasteFile(e));

        document.getElementById('toggleSettingsBtn').addEventListener('click', () => this.togglePanel('settingsPanel'));
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.hidePanel('settingsPanel'));
        document.getElementById('toggleHistoryBtn').addEventListener('click', () => this.togglePanel('historyPanel'));
        document.getElementById('closeHistoryBtn').addEventListener('click', () => this.hidePanel('historyPanel'));

        document.getElementById('layoutMode').addEventListener('change', (e) => this.updateSetting('layoutMode', e.target.value));
        document.getElementById('bgColor').addEventListener('change', (e) => this.updateSetting('bgColor', e.target.value));
        document.getElementById('bgImage').addEventListener('change', (e) => this.handleBgImageChange(e));
        document.getElementById('clearBgImage').addEventListener('click', () => this.clearBgImage());
        document.getElementById('fontColor').addEventListener('change', (e) => this.updateSetting('fontColor', e.target.value));
        document.getElementById('fontFamily').addEventListener('change', (e) => this.updateSetting('fontFamily', e.target.value));
        document.getElementById('resultSize').addEventListener('input', (e) => {
            document.getElementById('resultSizeValue').textContent = e.target.value + '%';
            this.updateSetting('resultSize', parseInt(e.target.value));
        });
        document.getElementById('animationEffect').addEventListener('change', (e) => this.updateSetting('animationEffect', e.target.value));
        document.getElementById('rollSpeed').addEventListener('change', (e) => this.updateSetting('rollSpeed', e.target.value));
        document.getElementById('rollDuration').addEventListener('input', (e) => {
            document.getElementById('rollDurationValue').textContent = e.target.value + '秒';
            this.updateSetting('rollDuration', parseInt(e.target.value));
        });
        document.getElementById('titleBlink').addEventListener('change', (e) => this.updateSetting('titleBlink', e.target.checked));
        document.getElementById('popupAlert').addEventListener('change', (e) => this.updateSetting('popupAlert', e.target.checked));
        document.getElementById('showButtons').addEventListener('change', (e) => this.updateSetting('showButtons', e.target.checked));
        document.getElementById('showGroups').addEventListener('change', (e) => this.updateSetting('showGroups', e.target.checked));
        document.getElementById('showInput').addEventListener('change', (e) => this.updateSetting('showInput', e.target.checked));

        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('change', (e) => this.importData(e));

        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        document.getElementById('exportHistoryBtn').addEventListener('click', () => this.exportHistory());

        document.getElementById('lockBtn').addEventListener('click', () => this.toggleLock());
        document.getElementById('cancelLockBtn').addEventListener('click', () => this.hideModal('lockModal'));
        document.getElementById('confirmLockBtn').addEventListener('click', () => this.confirmLockAction());

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        document.getElementById('weightList').addEventListener('change', (e) => {
            if (e.target.matches('input[type="number"][data-candidate]')) {
                const candidate = e.target.dataset.candidate;
                this.updateWeight(candidate, e.target.value);
            }
        });

        document.getElementById('groupsList').addEventListener('click', (e) => {
            const groupItem = e.target.closest('.group-item');
            if (!groupItem) return;
            
            const groupId = groupItem.dataset.groupId;
            
            if (e.target.matches('.rename-group-btn')) {
                e.stopPropagation();
                this.renameGroup(groupId);
            } else if (e.target.matches('.delete-group-btn')) {
                e.stopPropagation();
                this.deleteGroup(groupId);
            } else {
                this.selectGroup(groupId);
            }
        });

        this.excelData = null;
    }

    parseInput(text) {
        if (!text || !text.trim()) return [];
        return text.split(/[,\n\r]+/).map(item => item.trim()).filter(item => item.length > 0);
    }

    onCandidatesChange(e) {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (!group) return;

        let items = this.parseInput(e.target.value);
        
        if (group.filterDuplicates) {
            items = [...new Set(items)];
        }
        
        group.candidates = items;
        
        items.forEach(item => {
            if (group.weights[item] === undefined) {
                group.weights[item] = 1;
            }
        });
        
        Object.keys(group.weights).forEach(key => {
            if (!items.includes(key)) {
                delete group.weights[key];
            }
        });
        
        this.updateCountDisplay();
        this.renderWeightList();
        this.saveToStorage();
    }

    onAvoidListChange(e) {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (!group) return;
        group.avoidList = this.parseInput(e.target.value);
        this.updateCountDisplay();
        this.saveToStorage();
    }

    onFilterDuplicatesChange(e) {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (!group) return;
        group.filterDuplicates = e.target.checked;
        
        if (group.filterDuplicates && group.candidates.length > 0) {
            group.candidates = [...new Set(group.candidates)];
            const textarea = document.getElementById('candidates');
            textarea.value = group.candidates.join('\n');
        }
        
        this.saveToStorage();
    }

    onDrawModeChange(e) {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (!group) return;
        group.drawMode = e.target.value;
        this.saveToStorage();
    }

    onWinCountChange(e) {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (!group) return;
        const val = parseInt(e.target.value) || 1;
        group.winCount = Math.max(1, val);
        document.getElementById('winCountDisplay').textContent = group.winCount;
        this.saveToStorage();
    }

    updateCountDisplay() {
        const group = this.getCurrentGroup();
        if (!group) return;
        document.getElementById('candidatesCount').textContent = group.candidates.length;
        document.getElementById('avoidListCount').textContent = group.avoidList.length;
        document.getElementById('totalCount').textContent = group.candidates.length;
        document.getElementById('avoidCount').textContent = group.avoidList.length;
        document.getElementById('winCountDisplay').textContent = group.winCount;
    }

    renderWeightList() {
        const group = this.getCurrentGroup();
        const container = document.getElementById('weightList');
        
        if (!group || group.candidates.length === 0) {
            container.innerHTML = '<p class="empty-tip">请先在候选名单中添加内容</p>';
            return;
        }

        container.innerHTML = group.candidates.map(candidate => `
            <div class="weight-item">
                <span class="weight-item-name">${this.escapeHtml(candidate)}</span>
                <input type="number" min="1" value="${group.weights[candidate] || 1}" 
                       data-candidate="${this.escapeAttr(candidate)}">
            </div>
        `).join('');
    }

    updateWeight(candidate, value) {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (!group) return;
        group.weights[candidate] = Math.max(1, parseInt(value) || 1);
        this.saveToStorage();
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tabContent === tabName);
        });
        
        if (tabName === 'weight') {
            this.renderWeightList();
        }
    }

    addGroup() {
        if (this.state.isLocked) return;
        if (this.state.groups.length >= 10) {
            alert('最多支持10个分组！');
            return;
        }
        const name = prompt('请输入分组名称：', `分组${this.state.groups.length + 1}`);
        if (name) {
            const group = this.createGroup(name);
            this.state.groups.push(group);
            this.state.currentGroupId = group.id;
            this.renderGroups();
            this.selectGroup(group.id);
            this.saveToStorage();
        }
    }

    renameGroup(groupId) {
        if (this.state.isLocked) return;
        const group = this.state.groups.find(g => g.id === groupId);
        if (!group) return;
        const newName = prompt('请输入新的分组名称：', group.name);
        if (newName && newName.trim()) {
            group.name = newName.trim();
            this.renderGroups();
            if (groupId === this.state.currentGroupId) {
                document.getElementById('currentGroupName').textContent = group.name;
            }
            this.saveToStorage();
        }
    }

    deleteGroup(groupId) {
        if (this.state.isLocked) return;
        if (this.state.groups.length <= 1) {
            alert('至少保留一个分组！');
            return;
        }
        if (confirm('确定删除此分组吗？')) {
            this.state.groups = this.state.groups.filter(g => g.id !== groupId);
            if (this.state.currentGroupId === groupId) {
                this.state.currentGroupId = this.state.groups[0].id;
            }
            this.renderGroups();
            this.selectGroup(this.state.currentGroupId);
            this.saveToStorage();
        }
    }

    renderGroups() {
        const container = document.getElementById('groupsList');
        container.innerHTML = this.state.groups.map(group => `
            <div class="group-item ${group.id === this.state.currentGroupId ? 'active' : ''}" 
                 data-group-id="${this.escapeAttr(group.id)}">
                <span class="group-item-name">${this.escapeHtml(group.name)}</span>
                <div class="group-item-actions">
                    <button class="rename-group-btn" data-group-id="${this.escapeAttr(group.id)}" title="重命名">✏️</button>
                    <button class="delete-group-btn" data-group-id="${this.escapeAttr(group.id)}" title="删除">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    selectGroup(groupId) {
        this.state.currentGroupId = groupId;
        const group = this.getCurrentGroup();
        if (!group) return;

        document.getElementById('currentGroupName').textContent = group.name;
        document.getElementById('candidates').value = group.candidates.join('\n');
        document.getElementById('avoidList').value = group.avoidList.join('\n');
        document.getElementById('drawMode').value = group.drawMode;
        document.getElementById('winCount').value = group.winCount;
        document.getElementById('filterDuplicates').checked = group.filterDuplicates;
        
        this.updateCountDisplay();
        this.renderWeightList();
        this.renderGroups();
        
        document.getElementById('resultDisplay').innerHTML = group.lastResult 
            ? this.renderResult(group.lastResult)
            : '<span class="placeholder">等待抽签</span>';
    }

    renderResult(result) {
        if (!result) return '<span class="placeholder">等待抽签</span>';
        
        if (result.mode === 'sequence') {
            return `
                <div class="sequence-list">
                    ${result.winners.map((winner, index) => `
                        <div class="sequence-item">
                            <span class="sequence-rank">${index + 1}</span>
                            <span class="sequence-name">${this.escapeHtml(winner)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (result.winners.length > 1) {
            return `
                <div class="winners-list">
                    ${result.winners.map(winner => `
                        <span class="winner-item">${this.escapeHtml(winner)}</span>
                    `).join('')}
                </div>
            `;
        } else {
            return `<span class="winner">${this.escapeHtml(result.winners[0])}</span>`;
        }
    }

    getAvailableCandidates() {
        const group = this.getCurrentGroup();
        if (!group) return [];
        return group.candidates.filter(c => !group.avoidList.includes(c));
    }

    toggleDraw() {
        if (this.state.isRolling) {
            this.stopDraw();
        } else {
            this.startDraw();
        }
    }

    startDraw() {
        const group = this.getCurrentGroup();
        if (!group) return;

        const available = this.getAvailableCandidates();
        if (available.length < 1) {
            alert('请至少输入1个有效候选内容（已排除回避对象）！');
            return;
        }

        if (group.winCount > available.length) {
            alert(`中签数量不能超过有效候选数(${available.length})！`);
            return;
        }

        this.state.isRolling = true;
        const startBtn = document.getElementById('startBtn');
        startBtn.textContent = '停止抽签';
        startBtn.classList.remove('btn-primary');
        startBtn.classList.add('btn-danger');
        
        document.getElementById('candidates').disabled = true;
        document.getElementById('avoidList').disabled = true;
        document.getElementById('clearBtn').disabled = true;
        document.getElementById('resetBtn').disabled = true;
        document.getElementById('drawMode').disabled = true;
        document.getElementById('winCount').disabled = true;

        const resultDisplay = document.getElementById('resultDisplay');
        resultDisplay.innerHTML = '';
        const rollSpan = document.createElement('span');
        rollSpan.className = `rolling anim-${this.state.settings.animationEffect}`;
        resultDisplay.appendChild(rollSpan);

        const speed = this.speedMap[this.state.settings.rollSpeed];
        this.state.rollInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * available.length);
            rollSpan.textContent = available[randomIndex];
        }, speed);

        if (this.state.settings.rollDuration > 0) {
            setTimeout(() => {
                if (this.state.isRolling) {
                    this.stopDraw();
                }
            }, this.state.settings.rollDuration * 1000);
        }
    }

    stopDraw() {
        this.state.isRolling = false;
        clearInterval(this.state.rollInterval);

        const group = this.getCurrentGroup();
        const available = this.getAvailableCandidates();
        const winners = this.selectWinners(available, group.winCount, group.drawMode, group.weights);

        const result = {
            mode: group.drawMode,
            winners: winners,
            timestamp: Date.now(),
            totalCandidates: group.candidates.length,
            avoidCount: group.avoidList.length,
            weights: group.drawMode === 'weighted' ? { ...group.weights } : null
        };

        group.lastResult = result;
        this.addToHistory(group, result);
        
        document.getElementById('resultDisplay').innerHTML = this.renderResult(result);

        const startBtn = document.getElementById('startBtn');
        startBtn.textContent = '开始抽签';
        startBtn.classList.remove('btn-danger');
        startBtn.classList.add('btn-primary');
        
        document.getElementById('candidates').disabled = this.state.isLocked;
        document.getElementById('avoidList').disabled = this.state.isLocked;
        document.getElementById('clearBtn').disabled = this.state.isLocked;
        document.getElementById('resetBtn').disabled = this.state.isLocked;
        document.getElementById('drawMode').disabled = this.state.isLocked;
        document.getElementById('winCount').disabled = this.state.isLocked;

        if (this.state.settings.titleBlink) {
            this.startTitleBlink();
        }
        if (this.state.settings.popupAlert) {
            setTimeout(() => {
                alert(`抽签完成！\n中签者：${winners.join('、')}`);
            }, 100);
        }

        this.saveToStorage();
    }

    selectWinners(available, count, mode, weights) {
        const candidates = [...available];
        
        if (mode === 'sequence') {
            return this.shuffleArray(candidates);
        }
        
        if (mode === 'weighted') {
            return this.selectWeightedWinners(candidates, count, weights);
        }
        
        return this.selectRandomWinners(candidates, count);
    }

    selectRandomWinners(candidates, count) {
        const shuffled = this.shuffleArray(candidates);
        return shuffled.slice(0, count);
    }

    selectWeightedWinners(candidates, count, weights) {
        const winners = [];
        const remaining = [...candidates];
        
        for (let i = 0; i < count && remaining.length > 0; i++) {
            const totalWeight = remaining.reduce((sum, c) => sum + (weights[c] || 1), 0);
            let random = Math.random() * totalWeight;
            
            for (let j = 0; j < remaining.length; j++) {
                random -= weights[remaining[j]] || 1;
                if (random <= 0) {
                    winners.push(remaining[j]);
                    remaining.splice(j, 1);
                    break;
                }
            }
        }
        
        return winners;
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    clearInput() {
        if (this.state.isLocked) return;
        document.getElementById('candidates').value = '';
        const group = this.getCurrentGroup();
        if (group) {
            group.candidates = [];
            group.weights = {};
            this.updateCountDisplay();
            this.renderWeightList();
            this.saveToStorage();
        }
    }

    clearAvoid() {
        if (this.state.isLocked) return;
        document.getElementById('avoidList').value = '';
        const group = this.getCurrentGroup();
        if (group) {
            group.avoidList = [];
            this.updateCountDisplay();
            this.saveToStorage();
        }
    }

    resetCurrent() {
        if (this.state.isLocked) return;
        const group = this.getCurrentGroup();
        if (group) {
            group.lastResult = null;
            document.getElementById('resultDisplay').innerHTML = '<span class="placeholder">等待抽签</span>';
            this.saveToStorage();
        }
    }

    batchReset() {
        if (this.state.isLocked) return;
        if (confirm('确定重置所有分组的抽签结果吗？')) {
            this.state.groups.forEach(group => {
                group.lastResult = null;
            });
            this.selectGroup(this.state.currentGroupId);
            this.saveToStorage();
        }
    }

    batchImport() {
        alert('批量导入功能：请准备JSON格式数据，包含groups数组。');
    }

    handleExcelImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                if (jsonData.length === 0) {
                    alert('Excel文件为空！');
                    return;
                }

                this.excelData = jsonData;
                const headers = jsonData[0] || [];
                const select = document.getElementById('excelColumnSelect');
                select.innerHTML = headers.map((h, i) => 
                    `<option value="${i}">${this.escapeHtml(h || `第${i + 1}列`)}</option>`
                ).join('');
                
                this.showModal('excelModal');
            } catch (err) {
                alert('解析Excel失败：' + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    }

    confirmExcelImport() {
        if (!this.excelData) return;
        
        const colIndex = parseInt(document.getElementById('excelColumnSelect').value);
        const items = this.excelData.slice(1).map(row => row[colIndex]).filter(v => v !== undefined && v !== null && v !== '');
        
        const textarea = document.getElementById('candidates');
        const currentValue = textarea.value.trim();
        const newValue = items.join('\n');
        textarea.value = currentValue ? currentValue + '\n' + newValue : newValue;
        
        textarea.dispatchEvent(new Event('input'));
        this.hideModal('excelModal');
        this.excelData = null;
    }

    handlePasteFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const textarea = document.getElementById('candidates');
            textarea.value = event.target.result;
            textarea.dispatchEvent(new Event('input'));
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        panel.classList.toggle('hidden');
    }

    hidePanel(panelId) {
        document.getElementById(panelId).classList.add('hidden');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    updateSetting(key, value) {
        this.state.settings[key] = value;
        this.applySettings();
        this.saveToStorage();
    }

    applySettings() {
        const s = this.state.settings;
        const root = document.documentElement;
        const app = document.getElementById('app');
        const body = document.body;

        root.style.setProperty('--bg-color', s.bgColor);
        root.style.setProperty('--text-color', s.fontColor);
        root.style.setProperty('--result-size', s.resultSize / 100);
        body.style.fontFamily = s.fontFamily;
        body.style.backgroundColor = s.bgColor;
        
        if (s.bgImage) {
            body.style.backgroundImage = `url(${s.bgImage})`;
        } else {
            body.style.backgroundImage = 'none';
        }

        app.className = `app-container layout-${s.layoutMode}`;
        if (!s.showGroups) app.classList.add('hide-groups');
        if (!s.showInput) app.classList.add('hide-input');
        if (!s.showButtons) app.classList.add('hide-buttons');

        document.getElementById('layoutMode').value = s.layoutMode;
        document.getElementById('bgColor').value = s.bgColor;
        document.getElementById('fontColor').value = s.fontColor;
        document.getElementById('fontFamily').value = s.fontFamily;
        document.getElementById('resultSize').value = s.resultSize;
        document.getElementById('resultSizeValue').textContent = s.resultSize + '%';
        document.getElementById('animationEffect').value = s.animationEffect;
        document.getElementById('rollSpeed').value = s.rollSpeed;
        document.getElementById('rollDuration').value = s.rollDuration;
        document.getElementById('rollDurationValue').textContent = s.rollDuration + '秒';
        document.getElementById('titleBlink').checked = s.titleBlink;
        document.getElementById('popupAlert').checked = s.popupAlert;
        document.getElementById('showButtons').checked = s.showButtons;
        document.getElementById('showGroups').checked = s.showGroups;
        document.getElementById('showInput').checked = s.showInput;
    }

    handleBgImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.updateSetting('bgImage', event.target.result);
        };
        reader.readAsDataURL(file);
    }

    clearBgImage() {
        this.updateSetting('bgImage', null);
        document.getElementById('bgImage').value = '';
    }

    addToHistory(group, result) {
        const record = {
            id: 'record_' + Date.now(),
            groupName: group.name,
            groupId: group.id,
            mode: result.mode,
            winners: result.winners,
            candidates: [...group.candidates],
            avoidList: [...group.avoidList],
            totalCandidates: result.totalCandidates,
            avoidCount: result.avoidCount,
            winCount: result.winners.length,
            timestamp: result.timestamp,
            weights: result.weights
        };
        this.state.history.unshift(record);
        if (this.state.history.length > 100) {
            this.state.history = this.state.history.slice(0, 100);
        }
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        if (this.state.history.length === 0) {
            container.innerHTML = '<p class="empty-tip">暂无抽签记录</p>';
            return;
        }

        container.innerHTML = this.state.history.map(record => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-item-group">${this.escapeHtml(record.groupName)}</span>
                    <span class="history-item-time">${new Date(record.timestamp).toLocaleString()}</span>
                </div>
                <div class="history-item-stats">
                    候选数：${record.totalCandidates} | 回避：${record.avoidCount} | 中签：${record.winCount}
                </div>
                <div class="history-item-winners">
                    ${record.winners.map(w => `<span class="history-item-winner">${this.escapeHtml(w)}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('确定清空所有历史记录吗？')) {
            this.state.history = [];
            this.renderHistory();
            this.saveToStorage();
        }
    }

    exportHistory() {
        const dataStr = JSON.stringify(this.state.history, null, 2);
        this.downloadFile(dataStr, `抽签历史_${new Date().toLocaleDateString()}.json`, 'application/json');
    }

    exportData() {
        const exportData = {
            groups: this.state.groups,
            currentGroupId: this.state.currentGroupId,
            settings: this.state.settings,
            history: this.state.history,
            exportTime: Date.now()
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        this.downloadFile(dataStr, `抽签工具备份_${new Date().toLocaleDateString()}.json`, 'application/json');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.groups) this.state.groups = data.groups;
                if (data.currentGroupId) this.state.currentGroupId = data.currentGroupId;
                if (data.settings) this.state.settings = { ...this.state.settings, ...data.settings };
                if (data.history) this.state.history = data.history;
                
                this.renderGroups();
                this.selectGroup(this.state.currentGroupId);
                this.applySettings();
                this.renderHistory();
                this.saveToStorage();
                alert('导入成功！');
            } catch (err) {
                alert('导入失败：' + err.message);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    toggleLock() {
        if (this.state.isLocked) {
            this.unlock();
        } else {
            this.showLockModal('设置锁定密码');
        }
    }

    showLockModal(title) {
        document.getElementById('lockModalTitle').textContent = title;
        document.getElementById('lockPassword').value = '';
        document.getElementById('lockPasswordConfirm').value = '';
        document.getElementById('lockPasswordConfirm').style.display = title.includes('设置') ? 'block' : 'none';
        this.showModal('lockModal');
    }

    confirmLockAction() {
        const pwd1 = document.getElementById('lockPassword').value;
        const pwd2 = document.getElementById('lockPasswordConfirm').value;
        const title = document.getElementById('lockModalTitle').textContent;

        if (title.includes('设置')) {
            if (!pwd1) {
                alert('请输入密码！');
                return;
            }
            if (pwd1 !== pwd2) {
                alert('两次输入的密码不一致！');
                return;
            }
            this.lock(pwd1);
        } else {
            if (pwd1 === this.state.lockPassword) {
                this.state.isLocked = false;
                this.updateLockUI();
                this.hideModal('lockModal');
                alert('已解锁！');
            } else {
                alert('密码错误！');
            }
        }
    }

    lock(password) {
        this.state.isLocked = true;
        this.state.lockPassword = password;
        this.updateLockUI();
        this.hideModal('lockModal');
        alert('已锁定！');
    }

    unlock() {
        this.showLockModal('输入解锁密码');
    }

    updateLockUI() {
        const lockBtn = document.getElementById('lockBtn');
        lockBtn.textContent = this.state.isLocked ? '🔒' : '🔓';
        lockBtn.title = this.state.isLocked ? '已锁定，点击解锁' : '未锁定，点击锁定';

        document.getElementById('candidates').disabled = this.state.isLocked;
        document.getElementById('avoidList').disabled = this.state.isLocked;
        document.getElementById('clearBtn').disabled = this.state.isLocked;
        document.getElementById('resetBtn').disabled = this.state.isLocked;
        document.getElementById('drawMode').disabled = this.state.isLocked;
        document.getElementById('winCount').disabled = this.state.isLocked;
        document.getElementById('importExcelBtn').disabled = this.state.isLocked;
        document.getElementById('filterDuplicates').disabled = this.state.isLocked;
        document.getElementById('addGroupBtn').disabled = this.state.isLocked;
        document.getElementById('batchImportBtn').disabled = this.state.isLocked;
        document.getElementById('batchResetBtn').disabled = this.state.isLocked;
    }

    startTitleBlink() {
        if (this.state.titleInterval) return;
        
        let count = 0;
        const maxCount = 10;
        this.state.titleInterval = setInterval(() => {
            document.title = document.title === this.state.originalTitle 
                ? '🎉 抽签完成！' 
                : this.state.originalTitle;
            count++;
            if (count >= maxCount * 2) {
                clearInterval(this.state.titleInterval);
                this.state.titleInterval = null;
                document.title = this.state.originalTitle;
            }
        }, 500);
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (this.state.isLocked) return;

        if (e.code === 'Space') {
            e.preventDefault();
            this.toggleDraw();
        } else if (e.code === 'KeyR') {
            e.preventDefault();
            this.resetCurrent();
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('lotteryApp', JSON.stringify({
                groups: this.state.groups,
                currentGroupId: this.state.currentGroupId,
                settings: this.state.settings,
                history: this.state.history
            }));
        } catch (e) {
            console.warn('保存到本地存储失败:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('lotteryApp');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.groups) this.state.groups = data.groups;
                if (data.currentGroupId) this.state.currentGroupId = data.currentGroupId;
                if (data.settings) this.state.settings = { ...this.state.settings, ...data.settings };
                if (data.history) this.state.history = data.history;
            }
        } catch (e) {
            console.warn('从本地存储加载失败:', e);
        }
    }
}

const app = new LotteryApp();
