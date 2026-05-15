import type { GameState } from '../types'
import { getBuildingConfig, getSoldierConfig, getZombieConfig, getTotalWaves } from '../config'

let animationTime = 0

export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number) => {
  animationTime += 0.05
  ctx.clearRect(0, 0, width, height)

  drawBackground(ctx, width, height)
  drawBattlefieldLines(ctx, width, height)
  drawBase(ctx, state)
  drawBuildings(ctx, state)
  drawSoldiers(ctx, state)
  drawZombies(ctx, state)
  drawEffects(ctx, state)

  if (state.isPaused) {
    drawPauseOverlay(ctx, width, height)
  }

  if (state.isGameOver) {
    drawGameOver(ctx, width, height, state)
  }

  if (state.isVictory) {
    drawVictory(ctx, width, height, state)
  }
}

const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.2)
  skyGradient.addColorStop(0, '#1a1a2e')
  skyGradient.addColorStop(1, '#2d2d44')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, width, height * 0.15)

  const grassGradient = ctx.createLinearGradient(0, height * 0.15, 0, height)
  grassGradient.addColorStop(0, '#3d7c23')
  grassGradient.addColorStop(0.5, '#2d5a1a')
  grassGradient.addColorStop(1, '#1e3d12')
  ctx.fillStyle = grassGradient
  ctx.fillRect(0, height * 0.15, width, height * 0.85)

  ctx.fillStyle = 'rgba(60, 120, 35, 0.6)'
  for (let i = 0; i < 200; i++) {
    const x = (i * 17 + Math.sin(animationTime + i) * 2) % width
    const y = height * 0.18 + (i * 23 % (height * 0.78))
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - 2, y - 8 - Math.sin(animationTime + i) * 2)
    ctx.lineTo(x + 2, y - 6 - Math.sin(animationTime + i + 0.5) * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(139, 90, 43, 0.3)'
  for (let i = 0; i < 30; i++) {
    const x = (i * 41 + 50) % width
    const y = height * 0.25 + (i * 37 % (height * 0.65))
    ctx.beginPath()
    ctx.ellipse(x, y, 15 + i % 3 * 5, 8 + i % 2 * 3, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  for (let i = 0; i < 8; i++) {
    const x = ((i * 150 + animationTime * 10) % (width + 100)) - 50
    const y = 20 + i * 8
    ctx.beginPath()
    ctx.arc(x, y, 20 + i * 3, 0, Math.PI * 2)
    ctx.arc(x + 25, y - 5, 15 + i * 2, 0, Math.PI * 2)
    ctx.arc(x + 45, y, 18 + i * 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

const drawBattlefieldLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const buildingZoneX = width * 0.3
  const dangerZoneX = width * 0.7

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)'
  ctx.lineWidth = 3
  ctx.setLineDash([15, 10])
  ctx.beginPath()
  ctx.moveTo(buildingZoneX, height * 0.15)
  ctx.lineTo(buildingZoneX, height)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 215, 0, 0.3)'
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.save()
  ctx.translate(buildingZoneX, height * 0.12)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('🏗️ 建造区域', 0, 0)
  ctx.restore()

  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([10, 15])
  ctx.beginPath()
  ctx.moveTo(dangerZoneX, height * 0.15)
  ctx.lineTo(dangerZoneX, height)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
  ctx.save()
  ctx.translate(dangerZoneX + 20, height * 0.5)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('⚠️ 僵尸出生点', 0, 0)
  ctx.restore()

  ctx.setLineDash([])

  ctx.fillStyle = 'rgba(100, 60, 30, 0.4)'
  for (let row = 0; row < 5; row++) {
    const y = height * 0.2 + row * 100
    ctx.fillRect(0, y, width, 5)
  }
}

const drawBase = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const baseX = 10
  const baseY = 50
  const baseWidth = 60
  const baseHeight = 520

  ctx.fillStyle = '#5a4030'
  ctx.fillRect(baseX, baseY, baseWidth, baseHeight)

  ctx.fillStyle = '#8b6914'
  ctx.fillRect(baseX - 5, baseY, baseWidth + 10, 15)
  ctx.fillRect(baseX - 5, baseY + baseHeight - 15, baseWidth + 10, 15)

  const brickRows = 12
  const brickCols = 3
  for (let row = 0; row < brickRows; row++) {
    for (let col = 0; col < brickCols; col++) {
      const brickX = baseX + 5 + col * 18
      const brickY = baseY + 20 + row * 42 + (col % 2 ? 20 : 0)
      ctx.fillStyle = row % 2 ? '#6b4423' : '#5a3a18'
      ctx.fillRect(brickX, brickY, 16, 38)
      ctx.strokeStyle = '#3a2a10'
      ctx.lineWidth = 1
      ctx.strokeRect(brickX, brickY, 16, 38)
    }
  }

  ctx.fillStyle = '#2d1810'
  ctx.beginPath()
  ctx.moveTo(baseX + 5, baseY + baseHeight)
  ctx.lineTo(baseX + baseWidth / 2, baseY + baseHeight - 30)
  ctx.lineTo(baseX + baseWidth - 5, baseY + baseHeight)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('🏰', baseX + baseWidth / 2, baseY + 45)

  const healthPercent = state.baseHealth / state.maxBaseHealth
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(baseX - 5, baseY + baseHeight + 5, baseWidth + 10, 18)
  
  const healthColor = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336'
  ctx.fillStyle = healthColor
  ctx.fillRect(baseX - 3, baseY + baseHeight + 8, (baseWidth + 6) * healthPercent, 12)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px Arial'
  ctx.fillText('基地', baseX + baseWidth / 2, baseY + baseHeight + 35)

  if (healthPercent < 0.3) {
    ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(animationTime * 3) * 0.2})`
    ctx.fillRect(baseX, baseY, baseWidth, baseHeight)
  }
}

const drawBuildings = (ctx: CanvasRenderingContext2D, state: GameState) => {
  state.buildings.forEach(building => {
    const config = getBuildingConfig(building.configId)
    if (!config) return

    const x = building.position.x
    const y = building.position.y
    const w = 70
    const h = 60

    if (building.isDestroyed) {
      drawDestroyedBuilding(ctx, x, y, w, h)
      return
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(x + w / 2, y + h + 5, w / 2, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    switch (building.configId) {
      case 'cement-factory':
        drawCementFactory(ctx, x, y, w, h, building.level)
        break
      case 'wood-workshop':
        drawWoodWorkshop(ctx, x, y, w, h, building.level)
        break
      case 'steel-factory':
        drawSteelFactory(ctx, x, y, w, h, building.level)
        break
      case 'explosive-lab':
        drawExplosiveLab(ctx, x, y, w, h, building.level)
        break
      case 'repair-station':
        drawRepairStation(ctx, x, y, w, h, building.level)
        break
    }

    const healthPercent = building.health / building.maxHealth
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(x, y - 12, w, 8)
    
    const healthColor = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FFC107' : '#F44336'
    ctx.fillStyle = healthColor
    ctx.fillRect(x + 1, y - 11, (w - 2) * healthPercent, 6)

    if (state.selectedBuilding?.id === building.id) {
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x - 5, y - 15, w + 10, h + 25)
      ctx.setLineDash([])
      
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 15
      ctx.strokeRect(x - 5, y - 15, w + 10, h + 25)
      ctx.shadowBlur = 0
    }
  })
}

const drawDestroyedBuilding = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = '#4a4a4a'
  ctx.fillRect(x, y + h * 0.5, w, h * 0.5)

  ctx.fillStyle = '#666'
  for (let i = 0; i < 5; i++) {
    const rx = x + 10 + i * 12
    const ry = y + h * 0.6 + (i % 2) * 10
    ctx.beginPath()
    ctx.moveTo(rx, ry)
    ctx.lineTo(rx + 8, ry - 15 - i * 3)
    ctx.lineTo(rx + 15, ry)
    ctx.fill()
  }

  ctx.fillStyle = '#888'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('💀 已摧毁', x + w / 2, y + h + 15)
}

const drawCementFactory = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number) => {
  ctx.fillStyle = '#8B7355'
  ctx.fillRect(x + 5, y + 10, w - 10, h - 10)

  ctx.fillStyle = '#6B5344'
  ctx.fillRect(x + 5, y + 10, w - 10, 8)
  ctx.fillRect(x + 5, y + h - 8, w - 10, 8)

  ctx.fillStyle = '#A0926A'
  ctx.beginPath()
  ctx.moveTo(x + w / 2 - 15, y + 10)
  ctx.lineTo(x + w / 2 - 10, y - 15)
  ctx.lineTo(x + w / 2 + 10, y - 15)
  ctx.lineTo(x + w / 2 + 15, y + 10)
  ctx.fill()

  if (level >= 1) {
    ctx.fillStyle = '#5D4037'
    ctx.fillRect(x + 10, y + 25, 15, 25)
  }
  if (level >= 2) {
    ctx.fillRect(x + w - 25, y + 25, 15, 25)
  }
  if (level >= 3) {
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(x + w / 2, y - 8, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = `rgba(150, 150, 150, ${0.3 + Math.sin(animationTime * 2) * 0.2})`
  ctx.beginPath()
  ctx.ellipse(x + w / 2, y - 20, 8 + level * 2, 12 + level * 3, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Lv.${level}`, x + w / 2, y + h - 5)
}

const drawWoodWorkshop = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number) => {
  ctx.fillStyle = '#DEB887'
  ctx.fillRect(x + 3, y + 15, w - 6, h - 15)

  ctx.fillStyle = '#8B4513'
  ctx.beginPath()
  ctx.moveTo(x, y + 15)
  ctx.lineTo(x + w / 2, y - 5)
  ctx.lineTo(x + w, y + 15)
  ctx.fill()

  ctx.strokeStyle = '#654321'
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(x + 5 + i * 16, y + 18)
    ctx.lineTo(x + 5 + i * 16, y + h - 5)
    ctx.stroke()
  }

  ctx.fillStyle = '#A0522D'
  ctx.fillRect(x + 25, y + 28, 20, 25)
  ctx.fillStyle = '#654321'
  ctx.beginPath()
  ctx.arc(x + 35, y + 38, 3, 0, Math.PI * 2)
  ctx.fill()

  if (level >= 2) {
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(x + 8, y + 22, 12, 12)
    ctx.strokeStyle = '#5D4037'
    ctx.strokeRect(x + 8, y + 22, 12, 12)
  }
  if (level >= 3) {
    ctx.fillRect(x + w - 20, y + 22, 12, 12)
    ctx.strokeRect(x + w - 20, y + 22, 12, 12)
  }

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Lv.${level}`, x + w / 2, y + h - 5)
}

const drawSteelFactory = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number) => {
  ctx.fillStyle = '#708090'
  ctx.fillRect(x, y + 5, w, h - 5)

  ctx.fillStyle = '#4A4A4A'
  ctx.fillRect(x + 5, y, 15, 20)
  ctx.fillRect(x + w - 20, y, 15, 20)

  ctx.fillStyle = '#2F4F4F'
  ctx.fillRect(x + 8, y + 25, w - 16, h - 30)

  ctx.strokeStyle = '#1C1C1C'
  ctx.lineWidth = 3
  ctx.strokeRect(x + 2, y + 7, w - 4, h - 9)

  const fireIntensity = 0.5 + Math.sin(animationTime * 4) * 0.3
  ctx.fillStyle = `rgba(255, ${100 + fireIntensity * 100}, 0, ${0.6 + fireIntensity * 0.3})`
  ctx.beginPath()
  ctx.moveTo(x + w / 2 - 10, y + 25)
  ctx.quadraticCurveTo(x + w / 2 - 5, y + 10 - level * 3, x + w / 2, y + 5 - level * 5)
  ctx.quadraticCurveTo(x + w / 2 + 5, y + 10 - level * 3, x + w / 2 + 10, y + 25)
  ctx.fill()

  if (level >= 2) {
    ctx.fillStyle = '#B8860B'
    ctx.fillRect(x + 12, y + 35, 8, 15)
    ctx.fillRect(x + w - 20, y + 35, 8, 15)
  }
  if (level >= 3) {
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(x + w / 2, y + 50, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = 'bold 10px Arial'
    ctx.fillText('⚙', x + w / 2, y + 53)
  }

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Lv.${level}`, x + w / 2, y + h - 5)
}

const drawExplosiveLab = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number) => {
  ctx.fillStyle = '#CD5C5C'
  ctx.beginPath()
  ctx.moveTo(x + 5, y + h)
  ctx.lineTo(x + 10, y + 10)
  ctx.lineTo(x + w - 10, y + 10)
  ctx.lineTo(x + w - 5, y + h)
  ctx.fill()

  ctx.fillStyle = '#8B0000'
  ctx.fillRect(x + 15, y + 15, w - 30, 10)

  ctx.fillStyle = '#2F4F4F'
  ctx.beginPath()
  ctx.moveTo(x + w / 2 - 8, y + 15)
  ctx.lineTo(x + w / 2 - 5, y - 10)
  ctx.lineTo(x + w / 2 + 5, y - 10)
  ctx.lineTo(x + w / 2 + 8, y + 15)
  ctx.fill()

  const bubbleY = y - 15 - Math.abs(Math.sin(animationTime * 3)) * 10
  ctx.fillStyle = `rgba(255, 165, 0, ${0.5 + Math.sin(animationTime * 5) * 0.3})`
  ctx.beginPath()
  ctx.arc(x + w / 2, bubbleY, 5 + level * 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('⚗', x + w / 2, y + 45)

  if (level >= 2) {
    ctx.fillStyle = '#FF6347'
    ctx.beginPath()
    ctx.arc(x + 15, y + 40, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  if (level >= 3) {
    ctx.beginPath()
    ctx.arc(x + w - 15, y + 40, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 10px Arial'
  ctx.fillText(`Lv.${level}`, x + w / 2, y + h - 5)
}

const drawRepairStation = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, level: number) => {
  ctx.fillStyle = '#98FB98'
  ctx.fillRect(x + 3, y + 8, w - 6, h - 8)

  ctx.fillStyle = '#228B22'
  ctx.beginPath()
  ctx.moveTo(x, y + 8)
  ctx.lineTo(x + w / 2, y - 8)
  ctx.lineTo(x + w, y + 8)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.fillRect(x + w / 2 - 12, y + 25, 24, 20)
  ctx.fillStyle = '#FF0000'
  ctx.fillRect(x + w / 2 - 2, y + 28, 4, 14)
  ctx.fillRect(x + w / 2 - 8, y + 33, 16, 4)

  const pulseSize = 20 + Math.sin(animationTime * 2) * 5
  ctx.strokeStyle = `rgba(50, 205, 50, ${0.3 + Math.sin(animationTime * 2) * 0.2})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x + w / 2, y + h / 2 + 5, pulseSize + level * 5, 0, Math.PI * 2)
  ctx.stroke()

  if (level >= 2) {
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(x + 10, y + 18, 10, 10)
  }
  if (level >= 3) {
    ctx.fillRect(x + w - 20, y + 18, 10, 10)
  }

  ctx.fillStyle = '#000'
  ctx.font = 'bold 10px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Lv.${level}`, x + w / 2, y + h - 5)
}

const drawSoldiers = (ctx: CanvasRenderingContext2D, state: GameState) => {
  state.soldiers.forEach(soldier => {
    const config = getSoldierConfig(soldier.configId)
    if (!config) return

    const x = soldier.position.x
    const y = soldier.position.y
    const size = config.size

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(x, y + size / 2 + 2, size / 2, size / 4, 0, 0, Math.PI * 2)
    ctx.fill()

    switch (soldier.configId) {
      case 'worker':
        drawWorker(ctx, x, y, size, soldier.isFighting)
        break
      case 'carpenter':
        drawCarpenter(ctx, x, y, size, soldier.isFighting)
        break
      case 'blacksmith':
        drawBlacksmith(ctx, x, y, size, soldier.isFighting)
        break
      case 'bomber':
        drawBomber(ctx, x, y, size, soldier.isFighting)
        break
      case 'repairman':
        drawRepairman(ctx, x, y, size, soldier.isFighting)
        break
    }

    const healthPercent = soldier.health / soldier.maxHealth
    if (healthPercent < 1) {
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(x - size / 2, y - size / 2 - 10, size, 5)
      ctx.fillStyle = '#4CAF50'
      ctx.fillRect(x - size / 2 + 1, y - size / 2 - 9, (size - 2) * healthPercent, 3)
    }
  })
}

const drawWorker = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const bounce = isFighting ? Math.sin(animationTime * 10) * 2 : 0

  ctx.fillStyle = '#D2B48C'
  ctx.beginPath()
  ctx.arc(x, y + bounce, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFDAB9'
  ctx.beginPath()
  ctx.arc(x, y - size / 3 + bounce, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8B4513'
  ctx.fillRect(x - 5, y - size / 2 + bounce, 10, 5)

  if (isFighting) {
    ctx.fillStyle = '#A0522D'
    ctx.save()
    ctx.translate(x + size / 2, y + bounce)
    ctx.rotate(Math.sin(animationTime * 15) * 0.3)
    ctx.fillRect(0, -3, 12, 4)
    ctx.restore()
  }

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 2, y - size / 3 + bounce, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 2, y - size / 3 + bounce, 1.5, 0, Math.PI * 2)
  ctx.fill()
}

const drawCarpenter = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const bounce = isFighting ? Math.sin(animationTime * 8) * 2 : 0

  ctx.fillStyle = '#8B4513'
  ctx.beginPath()
  ctx.moveTo(x - size / 2, y + size / 2 + bounce)
  ctx.lineTo(x - size / 3, y - size / 3 + bounce)
  ctx.lineTo(x + size / 3, y - size / 3 + bounce)
  ctx.lineTo(x + size / 2, y + size / 2 + bounce)
  ctx.fill()

  ctx.fillStyle = '#FFDAB9'
  ctx.beginPath()
  ctx.arc(x, y - size / 2.5 + bounce, size / 3.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#228B22'
  ctx.beginPath()
  ctx.moveTo(x - size / 3, y - size / 2.5 + bounce)
  ctx.lineTo(x, y - size / 2 - 8 + bounce)
  ctx.lineTo(x + size / 3, y - size / 2.5 + bounce)
  ctx.fill()

  if (isFighting) {
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 3
    ctx.save()
    ctx.translate(x + size / 2, y + bounce)
    ctx.rotate(Math.sin(animationTime * 12) * 0.4)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(15, -5)
    ctx.stroke()
    
    ctx.fillStyle = '#C0C0C0'
    ctx.beginPath()
    ctx.moveTo(15, -5)
    ctx.lineTo(22, -8)
    ctx.lineTo(22, -2)
    ctx.fill()
    ctx.restore()
  }

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 2, y - size / 2.5 + bounce, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 2, y - size / 2.5 + bounce, 1.5, 0, Math.PI * 2)
  ctx.fill()
}

const drawBlacksmith = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const bounce = isFighting ? Math.sin(animationTime * 6) * 2 : 0

  ctx.fillStyle = '#4A4A4A'
  ctx.beginPath()
  ctx.arc(x, y + bounce, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#2F2F2F'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y + bounce, size / 2.5, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#696969'
  ctx.beginPath()
  ctx.arc(x, y - size / 3 + bounce, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(x - 4, y - size / 3 + bounce, 3, 0, Math.PI * 2)
  ctx.arc(x + 4, y - size / 3 + bounce, 3, 0, Math.PI * 2)
  ctx.fill()

  if (isFighting) {
    ctx.fillStyle = '#C0C0C0'
    ctx.save()
    ctx.translate(x + size / 2, y + bounce)
    ctx.rotate(Math.sin(animationTime * 10) * 0.3)
    ctx.fillRect(0, -5, 18, 10)
    ctx.fillStyle = '#808080'
    ctx.fillRect(15, -7, 8, 14)
    ctx.restore()
  }

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(x, y + bounce, 4, 0, Math.PI * 2)
  ctx.fill()
}

const drawBomber = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const bounce = isFighting ? Math.sin(animationTime * 9) * 2 : 0

  ctx.fillStyle = '#8B0000'
  ctx.beginPath()
  ctx.arc(x, y + bounce, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2F2F2F'
  ctx.beginPath()
  ctx.arc(x, y - size / 3 + bounce, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.moveTo(x, y - size / 3 + bounce)
  ctx.quadraticCurveTo(x + 3, y - size / 2 - 5 + bounce, x + 2, y - size / 2 - 10 + bounce)
  ctx.quadraticCurveTo(x, y - size / 2 - 5 + bounce, x - 2, y - size / 2 - 10 + bounce)
  ctx.quadraticCurveTo(x - 3, y - size / 2 - 5 + bounce, x, y - size / 3 + bounce)
  ctx.fill()

  ctx.fillStyle = '#FF4500'
  const flameSize = 5 + Math.sin(animationTime * 15) * 3
  ctx.beginPath()
  ctx.arc(x, y - size / 2 - 12 + bounce, flameSize, 0, Math.PI * 2)
  ctx.fill()

  if (isFighting) {
    ctx.fillStyle = '#2F2F2F'
    ctx.save()
    ctx.translate(x + size / 2 - 5, y + bounce)
    ctx.beginPath()
    ctx.arc(0, 0, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x - 3, y - size / 3 + bounce, 2.5, 0, Math.PI * 2)
  ctx.arc(x + 3, y - size / 3 + bounce, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 3, y - size / 3 + bounce, 1.2, 0, Math.PI * 2)
  ctx.arc(x + 3, y - size / 3 + bounce, 1.2, 0, Math.PI * 2)
  ctx.fill()
}

const drawRepairman = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const bounce = Math.sin(animationTime * 5) * 1

  ctx.fillStyle = '#32CD32'
  ctx.beginPath()
  ctx.arc(x, y + bounce, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFDAB9'
  ctx.beginPath()
  ctx.arc(x, y - size / 3 + bounce, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.fillRect(x - 5, y - size / 2 - 2 + bounce, 10, 6)
  ctx.fillStyle = '#32CD32'
  ctx.fillRect(x - 4, y - size / 2 - 1 + bounce, 8, 4)

  ctx.fillStyle = '#fff'
  ctx.fillRect(x - size / 3 - 2, y - 5 + bounce, size / 1.5 + 4, size / 1.5 + 4)
  ctx.fillStyle = '#FF0000'
  ctx.fillRect(x - 2, y - size / 4 + bounce, 4, size / 2)
  ctx.fillRect(x - size / 4, y + bounce, size / 2, 4)

  if (isFighting) {
    ctx.strokeStyle = `rgba(50, 205, 50, ${0.5 + Math.sin(animationTime * 8) * 0.3})`
    ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(x, y + bounce, size / 2 + 8 + i * 6, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 2, y - size / 3 + bounce, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 2, y - size / 3 + bounce, 1.5, 0, Math.PI * 2)
  ctx.fill()
}

const drawZombies = (ctx: CanvasRenderingContext2D, state: GameState) => {
  state.zombies.forEach(zombie => {
    const config = getZombieConfig(zombie.configId)
    if (!config) return

    const x = zombie.position.x
    const y = zombie.position.y
    const size = config.size

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(x, y + size / 2 + 2, size / 2, size / 4, 0, 0, Math.PI * 2)
    ctx.fill()

    switch (zombie.configId) {
      case 'normal':
        drawNormalZombie(ctx, x, y, size, zombie.isFighting)
        break
      case 'conehead':
        drawConeheadZombie(ctx, x, y, size, zombie.isFighting)
        break
      case 'flying':
        drawFlyingZombie(ctx, x, y, size, zombie.isFighting)
        break
      case 'explosive':
        drawExplosiveZombie(ctx, x, y, size, zombie.isFighting)
        break
      case 'boss':
        drawBossZombie(ctx, x, y, size, zombie.isFighting)
        break
    }

    const healthPercent = zombie.health / zombie.maxHealth
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(x - size / 2, y - size / 2 - 12, size, 6)
    ctx.fillStyle = '#F44336'
    ctx.fillRect(x - size / 2 + 1, y - size / 2 - 11, (size - 2) * healthPercent, 4)
  })
}

const drawNormalZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const wobble = Math.sin(animationTime * 4 + x) * 3

  ctx.fillStyle = '#556B2F'
  ctx.beginPath()
  ctx.arc(x + wobble, y, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#6B8E23'
  ctx.beginPath()
  ctx.arc(x + wobble, y - size / 3, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FF0000'
  ctx.beginPath()
  ctx.arc(x - 4 + wobble, y - size / 3, 3, 0, Math.PI * 2)
  ctx.arc(x + 4 + wobble, y - size / 3, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 4 + wobble, y - size / 3, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 4 + wobble, y - size / 3, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#2F4F2F'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 5 + wobble, y - size / 3 - 5)
  ctx.lineTo(x - 1 + wobble, y - size / 3)
  ctx.moveTo(x + 5 + wobble, y - size / 3 - 5)
  ctx.lineTo(x + 1 + wobble, y - size / 3)
  ctx.stroke()

  ctx.fillStyle = '#8B0000'
  ctx.beginPath()
  ctx.moveTo(x - 4 + wobble, y - size / 3 + 8)
  ctx.lineTo(x + wobble, y - size / 3 + 12)
  ctx.lineTo(x + 4 + wobble, y - size / 3 + 8)
  ctx.fill()

  if (isFighting) {
    ctx.fillStyle = '#556B2F'
    ctx.save()
    ctx.translate(x - size / 2 + wobble, y)
    ctx.rotate(Math.sin(animationTime * 8) * 0.4)
    ctx.fillRect(-5, -3, 15, 6)
    ctx.restore()
  }
}

const drawConeheadZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const wobble = Math.sin(animationTime * 3 + x) * 2

  ctx.fillStyle = '#556B2F'
  ctx.beginPath()
  ctx.arc(x + wobble, y, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#6B8E23'
  ctx.beginPath()
  ctx.arc(x + wobble, y - size / 3, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.moveTo(x - size / 3 + wobble, y - size / 2)
  ctx.lineTo(x + wobble, y - size - 10)
  ctx.lineTo(x + size / 3 + wobble, y - size / 2)
  ctx.fill()

  ctx.strokeStyle = '#DAA520'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - size / 4 + wobble, y - size / 2 + 5)
  ctx.lineTo(x + wobble, y - size + 5)
  ctx.lineTo(x + size / 4 + wobble, y - size / 2 + 5)
  ctx.stroke()

  ctx.fillStyle = '#FF0000'
  ctx.beginPath()
  ctx.arc(x - 4 + wobble, y - size / 3, 3, 0, Math.PI * 2)
  ctx.arc(x + 4 + wobble, y - size / 3, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 4 + wobble, y - size / 3, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 4 + wobble, y - size / 3, 1.5, 0, Math.PI * 2)
  ctx.fill()
}

const drawFlyingZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const floatY = Math.sin(animationTime * 3 + x * 0.1) * 8
  const wingFlap = Math.sin(animationTime * 12) * 0.5

  ctx.fillStyle = 'rgba(147, 112, 219, 0.4)'
  ctx.save()
  ctx.translate(x, y + floatY)
  ctx.rotate(-0.3 + wingFlap)
  ctx.beginPath()
  ctx.ellipse(-size / 2, 0, size * 0.6, size * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(x, y + floatY)
  ctx.rotate(0.3 - wingFlap)
  ctx.beginPath()
  ctx.ellipse(size / 2, 0, size * 0.6, size * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = '#9370DB'
  ctx.beginPath()
  ctx.ellipse(x, y + floatY, size / 2.5, size / 2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8A2BE2'
  ctx.beginPath()
  ctx.arc(x, y - size / 2.5 + floatY, size / 3.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FF00FF'
  ctx.beginPath()
  ctx.arc(x - 3, y - size / 2.5 + floatY, 3, 0, Math.PI * 2)
  ctx.arc(x + 3, y - size / 2.5 + floatY, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 3, y - size / 2.5 + floatY, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 3, y - size / 2.5 + floatY, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8A2BE2'
  ctx.beginPath()
  ctx.moveTo(x - 8, y - size / 2.5 + floatY)
  ctx.quadraticCurveTo(x - 12, y - size - 5 + floatY, x - 5, y - size + floatY)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + 8, y - size / 2.5 + floatY)
  ctx.quadraticCurveTo(x + 12, y - size - 5 + floatY, x + 5, y - size + floatY)
  ctx.fill()
}

const drawExplosiveZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const pulse = 1 + Math.sin(animationTime * 8) * 0.1
  const wobble = Math.sin(animationTime * 6 + x) * 4

  ctx.fillStyle = `rgba(255, 0, 0, ${0.2 + Math.sin(animationTime * 10) * 0.1})`
  ctx.beginPath()
  ctx.arc(x + wobble, y, size * pulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8B0000'
  ctx.beginPath()
  ctx.arc(x + wobble, y, size / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2F2F2F'
  ctx.beginPath()
  ctx.arc(x + wobble, y - size / 3, size / 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.moveTo(x + wobble, y - size / 3)
  ctx.quadraticCurveTo(x + 3 + wobble, y - size / 2 - 5, x + 2 + wobble, y - size / 2 - 12)
  ctx.quadraticCurveTo(x + wobble, y - size / 2 - 5, x - 2 + wobble, y - size / 2 - 12)
  ctx.quadraticCurveTo(x - 3 + wobble, y - size / 2 - 5, x + wobble, y - size / 3)
  ctx.fill()

  const flameSize = 6 + Math.sin(animationTime * 20) * 4
  ctx.fillStyle = '#FF4500'
  ctx.beginPath()
  ctx.arc(x + wobble, y - size / 2 - 15, flameSize, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFFF00'
  ctx.beginPath()
  ctx.arc(x + wobble, y - size / 2 - 15, flameSize * 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x - 3 + wobble, y - size / 3, 3, 0, Math.PI * 2)
  ctx.arc(x + 3 + wobble, y - size / 3, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 3 + wobble, y - size / 3, 1.5, 0, Math.PI * 2)
  ctx.arc(x + 3 + wobble, y - size / 3, 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('💣', x + wobble, y + 5)
}

const drawBossZombie = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isFighting: boolean) => {
  const wobble = Math.sin(animationTime * 2 + x * 0.05) * 5
  const breathe = 1 + Math.sin(animationTime * 2) * 0.05

  ctx.fillStyle = 'rgba(139, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.arc(x + wobble, y, size * 0.8 * breathe, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#8B0000'
  ctx.fillRect(x - size / 2 + wobble, y - size / 2, size, size)

  ctx.strokeStyle = '#5C0000'
  ctx.lineWidth = 3
  ctx.strokeRect(x - size / 2 + wobble, y - size / 2, size, size)

  ctx.fillStyle = '#6B0000'
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x - size / 2 + 5 + wobble, y - size / 2 + 10 + i * 12, size - 10, 4)
  }

  ctx.fillStyle = '#A00000'
  ctx.beginPath()
  ctx.arc(x + wobble, y - size / 2 - 5, size / 2.5, Math.PI, 0)
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.moveTo(x - size / 3 + wobble, y - size / 2 - 5)
  ctx.lineTo(x - size / 4 + wobble, y - size - 15)
  ctx.lineTo(x - size / 6 + wobble, y - size / 2 - 5)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + size / 3 + wobble, y - size / 2 - 5)
  ctx.lineTo(x + size / 4 + wobble, y - size - 15)
  ctx.lineTo(x + size / 6 + wobble, y - size / 2 - 5)
  ctx.fill()

  ctx.fillStyle = '#FF0000'
  ctx.beginPath()
  ctx.arc(x - 10 + wobble, y - 8, 8, 0, Math.PI * 2)
  ctx.arc(x + 10 + wobble, y - 8, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#FFFF00'
  const eyeGlow = 0.5 + Math.sin(animationTime * 5) * 0.5
  ctx.fillStyle = `rgba(255, 255, 0, ${eyeGlow})`
  ctx.beginPath()
  ctx.arc(x - 10 + wobble, y - 8, 12, 0, Math.PI * 2)
  ctx.arc(x + 10 + wobble, y - 8, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(x - 10 + wobble, y - 8, 4, 0, Math.PI * 2)
  ctx.arc(x + 10 + wobble, y - 8, 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(x - 15 + wobble, y + 15)
  ctx.lineTo(x - 10 + wobble, y + 25)
  ctx.lineTo(x - 5 + wobble, y + 15)
  ctx.lineTo(x + wobble, y + 25)
  ctx.lineTo(x + 5 + wobble, y + 15)
  ctx.lineTo(x + 10 + wobble, y + 25)
  ctx.lineTo(x + 15 + wobble, y + 15)
  ctx.fill()

  if (isFighting) {
    ctx.fillStyle = '#8B0000'
    ctx.save()
    ctx.translate(x - size / 2 + wobble, y)
    ctx.rotate(Math.sin(animationTime * 6) * 0.3)
    ctx.fillRect(-20, -8, 25, 16)
    ctx.restore()

    ctx.save()
    ctx.translate(x + size / 2 + wobble, y)
    ctx.rotate(-Math.sin(animationTime * 6) * 0.3)
    ctx.fillRect(-5, -8, 25, 16)
    ctx.restore()
  }
}

const drawEffects = (ctx: CanvasRenderingContext2D, state: GameState) => {
  state.soldiers.forEach(soldier => {
    if (soldier.isFighting) {
      const config = getSoldierConfig(soldier.configId)
      if (config && config.id === 'bomber') {
        ctx.strokeStyle = `rgba(255, 165, 0, ${0.3 + Math.sin(animationTime * 10) * 0.2})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(soldier.position.x + 20, soldier.position.y, 15, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  })
}

const drawPauseOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(50, 50, 50, 0.8)'
  ctx.fillRect(width / 2 - 150, height / 2 - 80, 300, 160)

  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 4
  ctx.strokeRect(width / 2 - 150, height / 2 - 80, 300, 160)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⏸ 游戏暂停', width / 2, height / 2 - 20)

  ctx.font = '20px Arial'
  ctx.fillStyle = '#ccc'
  ctx.fillText('点击右上角按钮继续游戏', width / 2, height / 2 + 35)
}

const drawGameOver = (ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState) => {
  ctx.fillStyle = 'rgba(139, 0, 0, 0.85)'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(50, 0, 0, 0.9)'
  ctx.fillRect(width / 2 - 200, height / 2 - 120, 400, 240)

  ctx.strokeStyle = '#FF0000'
  ctx.lineWidth = 5
  ctx.strokeRect(width / 2 - 200, height / 2 - 120, 400, 240)

  ctx.fillStyle = '#FF0000'
  ctx.font = 'bold 56px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('💀 游戏结束', width / 2, height / 2 - 60)

  ctx.fillStyle = '#fff'
  ctx.font = '28px Arial'
  ctx.fillText(`坚持到第 ${state.currentWave} 波`, width / 2, height / 2)
  ctx.fillText(`最终得分: ${state.score}`, width / 2, height / 2 + 45)

  ctx.font = '18px Arial'
  ctx.fillStyle = '#ccc'
  ctx.fillText('点击右上角重新开始按钮再来一局', width / 2, height / 2 + 85)
}

const drawVictory = (ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState) => {
  ctx.fillStyle = 'rgba(0, 100, 0, 0.85)'
  ctx.fillRect(0, 0, width, height)

  for (let i = 0; i < 20; i++) {
    const px = (i * 67 + animationTime * 20) % width
    const py = ((i * 43 + animationTime * 30) % height) - 20
    ctx.fillStyle = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
    ctx.beginPath()
    ctx.arc(px, py, 5 + Math.sin(animationTime + i) * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(0, 50, 0, 0.9)'
  ctx.fillRect(width / 2 - 220, height / 2 - 130, 440, 260)

  ctx.strokeStyle = '#FFD700'
  ctx.lineWidth = 5
  ctx.strokeRect(width / 2 - 220, height / 2 - 130, 440, 260)

  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 56px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🎉 胜利！🎉', width / 2, height / 2 - 70)

  ctx.fillStyle = '#fff'
  ctx.font = '26px Arial'
  ctx.fillText(`成功抵御所有 ${getTotalWaves()} 波僵尸！`, width / 2, height / 2)
  ctx.fillText(`最终得分: ${state.score}`, width / 2, height / 2 + 45)

  ctx.font = '40px Arial'
  ctx.fillText('🏆🏆🏆', width / 2, height / 2 + 95)
}
