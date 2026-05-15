<script setup lang="ts">
import { computed } from 'vue'
import type { GameEngine } from '../game/GameEngine'
import { getFoodConfig } from '../config'

const props = defineProps<{
  engine: GameEngine
  foodId: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const food = computed(() => {
  if (!props.foodId) return null
  const foods = props.engine.getFoods()
  return foods.find(f => f.id === props.foodId) || null
})

const foodConfig = computed(() => {
  if (!food.value) return null
  return getFoodConfig(food.value.configId) || null
})

const upgradeCost = computed(() => {
  if (!food.value) return 0
  return 75 * food.value.level
})

const canUpgrade = computed(() => {
  if (!food.value || food.value.level >= 3) return false
  return props.engine.stars >= upgradeCost.value
})

const handleUpgrade = () => {
  if (food.value && canUpgrade.value) {
    props.engine.upgradeFood(food.value.id)
  }
}

const handleSell = () => {
  if (food.value) {
    props.engine.sellFood(food.value.id)
    emit('close')
  }
}

const handleActivate = () => {
  if (food.value && foodConfig.value?.special === 'explode') {
    props.engine.activateBomb(food.value.id)
    emit('close')
  }
}
</script>

<template>
  <div v-if="food && foodConfig" class="info-panel">
    <div class="panel-header">
      <h3>{{ foodConfig.name }}</h3>
      <button class="close-btn" @click="emit('close')">×</button>
    </div>
    <div class="panel-content">
      <div class="food-icon" :style="{ backgroundColor: foodConfig.color }">
        Lv.{{ food.level }}
      </div>
      <div class="food-stats">
        <div class="stat">
          <span class="label">生命值:</span>
          <span class="value">{{ Math.floor(food.hp) }} / {{ Math.floor(food.maxHp) }}</span>
        </div>
        <div class="stat">
          <span class="label">伤害:</span>
          <span class="value">{{ Math.floor(foodConfig.damage * (1 + (food.level - 1) * 0.5)) }}</span>
        </div>
        <div class="stat">
          <span class="label">等级:</span>
          <span class="value">{{ food.level }} / 3</span>
        </div>
      </div>
      <div class="panel-actions">
        <button
          v-if="food.level < 3"
          class="action-btn upgrade"
          :class="{ disabled: !canUpgrade }"
          @click="handleUpgrade"
        >
          升级 (⭐{{ upgradeCost }})
        </button>
        <button
          v-if="foodConfig.special === 'explode'"
          class="action-btn activate"
          @click="handleActivate"
        >
          引爆 💥
        </button>
        <button class="action-btn sell" @click="handleSell">
          出售 (+⭐{{ Math.floor(foodConfig.cost * 0.5) }})
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  width: 250px;
  background: linear-gradient(145deg, #f5f5dc, #e8e0c8);
  border: 3px solid #8B4513;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 100;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(90deg, #8B4513, #A0522D);
  color: #FFF;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: #FFF;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.panel-content {
  padding: 16px;
}

.food-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #FFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border: 3px solid #666;
}

.food-stats {
  margin-bottom: 16px;
}

.stat {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #ccc;
}

.stat:last-child {
  border-bottom: none;
}

.stat .label {
  color: #666;
  font-size: 14px;
}

.stat .value {
  font-weight: bold;
  color: #333;
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.action-btn.upgrade {
  background: linear-gradient(145deg, #4CAF50, #45a049);
  color: white;
}

.action-btn.upgrade.disabled {
  background: #999;
  cursor: not-allowed;
  transform: none;
}

.action-btn.activate {
  background: linear-gradient(145deg, #FF6347, #FF4500);
  color: white;
}

.action-btn.sell {
  background: linear-gradient(145deg, #FFD700, #FFA500);
  color: #333;
}
</style>
