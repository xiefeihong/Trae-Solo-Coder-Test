<script setup lang="ts">
import { useGameStore } from '../stores/game';
import type { GameEngine } from '../game/GameEngine';
import { TOWER_CONFIGS } from '../config/towers';

interface Props {
  engine: GameEngine;
}

const props = defineProps<Props>();
const gameStore = useGameStore();

const towers = [
  { type: 'arrow', name: '箭塔', desc: '攻速快，可攻击飞行单位' },
  { type: 'barracks', name: '兵营', desc: '召唤士兵阻挡敌人' },
  { type: 'magic', name: '法师塔', desc: '高伤害，可攻击飞行单位' },
  { type: 'cannon', name: '炮塔', desc: '范围伤害，适合群怪' }
];

function selectTower(type: string) {
  if (!gameStore.canAffordTower(type)) return;
  
  if (gameStore.buildMode === type) {
    props.engine.buildMode = null;
    gameStore.setBuildMode(null);
  } else {
    props.engine.buildMode = type;
    gameStore.setBuildMode(type);
  }
}

function cancelBuildMode() {
  props.engine.buildMode = null;
  gameStore.setBuildMode(null);
}
</script>

<template>
  <div class="build-panel">
    <h3 class="panel-title">🏰 建造防御塔</h3>
    
    <div v-if="gameStore.buildMode" class="build-mode-hint">
      <span>点击地图上的高亮位置建造</span>
      <button class="cancel-btn" @click="cancelBuildMode">✕ 取消</button>
    </div>

    <div class="tower-list">
      <div
        v-for="tower in towers"
        :key="tower.type"
        class="tower-card"
        :class="{
          selected: gameStore.buildMode === tower.type,
          disabled: !gameStore.canAffordTower(tower.type)
        }"
        @click="selectTower(tower.type)"
      >
        <div class="tower-icon" :style="{ backgroundColor: TOWER_CONFIGS[tower.type].color }">
          {{ tower.type === 'arrow' ? '↑' : tower.type === 'barracks' ? '⚔' : tower.type === 'magic' ? '✦' : '◉' }}
        </div>
        <div class="tower-info">
          <div class="tower-name">{{ tower.name }}</div>
          <div class="tower-desc">{{ tower.desc }}</div>
        </div>
        <div class="tower-cost">
          💰 {{ TOWER_CONFIGS[tower.type].cost }}
        </div>
      </div>
    </div>

    <div class="tower-stats">
      <h4 class="stats-title">塔属性</h4>
      <div class="stats-grid">
        <div class="stat-row">
          <span class="stat-label">伤害:</span>
          <span class="stat-value">15-55</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">射程:</span>
          <span class="stat-value">100-170</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">升级:</span>
          <span class="stat-value">2次</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.build-panel {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.panel-title {
  margin: 0 0 12px 0;
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
}

.build-mode-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  color: #6ee7b7;
  font-size: 13px;
}

.cancel-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #fca5a5;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.tower-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tower-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tower-card:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.tower-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.15);
}

.tower-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tower-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.tower-info {
  flex: 1;
}

.tower-name {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.tower-desc {
  color: #94a3b8;
  font-size: 11px;
}

.tower-cost {
  color: #fbbf24;
  font-size: 13px;
  font-weight: 600;
}

.tower-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-title {
  margin: 0 0 10px 0;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.stat-label {
  color: #64748b;
}

.stat-value {
  color: #e2e8f0;
  font-weight: 500;
}
</style>
