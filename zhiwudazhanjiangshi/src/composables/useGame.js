import { ref, reactive, computed, onUnmounted } from 'vue'
import {
  GAME_CONFIG,
  PLANT_TYPES,
  ZOMBIE_TYPES,
  SUN_CONFIG,
  generateId,
  getYByRow,
  getXByCol,
  getColByX
} from '../utils/gameConfig'

export function useGame() {
  const gameState = reactive({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    isVictory: false,
    wave: 1,
    sunlight: GAME_CONFIG.INITIAL_SUN,
    selectedPlant: null,
    plants: [],
    zombies: [],
    projectiles: [],
    suns: []
  })

  let gameLoopId = null
  let sunFallIntervalId = null
  let zombieSpawnIntervalId = null
  let zombiesToSpawn = 0

  const hasPlantAt = computed(() => {
    return (row, col) => {
      return gameState.plants.some(p => p.row === row && p.col === col)
    }
  })

  const getPlantAt = (row, col) => {
    return gameState.plants.find(p => p.row === row && p.col === col)
  }

  const getZombiesInRow = (row) => {
    return gameState.zombies.filter(z => z.row === row)
  }

  function startGame() {
    resetGame()
    gameState.isPlaying = true
    startGameLoop()
    startSunFall()
    startZombieWave()
  }

  function resetGame() {
    gameState.isPlaying = false
    gameState.isPaused = false
    gameState.isGameOver = false
    gameState.isVictory = false
    gameState.wave = 1
    gameState.sunlight = GAME_CONFIG.INITIAL_SUN
    gameState.selectedPlant = null
    gameState.plants = []
    gameState.zombies = []
    gameState.projectiles = []
    gameState.suns = []
    zombiesToSpawn = 0

    clearAllIntervals()
  }

  function clearAllIntervals() {
    if (gameLoopId) clearInterval(gameLoopId)
    if (sunFallIntervalId) clearInterval(sunFallIntervalId)
    if (zombieSpawnIntervalId) clearInterval(zombieSpawnIntervalId)
    gameLoopId = null
    sunFallIntervalId = null
    zombieSpawnIntervalId = null
  }

  function pauseGame() {
    gameState.isPaused = !gameState.isPaused
  }

  function selectPlant(plantType) {
    if (gameState.sunlight >= PLANT_TYPES[plantType].cost) {
      gameState.selectedPlant = plantType
    }
  }

  function plantAt(row, col) {
    if (!gameState.selectedPlant) return
    if (hasPlantAt.value(row, col)) return
    if (gameState.sunlight < PLANT_TYPES[gameState.selectedPlant].cost) return

    const plantConfig = PLANT_TYPES[gameState.selectedPlant]
    const plant = {
      id: generateId(),
      type: gameState.selectedPlant,
      row,
      col,
      x: getXByCol(col),
      y: getYByRow(row),
      health: plantConfig.health,
      maxHealth: plantConfig.health,
      lastActionTime: Date.now(),
      emoji: plantConfig.emoji
    }

    gameState.plants.push(plant)
    gameState.sunlight -= plantConfig.cost
    gameState.selectedPlant = null
  }

  function removePlant(plantId) {
    const index = gameState.plants.findIndex(p => p.id === plantId)
    if (index !== -1) {
      gameState.plants.splice(index, 1)
    }
  }

  function spawnZombie() {
    const row = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS)
    const zombieType = gameState.wave > 2 && Math.random() > 0.7 ? 'conehead' : 'normal'
    const zombieConfig = ZOMBIE_TYPES[zombieType]

    const zombie = {
      id: generateId(),
      type: zombieType,
      row,
      x: GAME_CONFIG.GRID_COLS * GAME_CONFIG.CELL_WIDTH + 40,
      y: getYByRow(row),
      health: zombieConfig.health * (1 + gameState.wave * 0.1),
      maxHealth: zombieConfig.health * (1 + gameState.wave * 0.1),
      speed: zombieConfig.speed,
      damage: zombieConfig.damage,
      attackInterval: zombieConfig.attackInterval,
      lastAttackTime: Date.now(),
      isAttacking: false,
      emoji: zombieConfig.emoji
    }

    gameState.zombies.push(zombie)
  }

  function startZombieWave() {
    zombiesToSpawn = GAME_CONFIG.ZOMBIES_PER_WAVE + (gameState.wave - 1) * 2

    zombieSpawnIntervalId = setInterval(() => {
      if (gameState.isPaused || gameState.isGameOver) return

      if (zombiesToSpawn > 0) {
        spawnZombie()
        zombiesToSpawn--
      } else {
        clearInterval(zombieSpawnIntervalId)
        zombieSpawnIntervalId = null
      }
    }, GAME_CONFIG.ZOMBIE_SPAWN_INTERVAL)
  }

  function spawnFallingSun() {
    const col = Math.floor(Math.random() * GAME_CONFIG.GRID_COLS)
    const sun = {
      id: generateId(),
      x: getXByCol(col),
      y: -30,
      targetY: getYByRow(Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS)),
      value: SUN_CONFIG.value,
      createdAt: Date.now()
    }

    gameState.suns.push(sun)
  }

  function startSunFall() {
    sunFallIntervalId = setInterval(() => {
      if (!gameState.isPaused && !gameState.isGameOver) {
        spawnFallingSun()
      }
    }, GAME_CONFIG.SUN_FALL_INTERVAL)

    setTimeout(() => spawnFallingSun(), 1000)
  }

  function collectSun(sunId) {
    const index = gameState.suns.findIndex(s => s.id === sunId)
    if (index !== -1) {
      gameState.sunlight += gameState.suns[index].value
      gameState.suns.splice(index, 1)
    }
  }

  function startGameLoop() {
    gameLoopId = setInterval(() => {
      if (gameState.isPaused || gameState.isGameOver) return

      updateSuns()
      updateZombies()
      updateProjectiles()
      updatePlants()
      checkCollisions()
      checkWaveComplete()
      checkGameOver()
    }, GAME_CONFIG.GAME_LOOP_INTERVAL)
  }

  function updateSuns() {
    const now = Date.now()
    gameState.suns.forEach(sun => {
      if (sun.y < sun.targetY) {
        sun.y += 1
      }
    })

    gameState.suns = gameState.suns.filter(s =>
      now - s.createdAt < SUN_CONFIG.lifetime
    )
  }

  function updateZombies() {
    gameState.zombies.forEach(zombie => {
      const col = getColByX(zombie.x - 20)
      const plant = getPlantAt(zombie.row, col)

      if (plant) {
        zombie.isAttacking = true
        const now = Date.now()
        if (now - zombie.lastAttackTime >= zombie.attackInterval) {
          plant.health -= zombie.damage
          zombie.lastAttackTime = now
        }
      } else {
        zombie.isAttacking = false
        zombie.x -= zombie.speed
      }
    })

    gameState.plants = gameState.plants.filter(p => p.health > 0)
    gameState.zombies = gameState.zombies.filter(z => z.health > 0)
  }

  function updateProjectiles() {
    gameState.projectiles.forEach(proj => {
      proj.x += proj.speed
    })

    gameState.projectiles = gameState.projectiles.filter(p =>
      p.x < GAME_CONFIG.GRID_COLS * GAME_CONFIG.CELL_WIDTH + 100
    )
  }

  function updatePlants() {
    const now = Date.now()

    gameState.plants.forEach(plant => {
      const plantConfig = PLANT_TYPES[plant.type]

      if (plant.type === 'sunflower') {
        if (now - plant.lastActionTime >= plantConfig.sunInterval) {
          const sun = {
            id: generateId(),
            x: plant.x,
            y: plant.y - 20,
            targetY: plant.y - 20,
            value: plantConfig.sunProduction,
            createdAt: now
          }
          gameState.suns.push(sun)
          plant.lastActionTime = now
        }
      } else if (plant.type === 'peashooter') {
        const zombiesInRow = getZombiesInRow(plant.row)
        if (zombiesInRow.length > 0 && now - plant.lastActionTime >= plantConfig.attackInterval) {
          const projectile = {
            id: generateId(),
            row: plant.row,
            x: plant.x + 30,
            y: plant.y,
            damage: plantConfig.damage,
            speed: plantConfig.projectileSpeed
          }
          gameState.projectiles.push(projectile)
          plant.lastActionTime = now
        }
      }
    })
  }

  function checkCollisions() {
    gameState.projectiles.forEach(proj => {
      gameState.zombies.forEach(zombie => {
        if (
          zombie.row === proj.row &&
          Math.abs(zombie.x - proj.x) < 25
        ) {
          zombie.health -= proj.damage
          proj.hit = true
        }
      })
    })

    gameState.projectiles = gameState.projectiles.filter(p => !p.hit)
  }

  function checkWaveComplete() {
    if (
      gameState.zombies.length === 0 &&
      zombiesToSpawn === 0 &&
      !zombieSpawnIntervalId
    ) {
      if (gameState.wave >= GAME_CONFIG.MAX_WAVES) {
        gameState.isVictory = true
        gameState.isGameOver = true
        clearAllIntervals()
      } else {
        gameState.wave++
        startZombieWave()
      }
    }
  }

  function checkGameOver() {
    gameState.zombies.forEach(zombie => {
      if (zombie.x < 0) {
        gameState.isGameOver = true
        gameState.isVictory = false
        clearAllIntervals()
      }
    })
  }

  onUnmounted(() => {
    clearAllIntervals()
  })

  return {
    gameState,
    hasPlantAt,
    startGame,
    pauseGame,
    selectPlant,
    plantAt,
    collectSun
  }
}
