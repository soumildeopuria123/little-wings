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
  c.save()
  c.translate(19, -29 + Math.sin(time * 5.5) * 1.2)
  c.strokeStyle = '#c9b98f'
  c.lineWidth = 1.3
  c.beginPath()
  c.moveTo(-7, 8)
  c.lineTo(-1, 17)
  c.stroke()
  c.fillStyle = '#fdfaf0'
  round(c, 0, 0, 30, 19, 7)
  c.fill()
  c.strokeStyle = '#ded7bd'
  c.lineWidth = 1
  round(c, 0.5, 0.5, 29, 18, 6.5)
  c.stroke()
  c.fillStyle = '#c9714f'
  c.font = '600 12px "Fraunces Variable", Georgia, serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(String(score), 15, 10)
  c.restore()
}

function confetti(c: CanvasRenderingContext2D, age: number) {
  const p = Math.min(1, age / 0.9)
  if (p >= 1) return
  const colors = ['#d5654f', '#8faf7a', '#e8b05a', '#fbf6ea']
  c.save()
  for (let i = 0; i < 7; i++) {
    const angle = -0.35 - (i / 6) * 2.1
    const radius = 24 * easeOut(p)
    c.globalAlpha = c.globalAlpha * (1 - p)
    ellipse(
      c,
      2 + Math.cos(angle) * radius,
      -16 + Math.sin(angle) * radius - p * 4,
      1.6,
      2.2,
      colors[i % colors.length],
    )
  }
  c.restore()
}

function drawMilestone(
  c: CanvasRenderingContext2D,
  milestone: Milestone,
  still: boolean,
) {
  const up = milestoneLift(milestone.age)
  const fade =
    Math.min(1, milestone.age / 0.18) *
    Math.min(1, Math.max(0, (LIFE - milestone.age) / 0.3))
  if (up <= 0 || fade <= 0) return
  c.save()
  c.globalAlpha = fade
  // Anchored in the ground band: the bird never flies there, so nothing that
  // matters for collision is hidden.
  c.translate(34, FLOOR + 44 + (1 - up) * 42)
  const time = still ? 0 : milestone.age
  drawCritter(c, Math.floor(milestone.score / 50) % CRITTERS, time)
  drawSign(c, milestone.score, time)
  if (!still) confetti(c, milestone.age)
  c.restore()
}

export function drawBird(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  time: number,
  scale = 1,
  dead = false,
) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.scale(scale, scale)
  // Three small tail feathers, rounded silhouette and a warm belly.
  c.fillStyle = '#ad4e3e'
  c.beginPath()
  c.moveTo(-16, -3)
  c.quadraticCurveTo(-37, -13, -30, -1)
  c.lineTo(-21, 12)
  c.lineTo(-10, 10)
  c.fill()
  const body = c.createLinearGradient(-12, -19, 15, 18)
  body.addColorStop(0, '#f4936c')
  body.addColorStop(1, '#d5654f')
  ellipse(c, 0, 0, 24, 19, body)
  ellipse(c, 8, 8, 14, 10, '#ffe6b7')
  c.fillStyle = '#e8b05a'
  c.beginPath()
  c.moveTo(20, 0)
  c.quadraticCurveTo(38, 5, 25, 10)
  c.lineTo(18, 9)
  c.fill()
  c.strokeStyle = '#cc9140'
  c.lineWidth = 1.2
  c.beginPath()
  c.moveTo(23, 5)
  c.lineTo(31, 5)
  c.stroke()
  c.save()
  c.translate(-8, 4)
  c.rotate(-0.3 + Math.sin(time * 24) * (dead ? 0 : 0.5))
  ellipse(c, -3, 3, 11, 6, '#bf5645')
  c.strokeStyle = '#e48564'
  c.beginPath()
  c.ellipse(-4, 1, 8, 4, 0.1, 3.2, 5.8)
  c.stroke()
  c.restore()
  ellipse(c, 12, -6, 4.6, 5.4, '#fff6de')
  if (dead) {
    c.strokeStyle = '#343f34'
    c.lineWidth = 1.8
    c.beginPath()
    c.moveTo(10, -8)
    c.lineTo(14, -4)
    c.moveTo(14, -8)
    c.lineTo(10, -4)
    c.stroke()
  } else {
    ellipse(c, 13.4, -5.5, 2.5, 3.4, '#303e32')
    ellipse(c, 14.3, -7, 0.8, 1, '#fffdf2')
  }
  c.strokeStyle = '#f9b48b'
  c.lineWidth = 2
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(-4, -15)
  c.quadraticCurveTo(2, -18, 6, -15)
  c.stroke()
  c.restore()
}

function cloud(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
) {
  c.save()
  c.translate(x, y)
  c.scale(size, size)
  c.globalAlpha = opacity
  c.fillStyle = '#fffcf0'
  c.beginPath()
  c.moveTo(-50, 14)
  c.bezierCurveTo(-65, 13, -62, -10, -40, -12)
  c.bezierCurveTo(-39, -42, 4, -45, 14, -20)
  c.bezierCurveTo(35, -26, 50, -7, 43, 3)
  c.bezierCurveTo(66, 0, 68, 22, 45, 22)
  c.lineTo(-42, 22)
  c.quadraticCurveTo(-54, 21, -50, 14)
  c.fill()
  c.restore()
}

function hills(
  c: CanvasRenderingContext2D,
  width: number,
  offset: number,
  y: number,
  color: string,
  period: number,
  height: number,
) {
  c.fillStyle = color
  c.beginPath()
  c.moveTo(-period, HEIGHT)
  const start = -(offset % period) - period
  c.lineTo(start, y)
  for (let x = start; x < width + period; x += period) {
    c.bezierCurveTo(
      x + period * 0.2,
      y,
      x + period * 0.22,
      y - height,
      x + period * 0.5,
      y - height,
    )
    c.bezierCurveTo(
      x + period * 0.78,
      y - height,
      x + period * 0.8,
      y,
      x + period,
      y,
    )
  }
  c.lineTo(width + period, HEIGHT)
  c.closePath()
  c.fill()
}

function pipe(
  c: CanvasRenderingContext2D,
  x: number,
  edge: number,
  top: boolean,
) {
  const w = PIPE_WIDTH - 10,
    start = top ? -25 : edge,
    end = top ? edge : FLOOR + 10
  const grad = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
  grad.addColorStop(0, '#668754')
  grad.addColorStop(0.2, '#9eb975')
  grad.addColorStop(0.38, '#abc47e')
  grad.addColorStop(0.75, '#83a263')
  grad.addColorStop(1, '#5c7e50')
  c.fillStyle = '#567249'
  round(c, x - w / 2 - 1.5, start, w + 3, end - start, 7)
  c.fill()
  c.fillStyle = grad
  round(c, x - w / 2, start, w, end - start, 6)
  c.fill()
  c.fillStyle = '#d0dda2'
  c.globalAlpha = 0.35
  round(c, x - w / 2 + 9, start + 4, 4, end - start - 8, 2)
  c.fill()
  c.globalAlpha = 1
  const capY = top ? edge - 27 : edge
  c.fillStyle = '#58764b'
  round(c, x - PIPE_WIDTH / 2, capY, PIPE_WIDTH, 28, 8)
  c.fill()
  c.fillStyle = grad
  round(c, x - PIPE_WIDTH / 2 + 1.5, capY + 1.5, PIPE_WIDTH - 3, 24, 7)
  c.fill()
  c.fillStyle = '#c5d69b'
  round(c, x - PIPE_WIDTH / 2 + 5, capY + 3, PIPE_WIDTH - 10, 3, 2)
  c.fill()
  c.fillStyle = '#4d7046'
  c.globalAlpha = 0.35
  round(c, x - PIPE_WIDTH / 2 + 4, capY + 22, PIPE_WIDTH - 8, 3, 2)
  c.fill()
  c.globalAlpha = 1
  // Tiny climbing leaf: restrained detail, away from the collision edge.
  if (!top) {
    c.strokeStyle = '#52784a'
    c.lineWidth = 1.5
    c.beginPath()
    c.moveTo(x + 31, edge + 87)
    c.quadraticCurveTo(x + 38, edge + 64, x + 47, edge + 66)
    c.stroke()
    c.fillStyle = '#789753'
    c.beginPath()
    c.moveTo(x + 37, edge + 76)
    c.quadraticCurveTo(x + 31, edge + 54, x + 51, edge + 60)
    c.quadraticCurveTo(x + 52, edge + 73, x + 37, edge + 76)
    c.fill()
  }
}

export function render(