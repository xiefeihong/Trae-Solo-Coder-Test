<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import LevelSelect from '@/components/LevelSelect.vue'
import GameBoard from '@/components/GameBoard.vue'

const gameStore = useGameStore()
const currentView = ref<'levels' | 'game'>('levels')

onMounted(() => {
  gameStore.loadProgress()
})

function selectLevel(levelIndex: number) {
  gameStore.initLevel(levelIndex)
  currentView.value = 'game'
}

function backToLevels() {
  currentView.value = 'levels'
}
</script>

<template>
  <div class="app-container">
    <LevelSelect v-if="currentView === 'levels'" @select-level="selectLevel" />
    <GameBoard v-else @back-to-levels="backToLevels" />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>
