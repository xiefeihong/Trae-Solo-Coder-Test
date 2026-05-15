<script setup lang="ts">
import { useGameStore } from '../stores/game';
import type { GameEngine } from '../game/GameEngine';

interface Props {
  engine: GameEngine;
}

const props = defineProps<Props>();
const gameStore = useGameStore();

function startWave() {
  props.engine.startWave();
  if (gameStore.gameState === 'idle') {
    props.engine.start();
  }
}

function togglePause() {
  if (gameStore.gameState === 'playing') {
    props.engine.pause();
  } else if (gameStore.gameState === 'paused') {
    props.engine.resume();
  }
}

function setSpeed(speed: number) {
  props.engine.setGameSpeed(speed);
}
</script>

<template>
  <div class="top-bar">
    <div class="stat-group">
      <div class="stat-item">
        <span class="icon">💰</span>
        <span class="value">{{ gameStore.gold }}</span>
      </div>
      <div class="stat-item">
        <span class="icon">❤️</span>
        <span class="value">{{ gameStore.lives }}</span>
      </div>
      <div class="stat-item">
        <span class="icon">🌊</span>
        <span class="value">{{ gameStore.currentWave }} / {{ gameStore.totalWaves }}</span>
      </div>
    </div>

    <div class="controls-group">
      <div class="speed-controls">
        <button
          class="speed-btn"
          :class="{ active: gameStore.gameSpeed === 1 }"
          @click="setSpeed(1)"
        >
          1x
        </button>
        <button
          class="speed-btn"
          :class="{ active: gameStore.gameSpeed === 2 }"
          @click="setSpeed(2)"
        >
          2x
        </button>
        <button
          class="speed-btn"
          :class="{ active: gameStore.gameSpeed === 3 }"
          @click="setSpeed(3)"
        >
          3x
        </button>
      </div>

      <button
        v-if="gameStore.gameState === 'playing' || gameStore.gameState === 'paused'"
        class="control-btn"
        @click="togglePause"
      >
        {{ gameStore.gameState === 'playing' ? '⏸ 暂停' : '▶ 继续' }}
      </button>

      <button
        v-if="!gameStore.waveInProgress && gameStore.currentWave < gameStore.totalWaves && gameStore.gameState !== 'won' && gameStore.gameState !== 'lost'"
        class="start-wave-btn"
        @click="startWave"
      >
        {{ gameStore.gameState === 'idle' ? '🎮 开始游戏' : '⚔ 下一波' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.stat-group {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
}

.icon {
  font-size: 20px;
}

.value {
  min-width: 40px;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-controls {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 2px;
}

.speed-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.speed-btn:hover {
  color: #e2e8f0;
}

.speed-btn.active {
  background: #3b82f6;
  color: white;
}

.control-btn {
  padding: 8px 16px;
  border: none;
  background: #f59e0b;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.start-wave-btn {
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.start-wave-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}
</style>
