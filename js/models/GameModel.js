// @CODE:GAME-001:ENGINE
/**
 * Game model representing the core game state and loop
 * Manages game lifecycle, state, and performance tracking
 * @CODE:GAME-001:PHYSICS Includes collision detection
 */
export class GameModel {
  constructor(canvasWidth = 800, canvasHeight = 600) {
    // @TAG:GAME-001:STATE Initial game state
    this.state = 'ready';  // Expanded state tracking
    this.score = 0;
    this.level = 1;  // Current level (1-99)
    this.playTime = 0;  // Total play time in seconds
    this.levelTimer = 0;  // Timer for level-up (resets every 30s)
    this.fps = 0;
    this.isRunning = false;

    // Canvas dimensions
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Frame tracking for performance monitoring
    this._lastFrameTime = 0;
    this._frameCount = 0;
    this._fpsUpdateInterval = 1000; // Update FPS every second

    // @CODE:GAME-001:INPUT - Input-related model state
    this.player = {
      x: canvasWidth / 2,
      y: canvasHeight - 100,
      width: 50,  // Assumed player width
      height: 50, // Assumed player height
      speed: 10
    };

    // @CODE:GAME-001:PHYSICS - Initialize obstacle list
    this.obstacles = [];
    this._initializeObstacles();
  }

  // @CODE:GAME-001:INPUT - Game state management
  setState(newState) {
    const validStates = ['ready', 'playing', 'paused', 'gameover'];
    if (!validStates.includes(newState)) {
      throw new Error(`Invalid game state: ${newState}`);
    }

    // State transition logic
    switch (newState) {
      case 'playing':
        if (!this.isRunning) {
          this.isRunning = true;
        }
        break;
      case 'paused':
        this.isRunning = false;
        break;
      case 'gameover':
        this.isRunning = false;
        this._updateHighScore();
        break;
    }

    this.state = newState;
  }

  /**
   * Start the game
   * @TAG:GAME-001:START
   */
  start() {
    this.isRunning = true;
    this.score = 0;
    this.level = 1;
    this.playTime = 0;
    this.levelTimer = 0;
    this._initializeObstacles();
  }

  /**
   * Stop the game
   * @TAG:GAME-001:STOP
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Reset game state
   * @TAG:GAME-001:RESET
   */
  reset() {
    this.player.x = this.canvasWidth / 2;
    this.player.y = this.canvasHeight - 100;
    this.score = 0;
    this.level = 1;
    this.playTime = 0;
    this.levelTimer = 0;
    this._initializeObstacles();
    this.setState('ready');
  }

  /**
   * Update game state each frame
   * @param {number} deltaTime - Time since last frame
   * @CODE:GAME-001:UPDATE Game state update method
   */
  update(deltaTime) {
    if (!this.isRunning || this.state !== 'playing') return;

    // Update play time
    const deltaSeconds = deltaTime / 1000;
    this.playTime += deltaSeconds;
    this.levelTimer += deltaSeconds;

    // Level-up every 30 seconds (max level 99)
    if (this.levelTimer >= 30 && this.level < 99) {
      this.level++;
      this.levelTimer = 0;
    }

    // Calculate score: time×10 + level bonus (every 5 levels = +250)
    const timeScore = this.playTime * 10;
    const levelBonus = Math.floor(this.level / 5) * 250;
    this.score = timeScore + levelBonus;

    // Update obstacles
    this._updateObstacles(deltaTime);

    // Check collisions
    this._checkCollisions();
  }

  // @CODE:GAME-001:PHYSICS - Obstacle management
  _initializeObstacles() {
    this.obstacles = [];
    // Spawn initial obstacles
    for (let i = 0; i < 5; i++) {
      this._spawnObstacle();
    }
  }

  _spawnObstacle() {
    // Randomly select obstacle type
    const rand = Math.random();
    let type, width, height, baseSpeed;

    if (rand < 0.6) {
      // 60% chance - Normal obstacle
      type = 'normal';
      width = 50;
      height = 50;
      baseSpeed = 3;
    } else if (rand < 0.85) {
      // 25% chance - Fast obstacle
      type = 'fast';
      width = 40;
      height = 40;
      baseSpeed = 6;
    } else {
      // 15% chance - Large obstacle
      type = 'large';
      width = 70;
      height = 70;
      baseSpeed = 2;
    }

    // Apply difficulty scaling based on level
    // Speed increases by 0.1 per level, max 2x base speed
    const speedMultiplier = Math.min(1 + (this.level - 1) * 0.1, 2.0);
    const speed = baseSpeed * speedMultiplier;

    const obstacle = {
      x: Math.random() * (this.canvasWidth - width),
      y: -height,
      width: width,
      height: height,
      speed: speed,
      type: type
    };
    this.obstacles.push(obstacle);
  }

  _updateObstacles(deltaTime) {
    // Move obstacles downward
    this.obstacles.forEach(obstacle => {
      obstacle.y += obstacle.speed * (deltaTime / 16); // Normalize to ~60fps
    });

    // Remove obstacles that have gone off screen
    this.obstacles = this.obstacles.filter(obstacle =>
      obstacle.y < this.canvasHeight
    );

    // Spawn new obstacles with level-based spawn rate
    // Base spawn rate: 0.02 (2% per frame at 60fps)
    // Increases by 0.005 per level, max 0.08 (8%)
    const baseSpawnRate = 0.02;
    const spawnRateIncrease = 0.005;
    const maxSpawnRate = 0.08;
    const currentSpawnRate = Math.min(
      baseSpawnRate + (this.level - 1) * spawnRateIncrease,
      maxSpawnRate
    );

    if (Math.random() < currentSpawnRate) {
      this._spawnObstacle();
    }
  }

  /**
   * AABB Collision detection for game entities
   * @param {Object} entity1 - First game entity
   * @param {Object} entity2 - Second game entity
   * @returns {boolean} Whether entities are colliding
   * @CODE:GAME-001:PHYSICS Axis-Aligned Bounding Box collision
   */
  checkCollision(entity1, entity2) {
    return !(
      entity1.x > entity2.x + entity2.width ||
      entity1.x + entity1.width < entity2.x ||
      entity1.y > entity2.y + entity2.height ||
      entity1.y + entity1.height < entity2.y
    );
  }

  // @CODE:GAME-001:PHYSICS - Collision and game over detection
  _checkCollisions() {
    for (let obstacle of this.obstacles) {
      if (this.checkCollision(this.player, obstacle)) {
        this.setState('gameover');
        return;
      }
    }
  }

  /**
   * Update high score in local storage
   * @CODE:GAME-001:INPUT High score management
   */
  _updateHighScore() {
    const highScore = localStorage.getItem('highScore') || 0;
    if (this.score > highScore) {
      localStorage.setItem('highScore', this.score);
    }
  }
}