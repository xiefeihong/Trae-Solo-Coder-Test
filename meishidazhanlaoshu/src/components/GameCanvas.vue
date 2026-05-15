<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { GameEngine } from '../game/GameEngine'
import { GameRenderer } from '../game/GameRenderer'

const props = defineProps<{
  engine: GameEngine
}>()

const emit = defineEmits<{
  (e: 'gridClick', position: { x: number; y: number }): void
  (e: 'foodClick', foodId: string): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const renderer = ref<GameRenderer | null>(null)
const animationId = ref<number>(0)

const renderLoop = () => {
  if (renderer.value && props.engine) {
    renderer.value.render()
  }
  animationId.value = requestAnimationFrame(renderLoop)
}

const handleClick = (e: MouseEvent) => {
  if (!renderer.value || !canvasRef.value) return

  const gridPos = renderer.value.getGridPosition(e.clientX, e.clientY)
  if (gridPos) {
    const food = props.engine.getFoodAt(gridPos.x, gridPos.y)
    if (food) {
      emit('foodClick', food.id)
    } else {
      emit('gridClick', gridPos)
    }
  }
}

onMounted(() => {
  if (canvasRef.value) {
    renderer.value = new GameRenderer(canvasRef.value, props.engine)
    renderLoop()
  }
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})

watch(() => props.engine, (newEngine) => {
  if (canvasRef.value && newEngine) {
    renderer.value = new GameRenderer(canvasRef.value, newEngine)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    width="900"
    height="600"
    @click="handleClick"
    class="game-canvas"
  />
</template>

<style scoped>
.game-canvas {
  border: 4px solid #8B4513;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
</style>
