export type Env = {
  ASSETS: Fetcher
}

// The game is entirely local: personal bests live in the browser, so the Worker
// only has to hand back the built client assets.
export default {