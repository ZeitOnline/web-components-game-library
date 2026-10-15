/**
 * Demo data for the two games. Everything game-specific lives here, not in the components:
 * labels, colours (category) and fake content. Logos and tile icons come from
 * content/games/<id>.yml (see $lib/games.js), the same SVGs the docs use.
 *
 * Sources:
 *   FAQs                  sudoku index.html `.faq`, word-puzzle-game data/faq.ts
 */
export const GAMES = {
  sudoku: {
    id: 'sudoku',
    name: 'Sudoku',
    category: 'logic',
    hero: {
      badge: { new: 'Neu', continue: 'Weiterspielen', solved: 'Gelöst' },
      cta: { new: 'Erstes Rätsel starten', continue: 'Rätsel lösen', solved: 'Rätsel lösen' },
    },
    listHeading: 'Weitere Sudoku Rätsel',
    // Typeform survey (sudoku index.html .typeform-survey-wrapper). Wortgeflecht has none.
    feedbackForm: 'obbQ8AeR',
    nav: {
      heading: 'Sudoku Leicht',
      end: 'theme more',
      // A custom button with its own callback (sudoku has a print view).
      custom: [
        {
          id: 'print',
          label: 'Rätsel drucken',
          position: 'end',
          icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/></svg>',
          onClick: () => window.print(),
        },
      ],
    },
    resultHeading: 'Gut gemacht!',
    steps: [
      { title: 'Ziel des Spiels', description: 'Jede Zeile, Spalte und jedes 3×3-Feld enthält die Zahlen <strong>1 bis 9</strong> genau einmal.' },
      { title: 'Notizen', description: 'Mit dem Stift notieren Sie mögliche Kandidaten.' },
      { title: 'Tipps', description: 'Kommen Sie nicht weiter? Ein Tipp deckt ein Feld auf.' },
    ],
    // sudoku packages/frontend/src/index.html (.faq), first six questions
    faq: [
      { question: "Wie spielt man Sudoku?", answer: "<p>Ein Sudoku-Rätsel besteht aus neun Boxen mit jeweils 3x3 Zellen. Zu Beginn sind bereits in einigen beliebigen Zellen Ziffern zwischen 1 und 9 vorgegeben. Ziel ist es, die übrigen Zellen des Sudoku-Rätsels ebenfalls mit Ziffern zwischen 1 und 9 zu füllen. Und zwar so, dass innerhalb einer Box sowie in jeder horizontalen und vertikalen Reihe des Gesamtfeldes jede Ziffer nur einmal vorkommt.</p>" },
      { question: "Kann ich das ZEIT Sudoku auf dem Smartphone spielen?", answer: "<p>Ja. Unsere Sudokus sind wie alle Spiele von der ZEIT responsiv im Browser oder in der ZEIT-App (<a href=\"https://play.google.com/store/apps/details?id=de.zeit.online&amp;hl=de&amp;gl=US\">Android</a>, <a href=\"https://apps.apple.com/de/app/zeit-online/id828889166\">iOS</a>) spielbar.</p>" },
      { question: "Kann ich mehr als eine Ausgabe vom Sudoku spielen?", answer: "<p>Über das Aufklappmenü am oberen linken Rand des Spielfelds können Sie zwischen den verfügbaren Sudokus wechseln. Täglich gibt es ein neues Spiel in jeder unserer Schwierigkeitsstufen.</p>" },
      { question: "Kann ich das ZEIT Sudoku auch ausdrucken?", answer: "<p>Alle im Archiv gespeicherten Rätsel stehen Ihnen jederzeit als Sudoku-PDF zum Ausdrucken zur Verfügung.</p>" },
      { question: "Wie oft erscheint das ZEIT Sudoku?", answer: "<p>Für alle Schwierigkeitsstufen erscheint täglich ein neues Spiel.</p>" },
      { question: "Wie löst man Sudoku am einfachsten?", answer: "<p>Die einfachste Technik für die Lösung eines Sudokus ist das Überfliegen oder einfache Scannen der Reihen und Spalten. Dabei füllt man alle Kästchen aus, für die nur eine Zahl in Frage kommt. Lesen Sie dazu unsere Liste weiterer <a href=\"https://www.zeit.de/spiele/sudoku-loesen\">Methoden, um ein Sudoku zu lösen</a>.</p>" },
    ],
  },
  wortgeflecht: {
    id: 'wortgeflecht',
    name: 'Wortgeflecht',
    category: 'word',
    hero: {
      badge: { new: 'Neues Rätsel', continue: 'Neues Rätsel', solved: 'Neues Rätsel' },
      cta: { new: 'Rätsel lösen', continue: 'Weiterspielen', solved: 'Weitere Rätsel' },
    },
    listHeading: 'Weitere Rätsel',
    nav: { heading: 'Wortgeflecht', end: 'hint more' },
    resultHeading: 'Stark gelöst!',
    // word-puzzle-game/src/features/game/data/game-instructions.ts (without the SVGs)
    steps: [
      { title: 'Willkommen bei unserem Wortgeflecht', description: 'In jedem Rätsel sind Wörter versteckt - der Titel verrät, wonach Sie suchen.' },
      { title: 'Bilden Sie Wörter', description: 'Tippen oder ziehen Sie die Buchstaben in der richtigen Reihenfolge.', descriptionTwo: 'Ein <strong>2. Klick auf den letzten Buchstaben oder Loslassen</strong> am Ende bestätigt das Wort.' },
      { title: 'Alle Wörter füllen das Spielfeld aus', description: 'Jeder Buchstabe kommt nur in einem Wort vor.' },
      { title: 'Finden Sie Zusatzwörter, um Hinweise freizuschalten', description: '3 gefundene Zusatzwörter ergeben einen Hinweis.', descriptionTwo: 'Sie können 2 Hinweise zeitgleich nutzen: <br /> Einer markiert Buchstaben - ein weiterer zeigt die Richtung.' },
      { title: 'Pro Rätsel ein Tipp', description: 'Klicken Sie auf das Glühbirnensymbol, um Ihren Tipp zu verwenden.', descriptionTwo: 'Mehr Infos und Einstellungen finden Sie im Drei-Punkte-Menü. <strong>Viel Spaß beim Rätseln!</strong>' },
    ],
    // word-puzzle-game/src/features/zon-ecosystem/data/faq.ts
    faq: [
      { question: "Das sind die Regeln", answer: "<ul><li>Ihr Ziel ist es, alle Themenwörter passend zum jeweiligen Thema zu finden. </li><li>Die Themenhinweise sind manchmal offensichtlich, manchmal erfordern sie kreatives Denken.</li><li>Markieren Sie Wörter durch <strong>Tippen oder ziehen</strong> der Buchstaben in der richtigen Reihenfolge.</li><li>Ein <strong>2. Klick auf den letzten Buchstaben oder Loslassen</strong> am Ende bestätigt das Wort.</li><li> Die Themenwörter füllen das gesamte Spielfeld aus, sie überlappen sich nicht. Buchstaben dürfen nicht doppelt verwendet werden. </li><li>Ein Wort ist gültig, wenn es mindestens vier Buchstaben umfasst, Umlaute in ihrer ursprünglichen Form erhalten bleiben (ä, ü, ö), das „ß“ korrekt verwendet wird und es in seiner Grundform oder einer korrekten Beugungsform im aktuellen Online-Duden verzeichnet ist.</li><li> Die Buchstaben eines Wortes müssen nicht in einer geraden Linie liegen - sie können sich gewunden über das Spielfeld erstrecken und dürfen sich überkreuzen.</li><li> Wenn Sie keine Themenwörter finden, können Sie beliebige Wörter bilden, um sich Hinweise auf ein Themenwort zu erarbeiten. Zusatzwörter unterliegen denselben Regeln für gültige Wörter wie die Themenwörter.</li><li> Für drei gefundene Zusatzwörter erhalten Sie einen Hinweis zu einem noch verborgenen Themenwort. Um Hinweise einzulösen, klicken Sie auf den Blitz. Sie können unbegrenzt Hinweise sammeln. Pro Themenwort können maximal zwei Hinweise eingelöst werden.</li></ul>" },
      { question: "Was ist Wortgeflecht?", answer: "Wortgeflecht ist ein kniffliges Suchsel, bei dem Sie versteckte Themenwörter im Buchstabenfeld aufspüren." },
      { question: "Kann ich das Wortgeflecht auf dem Smartphone spielen?", answer: "Ja. Das Wortgeflecht ist wie alle Spiele der ZEIT responsiv im Browser oder in der ZEIT-App (<a href=\"https://play.google.com/store/apps/details?id=de.zeit.online&amp;hl=de&amp;gl=US\">Android</a>, <a href=\"https://apps.apple.com/de/app/zeit-online/id828889166\">iOS</a>) spielbar" },
      { question: "Kann ich mehr als ein Rätsel von dem Wortgeflecht spielen?", answer: "Über das Aufklappmenü am oberen linken Rand des Spielfelds können Sie zwischen den verfügbaren Spielen wechseln. Jeden Donnerstag kommt ein neues Buchstabengitter-Rätsel heraus." },
    ],
  },
};
