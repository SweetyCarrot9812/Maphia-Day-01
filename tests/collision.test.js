import { Player } from '../js/models/Player.js';
import { Obstacle } from '../js/models/Obstacle.js';
import { GameModel } from '../js/models/GameModel.js';

// @TEST:GAME-001:COLLISION Collision and Physics Test Suite
describe('Physics and Collision System', () => {
  let gameModel, player, obstacle;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  beforeEach(() => {
    // Setup a fresh game model and entities before each test
    gameModel = new GameModel(CANVAS_WIDTH, CANVAS_HEIGHT);
    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    obstacle = new Obstacle(100, 100);
  });

  // @TEST:GAME-001:COLLISION Player Movement Tests
  describe('Player Movement', () => {
    test('Player can move up within canvas boundaries', () => {
      const initialY = player.y;
      player.moveUp();
      expect(player.y).toBeLessThan(initialY);
      expect(player.y).toBeGreaterThanOrEqual(0);
    });

    test('Player can move down within canvas boundaries', () => {
      const initialY = player.y;
      player.moveDown();
      expect(player.y).toBeGreaterThan(initialY);
      expect(player.y).toBeLessThanOrEqual(CANVAS_HEIGHT - player.height);
    });

    test('Player cannot move outside canvas boundaries', () => {
      // Move player to top boundary
      player.y = 0;
      player.moveUp();
      expect(player.y).toBe(0);

      // Move player to bottom boundary
      player.y = CANVAS_HEIGHT - player.height;
      player.moveDown();
      expect(player.y).toBe(CANVAS_HEIGHT - player.height);
    });
  });

  // @TEST:GAME-001:COLLISION AABB Collision Detection Tests
  describe('AABB Collision Detection', () => {
    test('Detects collision between player and obstacle', () => {
      // Position player and obstacle to overlap
      player.x = 100;
      player.y = 100;
      obstacle.x = 100;
      obstacle.y = 100;

      const isColliding = gameModel.checkCollision(player, obstacle);
      expect(isColliding).toBeTruthy();
    });

    test('Does not detect collision when objects do not overlap', () => {
      player.x = 0;
      player.y = 0;
      obstacle.x = 200;
      obstacle.y = 200;

      const isColliding = gameModel.checkCollision(player, obstacle);
      expect(isColliding).toBeFalsy();
    });
  });

  // @TEST:GAME-001:PHYSICS Obstacle Object Pooling Tests
  describe('Obstacle Object Pooling', () => {
    test('Can acquire and release obstacles from pool', () => {
      const initialPoolSize = Obstacle.pool.length;
      const acquiredObstacle = Obstacle.acquire(100, 100);

      expect(acquiredObstacle).toBeInstanceOf(Obstacle);
      expect(Obstacle.pool.length).toBe(initialPoolSize - 1);

      Obstacle.release(acquiredObstacle);
      expect(Obstacle.pool.length).toBe(initialPoolSize);
    });

    test('Reuses obstacles from pool efficiently', () => {
      const initialPoolSize = Obstacle.pool.length;
      const obstacles = [
        Obstacle.acquire(100, 100),
        Obstacle.acquire(200, 200),
        Obstacle.acquire(300, 300)
      ];

      expect(Obstacle.pool.length).toBe(initialPoolSize - 3);

      obstacles.forEach(obs => Obstacle.release(obs));
      expect(Obstacle.pool.length).toBe(initialPoolSize);
    });
  });

  // @TEST:GAME-001:PHYSICS Performance Monitoring
  describe('Physics Performance', () => {
    test('Collision detection is performant', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        gameModel.checkCollision(player, obstacle);
      }
      const end = performance.now();
      const duration = end - start;

      // Ensure collision checks complete within 16ms frame budget
      expect(duration).toBeLessThan(16);
    });
  });
});