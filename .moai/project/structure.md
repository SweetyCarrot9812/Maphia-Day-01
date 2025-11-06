# System Architecture: Portfolio Game Demo

## Meta
- **Architecture Style**: Simple MVC Pattern (Game-Optimized)
- **Design Philosophy**: Clean separation of concerns with performance focus
- **Scalability Target**: Modular design for feature extensibility
- **Performance Priority**: 60 FPS real-time constraints

---

## 🏗️ Architecture Overview

### Design Rationale
**Selected Pattern**: Simple MVC (Model-View-Controller)

**Why MVC for Games**:
- **Model**: Game state, score, level management
- **View**: Canvas rendering, UI display
- **Controller**: User input, game logic coordination

**Benefits for Portfolio**:
- Clear, understandable structure for technical evaluation
- Demonstrates separation of concerns mastery
- Familiar pattern for interviewer assessment
- Supports real-time game requirements

---

## 📁 Project Structure

```
obstacle-game/
├── index.html                    # Entry point & Canvas setup
├── css/
│   └── style.css                # Styling & responsive design
├── js/
│   ├── main.js                  # App initialization & game loop
│   ├── models/                  # Data layer (Model)
│   │   ├── GameModel.js        # Central game state management
│   │   └── entities/
│   │       ├── Player.js       # Player entity with physics
│   │       └── Obstacle.js     # Obstacle entity with pooling
│   ├── views/                   # Presentation layer (View)
│   │   ├── GameView.js         # Canvas rendering engine
│   │   └── UIView.js           # UI elements & overlays
│   └── controllers/             # Logic layer (Controller)
│       └── GameController.js   # Input handling & game logic
└── README.md                    # Technical documentation
```

### File Responsibility Matrix
| File | Primary Responsibility | Key Features | Lines of Code |
|------|----------------------|--------------|---------------|
| **main.js** | App initialization | Game loop, object wiring | ~150 |
| **GameModel.js** | State management | Score, level, game state | ~200 |
| **Player.js** | Player logic | Movement, collision bounds | ~120 |
| **Obstacle.js** | Obstacle logic | Spawning, physics, pooling | ~100 |
| **GameView.js** | Canvas rendering | 60 FPS drawing, animations | ~250 |
| **UIView.js** | UI management | Score display, menus | ~150 |
| **GameController.js** | Game coordination | Input processing, logic flow | ~300 |

---

## 🔄 MVC Data Flow Architecture

### Core Interaction Pattern
```
User Input (Keyboard/Mouse/Touch)
        ↓
   GameController ← → GameModel (State Updates)
        ↓                ↓
   GameView ← ← ← ← ← ← ← ←
   UIView
        ↓
   Canvas Rendering
        ↓
   Visual Feedback to User
```

### Detailed Flow Examples

#### Flow 1: User Input Processing
```
1. GameController.handleInput() - Capture & validate input
2. Player.move() - Calculate new position
3. GameModel.update() - Update central state
4. GameView.render() - Refresh canvas display
```

#### Flow 2: Collision Detection
```
1. GameController.checkCollision() - AABB collision detection
2. GameModel.gameOver() - Transition game state
3. UIView.showGameOver() - Display end screen
4. GameModel.saveScore() - Persist high scores
```

---

## 🧩 Core Class Architecture

### GameModel (Model Layer)
**Purpose**: Central state management with immutable updates

```javascript
class GameModel {
  constructor() {
    this.score = 0
    this.level = 1
    this.gameState = 'ready' // 'ready' | 'playing' | 'paused' | 'gameover'
    this.player = new Player()
    this.obstacles = []
    this.highScores = this.loadHighScores()
  }

  // State management methods
  update(deltaTime) { /* Frame-based updates */ }
  addScore(points) { /* Score calculation */ }
  levelUp() { /* Difficulty progression */ }
  saveHighScore() { /* LocalStorage persistence */ }
}
```

### GameView (View Layer)
**Purpose**: High-performance Canvas rendering with optimization

```javascript
class GameView {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dirtyRegions = [] // Optimization: partial redraws
  }

  // Rendering pipeline
  render(gameModel) { /* 60 FPS rendering loop */ }
  drawPlayer(player) { /* Player sprite rendering */ }
  drawObstacles(obstacles) { /* Batch obstacle rendering */ }
  drawBackground() { /* Background layer management */ }
}
```

### GameController (Controller Layer)
**Purpose**: Input coordination and game logic orchestration

```javascript
class GameController {
  constructor(model, view, uiView) {
    this.model = model
    this.view = view
    this.uiView = uiView
    this.setupEventListeners()
  }

  // Game logic coordination
  update(deltaTime) { /* Frame update pipeline */ }
  handleInput(event) { /* Multi-modal input processing */ }
  checkCollisions() { /* Spatial collision detection */ }
  startGame() { /* Game state transitions */ }
}
```

---

## ⚡ Performance Optimization Patterns

### Pattern 1: Object Pooling
**Purpose**: Minimize garbage collection for real-time performance

```javascript
class ObstaclePool {
  constructor(size = 50) {
    this.pool = []
    this.active = []

    // Pre-allocate objects
    for (let i = 0; i < size; i++) {
      this.pool.push(new Obstacle())
    }
  }

  acquire() {
    const obj = this.pool.pop() || new Obstacle()
    this.active.push(obj)
    return obj
  }

  release(obstacle) {
    obstacle.reset()
    const index = this.active.indexOf(obstacle)
    if (index > -1) {
      this.active.splice(index, 1)
      this.pool.push(obstacle)
    }
  }
}
```

### Pattern 2: Dirty Flag Rendering
**Purpose**: Avoid unnecessary redraws for 60 FPS stability

```javascript
class GameModel {
  constructor() {
    this.isDirty = true // Tracks if redraw needed
  }

  update() {
    if (this.hasChanges()) {
      this.isDirty = true
    }
  }
}

class GameView {
  render(model) {
    if (model.isDirty) { // Only redraw when necessary
      this.clearCanvas()
      this.drawEverything(model)
      model.isDirty = false
    }
  }
}
```

### Pattern 3: Spatial Partitioning
**Purpose**: Optimize collision detection from O(n²) to O(n)

```javascript
class SpatialGrid {
  constructor(worldWidth, worldHeight, cellSize = 64) {
    this.cellSize = cellSize
    this.grid = new Map()
  }

  insert(entity) {
    const cell = this.getCell(entity.x, entity.y)
    if (!this.grid.has(cell)) {
      this.grid.set(cell, [])
    }
    this.grid.get(cell).push(entity)
  }

  query(entity) {
    const cell = this.getCell(entity.x, entity.y)
    return this.grid.get(cell) || []
  }
}
```

---

## 🔌 Dependency Injection Pattern

### Main Application Bootstrap
**Purpose**: Loose coupling and testability

```javascript
class Game {
  constructor() {
    // Create core components
    this.canvas = document.getElementById('gameCanvas')
    this.model = new GameModel()
    this.view = new GameView(this.canvas)
    this.uiView = new UIView()

    // Inject dependencies
    this.controller = new GameController(
      this.model,    // Model dependency
      this.view,     // View dependency
      this.uiView    // UI dependency
    )
  }

  start() {
    this.gameLoop()
  }

  gameLoop() {
    const deltaTime = this.calculateDeltaTime()

    // Update → Render pipeline
    this.controller.update(deltaTime)
    this.view.render(this.model)
    this.uiView.update(this.model)

    requestAnimationFrame(() => this.gameLoop())
  }
}

// Application entry point
const game = new Game()
game.start()
```

---

## 🧪 Testing Architecture

### Testable Design Patterns

#### Unit Testing Strategy
**Target**: Critical game logic with mock dependencies

```javascript
describe('GameModel', () => {
  test('score calculation accuracy', () => {
    const model = new GameModel()
    model.addScore(100)
    expect(model.score).toBe(100)
  })

  test('level progression logic', () => {
    const model = new GameModel()
    model.playTime = 60000 // 1 minute
    model.update()
    expect(model.level).toBe(2) // Level up every 30 seconds
  })
})
```

#### Integration Testing
**Target**: Component interaction with controlled environments

```javascript
describe('GameController Integration', () => {
  test('collision detection workflow', () => {
    const mockModel = { gameOver: jest.fn() }
    const controller = new GameController(mockModel)

    controller.handleCollision()
    expect(mockModel.gameOver).toHaveBeenCalled()
  })
})
```

---

## 📈 Scalability & Extension Points

### Modular Extension Strategy

#### Adding New Game Features
```javascript
// New game feature can be added as separate modules
class PowerUp {  // New Model component
  constructor() { /* Power-up logic */ }
}

class PowerUpView {  // New View component
  render() { /* Power-up rendering */ }
}

// Extend existing Controller
class GameController {
  handlePowerUp(powerUp) {  // New logic integration
    this.model.applyPowerUp(powerUp)
  }
}
```

#### Plugin Architecture Potential
- **Audio System**: Separate audio manager with Web Audio API
- **Particle Effects**: Dedicated particle rendering system
- **Analytics**: Game metrics collection and reporting
- **Themes**: Swappable visual and audio themes

---

## 🔍 Code Quality Standards

### Architecture Compliance Checklist
- [ ] **MVC Separation**: No rendering code in Model, no business logic in View
- [ ] **Single Responsibility**: Each class has one primary purpose
- [ ] **Dependency Injection**: Constructor-based dependency management
- [ ] **Interface Segregation**: Clean, minimal public APIs

### Performance Architecture Requirements
- [ ] **60 FPS Target**: All rendering optimizations implemented
- [ ] **Memory Management**: Object pooling for frequent allocations
- [ ] **Input Responsiveness**: <8ms input-to-display latency
- [ ] **Graceful Degradation**: Performance fallbacks for slower devices

### Maintainability Standards
- [ ] **Documentation**: JSDoc for all public methods
- [ ] **Naming Conventions**: Clear, descriptive class and method names
- [ ] **Error Handling**: Comprehensive error boundaries
- [ ] **Logging**: Structured logging for debugging and monitoring

---

## 🎯 Architecture Success Metrics

### Technical Excellence Indicators
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| **Coupling Score** | <3 dependencies per class | Static analysis |
| **Cyclomatic Complexity** | <10 per method | Code analysis tools |
| **Test Coverage** | >80% for core logic | Jest coverage reports |
| **Performance Budget** | 60 FPS sustained | Real-time monitoring |

### Portfolio Demonstration Value
- **Architecture Discussion**: Clear MVC implementation walkthrough
- **Design Decisions**: Rationale for each architectural choice
- **Performance Engineering**: Optimization patterns and their impact
- **Extensibility**: How new features could be added cleanly

---

**Architecture Philosophy**: "Simple enough to understand in a 15-minute technical discussion, sophisticated enough to demonstrate senior-level design thinking."