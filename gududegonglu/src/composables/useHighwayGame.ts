import { ref, reactive, onUnmounted, toRefs } from 'vue'

export interface Obstacle {
  id: number
  lane: number
  y: number
  width: number
  height: number
}

export interface GameConfig {
  laneCount: number
  initialSpeed: number
  maxSpeed: number
  speedIncrement: number
  obstacleInterval: number
  minObstacleInterval: number
  canvasWidth: number
  canvasHeight: number
}

const DEFAULT_CONFIG: GameConfig = {
  laneCount: 4,
  initialSpeed: 3,
  maxSpeed: 12,
  speedIncrement: 0.001,
  obstacleInterval: 90,
  minObstacleInterval: 40,
  canvasWidth: 400,
  canvasHeight: 600
}

const STORAGE_KEY = 'gududegonglu_highscore'

export function useHighwayGame(canvas: HTMLCanvasElement | null, config: Partial<GameConfig> = {}) {
  const gameConfig = { ...DEFAULT_CONFIG, ...config }
  
  const state = reactive({
    score: 0,
    highScore: loadHighScore(),
    isPlaying: false,
    isGameOver: false
  })
  
  let ctx: CanvasRenderingContext2D | null = null
  let animationId: number | null = null
  let playerLane = Math.floor(gameConfig.laneCount / 2)
  let playerX = 0
  const playerY = gameConfig.canvasHeight - 100
  const playerWidth = 40
  const playerHeight = 70
  let obstacles: Obstacle[] = []
  let obstacleIdCounter = 0
  let frameCount = 0
  let currentSpeed = gameConfig.initialSpeed
  let currentObstacleInterval = gameConfig.obstacleInterval
  let roadLineOffset = 0
  
  let touchStartX = 0
  let isDragging = false

  function loadHighScore(): number {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseInt(saved, 10) : 0
  }

  function saveHighScore() {
    if (state.score > state.highScore) {
      state.highScore = state.score
      localStorage.setItem(STORAGE_KEY, state.highScore.toString())
    }
  }

  function getLaneX(lane: number): number {
    const roadWidth = gameConfig.canvasWidth * 0.8
    const laneWidth = roadWidth / gameConfig.laneCount
    const roadStartX = (gameConfig.canvasWidth - roadWidth) / 2
    return roadStartX + laneWidth * lane + laneWidth / 2
  }

  function initCanvas() {
    if (!canvas) return
    ctx = canvas.getContext('2d')
    canvas.width = gameConfig.canvasWidth
    canvas.height = gameConfig.canvasHeight
  }

  function drawBackground() {
    if (!ctx) return
    const gradient = ctx.createLinearGradient(0, 0, 0, gameConfig.canvasHeight)
    gradient.addColorStop(0, '#f4a460')
    gradient.addColorStop(0.5, '#daa520')
    gradient.addColorStop(1, '#cd853f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight)
    
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)'
    for (let i = 0; i < 5; i++) {
      const x = (i * 100 + frameCount * 0.5) % (gameConfig.canvasWidth + 100) - 50
      ctx.beginPath()
      ctx.arc(x, 50 + i * 30, 30 + i * 10, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function drawRoad() {
    if (!ctx) return
    const roadWidth = gameConfig.canvasWidth * 0.8
    const roadStartX = (gameConfig.canvasWidth - roadWidth) / 2
    
    ctx.fillStyle = '#2d2d2d'
    ctx.fillRect(roadStartX, 0, roadWidth, gameConfig.canvasHeight)
    
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(roadStartX, 0)
    ctx.lineTo(roadStartX, gameConfig.canvasHeight)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(roadStartX + roadWidth, 0)
    ctx.lineTo(roadStartX + roadWidth, gameConfig.canvasHeight)
    ctx.stroke()
    
    const laneWidth = roadWidth / gameConfig.laneCount
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.setLineDash([30, 20])
    ctx.lineWidth = 3
    roadLineOffset = (roadLineOffset + currentSpeed * 2) % 50
    
    for (let i = 1; i < gameConfig.laneCount; i++) {
      const x = roadStartX + laneWidth * i
      ctx.beginPath()
      ctx.moveTo(x, -50 + roadLineOffset)
      ctx.lineTo(x, gameConfig.canvasHeight + roadLineOffset)
      ctx.stroke()
    }
    ctx.setLineDash([])
  }

  function drawPlayer() {
    if (!ctx) return
    const targetX = getLaneX(playerLane)
    playerX += (targetX - playerX) * 0.2
    
    const x = playerX - playerWidth / 2
    const y = playerY
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(x + 5, y + 10, playerWidth, playerHeight)
    
    const carGradient = ctx.createLinearGradient(x, y, x, y + playerHeight)
    carGradient.addColorStop(0, '#e74c3c')
    carGradient.addColorStop(1, '#c0392b')
    ctx.fillStyle = carGradient
    ctx.fillRect(x, y, playerWidth, playerHeight)
    
    ctx.fillStyle = '#3498db'
    ctx.fillRect(x + 5, y + 15, playerWidth - 10, 20)
    
    ctx.fillStyle = '#fff'
    ctx.fillRect(x + 5, y + 5, 8, 8)
    ctx.fillRect(x + playerWidth - 13, y + 5, 8, 8)
    
    ctx.fillStyle = '#e74c3c'
    ctx.fillRect(x + 8, y + playerHeight - 12, 8, 6)
    ctx.fillRect(x + playerWidth - 16, y + playerHeight - 12, 8, 6)
  }

  function drawObstacles() {
    if (!ctx) return
    obstacles.forEach(obstacle => {
      const x = getLaneX(obstacle.lane) - obstacle.width / 2
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(x + 5, obstacle.y + 5, obstacle.width, obstacle.height)
      
      const obstacleGradient = ctx!.createLinearGradient(x, obstacle.y, x, obstacle.y + obstacle.height)
      obstacleGradient.addColorStop(0, '#95a5a6')
      obstacleGradient.addColorStop(1, '#7f8c8d')
      ctx.fillStyle = obstacleGradient
      ctx.fillRect(x, obstacle.y, obstacle.width, obstacle.height)
      
      ctx.fillStyle = '#e74c3c'
      ctx.fillRect(x + 5, obstacle.y + 5, obstacle.width - 10, 5)
    })
  }

  function drawUI() {
    if (!ctx) return
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(10, 10, 150, 70)
    
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(`得分: ${state.score}`, 20, 35)
    
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f1c40f'
    ctx.fillText(`最高分: ${state.highScore}`, 20, 60)
  }

  function spawnObstacle() {
    const lane = Math.floor(Math.random() * gameConfig.laneCount)
    obstacles.push({
      id: obstacleIdCounter++,
      lane,
      y: -60,
      width: 45,
      height: 50
    })
  }

  function updateObstacles() {
    obstacles.forEach(obstacle => {
      obstacle.y += currentSpeed
    })
    obstacles = obstacles.filter(o => o.y < gameConfig.canvasHeight + 100)
  }

  function checkCollision(): boolean {
    const playerRect = {
      x: playerX - playerWidth / 2 + 5,
      y: playerY + 5,
      width: playerWidth - 10,
      height: playerHeight - 10
    }
    
    for (const obstacle of obstacles) {
      const obstacleX = getLaneX(obstacle.lane) - obstacle.width / 2
      const obstacleRect = {
        x: obstacleX + 5,
        y: obstacle.y + 5,
        width: obstacle.width - 10,
        height: obstacle.height - 10
      }
      
      if (
        playerRect.x < obstacleRect.x + obstacleRect.width &&
        playerRect.x + playerRect.width > obstacleRect.x &&
        playerRect.y < obstacleRect.y + obstacleRect.height &&
        playerRect.y + playerRect.height > obstacleRect.y
      ) {
        return true
      }
    }
    return false
  }

  function updateDifficulty() {
    if (currentSpeed < gameConfig.maxSpeed) {
      currentSpeed += gameConfig.speedIncrement
    }
    if (currentObstacleInterval > gameConfig.minObstacleInterval) {
      currentObstacleInterval -= 0.01
    }
  }

  function gameLoop() {
    if (!state.isPlaying || state.isGameOver) return
    
    frameCount++
    state.score = Math.floor(frameCount / 10)
    
    if (frameCount % Math.floor(currentObstacleInterval) === 0) {
      spawnObstacle()
    }
    
    updateObstacles()
    updateDifficulty()
    
    if (checkCollision()) {
      gameOver()
      return
    }
    
    drawBackground()
    drawRoad()
    drawObstacles()
    drawPlayer()
    drawUI()
    
    animationId = requestAnimationFrame(gameLoop)
  }

  function gameOver() {
    state.isGameOver = true
    state.isPlaying = false
    saveHighScore()
    
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  function startGame() {
    state.score = 0
    frameCount = 0
    playerLane = Math.floor(gameConfig.laneCount / 2)
    playerX = getLaneX(playerLane)
    obstacles = []
    currentSpeed = gameConfig.initialSpeed
    currentObstacleInterval = gameConfig.obstacleInterval
    state.isPlaying = true
    state.isGameOver = false
    animationId = requestAnimationFrame(gameLoop)
  }

  function moveLeft() {
    if (playerLane > 0) {
      playerLane--
    }
  }

  function moveRight() {
    if (playerLane < gameConfig.laneCount - 1) {
      playerLane++
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!state.isPlaying) return
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      moveLeft()
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      moveRight()
    }
  }

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
    isDragging = true
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || !state.isPlaying) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX
    
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        moveRight()
      } else {
        moveLeft()
      }
      touchStartX = currentX
      isDragging = false
    }
  }

  function handleTouchEnd() {
    isDragging = false
  }

  function handleMouseDown(e: MouseEvent) {
    touchStartX = e.clientX
    isDragging = true
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || !state.isPlaying) return
    const currentX = e.clientX
    const diff = currentX - touchStartX
    
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        moveRight()
      } else {
        moveLeft()
      }
      touchStartX = currentX
      isDragging = false
    }
  }

  function handleMouseUp() {
    isDragging = false
  }

  function initEventListeners() {
    window.addEventListener('keydown', handleKeyDown)
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
      canvas.addEventListener('touchend', handleTouchEnd)
      canvas.addEventListener('mousedown', handleMouseDown)
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseup', handleMouseUp)
      canvas.addEventListener('mouseleave', handleMouseUp)
    }
  }

  function removeEventListeners() {
    window.removeEventListener('keydown', handleKeyDown)
    if (canvas) {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
    }
  }

  function init() {
    initCanvas()
    initEventListeners()
    if (ctx) {
      drawBackground()
      drawRoad()
      drawPlayer()
      drawUI()
    }
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    removeEventListeners()
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    ...toRefs(state),
    init,
    startGame,
    moveLeft,
    moveRight,
    cleanup
  }
}
