import type { Position, GameState } from '../types';
import { GameMap } from './GameMap';
import { Enemy } from './Enemy';
import { Tower } from './Tower';
import { Projectile } from './Projectile';
import { Soldier } from './Soldier';
import { MAP_CONFIGS } from '../config/maps';
import { WAVE_CONFIGS } from '../config/waves';
import { TOWER_CONFIGS } from '../config/towers';
import { distance } from '../utils/math';

export class GameEngine {
  map: GameMap;
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  soldiers: Soldier[];
  gold: number;
  lives: number;
  currentWave: number;
  gameState: GameState;
  waveInProgress: boolean;
  spawnQueue: { type: string; delay: number; spawnTime: number }[];
  currentTime: number;
  gameSpeed: number;
  selectedTower: Tower | null;
  buildMode: string | null;

  constructor() {
    this.map = new GameMap(MAP_CONFIGS[0]);
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.soldiers = [];
    this.gold = 500;
    this.lives = 20;
    this.currentWave = 0;
    this.gameState = 'idle';
    this.waveInProgress = false;
    this.spawnQueue = [];
    this.currentTime = 0;
    this.gameSpeed = 1;
    this.selectedTower = null;
    this.buildMode = null;
  }

  start(): void {
    this.gameState = 'playing';
  }

  pause(): void {
    this.gameState = 'paused';
  }

  resume(): void {
    this.gameState = 'playing';
  }

  reset(): void {
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.soldiers = [];
    this.gold = 500;
    this.lives = 20;
    this.currentWave = 0;
    this.gameState = 'idle';
    this.waveInProgress = false;
    this.spawnQueue = [];
    this.selectedTower = null;
    this.buildMode = null;
  }

  startWave(): boolean {
    if (this.waveInProgress || this.currentWave >= WAVE_CONFIGS.length) {
      return false;
    }

    const waveConfig = WAVE_CONFIGS[this.currentWave];
    let totalDelay = 0;

    waveConfig.enemies.forEach(enemyGroup => {
      for (let i = 0; i < enemyGroup.count; i++) {
        this.spawnQueue.push({
          type: enemyGroup.type,
          delay: enemyGroup.delay,
          spawnTime: this.currentTime + totalDelay
        });
        totalDelay += enemyGroup.delay;
      }
    });

    this.waveInProgress = true;
    this.currentWave++;
    return true;
  }

  spawnEnemy(type: string): void {
    const enemy = new Enemy(type, this.map.startPoint);
    this.enemies.push(enemy);
  }

  buildTower(type: string, gridPos: Position): boolean {
    const config = TOWER_CONFIGS[type];
    if (!config) {
      return false;
    }

    if (this.gold < config.cost) {
      return false;
    }

    if (!this.map.canBuildAt(gridPos)) {
      return false;
    }

    const existingTower = this.towers.find(
      t => t.gridPos.x === gridPos.x && t.gridPos.y === gridPos.y
    );
    if (existingTower) {
      return false;
    }

    const tower = new Tower(type, gridPos, this.map.cellSize);
    this.towers.push(tower);
    this.gold -= config.cost;

    if (type === 'barracks') {
      this.spawnSoldiers(tower);
    }

    return true;
  }

  spawnSoldiers(tower: Tower): void {
    const soldierCount = 2 + tower.level;
    for (let i = 0; i < soldierCount; i++) {
      const soldier = new Soldier(tower.id, tower.position, tower.level);
      this.soldiers.push(soldier);
    }
  }

  upgradeTower(towerId: string): boolean {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) {
      return false;
    }

    const upgradeCost = tower.getUpgradeCost();
    if (upgradeCost === null || this.gold < upgradeCost) {
      return false;
    }

    this.gold -= upgradeCost;
    tower.upgrade();

    if (tower.type === 'barracks') {
      this.soldiers = this.soldiers.filter(s => s.towerId !== towerId);
      this.spawnSoldiers(tower);
    }

    return true;
  }

  sellTower(towerId: string): boolean {
    const towerIndex = this.towers.findIndex(t => t.id === towerId);
    if (towerIndex === -1) {
      return false;
    }

    const tower = this.towers[towerIndex];
    this.gold += tower.getSellValue();
    this.towers.splice(towerIndex, 1);

    this.soldiers = this.soldiers.filter(s => s.towerId !== towerId);

    if (this.selectedTower?.id === towerId) {
      this.selectedTower = null;
    }

    return true;
  }

  update(deltaTime: number): void {
    if (this.gameState !== 'playing') {
      return;
    }

    const adjustedDelta = deltaTime * this.gameSpeed;
    this.currentTime += adjustedDelta;

    this.processSpawnQueue();
    this.updateEnemies(adjustedDelta);
    this.updateTowers();
    this.updateProjectiles(adjustedDelta);
    this.updateSoldiers(adjustedDelta);
    this.checkWaveComplete();
    this.checkGameOver();
  }

  processSpawnQueue(): void {
    const toSpawn = this.spawnQueue.filter(sq => sq.spawnTime <= this.currentTime);
    toSpawn.forEach(sq => {
      this.spawnEnemy(sq.type);
      const index = this.spawnQueue.indexOf(sq);
      if (index > -1) {
        this.spawnQueue.splice(index, 1);
      }
    });
  }

  updateEnemies(deltaTime: number): void {
    const enemiesReachedEnd: Enemy[] = [];
    const deadEnemies: Enemy[] = [];

    this.enemies.forEach(enemy => {
      const reachedEnd = enemy.update(deltaTime, this.map.path);
      if (reachedEnd) {
        enemiesReachedEnd.push(enemy);
      } else if (!enemy.isAlive) {
        deadEnemies.push(enemy);
      }
    });

    enemiesReachedEnd.forEach(enemy => {
      this.lives--;
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
    });

    deadEnemies.forEach(enemy => {
      this.gold += enemy.reward;
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
    });
  }

  updateTowers(): void {
    this.towers.forEach(tower => {
      if (tower.type === 'barracks') {
        return;
      }

      const target = tower.selectTarget(this.enemies);
      tower.target = target;

      if (target && tower.canAttackNow(this.currentTime)) {
        this.fireProjectile(tower, target);
        tower.updateAttackTime(this.currentTime);
      }
    });
  }

  fireProjectile(tower: Tower, target: Enemy): void {
    const isAoe = tower.type === 'cannon';
    const aoeRadius = isAoe ? 60 : 0;
    const speed = tower.type === 'arrow' ? 0.015 : 0.01;

    const projectile = new Projectile(
      tower.position,
      target.id,
      target.position,
      tower.getDamage(),
      tower.config.color,
      isAoe,
      aoeRadius,
      speed
    );

    this.projectiles.push(projectile);
  }

  updateProjectiles(deltaTime: number): void {
    const projectilesToRemove: Projectile[] = [];

    this.projectiles.forEach(projectile => {
      const target = this.enemies.find(e => e.id === projectile.targetId);
      if (target) {
        projectile.updateTargetPosition(target.position);
      }

      const reached = projectile.update(deltaTime);
      if (reached) {
        projectilesToRemove.push(projectile);

        if (projectile.isAoe) {
          this.enemies.forEach(enemy => {
            const dist = distance(projectile.position, enemy.position);
            if (dist <= projectile.aoeRadius) {
              const reward = enemy.takeDamage(projectile.damage);
              if (reward > 0) {
                this.gold += reward;
              }
            }
          });
        } else if (target) {
          const reward = target.takeDamage(projectile.damage);
          if (reward > 0) {
            this.gold += reward;
          }
        }
      }
    });

    projectilesToRemove.forEach(p => {
      const index = this.projectiles.indexOf(p);
      if (index > -1) {
        this.projectiles.splice(index, 1);
      }
    });
  }

  updateSoldiers(deltaTime: number): void {
    this.soldiers.forEach(soldier => {
      if (soldier.isAlive) {
        soldier.update(deltaTime, this.enemies, this.currentTime);
      } else if (soldier.isRespawning) {
        const tower = this.towers.find(t => t.id === soldier.towerId);
        if (tower && this.currentTime - soldier.lastAttackTime >= soldier.respawnTime) {
          soldier.respawn();
        }
      }
    });

    this.enemies.forEach(enemy => {
      if (enemy.isFlying) {
        return;
      }
      this.soldiers.forEach(soldier => {
        if (soldier.isAlive && soldier.target?.id === enemy.id) {
          const dist = distance(soldier.position, enemy.position);
          if (dist <= soldier.attackRange) {
            enemy.takeDamage(1);
          }
        }
      });
    });
  }

  checkWaveComplete(): void {
    if (this.waveInProgress && this.enemies.length === 0 && this.spawnQueue.length === 0) {
      this.waveInProgress = false;
      if (this.currentWave > 0 && this.currentWave <= WAVE_CONFIGS.length) {
        this.gold += WAVE_CONFIGS[this.currentWave - 1].reward;
      }

      if (this.currentWave >= WAVE_CONFIGS.length) {
        this.gameState = 'won';
      }
    }
  }

  checkGameOver(): void {
    if (this.lives <= 0) {
      this.gameState = 'lost';
    }
  }

  selectTowerAtPosition(pos: Position): Tower | null {
    const gridPos = this.map.getGridPosition(pos);
    const tower = this.towers.find(
      t => t.gridPos.x === gridPos.x && t.gridPos.y === gridPos.y
    );
    this.selectedTower = tower || null;
    return this.selectedTower;
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderMap(ctx);
    this.renderPath(ctx);
    this.renderTowers(ctx);
    this.renderSoldiers(ctx);
    this.renderEnemies(ctx);
    this.renderProjectiles(ctx);
    this.renderSelection(ctx);
    this.renderBuildPreview(ctx);
  }

  renderMap(ctx: CanvasRenderingContext2D): void {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const terrain = this.map.terrain[y][x];
        let color = '#4a7c23';

        switch (terrain) {
          case 'road':
            color = '#8b7355';
            break;
          case 'buildable':
            color = '#6b9b3a';
            break;
          case 'water':
            color = '#4a90d9';
            break;
        }

        ctx.fillStyle = color;
        ctx.fillRect(
          x * this.map.cellSize,
          y * this.map.cellSize,
          this.map.cellSize,
          this.map.cellSize
        );

        if (terrain === 'buildable') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.strokeRect(
            x * this.map.cellSize + 1,
            y * this.map.cellSize + 1,
            this.map.cellSize - 2,
            this.map.cellSize - 2
          );
        }
      }
    }
  }

  renderPath(ctx: CanvasRenderingContext2D): void {
    if (this.map.path.length < 2) {
      return;
    }

    ctx.strokeStyle = 'rgba(139, 115, 85, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.map.path[0].x, this.map.path[0].y);
    for (let i = 1; i < this.map.path.length; i++) {
      ctx.lineTo(this.map.path[i].x, this.map.path[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(this.map.startPoint.x, this.map.startPoint.y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(this.map.endPoint.x, this.map.endPoint.y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', this.map.startPoint.x, this.map.startPoint.y);
    ctx.fillText('E', this.map.endPoint.x, this.map.endPoint.y);
  }

  renderTowers(ctx: CanvasRenderingContext2D): void {
    this.towers.forEach(tower => {
      const size = this.map.cellSize * 0.7;
      
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, size / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = tower.config.color;
      ctx.beginPath();
      ctx.arc(tower.position.x, tower.position.y, size / 2 - 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const towerSymbol = tower.type === 'arrow' ? '↑' :
                          tower.type === 'barracks' ? '⚔' :
                          tower.type === 'magic' ? '✦' : '◉';
      ctx.fillText(towerSymbol, tower.position.x, tower.position.y);

      if (tower.level > 0) {
        ctx.fillStyle = '#f1c40f';
        for (let i = 0; i < tower.level; i++) {
          ctx.beginPath();
          ctx.arc(
            tower.position.x - 8 + i * 8,
            tower.position.y + size / 2 + 6,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      if (this.selectedTower?.id === tower.id) {
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.getRange(), 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  renderSoldiers(ctx: CanvasRenderingContext2D): void {
    this.soldiers.forEach(soldier => {
      if (!soldier.isAlive) {
        return;
      }

      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.arc(soldier.position.x, soldier.position.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.arc(soldier.position.x, soldier.position.y - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      const hpPercent = soldier.hp / soldier.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(soldier.position.x - 8, soldier.position.y - 14, 16, 3);
      ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(soldier.position.x - 8, soldier.position.y - 14, 16 * hpPercent, 3);
    });
  }

  renderEnemies(ctx: CanvasRenderingContext2D): void {
    this.enemies.forEach(enemy => {
      const size = enemy.type === 'troll' ? 18 : enemy.type === 'orc' ? 14 : 10;

      ctx.fillStyle = enemy.config.color;
      if (enemy.isFlying) {
        ctx.beginPath();
        ctx.moveTo(enemy.position.x, enemy.position.y - size);
        ctx.lineTo(enemy.position.x + size, enemy.position.y);
        ctx.lineTo(enemy.position.x, enemy.position.y + size * 0.5);
        ctx.lineTo(enemy.position.x - size, enemy.position.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(enemy.position.x, enemy.position.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      const hpPercent = enemy.hp / enemy.maxHp;
      const barWidth = size * 2;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.position.x - barWidth / 2, enemy.position.y - size - 8, barWidth, 4);
      ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(enemy.position.x - barWidth / 2, enemy.position.y - size - 8, barWidth * hpPercent, 4);
    });
  }

  renderProjectiles(ctx: CanvasRenderingContext2D): void {
    this.projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, projectile.isAoe ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(projectile.from.x, projectile.from.y);
      ctx.lineTo(projectile.position.x, projectile.position.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  renderSelection(ctx: CanvasRenderingContext2D): void {
    if (this.selectedTower) {
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        this.selectedTower.gridPos.x * this.map.cellSize + 2,
        this.selectedTower.gridPos.y * this.map.cellSize + 2,
        this.map.cellSize - 4,
        this.map.cellSize - 4
      );
    }
  }

  renderBuildPreview(ctx: CanvasRenderingContext2D): void {
    if (!this.buildMode) {
      return;
    }

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.terrain[y][x] === 'buildable') {
          const hasTower = this.towers.some(t => t.gridPos.x === x && t.gridPos.y === y);
          if (!hasTower) {
            ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.fillRect(
              x * this.map.cellSize,
              y * this.map.cellSize,
              this.map.cellSize,
              this.map.cellSize
            );
          }
        }
      }
    }
  }

  setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
  }

  getTotalWaves(): number {
    return WAVE_CONFIGS.length;
  }
}
