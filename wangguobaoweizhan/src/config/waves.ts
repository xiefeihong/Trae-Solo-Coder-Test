import type { WaveConfig } from '../types';

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    enemies: [
      { type: 'goblin', count: 5, delay: 1000 }
    ],
    reward: 50
  },
  {
    enemies: [
      { type: 'goblin', count: 8, delay: 800 }
    ],
    reward: 75
  },
  {
    enemies: [
      { type: 'goblin', count: 5, delay: 1000 },
      { type: 'orc', count: 3, delay: 1500 }
    ],
    reward: 100
  },
  {
    enemies: [
      { type: 'orc', count: 6, delay: 1200 }
    ],
    reward: 125
  },
  {
    enemies: [
      { type: 'goblin', count: 10, delay: 600 },
      { type: 'flying', count: 3, delay: 2000 }
    ],
    reward: 150
  },
  {
    enemies: [
      { type: 'orc', count: 5, delay: 1000 },
      { type: 'troll', count: 1, delay: 3000 }
    ],
    reward: 175
  },
  {
    enemies: [
      { type: 'flying', count: 6, delay: 1500 },
      { type: 'orc', count: 4, delay: 1200 }
    ],
    reward: 200
  },
  {
    enemies: [
      { type: 'troll', count: 2, delay: 2500 },
      { type: 'goblin', count: 8, delay: 800 }
    ],
    reward: 250
  },
  {
    enemies: [
      { type: 'orc', count: 8, delay: 1000 },
      { type: 'flying', count: 5, delay: 1500 }
    ],
    reward: 300
  },
  {
    enemies: [
      { type: 'troll', count: 3, delay: 2000 },
      { type: 'orc', count: 6, delay: 1000 },
      { type: 'flying', count: 4, delay: 1500 }
    ],
    reward: 500
  }
];
