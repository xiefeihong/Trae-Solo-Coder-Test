export interface Position {
  x: number
  y: number
}

export interface BuildingConfig {
  id: string
  name: string
  cost: number
  maxLevel: number
  productionInterval: number
  soldierType: string
  health: number
  color: string
  upgradeCosts: number[]
  description: string
}

export interface SoldierConfig {
  id: string
  name: string
  health: number
  damage: number
  speed: number
  attackRange: number
  attackSpeed: number
  canAttackAir: boolean
  isHealer: boolean
  healAmount?: number
  color: string
  size: number
}

export interface ZombieConfig {
  id: string
  name: string
  health: number
  damage: number
  speed: number
  attackRange: number
  attackSpeed: number
  isFlying: boolean
  isExplosive: boolean
  explosionDamage?: number
  explosionRadius?: number
  reward: number
  color: string
  size: number
}

export interface WaveConfig {
  waveNumber: number
  zombies: { type: string; count: number; delay?: number }[]
  reward: number
}

export interface Building {
  id: string
  configId: string
  level: number
  position: Position
  health: number
  maxHealth: number
  lastProductionTime: number
  isDestroyed: boolean
}

export interface Soldier {
  id: string
  configId: string
  position: Position
  health: number
  maxHealth: number
  target: Zombie | null
  lastAttackTime: number
  isFighting: boolean
}

export interface Zombie {
  id: string
  configId: string
  position: Position
  health: number
  maxHealth: number
  target: Soldier | Building | null
  lastAttackTime: number
  isFighting: boolean
}

export interface GameState {
  difficulty: string
  resources: number
  baseHealth: number
  maxBaseHealth: number
  currentWave: number
  isWaveActive: boolean
  waveTimer: number
  isGameOver: boolean
  isVictory: boolean
  isPaused: boolean
  isStarted: boolean
  buildings: Building[]
  soldiers: Soldier[]
  zombies: Zombie[]
  selectedBuilding: Building | null
  buildMode: string | null
  score: number
}
