import { defineStore } from 'pinia'
import type { Game } from '../types/game'

export const useGameStore = defineStore('game', {
  state: () => ({
    games: [
      {
        id: 'click-score',
        name: '点击得分',
        description: '疯狂点击，挑战你的手速极限！',
        icon: 'mouse-pointer',
        color: '#ff6b35',
        component: 'ClickScoreGame',
        isDeveloping: false
      },
      {
        id: 'plants-vs-zombies',
        name: '植物大战僵尸',
        description: '经典塔防游戏，守护你的花园！',
        icon: 'seedling',
        color: '#95e1a3',
        component: 'PlaceholderGame',
        isDeveloping: true
      },
      {
        id: 'gomoku',
        name: '五子棋',
        description: '智慧对决，五子连珠获胜！',
        icon: 'circle',
        color: '#4ecdc4',
        component: 'PlaceholderGame',
        isDeveloping: true
      },
      {
        id: 'lonely-racer',
        name: '孤独的公路赛车',
        description: '极速狂飙，挑战最高分！',
        icon: 'car',
        color: '#f7c948',
        component: 'PlaceholderGame',
        isDeveloping: true
      },
      {
        id: 'tetris',
        name: '俄罗斯方块',
        description: '经典益智，消除乐趣无限！',
        icon: 'cubes',
        color: '#a29bfe',
        component: 'PlaceholderGame',
        isDeveloping: true
      },
      {
        id: 'match-3',
        name: '消消乐',
        description: '消除烦恼，收获快乐！',
        icon: 'grip',
        color: '#fd79a8',
        component: 'PlaceholderGame',
        isDeveloping: true
      }
    ] as Game[]
  })
})
