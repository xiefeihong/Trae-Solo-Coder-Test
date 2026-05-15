export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  LAVA = 2,
  WATER = 3,
  FIRE_GEM = 4,
  ICE_GEM = 5,
  FIRE_PORTAL = 6,
  ICE_PORTAL = 7,
  ROCK = 8,
  PRESSURE_PLATE = 9,
  DOOR = 10,
  WALL = 11
}

export enum PlayerType {
  FIRE = 'fire',
  ICE = 'ice'
}

export interface Position {
  x: number
  y: number
}

export interface Player {
  type: PlayerType
  position: Position
  gems: number
  isAlive: boolean
  atPortal: boolean
}

export interface GameState {
  players: {
    fire: Player
    ice: Player
  }
  currentLevel: number
  map: number[][]
  collectedGems: Position[]
  activatedPlates: Position[]
  openedDoors: Position[]
  gameStatus: 'playing' | 'won' | 'lost' | 'complete'
  currentPlayer: PlayerType
  controlMode: 'single' | 'dual'
  steps: number
}

export interface Level {
  name: string
  map: number[][]
  fireStart: Position
  iceStart: Position
  totalFireGems: number
  totalIceGems: number
}
