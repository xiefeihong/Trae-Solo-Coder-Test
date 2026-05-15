import { ref, reactive, onUnmounted } from 'vue'

export type ItemType = 'smallGold' | 'bigGold' | 'stone' | 'diamond' | 'piggyBank'

export interface Item {
  id: number
  type: ItemType
  x: number
  y: number
  radius: number
  value: number
  weight: number
  color: string
}

export interface GameState {
  score: number
  targetScore: number
  level: number
  coins: number
  timeLeft: number
  isPlaying: boolean
  isPaused: boolean
  showShop: boolean
  showGameOver: boolean
  showLevelComplete: boolean
}

export interface Upgrades {
  hookLength: number
  pullSpeed: number
  grabPower: number
}

export interface HookState {
  angle: number
  length: number
  maxLength: number
  state: 'swinging' | 'extending' | 'retracting'
  direction: 1 | -1
  swingSpeed: number
  extendSpeed: number
  baseRetractSpeed: number
  grabbedItem: Item | null
}

const ITEM_CONFIGS = {
  smallGold: { value: 100, weight: 1, radius: 25, color: '#FFD700' },
  bigGold: { value: 500, weight: 3, radius: 45, color: '#FFD700' },
  stone: { value: 0, weight: 5, radius: 35, color: '#808080' },
  diamond: { value: 300, weight: 0.5, radius: 20, color: '#00FFFF' },
  piggyBank: { value: 200, weight: 1.5, radius: 30, color: '#FFB6C1' }
}

export function useGoldMiner(canvasWidth: number, canvasHeight: number) {
  const gameState = reactive<GameState>({
    score: 0,
    targetScore: 500,
    level: 1,
    coins: 0,
    timeLeft: 60,
    isPlaying: true,
    isPaused: false,
    showShop: false,
    showGameOver: false,
    showLevelComplete: false
  })

  const upgrades = reactive<Upgrades>({
    hookLength: 0,
    pullSpeed: 0,
    grabPower: 0
  })

  const hook = reactive<HookState>({
    angle: 0,
    length: 50,
    maxLength: 400,
    state: 'swinging',
    direction: 1,
    swingSpeed: 0.02,
    extendSpeed: 8,
    baseRetractSpeed: 6,
    grabbedItem: null
  })

  const items = ref<Item[]>([])
  const hookOrigin = { x: canvasWidth / 2, y: 0 }

  let animationId: number | null = null
  let timerInterval: number | null = null
  let itemIdCounter = 0

  function generateItems() {
    items.value = []
    const itemTypes: ItemType[] = ['smallGold', 'smallGold', 'smallGold', 'bigGold', 'stone', 'stone', 'diamond', 'piggyBank']
    
    for (let i = 0; i < 8 + gameState.level * 2; i++) {
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)]
      const config = ITEM_CONFIGS[type]
      
      let x, y, valid
      let attempts = 0
      
      do {
        valid = true
        x = Math.random() * (canvasWidth - 100) + 50
        y = Math.random() * (canvasHeight - 250) + 150
        
        for (const existing of items.value) {
          const dist = Math.sqrt((x - existing.x) ** 2 + (y - existing.y) ** 2)
          if (dist < config.radius + existing.radius + 10) {
            valid = false
            break
          }
        }
        attempts++
      } while (!valid && attempts < 50)
      
      if (valid) {
        items.value.push({
          id: itemIdCounter++,
          type,
          x,
          y,
          radius: config.radius,
          value: config.value,
          weight: config.weight,
          color: config.color
        })
      }
    }
  }

  function getHookEndPosition() {
    const rad = (hook.angle * Math.PI) / 180
    return {
      x: hookOrigin.x + Math.sin(rad) * hook.length,
      y: hookOrigin.y + Math.cos(rad) * hook.length
    }
  }

  function checkCollision(hookEnd: { x: number; y: number }) {
    for (const item of items.value) {
      const dist = Math.sqrt((hookEnd.x - item.x) ** 2 + (hookEnd.y - item.y) ** 2)
      if (dist < item.radius + 10) {
        return item
      }
    }
    return null
  }

  function updateHook() {
    if (hook.state === 'swinging') {
      hook.angle += hook.direction * hook.swingSpeed * 60
      
      if (hook.angle >= 60) {
        hook.angle = 60
        hook.direction = -1
      } else if (hook.angle <= -60) {
        hook.angle = -60
        hook.direction = 1
      }
    } else if (hook.state === 'extending') {
      hook.length += hook.extendSpeed
      
      const maxLen = hook.maxLength + upgrades.hookLength * 50
      const hookEnd = getHookEndPosition()
      
      if (hook.length >= maxLen || 
          hookEnd.x < 10 || 
          hookEnd.x > canvasWidth - 10 || 
          hookEnd.y > canvasHeight - 10) {
        hook.state = 'retracting'
        return
      }
      
      const collidedItem = checkCollision(hookEnd)
      if (collidedItem) {
        hook.grabbedItem = collidedItem
        items.value = items.value.filter(i => i.id !== collidedItem.id)
        hook.state = 'retracting'
      }
    } else if (hook.state === 'retracting') {
      const retractSpeed = hook.baseRetractSpeed + upgrades.pullSpeed
      const weightPenalty = hook.grabbedItem 
        ? Math.max(0.3, 1 - (hook.grabbedItem.weight - 1) * 0.15 - upgrades.grabPower * 0.1)
        : 1
      
      hook.length -= retractSpeed * weightPenalty
      
      if (hook.length <= 50) {
        hook.length = 50
        hook.state = 'swinging'
        
        if (hook.grabbedItem) {
          let value = hook.grabbedItem.value
          if (hook.grabbedItem.type === 'piggyBank') {
            value = Math.floor(Math.random() * 300) + 100
          }
          gameState.score += value
          hook.grabbedItem = null
          
          checkLevelComplete()
        }
      }
    }
  }

  function checkLevelComplete() {
    if (gameState.score >= gameState.targetScore) {
      gameState.coins += Math.floor(gameState.score / 100)
      gameState.showLevelComplete = true
      gameState.isPlaying = false
      stopTimers()
    }
  }

  function fireHook() {
    if (hook.state === 'swinging' && gameState.isPlaying && !gameState.isPaused) {
      hook.state = 'extending'
    }
  }

  function startTimer() {
    timerInterval = window.setInterval(() => {
      if (gameState.isPlaying && !gameState.isPaused) {
        gameState.timeLeft--
        if (gameState.timeLeft <= 0) {
          gameState.timeLeft = 0
          gameState.isPlaying = false
          gameState.showGameOver = true
          stopTimers()
        }
      }
    }, 1000)
  }

  function stopTimers() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function gameLoop() {
    if (gameState.isPlaying && !gameState.isPaused) {
      updateHook()
    }
    animationId = requestAnimationFrame(gameLoop)
  }

  function startGame() {
    gameState.score = 0
    gameState.targetScore = 500
    gameState.level = 1
    gameState.timeLeft = 60
    gameState.isPlaying = true
    gameState.isPaused = false
    gameState.showShop = false
    gameState.showGameOver = false
    gameState.showLevelComplete = false
    
    hook.angle = 0
    hook.length = 50
    hook.state = 'swinging'
    hook.grabbedItem = null
    
    upgrades.hookLength = 0
    upgrades.pullSpeed = 0
    upgrades.grabPower = 0
    gameState.coins = 0
    
    generateItems()
    stopTimers()
    startTimer()
    gameLoop()
  }

  function nextLevel() {
    gameState.level++
    gameState.targetScore = 500 + (gameState.level - 1) * 200
    gameState.timeLeft = 60 + gameState.level * 5
    gameState.isPlaying = true
    gameState.showLevelComplete = false
    gameState.showShop = false
    
    hook.angle = 0
    hook.length = 50
    hook.state = 'swinging'
    hook.grabbedItem = null
    
    generateItems()
    startTimer()
    gameLoop()
  }

  function openShop() {
    gameState.showLevelComplete = false
    gameState.showShop = true
  }

  function buyUpgrade(type: keyof Upgrades, cost: number) {
    if (gameState.coins >= cost && upgrades[type] < 5) {
      gameState.coins -= cost
      upgrades[type]++
    }
  }

  function saveProgress() {
    const data = {
      highScore: gameState.score,
      level: gameState.level,
      coins: gameState.coins,
      upgrades: { ...upgrades }
    }
    localStorage.setItem('goldMinerProgress', JSON.stringify(data))
  }

  function loadProgress() {
    const saved = localStorage.getItem('goldMinerProgress')
    if (saved) {
      return JSON.parse(saved)
    }
    return null
  }

  onUnmounted(() => {
    stopTimers()
  })

  return {
    gameState,
    hook,
    items,
    hookOrigin,
    upgrades,
    startGame,
    nextLevel,
    fireHook,
    openShop,
    buyUpgrade,
    getHookEndPosition,
    saveProgress,
    loadProgress,
    ITEM_CONFIGS
  }
}
