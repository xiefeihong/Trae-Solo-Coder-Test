import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { TileType, PlayerType, Position, GameState, Player } from '../types'
import { levels } from '../levels'

const TILE_SIZE = 48

export function useFireIce() {
  const gameState = reactive<GameState>({
    players: {
      fire: {
        type: PlayerType.FIRE,
        position: { x: 0, y: 0 },
        gems: 0,
        isAlive: true,
        atPortal: false
      },
      ice: {
        type: PlayerType.ICE,
        position: { x: 0, y: 0 },
        gems: 0,
        isAlive: true,
        atPortal: false
      }
    },
    currentLevel: 0,
    map: [],
    collectedGems: [],
    activatedPlates: [],
    openedDoors: [],
    gameStatus: 'playing',
    currentPlayer: PlayerType.FIRE,
    controlMode: 'dual',
    steps: 0
  })

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const currentLevelData = computed(() => levels[gameState.currentLevel])
  const totalLevels = computed(() => levels.length)

  function initLevel(levelIndex: number) {
    if (levelIndex < 0 || levelIndex >= levels.length) return

    const level = levels[levelIndex]
    gameState.currentLevel = levelIndex
    gameState.map = JSON.parse(JSON.stringify(level.map))
    gameState.collectedGems = []
    gameState.activatedPlates = []
    gameState.openedDoors = []
    gameState.gameStatus = 'playing'
    gameState.steps = 0

    gameState.players.fire = {
      type: PlayerType.FIRE,
      position: { ...level.fireStart },
      gems: 0,
      isAlive: true,
      atPortal: false
    }

    gameState.players.ice = {
      type: PlayerType.ICE,
      position: { ...level.iceStart },
      gems: 0,
      isAlive: true,
      atPortal: false
    }

    renderGame()
  }

  function resetLevel() {
    initLevel(gameState.currentLevel)
  }

  function nextLevel() {
    if (gameState.currentLevel < levels.length - 1) {
      initLevel(gameState.currentLevel + 1)
    } else {
      gameState.gameStatus = 'complete'
    }
  }

  function prevLevel() {
    if (gameState.currentLevel > 0) {
      initLevel(gameState.currentLevel - 1)
    }
  }

  function toggleControlMode() {
    gameState.controlMode = gameState.controlMode === 'single' ? 'dual' : 'single'
  }

  function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === PlayerType.FIRE 
      ? PlayerType.ICE 
      : PlayerType.FIRE
  }

  function getTileAt(position: Position): number {
    if (position.y < 0 || position.y >= gameState.map.length) return TileType.WALL
    if (position.x < 0 || position.x >= gameState.map[position.y].length) return TileType.WALL
    return gameState.map[position.y][position.x]
  }

  function isPositionCollectedGem(position: Position): boolean {
    return gameState.collectedGems.some(g => g.x === position.x && g.y === position.y)
  }

  function isDoorOpen(position: Position): boolean {
    return gameState.openedDoors.some(d => d.x === position.x && d.y === position.y)
  }

  function canMoveTo(player: Player, position: Position): boolean {
    const tile = getTileAt(position)

    if (tile === TileType.WALL || tile === TileType.ROCK) return false
    if (tile === TileType.DOOR && !isDoorOpen(position)) return false

    if (player.type === PlayerType.FIRE) {
      if (tile === TileType.LAVA) return false
    } else {
      if (tile === TileType.WATER) return false
    }

    const otherPlayer = player.type === PlayerType.FIRE 
      ? gameState.players.ice 
      : gameState.players.fire
    
    if (otherPlayer.position.x === position.x && otherPlayer.position.y === position.y) {
      return false
    }

    return true
  }

  function movePlayer(playerType: PlayerType, dx: number, dy: number) {
    if (gameState.gameStatus !== 'playing') return

    const player = gameState.players[playerType]
    if (!player.isAlive) return

    const newPosition = {
      x: player.position.x + dx,
      y: player.position.y + dy
    }

    if (!canMoveTo(player, newPosition)) return

    player.position = newPosition
    gameState.steps++

    handleTileEffect(player, newPosition)
    checkPressurePlates()
    checkWinCondition()

    renderGame()
  }

  function handleTileEffect(player: Player, position: Position) {
    const tile = getTileAt(position)

    if (player.type === PlayerType.FIRE && tile === TileType.WATER) {
      player.isAlive = false
      gameState.gameStatus = 'lost'
      return
    }
    if (player.type === PlayerType.ICE && tile === TileType.LAVA) {
      player.isAlive = false
      gameState.gameStatus = 'lost'
      return
    }

    if (player.type === PlayerType.FIRE && tile === TileType.FIRE_GEM && !isPositionCollectedGem(position)) {
      player.gems++
      gameState.collectedGems.push({ ...position })
    }
    if (player.type === PlayerType.ICE && tile === TileType.ICE_GEM && !isPositionCollectedGem(position)) {
      player.gems++
      gameState.collectedGems.push({ ...position })
    }

    if (player.type === PlayerType.FIRE && tile === TileType.FIRE_PORTAL) {
      player.atPortal = true
    } else if (player.type === PlayerType.FIRE) {
      player.atPortal = false
    }

    if (player.type === PlayerType.ICE && tile === TileType.ICE_PORTAL) {
      player.atPortal = true
    } else if (player.type === PlayerType.ICE) {
      player.atPortal = false
    }
  }

  function checkPressurePlates() {
    const plates: Position[] = []

    for (let y = 0; y < gameState.map.length; y++) {
      for (let x = 0; x < gameState.map[y].length; x++) {
        if (gameState.map[y][x] === TileType.PRESSURE_PLATE) {
          plates.push({ x, y })
        }
      }
    }

    const newlyActivated: Position[] = []
    for (const plate of plates) {
      const fireOnPlate = gameState.players.fire.position.x === plate.x && 
                          gameState.players.fire.position.y === plate.y
      const iceOnPlate = gameState.players.ice.position.x === plate.x && 
                         gameState.players.ice.position.y === plate.y
      
      if (fireOnPlate || iceOnPlate) {
        newlyActivated.push(plate)
      }
    }

    const prevActivatedCount = gameState.activatedPlates.length
    gameState.activatedPlates = newlyActivated

    if (newlyActivated.length > 0 && prevActivatedCount === 0) {
      for (let y = 0; y < gameState.map.length; y++) {
        for (let x = 0; x < gameState.map[y].length; x++) {
          if (gameState.map[y][x] === TileType.DOOR) {
            gameState.openedDoors.push({ x, y })
          }
        }
      }
    } else if (newlyActivated.length === 0 && prevActivatedCount > 0) {
      gameState.openedDoors = []
    }
  }

  function checkWinCondition() {
    const level = levels[gameState.currentLevel]
    
    const fireHasAllGems = gameState.players.fire.gems >= level.totalFireGems
    const iceHasAllGems = gameState.players.ice.gems >= level.totalIceGems
    
    if (fireHasAllGems && iceHasAllGems && 
        gameState.players.fire.atPortal && 
        gameState.players.ice.atPortal) {
      gameState.gameStatus = 'won'
    }
  }

  function renderGame() {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mapWidth = gameState.map[0]?.length || 0
    const mapHeight = gameState.map.length

    canvas.width = mapWidth * TILE_SIZE
    canvas.height = mapHeight * TILE_SIZE

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < gameState.map.length; y++) {
      for (let x = 0; x < gameState.map[y].length; x++) {
        drawTile(ctx, x, y, gameState.map[y][x])
      }
    }

    drawPlayer(ctx, gameState.players.ice)
    drawPlayer(ctx, gameState.players.fire)
  }

  function drawTile(ctx: CanvasRenderingContext2D, x: number, y: number, tile: number) {
    const px = x * TILE_SIZE
    const py = y * TILE_SIZE

    ctx.fillStyle = '#2d3748'
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)

    switch (tile) {
      case TileType.WALL:
        ctx.fillStyle = '#1a202c'
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        ctx.strokeStyle = '#4a5568'
        ctx.lineWidth = 2
        ctx.strokeRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8)
        break

      case TileType.GROUND:
        ctx.fillStyle = '#8b7355'
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        break

      case TileType.LAVA:
        const lavaGradient = ctx.createLinearGradient(px, py, px, py + TILE_SIZE)
        lavaGradient.addColorStop(0, '#ff6b35')
        lavaGradient.addColorStop(0.5, '#ff4500')
        lavaGradient.addColorStop(1, '#dc143c')
        ctx.fillStyle = lavaGradient
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        
        ctx.fillStyle = 'rgba(255, 200, 100, 0.5)'
        for (let i = 0; i < 3; i++) {
          const bx = px + 10 + i * 12
          const by = py + 15 + Math.sin(Date.now() / 200 + i) * 5
          ctx.beginPath()
          ctx.arc(bx, by, 4, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case TileType.WATER:
        const waterGradient = ctx.createLinearGradient(px, py, px, py + TILE_SIZE)
        waterGradient.addColorStop(0, '#4fc3f7')
        waterGradient.addColorStop(0.5, '#29b6f6')
        waterGradient.addColorStop(1, '#03a9f4')
        ctx.fillStyle = waterGradient
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1
        for (let i = 0; i < 2; i++) {
          ctx.beginPath()
          ctx.moveTo(px + 5, py + 20 + i * 10 + Math.sin(Date.now() / 300 + i) * 3)
          ctx.quadraticCurveTo(px + TILE_SIZE / 2, py + 15 + i * 10, px + TILE_SIZE - 5, py + 20 + i * 10 + Math.sin(Date.now() / 300 + i + 1) * 3)
          ctx.stroke()
        }
        break

      case TileType.FIRE_GEM:
        if (!isPositionCollectedGem({ x, y })) {
          ctx.fillStyle = '#8b7355'
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
          
          ctx.save()
          ctx.translate(px + TILE_SIZE / 2, py + TILE_SIZE / 2)
          ctx.rotate(Math.PI / 4)
          
          const fireGemGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15)
          fireGemGradient.addColorStop(0, '#ffeb3b')
          fireGemGradient.addColorStop(0.5, '#ff9800')
          fireGemGradient.addColorStop(1, '#f44336')
          ctx.fillStyle = fireGemGradient
          ctx.fillRect(-12, -12, 24, 24)
          
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.strokeRect(-12, -12, 24, 24)
          ctx.restore()
        } else {
          ctx.fillStyle = '#8b7355'
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        }
        break

      case TileType.ICE_GEM:
        if (!isPositionCollectedGem({ x, y })) {
          ctx.fillStyle = '#8b7355'
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
          
          ctx.save()
          ctx.translate(px + TILE_SIZE / 2, py + TILE_SIZE / 2)
          ctx.rotate(Math.PI / 4)
          
          const iceGemGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15)
          iceGemGradient.addColorStop(0, '#e1f5fe')
          iceGemGradient.addColorStop(0.5, '#81d4fa')
          iceGemGradient.addColorStop(1, '#29b6f6')
          ctx.fillStyle = iceGemGradient
          ctx.fillRect(-12, -12, 24, 24)
          
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 2
          ctx.strokeRect(-12, -12, 24, 24)
          ctx.restore()
        } else {
          ctx.fillStyle = '#8b7355'
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        }
        break

      case TileType.FIRE_PORTAL:
        ctx.fillStyle = '#8b7355'
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        
        const firePortalGradient = ctx.createRadialGradient(
          px + TILE_SIZE / 2, py + TILE_SIZE / 2, 5,
          px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 - 5
        )
        firePortalGradient.addColorStop(0, '#fff')
        firePortalGradient.addColorStop(0.3, '#ffeb3b')
        firePortalGradient.addColorStop(0.6, '#ff9800')
        firePortalGradient.addColorStop(1, '#f44336')
        ctx.fillStyle = firePortalGradient
        ctx.beginPath()
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 - 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.strokeStyle = '#f44336'
        ctx.lineWidth = 3
        ctx.stroke()
        break

      case TileType.ICE_PORTAL:
        ctx.fillStyle = '#8b7355'
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        
        const icePortalGradient = ctx.createRadialGradient(
          px + TILE_SIZE / 2, py + TILE_SIZE / 2, 5,
          px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 - 5
        )
        icePortalGradient.addColorStop(0, '#fff')
        icePortalGradient.addColorStop(0.3, '#e1f5fe')
        icePortalGradient.addColorStop(0.6, '#81d4fa')
        icePortalGradient.addColorStop(1, '#29b6f6')
        ctx.fillStyle = icePortalGradient
        ctx.beginPath()
        ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, TILE_SIZE / 2 - 8, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.strokeStyle = '#29b6f6'
        ctx.lineWidth = 3
        ctx.stroke()
        break

      case TileType.PRESSURE_PLATE:
        ctx.fillStyle = '#8b7355'
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        
        const isActivated = gameState.activatedPlates.some(p => p.x === x && p.y === y)
        ctx.fillStyle = isActivated ? '#4caf50' : '#9e9e9e'
        ctx.fillRect(px + 8, py + TILE_SIZE - 16, TILE_SIZE - 16, 8)
        ctx.strokeStyle = '#616161'
        ctx.lineWidth = 2
        ctx.strokeRect(px + 8, py + TILE_SIZE - 16, TILE_SIZE - 16, 8)
        break

      case TileType.DOOR:
        const isOpen = isDoorOpen({ x, y })
        if (!isOpen) {
          ctx.fillStyle = '#795548'
          ctx.fillRect(px + 6, py + 4, TILE_SIZE - 12, TILE_SIZE - 8)
          
          ctx.fillStyle = '#5d4037'
          ctx.fillRect(px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 12)
          
          ctx.fillStyle = '#ffd700'
          ctx.beginPath()
          ctx.arc(px + TILE_SIZE - 14, py + TILE_SIZE / 2, 4, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = '#8b7355'
          ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        }
        break

      default:
        ctx.fillStyle = '#8b7355'
        ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4)
    }
  }

  function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    const px = player.position.x * TILE_SIZE
    const py = player.position.y * TILE_SIZE

    ctx.save()
    ctx.translate(px + TILE_SIZE / 2, py + TILE_SIZE / 2)

    if (player.type === PlayerType.FIRE) {
      const bodyGradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, 18)
      bodyGradient.addColorStop(0, '#ffeb3b')
      bodyGradient.addColorStop(0.5, '#ff9800')
      bodyGradient.addColorStop(1, '#f44336')
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.arc(0, 2, 16, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ff5722'
      ctx.beginPath()
      ctx.moveTo(-10, -10)
      ctx.quadraticCurveTo(-8, -20, 0, -18)
      ctx.quadraticCurveTo(8, -20, 10, -10)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(-5, -8)
      ctx.quadraticCurveTo(-3, -16, 0, -14)
      ctx.quadraticCurveTo(3, -16, 5, -8)
      ctx.fillStyle = '#ffeb3b'
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-5, 0, 4, 0, Math.PI * 2)
      ctx.arc(5, 0, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(-5, 0, 2, 0, Math.PI * 2)
      ctx.arc(5, 0, 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const bodyGradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, 18)
      bodyGradient.addColorStop(0, '#fff')
      bodyGradient.addColorStop(0.5, '#b3e5fc')
      bodyGradient.addColorStop(1, '#03a9f4')
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.arc(0, 2, 16, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 2
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const x1 = Math.cos(angle) * 8
        const y1 = Math.sin(angle) * 8 - 2
        const x2 = Math.cos(angle) * 14
        const y2 = Math.sin(angle) * 14 - 2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(-5, 0, 4, 0, Math.PI * 2)
      ctx.arc(5, 0, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0288d1'
      ctx.beginPath()
      ctx.arc(-5, 0, 2, 0, Math.PI * 2)
      ctx.arc(5, 0, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    if (!player.isAlive) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.arc(0, 0, 20, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.strokeStyle = '#f44336'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(-10, -10)
      ctx.lineTo(10, 10)
      ctx.moveTo(10, -10)
      ctx.lineTo(-10, 10)
      ctx.stroke()
    }

    ctx.restore()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (gameState.gameStatus !== 'playing') return

    if (e.key === 'r' || e.key === 'R') {
      resetLevel()
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      switchPlayer()
      return
    }

    if (gameState.controlMode === 'dual') {
      switch (e.key) {
        case 'w':
        case 'W':
          movePlayer(PlayerType.ICE, 0, -1)
          break
        case 's':
        case 'S':
          movePlayer(PlayerType.ICE, 0, 1)
          break
        case 'a':
        case 'A':
          movePlayer(PlayerType.ICE, -1, 0)
          break
        case 'd':
        case 'D':
          movePlayer(PlayerType.ICE, 1, 0)
          break
        case 'ArrowUp':
          e.preventDefault()
          movePlayer(PlayerType.FIRE, 0, -1)
          break
        case 'ArrowDown':
          e.preventDefault()
          movePlayer(PlayerType.FIRE, 0, 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          movePlayer(PlayerType.FIRE, -1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePlayer(PlayerType.FIRE, 1, 0)
          break
      }
    } else {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          movePlayer(gameState.currentPlayer, 0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          movePlayer(gameState.currentPlayer, 0, 1)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePlayer(gameState.currentPlayer, -1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePlayer(gameState.currentPlayer, 1, 0)
          break
      }
    }
  }

  onMounted(() => {
    initLevel(0)
    window.addEventListener('keydown', handleKeyDown)
    
    function animate() {
      if (gameState.gameStatus === 'playing') {
        renderGame()
      }
      requestAnimationFrame(animate)
    }
    animate()
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    gameState,
    canvasRef,
    currentLevelData,
    totalLevels,
    initLevel,
    resetLevel,
    nextLevel,
    prevLevel,
    toggleControlMode,
    switchPlayer,
    movePlayer
  }
}
