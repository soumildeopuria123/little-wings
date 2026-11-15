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
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string | CanvasGradient,
) {
  c.fillStyle = color
  c.beginPath()
  c.ellipse(x, y, rx, ry, 0, 0, TAU)
  c.fill()
}
function round(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath()
  c.roundRect(x, y, w, h, r)
}

// Milestone celebration. A palm-sized critter pops out of the grass strip below
// the playfield, holds up the score, then ducks away, so the gap the player is
// aiming for is never covered and play is never interrupted.
const RISE = 0.26
const LEAVE_AT = 1.5
const LIFE = 1.95
const CRITTERS = 5

function easeOut(t: number) {
  return 1 - (1 - t) ** 3
}
function milestoneLift(age: number) {
  if (age <= 0) return 0
  if (age < RISE) return easeOut(age / RISE)
  if (age < LEAVE_AT) return 1
  return Math.max(0, 1 - easeOut((age - LEAVE_AT) / (LIFE - LEAVE_AT)))
}

function feet(c: CanvasRenderingContext2D, color: string) {