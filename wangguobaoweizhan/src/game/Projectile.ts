import type { Projectile as ProjectileType, Position } from '../types';
import { generateId, lerp, distance } from '../utils/math';

export class Projectile implements ProjectileType {
  id: string;
  from: Position;
  to: Position;
  targetId: string;
  damage: number;
  speed: number;
  isAoe: boolean;
  aoeRadius: number;
  color: string;
  progress: number;
  position: Position;

  constructor(
    from: Position,
    targetId: string,
    targetPosition: Position,
    damage: number,
    color: string,
    isAoe: boolean = false,
    aoeRadius: number = 0,
    speed: number = 0.01
  ) {
    this.id = generateId();
    this.from = { ...from };
    this.to = { ...targetPosition };
    this.targetId = targetId;
    this.damage = damage;
    this.speed = speed;
    this.isAoe = isAoe;
    this.aoeRadius = aoeRadius;
    this.color = color;
    this.progress = 0;
    this.position = { ...from };
  }

  update(deltaTime: number): boolean {
    this.progress += this.speed * deltaTime;
    if (this.progress >= 1) {
      this.progress = 1;
      this.position = { ...this.to };
      return true;
    }
    this.position = lerp(this.from, this.to, this.progress);
    return false;
  }

  updateTargetPosition(newPosition: Position): void {
    const remainingProgress = 1 - this.progress;
    if (remainingProgress > 0) {
      this.from = { ...this.position };
      this.to = { ...newPosition };
      this.progress = 0;
    }
  }
}
