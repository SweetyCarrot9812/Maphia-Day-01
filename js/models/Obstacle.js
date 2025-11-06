// @CODE:GAME-001:PHYSICS Obstacle Entity with Object Pooling
export class Obstacle {
  static pool = [];
  static POOL_SIZE = 100;
  static INITIAL_POOL_PREFILL = 10;

  constructor(x, y, width = 30, height = 30) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
  }

  // Pre-fill the pool on first import
  static {
    for (let i = 0; i < this.INITIAL_POOL_PREFILL; i++) {
      this.pool.push(new Obstacle(0, 0));
    }
  }

  // Object Pooling Static Methods
  static acquire(x, y) {
    if (this.pool.length > 0) {
      const obstacle = this.pool.pop();
      obstacle.x = x;
      obstacle.y = y;
      obstacle.active = true;
      return obstacle;
    }
    return new Obstacle(x, y);
  }

  static release(obstacle) {
    if (this.pool.length < this.POOL_SIZE) {
      obstacle.active = false;
      this.pool.push(obstacle);
    }
  }

  // Optional movement method for dynamic obstacles
  update(speed = 2) {
    this.y += speed;
  }
}