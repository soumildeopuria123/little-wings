export type Env = {
  ASSETS: Fetcher
}

// The game is entirely local: personal bests live in the browser, so the Worker
// only has to hand back the built client assets.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request)
  },
}
