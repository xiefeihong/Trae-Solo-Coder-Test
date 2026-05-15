// ==================== 游戏基础配置 ====================
export const GAME_CONFIG = {
  GRID_COLS: 6,           // 网格列数
  GRID_ROWS: 4,           // 网格行数
  CELL_WIDTH: 80,         // 格子宽度(px)
  CELL_HEIGHT: 80,        // 格子高度(px)
  INITIAL_SUN: 150,       // 初始阳光数量
  SUN_FALL_INTERVAL: 8000, // 阳光掉落间隔(ms)
  GAME_LOOP_INTERVAL: 50, // 游戏主循环间隔(ms)
  MAX_WAVES: 5,           // 最大波数
  ZOMBIES_PER_WAVE: 3,    // 每波僵尸基础数量
  ZOMBIE_SPAWN_INTERVAL: 3000 // 僵尸生成间隔
}

// ==================== 植物类型配置 ====================
export const PLANT_TYPES = {
  sunflower: {
    id: 'sunflower',
    name: '向日葵',
    cost: 50,              // 种植消耗阳光
    health: 100,           // 生命值
    sunProduction: 25,     // 每次产生阳光数量
    sunInterval: 7000,     // 产生阳光间隔(ms)
    emoji: '🌻',
    description: '定期产生阳光'
  },
  peashooter: {
    id: 'peashooter',
    name: '豌豆射手',
    cost: 100,             // 种植消耗阳光
    health: 100,           // 生命值
    damage: 20,            // 每次攻击伤害
    attackInterval: 1400,  // 攻击间隔(ms)
    projectileSpeed: 4,    // 子弹飞行速度
    emoji: '🌱',
    description: '发射豌豆攻击僵尸'
  }
}

// ==================== 僵尸类型配置 ====================
export const ZOMBIE_TYPES = {
  normal: {
    id: 'normal',
    name: '普通僵尸',
    health: 100,           // 生命值
    damage: 15,            // 每次攻击伤害
    speed: 0.3,            // 移动速度(px/frame)
    attackInterval: 1000,  // 攻击间隔(ms)
    emoji: '🧟'
  },
  conehead: {
    id: 'conehead',
    name: '路障僵尸',
    health: 200,           // 生命值更高
    damage: 15,            // 每次攻击伤害
    speed: 0.25,           // 移动速度稍慢
    attackInterval: 1000,
    emoji: '🧟‍♂️'
  }
}

// ==================== 阳光掉落配置 ====================
export const SUN_CONFIG = {
  value: 25,              // 每个阳光的价值
  fallDuration: 3000,     // 掉落动画持续时间
  collectDuration: 500,   // 收集动画持续时间
  lifetime: 10000         // 阳光存在时间(ms)
}

// ==================== 工具函数 ====================

/**
 * 生成唯一ID
 */
export function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

/**
 * 根据行号计算Y坐标
 */
export function getYByRow(row) {
  return row * GAME_CONFIG.CELL_HEIGHT + GAME_CONFIG.CELL_HEIGHT / 2
}

/**
 * 根据列号计算X坐标
 */
export function getXByCol(col) {
  return col * GAME_CONFIG.CELL_WIDTH + GAME_CONFIG.CELL_WIDTH / 2
}

/**
 * 根据X坐标计算所在列号
 */
export function getColByX(x) {
  return Math.floor(x / GAME_CONFIG.CELL_WIDTH)
}

/**
 * 根据Y坐标计算所在行号
 */
export function getRowByY(y) {
  return Math.floor(y / GAME_CONFIG.CELL_HEIGHT)
}
