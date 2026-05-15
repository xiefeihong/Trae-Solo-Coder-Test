# 🎮 小游戏乐园

一个基于 Vue 3 + TypeScript 开发的网页小游戏平台，类似于 4399 的风格。

## ✨ 功能特性

- 🎯 **游戏列表展示**：以卡片网格形式展示所有小游戏
- 🎮 **游戏启动器**：点击游戏卡片后，在当前页面弹出模态框加载游戏
- 📦 **统一游戏容器**：提供统一的游戏容器组件，负责加载、挂载和销毁游戏
- 🔄 **导航功能**：可以随时返回首页，游戏支持重新开始
- 📱 **响应式设计**：完美支持移动端触摸操作
- 🎨 **卡通风格UI**：明亮的配色方案，童趣十足

## 🛠️ 技术栈

- **框架**：Vue 3 (Composition API + `<script setup>`)
- **语言**：TypeScript
- **路由**：Vue Router
- **状态管理**：Pinia
- **构建工具**：Vite
- **图标**：Font Awesome

## 📦 安装运行

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000` 即可查看效果。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎮 现有游戏

### 已完成游戏

1. **🖱️ 点击得分** - 在30秒内尽可能多地点击，挑战你的手速极限！

### 开发中游戏

1. **🌱 植物大战僵尸** - 经典塔防游戏
2. **⭕ 五子棋** - 智慧对决
3. **🚗 孤独的公路赛车** - 极速狂飙
4. **🧊 俄罗斯方块** - 经典益智游戏
5. **💎 消消乐** - 消除烦恼

## 📁 项目结构

```
xiaoyouxipingtai/
├── src/
│   ├── components/          # 公共组件
│   │   ├── GameCard.vue     # 游戏卡片组件
│   │   └── GameModal.vue    # 游戏模态框组件
│   ├── games/               # 游戏组件目录
│   │   ├── ClickScoreGame.vue  # 点击得分游戏
│   │   └── PlaceholderGame.vue # 占位游戏组件
│   ├── stores/              # Pinia 状态管理
│   │   └── gameStore.ts     # 游戏状态管理
│   ├── types/               # TypeScript 类型定义
│   │   └── game.ts          # 游戏相关类型
│   ├── views/               # 页面视图
│   │   └── HomeView.vue     # 首页
│   ├── router/              # 路由配置
│   │   └── index.ts
│   ├── App.vue              # 根组件
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 如何添加新游戏

### 步骤1：创建游戏组件

在 `src/games/` 目录下创建你的游戏组件，例如 `MyGame.vue`：

```vue
<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

// 游戏逻辑...
</script>

<template>
  <div class="my-game">
    <!-- 游戏内容 -->
    <button @click="emit('close')">退出游戏</button>
  </div>
</template>

<style scoped>
/* 游戏样式 */
</style>
```

### 步骤2：在状态管理中注册游戏

编辑 `src/stores/gameStore.ts`，在 `games` 数组中添加游戏配置：

```typescript
{
  id: 'my-game',                    // 游戏唯一ID
  name: '我的游戏',                 // 游戏名称
  description: '这是一个示例游戏',   // 游戏描述
  icon: 'gamepad',                  // Font Awesome 图标名
  color: '#ff6b35',                 // 主题色
  component: 'MyGame',              // 组件名（对应GameView中的映射）
  isDeveloping: false               // 是否开发中
}
```

### 步骤3：在GameView中注册组件映射

编辑 `src/views/GameView.vue`，在 `componentMap` 中添加你的组件：

```typescript
import MyGame from '../games/MyGame.vue'

const componentMap: Record<string, any> = {
  ClickScoreGame,
  PlaceholderGame,
  MyGame  // 添加这一行
}
```

## 📝 游戏接入规范

### Props 传递

目前游戏组件通过动态组件方式加载，不需要额外 props。如需传递参数，可在 Pinia store 中进行管理。

### 事件通信

游戏组件必须支持以下事件：

- `close` - 关闭游戏，返回首页

```typescript
const emit = defineEmits<{
  close: []
}>()

// 调用方式
emit('close')
```

### 样式规范

- 游戏组件应自适应容器大小
- 建议使用 `min-height: 300px` 确保游戏区域足够大
- 支持移动端触摸操作
- 配色建议与平台风格保持一致

## 🎨 主题色参考

```css
:root {
  --primary-color: #ff6b35;    /* 主色调 - 橙色 */
  --secondary-color: #f7c948;  /* 次色调 - 黄色 */
  --accent-color: #4ecdc4;     /* 强调色 - 青色 */
  --green-color: #95e1a3;      /* 绿色 */
  --text-color: #333;          /* 文字色 */
  --bg-color: #fff9e6;         /* 背景色 */
}
```

## 📱 移动端适配

项目已内置响应式设计支持，开发游戏时建议：

1. 使用 `@media (max-width: 768px)` 进行移动端适配
2. 支持触摸事件（`touchstart`, `touchend` 等）
3. 按钮最小尺寸建议为 44x44px
4. 避免使用 `hover` 作为主要交互方式

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
