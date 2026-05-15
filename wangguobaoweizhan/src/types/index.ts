export type TowerType = 'arrow' | 'barracks' | 'magic' | 'cannon';
export type EnemyType = 'goblin' | 'orc' | 'troll' | 'flying';
export type TerrainType = 'grass' | 'road' | 'water' | 'buildable';
export type TargetStrategy = 'nearest' | 'farthest' | 'lowestHp' | 'highestHp';
export type GameState = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface Position {
  x: number;
  y: number;
}

export interface TowerConfig {
  type: TowerType;
  name: string;
  cost: number;
  damage: number[];
  range: number[];
  attackSpeed: number[];
  levels: number;
  upgradeCost: number[];
  canHitFlying: boolean;
  strategy: TargetStrategy;
  color: string;
}

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  hp: number;
  speed: number;
  reward: number;
  isFlying: boolean;
  armor: number;
  color: string;
}

export interface MapConfig {
  name: string;
  width: number;
  height: number;
  cellSize: number;
  terrain: TerrainType[][];
  path: Position[];
  startPoint: Position;
  endPoint: Position;
}

export interface WaveEnemy {
  type: EnemyType;
  count: number;
  delay: number;
}

export interface WaveConfig {
  enemies: WaveEnemy[];
  reward: number;
}

export interface TowerInstance {
  id: string;
  type: TowerType;
  level: number;
  position: Position;
  gridPos: Position;
  lastAttackTime: number;
  target: EnemyInstance | null;
}

export interface EnemyInstance {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  armor: number;
  position: Position;
  pathIndex: number;
  pathProgress: number;
  isFlying: boolean;
  isAlive: boolean;
}

export interface Projectile {
  id: string;
  from: Position;
  to: Position;
  targetId: string;
  damage: number;
  speed: number;
  isAoe: boolean;
  aoeRadius: number;
  color: string;
  progress: number;
}

export interface Soldier {
  id: string;
  position: Position;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackSpeed: number;
  lastAttackTime: number;
  towerId: string;
  target: EnemyInstance | null;
  isAlive: boolean;
  respawnTime: number;
  isRespawning: boolean;
}

export interface Hero {
  position: Position;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackSpeed: number;
  lastAttackTime: number;
  target: EnemyInstance | null;
  isAutoAttack: boolean;
}
