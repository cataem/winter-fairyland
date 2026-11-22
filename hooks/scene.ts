import type { Weather } from '../types'

// The winter village, drawn as one SVG. Snowfall (0..6), ground drift (0..5)
// and the peeking reindeer come from Weather; everything else stays put.

const W = 1600
const H = 1000

function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const n = (v: number) => Math.round(v * 10) / 10

// Snowflakes per level: a few lazy flakes up to a proper blizzard.
const FLAKES = [10, 26, 48, 72, 100, 128, 150]

// Calm snow while the reindeer waits: a light sprinkle of small flakes,
// drifting down slowly whatever the level was.
function snow(level: number, calm: boolean): { css: string; svg: string } {
  const r = rng(7)
  const count = calm ? 28 : (FLAKES[level] ?? 10)
  const speed = calm ? 0.45 : 1 + level * 0.22
  const wind = calm ? 12 : 20 + level * 45
  const size = calm ? 0.65 : 1
  const layers = [
    { share: 0.4, rMin: 1.2, rMax: 2.2, dMin: 17, dMax: 24, op: 0.55, sway: false },
    { share: 0.35, rMin: 2.2, rMax: 3.4, dMin: 11, dMax: 16, op: 0.8, sway: true },
    { share: 0.25, rMin: 3.4, rMax: 5, dMin: 7, dMax: 10.5, op: 0.95, sway: true },
  ]
  let svg = ''
  for (const layer of layers) {
    const k = Math.round(count * layer.share)
    let flakes = ''
    for (let j = 0; j < k; j++) {
      const x = Math.round(r() * (W + wind) - wind)
      const y = Math.round(r() * H)
      const rad = n((layer.rMin + r() * (layer.rMax - layer.rMin)) * size)
      const dur = n((layer.dMin + r() * (layer.dMax - layer.dMin)) / speed)
      const delay = n(-r() * dur)
      const kind = ['fa', 'fb', 'fc'][Math.floor(r() * 3)]
      const flake = `<circle cx="${x}" cy="-20" r="${rad}"/>`
      const inner = layer.sway ? `<g class="sway w${j % 3}">${flake}</g>` : flake
      flakes += `<g class="fall ${kind}" transform="translate(0 ${y})" style="animation-duration:${dur}s;animation-delay:${delay}s">${inner}</g>`
    }
    svg += `<g fill="#fff" opacity="${layer.op}">${flakes}</g>`
  }
  // The outer group falls from the top; at rest (reduced motion) it keeps its
  // scattered place; the circle's cx carries its column.
  const css =
    `.fall{animation-timing-function:linear;animation-iteration-count:infinite}` +
    `.w1{animation-delay:-1.3s}.w2{animation-delay:-2.7s}` +
    `.fa{animation-name:fa}.fb{animation-name:fb}.fc{animation-name:fc}` +
    `@keyframes fa{from{transform:translate(0,0)}to{transform:translate(${wind}px,1080px)}}` +
    `@keyframes fb{from{transform:translate(0,0)}to{transform:translate(${n(wind * 0.6)}px,1080px)}}` +
    `@keyframes fc{from{transform:translate(0,0)}to{transform:translate(${n(wind * 1.3)}px,1080px)}}`
  return { css, svg }
}

// The reindeer rises from behind a snowbank in the bottom-right corner,
// looking straight at the person.
const REINDEER =
  `<g class="deerpos"><g class="deer">` +
  `<g transform="translate(1460 735) rotate(-6)"><g class="nod">` +
  `<path d="M-36 28C-44 80 -50 130 -54 220L62 220C58 130 50 80 40 28Z" fill="#8b5a35"/>` +
  `<path d="M-40 58C-14 76 18 78 46 60" stroke="#c0392b" stroke-width="16" fill="none" stroke-linecap="round"/>` +
  `<path d="M30 70L44 118" stroke="#c0392b" stroke-width="14" stroke-linecap="round"/>` +
  `<g stroke="#6b4a2b" stroke-width="9" stroke-linecap="round" fill="none">` +
  `<path d="M-28 -52C-44 -98 -70 -120 -96 -150M-46 -96L-88 -100M-62 -120L-58 -164"/>` +
  `<path d="M28 -52C44 -98 70 -120 96 -150M46 -96L88 -100M62 -120L58 -164"/>` +
  `</g>` +
  `<g class="snowy"><circle cx="-96" cy="-152" r="6"/><circle cx="96" cy="-152" r="6"/><circle cx="-58" cy="-166" r="5"/><circle cx="58" cy="-166" r="5"/></g>` +
  `<ellipse cx="-56" cy="-38" rx="28" ry="11" transform="rotate(-24 -56 -38)" fill="#8b5a35"/>` +
  `<ellipse cx="56" cy="-38" rx="28" ry="11" transform="rotate(24 56 -38)" fill="#8b5a35"/>` +
  `<ellipse cx="-58" cy="-38" rx="16" ry="5" transform="rotate(-24 -58 -38)" fill="#e3a58a"/>` +
  `<ellipse cx="58" cy="-38" rx="16" ry="5" transform="rotate(24 58 -38)" fill="#e3a58a"/>` +
  `<ellipse cx="0" cy="0" rx="48" ry="58" fill="#9a6640"/>` +
  `<ellipse cx="0" cy="38" rx="34" ry="26" fill="#dcb892"/>` +
  `<circle cx="-32" cy="20" r="9" fill="#ff8a8a" opacity="0.35"/><circle cx="32" cy="20" r="9" fill="#ff8a8a" opacity="0.35"/>` +
  `<g class="eyes">` +
  `<ellipse cx="-19" cy="-8" rx="11" ry="13" fill="#ffffff"/><ellipse cx="19" cy="-8" rx="11" ry="13" fill="#ffffff"/>` +
  `<circle cx="-18" cy="-5" r="7" fill="#1a1a1a"/><circle cx="18" cy="-5" r="7" fill="#1a1a1a"/>` +
  `<circle cx="-15.5" cy="-8" r="2.5" fill="#ffffff"/><circle cx="20.5" cy="-8" r="2.5" fill="#ffffff"/>` +
  `</g>` +
  `<ellipse cx="0" cy="26" rx="15" ry="11" fill="#2b1a12"/><ellipse cx="-4" cy="22" rx="4" ry="2.5" fill="#ffffff" opacity="0.6"/>` +
  `<path d="M-8 50Q0 56 8 50" stroke="#6b4a2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
  `</g></g>` +
  `</g>` +
  `</g>`

// The snowbank in the bottom-right corner: always there; the reindeer hides
// behind it and rises over it. It moves with the reindeer to keep it covered.
const BANK =
  `<g class="deerpos">` +
  `<path class="drift" d="M1290 1010C1300 860 1390 812 1470 808C1540 805 1600 816 1660 822L2300 822V1010Z"/>` +
  `<path d="M1330 850C1380 822 1440 812 1500 814" stroke="#ffffff" stroke-opacity=".5" stroke-width="3" fill="none"/>` +
  `</g>`

const i = (v: number) => Math.round(v)

// A snow-laden spruce: drooping tiers with ragged tips, snow lit from the
// right, shaded on the left. `h` from the trunk's foot to the tip.
type SpruceOpts = { fill: string; lit?: string; shade?: string; seed: number; tiers?: number }

function spruce(x: number, base: number, h: number, o: SpruceOpts): string {
  const r = rng(o.seed)
  const top = base - h
  const tiers = o.tiers ?? Math.max(4, Math.min(13, Math.round(h / 26)))
  const s = (h * 0.9) / tiers
  const rows: { y: number; w: number }[] = []
  for (let k = 0; k < tiers; k++) {
    const t = (k + 1) / tiers
    rows.push({ y: top + h * 0.04 + s * (k + 1), w: h * 0.3 * Math.pow(t, 0.85) * (0.88 + r() * 0.24) })
  }
  const side = (dir: number) =>
    rows.map(({ y, w }) =>
      `${i(x + dir * 0.5 * w)},${i(y - 0.55 * s)} ${i(x + dir * 0.8 * w)},${i(y - 0.18 * s)} ${i(x + dir * w)},${i(y + 0.06 * s)} ${i(x + dir * 0.42 * w)},${i(y - 0.08 * s)}`,
    )
  const right = side(1)
  const left = side(-1).reverse()
  const trunkW = Math.max(2, h * 0.025)
  let out =
    `<rect x="${i(x - trunkW)}" y="${i(base - h * 0.08)}" width="${i(trunkW * 2)}" height="${i(h * 0.08)}" fill="#20140e"/>` +
    `<polygon points="${i(x)},${i(top)} ${right.join(' ')} ${left.join(' ')}" fill="${o.fill}"/>`
  if (o.lit !== undefined) {
    let lit = ''
    let shade = ''
    for (const { y, w: w0 } of rows) {
      const j = 0.85 + r() * 0.3
      const w = w0 * (0.6 + r() * 0.35)
      lit += `M${i(x + 0.1 * w)} ${i(y - 0.62 * s)}Q${i(x + 0.55 * w)} ${i(y - 0.75 * s * j)} ${i(x + 0.97 * w)} ${i(y)}Q${i(x + 0.6 * w)} ${i(y - 0.32 * s)} ${i(x + 0.1 * w)} ${i(y - 0.42 * s)}Z`
      if (o.shade !== undefined) {
        shade += `M${i(x - 0.1 * w)} ${i(y - 0.6 * s)}Q${i(x - 0.5 * w)} ${i(y - 0.68 * s * j)} ${i(x - 0.92 * w)} ${i(y - 0.02 * s)}Q${i(x - 0.55 * w)} ${i(y - 0.3 * s)} ${i(x - 0.1 * w)} ${i(y - 0.44 * s)}Z`
      }
    }
    out += `<path d="${lit}" fill="${o.lit}"/>`
    if (shade !== '') out += `<path d="${shade}" fill="${o.shade}"/>`
  }
  return out
}

// A log cabin with its gable to the road: snow slabs on the roof, warm
// windows with a halo, and a pool of lamplight on the snow before it.
type Cabin = { x: number; base: number; w: number; h: number; roof: number; porch?: boolean; chimney?: boolean }

const CABINS: Cabin[] = [
  { x: 560, base: 678, w: 112, h: 66, roof: 50 },
  { x: 928, base: 682, w: 106, h: 64, roof: 48 },
  { x: 345, base: 714, w: 192, h: 114, roof: 86, chimney: true },
  { x: 1062, base: 716, w: 186, h: 110, roof: 84, chimney: true },
  { x: -40, base: 836, w: 340, h: 205, roof: 152, porch: true },
  { x: 1316, base: 840, w: 330, h: 198, roof: 146, porch: true, chimney: true },
]

function windowAt(cx: number, cy: number, w: number, h: number, s: number): string {
  return (
    `<circle class="glow" cx="${i(cx)}" cy="${i(cy)}" r="${i(Math.max(w, h) * 1.25)}" fill="url(#halo)"/>` +
    `<rect x="${i(cx - w / 2)}" y="${i(cy - h / 2)}" width="${i(w)}" height="${i(h)}" fill="url(#win)" stroke="#2a180e" stroke-width="${n(3 * s)}"/>` +
    `<path d="M${i(cx)} ${i(cy - h / 2)}V${i(cy + h / 2)}M${i(cx - w / 2)} ${i(cy - h * 0.1)}H${i(cx + w / 2)}" stroke="#2a180e" stroke-width="${n(2.4 * s)}"/>`
  )
}

function cabin(c: Cabin, cap: number): string {
  const s = c.w / 200
  const top = c.base - c.h
  const ax = c.x + c.w / 2
  const ay = top - c.roof
  const ov = 24 * s
  const half = c.w / 2 + ov
  const ey = top + (ov * c.roof) / (c.w / 2)
  const lx = c.x - ov
  const rx = c.x + c.w + ov
  const t = (cap + 7) * s
  let out =
    `<ellipse cx="${i(ax)}" cy="${i(c.base + 16 * s)}" rx="${i(c.w * 0.8)}" ry="${i(38 * s)}" fill="url(#pool)"/>` +
    `<rect x="${i(c.x)}" y="${i(top)}" width="${i(c.w)}" height="${i(c.h)}" fill="url(#wood)"/>` +
    `<polygon points="${i(c.x)},${i(top)} ${i(ax)},${i(ay + 6 * s)} ${i(c.x + c.w)},${i(top)}" fill="#3a2416"/>`
  let logs = ''
  for (let y = top + 12 * s; y < c.base - 2; y += 13 * s) logs += `M${i(c.x)} ${i(y)}H${i(c.x + c.w)}`
  for (let y = top - 12 * s; y > ay + 20 * s; y -= 13 * s) {
    const hw = ((y - ay) / c.roof) * (c.w / 2)
    logs += `M${i(ax - hw)} ${i(y)}H${i(ax + hw)}`
  }
  out += `<path d="${logs}" stroke="#1e1209" stroke-opacity=".6" stroke-width="${n(1.8 * s)}"/>`
  out +=
    `<rect x="${i(c.x)}" y="${i(top)}" width="${i(9 * s)}" height="${i(c.h)}" fill="#2c1b10"/>` +
    `<rect x="${i(c.x + c.w - 9 * s)}" y="${i(top)}" width="${i(9 * s)}" height="${i(c.h)}" fill="#2c1b10"/>`
  // windows
  const wy = c.base - c.h * 0.6
  const ww = c.w * 0.15
  const wh = c.h * 0.3
  if (c.porch) {
    out += windowAt(c.x + c.w * 0.2, wy, ww, wh, s) + windowAt(c.x + c.w * 0.8, wy, ww, wh, s)
    out +=
      `<circle class="glow" cx="${i(ax)}" cy="${i(c.base - c.h * 0.3)}" r="${i(c.h * 0.4)}" fill="url(#halo)"/>` +
      `<rect x="${i(ax - c.w * 0.08)}" y="${i(c.base - c.h * 0.5)}" width="${i(c.w * 0.16)}" height="${i(c.h * 0.5)}" fill="url(#win)" stroke="#2a180e" stroke-width="${n(4 * s)}"/>`
  } else {
    out += windowAt(c.x + c.w * 0.27, wy, ww, wh, s) + windowAt(c.x + c.w * 0.73, wy, ww, wh, s)
  }
  out += windowAt(ax, ay + c.roof * 0.62, c.w * 0.12, c.roof * 0.26, s)
  // chimney with smoke
  if (c.chimney) {
    const cx = ax + half * 0.55
    const sy = ay + ((cx - ax) / half) * (ey - ay)
    out +=
      `<rect x="${i(cx - 11 * s)}" y="${i(sy - 46 * s)}" width="${i(22 * s)}" height="${i(52 * s)}" fill="#4b4752"/>` +
      `<rect x="${i(cx - 15 * s)}" y="${i(sy - 52 * s - cap * s * 0.5)}" width="${i(30 * s)}" height="${i(10 * s + cap * s * 0.5)}" rx="${i(5 * s)}" fill="url(#roofsnow)"/>` +
      [0, 3, 6]
        .map(d => `<circle class="smoke" cx="${i(cx)}" cy="${i(sy - 60 * s)}" r="${i((7 + d) * s + 3)}" fill="#c8d4e8" opacity=".2" style="animation-delay:-${d}s"/>`)
        .join('')
  }
  // roof edge and its snow slabs
  out += `<path d="M${i(lx)} ${i(ey)}L${i(ax)} ${i(ay)}L${i(rx)} ${i(ey)}" stroke="#1e1209" stroke-width="${i(11 * s)}" fill="none" stroke-linejoin="round"/>`
  out +=
    `<path fill="url(#roofsnow)" d="M${i(ax)} ${i(ay - t)}L${i(lx - 9 * s)} ${i(ey - t * 0.55)}Q${i(lx - 20 * s)} ${i(ey + 4 * s)} ${i(lx - 2 * s)} ${i(ey + 10 * s)}L${i(ax)} ${i(ay + 6 * s)}Z` +
    `M${i(ax)} ${i(ay - t)}L${i(rx + 9 * s)} ${i(ey - t * 0.55)}Q${i(rx + 20 * s)} ${i(ey + 4 * s)} ${i(rx + 2 * s)} ${i(ey + 10 * s)}L${i(ax)} ${i(ay + 6 * s)}Z"/>` +
    `<path d="M${i(lx - 9 * s)} ${i(ey - t * 0.55)}L${i(ax)} ${i(ay - t)}L${i(rx + 9 * s)} ${i(ey - t * 0.55)}" stroke="#ffffff" stroke-opacity=".7" stroke-width="${n(2.5 * s)}" fill="none"/>`
  // porch
  if (c.porch) {
    const rail = c.base - c.h * 0.24
    let bal = ''
    for (let x = c.x + 10 * s; x < c.x + c.w - 6 * s; x += 17 * s) {
      if (Math.abs(x - ax) > c.w * 0.12) bal += `M${i(x)} ${i(rail)}V${i(c.base)}`
    }
    out +=
      `<rect x="${i(c.x - 6 * s)}" y="${i(ey)}" width="${i(10 * s)}" height="${i(c.base - ey)}" fill="#2a190f"/>` +
      `<rect x="${i(c.x + c.w - 4 * s)}" y="${i(ey)}" width="${i(10 * s)}" height="${i(c.base - ey)}" fill="#2a190f"/>` +
      `<path d="${bal}" stroke="#2a190f" stroke-width="${n(4.5 * s)}"/>` +
      `<rect x="${i(c.x - 6 * s)}" y="${i(rail)}" width="${i(c.w * 0.38)}" height="${i(7 * s)}" fill="#2a190f"/>` +
      `<rect x="${i(ax + c.w * 0.12)}" y="${i(rail)}" width="${i(c.w * 0.38 + 6 * s)}" height="${i(7 * s)}" fill="#2a190f"/>` +
      `<rect x="${i(c.x - 6 * s)}" y="${i(rail - 4 * s - cap * s * 0.3)}" width="${i(c.w * 0.38)}" height="${i(5 * s + cap * s * 0.3)}" rx="${i(3 * s)}" fill="#dfe8f6"/>` +
      `<rect x="${i(ax + c.w * 0.12)}" y="${i(rail - 4 * s - cap * s * 0.3)}" width="${i(c.w * 0.38 + 6 * s)}" height="${i(5 * s + cap * s * 0.3)}" rx="${i(3 * s)}" fill="#dfe8f6"/>` +
      `<rect x="${i(c.x - 10 * s)}" y="${i(c.base - 6 * s)}" width="${i(c.w + 20 * s)}" height="${i(14 * s)}" fill="#24150c"/>` +
      `<rect x="${i(ax - c.w * 0.13)}" y="${i(c.base + 8 * s)}" width="${i(c.w * 0.26)}" height="${i(9 * s)}" fill="#2e1b10"/>` +
      `<rect x="${i(ax - c.w * 0.15)}" y="${i(c.base + 17 * s)}" width="${i(c.w * 0.3)}" height="${i(9 * s)}" fill="#2e1b10"/>`
  }
  // snow heaped at the foot of the walls
  out +=
    `<ellipse cx="${i(c.x + 14 * s)}" cy="${i(c.base + 6 * s)}" rx="${i(44 * s)}" ry="${i(15 * s)}" fill="url(#mound)"/>` +
    `<ellipse cx="${i(c.x + c.w - 14 * s)}" cy="${i(c.base + 6 * s)}" rx="${i(44 * s)}" ry="${i(15 * s)}" fill="url(#mound)"/>`
  return out
}

function starfield(): string {
  const r = rng(3)
  let s = ''
  for (let k = 0; k < 110; k++) {
    const x = i(r() * W)
    const y = i(Math.pow(r(), 1.4) * 560)
    const rad = n(0.5 + Math.pow(r(), 3) * 1.9)
    const tw = k % 5 === 0 ? ` class="tw" style="animation-delay:${n(-r() * 6)}s;animation-duration:${n(4 + r() * 4)}s"` : ''
    s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#ffffff"${tw}/>`
  }
  return `<g class="stars">${s}</g>`
}

const SHOOTING =
  [
    [1230, 40, 9, 0],
    [760, 70, 13, -4],
    [1460, 180, 17, -9],
  ]
    .map(
      ([x, y, d, del]) =>
        `<g class="shoot" style="animation-duration:${d}s;animation-delay:${del}s" opacity="0"><line x1="${x}" y1="${y}" x2="${x! - 110}" y2="${y! + 70}" stroke="url(#streak)" stroke-width="2.4" stroke-linecap="round"/></g>`,
    )
    .join('')

// Aurora curtains made of soft vertical rays whose tops ride a wave; rays
// shorten and fade toward each curtain's ends, so no edge shows.
function curtain(x0: number, x1: number, top: number, amp: number, len: number, seed: number, fill: string, cls: string): string {
  const r = rng(seed)
  let out = ''
  for (let x = x0; x <= x1; x += 14) {
    const f = (x - x0) / (x1 - x0)
    const env = Math.sin(Math.PI * f)
    const y = top + amp * Math.sin(f * 5.2 + seed) + amp * 0.35 * Math.sin(f * 17)
    const h = len * (0.55 + 0.45 * env) * (0.8 + r() * 0.4)
    out += `<rect x="${x}" y="${i(y)}" width="18" height="${i(h)}" fill="${fill}" opacity="${n(0.15 + 0.75 * env * (0.7 + r() * 0.3))}"/>`
  }
  return `<g class="${cls}">${out}</g>`
}

const AURORA =
  `<g class="aur">` +
  curtain(820, 1600, 70, 55, 300, 1, 'url(#ray)', 'au1') +
  curtain(620, 1100, 170, 40, 300, 2, 'url(#ray2)', 'au2') +
  curtain(250, 640, 40, 30, 200, 3, 'url(#ray3)', 'au3') +
  `</g>`

function cloud(x: number, y: number, sc: number, cls: string): string {
  const puffs = [
    [0, 0, 60, 34],
    [55, -22, 52, 38],
    [110, -6, 58, 32],
    [160, 8, 46, 26],
    [-50, 10, 44, 24],
    [70, 16, 90, 24],
  ]
  return `<g class="${cls}" opacity=".8">${puffs
    .map(([dx, dy, rx, ry]) => `<ellipse cx="${i(x + dx! * sc)}" cy="${i(y + dy! * sc)}" rx="${i(rx! * sc)}" ry="${i(ry! * sc)}" fill="url(#cloud)"/>`)
    .join('')}</g>`
}

const PEAKS: [number, number][] = [
  [0, 640], [130, 575], [250, 610], [400, 520], [520, 585], [640, 500], [720, 535], [830, 448],
  [940, 530], [1040, 488], [1150, 560], [1280, 505], [1420, 570], [1600, 520],
]

function mountains(): string {
  const ridge = PEAKS.map(([x, y]) => `${x},${y}`).join(' ')
  let lit = ''
  for (let k = 1; k < PEAKS.length - 1; k++) {
    const [px, py] = PEAKS[k]!
    const [qx, qy] = PEAKS[k + 1]!
    const [ox, oy] = PEAKS[k - 1]!
    if (py > qy || py > oy) {
      // a lit face down the right flank, and a snow cap on the left
      lit += `M${px} ${py}L${i(px + (qx - px) * 0.55)} ${i(py + (qy - py) * 0.55)}L${i(px + (qx - px) * 0.2)} ${i(py + 70)}Z`
      lit += `M${px} ${py}L${i(px - (px - ox) * 0.25)} ${i(py + (oy - py) * 0.25)}L${i(px - 6)} ${i(py + 34)}Z`
    }
  }
  return (
    `<polygon points="${ridge} 1600,720 0,720" fill="url(#mtn)"/>` +
    `<path d="${lit}" fill="#a9c2e8" opacity=".55"/>`
  )
}

function forestBand(): string {
  const r = rng(21)
  let out = ''
  for (let k = 0; k < 60; k++) {
    const x = i(r() * W)
    const near = Math.abs(x - 800) < 140
    const base = 640 + r() * 46
    const h = (near ? 26 : 40) + r() * (near ? 26 : 70)
    out += spruce(x, base, h, { fill: '#0e2140', lit: '#5c7eb0', seed: 100 + k, tiers: 5 })
  }
  return out
}

const MID_TREES: [number, number, number][] = [
  [270, 708, 300], [318, 712, 250], [500, 690, 210], [1010, 694, 200],
  [1280, 712, 330], [1340, 716, 270], [1235, 706, 220],
]

function tracks(): string {
  return (
    `<path d="M800 660C770 760 650 880 520 1000M804 660C786 760 704 880 616 1000M808 660C824 760 884 880 956 1000M812 660C842 760 962 880 1064 1000" stroke="#5f79a8" stroke-opacity=".6" stroke-width="7" fill="none"/>` +
    `<path d="M803 660C773 760 655 880 527 1000M815 660C845 760 967 880 1071 1000" stroke="#f2f6ff" stroke-opacity=".45" stroke-width="2" fill="none"/>`
  )
}

function lantern(x: number, y: number): string {
  return (
    `<circle class="glow" cx="${x}" cy="${y - 92}" r="46" fill="url(#halo)"/>` +
    `<ellipse cx="${x}" cy="${y + 6}" rx="90" ry="22" fill="url(#pool)"/>` +
    `<rect x="${x - 3}" y="${y - 86}" width="6" height="90" fill="#1e1209"/>` +
    `<rect x="${x - 9}" y="${y - 104}" width="18" height="20" rx="3" fill="#ffd27a" stroke="#1e1209" stroke-width="3"/>` +
    `<rect x="${x - 12}" y="${y - 110}" width="24" height="8" rx="4" fill="#e3ecf8"/>`
  )
}

function fence(): string {
  let posts = ''
  let caps = ''
  for (let k = 0; k < 5; k++) {
    const x = 40 + k * 62
    const y = 948 - k * 9
    posts += `<rect x="${x}" y="${y - 54}" width="12" height="62" fill="#2a190f"/>`
    caps += `<ellipse cx="${x + 6}" cy="${y - 55}" rx="10" ry="5" fill="#e3ecf8"/>`
  }
  return (
    posts +
    `<path d="M30 914L330 878M30 934L330 898" stroke="#2a190f" stroke-width="9"/>` +
    `<path d="M30 909L330 873" stroke="#e3ecf8" stroke-width="4"/>` +
    caps
  )
}

function drift(level: number): string {
  const t = H - (34 + level * 24)
  return `<path class="drift" d="M0 ${t}C200 ${t - 18} 400 ${t + 10} 600 ${t - 6}S1000 ${t - 22} 1200 ${t}S1500 ${t - 14} 1600 ${t - 2}V1000H0Z"/>`
}

const DEFS =
  `<defs>` +
  `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s1"/><stop offset=".55" class="s2"/><stop offset="1" class="s3"/></linearGradient>` +
  `<linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b08cff" stop-opacity="0"/><stop offset=".2" stop-color="#8affe0" stop-opacity=".55"/><stop offset=".55" stop-color="#36d9b2" stop-opacity=".25"/><stop offset="1" stop-color="#1aa88c" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="ray2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7affe0" stop-opacity="0"/><stop offset=".3" stop-color="#6fffd8" stop-opacity=".45"/><stop offset="1" stop-color="#20b896" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="ray3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a38bff" stop-opacity="0"/><stop offset=".4" stop-color="#8e7cff" stop-opacity=".3"/><stop offset="1" stop-color="#5a6cff" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="streak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#bfe9ff" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c9ad6"/><stop offset="1" stop-color="#2e3d78"/></linearGradient>` +
  `<radialGradient id="moonglow"><stop offset="0" stop-color="#fff6dc" stop-opacity=".5"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5f97"/><stop offset="1" stop-color="#162a4f"/></linearGradient>` +
  `<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c70a8" stop-opacity="0"/><stop offset=".6" stop-color="#4c70a8" stop-opacity=".5"/><stop offset="1" stop-color="#4c70a8" stop-opacity="0"/></linearGradient>` +
  `<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#506ca0"/><stop offset="1" stop-color="#a9bfe2"/></linearGradient>` +
  `<linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8aa2cf"/><stop offset="1" stop-color="#e2eaf7"/></linearGradient>` +
  `<linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a2416"/><stop offset=".6" stop-color="#5a3a24"/><stop offset="1" stop-color="#4a2f1d"/></linearGradient>` +
  `<linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a8"/><stop offset="1" stop-color="#ff9a3a"/></linearGradient>` +
  `<radialGradient id="halo"><stop offset="0" stop-color="#ffb357" stop-opacity=".55"/><stop offset="1" stop-color="#ffb357" stop-opacity="0"/></radialGradient>` +
  `<radialGradient id="pool"><stop offset="0" stop-color="#ffb866" stop-opacity=".6"/><stop offset=".5" stop-color="#ffa64d" stop-opacity=".22"/><stop offset="1" stop-color="#ffa64d" stop-opacity="0"/></radialGradient>` +
  `<linearGradient id="roofsnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f7ff"/><stop offset="1" stop-color="#9fb4d8"/></linearGradient>` +
  `<linearGradient id="mound" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef4fd"/><stop offset="1" stop-color="#8aa2c9"/></linearGradient>` +
  `<linearGradient id="snowfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f0fb"/><stop offset="1" stop-color="#9db3d8"/></linearGradient>` +
  `</defs>`

const BASE_CSS =
  `.s1{stop-color:#050c24}.s2{stop-color:#12306a}.s3{stop-color:#2a5590}` +
  `.snowy{fill:#e8f0fb}.drift{fill:url(#snowfg)}.flake{fill:#ffffff}` +
  `@media (prefers-color-scheme: light){.s1{stop-color:#1a3474}.s2{stop-color:#4a6fb4}.s3{stop-color:#9ab4df}.stars{opacity:.45}.aur{opacity:.65}}` +
  `.sway{animation:sway 4s ease-in-out infinite alternate}` +
  `@keyframes sway{from{transform:translate(-7px,0)}to{transform:translate(7px,0)}}` +
  `.tw{animation:tw 3.4s ease-in-out infinite alternate}` +
  `@keyframes tw{from{opacity:.3}to{opacity:1}}` +
  `.glow{animation:glow 6s ease-in-out infinite alternate}` +
  `@keyframes glow{from{opacity:.75}to{opacity:1}}` +
  `.smoke{animation:smoke 9s linear infinite}` +
  `@keyframes smoke{from{transform:translate(0,0);opacity:.35}to{transform:translate(34px,-96px);opacity:0}}` +
  `.au1,.au2,.au3{transform-box:fill-box;transform-origin:50% 0}` +
  `.au1{animation:auA 19s ease-in-out infinite alternate}` +
  `.au2{animation:auB 23s ease-in-out infinite alternate}` +
  `.au3{animation:auA 27s ease-in-out -9s infinite alternate}` +
  `@keyframes auA{from{transform:translate(0,0) skewX(0deg);opacity:.75}to{transform:translate(-40px,8px) skewX(-7deg);opacity:1}}` +
  `@keyframes auB{from{transform:translate(0,0) skewX(0deg);opacity:1}to{transform:translate(30px,-6px) skewX(6deg);opacity:.7}}` +
  `.cl1{animation:drift1 90s ease-in-out infinite alternate}.cl2{animation:drift1 120s ease-in-out -40s infinite alternate}` +
  `@keyframes drift1{from{transform:translate(0,0)}to{transform:translate(70px,0)}}` +
  `.shoot{animation-name:shoot;animation-timing-function:ease-out;animation-iteration-count:infinite}` +
  `@keyframes shoot{0%{transform:translate(0,0);opacity:0}3%{opacity:1}10%{transform:translate(-300px,190px);opacity:0}100%{transform:translate(-300px,190px);opacity:0}}` +
  `.deer{animation:peek 1.8s cubic-bezier(.2,.8,.25,1) both}` +
  `@keyframes peek{from{transform:translate(0,260px)}to{transform:translate(0,0)}}` +
  `.deer.out{animation:sink 1.5s cubic-bezier(.55,0,.75,.35) forwards}` +
  `@keyframes sink{from{transform:translate(0,0)}to{transform:translate(0,280px)}}` +
  `.nod{transform-box:fill-box;transform-origin:30% 80%;animation:nod 6s ease-in-out 1.8s infinite alternate}` +
  `@keyframes nod{from{transform:rotate(0deg)}to{transform:rotate(-5deg)}}` +
  `.eyes{transform-box:fill-box;transform-origin:50% 50%;animation:blink 5s linear 2s infinite}` +
  `@keyframes blink{0%{transform:scaleY(1)}94%{transform:scaleY(1)}96%{transform:scaleY(.1)}98%{transform:scaleY(1)}100%{transform:scaleY(1)}}` +
  // Pin the reindeer to the bottom-right corner of whatever part of the scene
  // shows: narrower boxes crop the sides, wider ones crop top and bottom.
  `@media (max-aspect-ratio: 8/5){.deerpos{transform:translate(-110px,0)}}` +
  `@media (max-aspect-ratio: 7/5){.deerpos{transform:translate(-210px,0)}}` +
  `@media (max-aspect-ratio: 6/5){.deerpos{transform:translate(-310px,0)}}` +
  `@media (max-aspect-ratio: 1/1){.deerpos{transform:translate(-370px,0)}}` +
  `@media (max-aspect-ratio: 7/8){.deerpos{transform:translate(-430px,0)}}` +
  `@media (max-aspect-ratio: 3/4){.deerpos{transform:translate(-520px,0)}}` +
  `@media (max-aspect-ratio: 9/16){.deerpos{transform:translate(-640px,0)}}` +
  `@media (min-aspect-ratio: 17/10){.deerpos{transform:translate(0,-50px)}}` +
  `@media (min-aspect-ratio: 2/1){.deerpos{transform:translate(0,-100px)}}` +
  `@media (min-aspect-ratio: 7/3){.deerpos{transform:translate(0,-157px)}}`

// Everything that never changes, built once.
const FAR =
  `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
  starfield() +
  SHOOTING +
  AURORA +
  `<circle cx="430" cy="120" r="70" fill="url(#moonglow)"/><circle cx="430" cy="120" r="24" fill="#f6f1dc"/>` +
  cloud(110, 200, 1.3, 'cl1') +
  cloud(1130, 380, 0.9, 'cl2') +
  cloud(560, 330, 0.6, 'cl2') +
  mountains() +
  `<rect y="540" width="${W}" height="170" fill="url(#haze)"/>` +
  forestBand() +
  `<rect y="610" width="${W}" height="110" fill="url(#haze)"/>` +
  `<path d="M0 690C400 655 1200 655 1600 690V1000H0Z" fill="url(#ground)"/>` +
  `<path d="M792 655C760 760 600 880 430 1000L1180 1000C1000 880 860 760 812 655Z" fill="url(#road)"/>` +
  tracks()

const MID = MID_TREES.map(([x, b, h], k) => spruce(x, b, h, { fill: '#10243f', lit: '#9fb8de', shade: '#4d6690', seed: 300 + k })).join('')

const NEAR =
  lantern(470, 846) +
  lantern(1130, 852) +
  spruce(30, 1012, 980, { fill: '#0c1d33', lit: '#aebfdc', shade: '#3e557d', seed: 501 }) +
  spruce(1605, 992, 900, { fill: '#0c1d33', lit: '#aebfdc', shade: '#3e557d', seed: 502 }) +
  `<path d="M0 905C80 862 200 872 262 912C300 940 320 980 332 1010H0Z" fill="url(#mound)"/>` +
  fence()

export function scene(w: Weather): string {
  const fall = snow(Math.max(0, Math.min(6, w.snow)), w.waiting)
  const cap = 6 + w.drift * 2.5
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<style>${BASE_CSS}${fall.css}</style>` +
    DEFS +
    FAR +
    CABINS.slice(0, 2).map(c => cabin(c, cap)).join('') +
    MID +
    CABINS.slice(2, 4).map(c => cabin(c, cap)).join('') +
    CABINS.slice(4).map(c => cabin(c, cap)).join('') +
    NEAR +
    drift(w.drift) +
    (w.waiting ? REINDEER : w.leaving ? REINDEER.replace('class="deer"', 'class="deer out"') : '') +
    BANK +
    fall.svg +
    `</svg>`
  )
}
