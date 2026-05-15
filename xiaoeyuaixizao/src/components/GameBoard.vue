<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { PipeType, WaterQuality } from '@/types/game'

const emit = defineEmits<{
  backToLevels: []
}>()

const gameStore = useGameStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const showWinModal = ref(false)

const level = computed(() => gameStore.currentLevel)
const grid = computed(() => gameStore.grid)
const isWon = computed(() => gameStore.isWon)
const usedPipes = computed(() => gameStore.usedPipes)
const stars = computed(() => gameStore.stars)
const filledCells = computed(() => gameStore.filledCells)
const selectedPipe = computed(() => gameStore.selectedPipe)
const isPreviewMode = computed(() => gameStore.isPreviewMode)

const availablePipes = [
  { type: PipeType.STRAIGHT, name: '直管', icon: '║' },
  { type: PipeType.CORNER, name: '弯管', icon: '╚' },
  { type: PipeType.CROSS, name: '十字', icon: '╬' },
  { type: PipeType.T_SHAPE, name: 'T型', icon: '╠' }
]

const CELL_SIZE = 50

function getWaterColor(quality: WaterQuality): string {
  switch (quality) {
    case WaterQuality.PURE:
      return '#4fc3f7'
    case WaterQuality.DIRTY:
      return '#8d6e63'
    case WaterQuality.SOAPY:
      return '#f8bbd9'
    default:
      return '#4fc3f7'
  }
}

function renderCell(ctx: CanvasRenderingContext2D, row: number, col: number) {
  const x = col * CELL_SIZE
  const y = row * CELL_SIZE
  const cell = grid.value[row][col]
  const key = `${row},${col}`
  const hasWater = filledCells.value.has(key)
  const waterQuality = filledCells.value.get(key) || WaterQuality.PURE

  ctx.save()
  
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)

  switch (cell.type) {
    case 'wall':
      ctx.fillStyle = '#78909c'
      ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4)
      ctx.fillStyle = '#546e7a'
      ctx.fillRect(x + 6, y + 6, CELL_SIZE - 12, CELL_SIZE - 12)
      break

    case 'dirt':
      if (!cell.isCleared) {
        ctx.fillStyle = '#a1887f'
        ctx.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8)
        ctx.fillStyle = '#8d6e63'
        ctx.font = '20px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('🌱', x + CELL_SIZE / 2, y + CELL_SIZE / 2)
      }
      break

    case 'source':
      ctx.fillStyle = '#4fc3f7'
      ctx.beginPath()
      ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('💧', x + CELL_SIZE / 2, y + CELL_SIZE / 2)
      break

    case 'bathtub':
      ctx.fillStyle = hasWater ? getWaterColor(waterQuality) : '#e0e0e0'
      ctx.beginPath()
      ctx.ellipse(x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 5, CELL_SIZE / 3, CELL_SIZE / 4, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#78909c'
      ctx.fillRect(x + 10, y + 15, CELL_SIZE - 20, 5)
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐊', x + CELL_SIZE / 2, y + CELL_SIZE / 2 - 8)
      break

    case 'purifier':
      ctx.fillStyle = '#81c784'
      ctx.fillRect(x + 8, y + 8, CELL_SIZE - 16, CELL_SIZE - 16)
      ctx.fillStyle = '#fff'
      ctx.font = '18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('♻️', x + CELL_SIZE / 2, y + CELL_SIZE / 2)
      break

    case 'sewage':
      ctx.fillStyle = '#8d6e63'
      ctx.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8)
      break

    case 'sponge':
      ctx.fillStyle = '#ffcc80'
      ctx.fillRect(x + 6, y + 6, CELL_SIZE - 12, CELL_SIZE - 12)
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🧽', x + CELL_SIZE / 2, y + CELL_SIZE / 2)
      break
  }

  if (cell.pipe && !cell.pipe.isFixed) {
    drawPipe(ctx, cell.pipe.type, cell.pipe.rotation, x, y, hasWater, waterQuality)
  } else if (cell.pipe && cell.pipe.isFixed && cell.type !== 'source' && cell.type !== 'bathtub') {
    drawPipe(ctx, cell.pipe.type, cell.pipe.rotation, x, y, hasWater, waterQuality)
  }

  if (hasWater && !cell.pipe) {
    ctx.fillStyle = getWaterColor(waterQuality)
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  type: PipeType,
  rotation: number,
  x: number,
  y: number,
  hasWater: boolean,
  waterQuality: WaterQuality
) {
  const cx = x + CELL_SIZE / 2
  const cy = y + CELL_SIZE / 2
  const pipeWidth = 12

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rotation * Math.PI) / 180)

  const pipeColor = hasWater ? getWaterColor(waterQuality) : '#90a4ae'
  ctx.strokeStyle = pipeColor
  ctx.lineWidth = pipeWidth
  ctx.lineCap = 'round'

  switch (type) {
    case PipeType.STRAIGHT:
      ctx.beginPath()
      ctx.moveTo(0, -CELL_SIZE / 2 + pipeWidth / 2)
      ctx.lineTo(0, CELL_SIZE / 2 - pipeWidth / 2)
      ctx.stroke()
      break

    case PipeType.CORNER:
      ctx.beginPath()
      ctx.moveTo(0, -CELL_SIZE / 2 + pipeWidth / 2)
      ctx.lineTo(0, 0)
      ctx.lineTo(CELL_SIZE / 2 - pipeWidth / 2, 0)
      ctx.stroke()
      break

    case PipeType.CROSS:
      ctx.beginPath()
      ctx.moveTo(0, -CELL_SIZE / 2 + pipeWidth / 2)
      ctx.lineTo(0, CELL_SIZE / 2 - pipeWidth / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-CELL_SIZE / 2 + pipeWidth / 2, 0)
      ctx.lineTo(CELL_SIZE / 2 - pipeWidth / 2, 0)
      ctx.stroke()
      break

    case PipeType.T_SHAPE:
      ctx.beginPath()
      ctx.moveTo(-CELL_SIZE / 2 + pipeWidth / 2, 0)
      ctx.lineTo(CELL_SIZE / 2 - pipeWidth / 2, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, -CELL_SIZE / 2 + pipeWidth / 2)
      ctx.stroke()
      break
  }

  ctx.restore()
}

function render() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let row = 0; row < level.value.rows; row++) {
    for (let col = 0; col < level.value.cols; col++) {
      renderCell(ctx, row, col)
    }
  }
}

function handleCanvasClick(event: MouseEvent) {
  if (isWon.value) return

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const col = Math.floor((event.clientX - rect.left) / CELL_SIZE)
  const row = Math.floor((event.clientY - rect.top) / CELL_SIZE)

  if (row < 0 || row >= level.value.rows || col < 0 || col >= level.value.cols) {
    return
  }

  if (selectedPipe.value) {
    gameStore.placePipe(row, col, selectedPipe.value)
  }
}

function handleRightClick(event: MouseEvent) {
  event.preventDefault()
  
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const col = Math.floor((event.clientX - rect.left) / CELL_SIZE)
  const row = Math.floor((event.clientY - rect.top) / CELL_SIZE)

  if (row < 0 || row >= level.value.rows || col < 0 || col >= level.value.cols) {
    return
  }

  gameStore.removePipe(row, col)
}

function selectPipe(pipeType: PipeType) {
  gameStore.selectedPipe = gameStore.selectedPipe === pipeType ? null : pipeType
}

function startGame() {
  gameStore.startWaterFlow()
}

function previewFlow() {
  if (isPreviewMode.value) {
    gameStore.stopPreview()
  } else {
    gameStore.previewWaterFlow()
  }
}

watch(isWon, (newVal) => {
  if (newVal) {
    showWinModal.value = true
  }
})

watch(() => gameStore.grid, () => {
  render()
}, { deep: true })

watch(filledCells, () => {
  render()
}, { deep: true })

onMounted(() => {
  render()
})
</script>

<template>
  <div class="game-board card">
    <div class="game-header">
      <button class="btn btn-secondary" @click="emit('backToLevels')">
        ← 返回
      </button>
      <div class="level-info">
        <h2>关卡 {{ level.id }}: {{ level.name }}</h2>
        <div class="stats">
          <span>已用管道: {{ usedPipes }} / {{ level.recommendedSteps }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="gameStore.undo()">↶ 撤销</button>
        <button class="btn btn-secondary" @click="gameStore.redo()">↷ 重做</button>
        <button class="btn btn-warning" @click="gameStore.resetLevel()">🔄 重置</button>
      </div>
    </div>

    <div class="game-main">
      <div class="canvas-container">
        <canvas
          ref="canvasRef"
          :width="level.cols * CELL_SIZE"
          :height="level.rows * CELL_SIZE"
          @click="handleCanvasClick"
          @contextmenu="handleRightClick"
        ></canvas>
      </div>

      <div class="sidebar">
        <div class="pipe-selector">
          <h3>选择管道</h3>
          <div class="pipe-list">
            <button
              v-for="pipe in availablePipes"
              :key="pipe.type"
              class="pipe-btn"
              :class="{ selected: selectedPipe === pipe.type }"
              @click="selectPipe(pipe.type)"
            >
              <span class="pipe-icon">{{ pipe.icon }}</span>
              <span class="pipe-name">{{ pipe.name }}</span>
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" @click="previewFlow">
            {{ isPreviewMode ? '停止预览' : '预览水流' }}
          </button>
          <button class="btn btn-success" @click="startGame" :disabled="isWon">
            放水！
          </button>
        </div>

        <div class="tips">
          <p>💡 左键点击放置/旋转管道</p>
          <p>💡 右键点击删除管道</p>
          <p>💡 点击泥土可清除</p>
        </div>
      </div>
    </div>

    <div v-if="showWinModal" class="win-modal-overlay" @click.self="showWinModal = false">
      <div class="win-modal card">
        <h2>🎉 恭喜过关！</h2>
        <div class="win-stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ filled: stars >= i }">★</span>
        </div>
        <div class="win-stats">
          <p>使用管道: {{ usedPipes }} 个</p>
          <p>推荐步数: {{ level.recommendedSteps }} 步</p>
        </div>
        <div class="win-actions">
          <button class="btn btn-secondary" @click="gameStore.resetLevel(); showWinModal = false">
            重玩
          </button>
          <button class="btn btn-success" @click="showWinModal = false; emit('backToLevels')">
            选择关卡
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  max-width: 1000px;
  width: 100%;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.level-info h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.stats {
  color: #666;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.game-main {
  display: flex;
  gap: 24px;
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

canvas {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pipe-selector h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.pipe-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.pipe-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.pipe-btn:hover {
  background: #e8e8e8;
}

.pipe-btn.selected {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-color: #667eea;
}

.pipe-icon {
  font-size: 24px;
  color: #667eea;
  margin-bottom: 4px;
}

.pipe-name {
  font-size: 12px;
  color: #666;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tips {
  background: #fff3e0;
  padding: 12px;
  border-radius: 8px;
}

.tips p {
  margin: 4px 0;
  font-size: 12px;
  color: #e65100;
}

.win-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.win-modal {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.win-modal h2 {
  margin-bottom: 20px;
  color: #333;
}

.win-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.win-stars .star {
  font-size: 48px;
  color: #ddd;
}

.win-stars .star.filled {
  color: #ffd700;
  text-shadow: 0 0 16px rgba(255, 215, 0, 0.5);
  animation: starPop 0.3s ease;
}

@keyframes starPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.win-stats {
  margin-bottom: 24px;
}

.win-stats p {
  margin: 8px 0;
  color: #666;
}

.win-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
