<template>
  <div class="game-container">
    <h1 class="game-title">五子棋</h1>

    <div class="game-info">
      <div v-if="gameState.gameOver && gameState.winner" class="winner-banner">
        {{ winnerText }}
      </div>
      <div v-else-if="gameState.gameOver" class="draw-banner">
        平局！
      </div>
      <div v-else class="current-player">
        当前玩家：<span :class="gameState.currentPlayer">{{ currentPlayerText }}</span>
      </div>
    </div>

    <GameBoard
      :game-state="gameState"
      @move="handleMove"
    />

    <div class="game-controls">
      <button @click="resetGame" class="reset-button">
        重新开始
      </button>
    </div>

    <div class="game-instructions">
      <p>游戏规则：</p>
      <ul>
        <li>黑棋先行，双方轮流落子</li>
        <li>横、竖、斜方向连成五子即可获胜</li>
        <li>点击棋盘交叉点放置棋子</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGame } from './composables/useGame'
import GameBoard from './components/GameBoard.vue'

const { gameState, currentPlayerText, winnerText, makeMove, resetGame } = useGame()

function handleMove(row: number, col: number) {
  makeMove(row, col)
}
</script>

<style scoped>
.game-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.game-title {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;
}

.game-info {
  text-align: center;
  margin-bottom: 20px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-player {
  font-size: 1.2rem;
  color: #555;
}

.current-player .black {
  color: #000;
  font-weight: 600;
}

.current-player .white {
  color: #666;
  font-weight: 600;
}

.winner-banner {
  font-size: 1.5rem;
  color: #e74c3c;
  font-weight: 700;
  animation: pulse 1s ease-in-out infinite;
}

.draw-banner {
  font-size: 1.5rem;
  color: #f39c12;
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.reset-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.reset-button:active {
  transform: translateY(0);
}

.game-instructions {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
}

.game-instructions p {
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.game-instructions ul {
  padding-left: 20px;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .game-container {
    padding: 16px;
  }

  .game-title {
    font-size: 1.5rem;
  }

  .current-player {
    font-size: 1rem;
  }

  .winner-banner,
  .draw-banner {
    font-size: 1.2rem;
  }

  .reset-button {
    padding: 10px 24px;
    font-size: 0.9rem;
  }

  .game-instructions {
    font-size: 0.8rem;
  }
}
</style>
