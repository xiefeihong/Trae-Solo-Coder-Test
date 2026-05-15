<script setup lang="ts">
import GoldMiner from './components/GoldMiner.vue'
</script>

<template>
  <div class="app-container">
    <h1 class="game-title">⛏️ 黄金矿工</h1>
    <GoldMiner />
    <div class="game-info">
      <p>💡 提示: 抓取金块和钻石获得分数，避开石头！</p>
      <p>🎯 目标: 在时间内达到目标分数即可过关</p>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.game-title {
  color: #FFD700;
  font-size: 42px;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  margin: 0;
}

.game-info {
  text-align: center;
  color: #aaa;
  font-size: 14px;
  line-height: 1.8;
}

.game-info p {
  margin: 5px 0;
}
</style>
