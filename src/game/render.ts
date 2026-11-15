import { FLOOR, HEIGHT, PIPE_WIDTH, type Flight } from './physics'

export type Milestone = { score: number; age: number }
export type Scene = {
  flight: Flight
  time: number
  idle: boolean
  dead: boolean
  impact: number
  particles: { x: number; y: number; life: number; vx: number; vy: number }[]
  milestone: Milestone | null
  still: boolean
}
const TAU = Math.PI * 2