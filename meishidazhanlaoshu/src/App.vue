<script setup lang="ts">
import { ref } from 'vue'
import LevelSelect from './components/LevelSelect.vue'
import Game from './components/Game.vue'

const currentLevel = ref<number | null>(null)

const handleLevelSelect = (levelId: number) => {
  currentLevel.value = levelId
}

const handleBackToMenu = () => {
  currentLevel.value = null
}
</script>

<template>
  <LevelSelect v-if="currentLevel === null" @select="handleLevelSelect" />
  <Game v-else :level-id="currentLevel" @back-to-menu="handleBackToMenu" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
