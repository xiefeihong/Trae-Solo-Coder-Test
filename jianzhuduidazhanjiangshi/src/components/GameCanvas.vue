<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { GameState } from '../types'
import { updateGame } from '../game/gameLogic'
import { renderGame } from '../game/renderer'

interface Props {
  gameState: GameState
}

const props = defineProps<Props>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasWidth = 1200
const canvasHeight = 650

let animationId: number | null = null
let lastTime = 0

const gameLoop = (currentTime: number) => {
  const deltaTime = lastTime ? currentTime - lastTime : 16
  lastTime = currentTime

  updateGame(props.gameState, deltaTime, canvasWidth, canvasHeight)

  const canvas = canvasRef.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      renderGame(ctx, props.gameState, canvasWidth, canvasHeight)
    }
  }

  animationId = requestAnimationFrame(gameLoop)
}

const handleCanvasClick = (event: MouseEvent) => {
  if (props.gameState.isGameOver || props.gameState.isVictory) return

  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const clickedBuilding = props.gameState.buildings.find(b => 
    x >= b.position.x && 
    x <= b.position.x + 70 && 
    y >= b.position.y && 
    y <= b.position.y + 60
  )

  if (clickedBuilding) {
    props.gameState.selectedBuilding = clickedBuilding
    props.gameState.buildMode = null
  } else if (props.gameState.buildMode) {
    const buildEvent = new CustomEvent('build', {
      detail: { x, y }
    })
    canvas.dispatchEvent(buildEvent)
  } else {
    props.gameState.selectedBuilding = null
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    animationId = requestAnimationFrame(gameLoop)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    @click="handleCanvasClick"
    class="game-canvas"
  ></canvas>
</template>

<style scoped>
.game-canvas {
  border: 4px solid #333;
  border-radius: 8px;
  cursor: crosshair;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
</style>
