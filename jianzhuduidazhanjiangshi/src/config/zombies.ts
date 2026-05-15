import type { ZombieConfig } from '../types'

export const ZOMBIES: ZombieConfig[] = [
  {
    id: 'normal',
    name: '普通僵尸',
    health: 80,
    damage: 10,
    speed: 0.6,
    attackRange: 35,
    attackSpeed: 1200,
    isFlying: false,
    isExplosive: false,
    reward: 15,
    color: '#556B2F',
    size: 24
  },
  {
    id: 'conehead',
    name: '路障僵尸',
    health: 250,
    damage: 15,
    speed: 0.4,
    attackRange: 35,
    attackSpeed: 1500,
    isFlying: false,
    isExplosive: false,
    reward: 30,
    color: '#FFD700',
    size: 28
  },
  {
    id: 'flying',
    name: '飞行僵尸',
    health: 60,
    damage: 20,
    speed: 1.0,
    attackRange: 40,
    attackSpeed: 1000,
    isFlying: true,
    isExplosive: false,
    reward: 25,
    color: '#9370DB',
    size: 22
  },
  {
    id: 'explosive',
    name: '自爆僵尸',
    health: 30,
    damage: 5,
    speed: 1.5,
    attackRange: 50,
    attackSpeed: 500,
    isFlying: false,
    isExplosive: true,
    explosionDamage: 80,
    explosionRadius: 80,
    reward: 20,
    color: '#FF0000',
    size: 20
  },
  {
    id: 'boss',
    name: 'BOSS僵尸',
    health: 800,
    damage: 50,
    speed: 0.3,
    attackRange: 50,
    attackSpeed: 2000,
    isFlying: false,
    isExplosive: false,
    reward: 200,
    color: '#8B0000',
    size: 40
  }
]

export const getZombieConfig = (id: string): ZombieConfig | undefined => {
  return ZOMBIES.find(z => z.id === id)
}
