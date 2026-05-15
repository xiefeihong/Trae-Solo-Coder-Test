import type { BuildingConfig } from '../types'

export const BUILDINGS: BuildingConfig[] = [
  {
    id: 'cement-factory',
    name: '水泥厂',
    cost: 100,
    maxLevel: 3,
    productionInterval: 2000,
    soldierType: 'worker',
    health: 200,
    color: '#8B7355',
    upgradeCosts: [150, 250],
    description: '生产基础工人，攻击力低、造价便宜、生产速度快'
  },
  {
    id: 'wood-workshop',
    name: '木工坊',
    cost: 150,
    maxLevel: 3,
    productionInterval: 3000,
    soldierType: 'carpenter',
    health: 250,
    color: '#DEB887',
    upgradeCosts: [200, 350],
    description: '生产木匠，中等攻击力，可对空攻击'
  },
  {
    id: 'steel-factory',
    name: '钢铁厂',
    cost: 300,
    maxLevel: 3,
    productionInterval: 5000,
    soldierType: 'blacksmith',
    health: 400,
    color: '#708090',
    upgradeCosts: [400, 600],
    description: '生产铁匠，高攻击力、高生命值、生产速度慢'
  },
  {
    id: 'explosive-lab',
    name: '爆破实验室',
    cost: 250,
    maxLevel: 3,
    productionInterval: 4000,
    soldierType: 'bomber',
    health: 180,
    color: '#FF6347',
    upgradeCosts: [350, 500],
    description: '生产投弹兵，范围伤害，适合对付成群僵尸'
  },
  {
    id: 'repair-station',
    name: '维修站',
    cost: 200,
    maxLevel: 3,
    productionInterval: 3500,
    soldierType: 'repairman',
    health: 300,
    color: '#98FB98',
    upgradeCosts: [300, 450],
    description: '生产维修工，不能攻击，但可以修复受损建筑'
  }
]

export const getBuildingConfig = (id: string): BuildingConfig | undefined => {
  return BUILDINGS.find(b => b.id === id)
}
