/** @type {import('./types').ComponentDef} */
export default {
  slug: 'feedback-button',
  tag: 'zon-game-feedback-button',
  name: 'Feedback button',
  category: 'Common',
  skeleton: 'feedback-button',
  attributes: [
    { name: 'form-id', type: 'text', description: 'Typeform form id, e.g. <code>obbQ8AeR</code> (Sudoku). Required.' },
    { name: 'game-name', type: 'text', game: true, description: 'Default label “Feedback zum &lt;game-name&gt;” and the popup’s iframe title.' },
    { name: 'label', type: 'text', description: 'Overrides the label, e.g. “Zur Umfrage”.' },
    { name: 'medium', type: 'text', default: 'snippet', description: 'Typeform <code>medium</code>, as in the games.' },
    { name: 'embed-src', type: 'text', default: 'https://embed.typeform.com/next/embed.js', description: 'URL of the embed SDK, e.g. a self-hosted copy like sudoku’s <code>assets/scripts/embed.js</code>.' },
  ],
  properties: [
    { name: 'hiddenFields', type: 'Record<string, string>', description: 'Typeform hidden fields, e.g. <code>{ difficulty: \'leicht\' }</code>. Only fields defined in the form are stored.' },
  ],
  methods: [
    { name: 'open()', description: 'Loads the SDK if needed and opens the popup.' },
    { name: 'close()', description: 'Closes the popup.' },
  ],
  events: [
    { name: 'zon-feedback-open', detail: '{ formId }', cancelable: true, description: 'Before the popup opens. preventDefault() keeps it closed.' },
    { name: 'zon-feedback-close', detail: '{ formId }', description: 'Popup closed.' },
    { name: 'zon-feedback-submit', detail: '{ formId, responseId }', description: 'Survey submitted.' },
  ],
  slots: [],
  parts: [{ name: 'button', description: 'The yellow pill (a link to the form).' }],
  cssProps: [],
  tracking: [{ when: 'Click', payload: "{ event: 'game_interaction', action: 'click', target: 'feedback', position: 'survey' }" }],
  playground: {
    values: { 'form-id': 'obbQ8AeR', 'game-name': 'Sudoku', label: '', medium: '', 'embed-src': '' },
    // Skeleton from critical.css: shown until the element is defined (hidden here, it already is).
    html: '<div class="zon-skeleton zon-skeleton--feedback-button" aria-hidden="true"><span class="zon-skeleton__bone zon-skeleton__button"></span></div>',
    // Test clicks on this page should not open (and count views on) the real Sudoku survey.
    prevent: ['zon-feedback-open'],
    // The game's survey id (content/games/<id>.yml); empty for games without one.
    game: (g) => ({ values: { 'form-id': g.feedbackForm ?? '' } }),
    note: 'On this page the popup is suppressed (zon-feedback-open is prevented), so test clicks do not reach the real Sudoku survey. The game demo opens it.',
  },
};
