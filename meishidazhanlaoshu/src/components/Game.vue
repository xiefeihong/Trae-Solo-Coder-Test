<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { createGameEngine } from '../game/GameEngine'
import type { GameEngine } from '../game/GameEngine'
import { getLevelConfig, FOODS } from '../config'
import GameCanvas from './GameCanvas.vue'
import CardSlot from './CardSlot.vue'
import StatusBar from './StatusBar.vue'
import FoodInfoPanel from './FoodInfoPanel.vue'
import GameOverPanel from './GameOverPanel.vue'

const props = defineProps<{
  levelId: number
}>()

const emit = defineEmits<{
  (e: 'backToMenu'): void
}>()

const engine = ref<GameEngine | null>(null)
const selectedCard = ref<string | null>(null)
const selectedFood = ref<string | null>(null)

const levelConfig = ref(getLevelConfig(props.levelId)!)

const initGame = () => {
  if (engine.value) {
    engine.value.stop()
  }
  engine.value = createGameEngine(levelConfig.value)
  selectedCard.value = null
  selectedFood.value = null
  engine.value.start()
}

const handleGridClick = (position: { x: number; y: number }) => {
  if (!engine.value) return

  if (selectedCard.value) {
    const success = engine.value.placeFood(position.x, position.y, selectedCard.value)
    if (success) {
      selectedCard.value = null
    }
  }
  selectedFood.value = null
}

const handleFoodClick = (foodId: string) => {
  selectedFood.value = foodId
  selectedCard.value = null
}

const handleCardSelect = (foodId: string) => {
  selectedCard.value = foodId
  selectedFood.value = null
}

const handleRestart = () => {
  initGame()
}

watch(() => props.levelId, () => {
  levelConfig.value = getLevelConfig(props.levelId)!
  initGame()
}, { immediate: true })

onUnmounted(() => {
  if (engine.value) {
    engine.value.stop()
  }
})
</script>

<template>
  <div v-if="engine" class="game-container">
    <StatusBar
      :engine="engine"
      :level-name="levelConfig.name"
      :total-waves="levelConfig.waves.length"
    />

    <div class="game-area">
      <GameCanvas
        :engine="engine"
        @grid-click="handleGridClick"
        @food-click="handleFoodClick"
      />
      <FoodInfoPanel
        :engine="engine"
        :food-id="selectedFood"
        @close="selectedFood = null"
      />
    </div>

    <div class="card-bar">
      <CardSlot
        v-for="food in FOODS"
        :key="food.id"
        :food="food"
        :engine="engine"
        :selected="selectedCard === food.id"
        @select="handleCardSelect"
      />
    </div>

    <GameOverPanel
      v-if="engine.isVictory || engine.isGameOver"
      :is-victory="engine.isVictory"
      :current-wave="engine.currentWave"
      :total-waves="levelConfig.waves.length"
      @restart="handleRestart"
      @back-to-menu="emit('backToMenu')"
    />
  </div>
</template>

<style scoped>
.game-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(180deg, #87CEEB, #90EE90);
  gap: 20px;
}

.game-area {
  position: relative;
  display: flex;
  gap: 20px;
}

.card-bar {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(145deg, #8B4513, #A0522D);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
}
</style>
