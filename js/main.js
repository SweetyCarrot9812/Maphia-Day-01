// @CODE:GAME-001:RENDER - Game initialization and main loop
import { GameModel } from './models/GameModel.js';
import { GameView } from './views/GameView.js';
import { GameController } from './controllers/GameController.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');

    // @CODE:GAME-001:INPUT - User interface initialization
    this.initializeUserInterface();

    // Handle window resizing
    window.addEventListener('resize', () => this.handleResize());

    // Initialize game components
    this.model = new GameModel();
    this.view = new GameView(this.canvas);
    this.controller = new GameController(this.model, this.view);

    // Game loop variables
    this.lastFrameTime = 0;
  }

  // @CODE:GAME-001:INPUT - User Interface Initialization
  initializeUserInterface() {
    // Start Game Button
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
      this.model.setState('playing');
      this.view.hideStartScreen();
    });

    // Pause Button
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.addEventListener('click', () => {
      this.model.setState('paused');
      this.view.showPauseScreen();
    });

    // Restart Button (Game Over Screen)
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', () => {
      this.controller.restartGame();
      this.view.hideGameOverScreen();
    });

    // Performance Overlay Toggle (F key)
    window.addEventListener('keydown', (event) => {
      if (event.key === 'f' || event.key === 'F') {
        this.view.togglePerformanceOverlay();
      }
    });
  }

  handleResize() {
    // @CODE:GAME-001:RENDER - Responsive canvas resizing
    const aspectRatio = 16 / 9; // Desired aspect ratio
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Maintain aspect ratio
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }

    this.canvas.width = width;
    this.canvas.height = height;

    // Update game components with new dimensions
    this.model.canvasWidth = width;
    this.model.canvasHeight = height;
    this.controller.resizeCanvas(width, height);

    // Reposition player to center of new canvas size
    this.model.player.x = width / 2;
    this.model.player.y = height - 100;
  }

  gameLoop(currentTime) {
    // @CODE:GAME-001:RENDER - Adaptive game loop
    // Calculate delta time
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update and render only in 'playing' state
    if (this.model.state === 'playing') {
      // Update game state
      this.controller.update(deltaTime);

      // Render game state
      this.controller.render();
    }

    // Request next animation frame
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  start() {
    // @CODE:GAME-001:INPUT - Game start sequence
    // Initialize canvas and start game loop
    this.handleResize(); // Initial sizing

    // Show start screen
    this.view.showStartScreen();

    // Begin game loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}

// @CODE:GAME-001:INPUT - Game Initialization
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});