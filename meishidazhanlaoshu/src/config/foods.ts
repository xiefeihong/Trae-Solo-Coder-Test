import type { FoodConfig } from '../types/game'

export const FOODS: FoodConfig[] = [
  {
    id: 'cookie',
    name: '饼干炮台',
    cost: 100,
    hp: 300,
    damage: 25,
    attackSpeed: 800,
    range: 8,
    cooldown: 1500,
    description: '基础防御塔，单发射击',
    color: '#D2691E',
    type: 'shooter'
  },
  {
    id: 'marshmallow',
    name: '棉花糖陷阱',
    cost: 75,
    hp: 200,
    damage: 5,
    attackSpeed: 2000,
    range: 1,
    cooldown: 2000,
    description: '减速经过的老鼠',
    color: '#FFE4E1',
    type: 'trap',
    special: 'slow'
  },
  {
    id: 'popcorn',
    name: '爆米花投手',
    cost: 175,
    hp: 250,
    damage: 45,
    attackSpeed: 1800,
    range: 7,
    cooldown: 2500,
    description: '范围爆炸伤害',
    color: '#FFD700',
    type: 'aoe',
    special: 'splash'
  },
  {
    id: 'chocolate',
    name: '巧克力盾牌',
    cost: 50,
    hp: 1000,
    damage: 0,
    attackSpeed: 0,
    range: 0,
    cooldown: 3000,
    description: '阻挡老鼠前进',
    color: '#8B4513',
    type: 'shield',
    special: 'block'
  },
  {
    id: 'pizza',
    name: '披萨投掷器',
    cost: 200,
    hp: 200,
    damage: 70,
    attackSpeed: 2500,
    range: 9,
    cooldown: 3000,
    description: '远程抛射，可攻击空中',
    color: '#FF6347',
    type: 'lobber',
    special: 'canHitFlying'
  },
  {
    id: 'icecream',
    name: '冰激凌法师',
    cost: 175,
    hp: 200,
    damage: 20,
    attackSpeed: 1200,
    range: 5,
    cooldown: 2500,
    description: '冰冻老鼠',
    color: '#87CEEB',
    type: 'freeze',
    special: 'freeze'
  },
  {
    id: 'burger',
    name: '汉堡生产器',
    cost: 150,
    hp: 300,
    damage: 0,
    attackSpeed: 0,
    range: 0,
    cooldown: 4000,
    description: '生产星星资源',
    color: '#FFA500',
    type: 'producer',
    special: 'produce'
  },
  {
    id: 'donut',
    name: '甜甜圈炸弹',
    cost: 125,
    hp: 100,
    damage: 200,
    attackSpeed: 0,
    range: 3,
    cooldown: 3500,
    description: '点击引爆大范围伤害',
    color: '#FF69B4',
    type: 'bomb',
    special: 'explode'
  }
]

export const getFoodConfig = (id: string): FoodConfig | undefined => {
  return FOODS.find(f => f.id === id)
}
