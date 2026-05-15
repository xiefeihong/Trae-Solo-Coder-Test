# Vue 3 五子棋游戏

基于 Vue 3 + TypeScript + Vite 开发的双人五子棋游戏。

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Canvas (绘制棋盘和棋子)

## 功能特性

- 15x15 标准棋盘
- 双人轮流对战，黑棋先行
- 横、竖、斜四个方向五子连珠判定
- 最近落子位置高亮显示
- 游戏胜利和平局判定
- 重新开始功能
- 响应式设计，支持 PC 和移动端

## 项目结构

```
src/
├── components/
│   └── GameBoard.vue    # 棋盘组件（Canvas绘制）
├── composables/
│   └── useGame.ts       # 游戏逻辑组合式函数
├── types/
│   └── game.ts          # 类型定义
├── App.vue              # 主组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:3000 启动

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 游戏规则

1. 黑棋先行，双方轮流在棋盘交叉点落子
2. 横、竖、斜任意方向连成五个棋子即可获胜
3. 棋盘填满且无人获胜则为平局
4. 点击"重新开始"按钮可开始新一局

## 代码说明

### GameBoard.vue

使用 Canvas API 绘制棋盘和棋子：
- 棋盘背景和网格线
- 星位点（天元和边星）
- 黑白棋子渐变效果
- 最近落子红色圆圈高亮
- 点击事件处理落子位置

### useGame.ts

游戏核心逻辑：
- 游戏状态管理（棋盘、当前玩家、获胜者）
- 胜负判定算法（四个方向检测）
- 平局判定
- 重置游戏功能
