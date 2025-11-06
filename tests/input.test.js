// @TEST:GAME-001:INPUT Input System Test Suite

import { GameController } from '../js/controllers/GameController.js';
import { GameModel } from '../js/models/GameModel.js';

describe('Game Input System', () => {
  let gameController;
  let gameModel;

  beforeEach(() => {
    gameModel = new GameModel();
    gameController = new GameController(gameModel);
  });

  // @TEST:GAME-001:INPUT - Keyboard Input Responsiveness
  describe('Keyboard Input', () => {
    test('Keyboard input should update player position within 8ms', () => {
      const startTime = performance.now();

      // Simulate arrow key press (right)
      const keyEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      gameController.handleKeyboardInput(keyEvent);

      const endTime = performance.now();
      const inputLatency = endTime - startTime;

      expect(inputLatency).toBeLessThan(8);
    });

    test('WASD keys should move player in correct direction', () => {
      // Test each direction
      const testCases = [
        { key: 'a', expectedDirection: 'left' },
        { key: 'd', expectedDirection: 'right' },
        { key: 'w', expectedDirection: 'up' },
        { key: 's', expectedDirection: 'down' }
      ];

      testCases.forEach(({ key, expectedDirection }) => {
        const keyEvent = new KeyboardEvent('keydown', { key });
        const initialPosition = { ...gameModel.player.position };

        gameController.handleKeyboardInput(keyEvent);

        switch (expectedDirection) {
          case 'left':
            expect(gameModel.player.position.x).toBeLessThan(initialPosition.x);
            break;
          case 'right':
            expect(gameModel.player.position.x).toBeGreaterThan(initialPosition.x);
            break;
          case 'up':
            expect(gameModel.player.position.y).toBeLessThan(initialPosition.y);
            break;
          case 'down':
            expect(gameModel.player.position.y).toBeGreaterThan(initialPosition.y);
            break;
        }
      });
    });
  });

  // @TEST:GAME-001:INPUT - Touch/Mobile Input
  describe('Touch/Mobile Input', () => {
    test('Touch input should be detected and processed', () => {
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 }]
      });

      const initialPosition = { ...gameModel.player.position };
      gameController.handleTouchInput(touchEvent);

      // Check that touch moves the player
      expect(gameModel.player.position).not.toEqual(initialPosition);
    });

    test('Touch input should have <8ms latency', () => {
      const startTime = performance.now();

      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 }]
      });

      gameController.handleTouchInput(touchEvent);

      const endTime = performance.now();
      const inputLatency = endTime - startTime;

      expect(inputLatency).toBeLessThan(8);
    });
  });

  // @TEST:GAME-001:INPUT - Input Method Detection
  describe('Input Method Detection', () => {
    test('Should detect and log input method', () => {
      const mockLogMethod = jest.spyOn(console, 'log');

      // Simulate keyboard input
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      gameController.detectInputMethod(keyboardEvent);
      expect(mockLogMethod).toHaveBeenCalledWith('Input Method: Keyboard');

      // Simulate touch input
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      gameController.detectInputMethod(touchEvent);
      expect(mockLogMethod).toHaveBeenCalledWith('Input Method: Touch');
    });
  });

  // @TEST:GAME-001:INPUT - Input History for Debugging
  describe('Input History', () => {
    test('Should maintain input history for debugging', () => {
      const keyEvents = [
        new KeyboardEvent('keydown', { key: 'ArrowRight' }),
        new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      ];

      keyEvents.forEach(event => gameController.handleKeyboardInput(event));

      expect(gameController.inputHistory.length).toBe(2);
      expect(gameController.inputHistory[0].type).toBe('keyboard');
      expect(gameController.inputHistory[1].type).toBe('keyboard');
    });
  });
});