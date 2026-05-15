import type { MouseConfig } from '../types/game'

export const MICE: MouseConfig[] = [
  {
    id: 'normal',
    name: '普通老鼠',
    hp: 100,
    maxHp: 100,
    speed: 0.8,
    damage: 1,
    reward: 15,
    color: '#808080',
    type: 'normal'
  },
  {
    id: 'tank',
    name: '戴头盔老鼠',
    hp: 300,
    maxHp: 300,
    speed: 0.4,
    damage: 2,
    reward: 30,
    color: '#4A4A4A',
    type: 'tank',
    special: 'armor'
  },
  {
    id: 'fast',
    name: '速度老鼠',
    hp: 50,
    maxHp: 50,
    speed: 2,
    damage: 1,
    reward: 20,
    color: '#90EE90',
    type: 'fast',
    special: 'fast'
  },
  {
    id: 'flying',
    name: '飞行老鼠',
    hp: 80,
    maxHp: 80,
    speed: 1,
    damage: 1,
    reward: 25,
    color: '#DDA0DD',
    type: 'flying',
    special: 'flying'
  },
  {
    id: 'underground',
    name: '地鼠',
    hp: 120,
    maxHp: 120,
    speed: 0.6,
    damage: 1,
    reward: 25,
    color: '#CD853F',
    type: 'underground',
    special: 'underground'
  },
  {
    id: 'boss',
    name: '老鼠BOSS',
    hp: 1000,
    maxHp: 1000,
    speed: 0.3,
    damage: 5,
    reward: 200,
    color: '#8B0000',
    type: 'boss',
    special: 'boss'
  },
  {
    id: 'exploder',
    name: '自爆老鼠',
    hp: 60,
    maxHp: 60,
    speed: 1.2,
    damage: 3,
    reward: 20,
    color: '#FF4500',
    type: 'exploder',
    special: 'explode'
  }
]

export const getMouseConfig = (id: string): MouseConfig | undefined => {
  return MICE.find(m => m.id === id)
}
