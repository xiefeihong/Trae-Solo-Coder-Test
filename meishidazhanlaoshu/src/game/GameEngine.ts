import type { FoodInstance, MouseInstance, Projectile, LevelConfig, Position } from '../types/game'
import { getFoodConfig, getMouseConfig } from '../config'
import { reactive, ref } from 'vue'

export const CELL_SIZE = 80
export const GRID_OFFSET_X = 50
export const GRID_OFFSET_Y = 100

export function createGameEngine(levelConfig: LevelConfig) {
  const foods = reactive<FoodInstance[]>([])
  const mouses = reactive<MouseInstance[]>([])
  const projectiles = reactive<Projectile[]>([])
  const cardCooldowns: Map<string, number> = new Map()
  const lastProduceTime: Map<string, number> = new Map()
  
  let animationFrameId = 0
  let lastTime = 0
  let waveStartTime = 0
  let waveIndex = 0
  let spawnQueue: { configId: string; row: number; time: number }[] = []
  let spawnedCount = 0
  let isRunning = false

  const stars = ref(levelConfig.startStars)
  const lives = ref(10)
  const currentWave = ref(0)
  const isGameOver = ref(false)
  const isVictory = ref(false)

  function getFoods() {
    return foods
  }

  function getMouses() {
    return mouses
  }

  function getProjectiles() {
    return projectiles
  }

  function getLevelConfig() {
    return levelConfig
  }

  function getCardCooldown(configId: string): number {
    return cardCooldowns.get(configId) || 0
  }

  function start() {
    isRunning = true
    lastTime = performance.now()
    waveStartTime = lastTime
    waveIndex = 0
    prepareWave(0)
    gameLoop()
  }

  function stop() {
    isRunning = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }

  function gameLoop() {
    if (!isRunning) return

    const currentTime = performance.now()
    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    updateWave(currentTime)
    spawnMouses(currentTime)
    updateFoods(currentTime)
    updateMouses(deltaTime)
    updateProjectiles(deltaTime)
    checkCollisions()
    checkGameEnd()

    animationFrameId = requestAnimationFrame(gameLoop)
  }

  function prepareWave(waveIdx: number) {
    if (waveIdx >= levelConfig.waves.length) return

    const wave = levelConfig.waves[waveIdx]
    spawnQueue = []
    spawnedCount = 0

    let time = 0
    wave.mouses.forEach(mouseConfig => {
      for (let i = 0; i < mouseConfig.count; i++) {
        const row = mouseConfig.row !== undefined
          ? mouseConfig.row
          : Math.floor(Math.random() * levelConfig.gridRows)
        spawnQueue.push({
          configId: mouseConfig.configId,
          row,
          time: wave.delay + time
        })
        time += mouseConfig.interval
      }
    })
  }

  function updateWave(currentTime: number) {
    const elapsed = currentTime - waveStartTime

    if (spawnedCount >= spawnQueue.length && mouses.length === 0) {
      if (waveIndex < levelConfig.waves.length - 1) {
        waveIndex++
        currentWave.value = waveIndex
        waveStartTime = currentTime
        prepareWave(waveIndex)
      } else if (!isVictory.value) {
        isVictory.value = true
        isRunning = false
      }
    }
  }

  function spawnMouses(currentTime: number) {
    const elapsed = currentTime - waveStartTime

    while (spawnedCount < spawnQueue.length) {
      const spawn = spawnQueue[spawnedCount]
      if (elapsed >= spawn.time) {
        spawnMouse(spawn.configId, spawn.row)
        spawnedCount++
      } else {
        break
      }
    }
  }

  function spawnMouse(configId: string, row: number) {
    const config = getMouseConfig(configId)
    if (!config) return

    const mouse: MouseInstance = reactive({
      id: `mouse_${Date.now()}_${Math.random()}`,
      configId,
      position: {
        x: GRID_OFFSET_X + levelConfig.gridCols * CELL_SIZE + 20,
        y: GRID_OFFSET_Y + row * CELL_SIZE + CELL_SIZE / 2
      },
      gridRow: row,
      hp: config.hp,
      maxHp: config.maxHp,
      speed: config.speed,
      isFrozen: false,
      frozenTime: 0,
      slowFactor: 1,
      slowTime: 0,
      isDead: false
    })

    mouses.push(mouse)
  }

  function updateFoods(currentTime: number) {
    foods.forEach(food => {
      const config = getFoodConfig(food.configId)
      if (!config) return

      if (config.special === 'produce') {
        const lastProduce = lastProduceTime.get(food.id) || 0
        if (currentTime - lastProduce >= 5000) {
          stars.value += 25
          lastProduceTime.set(food.id, currentTime)
        }
      }

      if (config.damage > 0 && config.attackSpeed > 0) {
        if (currentTime - food.lastAttackTime >= config.attackSpeed) {
          const target = findTarget(food, config)
          if (target) {
            shoot(food, target, config)
            food.lastAttackTime = currentTime
          }
        }
      }

      if (config.special === 'slow') {
        mouses.forEach(mouse => {
          if (mouse.gridRow === food.gridPos.y) {
            const distance = Math.abs(mouse.position.x - food.position.x)
            if (distance < CELL_SIZE) {
              mouse.slowFactor = 0.5
              mouse.slowTime = currentTime + 1000
            }
          }
        })
      }
    })
  }

  function findTarget(food: FoodInstance, config: any): MouseInstance | null {
    const validTargets = mouses.filter(mouse => {
      if (mouse.isDead) return false
      if (mouse.gridRow !== food.gridPos.y) return false

      const mouseConfig = getMouseConfig(mouse.configId)
      if (mouseConfig?.special === 'flying' && config.special !== 'canHitFlying') return false
      if (mouseConfig?.special === 'underground' && config.special !== 'canHitUnderground') return false

      const distance = (mouse.position.x - food.position.x) / CELL_SIZE
      return distance > 0 && distance <= config.range
    })

    if (validTargets.length === 0) return null
    return validTargets.reduce((closest, mouse) =>
      mouse.position.x < closest.position.x ? mouse : closest
    )
  }

  function shoot(food: FoodInstance, target: MouseInstance, config: any) {
    const projectile: Projectile = reactive({
      id: `proj_${Date.now()}_${Math.random()}`,
      position: { ...food.position },
      targetId: target.id,
      damage: config.damage * (1 + (food.level - 1) * 0.5),
      speed: 8,
      color: config.color,
      isAoe: config.special === 'splash',
      aoeRadius: config.special === 'splash' ? CELL_SIZE * 1.5 : 0,
      canHitFlying: config.special === 'canHitFlying',
      canHitUnderground: config.special === 'canHitUnderground'
    })

    projectiles.push(projectile)
  }

  function updateMouses(deltaTime: number) {
    const currentTime = performance.now()

    mouses.forEach(mouse => {
      if (mouse.isDead) return

      if (mouse.isFrozen) {
        if (currentTime > mouse.frozenTime) {
          mouse.isFrozen = false
        }
        return
      }

      if (currentTime > mouse.slowTime) {
        mouse.slowFactor = 1
      }

      const speed = mouse.speed * mouse.slowFactor * (deltaTime / 16)
      mouse.position.x -= speed * 2

      const blockingFood = foods.find(food =>
        food.gridPos.y === mouse.gridRow &&
        Math.abs(food.position.x - mouse.position.x) < CELL_SIZE / 2
      )

      if (blockingFood) {
        const foodConfig = getFoodConfig(blockingFood.configId)
        if (foodConfig?.special === 'block') {
          blockingFood.hp -= 0.5
          if (blockingFood.hp <= 0) {
            removeFood(blockingFood.id)
          }
        }
      }

      if (mouse.position.x < GRID_OFFSET_X) {
        lives.value--
        mouse.isDead = true
      }
    })

    for (let i = mouses.length - 1; i >= 0; i--) {
      if (mouses[i].isDead) {
        mouses.splice(i, 1)
      }
    }
  }

  function updateProjectiles(deltaTime: number) {
    projectiles.forEach(proj => {
      const target = mouses.find(m => m.id === proj.targetId)
      if (target && !target.isDead) {
        const dx = target.position.x - proj.position.x
        const dy = target.position.y - proj.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 20) {
          hitMouse(target, proj)
          if (proj.isAoe) {
            aoeDamage(proj)
          }
          proj.position.x = -1000
        } else {
          proj.position.x += (dx / distance) * proj.speed * (deltaTime / 16)
          proj.position.y += (dy / distance) * proj.speed * (deltaTime / 16)
        }
      } else {
        proj.position.x = -1000
      }
    })

    for (let i = projectiles.length - 1; i >= 0; i--) {
      if (projectiles[i].position.x < -500) {
        projectiles.splice(i, 1)
      }
    }
  }

  function hitMouse(mouse: MouseInstance, proj: Projectile) {
    mouse.hp -= proj.damage

    const foodConfig = getFoodConfig(proj.targetId)
    if (foodConfig?.special === 'freeze' && Math.random() < 0.3) {
      mouse.isFrozen = true
      mouse.frozenTime = performance.now() + 2000
    }

    if (mouse.hp <= 0) {
      const config = getMouseConfig(mouse.configId)
      if (config) {
        stars.value += config.reward
      }
      mouse.isDead = true
    }
  }

  function aoeDamage(proj: Projectile) {
    mouses.forEach(mouse => {
      if (mouse.isDead || mouse.id === proj.targetId) return

      const dx = mouse.position.x - proj.position.x
      const dy = mouse.position.y - proj.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < (proj.aoeRadius || 0)) {
        mouse.hp -= proj.damage * 0.5
        if (mouse.hp <= 0) {
          const config = getMouseConfig(mouse.configId)
          if (config) {
            stars.value += config.reward
          }
          mouse.isDead = true
        }
      }
    })
  }

  function checkCollisions() {
    mouses.forEach(mouse => {
      if (mouse.isDead) return

      const mouseConfig = getMouseConfig(mouse.configId)
      if (mouseConfig?.special === 'explode') {
        const nearbyFood = foods.find(food =>
          Math.abs(food.position.x - mouse.position.x) < CELL_SIZE &&
          Math.abs(food.position.y - mouse.position.y) < CELL_SIZE
        )
        if (nearbyFood) {
          explodeAt(mouse.position)
          mouse.isDead = true
        }
      }
    })
  }

  function explodeAt(position: Position) {
    const explosionRadius = CELL_SIZE * 2
    foods.forEach(food => {
      const dx = food.position.x - position.x
      const dy = food.position.y - position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < explosionRadius) {
        food.hp -= 200
        if (food.hp <= 0) {
          removeFood(food.id)
        }
      }
    })
  }

  function checkGameEnd() {
    if (lives.value <= 0 && !isGameOver.value) {
      isGameOver.value = true
      isRunning = false
    }
  }

  function placeFood(gridX: number, gridY: number, configId: string): boolean {
    const config = getFoodConfig(configId)
    if (!config) return false

    if (stars.value < config.cost) return false

    const existing = foods.find(f => f.gridPos.x === gridX && f.gridPos.y === gridY)
    if (existing) return false

    if (getCardCooldown(configId) > 0) return false

    const food: FoodInstance = reactive({
      id: `food_${Date.now()}_${Math.random()}`,
      configId,
      position: {
        x: GRID_OFFSET_X + gridX * CELL_SIZE + CELL_SIZE / 2,
        y: GRID_OFFSET_Y + gridY * CELL_SIZE + CELL_SIZE / 2
      },
      gridPos: { x: gridX, y: gridY },
      hp: config.hp,
      maxHp: config.hp,
      lastAttackTime: 0,
      level: 1
    })

    foods.push(food)
    stars.value -= config.cost
    cardCooldowns.set(configId, config.cooldown)

    setTimeout(() => {
      cardCooldowns.set(configId, 0)
    }, config.cooldown)

    return true
  }

  function activateBomb(foodId: string) {
    const food = foods.find(f => f.id === foodId)
    if (!food) return

    const config = getFoodConfig(food.configId)
    if (config?.special !== 'explode') return

    explodeAt(food.position)
    removeFood(foodId)
  }

  function removeFood(foodId: string) {
    const index = foods.findIndex(f => f.id === foodId)
    if (index !== -1) {
      foods.splice(index, 1)
    }
  }

  function getFoodAt(gridX: number, gridY: number): FoodInstance | undefined {
    return foods.find(f => f.gridPos.x === gridX && f.gridPos.y === gridY)
  }

  function upgradeFood(foodId: string): boolean {
    const food = foods.find(f => f.id === foodId)
    if (!food || food.level >= 3) return false

    const upgradeCost = 75 * food.level
    if (stars.value < upgradeCost) return false

    stars.value -= upgradeCost
    food.level++
    food.maxHp *= 1.5
    food.hp = food.maxHp

    return true
  }

  function sellFood(foodId: string) {
    const food = foods.find(f => f.id === foodId)
    if (!food) return

    const config = getFoodConfig(food.configId)
    if (config) {
      stars.value += Math.floor(config.cost * 0.5)
    }

    removeFood(foodId)
  }

  return {
    stars,
    lives,
    currentWave,
    isGameOver,
    isVictory,
    getFoods,
    getMouses,
    getProjectiles,
    getLevelConfig,
    getCardCooldown,
    getFoodAt,
    start,
    stop,
    placeFood,
    activateBomb,
    upgradeFood,
    sellFood
  }
}

export type GameEngine = ReturnType<typeof createGameEngine>
