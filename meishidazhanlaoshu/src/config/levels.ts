import type { LevelConfig, TERRAIN_GRASS } from '../types/game'

const GRASS = 0 as typeof TERRAIN_GRASS

const createTerrain = (rows: number, cols: number): number[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill(GRASS))
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '第一关：新手教程',
    gridRows: 5,
    gridCols: 9,
    startStars: 450,
    terrain: createTerrain(5, 9),
    waves: [
      {
        delay: 5000,
        mouses: [
          { configId: 'normal', count: 3, interval: 3000, row: 2 }
        ]
      },
      {
        delay: 7000,
        mouses: [
          { configId: 'normal', count: 2, interval: 2500, row: 1 },
          { configId: 'normal', count: 2, interval: 2500, row: 3 }
        ]
      },
      {
        delay: 7000,
        mouses: [
          { configId: 'normal', count: 2, interval: 2500, row: 0 },
          { configId: 'normal', count: 2, interval: 2500, row: 2 },
          { configId: 'normal', count: 2, interval: 2500, row: 4 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '第二关：速度挑战',
    gridRows: 5,
    gridCols: 9,
    startStars: 350,
    terrain: createTerrain(5, 9),
    waves: [
      {
        delay: 3000,
        mouses: [
          { configId: 'normal', count: 6, interval: 1500 }
        ]
      },
      {
        delay: 4000,
        mouses: [
          { configId: 'fast', count: 8, interval: 1000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'normal', count: 5, interval: 1500 },
          { configId: 'fast', count: 5, interval: 1000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'tank', count: 3, interval: 3000 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '第三关：空中威胁',
    gridRows: 5,
    gridCols: 9,
    startStars: 400,
    terrain: createTerrain(5, 9),
    waves: [
      {
        delay: 3000,
        mouses: [
          { configId: 'normal', count: 8, interval: 1500 }
        ]
      },
      {
        delay: 4000,
        mouses: [
          { configId: 'flying', count: 6, interval: 2000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'normal', count: 5, interval: 1500 },
          { configId: 'flying', count: 4, interval: 2000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'tank', count: 2, interval: 3000 },
          { configId: 'flying', count: 5, interval: 1500 }
        ]
      }
    ]
  },
  {
    id: 4,
    name: '第四关：地下袭击',
    gridRows: 5,
    gridCols: 9,
    startStars: 400,
    terrain: createTerrain(5, 9),
    waves: [
      {
        delay: 3000,
        mouses: [
          { configId: 'normal', count: 10, interval: 1200 }
        ]
      },
      {
        delay: 4000,
        mouses: [
          { configId: 'underground', count: 6, interval: 2000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'fast', count: 8, interval: 1000 },
          { configId: 'underground', count: 4, interval: 2000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'tank', count: 3, interval: 2500 },
          { configId: 'underground', count: 5, interval: 1800 }
        ]
      }
    ]
  },
  {
    id: 5,
    name: '第五关：BOSS战',
    gridRows: 5,
    gridCols: 9,
    startStars: 500,
    terrain: createTerrain(5, 9),
    waves: [
      {
        delay: 3000,
        mouses: [
          { configId: 'normal', count: 10, interval: 1200 },
          { configId: 'fast', count: 5, interval: 1000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'tank', count: 4, interval: 2500 },
          { configId: 'flying', count: 5, interval: 2000 }
        ]
      },
      {
        delay: 5000,
        mouses: [
          { configId: 'exploder', count: 6, interval: 1500 },
          { configId: 'underground', count: 4, interval: 2000 }
        ]
      },
      {
        delay: 8000,
        mouses: [
          { configId: 'boss', count: 1, interval: 0, row: 2 }
        ]
      }
    ]
  }
]

export const getLevelConfig = (id: number): LevelConfig | undefined => {
  return LEVELS.find(l => l.id === id)
}
