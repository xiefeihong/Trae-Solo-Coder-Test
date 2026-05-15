<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { GameEngine } from './game/GameEngine';
import GameCanvas from './components/GameCanvas.vue';
import TopBar from './components/TopBar.vue';
import BuildPanel from './components/BuildPanel.vue';
import TowerPanel from './components/TowerPanel.vue';
import GameOverModal from './components/GameOverModal.vue';

const engine = ref<GameEngine | null>(null);

onMounted(() => {
  engine.value = new GameEngine();
});
</script>

<template>
  <div v-if="engine" class="app">
    <header class="app-header">
      <h1 class="app-title">🏰 王国保卫战</h1>
      <p class="app-subtitle">塔防游戏</p>
    </header>

    <main class="app-main">
      <TopBar :engine="engine" />

      <div class="game-area">
        <div class="canvas-wrapper">
          <GameCanvas :engine="engine" />
        </div>

        <aside class="sidebar">
          <BuildPanel v-if="!engine.selectedTower" :engine="engine" />
          <TowerPanel v-else :engine="engine" />
        </aside>
      </div>
    </main>

    <GameOverModal :engine="engine" />

    <footer class="app-footer">
      <p>💡 提示: 点击右侧面板选择防御塔，然后点击地图上的高亮位置建造</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: #e2e8f0;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 24px;
}

.app-title {
  font-size: 36px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 14px;
  color: #64748b;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.game-area {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.canvas-wrapper {
  flex-shrink: 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-footer {
  margin-top: 20px;
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.app-footer p {
  color: #64748b;
  font-size: 14px;
}
</style>
