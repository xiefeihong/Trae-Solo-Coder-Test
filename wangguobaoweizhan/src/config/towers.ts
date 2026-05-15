import type { TowerConfig } from '../types';

export const TOWER_CONFIGS: Record<string, TowerConfig> = {
  arrow: {
    type: 'arrow',
    name: '箭塔',
    cost: 100,
    damage: [15, 25, 40],
    range: [120, 140, 170],
    attackSpeed: [800, 650, 500],
    levels: 3,
    upgradeCost: [75, 150],
    canHitFlying: true,
    strategy: 'lowestHp',
    color: '#8B4513'
  },
  barracks: {
    type: 'barracks',
    name: '兵营',
    cost: 150,
    damage: [20, 35, 55],
    range: [80, 100, 120],
    attackSpeed: [1200, 1000, 800],
    levels: 3,
    upgradeCost: [100, 200],
    canHitFlying: false,
    strategy: 'nearest',
    color: '#4A5568'
  },
  magic: {
    type: 'magic',
    name: '法师塔',
    cost: 200,
    damage: [50, 80, 130],
    range: [130, 150, 180],
    attackSpeed: [1500, 1200, 900],
    levels: 3,
    upgradeCost: [150, 300],
    canHitFlying: true,
    strategy: 'nearest',
    color: '#805AD5'
  },
  cannon: {
    type: 'cannon',
    name: '炮塔',
    cost: 250,
    damage: [40, 70, 110],
    range: [110, 130, 150],
    attackSpeed: [2000, 1700, 1400],
    levels: 3,
    upgradeCost: [175, 350],
    canHitFlying: false,
    strategy: 'nearest',
    color: '#2D3748'
  }
};
