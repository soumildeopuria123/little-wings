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
  c.strokeStyle = color
  c.lineWidth = 1.7
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(-4, -1)
  c.lineTo(-4, 2.5)
  c.moveTo(4, -1)
  c.lineTo(4, 2.5)
  c.stroke()
}

function drawCritter(c: CanvasRenderingContext2D, kind: number, time: number) {
  const wave = Math.sin(time * 11) * 0.45
  const bob = Math.abs(Math.sin(time * 5.5)) * 1.4
  c.save()
  c.translate(0, -bob)
  if (kind === 0) {
    // Chick
    ellipse(c, 0, -12, 10, 11.5, '#fbefd2')
    c.save()
    c.translate(-7, -17)
    c.rotate(-0.45 + wave)
    ellipse(c, -1, -4.5, 3.2, 5.6, '#f1ddb4')
    c.restore()
    c.fillStyle = '#dfa052'
    c.beginPath()
    c.moveTo(8, -14)
    c.lineTo(15, -12)
    c.lineTo(8, -10)
    c.fill()
    ellipse(c, 3.6, -16.5, 1.5, 1.9, '#34483b')
    c.strokeStyle = '#e2c58d'
    c.lineWidth = 1.4
    c.beginPath()
    c.moveTo(-1, -22)
    c.quadraticCurveTo(2, -26, -3, -27)
    c.stroke()
    feet(c, '#dfa052')
  } else if (kind === 1) {
    // Duckling
    ellipse(c, 0, -10, 11, 9, '#f7e3a6')
    ellipse(c, 3, -19, 6.5, 6.5, '#f7e3a6')
    c.save()
    c.translate(-8, -13)
    c.rotate(-0.35 + wave)
    ellipse(c, -1, -4, 3.2, 5.2, '#efd78f')
    c.restore()
    c.fillStyle = '#e08b45'
    c.beginPath()
    c.moveTo(8, -20)
    c.lineTo(16, -18)
    c.lineTo(8, -16)
    c.fill()
    ellipse(c, 4, -20.5, 1.4, 1.8, '#34483b')
    feet(c, '#e08b45')
  } else if (kind === 2) {
    // Bunny
    ellipse(c, 0, -10, 9, 10.5, '#fbf6ea')
    for (const ear of [-1, 1]) {
      c.save()
      c.translate(ear * 3.6, -21)
      c.rotate(ear * 0.16 + wave * 0.18 * ear)
      ellipse(c, 0, -7, 2.7, 8, '#fbf6ea')
      ellipse(c, 0, -7, 1.1, 5.4, '#efd3c8')
      c.restore()
    }
    ellipse(c, -3.2, -11.5, 1.3, 1.6, '#34483b')
    ellipse(c, 3.2, -11.5, 1.3, 1.6, '#34483b')
    ellipse(c, 0, -8.6, 1.4, 1.1, '#e2a08f')
    feet(c, '#e6d8c6')
  } else if (kind === 3) {
    // Turtle
    ellipse(c, 0, -9, 12, 8, '#8faf7a')
    ellipse(c, 0, -9, 8.5, 5.4, '#a9c091')
    c.strokeStyle = '#7c9a68'
    c.lineWidth = 1.2
    c.beginPath()
    c.moveTo(0, -13.6)
    c.lineTo(0, -4.6)
    c.moveTo(-7, -10)
    c.lineTo(-4.4, -11.6)
    c.moveTo(7, -10)
    c.lineTo(4.4, -11.6)
    c.stroke()
    ellipse(c, 12, -8, 4.4, 4, '#a9c091')
    ellipse(c, 13.4, -9, 1.1, 1.4, '#34483b')
    ellipse(c, -13, -6, 3.6, 2.8, '#a9c091')
    feet(c, '#8ba776')
  } else {
    // Frog
    ellipse(c, 0, -10, 10.5, 7.5, '#a9c993')
    ellipse(c, -5.5, -17, 4, 4, '#a9c993')
    ellipse(c, 5.5, -17, 4, 4, '#a9c993')
    ellipse(c, -5.5, -17.6, 1.9, 2.2, '#fbf6ea')
    ellipse(c, 5.5, -17.6, 1.9, 2.2, '#fbf6ea')
    ellipse(c, -5.5, -17.4, 1.1, 1.3, '#34483b')
    ellipse(c, 5.5, -17.4, 1.1, 1.3, '#34483b')
    c.strokeStyle = '#7f9c69'
    c.lineWidth = 1.3
    c.beginPath()
    c.arc(0, -11, 5, 0.35, 2.8)
    c.stroke()
    feet(c, '#a9c993')
  }
  c.restore()
}

function drawSign(c: CanvasRenderingContext2D, score: number, time: number) {