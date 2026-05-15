import type { EnemyConfig } from '../types';

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  goblin: {
    type: 'goblin',
    name: '哥布林',
    hp: 50,
    speed: 2,
    reward: 10,
    isFlying: false,
    armor: 0,
    color: '#48BB78'
  },
  orc: {
    type: 'orc',
    name: '兽人',
    hp: 150,
    speed: 1,
    reward: 25,
    isFlying: false,
    armor: 5,
    color: '#38A169'
  },
  troll: {
    type: 'troll',
    name: '巨魔',
    hp: 500,
    speed: 0.5,
    reward: 100,
    isFlying: false,
    armor: 15,
    color: '#276749'
  },
  flying: {
    type: 'flying',
    name: '飞行敌人',
    hp: 80,
    speed: 1.8,
    reward: 30,
    isFlying: true,
    armor: 0,
    color: '#9F7AEA'
  }
};
