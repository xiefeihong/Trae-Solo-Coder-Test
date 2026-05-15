<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGoldMiner, type Item } from '../composables/useGoldMiner'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const CANVAS_WIDTH = 900
const CANVAS_HEIGHT = 600

const {
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
  getHookEndPosition
} = useGoldMiner(CANVAS_WIDTH, CANVAS_HEIGHT)

let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null

function drawBackground() {
  if (!ctx) return
  
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
  gradient.addColorStop(0, '#8B4513')
  gradient.addColorStop(0.15, '#A0522D')
  gradient.addColorStop(0.3, '#8B4513')
  gradient.addColorStop(1, '#654321')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  
  ctx.fillStyle = '#5D3A1A'
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * CANVAS_WIDTH
    const y = Math.random() * (CANVAS_HEIGHT - 100) + 100
    const radius = Math.random() * 15 + 5
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawItem(item: Item) {
  if (!ctx) return
  
  ctx.save()
  ctx.translate(item.x, item.y)
  
  if (item.type === 'diamond') {
    ctx.fillStyle = item.color
    ctx.beginPath()
    ctx.moveTo(0, -item.radius)
    ctx.lineTo(item.radius * 0.7, 0)
    ctx.lineTo(0, item.radius)
    ctx.lineTo(-item.radius * 0.7, 0)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.moveTo(-item.radius * 0.3, -item.radius * 0.3)
    ctx.lineTo(0, -item.radius * 0.5)
    ctx.lineTo(item.radius * 0.2, -item.radius * 0.2)
    ctx.closePath()
    ctx.fill()
  } else if (item.type === 'piggyBank') {
    ctx.fillStyle = item.color
    ctx.beginPath()
    ctx.ellipse(0, 0, item.radius, item.radius * 0.8, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#FF69B4'
    ctx.beginPath()
    ctx.arc(-item.radius * 0.6, -item.radius * 0.3, item.radius * 0.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(item.radius * 0.6, -item.radius * 0.3, item.radius * 0.25, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(-item.radius * 0.25, -item.radius * 0.1, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(item.radius * 0.25, -item.radius * 0.1, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#C0C0C0'
    ctx.fillRect(-item.radius * 0.3, item.radius * 0.1, item.radius * 0.6, 4)
  } else {
    ctx.fillStyle = item.color
    ctx.beginPath()
    ctx.arc(0, 0, item.radius, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.arc(-item.radius * 0.3, -item.radius * 0.3, item.radius * 0.3, 0, Math.PI * 2)
    ctx.fill()
    
    if (item.type === 'stone') {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-item.radius * 0.5, -item.radius * 0.2)
      ctx.lineTo(item.radius * 0.3, item.radius * 0.3)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-item.radius * 0.3, item.radius * 0.4)
      ctx.lineTo(item.radius * 0.2, -item.radius * 0.5)
      ctx.stroke()
    }
  }
  
  ctx.restore()
}

function drawHook() {
  if (!ctx) return
  
  const hookEnd = getHookEndPosition()
  
  ctx.strokeStyle = '#8B4513'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(hookOrigin.x, hookOrigin.y)
  ctx.lineTo(hookEnd.x, hookEnd.y)
  ctx.stroke()
  
  ctx.fillStyle = '#8B4513'
  ctx.beginPath()
  ctx.arc(hookOrigin.x, hookOrigin.y, 15, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#C0C0C0'
  ctx.beginPath()
  ctx.arc(hookEnd.x, hookEnd.y, 10, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.strokeStyle = '#A0A0A0'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(hookEnd.x - 10, hookEnd.y + 5)
  ctx.lineTo(hookEnd.x - 5, hookEnd.y + 15)
  ctx.lineTo(hookEnd.x + 5, hookEnd.y + 15)
  ctx.lineTo(hookEnd.x + 10, hookEnd.y + 5)
  ctx.stroke()
  
  if (hook.grabbedItem) {
    ctx.save()
    ctx.translate(hookEnd.x, hookEnd.y + 20)
    
    const scale = 0.6
    ctx.scale(scale, scale)
    
    if (hook.grabbedItem.type === 'diamond') {
      ctx.fillStyle = hook.grabbedItem.color
      ctx.beginPath()
      ctx.moveTo(0, -hook.grabbedItem.radius)
      ctx.lineTo(hook.grabbedItem.radius * 0.7, 0)
      ctx.lineTo(0, hook.grabbedItem.radius)
      ctx.lineTo(-hook.grabbedItem.radius * 0.7, 0)
      ctx.closePath()
      ctx.fill()
    } else {
      ctx.fillStyle = hook.grabbedItem.color
      ctx.beginPath()
      ctx.arc(0, 0, hook.grabbedItem.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
}

function drawAngleIndicator() {
  if (!ctx || hook.state !== 'swinging') return
  
  const indicatorX = 50
  const indicatorY = CANVAS_HEIGHT - 50
  const indicatorRadius = 30
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.arc(indicatorX, indicatorY, indicatorRadius, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(indicatorX, indicatorY, indicatorRadius - 5, Math.PI, 0, true)
  ctx.stroke()
  
  const needleAngle = (hook.angle * Math.PI) / 180
  ctx.strokeStyle = '#FF0000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(indicatorX, indicatorY)
  ctx.lineTo(
    indicatorX + Math.sin(needleAngle) * (indicatorRadius - 8),
    indicatorY - Math.cos(needleAngle) * (indicatorRadius - 8)
  )
  ctx.stroke()
  
  ctx.fillStyle = '#FFF'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('角度', indicatorX, indicatorY + indicatorRadius + 15)
}

function draw() {
  if (!ctx) return
  
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  
  drawBackground()
  
  for (const item of items.value) {
    drawItem(item)
  }
  
  drawHook()
  drawAngleIndicator()
}

function gameLoop() {
  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function handleClick() {
  fireHook()
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    e.preventDefault()
    fireHook()
  }
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    startGame()
    gameLoop()
  }
  
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('keydown', handleKeyDown)
})

watch(() => gameState.showGameOver, (show) => {
  if (show) {
    // Game over
  }
})

const getUpgradeCost = (type: string, level: number) => {
  const baseCosts: Record<string, number> = {
    hookLength: 5,
    pullSpeed: 8,
    grabPower: 10
  }
  return baseCosts[type] * (level + 1)
}

defineExpose({
  gameState,
  upgrades,
  nextLevel,
  openShop,
  buyUpgrade,
  startGame,
  getUpgradeCost
})
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <div class="stat-item">
        <span class="stat-label">关卡</span>
        <span class="stat-value">{{ gameState.level }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">分数</span>
        <span class="stat-value">{{ gameState.score }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">目标</span>
        <span class="stat-value">{{ gameState.targetScore }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">时间</span>
        <span class="stat-value" :class="{ 'time-warning': gameState.timeLeft <= 10 }">
          {{ gameState.timeLeft }}s
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">金币</span>
        <span class="stat-value">💰 {{ gameState.coins }}</span>
      </div>
    </div>
    
    <canvas
      ref="canvasRef"
      :width="CANVAS_WIDTH"
      :height="CANVAS_HEIGHT"
      @click="handleClick"
      @touchstart.prevent="handleClick"
    ></canvas>
    
    <div class="game-tip">
      点击屏幕或按空格键发射钩子
    </div>
    
    <div v-if="gameState.showLevelComplete" class="modal-overlay">
      <div class="modal-content">
        <h2>🎉 恭喜过关！</h2>
        <p>第 {{ gameState.level }} 关完成</p>
        <p>获得分数: {{ gameState.score }}</p>
        <p>获得金币: {{ Math.floor(gameState.score / 100) }}</p>
        <div class="modal-buttons">
          <button @click="openShop" class="btn btn-primary">
            🛒 商店
          </button>
          <button @click="nextLevel" class="btn btn-success">
            ▶️ 下一关
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="gameState.showShop" class="modal-overlay">
      <div class="modal-content shop-modal">
        <h2>🛒 升级商店</h2>
        <p class="coins-display">当前金币: 💰 {{ gameState.coins }}</p>
        
        <div class="upgrade-list">
          <div class="upgrade-item">
            <div class="upgrade-info">
              <span class="upgrade-name">🔗 钩子长度</span>
              <span class="upgrade-level">Lv.{{ upgrades.hookLength }}/5</span>
            </div>
            <div class="upgrade-progress">
              <div 
                class="progress-bar" 
                :style="{ width: `${upgrades.hookLength * 20}%` }"
              ></div>
            </div>
            <button
              @click="buyUpgrade('hookLength', getUpgradeCost('hookLength', upgrades.hookLength))"
              :disabled="gameState.coins < getUpgradeCost('hookLength', upgrades.hookLength) || upgrades.hookLength >= 5"
              class="btn btn-small"
            >
              {{ upgrades.hookLength >= 5 ? '已满级' : `💰 ${getUpgradeCost('hookLength', upgrades.hookLength)}` }}
            </button>
          </div>
        
          <div class="upgrade-item">
            <div class="upgrade-info">
              <span class="upgrade-name">⚡ 收回速度</span>
              <span class="upgrade-level">Lv.{{ upgrades.pullSpeed }}/5</span>
            </div>
            <div class="upgrade-progress">
              <div 
                class="progress-bar"
                :style="{ width: `${upgrades.pullSpeed * 20}%` }"
              ></div>
            </div>
            <button
              @click="buyUpgrade('pullSpeed', getUpgradeCost('pullSpeed', upgrades.pullSpeed))"
              :disabled="gameState.coins < getUpgradeCost('pullSpeed', upgrades.pullSpeed) || upgrades.pullSpeed >= 5"
              class="btn btn-small"
            >
              {{ upgrades.pullSpeed >= 5 ? '已满级' : `💰 ${getUpgradeCost('pullSpeed', upgrades.pullSpeed)}` }}
            </button>
          </div>
        
          <div class="upgrade-item">
            <div class="upgrade-info">
              <span class="upgrade-name">💪 抓取力量</span>
              <span class="upgrade-level">Lv.{{ upgrades.grabPower }}/5</span>
            </div>
            <div class="upgrade-progress">
              <div 
                class="progress-bar"
                :style="{ width: `${upgrades.grabPower * 20}%` }"
              ></div>
            </div>
            <button
              @click="buyUpgrade('grabPower', getUpgradeCost('grabPower', upgrades.grabPower))"
              :disabled="gameState.coins < getUpgradeCost('grabPower', upgrades.grabPower) || upgrades.grabPower >= 5"
              class="btn btn-small"
            >
              {{ upgrades.grabPower >= 5 ? '已满级' : `💰 ${getUpgradeCost('grabPower', upgrades.grabPower)}` }}
            </button>
          </div>
        </div>
      
        <div class="modal-buttons">
          <button @click="nextLevel" class="btn btn-success">
            ▶️ 下一关
          </button>
        </div>
      </div>
    </div>
  
    <div v-if="gameState.showGameOver" class="modal-overlay">
      <div class="modal-content">
        <h2>💀 游戏结束</h2>
        <p>最终关卡: {{ gameState.level }}</p>
        <p>最终分数: {{ gameState.score }}</p>
        <div class="modal-buttons">
          <button @click="startGame" class="btn btn-primary">
            🔄 重新开始
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #4a2c17 0%, #6b3d1f 100%);
  padding: 15px 25px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #FFD700;
}

.time-warning {
  color: #FF4444;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

canvas {
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  touch-action: none;
}

.game-tip {
  text-align: center;
  color: #aaa;
  margin-top: 15px;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #3d2817 0%, #2a1a0f 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 3px solid #FFD700;
  min-width: 400px;
}

.modal-content h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #FFD700;
}

.modal-content p {
  font-size: 18px;
  margin: 10px 0;
  color: #ddd;
}

.modal-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4a90d9 0%, #357abd 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #5cb85c 0%, #4cae4c 100%);
  color: white;
}

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #333;
}

.shop-modal {
  min-width: 450px;
}

.coins-display {
  font-size: 20px;
  color: #FFD700;
  margin-bottom: 25px;
}

.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upgrade-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upgrade-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upgrade-name {
  font-size: 16px;
  font-weight: bold;
}

.upgrade-level {
  font-size: 14px;
  color: #FFD700;
}

.upgrade-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  transition: width 0.3s;
}
</style>
