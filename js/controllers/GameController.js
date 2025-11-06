// @CODE:GAME-001:INPUT Game Input Controller

export class GameController {
  constructor(gameModel, gameView) {
    // @CODE:GAME-001:RENDER - Controller initialization
    this.model = gameModel;
    this.view = gameView;

    // Performance tracking variables
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.fps = 0;

    // @CODE:GAME-001:INPUT - Input tracking
    this.inputHistory = [];
    this.inputMethodCache = null;

    // Bind input event handlers
    this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
    this.handleTouchInput = this.handleTouchInput.bind(this);
    this.initializeInputListeners();
  }

  // @CODE:GAME-001:INPUT - Initialize Input Event Listeners
  initializeInputListeners() {
    // Desktop/Keyboard Input
    window.addEventListener('keydown', this.handleKeyboardInput);

    // Mobile/Touch Input
    window.addEventListener('touchstart', this.handleTouchInput);
    window.addEventListener('touchmove', this.handleTouchInput);
  }

  update(deltaTime) {
    // @CODE:GAME-001:RENDER - Game state update
    this.model.update(deltaTime);

    // Performance tracking
    this.trackFPS(deltaTime);
  }

  async render() {
    // @CODE:GAME-001:RENDER - Rendering game state
    // Clear previous frame
    this.view.clearCanvas();

    // Render player
    await this.view.drawPlayer(this.model.player.x, this.model.player.y);

    // Render obstacles
    for (let obstacle of this.model.obstacles) {
      await this.view.drawObstacle(obstacle.x, obstacle.y);
    }

    // Update and render performance overlay
    this.view.updatePerformanceOverlay(this.fps, this.getMemoryUsage());
    this.view.renderPerformanceOverlay();
  }

  // @CODE:GAME-001:INPUT - Keyboard Input Handling
  handleKeyboardInput(event) {
    this.detectInputMethod(event);

    const movementSpeed = 10; // Configurable speed
    const player = this.model.player;

    const inputRecord = {
      type: 'keyboard',
      key: event.key,
      timestamp: performance.now()
    };
    this.inputHistory.push(inputRecord);

    // Limit input history to last 20 inputs
    if (this.inputHistory.length > 20) {
      this.inputHistory.shift();
    }

    switch (event.key.toLowerCase()) {
      case 'arrowright':
      case 'd':
        player.x += movementSpeed;
        break;
      case 'arrowleft':
      case 'a':
        player.x -= movementSpeed;
        break;
      case 'arrowup':
      case 'w':
        player.y -= movementSpeed;
        break;
      case 'arrowdown':
      case 's':
        player.y += movementSpeed;
        break;
      case 'f':
        // Toggle performance overlay
        this.view.togglePerformanceOverlay();
        break;
    }

    // Constrain player to game boundaries
    this.constrainPlayerPosition();
  }

  // @CODE:GAME-001:INPUT - Touch/Mobile Input Handling
  handleTouchInput(event) {
    this.detectInputMethod(event);

    const canvas = this.view.canvas;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];

    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const inputRecord = {
      type: 'touch',
      x: touchX,
      y: touchY,
      timestamp: performance.now()
    };
    this.inputHistory.push(inputRecord);

    // Limit input history to last 20 inputs
    if (this.inputHistory.length > 20) {
      this.inputHistory.shift();
    }

    // Move player towards touch point
    const player = this.model.player;
    const deltaX = touchX - player.x;
    const deltaY = touchY - player.y;

    // Smooth touch movement
    const smoothingFactor = 0.2;
    player.x += deltaX * smoothingFactor;
    player.y += deltaY * smoothingFactor;

    this.constrainPlayerPosition();
  }

  // @CODE:GAME-001:INPUT - Player Position Boundary Constraint
  constrainPlayerPosition() {
    const player = this.model.player;
    const canvas = this.view.canvas;

    player.x = Math.max(0,
      Math.min(player.x, canvas.width - player.width)
    );
    player.y = Math.max(0,
      Math.min(player.y, canvas.height - player.height)
    );
  }

  // @CODE:GAME-001:INPUT - Input Method Detection
  detectInputMethod(event) {
    let currentMethod = 'Unknown';

    if (event instanceof KeyboardEvent) {
      currentMethod = 'Keyboard';
    } else if (event instanceof TouchEvent) {
      currentMethod = 'Touch';
    }

    // Only log if method changed to avoid spam
    if (currentMethod !== this.inputMethodCache) {
      console.log(`Input Method: ${currentMethod}`);
      this.inputMethodCache = currentMethod;
    }
  }

  // @CODE:GAME-001:INPUT - Game State Control Methods
  startGame() {
    this.model.setState('playing');
    this.view.showGameScreen();
  }

  pauseGame() {
    this.model.setState('paused');
    this.view.showPauseScreen();
  }

  resumeGame() {
    this.model.setState('playing');
    this.view.hideOverlays();
  }

  gameOver() {
    this.model.setState('gameover');
    this.view.showGameOverScreen(this.model.score);
    this.saveHighScore();
  }

  // Existing methods below...
  trackFPS(deltaTime) {
    // @CODE:GAME-001:RENDER - FPS calculation
    this.frameCount++;
    this.lastFpsUpdate += deltaTime;

    // Update FPS every second
    if (this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount * 1000 / this.lastFpsUpdate;
      this.frameCount = 0;
      this.lastFpsUpdate = 0;
    }
  }

  getMemoryUsage() {
    // @CODE:GAME-001:RENDER - Memory usage tracking
    if (window.performance && window.performance.memory) {
      return window.performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  resizeCanvas(width, height) {
    // @CODE:GAME-001:RENDER - Delegate canvas resize
    this.view.resizeCanvas(width, height);
  }

  // @CODE:GAME-001:INPUT - High Score Management
  saveHighScore() {
    const currentScore = this.model.score;
    const highScore = localStorage.getItem('highScore') || 0;

    if (currentScore > highScore) {
      localStorage.setItem('highScore', currentScore);
    }
  }

  // @CODE:GAME-001:INPUT - Game Restart
  restartGame() {
    this.model.reset();
    this.startGame();
  }
}