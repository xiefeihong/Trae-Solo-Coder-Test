<script setup lang="ts">
import { useFireIce } from './composables/useFireIce'

const {
  gameState,
  canvasRef,
  currentLevelData,
  totalLevels,
  resetLevel,
  nextLevel,
  prevLevel,
  toggleControlMode,
  switchPlayer
} = useFireIce()
</script>

<template>
  <div class="game-container">
    <h1 class="game-title">🔥 森林冰火人 ❄️</h1>
    
    <div class="level-info">
      <span class="level-name">{{ currentLevelData?.name }}</span>
      <span class="level-number">第 {{ gameState.currentLevel + 1 }} / {{ totalLevels }} 关</span>
      <span class="steps">步数: {{ gameState.steps }}</span>
    </div>

    <div class="game-status-bar">
      <div class="player-status fire">
        <span class="player-icon">🔥</span>
        <span class="gem-count">{{ gameState.players.fire.gems }} / {{ currentLevelData?.totalFireGems || 0 }}</span>
        <span v-if="gameState.players.fire.atPortal" class="portal-status">✓ 已到达</span>
      </div>
      
      <div class="control-indicator">
        <span v-if="gameState.controlMode === 'single'">
          当前控制: 
          <span :class="['current-player', gameState.currentPlayer]">
            {{ gameState.currentPlayer === 'fire' ? '🔥 火娃' : '❄️ 冰娃' }}
          </span>
        </span>
        <span v-else>双人模式</span>
      </div>

      <div class="player-status ice">
        <span class="player-icon">❄️</span>
        <span class="gem-count">{{ gameState.players.ice.gems }} / {{ currentLevelData?.totalIceGems || 0 }}</span>
        <span v-if="gameState.players.ice.atPortal" class="portal-status">✓ 已到达</span>
      </div>
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>

      <div v-if="gameState.gameStatus === 'won'" class="overlay win-overlay">
        <div class="overlay-content">
          <h2>🎉 恭喜过关！</h2>
          <p>总步数: {{ gameState.steps }}</p>
          <div class="overlay-buttons">
            <button @click="resetLevel">重玩本关</button>
            <button v-if="gameState.currentLevel < totalLevels - 1" @click="nextLevel">下一关</button>
            <button v-else class="complete-btn">🏆 已通关</button>
          </div>
        </div>
      </div>

      <div v-if="gameState.gameStatus === 'lost'" class="overlay lose-overlay">
        <div class="overlay-content">
          <h2>💀 游戏结束</h2>
          <p>{{ gameState.players.fire.isAlive ? '冰娃' : '火娃' }}掉入了致命区域！</p>
          <div class="overlay-buttons">
            <button @click="resetLevel">重新开始</button>
          </div>
        </div>
      </div>

      <div v-if="gameState.gameStatus === 'complete'" class="overlay complete-overlay">
        <div class="overlay-content">
          <h2>🏆 恭喜通关！</h2>
          <p>你已完成所有关卡！</p>
          <div class="overlay-buttons">
            <button @click="() => { gameState.currentLevel = 0; resetLevel() }">从头开始</button>
          </div>
        </div>
      </div>
    </div>

    <div class="controls-panel">
      <div class="control-section">
        <h3>关卡控制</h3>
        <div class="button-group">
          <button @click="prevLevel" :disabled="gameState.currentLevel === 0">上一关</button>
          <button @click="resetLevel" class="reset-btn">重置 (R)</button>
          <button @click="nextLevel" :disabled="gameState.currentLevel >= totalLevels - 1">下一关</button>
        </div>
      </div>

      <div class="control-section">
        <h3>控制模式</h3>
        <div class="button-group">
          <button 
            @click="toggleControlMode" 
            :class="{ active: gameState.controlMode === 'dual' }"
          >
            双人模式
          </button>
          <button 
            @click="toggleControlMode" 
            :class="{ active: gameState.controlMode === 'single' }"
          >
            单人模式
          </button>
          <button 
            v-if="gameState.controlMode === 'single'"
            @click="switchPlayer"
          >
            切换角色 (Tab)
          </button>
        </div>
      </div>
    </div>

    <div class="keyboard-hints">
      <div v-if="gameState.controlMode === 'dual'" class="hint-group">
        <div class="hint fire-hint">
          <strong>🔥 火娃</strong>
          <span>↑ ↓ ← → 方向键</span>
        </div>
        <div class="hint ice-hint">
          <strong>❄️ 冰娃</strong>
          <span>W A S D</span>
        </div>
      </div>
      <div v-else class="hint-group single-hint">
        <div class="hint">
          <strong>方向键 / WASD</strong>
          <span>移动当前角色</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <h3>图例说明</h3>
      <div class="legend-grid">
        <div class="legend-item">
          <span class="legend-tile wall"></span>
          <span>墙壁</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile lava"></span>
          <span>岩浆 (火娃危险!)</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile water"></span>
          <span>水坑 (冰娃危险!)</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile fire-gem"></span>
          <span>火宝石</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile ice-gem"></span>
          <span>冰宝石</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile fire-portal"></span>
          <span>火娃传送门</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile ice-portal"></span>
          <span>冰娃传送门</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile plate"></span>
          <span>压力板</span>
        </div>
        <div class="legend-item">
          <span class="legend-tile door"></span>
          <span>机关门</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.game-title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #ff6b35, #f7931e, #4fc3f7, #29b6f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(255, 107, 53, 0.3);
  margin: 0;
}

.level-info {
  display: flex;
  gap: 30px;
  align-items: center;
  color: #e0e0e0;
  font-size: 1.1rem;
}

.level-name {
  font-weight: bold;
  color: #ffd700;
}

.steps {
  color: #81d4fa;
}

.game-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.player-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  border-radius: 10px;
}

.player-status.fire {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.3), rgba(244, 67, 54, 0.2));
}

.player-status.ice {
  background: linear-gradient(135deg, rgba(79, 195, 247, 0.3), rgba(41, 182, 246, 0.2));
}

.player-icon {
  font-size: 1.5rem;
}

.gem-count {
  font-weight: bold;
  color: #fff;
  min-width: 50px;
}

.portal-status {
  color: #4caf50;
  font-weight: bold;
}

.control-indicator {
  color: #e0e0e0;
  font-size: 0.95rem;
}

.current-player {
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 5px;
}

.current-player.fire {
  background: rgba(255, 107, 53, 0.4);
  color: #ffeb3b;
}

.current-player.ice {
  background: rgba(79, 195, 247, 0.4);
  color: #e1f5fe;
}

.canvas-wrapper {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

canvas {
  display: block;
  background: #1a1a2e;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.win-overlay {
  background: rgba(76, 175, 80, 0.3);
}

.lose-overlay {
  background: rgba(244, 67, 54, 0.3);
}

.complete-overlay {
  background: rgba(255, 215, 0, 0.2);
}

.overlay-content {
  text-align: center;
  padding: 40px;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.overlay-content h2 {
  font-size: 2rem;
  margin: 0 0 15px 0;
  color: #fff;
}

.overlay-content p {
  color: #b0b0b0;
  margin: 0 0 25px 0;
}

.overlay-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.overlay-buttons button {
  padding: 12px 30px;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.overlay-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.overlay-buttons .complete-btn {
  background: linear-gradient(135deg, #ffd700, #ffb300);
  color: #333;
}

.controls-panel {
  display: flex;
  gap: 30px;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
}

.control-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  min-width: 250px;
}

.control-section h3 {
  margin: 0 0 15px 0;
  color: #ffd700;
  font-size: 1rem;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group button {
  flex: 1;
  min-width: 80px;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.button-group button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.button-group button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.button-group button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.button-group .reset-btn {
  background: linear-gradient(135deg, #f44336, #e91e63);
  color: white;
}

.keyboard-hints {
  width: 100%;
}

.hint-group {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.fire-hint {
  border-left: 4px solid #ff6b35;
}

.ice-hint {
  border-left: 4px solid #4fc3f7;
}

.single-hint .hint {
  border-left: 4px solid #9c27b0;
  min-width: 250px;
}

.hint strong {
  color: #fff;
  font-size: 1rem;
}

.hint span:last-child {
  color: #b0b0b0;
  font-size: 0.9rem;
}

.legend {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 15px;
}

.legend h3 {
  margin: 0 0 15px 0;
  color: #ffd700;
  text-align: center;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #b0b0b0;
  font-size: 0.85rem;
}

.legend-tile {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}

.legend-tile.wall {
  background: #1a202c;
  border: 2px solid #4a5568;
}

.legend-tile.lava {
  background: linear-gradient(135deg, #ff6b35, #dc143c);
}

.legend-tile.water {
  background: linear-gradient(135deg, #4fc3f7, #03a9f4);
}

.legend-tile.fire-gem {
  background: linear-gradient(135deg, #ffeb3b, #f44336);
  transform: rotate(45deg) scale(0.7);
}

.legend-tile.ice-gem {
  background: linear-gradient(135deg, #e1f5fe, #29b6f6);
  transform: rotate(45deg) scale(0.7);
}

.legend-tile.fire-portal {
  background: radial-gradient(circle, #ffeb3b, #f44336);
  border-radius: 50%;
}

.legend-tile.ice-portal {
  background: radial-gradient(circle, #e1f5fe, #29b6f6);
  border-radius: 50%;
}

.legend-tile.plate {
  background: #9e9e9e;
  border: 2px solid #616161;
}

.legend-tile.door {
  background: #795548;
  border: 2px solid #5d4037;
}
</style>
