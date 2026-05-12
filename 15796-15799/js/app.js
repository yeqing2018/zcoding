class PixelArtEditor {
    constructor() {
        this.canvas = document.getElementById('pixelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = 32;
        this.height = 32;
        this.pixelSize = 20;
        
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.isDrawing = false;
        this.lastX = -1;
        this.lastY = -1;
        
        this.startX = -1;
        this.startY = -1;
        this.previewPixels = [];
        
        this.symmetryX = false;
        this.symmetryY = false;
        
        this.layers = [];
        this.currentLayerIndex = 0;
        this.layerCounter = 1;
        
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.createCanvas();
    }
    
    setupCanvas() {
        this.canvas.width = this.width * this.pixelSize;
        this.canvas.height = this.height * this.pixelSize;
    }
    
    createEmptyPixels() {
        const pixels = [];
        for (let y = 0; y < this.height; y++) {
            pixels[y] = [];
            for (let x = 0; x < this.width; x++) {
                pixels[y][x] = null;
            }
        }
        return pixels;
    }
    
    setupEventListeners() {
        document.getElementById('createCanvas').addEventListener('click', () => this.handleCreateCanvas());
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('resetCanvas').addEventListener('click', () => this.resetCanvas());
        
        document.getElementById('brushTool').addEventListener('click', () => this.setTool('brush'));
        document.getElementById('eraserTool').addEventListener('click', () => this.setTool('eraser'));
        document.getElementById('fillTool').addEventListener('click', () => this.setTool('fill'));
        document.getElementById('lineTool').addEventListener('click', () => this.setTool('line'));
        document.getElementById('rectTool').addEventListener('click', () => this.setTool('rect'));
        document.getElementById('rectFillTool').addEventListener('click', () => this.setTool('rectFill'));
        
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('input', (e) => this.setColor(e.target.value));
        
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.setColor(color);
            });
        });
        
        document.getElementById('symmetryX').addEventListener('change', (e) => {
            this.symmetryX = e.target.checked;
        });
        document.getElementById('symmetryY').addEventListener('change', (e) => {
            this.symmetryY = e.target.checked;
        });
        
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addLayer());
        document.getElementById('deleteLayerBtn').addEventListener('click', () => this.deleteLayer());
        document.getElementById('moveUpBtn').addEventListener('click', () => this.moveLayerUp());
        document.getElementById('moveDownBtn').addEventListener('click', () => this.moveLayerDown());
        
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        document.getElementById('exportBtn').addEventListener('click', () => this.exportImage());
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    this.undo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    this.redo();
                }
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e);
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }
    
    handleCreateCanvas() {
        const newWidth = parseInt(document.getElementById('canvasWidth').value) || 32;
        const newHeight = parseInt(document.getElementById('canvasHeight').value) || 32;
        const newPixelSize = parseInt(document.getElementById('pixelSize').value) || 20;
        
        this.width = Math.max(4, Math.min(128, newWidth));
        this.height = Math.max(4, Math.min(128, newHeight));
        this.pixelSize = Math.max(5, Math.min(50, newPixelSize));
        
        document.getElementById('canvasWidth').value = this.width;
        document.getElementById('canvasHeight').value = this.height;
        document.getElementById('pixelSize').value = this.pixelSize;
        
        this.createCanvas();
    }
    
    createCanvas() {
        this.setupCanvas();
        
        this.layers = [];
        this.layerCounter = 1;
        this.currentLayerIndex = 0;
        
        this.addLayer('背景');
        
        this.history = [];
        this.historyIndex = -1;
        this.saveState();
        this.render();
        this.updateHistoryButtons();
        this.updateLayersUI();
    }
    
    addLayer(name = null) {
        const layerName = name || `图层 ${this.layerCounter++}`;
        const layer = {
            name: layerName,
            pixels: this.createEmptyPixels(),
            visible: true
        };
        
        this.layers.splice(this.currentLayerIndex + 1, 0, layer);
        this.currentLayerIndex++;
        
        this.saveState();
        this.updateLayersUI();
        this.render();
    }
    
    deleteLayer() {
        if (this.layers.length <= 1) {
            alert('至少保留一个图层！');
            return;
        }
        
        this.layers.splice(this.currentLayerIndex, 1);
        this.currentLayerIndex = Math.max(0, this.currentLayerIndex - 1);
        
        this.saveState();
        this.updateLayersUI();
        this.render();
    }
    
    moveLayerUp() {
        if (this.currentLayerIndex < this.layers.length - 1) {
            const temp = this.layers[this.currentLayerIndex];
            this.layers[this.currentLayerIndex] = this.layers[this.currentLayerIndex + 1];
            this.layers[this.currentLayerIndex + 1] = temp;
            this.currentLayerIndex++;
            
            this.saveState();
            this.updateLayersUI();
            this.render();
        }
    }
    
    moveLayerDown() {
        if (this.currentLayerIndex > 0) {
            const temp = this.layers[this.currentLayerIndex];
            this.layers[this.currentLayerIndex] = this.layers[this.currentLayerIndex - 1];
            this.layers[this.currentLayerIndex - 1] = temp;
            this.currentLayerIndex--;
            
            this.saveState();
            this.updateLayersUI();
            this.render();
        }
    }
    
    toggleLayerVisibility(index) {
        this.layers[index].visible = !this.layers[index].visible;
        this.saveState();
        this.updateLayersUI();
        this.render();
    }
    
    selectLayer(index) {
        this.currentLayerIndex = index;
        this.updateLayersUI();
    }
    
    updateLayersUI() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';
        
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const item = document.createElement('div');
            item.className = `layer-item ${i === this.currentLayerIndex ? 'active' : ''} ${!layer.visible ? 'hidden' : ''}`;
            
            const visBtn = document.createElement('button');
            visBtn.className = 'layer-visibility';
            visBtn.textContent = layer.visible ? '👁️' : '👁️‍🗨️';
            visBtn.title = layer.visible ? '隐藏' : '显示';
            visBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLayerVisibility(i);
            });
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'layer-name';
            nameSpan.textContent = layer.name;
            
            item.appendChild(visBtn);
            item.appendChild(nameSpan);
            item.addEventListener('click', () => this.selectLayer(i));
            
            layersList.appendChild(item);
        }
    }
    
    getCurrentLayer() {
        return this.layers[this.currentLayerIndex];
    }
    
    clearCanvas() {
        const layer = this.getCurrentLayer();
        layer.pixels = this.createEmptyPixels();
        
        this.saveState();
        this.render();
    }
    
    resetCanvas() {
        document.getElementById('canvasWidth').value = 32;
        document.getElementById('canvasHeight').value = 32;
        document.getElementById('pixelSize').value = 20;
        
        this.width = 32;
        this.height = 32;
        this.pixelSize = 20;
        
        this.createCanvas();
    }
    
    setTool(tool) {
        this.currentTool = tool;
        
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        const toolMap = {
            'brush': 'brushTool',
            'eraser': 'eraserTool',
            'fill': 'fillTool',
            'line': 'lineTool',
            'rect': 'rectTool',
            'rectFill': 'rectFillTool'
        };
        document.getElementById(toolMap[tool]).classList.add('active');
    }
    
    setColor(color) {
        this.currentColor = color;
        document.getElementById('colorPicker').value = color;
        document.getElementById('colorValue').textContent = color;
        
        if (this.currentTool === 'eraser') {
            this.setTool('brush');
        }
    }
    
    getPixelPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const x = Math.floor((clientX - rect.left) / this.pixelSize);
        const y = Math.floor((clientY - rect.top) / this.pixelSize);
        
        return { x, y };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPixelPosition(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        this.startX = pos.x;
        this.startY = pos.y;
        
        if (this.currentTool === 'fill') {
            this.applyFill(pos.x, pos.y);
            this.saveState();
        } else if (this.currentTool === 'line' || this.currentTool === 'rect' || this.currentTool === 'rectFill') {
            this.previewPixels = [];
        } else {
            this.applyTool(pos.x, pos.y);
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getPixelPosition(e);
        
        if (this.currentTool === 'fill') {
            return;
        }
        
        if (this.currentTool === 'line' || this.currentTool === 'rect' || this.currentTool === 'rectFill') {
            this.restorePreview();
            this.showPreview(pos.x, pos.y);
            this.lastX = pos.x;
            this.lastY = pos.y;
            return;
        }
        
        if (pos.x === this.lastX && pos.y === this.lastY) {
            return;
        }
        
        this.applyTool(pos.x, pos.y);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            if (this.currentTool === 'line' || this.currentTool === 'rect' || this.currentTool === 'rectFill') {
                this.restorePreview();
                this.commitPreview();
            }
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    applyTool(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        
        const layer = this.getCurrentLayer();
        
        if (this.currentTool === 'brush') {
            this.setPixel(x, y, this.currentColor);
        } else if (this.currentTool === 'eraser') {
            this.setPixel(x, y, null);
        }
    }
    
    setPixel(x, y, color) {
        const layer = this.getCurrentLayer();
        const positions = this.getSymmetricPositions(x, y);
        
        positions.forEach(pos => {
            if (pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height) {
                layer.pixels[pos.y][pos.x] = color;
                this.renderPixel(pos.x, pos.y);
            }
        });
    }
    
    getSymmetricPositions(x, y) {
        const positions = [{ x, y }];
        const centerX = (this.width - 1) / 2;
        const centerY = (this.height - 1) / 2;
        
        if (this.symmetryX) {
            const mirrorX = Math.round(centerX * 2 - x);
            positions.push({ x: mirrorX, y });
        }
        
        if (this.symmetryY) {
            const mirrorY = Math.round(centerY * 2 - y);
            positions.push({ x, y: mirrorY });
        }
        
        if (this.symmetryX && this.symmetryY) {
            const mirrorX = Math.round(centerX * 2 - x);
            const mirrorY = Math.round(centerY * 2 - y);
            positions.push({ x: mirrorX, y: mirrorY });
        }
        
        return positions;
    }
    
    applyFill(startX, startY) {
        if (startX < 0 || startX >= this.width || startY < 0 || startY >= this.height) {
            return;
        }
        
        const layer = this.getCurrentLayer();
        const targetColor = layer.pixels[startY][startX];
        const fillColor = this.currentColor;
        
        if (targetColor === fillColor) {
            return;
        }
        
        const stack = [[startX, startY]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
            
            if (layer.pixels[y][x] !== targetColor) continue;
            
            visited.add(key);
            layer.pixels[y][x] = fillColor;
            
            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
        
        this.render();
    }
    
    showPreview(x, y) {
        this.previewPixels = [];
        const layer = this.getCurrentLayer();
        
        if (this.currentTool === 'line') {
            this.previewPixels = this.getLinePixels(this.startX, this.startY, x, y);
        } else if (this.currentTool === 'rect' || this.currentTool === 'rectFill') {
            this.previewPixels = this.getRectPixels(this.startX, this.startY, x, y, this.currentTool === 'rectFill');
        }
        
        this.previewPixels.forEach(pos => {
            if (pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height) {
                layer.pixels[pos.y][pos.x] = this.currentColor;
                this.renderPixel(pos.x, pos.y);
            }
        });
    }
    
    restorePreview() {
        const layer = this.getCurrentLayer();
        this.previewPixels.forEach(pos => {
            if (pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height) {
                layer.pixels[pos.y][pos.x] = null;
            }
        });
        this.render();
    }
    
    commitPreview() {
        const layer = this.getCurrentLayer();
        this.previewPixels.forEach(pos => {
            const positions = this.getSymmetricPositions(pos.x, pos.y);
            positions.forEach(p => {
                if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) {
                    layer.pixels[p.y][p.x] = this.currentColor;
                }
            });
        });
        this.previewPixels = [];
        this.render();
    }
    
    getLinePixels(x0, y0, x1, y1) {
        const pixels = [];
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        
        while (true) {
            pixels.push({ x: x0, y: y0 });
            
            if (x0 === x1 && y0 === y1) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        
        return pixels;
    }
    
    getRectPixels(x0, y0, x1, y1, filled) {
        const pixels = [];
        const minX = Math.min(x0, x1);
        const maxX = Math.max(x0, x1);
        const minY = Math.min(y0, y1);
        const maxY = Math.max(y0, y1);
        
        if (filled) {
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    pixels.push({ x, y });
                }
            }
        } else {
            for (let x = minX; x <= maxX; x++) {
                pixels.push({ x, y: minY });
                pixels.push({ x, y: maxY });
            }
            for (let y = minY + 1; y < maxY; y++) {
                pixels.push({ x: minX, y });
                pixels.push({ x: maxX, y });
            }
        }
        
        return pixels;
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.layers.forEach(layer => {
            if (layer.visible) {
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        if (layer.pixels[y][x]) {
                            this.ctx.fillStyle = layer.pixels[y][x];
                            this.ctx.fillRect(
                                x * this.pixelSize,
                                y * this.pixelSize,
                                this.pixelSize,
                                this.pixelSize
                            );
                        }
                    }
                }
            }
        });
        
        this.drawGrid();
    }
    
    renderPixel(x, y) {
        this.ctx.clearRect(
            x * this.pixelSize,
            y * this.pixelSize,
            this.pixelSize,
            this.pixelSize
        );
        
        let finalColor = null;
        for (const layer of this.layers) {
            if (layer.visible && layer.pixels[y][x]) {
                finalColor = layer.pixels[y][x];
            }
        }
        
        if (finalColor) {
            this.ctx.fillStyle = finalColor;
            this.ctx.fillRect(
                x * this.pixelSize,
                y * this.pixelSize,
                this.pixelSize,
                this.pixelSize
            );
        }
        
        this.drawGridCell(x, y);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let y = 0; y <= this.height; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.pixelSize);
            this.ctx.lineTo(this.canvas.width, y * this.pixelSize);
            this.ctx.stroke();
        }
        
        for (let x = 0; x <= this.width; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.pixelSize, 0);
            this.ctx.lineTo(x * this.pixelSize, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    drawGridCell(x, y) {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            x * this.pixelSize,
            y * this.pixelSize,
            this.pixelSize,
            this.pixelSize
        );
    }
    
    saveState() {
        const state = JSON.stringify({
            layers: this.layers.map(l => ({
                name: l.name,
                pixels: l.pixels,
                visible: l.visible
            })),
            currentLayerIndex: this.currentLayerIndex
        });
        
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(state);
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.updateHistoryButtons();
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadState(this.history[this.historyIndex]);
            this.updateHistoryButtons();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadState(this.history[this.historyIndex]);
            this.updateHistoryButtons();
        }
    }
    
    loadState(stateStr) {
        const state = JSON.parse(stateStr);
        this.layers = state.layers;
        this.currentLayerIndex = state.currentLayerIndex;
        this.updateLayersUI();
        this.render();
    }
    
    updateHistoryButtons() {
        document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
        document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
    }
    
    exportImage() {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.width;
        exportCanvas.height = this.height;
        const exportCtx = exportCanvas.getContext('2d');
        
        const format = document.getElementById('exportFormat').value;
        
        if (format === 'jpg') {
            exportCtx.fillStyle = '#FFFFFF';
            exportCtx.fillRect(0, 0, this.width, this.height);
        }
        
        this.layers.forEach(layer => {
            if (layer.visible) {
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        if (layer.pixels[y][x]) {
                            exportCtx.fillStyle = layer.pixels[y][x];
                            exportCtx.fillRect(x, y, 1, 1);
                        }
                    }
                }
            }
        });
        
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = exportCanvas.toDataURL(mimeType, 1.0);
        
        const link = document.createElement('a');
        link.download = `pixel-art-${Date.now()}.${format}`;
        link.href = dataUrl;
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PixelArtEditor();
});
