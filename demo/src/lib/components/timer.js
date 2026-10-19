/** @type {import('./types').ComponentDef} */
export default {
  slug: 'timer',
  tag: 'zon-game-timer',
  name: 'Timer',
  category: 'Game screen',
  attributes: [
    { name: 'autostart', type: 'boolean', description: 'Start counting when connected.' },
    { name: 'disabled', type: 'boolean', description: 'The button is inert, e.g. after the game is solved.' },
    { name: 'pause-when-hidden', type: 'boolean', description: 'Pause automatically when the tab is hidden.' },
    { name: 'pause-label', type: 'text', default: 'Timer pausieren', description: 'Button name while running.' },
    { name: 'resume-label', type: 'text', default: 'Timer fortsetzen', description: 'Button name while paused.' },
  ],
  properties: [
    { name: 'elapsed', type: 'number (ms)', description: 'Get or set; setting it does not change the running state.' },
    { name: 'running', type: 'boolean (read-only)', description: 'Whether it is counting.' },
  ],
  methods: [
    { name: 'start()', description: 'Start counting.' },
    { name: "pause(reason = 'api')", description: 'Pause.' },
    { name: 'toggle()', description: 'Start or pause.' },
    { name: 'reset(ms = 0)', description: 'Pause and set the time, e.g. to restore a saved game.' },
  ],
  events: [
    { name: 'zon-timer-start', detail: '{ elapsed }', description: 'Started.' },
    { name: 'zon-timer-pause', detail: '{ elapsed, reason }', description: '<code>reason</code>: user · hidden · api.' },
  ],
  slots: [],
  parts: [
    { name: 'button', description: 'The pill button.' },
    { name: 'time', description: 'mm:ss (h:mm:ss after an hour), tabular figures.' },
  ],
  cssProps: [],
  tracking: [],
  playground: {
    values: { autostart: true, disabled: false, 'pause-when-hidden': true, 'pause-label': '', 'resume-label': '' },
    actions: [
      { label: 'start()', run: (el) => el.start() },
      { label: 'pause()', run: (el) => el.pause() },
      { label: 'reset()', run: (el) => el.reset() },
      { label: 'reset(3599000)', run: (el) => el.reset(3599000) },
    ],
  },
};
