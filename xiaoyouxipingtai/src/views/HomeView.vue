<script setup lang="ts">
import { useGameStore } from '../stores/gameStore'
import GameCard from '../components/GameCard.vue'

const gameStore = useGameStore()
</script>

<template>
  <div class="home-view">
    <h2 class="section-title">
      <font-awesome-icon icon="star" class="title-icon" />
      精选游戏
    </h2>
    <div class="games-grid">
      <GameCard
        v-for="game in gameStore.games"
        :key="game.id"
        :game="game"
      />
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  color: var(--secondary-color);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 10px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.5rem;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
}
</style>
