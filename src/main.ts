import '@fontsource-variable/dm-sans'
import '@fontsource-variable/fraunces'
import './style.css'
import { createFlight, flap, step, STEP, type Flight } from './game/physics'
import { render, type Scene } from './game/render'
import { Sound } from './game/sound'

const icons = {
  trophy:
    '<path d="M8 3h8v5a4 4 0 0 1-8 0V3Z"/><path d="M8 5H5v2a4 4 0 0 0 4 4m7-6h3v2a4 4 0 0 1-4 4M12 12v5m-4 3h8m-6-3h4v3"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  sound:
    '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  pause: '<path d="M8 5v14m8-14v14"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
}
function icon(name: keyof typeof icons) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`
}
function element<T extends HTMLElement>(id: string) {
  return document.getElementById(id)! as T
}
function readLocal(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function writeLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* Private mode still plays. */
  }
}
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="header">
    <a class="brand" href="./" aria-label="Little wings home"><img src="favicon.svg" width="36" height="36" alt=""/><span>Little wings</span></a>
  </header>
  <main class="game-shell">
    <section id="stage" class="stage" aria-label="Flappy Bird">
      <canvas id="game" tabindex="0" aria-label="Flappy Bird. Space, arrow up, or tap to flap. Escape to pause."></canvas>
      <div id="hud" class="hud" hidden><span id="score" class="score">0</span><button id="pause" class="stage-button" aria-label="Pause game">${icon('pause')}</button></div>
      <div id="start-screen" class="start-screen">
        <h1>Flappy Bird<span class="title-dot">.</span></h1>
        <div class="start-actions"><button id="start" class="primary">Let’s fly ${icon('arrow')}</button><span class="key-hint"><kbd>Space</kbd><span>or tap to fly</span></span></div>
      </div>
      <div id="result-screen" class="scrim" hidden>
        <div class="result-card"><span id="result-eyebrow" class="eyebrow">Nice flight</span><h2 id="result-score">0</h2>
          <div class="result-best">${icon('trophy')}<span>Best <strong id="result-best">0</strong></span></div>
          <button id="again" class="primary">Fly again ${icon('arrow')}</button>
        </div>
      </div>
      <div id="pause-screen" class="scrim" hidden><div class="pause-card"><h2>Paused</h2><button id="resume" class="primary">Keep flying ${icon('play')}</button></div></div>
      <div id="countdown" class="countdown" hidden aria-live="polite"></div>
      <div id="toast" class="toast" role="status" hidden></div>
    </section>
    <footer class="footer"><span class="best">${icon('trophy')}<span>Best <strong id="best">0</strong></span></span>
      
      <div class="utilities"><button id="sound" class="icon-button" aria-label="Turn sound on" aria-pressed="false">${icon('mute')}</button><button id="fullscreen" class="icon-button" aria-label="Enter fullscreen">${icon('expand')}</button></div>
    </footer>
  </main>
  <div id="announcement" class="sr-only" aria-live="polite"></div>
`

const canvas = element<HTMLCanvasElement>('game'),
  ctx = canvas.getContext('2d', { alpha: false })!
const stage = element('stage'),
  sound = new Sound()
type Mode =
  | 'idle'
  | 'starting'
  | 'playing'
  | 'paused'
  | 'countdown'
  | 'dying'
  | 'over'
let mode: Mode = 'idle',
  flight: Flight = createFlight(10)
let best = Math.max(0, Number(readLocal('little-wings-best')) || 0)
let elapsed = 0,
  accumulator = 0,
  lastFrame = 0,
  width = 0,
  height = 0,
  deathAt = 0,
  countdownAt = 0
let pointPop = 0,
  impact = 0
let particles: Scene['particles'] = []
let milestone: { score: number; age: number } | null = null
const celebrated = new Set<number>()
let toastTimer = 0
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
sound.enabled = readLocal('little-wings-sound') === 'on'
element('best').textContent = String(best)
function toast(message: string) {
  const node = element('toast')
  node.textContent = message
  node.hidden = false
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    node.hidden = true
  }, 4000)
}
function updateSound() {
  element('sound').innerHTML = icon(sound.enabled ? 'sound' : 'mute')
  element('sound').setAttribute(
    'aria-label',
    sound.enabled ? 'Turn sound off' : 'Turn sound on',
  )
  element('sound').setAttribute('aria-pressed', String(sound.enabled))
}
updateSound()
// Milestones are rare early taps, then every fifty pipes once past a hundred.
function isMilestone(score: number) {
  return score === 25 || score === 50 || (score >= 100 && score % 50 === 0)
}

function resize() {
  const bounds = stage.getBoundingClientRect(),
    dpr = Math.min(devicePixelRatio || 1, 2)
  width = bounds.width
  height = bounds.height
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
new ResizeObserver(resize).observe(stage)
resize()

function start() {
  if (!['idle', 'over'].includes(mode)) return
  mode = 'starting'
  sound.unlock()
  element<HTMLButtonElement>('start').disabled = true
  element<HTMLButtonElement>('again').disabled = true
  const seed = crypto.getRandomValues(new Uint32Array(1))[0]
  flight = createFlight(seed)
  previousY = flight.y
  previousDistance = flight.distance
  particles = []
  milestone = null
  celebrated.clear()
  accumulator = 0
  impact = 0
  element('score').textContent = '0'
  element('hud').hidden = false
  element('start-screen').hidden = true
  element('result-screen').hidden = true
  element<HTMLButtonElement>('start').disabled = false
  element<HTMLButtonElement>('again').disabled = false
  stage.classList.add('in-flight')
  canvas.focus({ preventScroll: true })
  mode = 'playing'
  doFlap()
  if (document.hidden || !document.hasFocus()) pause()
}
function doFlap() {
  if (mode !== 'playing' || !flap(flight)) return
  sound.play('flap')
  if (!reducedMotion)
    for (let i = 0; i < 3; i++)
      particles.push({
        x: flight.distance - 21,
        y: flight.y + 3,
        life: 0.7,
        vx: -30 - Math.random() * 25,
        vy: (Math.random() - 0.5) * 50,
      })
}
function pause() {
  if (mode !== 'playing' && mode !== 'countdown') return
  mode = 'paused'
  accumulator = 0
  element('pause-screen').hidden = false
  element('countdown').hidden = true
  element('resume').focus({ preventScroll: true })
}
function resume() {
  if (mode !== 'paused') return
  element('pause-screen').hidden = true
  element('countdown').hidden = false
  mode = 'countdown'
  countdownAt = elapsed
  element('countdown').textContent = '3'
  canvas.focus({ preventScroll: true })
}
function finish() {