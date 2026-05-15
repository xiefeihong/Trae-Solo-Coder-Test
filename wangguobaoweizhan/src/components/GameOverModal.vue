<script setup lang="ts">
import { useGameStore } from '../stores/game';
import type { GameEngine } from '../game/GameEngine';

interface Props {
  engine: GameEngine;
}

const props = defineProps<Props>();
const gameStore = useGameStore();

function restartGame() {
  props.engine.reset();
  gameStore.reset();
  
  setTimeout(() => {
    const canvas = document.querySelector('.game-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        props.engine.render(ctx);
      }
    }
  }, 0);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="gameStore.gameState === 'won' || gameStore.gameState === 'lost'" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-icon">
            {{ gameStore.gameState === 'won' ? '🏆' : '💀' }}
          </div>
          <h2 class="modal-title">
            {{ gameStore.gameState === 'won' ? '胜利！' : '游戏结束' }}
          </h2>
          <p class="modal-message">
            {{ gameStore.gameState === 'won' 
              ? '恭喜你成功守护了王国！' 
              : '敌人突破了防线，王国陷落了...' }}
          </p>
          <div class="modal-stats">
            <div class="stat-item">
              <span class="stat-icon">🌊</span>
              <span class="stat-text">完成波次: {{ gameStore.currentWave }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <span class="stat-text">剩余金币: {{ gameStore.gold }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">❤️</span>
              <span class="stat-text">剩余生命: {{ gameStore.lives }}</span>
            </div>
          </div>
          <button class="restart-btn" @click="restartGame">
            🔄 重新开始
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.modal-title {
  margin: 0 0 12px 0;
  color: #e2e8f0;
  font-size: 32px;
  font-weight: 700;
}

.modal-message {
  margin: 0 0 24px 0;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1.5;
}

.modal-stats {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.stat-icon {
  font-size: 20px;
}

.stat-text {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
}

.restart-btn {
  width: 100%;
  padding: 14px 24px;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
