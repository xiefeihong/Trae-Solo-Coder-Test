<script setup lang="ts">
import type { GameEngine } from '../game/GameEngine'

defineProps<{
  engine: GameEngine
  levelName: string
  totalWaves: number
}>()
</script>

<template>
  <div class="status-bar">
    <div class="status-item">
      <span class="label">关卡:</span>
      <span class="value">{{ levelName }}</span>
    </div>
    <div class="status-item">
      <span class="label">⭐</span>
      <span class="value stars">{{ engine.stars }}</span>
    </div>
    <div class="status-item">
      <span class="label">❤️</span>
      <span class="value lives">{{ engine.lives }}</span>
    </div>
    <div class="status-item">
      <span class="label">波次:</span>
      <span class="value waves">{{ engine.currentWave + 1 }} / {{ totalWaves }}</span>
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  gap: 30px;
  padding: 12px 24px;
  background: linear-gradient(90deg, #8B4513, #A0522D);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 16px;
  color: #FFF8DC;
}

.value {
  font-size: 20px;
  font-weight: bold;
  color: #FFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.value.stars {
  color: #FFD700;
}

.value.lives {
  color: #FF6B6B;
}

.value.waves {
  color: #98FB98;
}
</style>
