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