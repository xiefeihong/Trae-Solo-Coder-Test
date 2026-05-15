<script setup lang="ts">
import { computed } from 'vue'
import type { FoodConfig } from '../types/game'
import type { GameEngine } from '../game/GameEngine'

const props = defineProps<{
  food: FoodConfig
  engine: GameEngine
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'select', foodId: string): void
}>()

const isOnCooldown = computed(() => {
  return props.engine.getCardCooldown(props.food.id) > 0
})

const canAfford = computed(() => {
  return props.engine.stars >= props.food.cost
})

const handleClick = () => {
  if (!isOnCooldown.value && canAfford.value) {
    emit('select', props.food.id)
  }
}
</script>

<template>
  <div
    class="card-slot"
    :class="{
      selected,
      'on-cooldown': isOnCooldown,
      'cannot-afford': !canAfford && !isOnCooldown
    }"
    @click="handleClick"
  >
    <div class="card-icon" :style="{ backgroundColor: food.color }">
      <span v-if="food.special === 'produce'">⭐</span>
      <span v-else-if="food.special === 'block'">🛡️</span>
      <span v-else-if="food.special === 'explode'">💥</span>
      <span v-else-if="food.special === 'slow'">❄️</span>
      <span v-else-if="food.special === 'splash'">💫</span>
      <span v-else-if="food.special === 'freeze'">🧊</span>
      <span v-else-if="food.special === 'canHitFlying'">🎯</span>
      <span v-else>🍪</span>
    </div>
    <div class="card-info">
      <div class="card-name">{{ food.name }}</div>
      <div class="card-cost">⭐ {{ food.cost }}</div>
    </div>
    <div v-if="isOnCooldown" class="cooldown-overlay" />
  </div>
</template>

<style scoped>
.card-slot {
  width: 100px;
  height: 120px;
  background: linear-gradient(145deg, #f5f5dc, #ddd8c4);
  border: 3px solid #8B4513;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.card-slot:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.card-slot.selected {
  border-color: #FFD700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  transform: translateY(-4px);
}

.card-slot.on-cooldown {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-slot.cannot-afford {
  opacity: 0.8;
  filter: grayscale(30%);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid #666;
}

.card-info {
  text-align: center;
}

.card-name {
  font-size: 11px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-cost {
  font-size: 14px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.cooldown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
</style>
