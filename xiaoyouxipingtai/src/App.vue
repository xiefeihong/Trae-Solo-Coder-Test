<script setup lang="ts">
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">
        <font-awesome-icon icon="gamepad" class="logo-icon" />
        <span>小游戏乐园</span>
      </div>
      <p class="subtitle">精选小游戏，欢乐无限！</p>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2024 小游戏乐园 - 快乐每一天</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.logo-icon {
  font-size: 3rem;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-top: 8px;
}

.app-main {
  flex: 1;
  padding: 30px 20px;
}

.app-footer {
  background: var(--primary-color);
  color: white;
  text-align: center;
  padding: 15px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .logo {
    font-size: 1.8rem;
  }
  
  .logo-icon {
    font-size: 2.2rem;
  }
  
  .subtitle {
    font-size: 0.95rem;
  }
}
</style>
