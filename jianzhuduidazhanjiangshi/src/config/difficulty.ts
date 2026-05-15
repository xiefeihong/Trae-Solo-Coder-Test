export interface DifficultyConfig {
  id: string
  name: string
  description: string
  zombieHealthMultiplier: number
  zombieDamageMultiplier: number
  zombieSpeedMultiplier: number
  resourceMultiplier: number
  waveRewardMultiplier: number
  buildingCostMultiplier: number
  spawnDelayMultiplier: number
  bossWaveInterval: number
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    name: '🌱 简单',
    description: '适合新手体验，僵尸较弱',
    zombieHealthMultiplier: 0.6,
    zombieDamageMultiplier: 0.7,
    zombieSpeedMultiplier: 0.8,
    resourceMultiplier: 1.3,
    waveRewardMultiplier: 1.5,
    buildingCostMultiplier: 0.85,
    spawnDelayMultiplier: 1.3,
    bossWaveInterval: 5
  },
  {
    id: 'normal',
    name: '⚔️ 普通',
    description: '标准游戏难度',
    zombieHealthMultiplier: 1.0,
    zombieDamageMultiplier: 1.0,
    zombieSpeedMultiplier: 1.0,
    resourceMultiplier: 1.0,
    waveRewardMultiplier: 1.0,
    buildingCostMultiplier: 1.0,
    spawnDelayMultiplier: 1.0,
    bossWaveInterval: 5
  },
  {
    id: 'hard',
    name: '🔥 困难',
    description: '需要策略和操作',
    zombieHealthMultiplier: 1.5,
    zombieDamageMultiplier: 1.3,
    zombieSpeedMultiplier: 1.1,
    resourceMultiplier: 0.85,
    waveRewardMultiplier: 0.8,
    buildingCostMultiplier: 1.15,
    spawnDelayMultiplier: 0.8,
    bossWaveInterval: 4
  },
  {
    id: 'nightmare',
    name: '💀 噩梦',
    description: '极限挑战，能通关吗？',
    zombieHealthMultiplier: 2.5,
    zombieDamageMultiplier: 2.0,
    zombieSpeedMultiplier: 1.3,
    resourceMultiplier: 0.65,
    waveRewardMultiplier: 0.6,
    buildingCostMultiplier: 1.4,
    spawnDelayMultiplier: 0.6,
    bossWaveInterval: 3
  }
]

export const getDifficultyConfig = (id: string): DifficultyConfig | undefined => {
  return DIFFICULTIES.find(d => d.id === id)
}
