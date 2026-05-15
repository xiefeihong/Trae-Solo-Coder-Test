<script setup lang="ts">
defineProps<{
  isVictory: boolean
  currentWave: number
  totalWaves: number
}>()

const emit = defineEmits<{
  (e: 'restart'): void
  (e: 'backToMenu'): void
}>()
</script>

<template>
  <div class="overlay">
    <div class="panel">
      <div class="panel-header" :class="{ victory: isVictory, defeat: !isVictory }">
        <h2>{{ isVictory ? '🎉 胜利!' : '💀 游戏结束' }}</h2>
      </div>
      <div class="panel-content">
        <div class="result-info">
          <div class="info-item">
            <span class="label">完成波次:</span>
            <span class="value">{{ currentWave + 1 }} / {{ totalWaves }}</span>
          </div>
        </div>
        <div v-if="isVictory" class="victory-message">
          恭喜你成功保卫了美食仓库！
        </div>
        <div v-else class="defeat-message">
          老鼠们偷走了所有的食物...
        </div>
        <div class="panel-actions">
          <button class="action-btn primary" @click="emit('restart')">
            🔄 重新开始
          </button>
          <button class="action-btn secondary" @click="emit('backToMenu')">
            📋 返回菜单
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.panel {
  background: linear-gradient(145deg, #f5f5dc, #e8e0c8);
  border: 4px solid #8B4513;
  border-radius: 16px;
  overflow: hidden;
  min-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.panel-header {
  padding: 20px;
  text-align: center;
}

.panel-header.victory {
  background: linear-gradient(90deg, #4CAF50, #45a049);
}

.panel-header.defeat {
  background: linear-gradient(90deg, #f44336, #d32f2f);
}

.panel-header h2 {
  margin: 0;
  color: white;
  font-size: 28px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.panel-content {
  padding: 24px;
}

.result-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  margin-bottom: 8px;
}

.info-item .label {
  color: #666;
  font-size: 16px;
}

.info-item .value {
  font-weight: bold;
  color: #333;
  font-size: 18px;
}

.victory-message,
.defeat-message {
  text-align: center;
  padding: 16px;
  font-size: 18px;
  margin-bottom: 24px;
  border-radius: 8px;
}

.victory-message {
  background: rgba(76, 175, 80, 0.2);
  color: #2E7D32;
}

.defeat-message {
  background: rgba(244, 67, 54, 0.2);
  color: #C62828;
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-btn.primary {
  background: linear-gradient(145deg, #4CAF50, #45a049);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(145deg, #9E9E9E, #757575);
  color: white;
}
</style>
