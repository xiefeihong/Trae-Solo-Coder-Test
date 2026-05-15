<template>
  <div class="app">
    <header class="game-header">
      <h1>🌻 植物大战僵尸精简版 🧟</h1>
      <p class="game-instructions">
        点击植物卡片选择，然后点击草地种植。收集阳光资源，消灭僵尸，保卫你的房子！
      </p>
    </header>
    <GameBoard />
  </div>
</template>

<script setup>
import GameBoard from './components/GameBoard.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.game-header h1 {
  font-size: 36px;
  color: #2e7d32;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0 0 12px 0;
}

.game-instructions {
  font-size: 16px;
  color: #5d4037;
  max-width: 500px;
  line-height: 1.5;
  margin: 0;
}
</style>
