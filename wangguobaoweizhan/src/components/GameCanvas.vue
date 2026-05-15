<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { GameEngine } from '../game/GameEngine';
import { useGameStore } from '../stores/game';

interface Props {
  engine: GameEngine;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const gameStore = useGameStore();
let animationId: number | null = null;
let lastTime = 0;

function gameLoop(timestamp: number) {
  if (!canvasRef.value) return;

  const deltaTime = lastTime ? timestamp - lastTime : 16;
  lastTime = timestamp;

  props.engine.update(deltaTime);
  
  gameStore.setGold(props.engine.gold);
  gameStore.setLives(props.engine.lives);
  gameStore.setCurrentWave(props.engine.currentWave);
  gameStore.setGameState(props.engine.gameState);
  gameStore.setWaveInProgress(props.engine.waveInProgress);
  gameStore.setSelectedTower(props.engine.selectedTower);
  gameStore.setBuildMode(props.engine.buildMode);
  gameStore.setGameSpeed(props.engine.gameSpeed);

  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    props.engine.render(ctx);
  }

  animationId = requestAnimationFrame(gameLoop);
}

function handleCanvasClick(event: MouseEvent) {
  if (!canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (props.engine.buildMode) {
    const gridPos = props.engine.map.getGridPosition({ x, y });
    props.engine.buildTower(props.engine.buildMode, gridPos);
    gameStore.setBuildMode(props.engine.buildMode);
    gameStore.setGold(props.engine.gold);
  } else {
    props.engine.selectTowerAtPosition({ x, y });
    gameStore.setSelectedTower(props.engine.selectedTower);
  }
  
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    props.engine.render(ctx);
  }
}

function startGameLoop() {
  if (animationId === null) {
    lastTime = 0;
    animationId = requestAnimationFrame(gameLoop);
  }
}

function stopGameLoop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

watch(() => gameStore.gameState, (newState) => {
  if (newState === 'playing') {
    startGameLoop();
  } else {
    stopGameLoop();
    const ctx = canvasRef.value?.getContext('2d');
    if (ctx) {
      props.engine.render(ctx);
    }
  }
});

onMounted(() => {
  canvasRef.value!.width = props.engine.map.width * props.engine.map.cellSize;
  canvasRef.value!.height = props.engine.map.height * props.engine.map.cellSize;
  
  const ctx = canvasRef.value?.getContext('2d');
  if (ctx) {
    props.engine.render(ctx);
  }
  
  if (gameStore.gameState === 'playing') {
    startGameLoop();
  }
});

onUnmounted(() => {
  stopGameLoop();
});
</script>

<template>
  <div class="game-canvas-container">
    <canvas
      ref="canvasRef"
      class="game-canvas"
      @click="handleCanvasClick"
      :style="{ cursor: gameStore.buildMode ? 'crosshair' : 'pointer' }"
    />
  </div>
</template>

<style scoped>
.game-canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a2e;
  padding: 20px;
  border-radius: 8px;
}

.game-canvas {
  border: 3px solid #4a5568;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
