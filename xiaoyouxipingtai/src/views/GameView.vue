<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import ClickScoreGame from '../games/ClickScoreGame.vue'
import PlaceholderGame from '../games/PlaceholderGame.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const game = computed(() => {
  return gameStore.games.find(g => g.id === route.params.id)
})

const currentGameComponent = computed(() => {
  const componentMap: Record<string, any> = {
    ClickScoreGame,
    PlaceholderGame
  }
  return componentMap[game.value?.component || 'PlaceholderGame'] || PlaceholderGame
})

const goBack = () => {
  router.push('/')
}

const restartGame = () => {
  router.go(0)
}

onUnmounted(() => {
})
</script>

<template>
  <div class="game-page">
    <div class="game-header">
      <button class="back-btn" @click="goBack">
        <font-awesome-icon icon="arrow-left" />
        返回首页
      </button>
      <div class="game-info">
        <div class="game-icon" :style="{ background: game?.color }">
          <font-awesome-icon :icon="game?.icon || 'gamepad'" />
        </div>
        <h1>{{ game?.name || '游戏' }}</h1>
      </div>
      <button class="restart-btn" @click="restartGame">
        <font-awesome-icon icon="redo" />
        重新开始
      </button>
    </div>
    <div class="game-content">
      <component :is="currentGameComponent" @close="goBack" />
    </div>
  </div>
</template>

<style scoped>
.game-page {
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  border-radius: 20px;
  color: white;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

.game-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.game-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.game-header h1 {
  font-size: 1.8rem;
  font-weight: bold;
}

.back-btn,
.restart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.back-btn:hover,
.restart-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.game-content {
  flex: 1;
}

@media (max-width: 768px) {
  .game-page {
    padding: 10px;
  }

  .game-header {
    padding: 15px;
    flex-direction: column;
    gap: 15px;
  }

  .game-header h1 {
    font-size: 1.4rem;
  }

  .game-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .back-btn,
  .restart-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style>
