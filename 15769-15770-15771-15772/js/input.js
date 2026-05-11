export class InputManager {
    constructor() {
        this.listeners = [];
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;

        this.setupKeyboard();
        this.setupTouch();
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        const callbacks = this.listeners[event];
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    setupKeyboard() {
        document.addEventListener('keydown', (event) => {
            const keyMap = {
                38: 'up',
                40: 'down',
                37: 'left',
                39: 'right'
            };

            const direction = keyMap[event.which];
            if (direction) {
                event.preventDefault();
                this.emit('move', direction);
            }
        });
    }

    setupTouch() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        gameBoard.addEventListener('touchstart', (event) => {
            if (event.touches.length > 1) return;
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
        }, { passive: true });

        gameBoard.addEventListener('touchend', (event) => {
            if (event.changedTouches.length > 1) return;
            this.touchEndX = event.changedTouches[0].clientX;
            this.touchEndY = event.changedTouches[0].clientY;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX < this.minSwipeDistance && absDeltaY < this.minSwipeDistance) {
            return;
        }

        let direction;
        if (absDeltaX > absDeltaY) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        this.emit('move', direction);
    }
}
