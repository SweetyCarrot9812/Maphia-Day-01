// @CODE:GAME-001:PHYSICS Player Physics and Movement
export class Player {
  constructor(x, y, width = 50, height = 50, speed = 5) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;

    // Canvas boundaries (will be set by game model)
    this.canvasWidth = 800;
    this.canvasHeight = 600;
  }

  // Movement methods with boundary checking
  moveUp() {
    this.y = Math.max(0, this.y - this.speed);
  }

  moveDown() {
    this.y = Math.min(
      this.canvasHeight - this.height,
      this.y + this.speed
    );
  }

  moveLeft() {
    this.x = Math.max(0, this.x - this.speed);
  }

  moveRight() {
    this.x = Math.min(
      this.canvasWidth - this.width,
      this.x + this.speed
    );
  }

  // Update canvas boundaries if needed
  setCanvasBoundaries(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}