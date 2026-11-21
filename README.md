# Little Wings


Try it🙂: https://soumildeopuria123.github.io/little-wings/


An illustrated, single-player arcade game. The game is branded **Little wings**
with locally bundled Fraunces and DM Sans fonts, a coral bird, sculpted pipes,
and a layered canvas landscape. No external image or font requests are required.

## Run

```sh
bun install
bun run dev
```

Open the printed loopback URL. Space, arrow up, a pointer click or a touch flaps;
Escape or P pauses. Leaving the tab pauses automatically. Resume counts down
before restoring the exact simulation state. Sound is opt-in, and fullscreen is
shown only where supported. The layout fills the viewport without page scrolling.

```sh
bun run typecheck
bun test tests
bun run build
```

Use the repository's pinned Bun when working inside the monorepo. This project is
standalone, with its own lockfile; it does not import other repo packages.

## Playing

There is no leaderboard and no account: your best flight is kept on this device.

Reaching 25, 50, then every 50 points pops a tiny critter out of the grass at the
bottom-left of the stage. It waves, holds up the score for about a second and a
half, then ducks away. It lives in the ground band the bird can never enter, so it
never covers the pipe or gap you are aiming for, never steals focus, and never
interrupts the flight. With reduced motion the critter simply appears and fades
out, with no wiggle, hop or confetti.

## Customize

- `src/game/render.ts`: bird, pipes, sky, clouds, hills, terrain and particles,
  plus the milestone critters. All artwork is code-native and resolution
  independent.
- `src/game/physics.ts`: deterministic 120 Hz physics, seeded courses, collision
  geometry, course spacing and replay validation. Rendering and viewport size do
  not change collision coordinates or scoring. A flight is capped at six minutes.
- `src/main.ts`: UI states, controls, milestone schedule, local best.
- `src/style.css`: typography, colors, layout, and responsive breakpoints.
- `src/game/sound.ts`: short synthesized sounds; no audio downloads.
- `src/worker/index.ts`: serves the built assets.

`isMilestone()` in `src/main.ts` decides which scores are celebrated.

## Build and deployment

`deploy.json` points to the built Worker and static assets for Freebuff Sites.
`wrangler.jsonc` contains only local settings. No database, secret, or auth
configuration is required.

Tests cover the deterministic simulation, collision boundaries and replay
validation.
