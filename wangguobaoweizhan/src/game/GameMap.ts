import type { MapConfig, Position, TerrainType } from '../types';

export class GameMap {
  config: MapConfig;
  width: number;
  height: number;
  cellSize: number;
  terrain: TerrainType[][];
  path: Position[];
  startPoint: Position;
  endPoint: Position;

  constructor(config: MapConfig) {
    this.config = config;
    this.width = config.width;
    this.height = config.height;
    this.cellSize = config.cellSize;
    this.terrain = config.terrain;
    this.path = config.path.map(p => ({
      x: p.x * config.cellSize + config.cellSize / 2,
      y: p.y * config.cellSize + config.cellSize / 2
    }));
    this.startPoint = {
      x: config.startPoint.x * config.cellSize + config.cellSize / 2,
      y: config.startPoint.y * config.cellSize + config.cellSize / 2
    };
    this.endPoint = {
      x: config.endPoint.x * config.cellSize + config.cellSize / 2,
      y: config.endPoint.y * config.cellSize + config.cellSize / 2
    };
  }

  getPixelSize(): { width: number; height: number } {
    return {
      width: this.width * this.cellSize,
      height: this.height * this.cellSize
    };
  }

  getGridPosition(pixelPos: Position): Position {
    return {
      x: Math.floor(pixelPos.x / this.cellSize),
      y: Math.floor(pixelPos.y / this.cellSize)
    };
  }

  getPixelPosition(gridPos: Position): Position {
    return {
      x: gridPos.x * this.cellSize + this.cellSize / 2,
      y: gridPos.y * this.cellSize + this.cellSize / 2
    };
  }

  canBuildAt(gridPos: Position): boolean {
    if (gridPos.x < 0 || gridPos.x >= this.width || gridPos.y < 0 || gridPos.y >= this.height) {
      return false;
    }
    return this.terrain[gridPos.y][gridPos.x] === 'buildable';
  }

  isPositionOnMap(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width * this.cellSize &&
           pos.y >= 0 && pos.y < this.height * this.cellSize;
  }
}
