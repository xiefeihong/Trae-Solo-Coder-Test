import type { EnemyConfig, EnemyInstance, Position } from '../types';
import { ENEMY_CONFIGS } from '../config/enemies';
import { generateId, lerp } from '../utils/math';

export class Enemy implements EnemyInstance {
  id: string;
  type: string;
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
  config: EnemyConfig;

  constructor(type: string, startPos: Position) {
    this.config = ENEMY_CONFIGS[type];
    this.id = generateId();
    this.type = type;
    this.hp = this.config.hp;
    this.maxHp = this.config.hp;
    this.speed = this.config.speed;
    this.reward = this.config.reward;
    this.armor = this.config.armor;
    this.position = { ...startPos };
    this.pathIndex = 0;
    this.pathProgress = 0;
    this.isFlying = this.config.isFlying;
    this.isAlive = true;
  }

  update(deltaTime: number, path: Position[]): boolean {
    if (!this.isAlive || this.pathIndex >= path.length - 1) {
      return this.pathIndex >= path.length - 1;
    }

    const currentPoint = path[this.pathIndex];
    const nextPoint = path[this.pathIndex + 1];
    
    const segmentLength = Math.sqrt(
      Math.pow(nextPoint.x - currentPoint.x, 2) + 
      Math.pow(nextPoint.y - currentPoint.y, 2)
    );
    
    const moveDistance = this.speed * deltaTime * 0.05;
    this.pathProgress += moveDistance / segmentLength;

    if (this.pathProgress >= 1) {
      this.pathProgress = 0;
      this.pathIndex++;
    }

    if (this.pathIndex < path.length - 1) {
      this.position = lerp(currentPoint, nextPoint, this.pathProgress);
    }

    return false;
  }

  takeDamage(damage: number): number {
    const actualDamage = Math.max(1, damage - this.armor);
    this.hp -= actualDamage;
    if (this.hp <= 0) {
      this.isAlive = false;
      return this.reward;
    }
    return 0;
  }
}
