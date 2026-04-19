# Opener — Chess Opening Trainer

A static website for practicing the chess openings you actually face at
sub-1000 ratings. Pick an opening, the board plays a real opponent move
sampled from Lichess games at your rating band, and a coach tells you
whether your reply is the most common move, a sideline, or off-book.

## Features

- **Smooth, chess.com-style board** — drag-and-drop pieces with CSS-transform
  animations, click-to-move, legal-move dots, last-move + check highlights,
  promotion picker, board flip.
- **Real low-rating statistics** — every position fetches the [Lichess
  Opening Explorer](https://lichess.org/api#tag/Opening-Explorer) filtered
  to your rating band (default 0–1000). Opponent picks moves with the
  same probability real opponents at your level do.
- **Curated repertoire** focused on what sub-1000 players actually run into:
  - **As White**: London System · vs. Scandinavian · vs. Englund Gambit · Italian
  - **As Black**: vs. London · Scandinavian · Caro-Kann · vs. Italian
  - **Defend common traps**: Scholar's Mate · Wayward Queen · Fried Liver
- **Stockfish (WASM) analysis** — live evaluation in the side panel.
- **Coach feedback** after every move: top reply / common alternative /
  sideline / off-book, with the percentage of low-rated games that played it.

## Run

It's a static site — just open `index.html` in a browser. Or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

(Stockfish loads from a CDN as a Web Worker; opening stats come from
the public Lichess explorer endpoint, no API key needed.)

## File layout

```
index.html       page shell
css/styles.css   all styling
js/openings.js   curated opening definitions
js/lichess.js    Lichess Opening Explorer API wrapper
js/board.js      board UI, drag/drop, animations
js/engine.js     Stockfish web-worker wrapper
js/app.js        glue: practice flow, coach, stats panel
```

## Adding more openings

Edit `js/openings.js`. Each entry needs an `id`, `name`, `group`, `side`
(`"w"` or `"b"`), `description`, `principles[]`, and a `moves[]` list of
UCI moves to set up the practice position.
