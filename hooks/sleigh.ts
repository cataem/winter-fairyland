// Santa's sleigh crossing the aurora sky, right to left, pulled by four
// reindeer and trailing a ribbon with the days left until Christmas (or,
// from Christmas Day on, until New Year).

/** How long one crossing takes, in milliseconds. */
export const FLIGHT_MS = 14000

const DAY = 86400000

/** "31 days until Christmas", or from Christmas Day "7 days until New Year". */
export function countdown(now: number): string {
  const d = new Date(now)
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const plural = (k: number) => (k === 1 ? 'day' : 'days')
  const xmas = Math.round((new Date(d.getFullYear(), 11, 25).getTime() - today) / DAY)
  if (xmas >= 1) return `${xmas} ${plural(xmas)} until Christmas`
  const year = Math.round((new Date(d.getFullYear() + 1, 0, 1).getTime() - today) / DAY)
  return `${year} ${plural(year)} until New Year`
}

const INK = '#141c33'
const RIM = '#6fe8cf'

// One reindeer facing left at a trot, origin at the middle of its back:
// a deep chest, raised neck, branching antlers, and slender legs that swing
// from the shoulder and hip.
function reindeer(x: number, y: number, phase: number): string {
  const d = `style="animation-delay:-${phase}s"`
  const leg = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"`
  return (
    `<g transform="translate(${x} ${y})">` +
    // far legs, a touch lighter, behind the body
    `<g class="fl" ${d}><path d="M-14 4L-11 16L-15 26" ${leg} stroke-opacity=".75"/></g>` +
    `<g class="hl" ${d}><path d="M20 4L29 13L33 22" ${leg} stroke-opacity=".75"/></g>` +
    // body, neck and head
    `<path fill="${INK}" d="M-22 -8C-18 -14 -4 -15 10 -13C20 -12 27 -9 28 -3C29 3 24 7 16 8C6 9 -10 9 -18 6C-24 4 -26 -3 -22 -8Z` +
    `M-21 -5C-24 -14 -27 -22 -30 -28L-34 -31C-38 -32 -44 -30 -47 -27C-48 -25 -46 -24 -43 -24L-37 -23C-33 -17 -26 -9 -13 -5Z` +
    `M-33 -31L-28 -37L-30 -30ZM27 -6L33 -10L31 -3Z"/>` +
    // antlers
    `<path d="M-35 -32C-34 -42 -30 -50 -24 -57M-33 -41L-40 -47M-31 -47L-35 -55M-28 -52L-29 -61M-26 -55L-19 -60` +
    `M-37 -32C-40 -42 -42 -50 -40 -58M-40 -44L-47 -48M-41 -51L-47 -57" stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none"/>` +
    // near legs, in front
    `<g class="fl" style="animation-delay:-${(phase + 0.5).toFixed(2)}s"><path d="M-18 4L-25 15L-31 22" ${leg}/></g>` +
    `<g class="hl" style="animation-delay:-${(phase + 0.5).toFixed(2)}s"><path d="M15 5L20 15L16 25" ${leg}/></g>` +
    // moonlight on the back, neck and antlers
    `<path d="M-19 -11C-6 -15 12 -14 26 -8M-28 -27C-25 -20 -22 -14 -20 -11M-34 -40C-31 -48 -28 -52 -24 -57" stroke="${RIM}" stroke-opacity=".7" stroke-width="1.2" fill="none"/>` +
    `</g>`
  )
}

function team(text: string): string {
  const deer = [
    reindeer(-100, -2, 0),
    reindeer(-178, -8, 0.13),
    reindeer(-256, -14, 0.26),
    reindeer(-334, -20, 0.39),
  ].join('')
  const sleigh =
    // reins from the sleigh to the team
    `<path d="M-32 -8C-80 -6 -100 -4 -122 -6C-170 -10 -260 -14 -356 -26" stroke="#d9b45a" stroke-opacity=".7" stroke-width="1.4" fill="none"/>` +
    // the sack, then Santa
    `<ellipse cx="22" cy="-16" rx="17" ry="14" fill="#5a3a22"/>` +
    `<circle cx="-6" cy="-14" r="11" fill="#c22a2f"/>` +
    `<circle cx="-10" cy="-27" r="6" fill="#f2d2b6"/>` +
    `<path d="M-15 -24Q-12 -14 -5 -24Z" fill="#ffffff"/>` +
    `<path d="M-16 -30L-4 -30L-14 -42Z" fill="#c22a2f"/><circle cx="-15" cy="-42" r="2.5" fill="#ffffff"/>` +
    `<rect x="-17" y="-32" width="14" height="3.5" rx="1.5" fill="#ffffff"/>` +
    // the sleigh body and its curled runner
    `<path d="M-34 -10L36 -10Q46 -10 44 4L40 10L-26 10Q-38 10 -40 0Z" fill="#a8222b"/>` +
    `<path d="M-34 -10L36 -10" stroke="#e8c15a" stroke-width="2.5"/>` +
    `<path d="M-44 20L38 20Q50 20 48 12M-44 20Q-56 20 -54 10Q-52 4 -46 8M-20 10L-20 20M20 10L20 20" stroke="#e8c15a" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
    `<circle cx="0" cy="-4" r="40" fill="url(#halo)" opacity=".35"/>`
  const ribbon =
    `<path d="M44 -2C70 0 86 -6 100 -4" stroke="#e8c15a" stroke-width="1.4" fill="none"/>` +
    `<g class="flutter">` +
    `<path d="M100 -18C170 -26 240 -10 330 -20L316 -4L330 12C240 22 170 6 100 14Z" fill="#c0392b"/>` +
    `<path d="M100 -18C170 -26 240 -10 330 -20M100 14C170 6 240 22 330 12" stroke="#f0d27a" stroke-width="1.6" fill="none"/>` +
    `<text x="212" y="2" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="700" font-size="15" fill="#ffffff">${text}</text>` +
    `</g>`
  return deer + sleigh + ribbon
}

export const SLEIGH_CSS =
  `.fly{animation:fly ${FLIGHT_MS / 1000}s linear both}` +
  `@keyframes fly{from{transform:translate(2100px,0)}to{transform:translate(-900px,-70px)}}` +
  `.bob{animation:bob 1.6s ease-in-out infinite alternate}` +
  `@keyframes bob{from{transform:translate(0,-6px)}to{transform:translate(0,6px)}}` +
  `.fl,.hl{transform-box:fill-box;transform-origin:50% 0;animation:fl .5s ease-in-out infinite alternate}` +
  `.hl{animation-name:hl}` +
  `@keyframes fl{from{transform:rotate(-22deg)}to{transform:rotate(18deg)}}` +
  `@keyframes hl{from{transform:rotate(16deg)}to{transform:rotate(-20deg)}}` +
  `.flutter{transform-box:fill-box;transform-origin:0 50%;animation:flutter 1s ease-in-out infinite alternate}` +
  `@keyframes flutter{from{transform:skewY(-3deg)}to{transform:skewY(3deg)}}`

/**
 * The sleigh, partway through the crossing that began at `start`; nothing
 * once it has crossed. Its height comes from `start`, so each flight differs.
 */
export function sleigh(start: number, now: number): string {
  const elapsed = now - start
  if (start <= 0 || elapsed < 0 || elapsed > FLIGHT_MS) return ''
  const y = 150 + (Math.abs(Math.sin(start / 7919)) * 170)
  return (
    `<g transform="translate(0 ${Math.round(y)})">` +
    `<g class="fly" transform="translate(1100 0)" style="animation-delay:-${(elapsed / 1000).toFixed(2)}s">` +
    `<g class="bob"><g transform="scale(1.2)">${team(countdown(now))}</g></g>` +
    `</g></g>`
  )
}
