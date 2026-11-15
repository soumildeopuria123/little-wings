// Shared with the Worker: the canvas frame rate never changes the simulation.
export const STEP = 1 / 120
export const HEIGHT = 640
export const FLOOR = 584
export const RADIUS = 13
export const PIPE_WIDTH = 78
export const MAX_TICKS = 120 * 60 * 6
export const MIN_FLAP_TICKS = 9
export type Pipe = { x: number; center: number; gap: number; passed: boolean }
export type Flight = {
  y: number
  velocity: number
  distance: number
  tick: number
  score: number
  alive: boolean
  pipes: Pipe[]
  random: number
  lastFlap: number
  nextPipe: number
}

export function createFlight(seed: number): Flight {