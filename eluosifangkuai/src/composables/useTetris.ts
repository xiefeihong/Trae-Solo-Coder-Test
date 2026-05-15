import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20
export const PREVIEW_SIZE = 4

export type TetrominoType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z'

export interface Tetromino {
  type: TetrominoType
  shape: number[][]
  color: string
}

export interface Position {
  x: number
  y: number
}

export interface GameState {
  board: number[][]
  currentPiece: Tetromino | null
  currentPos: Position
  nextPieces: Tetromino[]
  holdPiece: Tetromino | null
  canHold: boolean
  score: number
  highScore: number
  level: number
  lines: number
  gameOver: boolean
  isPaused: boolean
  isStarted: boolean
}

const TETROMINOS: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f5ff'
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffff00'
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a855f7'
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f97316'
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#3b82f6'
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#22c55e'
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#ef4444'
  }
}

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z']

const SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800
}

const COLOR_MAP: Record<number, string> = {
  0: 'transparent',
  1: '#00f5ff',
  2: '#ffff00',
  3: '#a855f7',
  4: '#f97316',
  5: '#3b82f6',
  6: '#22c55e',
  7: '#ef4444'
}

const getColorIndex = (type: TetrominoType): number => {
  return TETROMINO_TYPES.indexOf(type) + 1
}

export function useTetris() {
  const createEmptyBoard = (): number[][] => {
    return Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => 0)
    )
  }

  const state = reactive<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    currentPos: { x: 0, y: 0 },
    nextPieces: [],
    holdPiece: null,
    canHold: true,
    score: 0,
    highScore: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    isStarted: false
  })

  const dropInterval = computed(() => {
    return Math.max(100, 500 - (state.level - 1) * 50)
  })

  const typeColorMap = computed(() => {
    const map: Record<string, string> = {}
    TETROMINO_TYPES.forEach((type, index) => {
      map[index + 1] = TETROMINOS[type].color
    })
    return map
  })

  let lastDropTime = 0
  let animationFrameId: number | null = null
  let isSoftDropping = false

  const loadHighScore = () => {
    const saved = localStorage.getItem('tetris-high-score')
    if (saved) {
      state.highScore = parseInt(saved, 10)
    }
  }

  const saveHighScore = () => {
    if (state.score > state.highScore) {
      state.highScore = state.score
      localStorage.setItem('tetris-high-score', state.score.toString())
    }
  }

  const getRandomTetromino = (): Tetromino => {
    const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)]
    return { ...TETROMINOS[type], shape: TETROMINOS[type].shape.map(row => [...row]) }
  }

  const initNextPieces = () => {
    state.nextPieces = [getRandomTetromino(), getRandomTetromino(), getRandomTetromino()]
  }

  const getNextPiece = (): Tetromino => {
    const piece = state.nextPieces.shift()!
    state.nextPieces.push(getRandomTetromino())
    return piece
  }

  const rotateMatrix = (matrix: number[][]): number[][] => {
    const N = matrix.length
    const rotated = Array.from({ length: N }, () => Array(N).fill(0))
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rotated[j][N - 1 - i] = matrix[i][j]
      }
    }
    return rotated
  }

  const checkCollision = (
    piece: Tetromino,
    pos: Position,
    board: number[][],
    offsetX = 0,
    offsetY = 0
  ): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x + offsetX
          const newY = pos.y + y + offsetY

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true
          }

          if (newY >= 0 && board[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }

  const spawnPiece = () => {
    const piece = getNextPiece()
    const pos: Position = {
      x: Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2),
      y: 0
    }

    if (checkCollision(piece, pos, state.board)) {
      state.gameOver = true
      state.isStarted = false
      saveHighScore()
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    } else {
      state.currentPiece = piece
      state.currentPos = pos
      state.canHold = true
    }
  }

  const lockPiece = () => {
    if (!state.currentPiece) return

    const colorIndex = getColorIndex(state.currentPiece.type)
    for (let y = 0; y < state.currentPiece.shape.length; y++) {
      for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
        if (state.currentPiece.shape[y][x]) {
          const boardY = state.currentPos.y + y
          const boardX = state.currentPos.x + x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            state.board[boardY][boardX] = colorIndex
          }
        }
      }
    }

    clearLines()
    spawnPiece()
  }

  const clearLines = () => {
    let linesCleared = 0

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (state.board[y].every(cell => cell !== 0)) {
        state.board.splice(y, 1)
        state.board.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared++
        y++
      }
    }

    if (linesCleared > 0) {
      state.score += SCORE_TABLE[linesCleared] * state.level
      state.lines += linesCleared
      state.level = Math.floor(state.lines / 10) + 1
      saveHighScore()
    }
  }

  const movePiece = (dx: number, dy: number): boolean => {
    if (!state.currentPiece || state.gameOver || state.isPaused) return false

    if (!checkCollision(state.currentPiece, state.currentPos, state.board, dx, dy)) {
      state.currentPos.x += dx
      state.currentPos.y += dy
      return true
    }
    return false
  }

  const rotatePiece = () => {
    if (!state.currentPiece || state.gameOver || state.isPaused) return
    if (state.currentPiece.type === 'O') return

    const rotated = rotateMatrix(state.currentPiece.shape)
    const originalShape = state.currentPiece.shape
    state.currentPiece.shape = rotated

    const kicks = [0, -1, 1, -2, 2]
    let valid = false

    for (const kick of kicks) {
      if (!checkCollision(state.currentPiece, state.currentPos, state.board, kick, 0)) {
        state.currentPos.x += kick
        valid = true
        break
      }
    }

    if (!valid) {
      state.currentPiece.shape = originalShape
    }
  }

  const hardDrop = () => {
    if (!state.currentPiece || state.gameOver || state.isPaused) return

    let dropDistance = 0
    while (!checkCollision(state.currentPiece, state.currentPos, state.board, 0, dropDistance + 1)) {
      dropDistance++
    }

    state.currentPos.y += dropDistance
    state.score += dropDistance * 2
    lockPiece()
  }

  const holdCurrentPiece = () => {
    if (!state.currentPiece || state.gameOver || state.isPaused || !state.canHold) return

    const pieceToHold = state.currentPiece

    if (state.holdPiece) {
      state.currentPiece = state.holdPiece
      state.currentPos = {
        x: Math.floor((BOARD_WIDTH - state.currentPiece.shape[0].length) / 2),
        y: 0
      }
    } else {
      spawnPiece()
    }

    state.holdPiece = pieceToHold
    state.canHold = false
  }

  const gameLoop = (timestamp: number) => {
    if (state.gameOver || state.isPaused || !state.isStarted) {
      animationFrameId = requestAnimationFrame(gameLoop)
      return
    }

    const interval = isSoftDropping ? Math.min(dropInterval.value, 50) : dropInterval.value

    if (timestamp - lastDropTime > interval) {
      if (!movePiece(0, 1)) {
        lockPiece()
      }
      lastDropTime = timestamp
    }

    animationFrameId = requestAnimationFrame(gameLoop)
  }

  const startGame = () => {
    state.board = createEmptyBoard()
    state.score = 0
    state.level = 1
    state.lines = 0
    state.gameOver = false
    state.isPaused = false
    state.isStarted = true
    state.holdPiece = null
    state.canHold = true

    initNextPieces()
    spawnPiece()

    lastDropTime = performance.now()
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    animationFrameId = requestAnimationFrame(gameLoop)
  }

  const togglePause = () => {
    if (!state.isStarted || state.gameOver) return
    state.isPaused = !state.isPaused
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!state.isStarted || state.gameOver) return

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        if (!state.isPaused) movePiece(-1, 0)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (!state.isPaused) movePiece(1, 0)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!state.isPaused) {
          isSoftDropping = true
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!state.isPaused) rotatePiece()
        break
      case ' ':
        e.preventDefault()
        if (!state.isPaused) hardDrop()
        break
      case 'p':
      case 'P':
      case 'Escape':
        e.preventDefault()
        togglePause()
        break
      case 'c':
      case 'C':
        e.preventDefault()
        if (!state.isPaused) holdCurrentPiece()
        break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      isSoftDropping = false
    }
  }

  onMounted(() => {
    loadHighScore()
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  const getGhostY = (): number => {
    if (!state.currentPiece) return 0

    let ghostY = state.currentPos.y
    while (!checkCollision(state.currentPiece, { ...state.currentPos, y: ghostY + 1 }, state.board)) {
      ghostY++
    }
    return ghostY
  }

  return {
    state,
    BOARD_WIDTH,
    BOARD_HEIGHT,
    PREVIEW_SIZE,
    COLOR_MAP,
    typeColorMap,
    startGame,
    togglePause,
    movePiece,
    rotatePiece,
    hardDrop,
    holdCurrentPiece,
    getGhostY
  }
}
