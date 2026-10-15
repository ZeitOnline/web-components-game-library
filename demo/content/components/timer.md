---
summary: Stopwatch pill with play / pause. Counts with performance.now() and repaints only once per displayed second.
when:
  - Games that measure solving time (sudoku, eckchen).
whenNot:
  - "Countdowns with a deadline: they need different semantics and announcements."
faq:
  - question: How do I restore a saved time?
    answer: "`timer.reset(savedMs)`, then `timer.start()`."
  - question: Why not update every 100 ms like before?
    answer: Only the seconds are visible. One DOM write per second keeps the main thread free for the board.
a11y:
  - topic: Name
    text: Static per state (“Timer pausieren” / “Timer fortsetzen”), so screen readers are not interrupted every second.
  - topic: Time
    text: role="timer", linked as the button’s description.
  - topic: Disabled
    text: aria-disabled keeps the button focusable and readable.
replaces:
  - sudoku `game/stop-watch` (ticked every 100 ms)
---
