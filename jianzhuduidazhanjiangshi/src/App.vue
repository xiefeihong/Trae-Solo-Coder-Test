<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import GameCanvas from './components/GameCanvas.vue'
import { createInitialState } from './game/gameState'
import { gameActions } from './game/gameState'
import { BUILDINGS, getBuildingConfig, getTotalWaves, getDifficultyConfig, DIFFICULTIES } from './config'
import type { Building } from './types'

const gameState = createInitialState()
const actions = gameActions(gameState)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const currentDifficultyConfig = computed(() => {
  return getDifficultyConfig(gameState.difficulty)
})

const buildingCostMultiplier = computed(() => {
  return currentDifficultyConfig.value?.buildingCostMultiplier || 1
})

const getAdjustedBuildingCost = (baseCost: number) => {
  return Math.floor(baseCost * buildingCostMultiplier.value)
}

const selectedBuildingConfig = computed(() => {
  if (!gameState.selectedBuilding) return null
  return getBuildingConfig(gameState.selectedBuilding.configId)
})

const canUpgrade = computed(() => {
  if (!gameState.selectedBuilding || !selectedBuildingConfig.value) return false
  const building = gameState.selectedBuilding
  if (building.level >= selectedBuildingConfig.value.maxLevel) return false
  const upgradeCost = Math.floor(selectedBuildingConfig.value.upgradeCosts[building.level - 1] * buildingCostMultiplier.value)
  return gameState.resources >= upgradeCost
})

const upgradeCost = computed(() => {
  if (!gameState.selectedBuilding || !selectedBuildingConfig.value) return 0
  return Math.floor(selectedBuildingConfig.value.upgradeCosts[gameState.selectedBuilding.level - 1] * buildingCostMultiplier.value)
})

const selectBuildMode = (buildingId: string) => {
  const config = getBuildingConfig(buildingId)
  if (config && gameState.resources >= getAdjustedBuildingCost(config.cost)) {
    gameState.buildMode = buildingId
    gameState.selectedBuilding = null
  }
}

const selectDifficulty = (difficultyId: string) => {
  actions.setDifficulty(difficultyId)
}

const startGame = () => {
  actions.startGame()
}

const cancelBuildMode = () => {
  gameState.buildMode = null
}

const handleBuild = (event: Event) => {
  const customEvent = event as CustomEvent
  const { x, y } = customEvent.detail

  if (!gameState.buildMode) return

  if (x < 80 || x > 400 || y < 50 || y > 550) {
    return
  }

  const overlap = gameState.buildings.some((b: Building) => 
    x < b.position.x + 80 && 
    x + 70 > b.position.x && 
    y < b.position.y + 70 && 
    y + 60 > b.position.y
  )

  if (overlap) return

  const config = getBuildingConfig(gameState.buildMode)
  if (!config) return

  const adjustedCost = getAdjustedBuildingCost(config.cost)
  if (actions.spendResources(adjustedCost)) {
    const building = actions.createBuilding(gameState.buildMode, x, y)
    if (building) {
      actions.addBuilding(building)
    }
  }

  gameState.buildMode = null
}

const upgradeSelectedBuilding = () => {
  if (gameState.selectedBuilding) {
    actions.upgradeBuilding(gameState.selectedBuilding)
  }
}

const sellSelectedBuilding = () => {
  if (gameState.selectedBuilding) {
    const config = getBuildingConfig(gameState.selectedBuilding.configId)
    if (config) {
      const adjustedCost = getAdjustedBuildingCost(config.cost)
      actions.addResources(Math.floor(adjustedCost * 0.5))
    }
    actions.removeBuilding(gameState.selectedBuilding.id)
    gameState.selectedBuilding = null
  }
}

const togglePause = () => {
  actions.togglePause()
}

const startNextWave = () => {
  if (!gameState.isWaveActive && !gameState.isGameOver && !gameState.isVictory) {
    gameState.waveTimer = 0
  }
}

const restartGame = () => {
  actions.resetGame()
}

const registerCanvasListener = () => {
  setTimeout(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvasRef.value = canvas
      canvas.removeEventListener('build', handleBuild)
      canvas.addEventListener('build', handleBuild)
    }
  }, 100)
}

onMounted(() => {
  registerCanvasListener()
})

watch(() => gameState.isStarted, (newVal) => {
  if (newVal) {
    registerCanvasListener()
  }
})
</script>

<template>
  <div class="game-container">
    <div v-if="!gameState.isStarted" class="difficulty-selector">
      <div class="difficulty-content">
        <h1 class="game-title-main">🏗️ 建筑队大战僵尸 🧟</h1>
        <p class="subtitle">选择游戏难度</p>
        <div class="difficulty-list">
          <div
            v-for="diff in DIFFICULTIES"
            :key="diff.id"
            class="difficulty-card"
            :class="{ selected: gameState.difficulty === diff.id }"
            @click="selectDifficulty(diff.id)"
          >
            <h3>{{ diff.name }}</h3>
            <p class="diff-desc">{{ diff.description }}</p>
            <div class="diff-stats">
              <div class="diff-stat">
                <span class="diff-stat-label">僵尸生命:</span>
                <span class="diff-stat-value">{{ Math.round(diff.zombieHealthMultiplier * 100) }}%</span>
              </div>
              <div class="diff-stat">
                <span class="diff-stat-label">僵尸伤害:</span>
                <span class="diff-stat-value">{{ Math.round(diff.zombieDamageMultiplier * 100) }}%</span>
              </div>
              <div class="diff-stat">
                <span class="diff-stat-label">资源获取:</span>
                <span class="diff-stat-value">{{ Math.round(diff.resourceMultiplier * 100) }}%</span>
              </div>
              <div class="diff-stat">
                <span class="diff-stat-label">建筑成本:</span>
                <span class="diff-stat-value">{{ Math.round(diff.buildingCostMultiplier * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="startGame" class="btn btn-start">🎮 开始游戏</button>
      </div>
    </div>

    <template v-else>
      <header class="game-header">
        <div class="header-left">
          <h1 class="game-title">🏗️ 建筑队大战僵尸 🧟</h1>
          <span class="difficulty-badge">{{ currentDifficultyConfig?.name }}</span>
        </div>
        <div class="header-center">
          <div class="stat-item">
            <span class="stat-label">💰 资源</span>
            <span class="stat-value">{{ gameState.resources }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">❤️ 基地</span>
            <span class="stat-value">{{ gameState.baseHealth }}/{{ gameState.maxBaseHealth }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">🌊 波次</span>
            <span class="stat-value">{{ gameState.currentWave }}/{{ getTotalWaves() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">⭐ 得分</span>
            <span class="stat-value">{{ gameState.score }}</span>
          </div>
        </div>
        <div class="header-right">
          <button @click="togglePause" class="btn btn-secondary">
            {{ gameState.isPaused ? '▶️ 继续' : '⏸️ 暂停' }}
          </button>
          <button @click="restartGame" class="btn btn-danger">🔄 重开</button>
        </div>
      </header>

    <div class="wave-info" v-if="!gameState.isWaveActive && !gameState.isGameOver && !gameState.isVictory">
      <span>下一波: {{ Math.ceil(gameState.waveTimer) }} 秒</span>
      <button @click="startNextWave" class="btn btn-primary">🚀 立即开始</button>
    </div>

    <main class="game-main">
      <aside class="building-panel">
        <h2>🏭 建筑</h2>
        <div class="building-list">
          <div
            v-for="building in BUILDINGS"
            :key="building.id"
            class="building-card"
            :class="{ 
              disabled: gameState.resources < getAdjustedBuildingCost(building.cost),
              selected: gameState.buildMode === building.id
            }"
            @click="selectBuildMode(building.id)"
          >
            <div class="building-icon" :style="{ backgroundColor: building.color }"></div>
            <div class="building-info">
              <h3>{{ building.name }}</h3>
              <p class="cost">💰 {{ getAdjustedBuildingCost(building.cost) }}</p>
              <p class="desc">{{ building.description }}</p>
            </div>
          </div>
        </div>
        <button v-if="gameState.buildMode" @click="cancelBuildMode" class="btn btn-cancel btn-full">
          ❌ 取消建造
        </button>

        <div v-if="gameState.selectedBuilding && selectedBuildingConfig" class="selected-building">
          <h3>{{ selectedBuildingConfig.name }}</h3>
          <p>等级: {{ gameState.selectedBuilding.level }}/{{ selectedBuildingConfig.maxLevel }}</p>
          <p>生命: {{ Math.ceil(gameState.selectedBuilding.health) }}/{{ Math.ceil(gameState.selectedBuilding.maxHealth) }}</p>
          <div class="building-actions">
            <button 
              @click="upgradeSelectedBuilding" 
              class="btn btn-primary btn-small"
              :disabled="!canUpgrade"
            >
              ⬆️ 升级 ({{ upgradeCost }})
            </button>
            <button @click="sellSelectedBuilding" class="btn btn-danger btn-small">
              💰 出售
            </button>
          </div>
        </div>
      </aside>

      <div class="game-area">
        <GameCanvas :gameState="gameState" />
      </div>
    </main>

    <footer class="game-footer">
      <p>📝 操作指南: 点击左侧建筑后在战场上点击放置 | 点击已建造的建筑可以升级或出售 | 建造木工坊对付飞行僵尸！</p>
    </footer>
    </template>
  </div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  overflow: hidden;
}

.difficulty-selector {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.difficulty-content {
  text-align: center;
  max-width: 900px;
  padding: 40px;
}

.game-title-main {
  font-size: 48px;
  margin: 0 0 20px 0;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 24px;
  color: #aaa;
  margin: 0 0 40px 0;
}

.difficulty-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.difficulty-card {
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid transparent;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.difficulty-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.difficulty-card.selected {
  border-color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.difficulty-card h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.diff-desc {
  color: #aaa;
  font-size: 14px;
  margin: 0 0 15px 0;
}

.diff-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  text-align: left;
}

.diff-stat {
  font-size: 13px;
}

.diff-stat-label {
  color: #888;
}

.diff-stat-value {
  color: #4CAF50;
  font-weight: bold;
  margin-left: 5px;
}

.btn-start {
  padding: 15px 50px;
  font-size: 20px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
}

.difficulty-badge {
  margin-left: 15px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 2px solid #333;
}

.header-left .game-title {
  font-size: 24px;
  margin: 0;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-center {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #aaa;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #4CAF50;
}

.header-right {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
}

.btn-secondary {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.btn-cancel {
  background: linear-gradient(135deg, #607D8B, #546E7A);
  color: white;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-full {
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.wave-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 8px;
  background: linear-gradient(90deg, rgba(255, 152, 0, 0.3), rgba(255, 87, 34, 0.3));
  border-bottom: 2px solid #FF5722;
  font-size: 16px;
  font-weight: bold;
}

.game-main {
  flex: 1;
  display: flex;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
}

.building-panel {
  width: 280px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 15px;
  overflow-y: auto;
  border: 2px solid #444;
}

.building-panel h2 {
  margin: 0 0 15px 0;
  font-size: 18px;
  text-align: center;
  border-bottom: 2px solid #555;
  padding-bottom: 10px;
}

.building-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.building-card {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.building-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.building-card.selected {
  border-color: #FFD700;
  background: rgba(255, 215, 0, 0.2);
}

.building-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.building-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  flex-shrink: 0;
  border: 2px solid #333;
}

.building-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.building-info .cost {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #FFD700;
}

.building-info .desc {
  margin: 0;
  font-size: 10px;
  color: #aaa;
  line-height: 1.3;
}

.selected-building {
  margin-top: 20px;
  padding: 15px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  border: 2px solid #4CAF50;
}

.selected-building h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.selected-building p {
  margin: 5px 0;
  font-size: 13px;
}

.building-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.game-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-footer {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 2px solid #333;
  text-align: center;
  font-size: 14px;
  color: #aaa;
}
</style>
