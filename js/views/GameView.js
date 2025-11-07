export class GameView {
  constructor(canvas) {
    // @CODE:GAME-001:RENDER - Canvas rendering engine initialization
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.spriteCache = new Map();
    this.performanceOverlay = {
      fps: 0,
      memoryUsage: 0,
      visible: false,
    };
  }

  async loadSprite(name, path) {
    // @CODE:GAME-001:RENDER - Sprite caching and loading
    if (!this.spriteCache.has(name)) {
      const image = new Image();
      image.src = path;
      await new Promise(resolve => {
        image.onload = resolve;
        image.onerror = () => {
          console.error(`Failed to load sprite: ${name}`);
          resolve(); // Resolve to prevent test blocking
        };
      });
      this.spriteCache.set(name, image);
    }
    return this.spriteCache.get(name);
  }

  async drawPlayer(x, y) {
    // @CODE:GAME-001:RENDER - Player sprite rendering
    const playerSprite = await this.loadSprite('luffy', 'luffy.png');
    if (playerSprite && playerSprite.complete && playerSprite.naturalWidth > 0) {
      this.ctx.drawImage(playerSprite, x, y);
    }
  }

  async drawObstacle(x, y) {
    // @CODE:GAME-001:RENDER - Obstacle sprite rendering
    const obstacleSprite = await this.loadSprite('akainu', 'akainu.png');
    if (obstacleSprite && obstacleSprite.complete && obstacleSprite.naturalWidth > 0) {
      this.ctx.drawImage(obstacleSprite, x, y);
    }
  }

  resizeCanvas(width, height) {
    // @CODE:GAME-001:RENDER - Responsive canvas scaling
    this.canvas.width = width;
    this.canvas.height = height;
  }

  updatePerformanceOverlay(fps, memoryUsage) {
    // @CODE:GAME-001:RENDER - Performance overlay update
    this.performanceOverlay.fps = fps;
    this.performanceOverlay.memoryUsage = memoryUsage;
  }

  renderPerformanceOverlay() {
    // @CODE:GAME-001:RENDER - Performance metrics rendering
    if (!this.performanceOverlay.visible) return;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(10, 10, 150, 80);
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`FPS: ${this.performanceOverlay.fps.toFixed(2)}`, 20, 30);
    this.ctx.fillText(`Memory: ${(this.performanceOverlay.memoryUsage / (1024 * 1024)).toFixed(2)} MB`, 20, 50);
  }

  clearCanvas() {
    // @CODE:GAME-001:RENDER - Clear canvas for next frame
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // @CODE:GAME-001:RENDER - Screen management methods
  showStartScreen() {
    const startScreen = document.getElementById('startScreen');
    const pauseButton = document.getElementById('pauseButton');
    if (startScreen) startScreen.style.display = 'flex';
    if (pauseButton) pauseButton.style.display = 'none';
  }

  hideStartScreen() {
    const startScreen = document.getElementById('startScreen');
    const pauseButton = document.getElementById('pauseButton');
    if (startScreen) startScreen.style.display = 'none';
    if (pauseButton) pauseButton.style.display = 'block';
  }

  showPauseScreen() {
    const pauseScreen = document.getElementById('pauseScreen');
    const pauseButton = document.getElementById('pauseButton');
    if (pauseScreen) pauseScreen.style.display = 'flex';
    if (pauseButton) pauseButton.style.display = 'none';
  }

  hidePauseScreen() {
    const pauseScreen = document.getElementById('pauseScreen');
    const pauseButton = document.getElementById('pauseButton');
    if (pauseScreen) pauseScreen.style.display = 'none';
    if (pauseButton) pauseButton.style.display = 'block';
  }

  showGameOverScreen(score = 0) {
    const gameOverScreen = document.getElementById('gameOverScreen');
    const pauseButton = document.getElementById('pauseButton');
    const finalScore = document.getElementById('finalScore');
    if (finalScore) {
      finalScore.textContent = `점수: ${Math.floor(score)}`;
    }
    if (gameOverScreen) gameOverScreen.style.display = 'flex';
    if (pauseButton) pauseButton.style.display = 'none';
  }

  hideGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    const pauseButton = document.getElementById('pauseButton');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    if (pauseButton) pauseButton.style.display = 'block';
  }

  togglePerformanceOverlay() {
    this.performanceOverlay.visible = !this.performanceOverlay.visible;
  }
}
