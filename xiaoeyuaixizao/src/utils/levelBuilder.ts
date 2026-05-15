import { Cell, CellType, PipeType, CellConnections } from '@/types/game'

export function createEmptyCell(): Cell {
  return {
    type: CellType.EMPTY
  }
}

export function createWallCell(): Cell {
  return {
    type: CellType.WALL
  }
}

export function createDirtCell(): Cell {
  return {
    type: CellType.DIRT,
    isCleared: false
  }
}

export function createSourceCell(): Cell {
  return {
    type: CellType.SOURCE,
    pipe: {
      type: PipeType.SOURCE,
      rotation: 0,
      connections: { 0: true, 1: true, 2: true, 3: true } as CellConnections,
      isFixed: true
    }
  }
}

export function createBathtubCell(): Cell {
  return {
    type: CellType.BATHTUB,
    pipe: {
      type: PipeType.BATHTUB,
      rotation: 0,
      connections: { 0: true, 1: true, 2: true, 3: true } as CellConnections,
      isFixed: true
    }
  }
}

export function createPurifierCell(): Cell {
  return {
    type: CellType.PURIFIER,
    pipe: {
      type: PipeType.STRAIGHT,
      rotation: 0,
      connections: { 0: true, 1: false, 2: true, 3: false } as CellConnections,
      isFixed: true
    }
  }
}

export function createSewageCell(): Cell {
  return {
    type: CellType.SEWAGE
  }
}

export function createSoapCell(): Cell {
  return {
    type: CellType.SOAP
  }
}

export function createSpongeCell(): Cell {
  return {
    type: CellType.SPONGE
  }
}

export function createValveCell(isOpen: boolean = false): Cell {
  return {
    type: CellType.VALVE,
    isValveOpen: isOpen,
    pipe: {
      type: PipeType.STRAIGHT,
      rotation: 0,
      connections: { 0: true, 1: false, 2: true, 3: false } as CellConnections,
      isFixed: true
    }
  }
}
