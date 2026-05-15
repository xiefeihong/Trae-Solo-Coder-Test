export enum CellType {
  EMPTY = 'empty',
  WALL = 'wall',
  DIRT = 'dirt',
  SOURCE = 'source',
  BATHTUB = 'bathtub',
  PIPE = 'pipe',
  PURIFIER = 'purifier',
  SEWAGE = 'sewage',
  SOAP = 'soap',
  SPONGE = 'sponge',
  VALVE = 'valve'
}

export enum PipeType {
  STRAIGHT = 'straight',
  CORNER = 'corner',
  CROSS = 'cross',
  T_SHAPE = 't_shape',
  SOURCE = 'source',
  BATHTUB = 'bathtub'
}

export enum Direction {
  TOP = 0,
  RIGHT = 1,
  BOTTOM = 2,
  LEFT = 3
}

export enum WaterQuality {
  PURE = 'pure',
  DIRTY = 'dirty',
  SOAPY = 'soapy'
}

export interface CellConnections {
  [Direction.TOP]: boolean
  [Direction.RIGHT]: boolean
  [Direction.BOTTOM]: boolean
  [Direction.LEFT]: boolean
}

export interface Pipe {
  type: PipeType
  rotation: number
  connections: CellConnections
  isFixed: boolean
}

export interface WaterCell {
  quality: WaterQuality
  filled: boolean
  fillProgress: number
}

export interface Cell {
  type: CellType
  pipe?: Pipe
  water?: WaterCell
  isValveOpen?: boolean
  isCleared?: boolean
}

export interface Position {
  row: number
  col: number
}

export interface LevelGoal {
  minStars: number
  maxPipes?: number
  maxTime?: number
  requirePureWater?: boolean
}

export interface Level {
  id: number
  name: string
  grid: Cell[][]
  rows: number
  cols: number
  availablePipes: PipeType[]
  recommendedSteps: number
  goals: LevelGoal
  sourcePositions: Position[]
  bathtubPositions: Position[]
}

export interface GameState {
  currentLevel: number
  grid: Cell[][]
  isPlaying: boolean
  isWon: boolean
  steps: number
  startTime: number
  elapsedTime: number
  waterQuality: WaterQuality
  stars: number
  history: Cell[][][]
  historyIndex: number
}

export interface LevelProgress {
  levelId: number
  stars: number
  bestTime: number
  isUnlocked: boolean
}
