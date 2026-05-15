import type { MapConfig, TerrainType } from '../types';

const createTerrain = (width: number, height: number, pathCells: [number, number][]): TerrainType[][] => {
  const terrain: TerrainType[][] = [];
  for (let y = 0; y < height; y++) {
    terrain[y] = [];
    for (let x = 0; x < width; x++) {
      terrain[y][x] = 'grass';
    }
  }
  
  pathCells.forEach(([x, y]) => {
    if (terrain[y] && terrain[y][x] !== undefined) {
      terrain[y][x] = 'road';
    }
  });
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (terrain[y][x] === 'grass') {
        const hasRoadNeighbor = [
          [x-1, y], [x+1, y], [x, y-1], [x, y+1]
        ].some(([nx, ny]) => 
          nx >= 0 && nx < width && ny >= 0 && ny < height && terrain[ny][nx] === 'road'
        );
        if (hasRoadNeighbor) {
          terrain[y][x] = 'buildable';
        }
      }
    }
  }
  
  return terrain;
};

const pathCells1: [number, number][] = [
  [0, 7], [1, 7], [2, 7], [3, 7], [4, 7],
  [4, 6], [4, 5], [4, 4], [4, 3],
  [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3],
  [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9],
  [11, 9], [12, 9], [13, 9], [14, 9],
  [14, 8], [14, 7], [14, 6], [14, 5],
  [15, 5], [16, 5], [17, 5], [18, 5], [19, 5]
];

export const MAP_CONFIGS: MapConfig[] = [
  {
    name: '森林小径',
    width: 20,
    height: 15,
    cellSize: 40,
    terrain: createTerrain(20, 15, pathCells1),
    path: [
      { x: 0, y: 7 },
      { x: 4, y: 7 },
      { x: 4, y: 3 },
      { x: 10, y: 3 },
      { x: 10, y: 9 },
      { x: 14, y: 9 },
      { x: 14, y: 5 },
      { x: 19, y: 5 }
    ],
    startPoint: { x: 0, y: 7 },
    endPoint: { x: 19, y: 5 }
  }
];
