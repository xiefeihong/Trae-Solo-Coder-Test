<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const emit = defineEmits<{
  close: []
}>()

const score = ref(0)
const timeLeft = ref(30)
const gameStarted = ref(false)
const gameEnded = ref(false)
const highScore = ref(parseInt(localStorage.getItem('clickScoreHighScore') || '0'))
const clickAnimations = ref<Array<{ id: number; x: number; y: number }>>([])
let animationId = 0
let timer: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const startGame = () => {
  score.value = 0
  timeLeft.value = 30
  gameStarted.value = true
  gameEnded.value = false
  
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 1000)
}

const endGame = () => {
  gameEnded.value = true
  gameStarted.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  
  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem('clickScoreHighScore', score.value.toString())
  }
}

const handleClick = (event: MouseEvent | TouchEvent) => {
  if (!gameStarted.value || gameEnded.value) return
  
  score.value++
  
  let clientX: number, clientY: number
  if ('touches' in event) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  } else {
    clientX = event.clientX
    clientY = event.clientY
  }
  
  const id = animationId++
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  clickAnimations.value.push({
    id,
    x: clientX - rect.left,
    y: clientY - rect.top
  })
  
  setTimeout(() => {
    clickAnimations.value = clickAnimations.value.filter(a => a.id !== id)
  }, 500)
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="click-score-game">
    <div class="game-stats">
      <div class="stat-item">
        <font-awesome-icon icon="trophy" class="stat-icon" />
        <span>最高分: {{ highScore }}</span>
      </div>
      <div class="stat-item">
        <font-awesome-icon icon="clock" class="stat-icon" />
        <span>时间: {{ formattedTime }}</span>
      </div>
      <div class="stat-item score-stat">
        <font-awesome-icon icon="star" class="stat-icon" />
        <span>得分: {{ score }}</span>
      </div>
    </div>
    
    <div class="game-area" @click="handleClick" @touchstart.prevent="handleClick">
      <div v-if="!gameStarted && !gameEnded" class="start-screen">
        <font-awesome-icon icon="mouse-pointer" class="start-icon" />
        <h3>准备好了吗？</h3>
        <p>在30秒内尽可能多地点击！</p>
        <button class="start-btn" @click.stop="startGame">
          <font-awesome-icon icon="play" />
          开始挑战
        </button>
      </div>
      
      <div v-if="gameStarted" class="playing-screen">
        <font-awesome-icon icon="hand-pointer" class="click-hint" />
        <p class="hint-text">疯狂点击这里！</p>
      </div>
      
      <div v-if="gameEnded" class="end-screen">
        <font-awesome-icon icon="flag-checkered" class="end-icon" />
        <h3>游戏结束！</h3>
        <p class="final-score">你的得分: <strong>{{ score }}</strong></p>
        <p v-if="score >= highScore && score > 0" class="new-record">
          <font-awesome-icon icon="fire" />
          新纪录！
        </p>
        <div class="end-buttons">
          <button class="restart-btn" @click.stop="startGame">
            <font-awesome-icon icon="redo" />
            再来一次
          </button>
          <button class="exit-btn" @click.stop="emit('close')">
            <font-awesome-icon icon="home" />
            返回首页
          </button>
        </div>
      </div>
      
      <div
        v-for="anim in clickAnimations"
        :key="anim.id"
        class="click-effect"
        :style="{ left: anim.x + 'px', top: anim.y + 'px' }"
      >
        +1
      </div>
    </div>
  </div>
</template>

<style scoped>
.click-score-game {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
}

.stat-icon {
  font-size: 1.2rem;
}

.score-stat {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 15px;
  border-radius: 20px;
}

.game-area {
  flex: 1;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  min-height: 300px;
  user-select: none;
}

.game-area:active {
  transform: scale(0.99);
}

.start-screen,
.playing-screen,
.end-screen {
  text-align: center;
  z-index: 10;
}

.start-icon,
.end-icon {
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 20px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.start-screen h3,
.end-screen h3 {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 10px;
}

.start-screen p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 25px;
}

.start-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(255, 107, 53, 0.4);
}

.start-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
}

.click-hint {
  font-size: 5rem;
  color: rgba(255, 107, 53, 0.3);
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.hint-text {
  margin-top: 15px;
  font-size: 1.3rem;
  color: var(--primary-color);
  font-weight: bold;
}

.final-score {
  font-size: 1.5rem;
  margin: 15px 0;
}

.final-score strong {
  color: var(--primary-color);
  font-size: 2rem;
}

.new-record {
  color: #e74c3c;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.end-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.restart-btn,
.exit-btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: none;
}

.restart-btn {
  background: linear-gradient(135deg, var(--secondary-color) 0%, #f9d770 100%);
  color: var(--text-color);
}

.exit-btn {
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
}

.restart-btn:hover,
.exit-btn:hover {
  transform: scale(1.05);
}

.click-effect {
  position: absolute;
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: bold;
  pointer-events: none;
  animation: floatUp 0.5s ease-out forwards;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(1.5);
  }
}

@media (max-width: 768px) {
  .game-stats {
    padding: 10px;
  }
  
  .stat-item {
    font-size: 0.85rem;
  }
  
  .start-icon,
  .end-icon {
    font-size: 3rem;
  }
  
  .start-screen h3,
  .end-screen h3 {
    font-size: 1.4rem;
  }
  
  .start-btn {
    padding: 12px 30px;
    font-size: 1rem;
  }
}
</style>
