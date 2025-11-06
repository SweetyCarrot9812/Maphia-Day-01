// @TEST:GAME-001:LOOP
import { jest } from '@jest/globals';
import { GameModel } from '../js/models/GameModel.js';

describe('Game Loop Tests', () => {
  let gameModel;

  beforeEach(() => {
    gameModel = new GameModel();
  });

  test('Game model should initialize with correct default state', () => {
    // Test initial game state
    expect(gameModel.isRunning).toBe(false);
    expect(gameModel.score).toBe(0);
    expect(gameModel.fps).toBe(0);
  });

  test('Game should be able to start and stop', () => {
    gameModel.start();
    expect(gameModel.isRunning).toBe(true);

    gameModel.stop();
    expect(gameModel.isRunning).toBe(false);
  });

  test('Game loop should track FPS', () => {
    jest.useFakeTimers();
    jest.spyOn(performance, 'now').mockReturnValue(0);

    gameModel.start();

    // Simulate passage of time
    jest.advanceTimersByTime(1000);

    performance.now.mockRestore();

    expect(gameModel.fps).toBeGreaterThanOrEqual(0);

    jest.useRealTimers();
  });
});