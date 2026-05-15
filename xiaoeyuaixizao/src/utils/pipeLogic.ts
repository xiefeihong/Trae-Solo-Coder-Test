import { Direction, PipeType, CellConnections, Position, Cell, WaterQuality, CellType } from '@/types/game'

export function getBaseConnections(pipeType: PipeType): CellConnections {
  switch (pipeType) {
    case PipeType.STRAIGHT:
      return { [Direction.TOP]: true, [Direction.RIGHT]: false, [Direction.BOTTOM]: true, [Direction.LEFT]: false }
    case PipeType.CORNER:
      return { [Direction.TOP]: true, [Direction.RIGHT]: true, [Direction.BOTTOM]: false, [Direction.LEFT]: false }
    case PipeType.CROSS:
      return { [Direction.TOP]: true, [Direction.RIGHT]: true, [Direction.BOTTOM]: true, [Direction.LEFT]: true }
    case PipeType.T_SHAPE:
      return { [Direction.TOP]: true, [Direction.RIGHT]: true, [Direction.BOTTOM]: false, [Direction.LEFT]: true }
    case PipeType.SOURCE:
      return { [Direction.TOP]: true, [Direction.RIGHT]: true, [Direction.BOTTOM]: true, [Direction.LEFT]: true }
    case PipeType.BATHTUB:
      return { [Direction.TOP]: true, [Direction.RIGHT]: true, [Direction.BOTTOM]: true, [Direction.LEFT]: true }
    default:
      return { [Direction.TOP]: false, [Direction.RIGHT]: false, [Direction.BOTTOM]: false, [Direction.LEFT]: false }
  }
}

export function rotateConnections(connections: CellConnections, rotation: number): CellConnections {
  const steps = (rotation / 90) % 4
  const dirs = [Direction.TOP, Direction.RIGHT, Direction.BOTTOM, Direction.LEFT]
  const result: CellConnections = { ...connections }
  
  for (let i = 0; i < 4; i++) {
    const newIndex = (i + steps) % 4
    result[dirs[newIndex]] = connections[dirs[i]]
  }
  
  return result
}

export function getConnections(pipeType: PipeType, rotation: number): CellConnections {
  const base = getBaseConnections(pipeType)
  return rotateConnections(base, rotation)
}

export function getOppositeDirection(dir: Direction): Direction {
  return (dir + 2) % 4
}

export function getNeighborPosition(pos: Position, dir: Direction): Position {
  const delta = {
    [Direction.TOP]: { row: -1, col: 0 },
    [Direction.RIGHT]: { row: 0, col: 1 },
    [Direction.BOTTOM]: { row: 1, col: 0 },
    [Direction.LEFT]: { row: 0, col: -1 }
  }
  return { row: pos.row + delta[dir].row, col: pos.col + delta[dir].col }
}

export function isInBounds(pos: Position, rows: number, cols: number): boolean {
  return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols
}

export function canConnect(cell1: Cell, cell2: Cell, dir1to2: Direction): boolean {
  const dir2to1 = getOppositeDirection(dir1to2)
  
  const conn1 = cell1.pipe ? getConnections(cell1.pipe.type, cell1.pipe.rotation) : null
  const conn2 = cell2.pipe ? getConnections(cell2.pipe.type, cell2.pipe.rotation) : null
  
  if (!conn1 || !conn2) return false
  
  if (cell1.type === CellType.VALVE && !cell1.isValveOpen) return false
  if (cell2.type === CellType.VALVE && !cell2.isValveOpen) return false
  
  return conn1[dir1to2] && conn2[dir2to1]
}

interface WaterFlowResult {
  filledCells: Map<string, WaterQuality>
  reachedBathtub: boolean
  waterQuality: WaterQuality
}

export function simulateWaterFlow(grid: Cell[][], sourcePositions: Position[]): WaterFlowResult {
  const rows = grid.length
  const cols = grid[0].length
  const filledCells = new Map<string, WaterQuality>()
  const visited = new Set<string>()
  const queue: { pos: Position; quality: WaterQuality }[] = []
  let reachedBathtub = false
  let finalQuality = WaterQuality.PURE

  for (const source of sourcePositions) {
    const key = `${source.row},${source.col}`
    filledCells.set(key, WaterQuality.PURE)
    visited.add(key)
    queue.push({ pos: source, quality: WaterQuality.PURE })
  }

  const dirs = [Direction.TOP, Direction.RIGHT, Direction.BOTTOM, Direction.LEFT]

  while (queue.length > 0) {
    const { pos, quality } = queue.shift()!
    const cell = grid[pos.row][pos.col]

    let currentQuality = quality

    if (cell.type === CellType.SEWAGE) {
      currentQuality = WaterQuality.DIRTY
    } else if (cell.type === CellType.SOAP) {
      currentQuality = WaterQuality.SOAPY
    } else if (cell.type === CellType.PURIFIER) {
      currentQuality = WaterQuality.PURE
    }

    if (cell.type === CellType.SPONGE) {
      continue
    }

    if (cell.type === CellType.BATHTUB) {
      reachedBathtub = true
      finalQuality = currentQuality
    }

    const key = `${pos.row},${pos.col}`
    filledCells.set(key, currentQuality)

    if (!cell.pipe) continue

    const connections = getConnections(cell.pipe.type, cell.pipe.rotation)

    for (const dir of dirs) {
      if (!connections[dir]) continue

      const neighborPos = getNeighborPosition(pos, dir)

      if (!isInBounds(neighborPos, rows, cols)) continue

      const neighborKey = `${neighborPos.row},${neighborPos.col}`
      if (visited.has(neighborKey)) continue

      const neighbor = grid[neighborPos.row][neighborPos.col]

      if (neighbor.type === CellType.WALL) continue
      if (neighbor.type === CellType.DIRT && !neighbor.isCleared) continue

      if (!canConnect(cell, neighbor, dir)) continue

      visited.add(neighborKey)
      queue.push({ pos: neighborPos, quality: currentQuality })
    }
  }

  return { filledCells, reachedBathtub, waterQuality: finalQuality }
}

export function deepCopyGrid(grid: Cell[][]): Cell[][] {
  return grid.map(row => row.map(cell => ({
    ...cell,
    pipe: cell.pipe ? { ...cell.pipe } : undefined,
    water: cell.water ? { ...cell.water } : undefined
  })))
}

export function countUsedPipes(grid: Cell[][]): number {
  let count = 0
  for (const row of grid) {
    for (const cell of row) {
      if (cell.pipe && !cell.pipe.isFixed) {
        count++
      }
    }
  }
  return count
}
