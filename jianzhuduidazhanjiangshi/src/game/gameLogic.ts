import type { GameState, Building, Soldier, Zombie } from '../types'
import { getBuildingConfig, getSoldierConfig, getZombieConfig, getWaveConfig, getTotalWaves, getDifficultyConfig } from '../config'
import { gameActions } from './gameState'

export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export const updateGame = (state: GameState, deltaTime: number, canvasWidth: number, canvasHeight: number) => {
  if (state.isPaused || state.isGameOver || state.isVictory) return

  const actions = gameActions(state)

  updateWave(state, deltaTime, canvasWidth, canvasHeight)
  updateBuildings(state, deltaTime, actions)
  updateSoldiers(state, deltaTime, actions)
  updateZombies(state, deltaTime, actions, canvasWidth)
  checkVictory(state)
}

const updateWave = (state: GameState, deltaTime: number, canvasWidth: number, canvasHeight: number) => {
  const actions = gameActions(state)
  const diffConfig = getDifficultyConfig(state.difficulty)
  const waveRewardMultiplier = diffConfig?.waveRewardMultiplier || 1

  if (!state.isWaveActive) {
    state.waveTimer -= deltaTime / 1000
    if (state.waveTimer <= 0) {
      startWave(state, canvasWidth, canvasHeight, actions)
    }
  } else {
    if (state.zombies.length === 0) {
      const waveConfig = getWaveConfig(state.currentWave)
      if (waveConfig) {
        actions.addResources(Math.floor(waveConfig.reward * waveRewardMultiplier))
      }
      actions.endWave()
    }
  }
}

let waveSpawnQueue: { type: string; spawnTime: number; y: number }[] = []
let waveStartTime: number = 0

const startWave = (state: GameState, canvasWidth: number, canvasHeight: number, actions: ReturnType<typeof gameActions>) => {
  actions.startNextWave()
  waveStartTime = Date.now()
  waveSpawnQueue = []

  const waveConfig = getWaveConfig(state.currentWave)
  if (!waveConfig) {
    state.isVictory = true
    return
  }

  const diffConfig = getDifficultyConfig(state.difficulty)
  const spawnDelayMultiplier = diffConfig?.spawnDelayMultiplier || 1

  let spawnIndex = 0
  waveConfig.zombies.forEach(zombieGroup => {
    for (let i = 0; i < zombieGroup.count; i++) {
      const delay = (zombieGroup.delay || 1000) * spawnIndex * spawnDelayMultiplier
      waveSpawnQueue.push({
        type: zombieGroup.type,
        spawnTime: waveStartTime + delay,
        y: 100 + Math.random() * (canvasHeight - 200)
      })
      spawnIndex++
    }
  })
}

const updateBuildings = (state: GameState, deltaTime: number, actions: ReturnType<typeof gameActions>) => {
  const now = Date.now()

  state.buildings.forEach(building => {
    if (building.isDestroyed) return

    const config = getBuildingConfig(building.configId)
    if (!config) return

    const productionInterval = config.productionInterval * (1 - (building.level - 1) * 0.15)

    if (now - building.lastProductionTime >= productionInterval) {
      const soldier = actions.createSoldier(
        config.soldierType,
        building.position.x + 40,
        building.position.y + 30
      )
      if (soldier) {
        const soldierConfig = getSoldierConfig(config.soldierType)
        if (soldierConfig) {
          soldier.health = soldierConfig.health * (1 + (building.level - 1) * 0.2)
          soldier.maxHealth = soldier.health
        }
        actions.addSoldier(soldier)
        building.lastProductionTime = now
      }
    }
  })
}

const updateSoldiers = (state: GameState, deltaTime: number, actions: ReturnType<typeof gameActions>) => {
  const now = Date.now()

  state.soldiers = state.soldiers.filter(soldier => {
    if (soldier.health <= 0) return false

    const config = getSoldierConfig(soldier.configId)
    if (!config) return false

    if (config.isHealer) {
      let nearestBuilding: Building | null = null
      let nearestDist = Infinity

      state.buildings.forEach(building => {
        if (building.isDestroyed || building.health >= building.maxHealth) return
        const dist = getDistance(soldier.position.x, soldier.position.y, building.position.x, building.position.y)
        if (dist < nearestDist) {
          nearestDist = dist
          nearestBuilding = building
        }
      })

      if (nearestBuilding) {
        if (nearestDist <= config.attackRange) {
          if (now - soldier.lastAttackTime >= config.attackSpeed) {
            nearestBuilding.health = Math.min(nearestBuilding.maxHealth, nearestBuilding.health + (config.healAmount || 0))
            soldier.lastAttackTime = now
          }
          soldier.isFighting = true
        } else {
          const angle = Math.atan2(nearestBuilding.position.y - soldier.position.y, nearestBuilding.position.x - soldier.position.x)
          soldier.position.x += Math.cos(angle) * config.speed
          soldier.position.y += Math.sin(angle) * config.speed
          soldier.isFighting = false
        }
      } else {
        soldier.isFighting = false
      }
    } else {
      let nearestZombie: Zombie | null = null
      let nearestDist = Infinity

      state.zombies.forEach(zombie => {
        const zombieConfig = getZombieConfig(zombie.configId)
        if (!zombieConfig) return

        if (zombieConfig.isFlying && !config.canAttackAir) return

        const dist = getDistance(soldier.position.x, soldier.position.y, zombie.position.x, zombie.position.y)
        if (dist < nearestDist) {
          nearestDist = dist
          nearestZombie = zombie
        }
      })

      if (nearestZombie) {
        if (nearestDist <= config.attackRange) {
          if (now - soldier.lastAttackTime >= config.attackSpeed) {
            nearestZombie.health -= config.damage
            soldier.lastAttackTime = now
          }
          soldier.isFighting = true
        } else {
          const angle = Math.atan2(nearestZombie.position.y - soldier.position.y, nearestZombie.position.x - soldier.position.x)
          soldier.position.x += Math.cos(angle) * config.speed
          soldier.position.y += Math.sin(angle) * config.speed
          soldier.isFighting = false
        }
      } else {
        soldier.isFighting = false
      }
    }

    return true
  })
}

const updateZombies = (state: GameState, deltaTime: number, actions: ReturnType<typeof gameActions>, canvasWidth: number) => {
  const now = Date.now()
  const diffConfig = getDifficultyConfig(state.difficulty)
  const healthMultiplier = diffConfig?.zombieHealthMultiplier || 1
  const damageMultiplier = diffConfig?.zombieDamageMultiplier || 1
  const speedMultiplier = diffConfig?.zombieSpeedMultiplier || 1

  const toSpawn = waveSpawnQueue.filter(spawn => now >= spawn.spawnTime)
  toSpawn.forEach(spawn => {
    const zombie = actions.createZombie(spawn.type, canvasWidth + 50, spawn.y)
    if (zombie) {
      zombie.health *= healthMultiplier
      zombie.maxHealth *= healthMultiplier
      actions.addZombie(zombie)
    }
  })
  waveSpawnQueue = waveSpawnQueue.filter(spawn => now < spawn.spawnTime)

  state.zombies = state.zombies.filter(zombie => {
    if (zombie.health <= 0) {
      const config = getZombieConfig(zombie.configId)
      if (config?.isExplosive) {
        const explosionDamage = (config.explosionDamage || 80) * damageMultiplier
        state.soldiers.forEach(soldier => {
          const dist = getDistance(zombie.position.x, zombie.position.y, soldier.position.x, soldier.position.y)
          if (dist <= (config.explosionRadius || 80)) {
            soldier.health -= explosionDamage
          }
        })
        state.buildings.forEach(building => {
          if (building.isDestroyed) return
          const dist = getDistance(zombie.position.x, zombie.position.y, building.position.x, building.position.y)
          if (dist <= (config.explosionRadius || 80)) {
            building.health -= explosionDamage
            if (building.health <= 0) {
              building.isDestroyed = true
            }
          }
        })
      }
      return false
    }

    const config = getZombieConfig(zombie.configId)
    if (!config) return false

    let targetSoldier: Soldier | null = null
    let targetBuilding: Building | null = null
    let nearestSoldierDist = Infinity
    let nearestBuildingDist = Infinity

    if (!config.isFlying) {
      state.soldiers.forEach(soldier => {
        const dist = getDistance(zombie.position.x, zombie.position.y, soldier.position.x, soldier.position.y)
        if (dist < nearestSoldierDist) {
          nearestSoldierDist = dist
          targetSoldier = soldier
        }
      })
    }

    state.buildings.forEach(building => {
      if (building.isDestroyed) return
      const dist = getDistance(zombie.position.x, zombie.position.y, building.position.x, building.position.y)
      if (dist < nearestBuildingDist) {
        nearestBuildingDist = dist
        targetBuilding = building
      }
    })

    const baseDist = zombie.position.x
    if (baseDist < nearestBuildingDist) {
      nearestBuildingDist = baseDist
    }

    const actualDamage = config.damage * damageMultiplier
    const actualSpeed = config.speed * speedMultiplier

    if (targetSoldier && nearestSoldierDist <= nearestBuildingDist) {
      if (nearestSoldierDist <= config.attackRange) {
        if (now - zombie.lastAttackTime >= config.attackSpeed) {
          targetSoldier.health -= actualDamage
          zombie.lastAttackTime = now
        }
        zombie.isFighting = true
      } else {
        const angle = Math.atan2(targetSoldier.position.y - zombie.position.y, targetSoldier.position.x - zombie.position.x)
        zombie.position.x += Math.cos(angle) * actualSpeed
        zombie.position.y += Math.sin(angle) * actualSpeed
        zombie.isFighting = false
      }
    } else if (targetBuilding) {
      if (nearestBuildingDist <= config.attackRange) {
        if (now - zombie.lastAttackTime >= config.attackSpeed) {
          targetBuilding.health -= actualDamage
          if (targetBuilding.health <= 0) {
            targetBuilding.isDestroyed = true
          }
          zombie.lastAttackTime = now
        }
        zombie.isFighting = true
      } else {
        const angle = Math.atan2(targetBuilding.position.y - zombie.position.y, targetBuilding.position.x - zombie.position.x)
        zombie.position.x += Math.cos(angle) * actualSpeed
        zombie.position.y += Math.sin(angle) * actualSpeed
        zombie.isFighting = false
      }
    } else {
      zombie.position.x -= actualSpeed
      zombie.isFighting = false

      if (zombie.position.x <= 60) {
        actions.damageBase(actualDamage)
        return false
      }
    }

    return true
  })
}

const checkVictory = (state: GameState) => {
  if (state.currentWave >= getTotalWaves() && !state.isWaveActive && state.zombies.length === 0) {
    state.isVictory = true
  }
}
