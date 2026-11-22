# Winter Fairyland

A theme mod for Claude Code's desktop and mobile apps. It turns the window into an animated winter village: log cabins with glowing windows along a snowy road, a spruce forest, snowy mountains, and the northern lights over a starry sky with shooting stars.

The scene reacts to the session:

- **Snowfall follows Claude's workload.** It gets heavier while Claude is mid-turn, running tools or subagents, and calms down as the work eases off.
- **Snow piles up with context.** The drift along the bottom and the snow on the roofs grow as the context window fills.
- **A reindeer peeks in when Claude is waiting for you.** When Claude finishes a turn, asks a question or needs permission, a reindeer rises from behind the snowbank in the bottom-right corner and looks at you, while the snow slows to a light sprinkle. It leaves when you send a message.

Light mode shows the same village at blue hour; dark mode shows it at night.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install winter-fairyland --marketplace cataem/winter-fairyland
```

Answer `y` to add the marketplace, then pick a scope (user scope is first, chosen with Enter).

From a shell:

```
claude plugin install winter-fairyland --marketplace cataem/winter-fairyland
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `cataem/winter-fairyland`, then **Add plugin**.

## The /snow command

- `/snow demo` runs through every snowfall and drift level in about 45 seconds, then goes back to live.
- `/snow 4 3` holds snowfall at 4/6 and the drift at 3/5.
- `/snow live` goes back to following the real workload and context.

The status line shows the current level, for example `❄❄❄ snowfall 3/6 · snowdrift 2/5 · context 34%`.

## Notes

The terminal and editor extensions don't draw themes, so the scene shows only in the desktop and mobile apps.
