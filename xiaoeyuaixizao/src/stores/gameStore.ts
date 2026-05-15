import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Cell, PipeType, Position, WaterQuality, LevelProgress } from '@/types/game'
import { createLevels } from '@/data/levels'
import { simulateWaterFlow, deepCopyGrid, countUsedPipes, getConnections } from '@/utils/pipeLogic'

export const useGameStore = defineStore('game', () => {
  const levels = createLevels()
  const currentLevelIndex = ref(0)
  const grid = ref<Cell[][]>([])
  const isPlaying = ref(false)
  const isWon = ref(false)
  const steps = ref(0)
  const startTime = ref(0)
  const elapsedTime = ref(0)
  const waterQuality = ref(WaterQuality.PURE)
  const stars = ref(0)
  const history = ref<Cell[][][]>([])
  const historyIndex = ref(-1)
  const selectedPipe = ref<PipeType | null>(null)
  const isPreviewMode = ref(false)
  const filledCells = ref<Map<string, WaterQuality>>(new Map())

  const levelProgress = ref<Map<number, LevelProgress>>(new Map())

  const currentLevel = computed(() => levels[currentLevelIndex.value])

  const usedPipes = computed(() => countUsedPipes(grid.value))

  function loadProgress() {
    const saved = localStorage.getItem('crocodile_water_progress')
    if (saved) {
      const data = JSON.parse(saved)
      levelProgress.value = new Map(data)
    } else {
      const initialProgress = new Map<number, LevelProgress>()
      levels.forEach((level, index) => {
        initialProgress.set(level.id, {
          levelId: level.id,
          stars: 0,
          bestTime: 0,
          isUnlocked: index === 0
        })
      })
      levelProgress.value = initialProgress
      saveProgress()
    }
  }

  function saveProgress() {
    const data = Array.from(levelProgress.value.entries())
    localStorage.setItem('crocodile_water_progress', JSON.stringify(data))
  }

  function initLevel(levelIndex: number) {
    const level = levels[levelIndex]
    currentLevelIndex.value = levelIndex
    grid.value = deepCopyGrid(level.grid)
    isPlaying.value = false
    isWon.value = false
    steps.value = 0
    startTime.value = 0
    elapsedTime.value = 0
    waterQuality.value = WaterQuality.PURE
    stars.value = 0
    history.value = []
    historyIndex.value = -1
    selectedPipe.value = null
    isPreviewMode.value = false
    filledCells.value = new Map()
  }

  function saveState() {
    const newHistory = history.value.slice(0, historyIndex.value + 1)
    newHistory.push(deepCopyGrid(grid.value))
    if (newHistory.length > 10) {
      newHistory.shift()
    } else {
      history.value = newHistory
      historyIndex.value = newHistory.length - 1
    }
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      grid.value = deepCopyGrid(history.value[historyIndex.value])
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      grid.value = deepCopyGrid(history.value[historyIndex.value])
    }
  }

  function placePipe(row: number, col: number, pipeType: PipeType) {
    const cell = grid.value[row][col]
    if (cell.type === 'wall' || cell.type === 'source' || cell.type === 'bathtub') {
      return
    }

    if (cell.type === 'dirt' && !cell.isCleared) {
      cell.isCleared = true
      steps.value++
      saveState()
      return
    }

    if (cell.pipe && !cell.pipe.isFixed) {
      cell.pipe.rotation = (cell.pipe.rotation + 90) % 360
      cell.pipe.connections = getConnections(pipeType, cell.pipe.rotation)
    } else if (!cell.pipe) {
      cell.pipe = {
        type: pipeType,
        rotation: 0,
        connections: getConnections(pipeType, 0),
        isFixed: false
      }
    }

    steps.value++
    saveState()
  }

  function removePipe(row: number, col: number) {
    const cell = grid.value[row][col]
    if (cell.pipe && !cell.pipe.isFixed) {
      delete cell.pipe
      steps.value++
      saveState()
    }
  }

  function startWaterFlow() {
    isPlaying.value = true
    startTime.value = Date.now()

    const level = currentLevel.value
    const result = simulateWaterFlow(grid.value, level.sourcePositions)
    filledCells.value = result.filledCells
    waterQuality.value = result.waterQuality

    if (result.reachedBathtub) {
      isWon.value = true
      isPlaying.value = false
      elapsedTime.value = Date.now() - startTime.value
      calculateStars()
      updateProgress()
    }
  }

  function stopWaterFlow() {
    isPlaying.value = false
    filledCells.value = new Map()
  }

  function previewWaterFlow() {
    isPreviewMode.value = true
    const level = currentLevel.value
    const result = simulateWaterFlow(grid.value, level.sourcePositions)
    filledCells.value = result.filledCells
  }

  function stopPreview() {
    isPreviewMode.value = false
    filledCells.value = new Map()
  }

  function calculateStars() {
    const level = currentLevel.value
    let starCount = 1

    if (usedPipes.value <= level.recommendedSteps) {
      starCount++
    }

    if (waterQuality.value === WaterQuality.PURE) {
      starCount++
    }

    stars.value = starCount
  }

  function updateProgress() {
    const level = currentLevel.value
    const progress = levelProgress.value.get(level.id)
    if (progress) {
      progress.stars = Math.max(progress.stars, stars.value)
      progress.bestTime = progress.bestTime > 0 
        ? Math.min(progress.bestTime, elapsedTime.value)
        : elapsedTime.value
    }

    const nextLevelIndex = currentLevelIndex.value + 1
    if (nextLevelIndex < levels.length) {
      const nextProgress = levelProgress.value.get(levels[nextLevelIndex].id)
      if (nextProgress) {
        nextProgress.isUnlocked = true
      }
    }

    saveProgress()
  }

  function resetLevel() {
    initLevel(currentLevelIndex.value)
  }

  function getHint(): Position | null {
    return null
  }

  return {
    levels,
    currentLevelIndex,
    currentLevel,
    grid,
    isPlaying,
    isWon,
    steps,
    elapsedTime,
    waterQuality,
    stars,
    selectedPipe,
    isPreviewMode,
    filledCells,
    usedPipes,
    levelProgress,
    loadProgress,
    initLevel,
    placePipe,
    removePipe,
    startWaterFlow,
    stopWaterFlow,
    previewWaterFlow,
    stopPreview,
    resetLevel,
    undo,
    redo,
    getHint
  }
})
