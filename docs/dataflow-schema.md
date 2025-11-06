# Dataflow & Schema: 장애물 피하기 게임

## Meta
- 작성일: 2025-11-07
- 작성자: Portfolio Project
- 버전: 1.0
- 저장소: LocalStorage (클라이언트 사이드)

---

## 🎯 데이터 구조 설계 목표

**포트폴리오 어필 포인트**:
- 체계적인 데이터 모델링 능력
- JSON Schema 설계 실력
- LocalStorage 효율적 활용
- 확장 가능한 구조 설계

---

## 📊 데이터 플로우 분석

### Userflow → 데이터 매핑

| Userflow 기능 | 필요 데이터 | 저장 위치 |
|---------------|-------------|-----------|
| 게임 초기화 | 최고점수 로딩 | LocalStorage |
| 게임 플레이 | 실시간 상태 | 메모리 (임시) |
| 점수/레벨 관리 | 현재 게임 상태 | 메모리 (임시) |
| 게임 오버 처리 | 최종 점수, 신기록 여부 | 메모리 → LocalStorage |
| 최고점수 리더보드 | 상위 5개 기록 | LocalStorage |
| 게임 재시작 | 게임 상태 초기화 | 메모리 리셋 |

---

## 🗂️ JSON Schema 설계

### 1. GameData (LocalStorage Root)

```json
{
  "version": "1.0",
  "lastPlayed": "2025-11-07T10:30:00.000Z",
  "highScores": [...],
  "gameStats": {...},
  "preferences": {...}
}
```

### 2. HighScore Entity

```json
{
  "id": "uuid-v4",
  "score": 15750,
  "level": 8,
  "playTime": 127,
  "achievedAt": "2025-11-07T10:25:00.000Z",
  "isNewRecord": true
}
```

### 3. GameStats Entity

```json
{
  "totalGames": 23,
  "totalPlayTime": 1856,
  "averageScore": 8420,
  "bestLevel": 12,
  "gamesThisSession": 3
}
```

### 4. GameState Entity (메모리 전용)

```json
{
  "status": "playing",
  "score": 8750,
  "level": 5,
  "playTime": 85,
  "player": {
    "x": 400,
    "y": 550,
    "speed": 5
  },
  "obstacles": [
    {
      "id": "obstacle_1",
      "x": 200,
      "y": 150,
      "speed": 3,
      "size": 40
    }
  ],
  "isPaused": false,
  "lastUpdate": 1699358400000
}
```

---

## 📋 스키마 상세 정의

### GameData Schema (LocalStorage)

```typescript
interface GameData {
  version: string                    // 스키마 버전 (마이그레이션용)
  lastPlayed: string                 // ISO 8601 날짜
  highScores: HighScore[]            // 최대 5개
  gameStats: GameStats
  preferences: GamePreferences
}

interface HighScore {
  id: string                         // UUID v4
  score: number                      // 점수 (0 ~ 999999)
  level: number                      // 도달 레벨 (1 ~ 99)
  playTime: number                   // 플레이 시간 (초)
  achievedAt: string                 // ISO 8601 날짜
  isNewRecord: boolean               // 당시 신기록 여부
}

interface GameStats {
  totalGames: number                 // 총 게임 횟수
  totalPlayTime: number              // 총 플레이 시간 (초)
  averageScore: number               // 평균 점수
  bestLevel: number                  // 최고 도달 레벨
  gamesThisSession: number           // 현재 세션 게임 수
}

interface GamePreferences {
  soundEnabled: boolean              // 사운드 on/off
  showTutorial: boolean              // 튜토리얼 표시 여부
}
```

### GameState Schema (메모리)

```typescript
interface GameState {
  status: GameStatus                 // 게임 상태
  score: number                      // 현재 점수
  level: number                      // 현재 레벨
  playTime: number                   // 현재 플레이 시간 (초)
  player: Player                     // 플레이어 상태
  obstacles: Obstacle[]              // 활성 장애물 목록
  isPaused: boolean                  // 일시정지 여부
  lastUpdate: number                 // 마지막 업데이트 타임스탬프
}

type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover'

interface Player {
  x: number                          // X 좌표 (0 ~ 캔버스 너비)
  y: number                          // Y 좌표 (0 ~ 캔버스 높이)
  speed: number                      // 이동 속도 (픽셀/프레임)
  size: number                       // 플레이어 크기
}

interface Obstacle {
  id: string                         // 고유 식별자
  x: number                          // X 좌표
  y: number                          // Y 좌표
  speed: number                      // 낙하 속도
  size: number                       // 장애물 크기
}
```

---

## 🔄 데이터 플로우 상세

### Flow 1: 게임 초기화

```javascript
// 1. LocalStorage에서 데이터 로딩
function loadGameData() {
  const saved = localStorage.getItem('obstacleGameData')

  if (!saved) {
    return createDefaultGameData()
  }

  const data = JSON.parse(saved)

  // 스키마 버전 체크 (마이그레이션 대비)
  if (data.version !== CURRENT_VERSION) {
    return migrateGameData(data)
  }

  return data
}

// 2. 기본값 생성
function createDefaultGameData() {
  return {
    version: "1.0",
    lastPlayed: new Date().toISOString(),
    highScores: [],
    gameStats: {
      totalGames: 0,
      totalPlayTime: 0,
      averageScore: 0,
      bestLevel: 0,
      gamesThisSession: 0
    },
    preferences: {
      soundEnabled: true,
      showTutorial: true
    }
  }
}
```

### Flow 2: 게임 플레이 중 상태 업데이트

```javascript
// 실시간 게임 상태 (메모리만)
function updateGameState(deltaTime) {
  gameState.playTime += deltaTime

  // 점수 증가 (시간 기반)
  gameState.score += Math.floor(deltaTime * SCORE_PER_SECOND)

  // 레벨업 체크
  const newLevel = Math.floor(gameState.playTime / LEVEL_UP_INTERVAL) + 1
  if (newLevel > gameState.level) {
    gameState.level = newLevel
    // 레벨업 이벤트 처리
  }

  // 플레이어 위치 업데이트
  updatePlayerPosition(inputState)

  // 장애물 업데이트
  updateObstacles(deltaTime)

  gameState.lastUpdate = Date.now()
}
```

### Flow 3: 게임 오버 처리

```javascript
// 게임 종료 시 데이터 저장
function handleGameOver() {
  const finalScore = gameState.score
  const finalLevel = gameState.level
  const finalPlayTime = gameState.playTime

  // 1. 최고점수 확인 및 추가
  const newRecord = {
    id: generateUUID(),
    score: finalScore,
    level: finalLevel,
    playTime: finalPlayTime,
    achievedAt: new Date().toISOString(),
    isNewRecord: isNewHighScore(finalScore)
  }

  // 2. 게임 통계 업데이트
  updateGameStats(newRecord)

  // 3. LocalStorage에 저장
  saveGameData()
}

function isNewHighScore(score) {
  const highScores = gameData.highScores
  return highScores.length < 5 || score > highScores[4].score
}

function updateGameStats(newRecord) {
  const stats = gameData.gameStats

  stats.totalGames++
  stats.totalPlayTime += newRecord.playTime
  stats.averageScore = Math.floor(
    (stats.averageScore * (stats.totalGames - 1) + newRecord.score) / stats.totalGames
  )
  stats.bestLevel = Math.max(stats.bestLevel, newRecord.level)
  stats.gamesThisSession++

  // 최고점수 목록 업데이트 (상위 5개만 유지)
  gameData.highScores.push(newRecord)
  gameData.highScores.sort((a, b) => b.score - a.score)
  gameData.highScores = gameData.highScores.slice(0, 5)
}
```

### Flow 4: 데이터 저장

```javascript
function saveGameData() {
  try {
    gameData.lastPlayed = new Date().toISOString()
    localStorage.setItem('obstacleGameData', JSON.stringify(gameData))
    console.log('게임 데이터 저장 완료')
  } catch (error) {
    console.error('저장 실패:', error)
    // 저장 실패 시 사용자에게 알림
    showNotification('데이터 저장에 실패했습니다.')
  }
}
```

---

## 📈 데이터 검증 & 무결성

### 1. 입력 유효성 검증

```javascript
// 점수 유효성 검증
function validateScore(score) {
  return typeof score === 'number' &&
         score >= 0 &&
         score <= MAX_SCORE &&
         Number.isInteger(score)
}

// 레벨 유효성 검증
function validateLevel(level) {
  return typeof level === 'number' &&
         level >= 1 &&
         level <= MAX_LEVEL &&
         Number.isInteger(level)
}

// JSON 스키마 검증
function validateGameData(data) {
  if (!data || typeof data !== 'object') return false
  if (!data.version || typeof data.version !== 'string') return false
  if (!Array.isArray(data.highScores)) return false

  // 각 최고점수 레코드 검증
  return data.highScores.every(score =>
    validateScore(score.score) &&
    validateLevel(score.level) &&
    validateISO8601(score.achievedAt)
  )
}
```

### 2. 데이터 마이그레이션

```javascript
function migrateGameData(oldData) {
  switch (oldData.version) {
    case undefined:  // v1.0 이전
      return {
        ...createDefaultGameData(),
        highScores: oldData.highScores || []
      }

    // 향후 버전 업데이트 시
    case "1.0":
      return {
        ...oldData,
        version: "1.1",
        // 새로운 필드 추가
      }

    default:
      console.warn('알 수 없는 버전:', oldData.version)
      return createDefaultGameData()
  }
}
```

---

## 🎮 게임 상태 관리 패턴

### 상태 머신 (State Machine)

```javascript
const GameStateMachine = {
  'ready': {
    start: 'playing',
    showMenu: 'ready'
  },
  'playing': {
    pause: 'paused',
    gameOver: 'gameover'
  },
  'paused': {
    resume: 'playing',
    restart: 'playing',
    quit: 'ready'
  },
  'gameover': {
    restart: 'playing',
    showResults: 'gameover',
    quit: 'ready'
  }
}

function changeGameState(newState) {
  const currentState = gameState.status
  const allowedTransitions = GameStateMachine[currentState]

  if (!allowedTransitions || !allowedTransitions[newState]) {
    console.error(`잘못된 상태 전환: ${currentState} → ${newState}`)
    return false
  }

  gameState.status = newState
  onStateChanged(currentState, newState)
  return true
}
```

---

## 💾 저장소 최적화

### LocalStorage 사용량 관리

```javascript
// 저장소 크기 체크
function checkStorageUsage() {
  const data = JSON.stringify(gameData)
  const sizeInBytes = new Blob([data]).size
  const sizeInKB = Math.round(sizeInBytes / 1024)

  console.log(`저장소 사용량: ${sizeInKB}KB`)

  // 5KB 초과 시 경고
  if (sizeInKB > 5) {
    console.warn('저장소 사용량 초과')
    cleanupOldData()
  }
}

// 오래된 데이터 정리
function cleanupOldData() {
  // 최고점수는 상위 3개만 유지
  gameData.highScores = gameData.highScores.slice(0, 3)

  // 세션 카운터 리셋
  gameData.gameStats.gamesThisSession = 0

  saveGameData()
}
```

### 배치 저장 패턴

```javascript
let saveTimer = null

function scheduleSave() {
  // 빈번한 저장 방지 (디바운싱)
  if (saveTimer) {
    clearTimeout(saveTimer)
  }

  saveTimer = setTimeout(() => {
    saveGameData()
    saveTimer = null
  }, 1000)  // 1초 후 저장
}
```

---

## 📊 포트폴리오 어필 포인트

### 1. 체계적 데이터 모델링
- **TypeScript 타입 정의**: 강타입 시스템 이해
- **JSON Schema 설계**: 구조화된 데이터 모델링
- **버전 관리**: 마이그레이션 전략 수립

### 2. 성능 최적화
- **메모리 vs 영구 저장소 분리**: 적절한 데이터 계층화
- **배치 저장**: 불필요한 I/O 방지
- **데이터 압축**: 저장 공간 효율성

### 3. 안정성 & 무결성
- **입력 유효성 검증**: 데이터 품질 보장
- **에러 핸들링**: 저장 실패 시 복구 전략
- **상태 머신**: 안전한 상태 전환

### 4. 확장성 고려
- **스키마 버전 관리**: 향후 기능 추가 대비
- **모듈화된 구조**: 기능별 데이터 분리
- **설정 시스템**: 사용자 커스터마이징

---

## 🚀 구현 가이드

### 1. LocalStorage 래퍼 클래스

```javascript
class GameStorage {
  static KEY = 'obstacleGameData'

  static load() {
    try {
      const data = localStorage.getItem(this.KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
      return null
    }
  }

  static save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('데이터 저장 실패:', error)
      return false
    }
  }

  static clear() {
    localStorage.removeItem(this.KEY)
  }
}
```

### 2. 데이터 매니저 클래스

```javascript
class GameDataManager {
  constructor() {
    this.data = this.loadGameData()
  }

  loadGameData() {
    const saved = GameStorage.load()
    return saved && this.validateData(saved)
      ? saved
      : this.createDefaultData()
  }

  saveGameData() {
    this.data.lastPlayed = new Date().toISOString()
    return GameStorage.save(this.data)
  }

  addHighScore(score, level, playTime) {
    // 최고점수 추가 로직
  }

  updateGameStats(newRecord) {
    // 게임 통계 업데이트 로직
  }
}
```

---

## ✅ 데이터 품질 체크리스트

### 스키마 설계
- [ ] 모든 엔티티에 명확한 타입 정의
- [ ] 필수/선택 필드 구분 명확
- [ ] 데이터 관계 및 제약조건 정의
- [ ] 버전 관리 전략 수립

### 성능 최적화
- [ ] 메모리 vs 영구 저장소 적절히 분리
- [ ] 불필요한 저장 작업 최소화
- [ ] 데이터 크기 5KB 이하 유지
- [ ] 배치 처리 패턴 적용

### 안정성 보장
- [ ] 모든 입력에 유효성 검증
- [ ] 저장 실패 시 에러 핸들링
- [ ] 손상된 데이터 복구 메커니즘
- [ ] 상태 전환 안전성 검증

### 사용자 경험
- [ ] 데이터 손실 방지
- [ ] 빠른 로딩 시간 (<100ms)
- [ ] 직관적인 데이터 구조
- [ ] 디버깅 친화적 로그

---

**🎯 최종 목표**: "간단한 게임이지만 체계적이고 확장 가능한 데이터 구조를 설계할 줄 아는 개발자"라는 인상을 주는 포트폴리오