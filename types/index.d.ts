/** What the backdrop draws: snowfall 0 to 6, ground drift 0 to 5, reindeer on or off. */
export type Weather = { snow: number; drift: number; waiting: boolean }

declare module 'claude-code' {
  interface PluginState {
    'winter-fairyland': { weather: Shaped<Weather> }
  }
}
