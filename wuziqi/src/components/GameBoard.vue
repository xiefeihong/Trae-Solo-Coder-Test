<template>
  <div class="game-board-container">
    <canvas
      ref="canvasRef"
      :width="canvasSize"
      :height="canvasSize"
      @click="handleCanvasClick"
      class="game-canvas"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import type { GameState } from '../types/game'
import { BOARD_SIZE } from '../types/game'

interface Props {
  gameState: GameState
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'move', row: number, col: number): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasSize = computed(() => Math.min(window.innerWidth - 40, 540))

const cellSize = computed(() => canvasSize.value / (BOARD_SIZE + 1))
const padding = computed(() => cellSize.value / 2)

function drawBoard() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#DEB887'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 1

  for (let i = 0; i < BOARD_SIZE; i++) {
    ctx.beginPath()
    ctx.moveTo(padding.value + i * cellSize.value, padding.value)
    ctx.lineTo(padding.value + i * cellSize.value, canvas.height - padding.value)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding.value, padding.value + i * cellSize.value)
    ctx.lineTo(canvas.width - padding.value, padding.value + i * cellSize.value)
    ctx.stroke()
  }

  drawStarPoints(ctx)
  drawPieces(ctx)
  highlightLastMove(ctx)
}

function drawStarPoints(ctx: CanvasRenderingContext2D) {
  const starPoints = [
    [3, 3], [3, 7], [3, 11],
    [7, 3], [7, 7], [7, 11],
    [11, 3], [11, 7], [11, 11]
  ]

  ctx.fillStyle = '#8B4513'
  for (const [row, col] of starPoints) {
    const x = padding.value + col * cellSize.value
    const y = padding.value + row * cellSize.value
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPieces(ctx: CanvasRenderingContext2D) {
  const pieceRadius = cellSize.value * 0.4

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const player = props.gameState.board[row][col]
      if (player) {
        const x = padding.value + col * cellSize.value
        const y = padding.value + row * cellSize.value

        const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, pieceRadius)
        if (player === 'black') {
          gradient.addColorStop(0, '#555')
          gradient.addColorStop(1, '#000')
        } else {
          gradient.addColorStop(0, '#fff')
          gradient.addColorStop(1, '#ddd')
        }

        ctx.beginPath()
        ctx.arc(x, y, pieceRadius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.strokeStyle = player === 'black' ? '#000' : '#ccc'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
}

function highlightLastMove(ctx: CanvasRenderingContext2D) {
  if (!props.gameState.lastMove) return

  const { row, col } = props.gameState.lastMove
  const x = padding.value + col * cellSize.value
  const y = padding.value + row * cellSize.value

  ctx.strokeStyle = '#FF0000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, cellSize.value * 0.35, 0, Math.PI * 2)
  ctx.stroke()
}

function handleCanvasClick(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas || props.gameState.gameOver) return

  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  const x = (event.clientX - rect.left) * scaleX
  const y = (event.clientY - rect.top) * scaleY

  const col = Math.round((x - padding.value) / cellSize.value)
  const row = Math.round((y - padding.value) / cellSize.value)

  if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    emit('move', row, col)
  }
}

function handleResize() {
  drawBoard()
}

onMounted(() => {
  nextTick(() => {
    drawBoard()
  })
  window.addEventListener('resize', handleResize)
})

watch(
  () => props.gameState,
  () => {
    nextTick(() => {
      drawBoard()
    })
  },
  { deep: true }
)
</script>

<style scoped>
.game-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.game-canvas {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  max-width: 100%;
  height: auto;
}
</style>
