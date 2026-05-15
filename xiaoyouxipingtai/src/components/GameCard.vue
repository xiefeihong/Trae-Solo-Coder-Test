<script setup lang="ts">
import { computed } from 'vue'
import type { Game } from '../types/game'

const props = defineProps<{
  game: Game
}>()

const gameUrl = computed(() => `/game/${props.game.id}`)
</script>

<template>
  <a :href="gameUrl" target="_blank" class="game-card-link">
    <div class="game-card" :style="{ '--card-color': game.color }">
      <div class="card-icon" :style="{ background: game.color }">
        <font-awesome-icon :icon="game.icon" />
      </div>
      <h3 class="card-title">{{ game.name }}</h3>
      <p class="card-description">{{ game.description }}</p>
      <div v-if="game.isDeveloping" class="developing-badge">
        <font-awesome-icon icon="tools" />
        开发中
      </div>
      <div class="card-overlay">
        <div class="play-btn">
          <font-awesome-icon icon="play" />
          开始游戏
        </div>
      </div>
    </div>
  </a>
</template>

<style scoped>
.game-card-link {
  text-decoration: none;
  display: block;
}

.game-card {
  position: relative;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 25px 20px;
  text-align: center;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  border: 3px solid transparent;
}

.game-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: var(--shadow-hover);
  border-color: var(--card-color);
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 2.5rem;
  color: white;
  transition: transform 0.3s ease;
}

.game-card:hover .card-icon {
  transform: scale(1.1) rotate(10deg);
}

.card-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 10px;
}

.card-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.developing-badge {
  position: absolute;
  top: 15px;
  right: -25px;
  background: #e74c3c;
  color: white;
  padding: 5px 35px;
  font-size: 0.75rem;
  transform: rotate(45deg);
  display: flex;
  align-items: center;
  gap: 5px;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 20px;
}

.game-card:hover .card-overlay {
  opacity: 1;
}

.play-btn {
  background: var(--primary-color);
  color: white;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.game-card:hover .play-btn {
  background: #ff8c5a;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .game-card {
    padding: 20px 15px;
  }
  
  .card-icon {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .card-description {
    font-size: 0.8rem;
  }
  
  .play-btn {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}
</style>
