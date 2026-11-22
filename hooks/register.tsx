import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Weather } from '../types'
import { makeColors } from './make-colors.js'
import { scene } from './scene'

const SCENE = 'winter-fairyland'

const weather = atom(
  { plugin: 'winter-fairyland', key: 'weather' } as const,
  { snow: 1, drift: 0, waiting: false, leaving: false },
  { shape: 'weather-2' },
)

// Icy blue by day, moonlit snow by night.
const { theme, problems } = makeColors({
  label: 'Winter fairyland',
  roles: { accent: '#2f6fb0', danger: '#c0392b', success: '#2e7d4f', warning: '#c58a1a', pro: '#7a5aa8' },
  light: {
    gray: {
      anchors: {
        'surface-0': '#e4edf5',
        'surface-1': '#ebf2f8',
        'surface-2': '#f3f7fb',
        'text-primary': '#122030',
        'text-secondary': '#33465b',
        'text-muted': '#4a5d72',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0c1522',
        'surface-1': '#121f30',
        'surface-2': '#172739',
        'surface-3': '#1b2c40',
        'text-primary': '#e8f0f8',
        'text-secondary': '#c3d1df',
        'text-muted': '#9badbf',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE, glass: { blur: 6, opacity: 0.55 } },
}

// Workload, kept in the module: it starts over on a reload, which is fine.
let mainRunning = false
let agentsRunning = 0
let toolsRunning = 0
let activity = 0 // recent bursts of steps and tool calls, decaying
let contextShare = 0 // 0..1 of the context window
let waiting = false
// After the person answers, the reindeer sinks behind the snowbank for a
// moment before it leaves the scene.
let leaving = false
let leaveTimer: { cancel: () => void } | null = null
// The weather held while it sinks, so no redraw restarts the animation.
let frozen: Weather | null = null
const SINK_MS = 1800
// While /snow pins or demos the weather, this wins over the live figures.
let pinned: Weather | null = null
let demoTimers: { cancel: () => void }[] = []

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function target(): Weather {
  if (pinned !== null) return pinned
  if (leaving && !waiting && frozen !== null) return frozen
  const work = clamp(
    (mainRunning ? 0.3 : 0) + Math.min(0.3, agentsRunning * 0.15) + Math.min(0.3, toolsRunning * 0.12) + activity,
    0,
    1,
  )
  const snow = Math.round(6 * clamp(0.65 * work + 0.35 * contextShare, 0, 1))
  return { snow, drift: Math.round(5 * contextShare), waiting, leaving: leaving && !waiting }
}


// Never throws: the hooks that call it sit in front of tool calls, prompts
// and notifications, and the weather must never hold any of those up.
async function refresh($: EngineInterface): Promise<void> {
  try {
    let next = target()
    const now = await read($, weather)
    if (now.waiting && !next.waiting && pinned === null) {
      // it was up and is no longer wanted: let it sink first
      leaving = true
      frozen = { snow: now.snow, drift: now.drift, waiting: false, leaving: true }
      leaveTimer?.cancel()
      leaveTimer = $.clock.after(SINK_MS, () => {
        leaving = false
        frozen = null
        leaveTimer = null
        void refresh($)
      })
      next = target()
    } else if (next.waiting && leaveTimer !== null) {
      leaveTimer.cancel()
      leaveTimer = null
      leaving = false
      frozen = null
    }
    if (
      now.snow === next.snow &&
      now.drift === next.drift &&
      now.waiting === next.waiting &&
      now.leaving === next.leaving
    ) {
      return
    }
    await update($, weather, () => next)
    $.ui.status(statusLine(next))
  } catch {
    // leave the scene as it is
  }
}

function statusLine(w: Weather): string {
  const flakes = '❄'.repeat(Math.max(1, w.snow))
  const mode = pinned !== null ? ' (demo)' : ` · context ${Math.round(contextShare * 100)}%`
  return `${flakes} snowfall ${w.snow}/6 · snowdrift ${w.drift}/5${mode}`
}

function stopDemo(): void {
  for (const t of demoTimers) t.cancel()
  demoTimers = []
}

// Snowfall climbs 0 to 6 while the drift rises 0 to 5, then the snow eases
// off over the deep drift, then live weather comes back.
const DEMO: Weather[] = [
  ...[0, 1, 2, 3, 4, 5, 6].map(s => ({ snow: s, drift: Math.round((s * 5) / 6), waiting: false, leaving: false })),
  ...[5, 4, 3, 2, 1, 0].map(s => ({ snow: s, drift: 5, waiting: false, leaving: false })),
]
const STEP_MS = 3500

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.log(unpainted)
    }
    const set = await $.theme.set(LOOK)
    if (!set.isDrawn) {
      $.ui.log(`winter-fairyland: ${set.reason}`)
    }
    // A (re)load happens between turns, when Claude waits for the person, but
    // the module's flags start over; so start out waiting, reindeer showing.
    waiting = !mainRunning
    try {
      const usage = await $.session.usage()
      contextShare = clamp((usage.context.percent ?? 0) / 100, 0, 1)
    } catch {
      // no figures yet
    }
    await $.command.register({
      name: 'snow',
      description: 'Winter fairyland: "demo" runs through every snowfall and drift level; "<snow 0-6> <drift 0-5>" pins one; "live" goes back to real workload',
    })
    $.clock.every(2500, () => {
      activity *= 0.8
      if (activity < 0.01) activity = 0
      void refresh($)
    })
    await refresh($)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.context.percent !== undefined) {
      contextShare = clamp(e.context.percent / 100, 0, 1)
      await refresh($)
    }
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) {
      mainRunning = true
      waiting = false
    } else {
      agentsRunning++
    }
    activity = Math.min(0.4, activity + 0.1)
    await refresh($)
    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    activity = Math.min(0.4, activity + 0.06)
    return yield* next(e)
  })

  on('tool.call', async ($, e, next) => {
    const asks = e.tool === 'AskUserQuestion' || e.tool === 'ExitPlanMode'
    toolsRunning++
    activity = Math.min(0.4, activity + 0.1)
    if (asks) waiting = true
    await refresh($)
    try {
      return await next(e)
    } finally {
      toolsRunning = Math.max(0, toolsRunning - 1)
      if (asks) waiting = false
      await refresh($)
    }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      mainRunning = false
      toolsRunning = 0
      waiting = true
    } else {
      agentsRunning = Math.max(0, agentsRunning - 1)
    }
    await refresh($)
    return next(e)
  })

  // The engine notifies when it needs the person (a permission prompt, idle input).
  on('ui.notify', async ($, e, next) => {
    waiting = true
    await refresh($)
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    waiting = false
    await refresh($)
    return next(e)
  })

  on('command.run', { command: 'snow' }, async ($, e) => {
    const args = e.args.trim().toLowerCase()
    stopDemo()
    if (args === 'live' || args === 'off') {
      pinned = null
      await refresh($)
      return { text: 'Snow follows the live workload and context again.' }
    }
    const nums = args.match(/^(\d)\s+(\d)$/)
    if (nums !== null) {
      pinned = { snow: clamp(Number(nums[1]), 0, 6), drift: clamp(Number(nums[2]), 0, 5), waiting: false, leaving: false }
      await refresh($)
      return { text: `Pinned snowfall ${pinned.snow}/6, snowdrift ${pinned.drift}/5. "/snow live" to undo.` }
    }
    DEMO.forEach((w, i) => {
      demoTimers.push(
        $.clock.after(i * STEP_MS, () => {
          pinned = w
          void refresh($)
        }),
      )
    })
    demoTimers.push(
      $.clock.after(DEMO.length * STEP_MS, () => {
        pinned = null
        demoTimers = []
        void refresh($)
      }),
    )
    return {
      text: `Snow demo: snowfall rises 0→6 while the drift piles up 0→5, then the snow eases off. ${Math.round((DEMO.length * STEP_MS) / 1000)}s, then back to live. Watch the status line for the level.`,
    }
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const w = await read($, weather)
    const alt = w.waiting
      ? 'A snowy mountain village of log cabins under the northern lights; a reindeer peeks over a snowbank'
      : 'A snowy mountain village of log cabins under the northern lights, with falling snow'

    return <Svg source={scene(w)} alt={alt} isInteractive />
  })
}
