<template>
  <div class="plant-selector">
    <div
      v-for="(plant, key) in PLANT_TYPES"
      :key="key"
      class="plant-card"
      :class="{
        selected: selectedPlant === key,
        disabled: sunlight < plant.cost
      }"
      @click="handleSelect(key)"
    >
      <span class="plant-emoji">{{ plant.emoji }}</span>
      <span class="plant-name">{{ plant.name }}</span>
      <div class="plant-cost">
        <span class="sun-icon">☀️</span>
        <span>{{ plant.cost }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PLANT_TYPES } from '../utils/gameConfig'

const props = defineProps({
  selectedPlant: String,
  sunlight: Number
})

const emit = defineEmits(['select'])

function handleSelect(plantType) {
  if (props.sunlight >= PLANT_TYPES[plantType].cost) {
    emit('select', plantType)
  }
}
</script>

<style scoped>
.plant-selector {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(139, 119, 101, 0.9);
  border-radius: 12px;
  border: 3px solid #5d4037;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.plant-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(180deg, #c8e6c9 0%, #a5d6a7 100%);
  border: 2px solid #66bb6a;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
}

.plant-card:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.plant-card.selected {
  background: linear-gradient(180deg, #ffeb3b 0%, #ffc107 100%);
  border-color: #ff9800;
  transform: scale(1.05);
}

.plant-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}

.plant-emoji {
  font-size: 32px;
  margin-bottom: 4px;
}

.plant-name {
  font-size: 12px;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 4px;
}

.plant-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: bold;
  color: #f57c00;
}

.sun-icon {
  font-size: 16px;
}
</style>
