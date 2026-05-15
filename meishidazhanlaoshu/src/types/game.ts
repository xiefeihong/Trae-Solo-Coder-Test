export interface Position {
  x: number
  y: number
}

export interface FoodConfig {
  id: string
  name: string
  cost: number
  hp: number
  damage: number
  attackSpeed: number
  range: number
  cooldown: number
  description: string
  color: string
  type: FoodType
  special?: FoodSpecial
}

export type FoodType = 'shooter' | 'trap' | 'aoe' | 'shield' | 'lobber' | 'freeze' | 'producer' | 'bomb'
export type FoodSpecial = 'slow' | 'splash' | 'freeze' | 'produce' | 'block' | 'explode' | 'canHitFlying' | 'canHitUnderground'

export interface MouseConfig {
  id: string
  name: string
  hp: number
  maxHp: number
  speed: number
  damage: number
  reward: number
  color: string
  type: MouseType
  special?: MouseSpecial
}

export type MouseType = 'normal' | 'tank' | 'fast' | 'flying' | 'underground' | 'boss' | 'exploder'
export type MouseSpecial = 'armor' | 'fast' | 'flying' | 'underground' | 'boss' | 'explode'

export interface FoodInstance {
  id: string
  configId: string
  position: Position
  gridPos: Position
  hp: number
  maxHp: number
  lastAttackTime: number
  level: number
  isExploding?: boolean
  explodeTime?: number
}

export interface MouseInstance {
  id: string
  configId: string
  position: Position
  gridRow: number
  hp: number
  maxHp: number
  speed: number
  isFrozen: boolean
  frozenTime: number
  slowFactor: number
  slowTime: number
  isDead: boolean
}

export interface Projectile {
  id: string
  position: Position
  targetId: string
  damage: number
  speed: number
  color: string
  isAoe?: boolean
  aoeRadius?: number
  canHitFlying?: boolean
  canHitUnderground?: boolean
}

export interface LevelConfig {
  id: number
  name: string
  gridRows: number
  gridCols: number
  startStars: number
  waves: WaveConfig[]
  terrain: number[][]
}

export interface WaveConfig {
  delay: number
  mouses: WaveMouseConfig[]
}

export interface WaveMouseConfig {
  configId: string
  count: number
  interval: number
  row?: number
}

export type TerrainType = 0 | 1 | 2
export const TERRAIN_GRASS = 0
export const TERRAIN_ROAD = 1
export const TERRAIN_WATER = 2

export interface GameState {
  stars: number
  lives: number
  currentWave: number
  totalWaves: number
  isPlaying: boolean
  isPaused: boolean
  isGameOver: boolean
  isVictory: boolean
  selectedCard: string | null
}
