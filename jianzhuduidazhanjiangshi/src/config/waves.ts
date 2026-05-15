import type { WaveConfig } from '../types'

export const WAVES: WaveConfig[] = [
  {
    waveNumber: 1,
    zombies: [{ type: 'normal', count: 5 }],
    reward: 50
  },
  {
    waveNumber: 2,
    zombies: [{ type: 'normal', count: 8 }],
    reward: 60
  },
  {
    waveNumber: 3,
    zombies: [
      { type: 'normal', count: 6 },
      { type: 'conehead', count: 2 }
    ],
    reward: 80
  },
  {
    waveNumber: 4,
    zombies: [
      { type: 'normal', count: 8 },
      { type: 'flying', count: 3 }
    ],
    reward: 100
  },
  {
    waveNumber: 5,
    zombies: [
      { type: 'normal', count: 10 },
      { type: 'conehead', count: 3 },
      { type: 'boss', count: 1, delay: 3000 }
    ],
    reward: 200
  },
  {
    waveNumber: 6,
    zombies: [
      { type: 'normal', count: 12 },
      { type: 'explosive', count: 4 }
    ],
    reward: 120
  },
  {
    waveNumber: 7,
    zombies: [
      { type: 'normal', count: 10 },
      { type: 'conehead', count: 4 },
      { type: 'flying', count: 4 }
    ],
    reward: 150
  },
  {
    waveNumber: 8,
    zombies: [
      { type: 'normal', count: 15 },
      { type: 'explosive', count: 6 },
      { type: 'flying', count: 3 }
    ],
    reward: 180
  },
  {
    waveNumber: 9,
    zombies: [
      { type: 'conehead', count: 8 },
      { type: 'flying', count: 6 },
      { type: 'explosive', count: 5 }
    ],
    reward: 200
  },
  {
    waveNumber: 10,
    zombies: [
      { type: 'normal', count: 20 },
      { type: 'conehead', count: 6 },
      { type: 'flying', count: 5 },
      { type: 'explosive', count: 6 },
      { type: 'boss', count: 2, delay: 5000 }
    ],
    reward: 500
  }
]

export const getWaveConfig = (waveNumber: number): WaveConfig | undefined => {
  return WAVES.find(w => w.waveNumber === waveNumber)
}

export const getTotalWaves = (): number => {
  return WAVES.length
}
