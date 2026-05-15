import type { TowerConfig, TowerInstance, Position, EnemyInstance, TargetStrategy } from '../types';
import { TOWER_CONFIGS } from '../config/towers';
import { generateId, distance } from '../utils/math';

export class Tower implements TowerInstance {
  id: string;
  type: string;
  level: number;
  position: Position;
  gridPos: Position;
  lastAttackTime: number;
  target: EnemyInstance | null;
  config: TowerConfig;

  constructor(type: string, gridPos: Position, cellSize: number) {
    this.config = TOWER_CONFIGS[type];
    this.id = generateId();
    this.type = type;
    this.level = 0;
    this.gridPos = gridPos;
    this.position = {
      x: gridPos.x * cellSize + cellSize / 2,
      y: gridPos.y * cellSize + cellSize / 2
    };
    this.lastAttackTime = 0;
    this.target = null;
  }

  getDamage(): number {
    return this.config.damage[this.level];
  }

  getRange(): number {
    return this.config.range[this.level];
  }

  getAttackSpeed(): number {
    return this.config.attackSpeed[this.level];
  }

  getUpgradeCost(): number | null {
    if (this.level >= this.config.levels - 1) {
      return null;
    }
    return this.config.upgradeCost[this.level];
  }

  getSellValue(): number {
    let totalCost = this.config.cost;
    for (let i = 0; i < this.level; i++) {
      totalCost += this.config.upgradeCost[i];
    }
    return Math.floor(totalCost * 0.7);
  }

  upgrade(): boolean {
    if (this.level >= this.config.levels - 1) {
      return false;
    }
    this.level++;
    return true;
  }

  canAttack(enemy: EnemyInstance): boolean {
    if (!enemy.isAlive) {
      return false;
    }
    if (enemy.isFlying && !this.config.canHitFlying) {
      return false;
    }
    const dist = distance(this.position, enemy.position);
    return dist <= this.getRange();
  }

  selectTarget(enemies: EnemyInstance[]): EnemyInstance | null {
    const attackableEnemies = enemies.filter(e => this.canAttack(e));
    if (attackableEnemies.length === 0) {
      return null;
    }

    const strategy: TargetStrategy = this.config.strategy;
    
    switch (strategy) {
      case 'nearest':
        return attackableEnemies.reduce((nearest, current) => {
          const distCurrent = distance(this.position, current.position);
          const distNearest = distance(this.position, nearest.position);
          return distCurrent < distNearest ? current : nearest;
        });
      case 'farthest':
        return attackableEnemies.reduce((farthest, current) => {
          const distCurrent = distance(this.position, current.position);
          const distFarthest = distance(this.position, farthest.position);
          return distCurrent > distFarthest ? current : farthest;
        });
      case 'lowestHp':
        return attackableEnemies.reduce((lowest, current) => {
          return current.hp < lowest.hp ? current : lowest;
        });
      case 'highestHp':
        return attackableEnemies.reduce((highest, current) => {
          return current.hp > highest.hp ? current : highest;
        });
      default:
        return attackableEnemies[0];
    }
  }

  canAttackNow(currentTime: number): boolean {
    return currentTime - this.lastAttackTime >= this.getAttackSpeed();
  }

  updateAttackTime(currentTime: number): void {
    this.lastAttackTime = currentTime;
  }
}
