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
  const flight: Flight = {
    y: 290,
    velocity: 0,
    distance: 0,
    tick: 0,
    score: 0,
    alive: true,
    pipes: [],
    random: seed >>> 0,
    lastFlap: -MIN_FLAP_TICKS,
    nextPipe: 480,
  }
  for (let i = 0; i < 7; i++) addPipe(flight)
  return flight
}

function addPipe(flight: Flight) {
  flight.random = (Math.imul(1664525, flight.random) + 1013904223) >>> 0
  const previous = flight.pipes.at(-1)?.center ?? 300
  const center = Math.max(
    172,
    Math.min(416, previous + (flight.random / 4294967296 - 0.5) * 170),
  )
  flight.pipes.push({
    x: flight.nextPipe,
    center,
    gap: Math.max(176, 198 - flight.score * 0.55),
    passed: false,
  })
  flight.nextPipe += 282
}

export function flap(flight: Flight): boolean {