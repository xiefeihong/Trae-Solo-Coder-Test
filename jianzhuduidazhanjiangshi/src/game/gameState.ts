import { reactive } from 'vue'
import type { GameState, Building, Soldier, Zombie } from '../types'
import { getBuildingConfig, getSoldierConfig, getZombieConfig, getDifficultyConfig } from '../config'

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const createInitialState = (difficulty: string = 'normal'): GameState => {
  const diffConfig = getDifficultyConfig(difficulty)
  const resourceMultiplier = diffConfig?.resourceMultiplier || 1

  return reactive({
    difficulty,
    resources: Math.floor(500 * resourceMultiplier),
    baseHealth: 1000,
    maxBaseHealth: 1000,
    currentWave: 0,
    isWaveActive: false,
    waveTimer: 15,
    isGameOver: false,
    isVictory: false,
    isPaused: false,
    isStarted: false,
    buildings: [],
    soldiers: [],
    zombies: [],
    selectedBuilding: null,
    buildMode: null,
    score: 0
  })
}

export const gameActions = (state: GameState) => {
  const addResources = (amount: number) => {
    state.resources += amount
  }

  const spendResources = (amount: number): boolean => {
    if (state.resources >= amount) {
      state.resources -= amount
      return true
    }
    return false
  }

  const createBuilding = (configId: string, x: number, y: number): Building | null => {
    const config = getBuildingConfig(configId)
    if (!config) return null

    return {
      id: generateId(),
      configId,
      level: 1,
      position: { x, y },
      health: config.health,
      maxHealth: config.health,
      lastProductionTime: 0,
      isDestroyed: false
    }
  }

  const addBuilding = (building: Building) => {
    state.buildings.push(building)
  }

  const removeBuilding = (buildingId: string) => {
    const index = state.buildings.findIndex(b => b.id === buildingId)
    if (index !== -1) {
      state.buildings.splice(index, 1)
    }
  }

  const upgradeBuilding = (building: Building): boolean => {
    const config = getBuildingConfig(building.configId)
    if (!config || building.level >= config.maxLevel) return false

    const diffConfig = getDifficultyConfig(state.difficulty)
    const costMultiplier = diffConfig?.buildingCostMultiplier || 1
    const upgradeCost = Math.floor(config.upgradeCosts[building.level - 1] * costMultiplier)
    
    if (spendResources(upgradeCost)) {
      building.level++
      building.maxHealth = config.health * (1 + (building.level - 1) * 0.3)
      building.health = Math.min(building.health + config.health * 0.3, building.maxHealth)
      return true
    }
    return false
  }

  const createSoldier = (configId: string, x: number, y: number): Soldier | null => {
    const config = getSoldierConfig(configId)
    if (!config) return null

    return {
      id: generateId(),
      configId,
      position: { x, y },
      health: config.health,
      maxHealth: config.health,
      target: null,
      lastAttackTime: 0,
      isFighting: false
    }
  }

  const addSoldier = (soldier: Soldier) => {
    state.soldiers.push(soldier)
  }

  const removeSoldier = (soldierId: string) => {
    const index = state.soldiers.findIndex(s => s.id === soldierId)
    if (index !== -1) {
      state.soldiers.splice(index, 1)
    }
  }

  const createZombie = (configId: string, x: number, y: number): Zombie | null => {
    const config = getZombieConfig(configId)
    if (!config) return null

    return {
      id: generateId(),
      configId,
      position: { x, y },
      health: config.health,
      maxHealth: config.health,
      target: null,
      lastAttackTime: 0,
      isFighting: false
    }
  }

  const addZombie = (zombie: Zombie) => {
    state.zombies.push(zombie)
  }

  const removeZombie = (zombieId: string) => {
    const index = state.zombies.findIndex(z => z.id === zombieId)
    if (index !== -1) {
      const zombie = state.zombies[index]
      const config = getZombieConfig(zombie.configId)
      if (config) {
        addResources(config.reward)
        state.score += config.reward
      }
      state.zombies.splice(index, 1)
    }
  }

  const damageBase = (amount: number) => {
    state.baseHealth = Math.max(0, state.baseHealth - amount)
    if (state.baseHealth <= 0) {
      state.isGameOver = true
    }
  }

  const startNextWave = () => {
    state.currentWave++
    state.isWaveActive = true
    state.waveTimer = 0
  }

  const endWave = () => {
    state.isWaveActive = false
    state.waveTimer = 15
  }

  const togglePause = () => {
    state.isPaused = !state.isPaused
  }

  const setDifficulty = (difficulty: string) => {
    state.difficulty = difficulty
    const diffConfig = getDifficultyConfig(difficulty)
    const resourceMultiplier = diffConfig?.resourceMultiplier || 1
    state.resources = Math.floor(500 * resourceMultiplier)
  }

  const startGame = () => {
    state.isStarted = true
  }

  const resetGame = () => {
    const diffConfig = getDifficultyConfig(state.difficulty)
    const resourceMultiplier = diffConfig?.resourceMultiplier || 1

    state.resources = Math.floor(500 * resourceMultiplier)
    state.baseHealth = 1000
    state.maxBaseHealth = 1000
    state.currentWave = 0
    state.isWaveActive = false
    state.waveTimer = 15
    state.isGameOver = false
    state.isVictory = false
    state.isPaused = false
    state.isStarted = false
    state.buildings = []
    state.soldiers = []
    state.zombies = []
    state.selectedBuilding = null
    state.buildMode = null
    state.score = 0
  }

  return {
    addResources,
    spendResources,
    createBuilding,
    addBuilding,
    removeBuilding,
    upgradeBuilding,
    createSoldier,
    addSoldier,
    removeSoldier,
    createZombie,
    addZombie,
    removeZombie,
    damageBase,
    startNextWave,
    endWave,
    togglePause,
    setDifficulty,
    startGame,
    resetGame
  }
}
