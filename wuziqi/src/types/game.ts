export type Player = 'black' | 'white'

export interface Position {
  row: number
  col: number
}

export interface GameState {
  board: (Player | null)[][]
  currentPlayer: Player
  winner: Player | null
  lastMove: Position | null
  gameOver: boolean
}

export const BOARD_SIZE = 15
export const WIN_COUNT = 5
