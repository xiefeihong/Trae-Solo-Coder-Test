<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTetris, Difficulty } from '../composables/useTetris'

const {
  state,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PREVIEW_SIZE,
  COLOR_MAP,
  DIFFICULTY_CONFIGS,
  dropInterval,
  startGame,
  togglePause,
  movePiece,
  rotatePiece,
  hardDrop,
  holdCurrentPiece,
  getGhostY,
  setDifficulty,
  setCustomSpeed,
  setShowPentomino
} = useTetris()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewCanvasRefs = ref<(HTMLCanvasElement | null)[]>([])
const holdCanvasRef = ref<HTMLCanvasElement | null>(null)

const BLOCK_SIZE = 26
const PREVIEW_BLOCK_SIZE = 16

const canvasWidth = BOARD_WIDTH * BLOCK_SIZE
const canvasHeight = BOARD_HEIGHT * BLOCK_SIZE

const showDifficultyModal = ref(false)

const renderBoard = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#0f0f23'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = state.board[y][x]
      if (cell) {
        drawBlock(ctx, x, y, COLOR_MAP[cell], BLOCK_SIZE)
      }
    }
  }

  if (state.currentPiece && state.isStarted && !state.gameOver) {
    const ghostY = getGhostY()

    for (let y = 0; y < state.currentPiece.shape.length; y++) {
      for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
        if (state.currentPiece.shape[y][x]) {
          const boardY = state.currentPos.y + y
          const boardX = state.currentPos.x + x
          
          if (boardY >= 0) {
            drawGhostBlock(ctx, boardX, ghostY + y, state.currentPiece.color, BLOCK_SIZE)
          }
        }
      }
    }

    for (let y = 0; y < state.currentPiece.shape.length; y++) {
      for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
        if (state.currentPiece.shape[y][x]) {
          const boardY = state.currentPos.y + y
          const boardX = state.currentPos.x + x
          
          if (boardY >= 0) {
            drawBlock(ctx, boardX, boardY, state.currentPiece.color, BLOCK_SIZE)
          }
        }
      }
    }
  }

  ctx.strokeStyle = '#1a1a3a'
  ctx.lineWidth = 1
  for (let x = 0; x <= BOARD_WIDTH; x++) {
    ctx.beginPath()
    ctx.moveTo(x * BLOCK_SIZE, 0)
    ctx.lineTo(x * BLOCK_SIZE, canvasHeight)
    ctx.stroke()
  }
  for (let y = 0; y <= BOARD_HEIGHT; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * BLOCK_SIZE)
    ctx.lineTo(canvasWidth, y * BLOCK_SIZE)
    ctx.stroke()
  }
}

const drawBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) => {
  const px = x * size
  const py = y * size

  ctx.fillStyle = color
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.fillRect(px + 1, py + 1, size - 2, 4)
  ctx.fillRect(px + 1, py + 1, 4, size - 2)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(px + size - 5, py + 1, 4, size - 2)
  ctx.fillRect(px + 1, py + size - 5, size - 2, 4)
}

const drawGhostBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) => {
  const px = x * size
  const py = y * size

  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.4
  ctx.strokeRect(px + 2, py + 2, size - 4, size - 4)
  ctx.globalAlpha = 1
}

const renderPreview = () => {
  state.nextPieces.forEach((piece, index) => {
    const canvas = previewCanvasRefs.value[index]
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const previewSize = PREVIEW_SIZE * PREVIEW_BLOCK_SIZE
    ctx.fillStyle = '#0f0f23'
    ctx.fillRect(0, 0, previewSize, previewSize)

    const offsetX = (PREVIEW_SIZE - piece.shape.length) / 2
    const offsetY = (PREVIEW_SIZE - piece.shape.length) / 2

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          drawBlock(ctx, x + offsetX, y + offsetY, piece.color, PREVIEW_BLOCK_SIZE)
        }
      }
    }
  })
}

const renderHold = () => {
  const canvas = holdCanvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const holdSize = PREVIEW_SIZE * PREVIEW_BLOCK_SIZE
  ctx.fillStyle = '#0f0f23'
  ctx.fillRect(0, 0, holdSize, holdSize)

  if (state.holdPiece) {
    const piece = state.holdPiece
    const offsetX = (PREVIEW_SIZE - piece.shape.length) / 2
    const offsetY = (PREVIEW_SIZE - piece.shape.length) / 2

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          drawBlock(ctx, x + offsetX, y + offsetY, piece.color, PREVIEW_BLOCK_SIZE)
        }
      }
    }
  }
}

const setPreviewCanvasRef = (el: HTMLCanvasElement | null, index: number) => {
  previewCanvasRefs.value[index] = el
}

const selectDifficulty = (diff: Difficulty) => {
  setDifficulty(diff)
}

const startGameWithClose = () => {
  showDifficultyModal.value = false
  startGame()
}

const handleMoveLeft = () => {
  if (!state.isPaused && state.isStarted && !state.gameOver) {
    movePiece(-1, 0)
  }
}

const handleMoveRight = () => {
  if (!state.isPaused && state.isStarted && !state.gameOver) {
    movePiece(1, 0)
  }
}

const handleMoveDown = () => {
  if (!state.isPaused && state.isStarted && !state.gameOver) {
    movePiece(0, 1)
  }
}

const handleRotate = () => {
  if (!state.isPaused && state.isStarted && !state.gameOver) {
    rotatePiece()
  }
}

const handleHardDrop = () => {
  if (!state.isPaused && state.isStarted && !state.gameOver) {
    hardDrop()
  }
}

const handleHold = () => {
  if (!state.isPaused && state.isStarted && !state.gameOver) {
    holdCurrentPiece()
  }
}

onMounted(() => {
  renderBoard()
})

watch(() => [state.board, state.currentPiece, state.currentPos, state.nextPieces, state.holdPiece, state.isStarted, state.gameOver], () => {
  renderBoard()
  renderPreview()
  renderHold()
}, { deep: true })

const currentDifficultyLabel = computed(() => DIFFICULTY_CONFIGS[state.difficulty].label)
const dropSpeedDisplay = computed(() => `${(dropInterval.value / 1000).toFixed(2)}s`)
</script>

<template>
  <div class="tetris-container">
    <div class="game-title">
      <h1>俄罗斯方块</h1>
      <p class="subtitle">Vue 3 + TypeScript</p>
    </div>

    <div class="game-wrapper">
      <div class="left-panel">
        <div class="panel-section">
          <h3>暂存 (C)</h3>
          <canvas
            ref="holdCanvasRef"
            :width="PREVIEW_SIZE * PREVIEW_BLOCK_SIZE"
            :height="PREVIEW_SIZE * PREVIEW_BLOCK_SIZE"
            class="preview-canvas"
          ></canvas>
        </div>

        <div class="panel-section">
          <h3>得分</h3>
          <div class="score-value">{{ state.score }}</div>
        </div>

        <div class="panel-section">
          <h3>最高分</h3>
          <div class="score-value high">{{ state.highScore }}</div>
        </div>

        <div class="panel-section">
          <h3>下落速度</h3>
          <div class="speed-value">{{ dropSpeedDisplay }}</div>
        </div>
      </div>

      <div class="main-game">
        <div class="canvas-container" :class="{ 'game-over': state.gameOver, 'paused': state.isPaused && state.isStarted }">
          <canvas
            ref="canvasRef"
            :width="canvasWidth"
            :height="canvasHeight"
            class="game-canvas"
          ></canvas>

          <div v-if="!state.isStarted && !state.gameOver" class="overlay start-overlay">
            <button @click="showDifficultyModal = true" class="btn btn-primary">选择难度</button>
            <p class="current-diff">当前: {{ currentDifficultyLabel }}</p>
          </div>

          <div v-if="state.gameOver" class="overlay game-over-overlay">
            <h2>游戏结束!</h2>
            <p>得分: {{ state.score }}</p>
            <button @click="showDifficultyModal = true" class="btn btn-primary">再来一局</button>
          </div>

          <div v-if="state.isPaused && state.isStarted && !state.gameOver" class="overlay pause-overlay">
            <h2>暂停</h2>
            <button @click="togglePause" class="btn btn-secondary">继续</button>
          </div>
        </div>

        <div class="game-info-bar">
          <span class="diff-badge" :class="state.difficulty">{{ currentDifficultyLabel }}</span>
          <span class="level-badge">Lv.{{ state.level }}</span>
          <span class="lines-badge">{{ state.lines }} 行</span>
        </div>

        <div class="mobile-controls">
          <div class="control-row">
            <button @click="handleRotate" class="control-btn">↻</button>
          </div>
          <div class="control-row">
            <button @click="handleMoveLeft" class="control-btn">←</button>
            <button @click="handleHardDrop" class="control-btn drop-btn">↓</button>
            <button @click="handleMoveRight" class="control-btn">→</button>
          </div>
          <div class="control-row">
            <button @click="handleHold" class="control-btn hold-btn">暂存</button>
            <button @click="handleMoveDown" class="control-btn">加速</button>
            <button @click="togglePause" class="control-btn pause-btn" :disabled="!state.isStarted || state.gameOver">暂停</button>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-section">
          <h3>下一个</h3>
          <div class="next-pieces">
            <canvas
              v-for="(_, index) in state.nextPieces"
              :key="index"
              :ref="(el) => setPreviewCanvasRef(el as HTMLCanvasElement, index)"
              :width="PREVIEW_SIZE * PREVIEW_BLOCK_SIZE"
              :height="PREVIEW_SIZE * PREVIEW_BLOCK_SIZE"
              class="preview-canvas"
            ></canvas>
          </div>
        </div>

        <div class="panel-section">
          <h3>等级</h3>
          <div class="level-value">{{ state.level }}</div>
        </div>

        <div class="panel-section">
          <h3>行数</h3>
          <div class="lines-value">{{ state.lines }}</div>
        </div>

        <div class="panel-section controls-info">
          <h3>操作说明</h3>
          <ul>
            <li><span>← →</span> 左右移动</li>
            <li><span>↑</span> 旋转</li>
            <li><span>↓</span> 加速下落</li>
            <li><span>空格</span> 直接落底</li>
            <li><span>C</span> 暂存方块</li>
            <li><span>P/Esc</span> 暂停</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="showDifficultyModal" class="modal-overlay" @click.self="showDifficultyModal = false">
      <div class="modal-content">
        <h2>🎮 选择难度</h2>
        <div class="difficulty-grid">
          <button
            v-for="(config, key) in DIFFICULTY_CONFIGS"
            :key="key"
            @click="selectDifficulty(key as Difficulty)"
            class="diff-btn"
            :class="{ active: state.difficulty === key }"
          >
            <span class="diff-label">{{ config.label }}</span>
            <span class="diff-speed">速度: {{ (config.baseInterval / 1000).toFixed(2) }}s</span>
            <span class="diff-pentomino" v-if="config.includePentomino">✨ 含5格方块</span>
          </button>
        </div>

        <div v-if="state.difficulty === 'custom'" class="custom-settings">
          <h3>⚙️ 自定义设置</h3>
          <div class="setting-item">
            <label>下落间隔 (ms):</label>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              v-model.number="state.customSpeed"
              @input="setCustomSpeed(state.customSpeed)"
            />
            <span class="setting-value">{{ state.customSpeed }}ms</span>
          </div>
          <div class="setting-item">
            <label>启用5格方块:</label>
            <input
              type="checkbox"
              v-model="state.showPentomino"
              @change="setShowPentomino(state.showPentomino)"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button @click="startGameWithClose" class="btn btn-primary btn-lg">开始游戏!</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tetris-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 100%;
}

.game-title {
  text-align: center;
  margin-bottom: 20px;
}

.game-title h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #00f5ff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 5px;
}

.subtitle {
  color: #888;
  font-size: 0.9rem;
}

.game-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 140px;
}

.panel-section {
  background: rgba(15, 15, 35, 0.8);
  border: 2px solid #2a2a5a;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.panel-section h3 {
  color: #00f5ff;
  margin-bottom: 10px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.preview-canvas {
  border-radius: 5px;
  display: block;
  margin: 0 auto;
}

.next-pieces {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffff00;
}

.score-value.high {
  color: #22c55e;
}

.level-value {
  font-size: 2rem;
  font-weight: bold;
  color: #f97316;
}

.lines-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
}

.speed-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #a855f7;
}

.controls-info {
  text-align: left;
}

.controls-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.controls-info li {
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.controls-info span {
  background: #2a2a5a;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #fff;
  min-width: 40px;
  text-align: center;
}

.main-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.game-info-bar {
  display: flex;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

.diff-badge,
.level-badge,
.lines-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}

.diff-badge {
  background: linear-gradient(135deg, #a855f7, #6366f1);
}

.diff-badge.easy {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.diff-badge.normal {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.diff-badge.hard {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.diff-badge.expert {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  animation: pulse 2s infinite;
}

.diff-badge.custom {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.level-badge {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

.lines-badge {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.canvas-container {
  position: relative;
  border: 3px solid #2a2a5a;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 245, 255, 0.2);
}

.game-canvas {
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.overlay h2 {
  color: #fff;
  font-size: 1.8rem;
  margin: 0;
}

.overlay p {
  color: #aaa;
  font-size: 1.1rem;
}

.current-diff {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #888;
}

.btn {
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.btn-primary {
  background: linear-gradient(135deg, #00f5ff, #a855f7);
  color: #000;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
}

.btn-lg {
  padding: 15px 40px;
  font-size: 1.2rem;
}

.btn-secondary {
  background: #2a2a5a;
  color: #fff;
}

.btn-secondary:hover {
  background: #3a3a7a;
}

.mobile-controls {
  display: none;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 280px;
}

.control-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.control-btn {
  width: 60px;
  height: 50px;
  font-size: 1.5rem;
  background: #2a2a5a;
  color: #fff;
  border: 2px solid #4a4a8a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:active {
  background: #4a4a8a;
  transform: scale(0.95);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-btn {
  background: #22c55e;
  border-color: #16a34a;
}

.hold-btn {
  background: #a855f7;
  border-color: #9333ea;
  font-size: 0.9rem;
  width: 70px;
}

.pause-btn {
  background: #f97316;
  border-color: #ea580c;
  font-size: 0.9rem;
  width: 70px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a3a, #0f0f23);
  border: 2px solid #2a2a5a;
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
}

.modal-content h2 {
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.difficulty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.diff-btn {
  background: #2a2a5a;
  border: 2px solid #4a4a8a;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.diff-btn:hover {
  background: #3a3a7a;
  transform: translateY(-2px);
}

.diff-btn.active {
  border-color: #00f5ff;
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.4);
}

.diff-label {
  color: #fff;
  font-weight: bold;
  font-size: 1rem;
}

.diff-speed {
  color: #888;
  font-size: 0.85rem;
}

.diff-pentomino {
  color: #ffd700;
  font-size: 0.75rem;
}

.custom-settings {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.custom-settings h3 {
  color: #a855f7;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.setting-item label {
  color: #ccc;
  min-width: 120px;
}

.setting-item input[type="range"] {
  flex: 1;
  min-width: 150px;
}

.setting-value {
  color: #00f5ff;
  font-weight: bold;
  min-width: 60px;
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.modal-actions {
  text-align: center;
}

@media (max-width: 768px) {
  .game-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .left-panel,
  .right-panel {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    min-width: unset;
  }

  .panel-section {
    flex: 1;
    min-width: 120px;
  }

  .next-pieces {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .controls-info {
    display: none;
  }

  .mobile-controls {
    display: flex;
  }

  .modal-content {
    padding: 20px;
  }

  .difficulty-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
