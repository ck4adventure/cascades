# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Open `index.html` directly in a browser, or run `npx vite` to start a local dev server (Vite is installed as a dev dependency). No build step required.

No linting or test framework is currently configured (tests are planned per README).

## Architecture

Cascades is a vanilla JavaScript Match-3 game (no framework, no TypeScript). The entire codebase is three files:

- `index.html` — Single-page app shell with 8x8 grid, score display, speed slider, and two modals (`#how-to-modal`, `#no-moves-modal`)
- `cascades-script.js` — All game logic (~745 lines)
- `cascades-style.css` — All styles; tile colors set via `[data-type="1"]`–`[data-type="9"]` CSS selectors

### Board Representation

The board is a flat array `squares[]` of 64 DOM elements (8×8). Grid positions are computed mathematically from linear indices. Each tile `div` has a `data-type` attribute for its color (values `'1'`–`'7'`).

### Game Loop

1. `createBoard()` — Populates grid with random tiles, avoiding initial 3-in-a-row matches via `isThreeInARow()`
2. Player swaps tiles via drag-and-drop (desktop) or touch (mobile) — `isValidMove()` enforces strict 4-directional adjacency
3. `removeMatchingHorzTiles()` / `removeMatchingVertTiles()` — Remove matched tiles, set `data-type` to `''`
4. `moveDown()` — Gravity: tiles fall into empty spaces; new tiles spawn at top with `animateFill()` (Promise-based, respects `dropSpeed`)
5. `findCascadeMatches()` — Recursively re-checks for new matches after tiles settle; calls `moveDown()` again if found
6. `anyAvailableMoves()` — After each cascade, exhaustively checks all possible swaps; shows `#no-moves-modal` if none exist

### Key State Variables

```js
width = 8, height = 8       // Board dimensions
squares[]                   // DOM tile elements, indexed 0–63
colors = ['1'..'7']         // 7 active color types
currentScore                // Numeric score
dropSpeed                   // Animation ms (100–300, default 200), set by slider
```

Desktop and mobile use separate event handler paths (`dragStart/dragOver/dragDrop/dragEnd` vs `handleTouchStart/Move/End/Cancel`) but share the same validation and match logic.

### Planned Refactors (per README)

- Refactor into class-based structure
- Add testing for board logic functions
- Fix matching logic bug on first swap (both mobile and desktop)
