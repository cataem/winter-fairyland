/**
 * What the backdrop draws: snowfall 0 to 6, ground drift 0 to 5, the reindeer
 * up (`waiting`) or sinking back behind the snowbank (`leaving`), and when
 * Santa's sleigh set off across the sky (`sleigh`, ms; 0 when none flies).
 */
export type Weather = { snow: number; drift: number; waiting: boolean; leaving: boolean; sleigh: number }

declare module 'claude-code' {
  interface PluginState {
    'winter-fairyland': { weather: Shaped<Weather> }
  }
}
