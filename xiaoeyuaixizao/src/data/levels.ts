import { Level, CellType, PipeType } from '@/types/game'
import { createEmptyCell, createSourceCell, createBathtubCell, createWallCell, createDirtCell } from '@/utils/levelBuilder'

export function createLevels(): Level[] {
  const levels: Level[] = []

  levels.push({
    id: 1,
    name: '初识管道',
    rows: 6,
    cols: 6,
    grid: createLevel1(),
    availablePipes: [PipeType.STRAIGHT, PipeType.CORNER],
    recommendedSteps: 4,
    goals: { minStars: 1, maxPipes: 5, requirePureWater: true },
    sourcePositions: [{ row: 0, col: 0 }],
    bathtubPositions: [{ row: 5, col: 5 }]
  })

  levels.push({
    id: 2,
    name: '绕过障碍',
    rows: 7,
    cols: 7,
    grid: createLevel2(),
    availablePipes: [PipeType.STRAIGHT, PipeType.CORNER],
    recommendedSteps: 6,
    goals: { minStars: 1, maxPipes: 8, requirePureWater: true },
    sourcePositions: [{ row: 0, col: 3 }],
    bathtubPositions: [{ row: 6, col: 3 }]
  })

  levels.push({
    id: 3,
    name: '清除泥土',
    rows: 7,
    cols: 7,
    grid: createLevel3(),
    availablePipes: [PipeType.STRAIGHT, PipeType.CORNER],
    recommendedSteps: 5,
    goals: { minStars: 1, maxPipes: 6, requirePureWater: true },
    sourcePositions: [{ row: 0, col: 0 }],
    bathtubPositions: [{ row: 6, col: 6 }]
  })

  levels.push({
    id: 4,
    name: '十字分流',
    rows: 8,
    cols: 8,
    grid: createLevel4(),
    availablePipes: [PipeType.STRAIGHT, PipeType.CORNER, PipeType.CROSS],
    recommendedSteps: 8,
    goals: { minStars: 1, maxPipes: 10, requirePureWater: true },
    sourcePositions: [{ row: 0, col: 3 }],
    bathtubPositions: [{ row: 7, col: 0 }, { row: 7, col: 6 }]
  })

  levels.push({
    id: 5,
    name: 'T型管道',
    rows: 8,
    cols: 8,
    grid: createLevel5(),
    availablePipes: [PipeType.STRAIGHT, PipeType.CORNER, PipeType.T_SHAPE],
    recommendedSteps: 7,
    goals: { minStars: 1, maxPipes: 9, requirePureWater: true },
    sourcePositions: [{ row: 0, col: 4 }],
    bathtubPositions: [{ row: 7, col: 1 }]
  })

  for (let i = 6; i <= 25; i++) {
    levels.push({
      id: i,
      name: `关卡 ${i}`,
      rows: 8 + Math.floor(i / 5),
      cols: 8 + Math.floor(i / 5),
      grid: createRandomLevel(8 + Math.floor(i / 5), 8 + Math.floor(i / 5)),
      availablePipes: i < 10 
        ? [PipeType.STRAIGHT, PipeType.CORNER, PipeType.CROSS]
        : [PipeType.STRAIGHT, PipeType.CORNER, PipeType.CROSS, PipeType.T_SHAPE],
      recommendedSteps: 5 + i * 2,
      goals: { minStars: 1, maxPipes: 7 + i * 2, requirePureWater: i > 15 },
      sourcePositions: [{ row: 0, col: Math.floor((8 + Math.floor(i / 5)) / 2) }],
      bathtubPositions: [{ row: 8 + Math.floor(i / 5) - 1, col: Math.floor((8 + Math.floor(i / 5)) / 2) }]
    })
  }

  return levels
}

function createLevel1() {
  const grid = Array(6).fill(null).map(() => Array(6).fill(null).map(() => createEmptyCell()))
  grid[0][0] = createSourceCell()
  grid[5][5] = createBathtubCell()
  grid[2][2] = createWallCell()
  grid[2][3] = createWallCell()
  return grid
}

function createLevel2() {
  const grid = Array(7).fill(null).map(() => Array(7).fill(null).map(() => createEmptyCell()))
  grid[0][3] = createSourceCell()
  grid[6][3] = createBathtubCell()
  for (let i = 1; i < 6; i++) {
    grid[i][3] = createWallCell()
  }
  return grid
}

function createLevel3() {
  const grid = Array(7).fill(null).map(() => Array(7).fill(null).map(() => createEmptyCell()))
  grid[0][0] = createSourceCell()
  grid[6][6] = createBathtubCell()
  grid[2][2] = createDirtCell()
  grid[2][3] = createDirtCell()
  grid[3][2] = createDirtCell()
  grid[4][4] = createDirtCell()
  return grid
}

function createLevel4() {
  const grid = Array(8).fill(null).map(() => Array(8).fill(null).map(() => createEmptyCell()))
  grid[0][3] = createSourceCell()
  grid[7][0] = createBathtubCell()
  grid[7][6] = createBathtubCell()
  for (let i = 1; i < 7; i++) {
    grid[i][2] = createWallCell()
    grid[i][5] = createWallCell()
  }
  return grid
}

function createLevel5() {
  const grid = Array(8).fill(null).map(() => Array(8).fill(null).map(() => createEmptyCell()))
  grid[0][4] = createSourceCell()
  grid[7][1] = createBathtubCell()
  for (let i = 0; i < 8; i++) {
    grid[4][i] = createWallCell()
  }
  grid[4][2] = createEmptyCell()
  grid[4][4] = createEmptyCell()
  return grid
}

function createRandomLevel(rows: number, cols: number) {
  const grid = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => createEmptyCell()))
  const midCol = Math.floor(cols / 2)
  grid[0][midCol] = createSourceCell()
  grid[rows - 1][midCol] = createBathtubCell()
  
  const wallCount = Math.floor(rows * cols * 0.15)
  for (let i = 0; i < wallCount; i++) {
    const r = Math.floor(Math.random() * (rows - 2)) + 1
    const c = Math.floor(Math.random() * cols)
    if (grid[r][c].type === CellType.EMPTY) {
      grid[r][c] = createWallCell()
    }
  }
  
  return grid
}
