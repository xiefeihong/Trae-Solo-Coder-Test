import type { SoldierConfig } from '../types'

export const SOLDIERS: SoldierConfig[] = [
  {
    id: 'worker',
    name: '工人',
    health: 50,
    damage: 8,
    speed: 1.5,
    attackRange: 40,
    attackSpeed: 800,
    canAttackAir: false,
    isHealer: false,
    color: '#D2B48C',
    size: 18
  },
  {
    id: 'carpenter',
    name: '木匠',
    health: 80,
    damage: 15,
    speed: 1.2,
    attackRange: 50,
    attackSpeed: 1000,
    canAttackAir: true,
    isHealer: false,
    color: '#8B4513',
    size: 20
  },
  {
    id: 'blacksmith',
    name: '铁匠',
    health: 200,
    damage: 35,
    speed: 0.8,
    attackRange: 45,
    attackSpeed: 1500,
    canAttackAir: false,
    isHealer: false,
    color: '#4A4A4A',
    size: 26
  },
  {
    id: 'bomber',
    name: '投弹兵',
    health: 60,
    damage: 25,
    speed: 1.0,
    attackRange: 80,
    attackSpeed: 2000,
    canAttackAir: false,
    isHealer: false,
    color: '#FF4500',
    size: 20
  },
  {
    id: 'repairman',
    name: '维修工',
    health: 40,
    damage: 0,
    speed: 1.8,
    attackRange: 60,
    attackSpeed: 1000,
    canAttackAir: false,
    isHealer: true,
    healAmount: 20,
    color: '#32CD32',
    size: 18
  }
]

export const getSoldierConfig = (id: string): SoldierConfig | undefined => {
  return SOLDIERS.find(s => s.id === id)
}
