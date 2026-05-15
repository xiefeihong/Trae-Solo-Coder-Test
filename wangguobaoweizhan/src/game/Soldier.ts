import type { Soldier as SoldierType, Position, EnemyInstance } from '../types';
import { generateId, distance } from '../utils/math';

export class Soldier implements SoldierType {
  id: string;
  position: Position;
  hp: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  attackSpeed: number;
  lastAttackTime: number;
  towerId: string;
  target: EnemyInstance | null;
  isAlive: boolean;
  respawnTime: number;
  isRespawning: boolean;
  spawnPosition: Position;

  constructor(towerId: string, spawnPosition: Position, level: number) {
    this.id = generateId();
    this.towerId = towerId;
    this.spawnPosition = { ...spawnPosition };
    this.position = {
      x: spawnPosition.x + (Math.random() - 0.5) * 40,
      y: spawnPosition.y + (Math.random() - 0.5) * 40
    };
    this.maxHp = 50 + level * 25;
    this.hp = this.maxHp;
    this.damage = 10 + level * 8;
    this.attackRange = 35;
    this.attackSpeed = 1000;
    this.lastAttackTime = 0;
    this.target = null;
    this.isAlive = true;
    this.respawnTime = 5000;
    this.isRespawning = false;
  }

  update(deltaTime: number, enemies: EnemyInstance[], currentTime: number): void {
    if (!this.isAlive) {
      return;
    }

    this.target = this.selectTarget(enemies);
    
    if (this.target) {
      const dist = distance(this.position, this.target.position);
      if (dist > this.attackRange) {
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const moveSpeed = 0.08 * deltaTime;
        this.position.x += (dx / dist) * moveSpeed;
        this.position.y += (dy / dist) * moveSpeed;
      } else if (currentTime - this.lastAttackTime >= this.attackSpeed) {
        this.attack(this.target);
        this.lastAttackTime = currentTime;
      }
    }
  }

  selectTarget(enemies: EnemyInstance[]): EnemyInstance | null {
    const attackableEnemies = enemies.filter(e => 
      e.isAlive && !e.isFlying && distance(this.position, e.position) <= 100
    );
    
    if (attackableEnemies.length === 0) {
      return null;
    }

    return attackableEnemies.reduce((nearest, current) => {
      const distCurrent = distance(this.position, current.position);
      const distNearest = distance(this.position, nearest.position);
      return distCurrent < distNearest ? current : nearest;
    });
  }

  attack(enemy: EnemyInstance): number {
    return enemy.takeDamage(this.damage);
  }

  takeDamage(damage: number): void {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isAlive = false;
      this.isRespawning = true;
    }
  }

  respawn(): void {
    this.isAlive = true;
    this.isRespawning = false;
    this.hp = this.maxHp;
    this.position = {
      x: this.spawnPosition.x + (Math.random() - 0.5) * 40,
      y: this.spawnPosition.y + (Math.random() - 0.5) * 40
    };
  }
}
