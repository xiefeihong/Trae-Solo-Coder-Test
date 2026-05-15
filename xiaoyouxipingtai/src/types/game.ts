export interface Game {
  id: string
  name: string
  description: string
  icon: string
  color: string
  component: string
  isDeveloping?: boolean
}

export interface GameState {
  games: Game[]
}
