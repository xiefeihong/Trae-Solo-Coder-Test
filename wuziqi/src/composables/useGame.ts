import { ref, computed } from 'vue'
import type { Player, Position, GameState } from '../types/game'
import { BOARD_SIZE, WIN_COUNT } from '../types/game'

export function useGame() {
  const gameState = ref<GameState>({
    board: createEmptyBoard(),
    currentPlayer: 'black',
    winner: null,
    lastMove: null,
    gameOver: false
  })

  const currentPlayerText = computed(() => {
    return gameState.value.currentPlayer === 'black' ? '黑棋' : '白棋'
  })

  const winnerText = computed(() => {
    if (!gameState.value.winner) return ''
    return gameState.value.winner === 'black' ? '黑棋获胜！' : '白棋获胜！'
  })

  function createEmptyBoard(): (Player | null)[][] {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  }

  function resetGame() {
    gameState.value = {
      board: createEmptyBoard(),
      currentPlayer: 'black',
      winner: null,
      lastMove: null,
      gameOver: false
    }
  }

  function makeMove(row: number, col: number): boolean {
    if (gameState.value.gameOver) return false
    if (gameState.value.board[row][col] !== null) return false

    gameState.value.board[row][col] = gameState.value.currentPlayer
    gameState.value.lastMove = { row, col }

    if (checkWin(row, col)) {
      gameState.value.winner = gameState.value.currentPlayer
      gameState.value.gameOver = true
      return true
    }

    if (checkDraw()) {
      gameState.value.gameOver = true
      return true
    }

    gameState.value.currentPlayer = gameState.value.currentPlayer === 'black' ? 'white' : 'black'
    return true
  }

  function checkWin(row: number, col: number): boolean {
    const player = gameState.value.board[row][col]
    if (!player) return false

    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1]
    ]

    for (const [dx, dy] of directions) {
      let count = 1

      for (let i = 1; i < WIN_COUNT; i++) {
        const newRow = row + dx * i
        const newCol = col + dy * i
        if (isValidPosition(newRow, newCol) && gameState.value.board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }

      for (let i = 1; i < WIN_COUNT; i++) {
        const newRow = row - dx * i
        const newCol = col - dy * i
        if (isValidPosition(newRow, newCol) && gameState.value.board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }

      if (count >= WIN_COUNT) return true
    }

    return false
  }

  function checkDraw(): boolean {
    return gameState.value.board.every(row => row.every(cell => cell !== null))
  }

  function isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
  }

  return {
    gameState,
    currentPlayerText,
    winnerText,
    makeMove,
    resetGame
  }
}
