# Use Case Specification: 장애물 피하기 게임

## Meta
- 작성일: 2025-11-07
- 작성자: Portfolio Project
- 버전: 1.0
- 용도: 포트폴리오 기술 역량 어필

---

## 목차
1. [UC-001: 게임 플레이](#uc-001-게임-플레이)
2. [성능 요구사항 (60FPS)](#성능-요구사항-60fps)
3. [충돌 감지 알고리즘](#충돌-감지-알고리즘)
4. [실시간 상태 관리](#실시간-상태-관리)
5. [에러 핸들링](#에러-핸들링)
6. [기술 구현 포인트](#기술-구현-포인트)

---

## UC-001: 게임 플레이

### 📋 기본 정보
- **Use Case ID**: UC-001
- **Use Case Name**: 게임 플레이
- **Priority**: Critical (포트폴리오 핵심 로직)
- **Complexity**: High (60FPS 루프, 실시간 충돌감지, 다중 입력 처리)

### 🎯 포트폴리오 어필 목표
**기술 역량 증명**:
- 60FPS 게임 루프 구현 능력
- 실시간 충돌 감지 알고리즘 설계
- 다중 입력 소스 처리 (키보드, 마우스, 터치)
- 메모리 효율적 객체 관리
- 성능 최적화 및 프레임 안정성

### 👤 Actors
- **Primary Actor**: 플레이어 (게임 사용자)
- **Supporting Systems**:
  - Canvas Rendering Engine
  - Input Manager
  - Collision Detection System
  - State Manager

### ✅ Preconditions
1. 게임이 "ready" 상태
2. Canvas 요소가 정상적으로 렌더링
3. 플레이어 객체 초기화 완료
4. 이벤트 리스너 등록 완료
5. 게임 루프가 시작 가능한 상태

### 🎮 Main Flow (정상 시나리오)

#### Step 1: 게임 시작 (Game Loop Initialization)
**Actor**: 플레이어가 "게임 시작" 버튼 클릭

**System Process**:
```javascript
1. gameState.status = 'playing'
2. 게임 루프 시작 (requestAnimationFrame)
3. 시작 시간 기록 (performance.now())
4. 플레이어를 중앙 하단에 배치
5. 첫 번째 장애물 생성 스케줄링
6. UI 요소 활성화 (점수, 시간, 레벨 표시)
```

**기술 구현 포인트**:
- **정확한 타이밍**: `performance.now()`로 고정밀 시간 측정
- **프레임 안정성**: `requestAnimationFrame` 사용으로 브라우저 최적화
- **초기 상태 검증**: 모든 게임 객체의 유효성 확인

#### Step 2: 실시간 입력 처리 (Input Processing)
**Actor**: 플레이어가 키보드/마우스/터치로 캐릭터 조작

**System Process**:
```javascript
// 매 프레임마다 실행
1. 입력 상태 폴링 (키보드 키 상태 확인)
2. 마우스/터치 위치 감지
3. 플레이어 목표 위치 계산
4. 이동 벡터 정규화 및 속도 적용
5. 화면 경계 제한 검사
6. 플레이어 위치 업데이트
```

**입력 매트릭스**:
| 입력 타입 | 처리 방식 | 우선순위 |
|-----------|-----------|----------|
| 키보드 방향키 | 고정 속도 이동 | High |
| 마우스 이동 | 마우스 위치로 점진적 이동 | Medium |
| 터치 이벤트 | 터치 위치로 즉시 이동 | High |
| 다중 입력 | 가장 최근 입력 우선 | System |

**기술 구현 포인트**:
- **입력 레이턴시 최소화**: 이벤트 기반 + 폴링 하이브리드
- **부드러운 이동**: Linear Interpolation (LERP) 적용
- **터치 반응성**: 터치 이벤트 100ms 이내 반응

#### Step 3: 동적 장애물 관리 (Dynamic Obstacle Management)
**System Process**:
```javascript
// 매 프레임마다 실행
1. 레벨에 따른 장애물 생성 빈도 계산
2. 새 장애물 생성 (랜덤 X좌표, 화면 상단)
3. 기존 장애물들 Y좌표 업데이트 (하강 이동)
4. 화면 밖으로 나간 장애물 제거 (메모리 최적화)
5. 장애물 풀링 시스템 관리
```

**장애물 생성 공식**:
```javascript
spawnRate = BASE_SPAWN_RATE + (level - 1) * SPAWN_RATE_INCREASE
spawnChance = Math.min(spawnRate, MAX_SPAWN_RATE)
```

**기술 구현 포인트**:
- **객체 풀링**: 메모리 할당/해제 최소화
- **동적 난이도**: 레벨에 따른 파라미터 조정
- **배열 최적화**: 불필요한 객체 즉시 제거

#### Step 4: 실시간 충돌 감지 (Real-time Collision Detection)
**System Process**:
```javascript
// 매 프레임마다 모든 활성 장애물과 검사
1. 플레이어 경계 박스 계산
2. 각 장애물 경계 박스 계산
3. AABB (Axis-Aligned Bounding Box) 충돌 검사
4. 충돌 발생 시 즉시 게임오버 처리
5. 충돌하지 않은 경우 다음 프레임 계속
```

**충돌 감지 알고리즘** (상세 구현):
```javascript
function checkCollision(player, obstacle) {
  return player.x < obstacle.x + obstacle.size &&
         player.x + player.size > obstacle.x &&
         player.y < obstacle.y + obstacle.size &&
         player.y + player.size > obstacle.y
}
```

**기술 구현 포인트**:
- **정확성**: 픽셀 단위 정확한 충돌 감지
- **성능 최적화**: 공간 분할 또는 초기 거리 필터링
- **즉시성**: 충돌 감지 즉시 게임 로직 중단

#### Step 5: 실시간 상태 업데이트 (Real-time State Management)
**System Process**:
```javascript
// 매 프레임마다 실행
1. 경과 시간 계산 (deltaTime)
2. 점수 증가 (시간 기반: 1초당 10점)
3. 레벨 진행도 계산 (30초마다 레벨업)
4. 레벨업 시 난이도 조정
5. UI 요소 업데이트 (점수, 시간, 레벨)
```

**점수 계산 공식**:
```javascript
score = Math.floor(playTime * SCORE_PER_SECOND) + levelBonus
levelBonus = Math.floor(level / 10) * 500  // 매 10레벨마다 보너스
```

**기술 구현 포인트**:
- **일관된 타이밍**: 프레임레이트 독립적 계산
- **정확한 동기화**: 모든 UI 요소 동시 업데이트
- **상태 불변성**: 이전 상태 영향 없는 순수 계산

#### Step 6: 고성능 렌더링 (High-Performance Rendering)
**System Process**:
```javascript
// 매 프레임마다 실행 (60FPS 목표)
1. 캔버스 클리어 (clearRect)
2. 배경 렌더링 (선택적)
3. 플레이어 렌더링
4. 모든 활성 장애물 렌더링
5. UI 오버레이 렌더링 (점수, 레벨)
6. 프레임 완료
```

**기술 구현 포인트**:
- **더티 렌더링**: 변경된 영역만 다시 그리기
- **레이어 분리**: 게임 오브젝트와 UI 별도 렌더링
- **프레임 버퍼링**: 다음 프레임 준비 동시 진행

### ⚠️ Exception Flows (예외 시나리오)

#### Exception 1: 프레임 드롭 발생
**Trigger**: 연속 3프레임 16ms 초과 소요

**Process**:
```javascript
1. 프레임레이트 모니터링 (실시간)
2. 임계값 초과 시 품질 자동 조정
3. 장애물 수 일시적 감소
4. 렌더링 품질 하향 조정
5. 성능 복구 시 원래 설정 복원
```

#### Exception 2: 메모리 부족
**Trigger**: 활성 장애물 수 > 100개

**Process**:
```javascript
1. 메모리 사용량 모니터링
2. 임계값 초과 시 강제 정리
3. 화면 밖 객체 즉시 제거
4. 객체 풀 크기 축소
5. GC 강제 실행 (필요시)
```

#### Exception 3: 입력 지연 감지
**Trigger**: 입력 이벤트 처리 > 5ms

**Process**:
```javascript
1. 입력 처리 시간 측정
2. 지연 감지 시 입력 큐 우선순위 조정
3. 불필요한 이벤트 리스너 비활성화
4. 입력 버퍼링으로 응답성 확보
```

### ✅ Postconditions
1. 게임 상태가 'playing' 또는 'gameover'로 전환
2. 모든 게임 객체 상태가 일관성 유지
3. 성능 메트릭이 목표 범위 내 유지
4. 사용자 입력이 즉시 반영
5. 메모리 사용량이 적정 수준 유지

---

## 성능 요구사항 (60FPS)

### 🎯 성능 목표
| 메트릭 | 목표값 | 임계값 | 측정 방법 |
|--------|--------|--------|-----------|
| 프레임레이트 | 60 FPS | 55 FPS | Performance API |
| 프레임 시간 | < 16ms | < 20ms | requestAnimationFrame |
| 메모리 사용량 | < 50MB | < 100MB | DevTools Memory |
| 입력 지연 | < 5ms | < 10ms | Event timestamp |
| 렌더링 시간 | < 8ms | < 12ms | Canvas performance |

### 🔧 최적화 전략

#### 1. 게임 루프 최적화
```javascript
class GameLoop {
  constructor() {
    this.targetFPS = 60
    this.targetFrameTime = 1000 / this.targetFPS
    this.lastFrameTime = 0
    this.frameCount = 0
  }

  loop(currentTime) {
    const deltaTime = currentTime - this.lastFrameTime

    // 프레임 스킵 로직
    if (deltaTime >= this.targetFrameTime) {
      this.update(deltaTime)
      this.render()
      this.lastFrameTime = currentTime
      this.frameCount++
    }

    requestAnimationFrame(this.loop.bind(this))
  }

  measurePerformance() {
    // 실시간 성능 측정 및 조정
    const fps = 1000 / deltaTime
    if (fps < 55) {
      this.optimizeForPerformance()
    }
  }
}
```

#### 2. 메모리 관리 최적화
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 50) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []
    this.activeObjects = []

    // 미리 객체 생성
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  get() {
    const obj = this.pool.pop() || this.createFn()
    this.activeObjects.push(obj)
    return obj
  }

  release(obj) {
    const index = this.activeObjects.indexOf(obj)
    if (index > -1) {
      this.activeObjects.splice(index, 1)
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }
}
```

#### 3. 렌더링 최적화
```javascript
class RenderOptimizer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.dirtyRects = []
    this.lastRenderData = null
  }

  // 더티 렌더링
  addDirtyRect(x, y, width, height) {
    this.dirtyRects.push({x, y, width, height})
  }

  optimizedRender(gameObjects) {
    // 변경된 부분만 다시 그리기
    this.dirtyRects.forEach(rect => {
      this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height)
    })

    // 뷰포트 컬링 적용
    const visibleObjects = this.cullOffscreenObjects(gameObjects)

    // 배치 렌더링
    this.batchRender(visibleObjects)

    this.dirtyRects = []
  }
}
```

### 📊 성능 모니터링
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frameTime: [],
      fps: 0,
      memoryUsage: 0,
      objectCount: 0
    }
  }

  update(deltaTime) {
    this.metrics.frameTime.push(deltaTime)
    if (this.metrics.frameTime.length > 60) {
      this.metrics.frameTime.shift()
    }

    this.metrics.fps = 1000 / deltaTime

    // 메모리 사용량 (5초마다)
    if (performance.now() % 5000 < 100) {
      this.metrics.memoryUsage = performance.memory?.usedJSHeapSize || 0
    }
  }

  getAverageFrameTime() {
    return this.metrics.frameTime.reduce((a, b) => a + b, 0) / this.metrics.frameTime.length
  }
}
```

---

## 충돌 감지 알고리즘

### 🎯 알고리즘 선택: AABB (Axis-Aligned Bounding Box)

**선택 이유**:
- **성능**: O(1) 시간 복잡도
- **정확성**: 게임 요구사항에 충분한 정밀도
- **구현 간소성**: 직관적이고 디버깅 용이

### 🔍 상세 구현

#### 1. 기본 AABB 충돌 감지
```javascript
class CollisionDetector {
  static checkAABB(rectA, rectB) {
    return rectA.x < rectB.x + rectB.width &&
           rectA.x + rectA.width > rectB.x &&
           rectA.y < rectB.y + rectB.height &&
           rectA.y + rectA.height > rectB.y
  }

  // 최적화된 버전 (early exit)
  static checkAABBOptimized(rectA, rectB) {
    // 가장 가능성 높은 조건부터 체크
    if (rectA.x >= rectB.x + rectB.width) return false
    if (rectA.x + rectA.width <= rectB.x) return false
    if (rectA.y >= rectB.y + rectB.height) return false
    if (rectA.y + rectA.height <= rectB.y) return false
    return true
  }
}
```

#### 2. 공간 분할 최적화
```javascript
class SpatialGrid {
  constructor(worldWidth, worldHeight, cellSize = 64) {
    this.cellSize = cellSize
    this.cols = Math.ceil(worldWidth / cellSize)
    this.rows = Math.ceil(worldHeight / cellSize)
    this.grid = new Array(this.cols * this.rows).fill(null).map(() => [])
  }

  // 객체를 그리드에 배치
  insert(object) {
    const bounds = this.getBounds(object)

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        const index = y * this.cols + x
        this.grid[index].push(object)
      }
    }
  }

  // 충돌 가능한 객체들만 반환
  query(object) {
    const bounds = this.getBounds(object)
    const candidates = new Set()

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
      for (let x = bounds.minX; x <= bounds.maxX; x++) {
        const index = y * this.cols + x
        this.grid[index].forEach(candidate => candidates.add(candidate))
      }
    }

    return Array.from(candidates)
  }

  getBounds(object) {
    const minX = Math.floor(object.x / this.cellSize)
    const maxX = Math.floor((object.x + object.width) / this.cellSize)
    const minY = Math.floor(object.y / this.cellSize)
    const maxY = Math.floor((object.y + object.height) / this.cellSize)

    return { minX, maxX, minY, maxY }
  }
}
```

#### 3. 충돌 시스템 통합
```javascript
class CollisionSystem {
  constructor(worldWidth, worldHeight) {
    this.spatialGrid = new SpatialGrid(worldWidth, worldHeight)
    this.collisionPairs = []
  }

  update(player, obstacles) {
    // 1. 그리드 클리어 및 재구축
    this.spatialGrid.clear()
    this.spatialGrid.insert(player)
    obstacles.forEach(obstacle => this.spatialGrid.insert(obstacle))

    // 2. 플레이어와 충돌 가능한 장애물 쿼리
    const candidates = this.spatialGrid.query(player)

    // 3. 정밀 충돌 검사
    for (const obstacle of candidates) {
      if (obstacle !== player && CollisionDetector.checkAABB(player, obstacle)) {
        return {
          hasCollision: true,
          collidedObject: obstacle,
          collisionPoint: this.getCollisionPoint(player, obstacle)
        }
      }
    }

    return { hasCollision: false }
  }

  getCollisionPoint(rectA, rectB) {
    return {
      x: Math.max(rectA.x, rectB.x) + Math.min(rectA.x + rectA.width, rectB.x + rectB.width) / 2,
      y: Math.max(rectA.y, rectB.y) + Math.min(rectA.y + rectA.height, rectB.y + rectB.height) / 2
    }
  }
}
```

### 📈 성능 분석

**충돌 감지 복잡도**:
- **기본 방식**: O(n) - 플레이어 vs 모든 장애물
- **공간 분할 적용**: O(k) - k는 주변 셀의 객체 수 (평균 3-5개)

**예상 성능 개선**:
```
장애물 50개 기준:
- 기본 방식: 50회 AABB 검사
- 공간 분할: 평균 4회 AABB 검사 (92% 성능 향상)
```

---

## 실시간 상태 관리

### 🎯 상태 관리 전략

#### 1. 중앙집중식 상태 관리
```javascript
class GameStateManager {
  constructor() {
    this.state = {
      // 게임 메타 상태
      status: 'ready',  // 'ready' | 'playing' | 'paused' | 'gameover'

      // 게임 진행 상태
      score: 0,
      level: 1,
      playTime: 0,

      // 엔티티 상태
      player: null,
      obstacles: [],

      // 시스템 상태
      lastUpdateTime: 0,
      isPaused: false,

      // 성능 상태
      frameCount: 0,
      averageFrameTime: 16.67
    }

    this.listeners = new Map()
  }

  // 상태 변경 메서드
  updateState(newState) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...newState }
    this.notifyListeners(prevState, this.state)
  }

  // 리스너 등록
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key).push(callback)
  }

  // 상태 변경 알림
  notifyListeners(prevState, newState) {
    this.listeners.forEach((callbacks, key) => {
      if (prevState[key] !== newState[key]) {
        callbacks.forEach(callback => callback(newState[key], prevState[key]))
      }
    })
  }
}
```

#### 2. 프레임 단위 상태 업데이트
```javascript
class FrameStateUpdater {
  constructor(stateManager) {
    this.stateManager = stateManager
    this.updateQueue = []
  }

  // 매 프레임마다 호출
  update(deltaTime) {
    const currentTime = performance.now()

    // 시간 기반 상태 업데이트
    this.updateTimeBasedState(deltaTime)

    // 물리 상태 업데이트
    this.updatePhysicsState(deltaTime)

    // 게임 로직 상태 업데이트
    this.updateGameLogicState(deltaTime)

    // 큐에 있는 모든 업데이트 적용
    this.flushUpdateQueue()

    this.stateManager.updateState({
      lastUpdateTime: currentTime
    })
  }

  updateTimeBasedState(deltaTime) {
    const state = this.stateManager.state

    // 플레이 시간 업데이트
    const newPlayTime = state.playTime + deltaTime / 1000

    // 점수 업데이트 (시간 기반)
    const scoreIncrease = Math.floor(deltaTime * SCORE_PER_MILLISECOND)

    // 레벨 업데이트 (30초마다 레벨업)
    const newLevel = Math.floor(newPlayTime / LEVEL_UP_INTERVAL) + 1

    this.queueUpdate({
      playTime: newPlayTime,
      score: state.score + scoreIncrease,
      level: Math.min(newLevel, MAX_LEVEL)
    })
  }

  updatePhysicsState(deltaTime) {
    const state = this.stateManager.state

    // 플레이어 위치 업데이트
    if (state.player) {
      const updatedPlayer = this.updatePlayerPosition(state.player, deltaTime)
      this.queueUpdate({ player: updatedPlayer })
    }

    // 장애물 위치 업데이트
    const updatedObstacles = state.obstacles.map(obstacle =>
      this.updateObstaclePosition(obstacle, deltaTime)
    ).filter(obstacle => obstacle.y < CANVAS_HEIGHT + 50)

    this.queueUpdate({ obstacles: updatedObstacles })
  }

  updateGameLogicState(deltaTime) {
    const state = this.stateManager.state

    // 새 장애물 생성 체크
    if (this.shouldSpawnObstacle(state)) {
      const newObstacle = this.createObstacle(state.level)
      const updatedObstacles = [...state.obstacles, newObstacle]
      this.queueUpdate({ obstacles: updatedObstacles })
    }

    // 레벨업 체크
    if (this.shouldLevelUp(state)) {
      this.triggerLevelUp(state.level + 1)
    }
  }

  queueUpdate(update) {
    this.updateQueue.push(update)
  }

  flushUpdateQueue() {
    if (this.updateQueue.length > 0) {
      const mergedUpdate = this.updateQueue.reduce((acc, update) =>
        ({ ...acc, ...update }), {})
      this.stateManager.updateState(mergedUpdate)
      this.updateQueue = []
    }
  }
}
```

#### 3. 상태 검증 및 무결성
```javascript
class StateValidator {
  static validate(state) {
    const errors = []

    // 기본 타입 검증
    if (typeof state.score !== 'number' || state.score < 0) {
      errors.push('Invalid score value')
    }

    if (typeof state.level !== 'number' || state.level < 1 || state.level > MAX_LEVEL) {
      errors.push('Invalid level value')
    }

    // 플레이어 상태 검증
    if (state.player) {
      if (state.player.x < 0 || state.player.x > CANVAS_WIDTH) {
        errors.push('Player X position out of bounds')
      }
      if (state.player.y < 0 || state.player.y > CANVAS_HEIGHT) {
        errors.push('Player Y position out of bounds')
      }
    }

    // 장애물 상태 검증
    state.obstacles.forEach((obstacle, index) => {
      if (!obstacle.id || typeof obstacle.x !== 'number' || typeof obstacle.y !== 'number') {
        errors.push(`Invalid obstacle at index ${index}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  static sanitize(state) {
    return {
      ...state,
      score: Math.max(0, Math.floor(state.score)),
      level: Math.max(1, Math.min(MAX_LEVEL, Math.floor(state.level))),
      playTime: Math.max(0, state.playTime),
      player: state.player ? {
        ...state.player,
        x: Math.max(0, Math.min(CANVAS_WIDTH - state.player.size, state.player.x)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - state.player.size, state.player.y))
      } : null,
      obstacles: state.obstacles.filter(obstacle =>
        obstacle && typeof obstacle.x === 'number' && typeof obstacle.y === 'number'
      )
    }
  }
}
```

### 🔄 상태 동기화 패턴

#### 1. 이벤트 기반 동기화
```javascript
class StateEventSystem {
  constructor(stateManager) {
    this.stateManager = stateManager
    this.eventHandlers = new Map()
  }

  // 상태 변화에 따른 이벤트 발생
  setupEventHandlers() {
    this.stateManager.subscribe('score', (newScore, oldScore) => {
      if (newScore > oldScore) {
        this.emit('scoreIncrease', { newScore, increase: newScore - oldScore })
      }
    })

    this.stateManager.subscribe('level', (newLevel, oldLevel) => {
      if (newLevel > oldLevel) {
        this.emit('levelUp', { newLevel, oldLevel })
      }
    })

    this.stateManager.subscribe('status', (newStatus, oldStatus) => {
      this.emit('statusChange', { newStatus, oldStatus })
    })
  }

  emit(eventType, data) {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType).forEach(handler => handler(data))
    }
  }

  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType).push(handler)
  }
}
```

---

## 에러 핸들링

### 🛡️ 에러 카테고리 및 대응 전략

#### 1. 성능 관련 에러
```javascript
class PerformanceErrorHandler {
  constructor() {
    this.performanceState = {
      consecutiveSlowFrames: 0,
      averageFrameTime: 16.67,
      isOptimized: false
    }
  }

  handleSlowFrame(frameTime) {
    if (frameTime > 33) { // 30FPS 이하
      this.performanceState.consecutiveSlowFrames++

      if (this.performanceState.consecutiveSlowFrames >= 3) {
        this.optimizeForPerformance()
      }
    } else {
      this.performanceState.consecutiveSlowFrames = 0

      // 성능 복구 감지
      if (this.performanceState.isOptimized && frameTime < 20) {
        this.restoreQuality()
      }
    }
  }

  optimizeForPerformance() {
    console.warn('Performance degradation detected, optimizing...')

    // 장애물 수 감소
    gameState.maxObstacles = Math.max(5, gameState.maxObstacles - 5)

    // 렌더링 품질 하향
    gameState.renderQuality = 'low'

    // 파티클 효과 비활성화
    gameState.particlesEnabled = false

    this.performanceState.isOptimized = true
  }

  restoreQuality() {
    console.log('Performance restored, returning to normal quality')

    gameState.maxObstacles = DEFAULT_MAX_OBSTACLES
    gameState.renderQuality = 'high'
    gameState.particlesEnabled = true

    this.performanceState.isOptimized = false
  }
}
```

#### 2. 메모리 관리 에러
```javascript
class MemoryErrorHandler {
  constructor() {
    this.memoryThreshold = 100 * 1024 * 1024 // 100MB
    this.isLowMemoryMode = false
  }

  checkMemoryUsage() {
    if (!performance.memory) return

    const usedMemory = performance.memory.usedJSHeapSize

    if (usedMemory > this.memoryThreshold && !this.isLowMemoryMode) {
      this.enterLowMemoryMode()
    } else if (usedMemory < this.memoryThreshold * 0.7 && this.isLowMemoryMode) {
      this.exitLowMemoryMode()
    }
  }

  enterLowMemoryMode() {
    console.warn('Entering low memory mode')

    // 객체 풀 크기 감소
    obstaclePool.resize(20)

    // 비활성 객체 즉시 정리
    this.forceCleanup()

    // 메모리 집약적 기능 비활성화
    gameState.shadowsEnabled = false
    gameState.trailsEnabled = false

    this.isLowMemoryMode = true
  }

  forceCleanup() {
    // 화면 밖 객체 강제 제거
    gameState.obstacles = gameState.obstacles.filter(obstacle =>
      obstacle.y < CANVAS_HEIGHT + 100
    )

    // 명시적 GC 요청 (브라우저가 지원하는 경우)
    if (window.gc) {
      window.gc()
    }
  }
}
```

#### 3. 입력 시스템 에러
```javascript
class InputErrorHandler {
  constructor() {
    this.inputHistory = []
    this.lastInputTime = 0
  }

  handleInputError(error, inputEvent) {
    console.error('Input handling error:', error)

    // 입력 이벤트 복구
    try {
      this.recoverInput(inputEvent)
    } catch (recoveryError) {
      console.error('Failed to recover from input error:', recoveryError)
      this.disableProblematicInput()
    }
  }

  recoverInput(inputEvent) {
    // 마지막 유효한 입력 상태로 복구
    const lastValidInput = this.inputHistory[this.inputHistory.length - 1]
    if (lastValidInput) {
      gameState.player.targetX = lastValidInput.targetX
      gameState.player.targetY = lastValidInput.targetY
    }
  }

  disableProblematicInput() {
    // 문제가 있는 입력 소스 일시 비활성화
    gameState.touchEnabled = false
    setTimeout(() => {
      gameState.touchEnabled = true
    }, 5000)
  }

  validateInput(inputEvent) {
    // 입력 검증
    if (!inputEvent || typeof inputEvent.clientX !== 'number') {
      throw new Error('Invalid input event')
    }

    // 스팸 입력 방지
    const currentTime = Date.now()
    if (currentTime - this.lastInputTime < 16) { // 60FPS 제한
      return false
    }

    this.lastInputTime = currentTime
    return true
  }
}
```

#### 4. 게임 상태 불일치 에러
```javascript
class StateConsistencyHandler {
  constructor(stateManager) {
    this.stateManager = stateManager
    this.stateHistory = []
    this.maxHistorySize = 60 // 1초 분량
  }

  validateStateTransition(oldState, newState) {
    const validationResult = StateValidator.validate(newState)

    if (!validationResult.isValid) {
      console.error('Invalid state transition detected:', validationResult.errors)
      return this.recoverFromInvalidState(oldState, newState)
    }

    // 상태 이력 저장
    this.stateHistory.push({
      timestamp: Date.now(),
      state: { ...oldState }
    })

    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift()
    }

    return newState
  }

  recoverFromInvalidState(oldState, corruptedState) {
    console.warn('Attempting state recovery...')

    // 1차 시도: 상태 정제
    const sanitizedState = StateValidator.sanitize(corruptedState)
    const sanitizedValidation = StateValidator.validate(sanitizedState)

    if (sanitizedValidation.isValid) {
      console.log('State recovered through sanitization')
      return sanitizedState
    }

    // 2차 시도: 이전 유효한 상태로 롤백
    const lastValidState = this.findLastValidState()
    if (lastValidState) {
      console.log('State recovered through rollback')
      return lastValidState
    }

    // 3차 시도: 게임 재시작
    console.error('Unable to recover state, restarting game')
    return this.createEmergencyState()
  }

  findLastValidState() {
    for (let i = this.stateHistory.length - 1; i >= 0; i--) {
      const historyItem = this.stateHistory[i]
      if (StateValidator.validate(historyItem.state).isValid) {
        return historyItem.state
      }
    }
    return null
  }

  createEmergencyState() {
    return {
      status: 'ready',
      score: 0,
      level: 1,
      playTime: 0,
      player: null,
      obstacles: [],
      isPaused: false,
      lastUpdateTime: Date.now()
    }
  }
}
```

---

## 기술 구현 포인트

### 🎯 포트폴리오 기술 어필 요소

#### 1. 고성능 게임 루프 구현
```javascript
class HighPerformanceGameLoop {
  constructor() {
    this.rafId = null
    this.isRunning = false
    this.targetFPS = 60
    this.frameTime = 1000 / this.targetFPS
    this.lastTime = 0
    this.accumulator = 0

    // 성능 메트릭
    this.performanceMetrics = {
      frameCount: 0,
      averageFPS: 0,
      minFrameTime: Infinity,
      maxFrameTime: 0
    }
  }

  start() {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.loop()
  }

  loop = (currentTime = performance.now()) => {
    if (!this.isRunning) return

    const deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    // 프레임 시간 제한 (최대 4프레임 건너뛰기)
    const clampedDeltaTime = Math.min(deltaTime, this.frameTime * 4)
    this.accumulator += clampedDeltaTime

    // 고정 시간 간격으로 업데이트 (Fixed timestep)
    while (this.accumulator >= this.frameTime) {
      this.update(this.frameTime)
      this.accumulator -= this.frameTime
    }

    // 보간된 렌더링 (Interpolation)
    const interpolationFactor = this.accumulator / this.frameTime
    this.render(interpolationFactor)

    // 성능 메트릭 업데이트
    this.updatePerformanceMetrics(deltaTime)

    this.rafId = requestAnimationFrame(this.loop)
  }

  // Fixed timestep update
  update(deltaTime) {
    stateUpdater.update(deltaTime)
    collisionSystem.update()
    physicsSystem.update(deltaTime)
  }

  // Interpolated rendering
  render(interpolationFactor) {
    renderer.render(gameState, interpolationFactor)
    uiRenderer.render(gameState)
  }

  updatePerformanceMetrics(deltaTime) {
    this.performanceMetrics.frameCount++
    this.performanceMetrics.minFrameTime = Math.min(this.performanceMetrics.minFrameTime, deltaTime)
    this.performanceMetrics.maxFrameTime = Math.max(this.performanceMetrics.maxFrameTime, deltaTime)

    // FPS 계산 (1초마다)
    if (this.performanceMetrics.frameCount % 60 === 0) {
      this.performanceMetrics.averageFPS = 1000 / deltaTime
      this.logPerformanceMetrics()
    }
  }
}
```

#### 2. 메모리 효율적 객체 관리
```javascript
class AdvancedObjectPool {
  constructor(objectConfig) {
    this.createFn = objectConfig.createFn
    this.resetFn = objectConfig.resetFn
    this.validateFn = objectConfig.validateFn || (() => true)

    this.pool = []
    this.active = new Set()
    this.poolSize = objectConfig.initialSize || 20
    this.maxSize = objectConfig.maxSize || 100

    // 통계
    this.stats = {
      totalCreated: 0,
      totalReused: 0,
      currentActive: 0,
      peakActive: 0
    }

    this.initializePool()
  }

  initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const obj = this.createFn()
      obj._poolId = this.generateId()
      this.pool.push(obj)
      this.stats.totalCreated++
    }
  }

  acquire() {
    let obj

    if (this.pool.length > 0) {
      obj = this.pool.pop()
      this.stats.totalReused++
    } else {
      if (this.active.size < this.maxSize) {
        obj = this.createFn()
        obj._poolId = this.generateId()
        this.stats.totalCreated++
      } else {
        console.warn('Object pool limit reached, reusing oldest object')
        obj = this.forceReclaim()
      }
    }

    this.active.add(obj)
    this.stats.currentActive = this.active.size
    this.stats.peakActive = Math.max(this.stats.peakActive, this.active.size)

    return obj
  }

  release(obj) {
    if (!this.active.has(obj)) {
      console.warn('Attempting to release object not in active set')
      return
    }

    if (this.validateFn(obj)) {
      this.resetFn(obj)
      this.pool.push(obj)
    } else {
      console.warn('Object failed validation, discarding')
    }

    this.active.delete(obj)
    this.stats.currentActive = this.active.size
  }

  forceReclaim() {
    // LRU 방식으로 가장 오래된 객체 회수
    const oldestObj = this.active.values().next().value
    this.release(oldestObj)
    return this.acquire()
  }

  getStats() {
    return {
      ...this.stats,
      poolSize: this.pool.length,
      efficiency: this.stats.totalReused / (this.stats.totalCreated || 1)
    }
  }
}
```

#### 3. 정밀한 입력 시스템
```javascript
class PrecisionInputSystem {
  constructor(canvas) {
    this.canvas = canvas
    this.inputState = {
      keyboard: new Map(),
      mouse: { x: 0, y: 0, buttons: 0 },
      touch: { x: 0, y: 0, active: false }
    }

    this.inputHistory = []
    this.inputListeners = new Map()
    this.deadzone = 5 // 픽셀

    this.setupEventListeners()
  }

  setupEventListeners() {
    // 키보드 이벤트
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))

    // 마우스 이벤트
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))

    // 터치 이벤트
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this))
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this))
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))

    // 컨텍스트 메뉴 비활성화
    this.canvas.addEventListener('contextmenu', e => e.preventDefault())
  }

  handleKeyDown(event) {
    const key = event.code
    const timestamp = performance.now()

    if (!this.inputState.keyboard.has(key)) {
      this.inputState.keyboard.set(key, {
        pressed: true,
        pressTime: timestamp,
        repeatCount: 0
      })

      this.addToHistory('keydown', { key, timestamp })
      this.notifyListeners('keydown', { key, timestamp })
    } else {
      // 키 반복 처리
      this.inputState.keyboard.get(key).repeatCount++
    }
  }

  handleKeyUp(event) {
    const key = event.code
    const timestamp = performance.now()

    if (this.inputState.keyboard.has(key)) {
      const keyData = this.inputState.keyboard.get(key)
      const holdTime = timestamp - keyData.pressTime

      this.inputState.keyboard.delete(key)
      this.addToHistory('keyup', { key, timestamp, holdTime })
      this.notifyListeners('keyup', { key, timestamp, holdTime })
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (this.canvas.height / rect.height)

    const previousX = this.inputState.mouse.x
    const previousY = this.inputState.mouse.y

    // 데드존 체크
    const distance = Math.sqrt(Math.pow(x - previousX, 2) + Math.pow(y - previousY, 2))
    if (distance < this.deadzone) return

    this.inputState.mouse.x = x
    this.inputState.mouse.y = y

    const timestamp = performance.now()
    this.addToHistory('mousemove', { x, y, timestamp })
    this.notifyListeners('mousemove', { x, y, deltaX: x - previousX, deltaY: y - previousY })
  }

  // 고정밀 터치 처리
  handleTouchMove(event) {
    event.preventDefault()

    if (event.touches.length === 0) return

    const touch = event.touches[0]
    const rect = this.canvas.getBoundingClientRect()
    const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height)

    this.inputState.touch = { x, y, active: true }

    const timestamp = performance.now()
    this.addToHistory('touchmove', { x, y, timestamp })
    this.notifyListeners('touchmove', { x, y })
  }

  // 입력 상태 조회 (게임 루프에서 사용)
  getInputState() {
    return {
      keyboard: new Map(this.inputState.keyboard),
      mouse: { ...this.inputState.mouse },
      touch: { ...this.inputState.touch }
    }
  }

  // 특정 키 상태 확인
  isKeyPressed(keyCode) {
    return this.inputState.keyboard.has(keyCode) &&
           this.inputState.keyboard.get(keyCode).pressed
  }

  // 마우스/터치 위치를 게임 좌표로 변환
  getGameCoordinates(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (screenX - rect.left) * (this.canvas.width / rect.width),
      y: (screenY - rect.top) * (this.canvas.height / rect.height)
    }
  }

  addToHistory(type, data) {
    this.inputHistory.push({
      type,
      data,
      timestamp: performance.now()
    })

    // 히스토리 크기 제한 (최근 1초분만 유지)
    const cutoffTime = performance.now() - 1000
    this.inputHistory = this.inputHistory.filter(entry => entry.timestamp > cutoffTime)
  }
}
```

#### 4. 확장 가능한 게임 아키텍처
```javascript
// 컴포넌트 시스템
class GameObject {
  constructor(id) {
    this.id = id
    this.components = new Map()
    this.active = true
  }

  addComponent(component) {
    this.components.set(component.constructor.name, component)
    component.gameObject = this
    return this
  }

  getComponent(componentType) {
    return this.components.get(componentType.name)
  }

  hasComponent(componentType) {
    return this.components.has(componentType.name)
  }

  update(deltaTime) {
    if (!this.active) return

    for (const component of this.components.values()) {
      if (component.update) {
        component.update(deltaTime)
      }
    }
  }
}

// 컴포넌트 예시
class TransformComponent {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
    this.previousX = x
    this.previousY = y
    this.rotation = 0
    this.scale = { x: 1, y: 1 }
  }

  update(deltaTime) {
    this.previousX = this.x
    this.previousY = this.y
  }

  getInterpolatedPosition(alpha) {
    return {
      x: this.previousX + (this.x - this.previousX) * alpha,
      y: this.previousY + (this.y - this.previousY) * alpha
    }
  }
}

class MovementComponent {
  constructor(speed = 100) {
    this.speed = speed
    this.velocity = { x: 0, y: 0 }
    this.acceleration = { x: 0, y: 0 }
    this.drag = 0.9
  }

  update(deltaTime) {
    const transform = this.gameObject.getComponent(TransformComponent)
    if (!transform) return

    // 물리 계산
    this.velocity.x += this.acceleration.x * deltaTime
    this.velocity.y += this.acceleration.y * deltaTime

    // 드래그 적용
    this.velocity.x *= this.drag
    this.velocity.y *= this.drag

    // 위치 업데이트
    transform.x += this.velocity.x * deltaTime / 1000
    transform.y += this.velocity.y * deltaTime / 1000
  }

  setTarget(x, y) {
    const transform = this.gameObject.getComponent(TransformComponent)
    if (!transform) return

    const dx = x - transform.x
    const dy = y - transform.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 0) {
      this.velocity.x = (dx / distance) * this.speed
      this.velocity.y = (dy / distance) * this.speed
    }
  }
}

// 시스템 매니저
class SystemManager {
  constructor() {
    this.systems = []
    this.gameObjects = new Map()
  }

  addSystem(system) {
    this.systems.push(system)
    system.systemManager = this
  }

  addGameObject(gameObject) {
    this.gameObjects.set(gameObject.id, gameObject)
  }

  update(deltaTime) {
    // 모든 게임 오브젝트 업데이트
    for (const gameObject of this.gameObjects.values()) {
      gameObject.update(deltaTime)
    }

    // 모든 시스템 업데이트
    for (const system of this.systems) {
      system.update(deltaTime)
    }
  }

  getGameObjectsWithComponent(componentType) {
    return Array.from(this.gameObjects.values()).filter(obj =>
      obj.hasComponent(componentType)
    )
  }
}
```

### 📊 최종 성능 지표
| 메트릭 | 목표값 | 달성 전략 |
|--------|--------|-----------|
| 60 FPS 유지율 | >95% | Fixed timestep + 성능 최적화 |
| 입력 지연 | <8ms | 직접 이벤트 처리 + 예측 |
| 메모리 사용량 | <30MB | 객체 풀링 + 가비지 최소화 |
| 로딩 시간 | <2초 | 리소스 최적화 + 병렬 로딩 |
| 배터리 효율성 | 표준 대비 110% | 불필요한 연산 제거 |

### 🎯 포트폴리오 완성도 체크리스트
- [ ] 60FPS 안정적 유지
- [ ] 실시간 충돌 감지 정확성
- [ ] 다중 입력 소스 지원
- [ ] 메모리 효율적 관리
- [ ] 성능 모니터링 시스템
- [ ] 에러 복구 메커니즘
- [ ] 확장 가능한 아키텍처
- [ ] 코드 문서화 완료

---

**🎯 최종 목표**: "복잡한 실시간 시스템을 체계적으로 설계하고 최적화할 줄 아는 개발자"라는 인상을 주는 포트폴리오 완성