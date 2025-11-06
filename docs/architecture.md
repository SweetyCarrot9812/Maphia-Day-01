# Architecture: 장애물 피하기 게임

## Meta
- 작성일: 2025-11-07
- 작성자: Portfolio Project
- 버전: 1.0

---

## 🎯 아키텍처 목표

**포트폴리오 어필 포인트**:
- 깔끔한 코드 구조 능력
- MVC 패턴 이해도
- 객체지향 프로그래밍 기초 실력

---

## 🏗️ 아키텍처 스타일

### 선정: **Simple MVC Pattern**

```yaml
architecture_style: Simple MVC (Game-optimized)
rationale:
  - 포트폴리오용 → 이해하기 쉬운 구조
  - 게임 특성 → 실시간 상태 관리
  - Vanilla JS → 프레임워크 복잡성 제거
  - 5개 파일 → 적당한 구조화 레벨
```

**MVC가 게임에 적합한 이유**:
- **Model**: 게임 상태, 점수, 레벨 관리
- **View**: Canvas 렌더링, UI 표시
- **Controller**: 사용자 입력, 게임 로직

---

## 📁 파일 구조

```
obstacle-game/
├── index.html              # 진입점
├── css/
│   └── style.css           # 스타일
├── js/
│   ├── main.js            # 앱 진입점 & 게임 루프
│   ├── models/
│   │   ├── GameModel.js   # 게임 상태 관리 (Model)
│   │   └── entities/
│   │       ├── Player.js   # 플레이어 엔티티
│   │       └── Obstacle.js # 장애물 엔티티
│   ├── views/
│   │   ├── GameView.js    # Canvas 렌더링 (View)
│   │   └── UIView.js      # UI 요소 관리 (View)
│   └── controllers/
│       └── GameController.js # 게임 로직 제어 (Controller)
└── README.md               # 프로젝트 설명
```

### 🎮 파일별 역할 정의

| 파일 | 역할 | 주요 기능 |
|------|------|-----------|
| **main.js** | 앱 시작점 | 게임 루프, 객체 연결 |
| **GameModel.js** | 상태 관리 | 점수, 레벨, 게임 상태 |
| **Player.js** | 플레이어 | 위치, 이동, 충돌 판정 |
| **Obstacle.js** | 장애물 | 생성, 이동, 충돌 영역 |
| **GameView.js** | 렌더링 | Canvas 그리기, 애니메이션 |
| **UIView.js** | UI 관리 | 점수 표시, 메뉴, 오버레이 |
| **GameController.js** | 게임 제어 | 입력 처리, 로직 조합 |

---

## 🔄 MVC 상호작용 흐름

```
User Input (키보드/마우스/터치)
        ↓
   GameController ← → GameModel (상태 업데이트)
        ↓                ↓
   GameView ← ← ← ← ← ← ← ←
   UIView
        ↓
   Canvas 렌더링
        ↓
   사용자에게 표시
```

### 데이터 흐름 예시

**1. 사용자가 키보드를 누름**
```
1. GameController.handleInput() - 입력 감지
2. Player.move() - 플레이어 이동
3. GameModel.update() - 상태 업데이트
4. GameView.render() - 화면 다시 그리기
```

**2. 장애물과 충돌**
```
1. GameController.checkCollision() - 충돌 감지
2. GameModel.gameOver() - 게임 상태 변경
3. UIView.showGameOver() - 게임오버 화면
4. GameModel.saveScore() - 점수 저장
```

---

## 🧩 핵심 클래스 설계

### GameModel (Model Layer)
```javascript
class GameModel {
  constructor() {
    this.score = 0
    this.level = 1
    this.gameState = 'ready' // ready, playing, paused, gameover
    this.player = new Player()
    this.obstacles = []
    this.highScores = this.loadHighScores()
  }

  // 상태 관리 메서드들
  update(deltaTime) { /* ... */ }
  addScore(points) { /* ... */ }
  levelUp() { /* ... */ }
  saveHighScore() { /* ... */ }
}
```

### GameView (View Layer)
```javascript
class GameView {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  // 렌더링 메서드들
  render(gameModel) { /* ... */ }
  drawPlayer(player) { /* ... */ }
  drawObstacles(obstacles) { /* ... */ }
  drawBackground() { /* ... */ }
}
```

### GameController (Controller Layer)
```javascript
class GameController {
  constructor(model, view, uiView) {
    this.model = model
    this.view = view
    this.uiView = uiView
    this.setupEventListeners()
  }

  // 게임 로직 제어
  update(deltaTime) { /* ... */ }
  handleInput(event) { /* ... */ }
  checkCollisions() { /* ... */ }
  startGame() { /* ... */ }
}
```

---

## 🎯 포트폴리오 어필 포인트

### 1. 깔끔한 코드 구조
```javascript
// ✅ 좋은 예시 - 명확한 책임 분리
class Player {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.speed = 5
  }

  move(direction) {
    // 플레이어 이동 로직만
  }

  checkBounds(canvasWidth, canvasHeight) {
    // 경계 체크 로직만
  }
}
```

### 2. MVC 패턴 이해도
- **Model**: 데이터와 비즈니스 로직 분리
- **View**: 렌더링과 표시 담당
- **Controller**: 사용자 입력과 흐름 제어

### 3. 객체지향 기초
```javascript
// 캡슐화 예시
class GameModel {
  #score = 0  // private 필드

  getScore() {
    return this.#score  // getter로 접근 제어
  }

  addScore(points) {
    if (points > 0) {  // 유효성 검증
      this.#score += points
    }
  }
}
```

---

## 🚀 초기화 패턴

### main.js - 게임 시작점
```javascript
// 의존성 주입 패턴으로 객체 연결
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas')
    this.model = new GameModel()
    this.view = new GameView(this.canvas)
    this.uiView = new UIView()
    this.controller = new GameController(
      this.model,
      this.view,
      this.uiView
    )
  }

  start() {
    this.gameLoop()
  }

  gameLoop() {
    const deltaTime = this.calculateDeltaTime()

    this.controller.update(deltaTime)
    this.view.render(this.model)
    this.uiView.update(this.model)

    requestAnimationFrame(() => this.gameLoop())
  }
}

// 게임 시작
const game = new Game()
game.start()
```

---

## 📊 성능 최적화 패턴

### 1. 객체 풀링 (Object Pool)
```javascript
class ObstaclePool {
  constructor(size = 50) {
    this.pool = []
    for (let i = 0; i < size; i++) {
      this.pool.push(new Obstacle())
    }
  }

  get() {
    return this.pool.pop() || new Obstacle()
  }

  release(obstacle) {
    obstacle.reset()
    this.pool.push(obstacle)
  }
}
```

### 2. 더티 플래그 (Dirty Flag)
```javascript
class GameModel {
  constructor() {
    this.isDirty = true  // 화면 업데이트 필요 여부
  }

  update() {
    if (this.hasChanges()) {
      this.isDirty = true
    }
  }
}

class GameView {
  render(model) {
    if (model.isDirty) {  // 필요할 때만 렌더링
      this.clearCanvas()
      this.drawEverything(model)
      model.isDirty = false
    }
  }
}
```

---

## ✅ 코드 품질 체크리스트

### MVC 패턴 준수
- [ ] Model에 렌더링 코드 없음
- [ ] View에 비즈니스 로직 없음
- [ ] Controller가 Model과 View 연결
- [ ] 각 클래스가 단일 책임 원칙 준수

### 객체지향 원칙
- [ ] 캡슐화: private 필드 사용
- [ ] 상속: 공통 기능 추상화
- [ ] 다형성: 인터페이스 활용
- [ ] 의존성 주입으로 결합도 낮춤

### 코드 가독성
- [ ] 클래스/메서드명이 명확함
- [ ] 주석으로 핵심 로직 설명
- [ ] 일관된 코딩 스타일
- [ ] 매직넘버 대신 상수 사용

---

## 🧪 테스트 가능 설계

### 1. 단위 테스트 예시
```javascript
// Player 클래스 테스트
describe('Player', () => {
  test('이동 시 위치 변경', () => {
    const player = new Player(100, 100)
    player.move('right')
    expect(player.x).toBe(105)  // speed = 5
  })

  test('경계 밖 이동 방지', () => {
    const player = new Player(0, 100)
    player.move('left')
    expect(player.x).toBe(0)  // 경계에서 멈춤
  })
})
```

### 2. Mock 객체 활용
```javascript
// GameController 테스트
describe('GameController', () => {
  test('충돌 시 게임 종료', () => {
    const mockModel = { gameOver: jest.fn() }
    const controller = new GameController(mockModel)

    controller.handleCollision()
    expect(mockModel.gameOver).toHaveBeenCalled()
  })
})
```

---

## 📈 확장 가능성

### 추가 기능 구현 시
```javascript
// 새로운 기능도 MVC 패턴으로
class PowerUp {  // 새로운 Model
  constructor() { /* ... */ }
}

class PowerUpView {  // 새로운 View
  render() { /* ... */ }
}

// 기존 Controller에 추가
class GameController {
  handlePowerUp(powerUp) {  // 새로운 로직
    this.model.applyPowerUp(powerUp)
  }
}
```

---

## 🎨 포트폴리오 문서화 권장사항

### README.md 작성 팁
```markdown
# 장애물 피하기 게임

## 🏗️ 아키텍처
- **MVC 패턴** 적용으로 깔끔한 코드 구조
- **객체지향 설계** 로 유지보수성 확보
- **성능 최적화** 패턴 적용

## 📁 코드 구조
- Model: 게임 상태 관리 (GameModel.js)
- View: Canvas 렌더링 (GameView.js)
- Controller: 게임 로직 제어 (GameController.js)

## 💻 기술적 특징
- Vanilla JS로 프레임워크 없이 구현
- 60FPS 게임 루프 최적화
- LocalStorage 활용한 점수 저장
```

### 코드 주석 예시
```javascript
/**
 * 게임 상태를 관리하는 Model 클래스
 * MVC 패턴의 Model 계층을 담당
 */
class GameModel {
  /**
   * 게임 상태 업데이트 (매 프레임 호출)
   * @param {number} deltaTime - 이전 프레임과의 시간 차이
   */
  update(deltaTime) {
    // 게임 로직 구현...
  }
}
```

---

## 🎯 최종 목표

**채용 담당자가 보게 될 것**:
1. ✅ MVC 패턴을 정확히 이해하고 적용
2. ✅ 객체지향 프로그래밍 기초 실력
3. ✅ 깔끔한 코드 구조화 능력
4. ✅ Vanilla JS로 복잡한 기능 구현 가능

**"비개발자 출신이지만 기초가 탄탄하고 체계적으로 코드를 작성할 줄 아는 사람"**이라는 인상을 줄 수 있는 구조입니다.