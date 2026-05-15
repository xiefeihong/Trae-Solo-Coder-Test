import type { GameEngine } from './GameEngine'
import { CELL_SIZE, GRID_OFFSET_X, GRID_OFFSET_Y } from './GameEngine'
import { getFoodConfig, getMouseConfig } from '../config'

export class GameRenderer {
  private ctx: CanvasRenderingContext2D
  private engine: GameEngine
  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, engine: GameEngine) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.engine = engine
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawBackground()
    this.drawGrid()
    this.drawFoods()
    this.drawMouses()
    this.drawProjectiles()
  }

  private drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(1, '#90EE90')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawGrid(): void {
    const config = this.engine.getLevelConfig()
    const { gridRows, gridCols, terrain } = config

    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const px = GRID_OFFSET_X + x * CELL_SIZE
        const py = GRID_OFFSET_Y + y * CELL_SIZE

        const terrainType = terrain[y]?.[x] || 0
        if (terrainType === 0) {
          this.ctx.fillStyle = '#7CFC00'
        } else if (terrainType === 1) {
          this.ctx.fillStyle = '#808080'
        } else {
          this.ctx.fillStyle = '#4169E1'
        }

        this.ctx.fillRect(px, py, CELL_SIZE - 2, CELL_SIZE - 2)
        this.ctx.strokeStyle = '#228B22'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(px, py, CELL_SIZE - 2, CELL_SIZE - 2)
      }
    }
  }

  private drawFoods(): void {
    const foods = this.engine.getFoods()

    foods.forEach(food => {
      const config = getFoodConfig(food.configId)
      if (!config) return

      const { x, y } = food.position
      const size = CELL_SIZE * 0.7

      this.ctx.fillStyle = config.color
      this.ctx.beginPath()
      this.ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      this.ctx.fill()

      this.ctx.strokeStyle = '#333'
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      if (food.level > 1) {
        this.ctx.fillStyle = '#FFD700'
        for (let i = 0; i < food.level - 1; i++) {
          this.ctx.beginPath()
          this.ctx.arc(x - 10 + i * 10, y - size / 2 - 8, 5, 0, Math.PI * 2)
          this.ctx.fill()
        }
      }

      const hpPercent = food.hp / food.maxHp
      const barWidth = size * 0.8
      const barHeight = 6

      this.ctx.fillStyle = '#333'
      this.ctx.fillRect(x - barWidth / 2, y + size / 2 + 5, barWidth, barHeight)

      this.ctx.fillStyle = hpPercent > 0.5 ? '#32CD32' : hpPercent > 0.25 ? '#FFD700' : '#FF4500'
      this.ctx.fillRect(x - barWidth / 2, y + size / 2 + 5, barWidth * hpPercent, barHeight)

      if (config.special === 'produce') {
        this.ctx.fillStyle = '#FFD700'
        this.ctx.font = 'bold 14px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText('⭐', x, y + 5)
      }
    })
  }

  private drawMouses(): void {
    const mouses = this.engine.getMouses()

    mouses.forEach(mouse => {
      const config = getMouseConfig(mouse.configId)
      if (!config) return

      const { x, y } = mouse.position
      const size = config.special === 'boss' ? CELL_SIZE * 0.9 : CELL_SIZE * 0.5

      if (mouse.isFrozen) {
        this.ctx.fillStyle = '#ADD8E6'
      } else if (mouse.slowFactor < 1) {
        this.ctx.fillStyle = '#FFB6C1'
      } else {
        this.ctx.fillStyle = config.color
      }

      this.ctx.beginPath()
      this.ctx.ellipse(x, y, size / 2, size / 3, 0, 0, Math.PI * 2)
      this.ctx.fill()

      this.ctx.strokeStyle = '#333'
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      this.ctx.fillStyle = '#FFF'
      this.ctx.beginPath()
      this.ctx.arc(x + size / 4, y - size / 8, 4, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.fillStyle = '#000'
      this.ctx.beginPath()
      this.ctx.arc(x + size / 4 + 1, y - size / 8, 2, 0, Math.PI * 2)
      this.ctx.fill()

      if (config.special === 'flying') {
        this.ctx.fillStyle = 'rgba(255, 182, 193, 0.7)'
        this.ctx.beginPath()
        this.ctx.ellipse(x, y - size / 2, size / 3, size / 2, 0, 0, Math.PI * 2)
        this.ctx.fill()
      }

      if (config.special === 'underground') {
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.5)'
        this.ctx.fillRect(x - size / 2, y + size / 4, size, size / 3)
      }

      const hpPercent = mouse.hp / mouse.maxHp
      const barWidth = size * 0.8
      const barHeight = 4

      this.ctx.fillStyle = '#333'
      this.ctx.fillRect(x - barWidth / 2, y - size / 2 - 10, barWidth, barHeight)

      this.ctx.fillStyle = '#FF4500'
      this.ctx.fillRect(x - barWidth / 2, y - size / 2 - 10, barWidth * hpPercent, barHeight)
    })
  }

  private drawProjectiles(): void {
    const projectiles = this.engine.getProjectiles()

    projectiles.forEach(proj => {
      this.ctx.fillStyle = proj.color
      this.ctx.beginPath()
      this.ctx.arc(proj.position.x, proj.position.y, 8, 0, Math.PI * 2)
      this.ctx.fill()

      this.ctx.strokeStyle = '#333'
      this.ctx.lineWidth = 1
      this.ctx.stroke()
    })
  }

  public getGridPosition(clientX: number, clientY: number): { x: number; y: number } | null {
    const rect = this.canvas.getBoundingClientRect()
    const x = clientX - rect.left - GRID_OFFSET_X
    const y = clientY - rect.top - GRID_OFFSET_Y

    const config = this.engine.getLevelConfig()
    const gridX = Math.floor(x / CELL_SIZE)
    const gridY = Math.floor(y / CELL_SIZE)

    if (gridX >= 0 && gridX < config.gridCols && gridY >= 0 && gridY < config.gridRows) {
      return { x: gridX, y: gridY }
    }

    return null
  }
}
