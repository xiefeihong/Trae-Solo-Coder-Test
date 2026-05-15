<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const emit = defineEmits<{
  selectLevel: [levelIndex: number]
}>()

const gameStore = useGameStore()

const levels = computed(() => gameStore.levels)
const progress = computed(() => gameStore.levelProgress)

function getStars(levelId: number) {
  return progress.value.get(levelId)?.stars || 0
}

function isUnlocked(levelId: number) {
  return progress.value.get(levelId)?.isUnlocked || false
}

function selectLevel(index: number) {
  if (isUnlocked(levels.value[index].id)) {
    emit('selectLevel', index)
  }
}
</script>

<template>
  <div class="level-select card">
    <h1 class="title">🐊 小鳄鱼爱洗澡</h1>
    <p class="subtitle">选择关卡开始游戏</p>
    
    <div class="levels-grid">
      <div
        v-for="(level, index) in levels"
        :key="level.id"
        class="level-card"
        :class="{ locked: !isUnlocked(level.id) }"
        @click="selectLevel(index)"
      >
        <div class="level-number">{{ level.id }}</div>
        <div class="level-name">{{ level.name }}</div>
        <div class="level-stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ filled: getStars(level.id) >= i }">
            ★
          </span>
        </div>
        <div v-if="!isUnlocked(level.id)" class="lock-icon">🔒</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-select {
  max-width: 900px;
  width: 100%;
}

.title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.level-card {
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.level-card:hover:not(.locked) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.level-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.level-number {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4px;
}

.level-name {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.level-stars {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.star {
  font-size: 18px;
  color: #ddd;
}

.star.filled {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.lock-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
