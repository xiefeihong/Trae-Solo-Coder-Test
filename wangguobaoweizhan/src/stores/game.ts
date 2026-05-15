import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Tower } from '../game/Tower';
import { TOWER_CONFIGS } from '../config/towers';

export const useGameStore = defineStore('game', () => {
  const gold = ref(500);
  const lives = ref(20);
  const currentWave = ref(0);
  const gameState = ref<'idle' | 'playing' | 'paused' | 'won' | 'lost'>('idle');
  const waveInProgress = ref(false);
  const selectedTower = ref<Tower | null>(null);
  const buildMode = ref<string | null>(null);
  const gameSpeed = ref(1);

  const totalWaves = computed(() => 10);

  function setGold(value: number) {
    gold.value = value;
  }

  function setLives(value: number) {
    lives.value = value;
  }

  function setCurrentWave(value: number) {
    currentWave.value = value;
  }

  function setGameState(value: 'idle' | 'playing' | 'paused' | 'won' | 'lost') {
    gameState.value = value;
  }

  function setWaveInProgress(value: boolean) {
    waveInProgress.value = value;
  }

  function setSelectedTower(tower: Tower | null) {
    selectedTower.value = tower;
  }

  function setBuildMode(mode: string | null) {
    buildMode.value = mode;
    if (mode) {
      selectedTower.value = null;
    }
  }

  function setGameSpeed(speed: number) {
    gameSpeed.value = speed;
  }

  function canAffordTower(towerType: string): boolean {
    const config = TOWER_CONFIGS[towerType];
    return config ? gold.value >= config.cost : false;
  }

  function reset() {
    gold.value = 500;
    lives.value = 20;
    currentWave.value = 0;
    gameState.value = 'idle';
    waveInProgress.value = false;
    selectedTower.value = null;
    buildMode.value = null;
    gameSpeed.value = 1;
  }

  return {
    gold,
    lives,
    currentWave,
    gameState,
    waveInProgress,
    selectedTower,
    buildMode,
    gameSpeed,
    totalWaves,
    setGold,
    setLives,
    setCurrentWave,
    setGameState,
    setWaveInProgress,
    setSelectedTower,
    setBuildMode,
    setGameSpeed,
    canAffordTower,
    reset
  };
});
