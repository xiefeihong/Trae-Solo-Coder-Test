<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { useHighwayGame } from '../composables/useHighwayGame'

const canvasRef = ref<HTMLCanvasElement | null>(null)

const uiState = reactive({
  score: 0,
  highScore: 0,
  isPlaying: false,
  isGameOver: false
})

let actions: {
  startGame: () => void
  moveLeft: () => void
  moveRight: () => void
} | null = null

onMounted(() => {
  const game = useHighwayGame(canvasRef.value)
  game.init()
  
  actions = {
    startGame: game.startGame,
    moveLeft: game.moveLeft,
    moveRight: game.moveRight
  }
  
  watch(game.score, (val) => { uiState.score = val })
  watch(game.highScore, (val) => { uiState.highScore = val })
  watch(game.isPlaying, (val) => { uiState.isPlaying = val })
  watch(game.isGameOver, (val) => { uiState.isGameOver = val })
})

const handleStart = () => {
  actions?.startGame()
}

const handleMoveLeft = () => {
  actions?.moveLeft()
}

const handleMoveRight = () => {
  actions?.moveRight()
}
</script>

<template>
  <div class="game-container">
    <div class="game-wrapper">
      <canvas ref="canvasRef" class="game-canvas"></canvas>
      
      <div v-if="!uiState.isPlaying && !uiState.isGameOver" class="start-screen">
        <h1 class="game-title">孤独的公路</h1>
        <p class="game-subtitle">无尽跑酷</p>
        <div class="high-score">
          最高分: {{ uiState.highScore }}
        </div>
        <button class="start-btn" @click="handleStart">
          开始游戏
        </button>
        <div class="controls-hint">
          <p>← → 或 A D 键移动</p>
          <p>触摸/鼠标滑动控制</p>
        </div>
      </div>
      
      <div v-if="uiState.isGameOver" class="gameover-screen">
        <h2 class="gameover-title">Game Over</h2>
        <div class="final-score">
          得分: {{ uiState.score }}
        </div>
        <div class="new-record" v-if="uiState.score >= uiState.highScore && uiState.score > 0">
          🎉 新纪录！
        </div>
        <button class="restart-btn" @click="handleStart">
          再来一局
        </button>
      </div>
    </div>
    
    <div class="mobile-controls" v-if="uiState.isPlaying">
      <button class="control-btn left-btn" @click="handleMoveLeft">
        ←
      </button>
      <button class="control-btn right-btn" @click="handleMoveRight">
        →
      </button>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.game-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.game-canvas {
  display: block;
  border-radius: 12px;
}

.start-screen,
.gameover-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 12px;
}

.game-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #f39c12;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.game-subtitle {
  font-size: 18px;
  margin: 0 0 30px 0;
  color: #bdc3c7;
}

.high-score {
  font-size: 16px;
  margin-bottom: 30px;
  color: #f1c40f;
}

.start-btn,
.restart-btn {
  padding: 15px 50px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(231, 76, 60, 0.4);
}

.start-btn:hover,
.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.5);
}

.start-btn:active,
.restart-btn:active {
  transform: translateY(0);
}

.controls-hint {
  margin-top: 30px;
  text-align: center;
  color: #95a5a6;
  font-size: 14px;
}

.controls-hint p {
  margin: 5px 0;
}

.gameover-title {
  font-size: 42px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #e74c3c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.final-score {
  font-size: 28px;
  margin-bottom: 15px;
  color: #fff;
}

.new-record {
  font-size: 20px;
  color: #f1c40f;
  margin-bottom: 25px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.mobile-controls {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 30px;
  z-index: 100;
}

.control-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 28px;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.control-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.4);
}

@media (max-width: 480px) {
  .game-wrapper {
    transform: scale(0.9);
  }
  
  .game-title {
    font-size: 28px;
  }
  
  .gameover-title {
    font-size: 32px;
  }
  
  .mobile-controls {
    bottom: 20px;
  }
  
  .control-btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
}
</style>
