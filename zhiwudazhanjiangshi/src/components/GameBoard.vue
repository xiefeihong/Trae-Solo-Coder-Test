<template>
  <div class="game-container">
    <div class="top-bar">
      <SunCounter :sunlight="gameState.sunlight" />
      <div class="wave-info">
        <span class="wave-label">第</span>
        <span class="wave-number">{{ gameState.wave }}</span>
        <span class="wave-label">波</span>
      </div>
      <div class="controls">
        <button
          v-if="!gameState.isPlaying"
          class="start-btn"
          @click="startGame"
        >
          🎮 开始游戏
        </button>
        <template v-else>
          <button class="pause-btn" @click="pauseGame">
            {{ gameState.isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
          </button>
        </template>
      </div>
    </div>

    <PlantSelector
      :selected-plant="gameState.selectedPlant"
      :sunlight="gameState.sunlight"
      @select="selectPlant"
    />

    <div class="game-board">
      <div class="grid-container" :style="gridStyle">
        <div
          v-for="row in GRID_ROWS"
          :key="row"
          class="grid-row"
        >
          <div
            v-for="col in GRID_COLS"
            :key="col"
            class="grid-cell"
            :class="{
              'can-plant': gameState.selectedPlant && !hasPlantAt(row - 1, col - 1),
              'has-plant': hasPlantAt(row - 1, col - 1)
            }"
            @click="handleCellClick(row - 1, col - 1)"
          >
            <div class="grass"></div>
          </div>
        </div>
      </div>

      <div class="entities-layer">
        <Plant
          v-for="plant in gameState.plants"
          :key="plant.id"
          :plant="plant"
        />

        <Zombie
          v-for="zombie in gameState.zombies"
          :key="zombie.id"
          :zombie="zombie"
        />

        <div
          v-for="proj in gameState.projectiles"
          :key="proj.id"
          class="projectile"
          :style="{
            left: proj.x + 'px',
            top: proj.y - 10 + 'px'
          }"
        >
          🌱
        </div>

        <div
          v-for="sun in gameState.suns"
          :key="sun.id"
          class="sun-falling"
          :style="{
            left: sun.x - 20 + 'px',
            top: sun.y - 20 + 'px'
          }"
          @click="collectSun(sun.id)"
        >
          ☀️
        </div>
      </div>

      <div class="house-indicator">🏠</div>
    </div>

    <div v-if="gameState.isGameOver" class="game-over-modal">
      <div class="modal-content" :class="{ victory: gameState.isVictory }">
        <h2 v-if="gameState.isVictory" class="result-title">🎉 恭喜通关！</h2>
        <h2 v-else class="result-title">🧟 僵尸入侵成功！</h2>
        <p v-if="gameState.isVictory" class="result-message">
          你成功保护了你的房子！
        </p>
        <p v-else class="result-message">
          僵尸到达了你的房子，游戏结束！
        </p>
        <button class="restart-btn" @click="startGame">
          🔄 重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { GAME_CONFIG } from '../utils/gameConfig'
import { useGame } from '../composables/useGame'
import Plant from './Plant.vue'
import Zombie from './Zombie.vue'
import PlantSelector from './PlantSelector.vue'
import SunCounter from './SunCounter.vue'

const { gameState, hasPlantAt, startGame, pauseGame, selectPlant, plantAt, collectSun } = useGame()

const GRID_COLS = GAME_CONFIG.GRID_COLS
const GRID_ROWS = GAME_CONFIG.GRID_ROWS

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${GRID_COLS}, 80px)`,
  gridTemplateRows: `repeat(${GRID_ROWS}, 80px)`
}))

function handleCellClick(row, col) {
  if (gameState.selectedPlant && gameState.isPlaying && !gameState.isPaused) {
    plantAt(row, col)
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 560px;
  gap: 20px;
}

.wave-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(180deg, #e1bee7 0%, #ce93d8 100%);
  border: 3px solid #8e24aa;
  border-radius: 20px;
}

.wave-label {
  font-size: 16px;
  color: #4a148c;
  font-weight: bold;
}

.wave-number {
  font-size: 24px;
  font-weight: bold;
  color: #7b1fa2;
}

.controls {
  display: flex;
  gap: 10px;
}

.start-btn, .pause-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-btn {
  background: linear-gradient(180deg, #81c784 0%, #4caf50 100%);
  color: white;
  border: 3px solid #2e7d32;
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.pause-btn {
  background: linear-gradient(180deg, #64b5f6 0%, #2196f3 100%);
  color: white;
  border: 3px solid #1565c0;
}

.pause-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.game-board {
  position: relative;
  width: calc(6 * 80px);
  height: calc(4 * 80px);
  background: linear-gradient(180deg, #8bc34a 0%, #7cb342 100%);
  border: 4px solid #558b2f;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.grid-container {
  position: relative;
  display: grid;
  z-index: 1;
}

.grid-row {
  display: contents;
}

.grid-cell {
  width: 80px;
  height: 80px;
  position: relative;
  cursor: pointer;
  border-right: 1px solid rgba(85, 139, 47, 0.3);
  border-bottom: 1px solid rgba(85, 139, 47, 0.3);
}

.grid-cell:hover .grass {
  filter: brightness(1.1);
}

.grid-cell.can-plant .grass {
  background: linear-gradient(135deg, #c5e1a5 0%, #aed581 100%);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3);
}

.grass {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8bc34a 0%, #7cb342 50%, #689f38 100%);
  transition: all 0.2s ease;
}

.entities-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.projectile {
  position: absolute;
  font-size: 16px;
  pointer-events: none;
}

.sun-falling {
  position: absolute;
  font-size: 32px;
  cursor: pointer;
  pointer-events: auto;
  animation: sunBounce 0.5s ease-in-out infinite;
  transition: transform 0.2s ease;
  z-index: 10;
}

.sun-falling:hover {
  transform: scale(1.2);
}

@keyframes sunBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.house-indicator {
  position: absolute;
  left: -50px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
}

.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(180deg, #ffcdd2 0%, #ef9a9a 100%);
  padding: 40px;
  border-radius: 20px;
  border: 4px solid #c62828;
  text-align: center;
  animation: popIn 0.4s ease;
  min-width: 300px;
}

.modal-content.victory {
  background: linear-gradient(180deg, #c8e6c9 0%, #a5d6a7 100%);
  border-color: #2e7d32;
}

@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.result-title {
  font-size: 32px;
  margin: 0 0 16px 0;
  color: #b71c1c;
}

.modal-content.victory .result-title {
  color: #1b5e20;
}

.result-message {
  font-size: 18px;
  margin: 0 0 24px 0;
  color: #424242;
}

.restart-btn {
  padding: 14px 32px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(180deg, #42a5f5 0%, #1e88e5 100%);
  color: white;
  border: 3px solid #1565c0;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.4);
}
</style>
