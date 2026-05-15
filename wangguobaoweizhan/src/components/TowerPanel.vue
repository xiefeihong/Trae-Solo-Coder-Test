<script setup lang="ts">
import { useGameStore } from '../stores/game';
import type { GameEngine } from '../game/GameEngine';

interface Props {
  engine: GameEngine;
}

const props = defineProps<Props>();
const gameStore = useGameStore();

function upgradeTower() {
  if (!gameStore.selectedTower) return;
  props.engine.upgradeTower(gameStore.selectedTower.id);
}

function sellTower() {
  if (!gameStore.selectedTower) return;
  props.engine.sellTower(gameStore.selectedTower.id);
}

function closePanel() {
  props.engine.selectedTower = null;
  gameStore.setSelectedTower(null);
}

const upgradeCost = () => {
  if (!gameStore.selectedTower) return null;
  return gameStore.selectedTower.getUpgradeCost();
};

const sellValue = () => {
  if (!gameStore.selectedTower) return 0;
  return gameStore.selectedTower.getSellValue();
};

const canUpgrade = () => {
  const cost = upgradeCost();
  return cost !== null && gameStore.gold >= cost;
};

const towerName = () => {
  if (!gameStore.selectedTower) return '';
  const names: Record<string, string> = {
    arrow: '箭塔',
    barracks: '兵营',
    magic: '法师塔',
    cannon: '炮塔'
  };
  return names[gameStore.selectedTower.type] || '防御塔';
};
</script>

<template>
  <div v-if="gameStore.selectedTower" class="tower-panel">
    <div class="panel-header">
      <h3 class="panel-title">⚔ {{ towerName() }}</h3>
      <button class="close-btn" @click="closePanel">✕</button>
    </div>

    <div class="tower-level">
      <span class="level-label">等级:</span>
      <div class="level-stars">
        <span
          v-for="i in 3"
          :key="i"
          class="star"
          :class="{ filled: i <= (gameStore.selectedTower!.level + 1) }"
        >
          ★
        </span>
      </div>
    </div>

    <div class="tower-stats">
      <div class="stat-row">
        <span class="stat-label">伤害:</span>
        <span class="stat-value">{{ gameStore.selectedTower!.getDamage() }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">射程:</span>
        <span class="stat-value">{{ gameStore.selectedTower!.getRange() }}</span>
      </div>
    </div>

    <div class="tower-actions">
      <button
        v-if="upgradeCost() !== null"
        class="action-btn upgrade-btn"
        :class="{ disabled: !canUpgrade() }"
        :disabled="!canUpgrade()"
        @click="upgradeTower"
      >
        ⬆ 升级
        <span class="btn-cost">💰 {{ upgradeCost() }}</span>
      </button>

      <button class="action-btn sell-btn" @click="sellTower">
        💰 出售
        <span class="btn-value">+{{ sellValue() }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tower-panel {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 8px;
  padding: 16px;
  min-width: 260px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.tower-level {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.level-label {
  color: #94a3b8;
  font-size: 13px;
}

.level-stars {
  display: flex;
  gap: 4px;
}

.star {
  color: #475569;
  font-size: 18px;
}

.star.filled {
  color: #fbbf24;
}

.tower-stats {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.stat-label {
  color: #64748b;
  font-size: 13px;
}

.stat-value {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
}

.tower-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.upgrade-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.upgrade-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.upgrade-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sell-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.sell-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-cost,
.btn-value {
  font-size: 12px;
  font-weight: normal;
  opacity: 0.9;
}
</style>
