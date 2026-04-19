/* Main app: glues Board + chess.js + Lichess explorer + Stockfish.

   Flow per opening:
   1. User picks an opening from sidebar.
   2. We replay the opening's setup moves to land on the practice position.
   3. If it's the opponent's turn, we ASYNC fetch Lichess stats and play
      a weighted-random opponent move (so different sessions practice
      different common variations).
   4. When it's the user's turn, we again fetch Lichess stats; on the
      user's move we evaluate:
         - top-1 popular  -> "Book — most common reply"
         - top-3 popular  -> "Theory — a common alternative"
         - in book but rare -> "Sideline"
         - not in book    -> Stockfish eval delta gives feedback
   5. Stats panel always shows top moves with win/draw/loss bars.
*/
(function () {
  const Chess = window.Chess;
  const boardEl = document.getElementById("board");
  const openingListEl = document.getElementById("opening-list");
  const openingTitleEl = document.getElementById("opening-title");
  const statusEl = document.getElementById("status");
  const statsEl = document.getElementById("stats");
  const statsCtxEl = document.getElementById("stats-context");
  const engineEl = document.getElementById("engine");
  const engineStatusEl = document.getElementById("engine-status");
  const historyEl = document.getElementById("history");
  const coachEl = document.getElementById("coach");
  const ratingSelect = document.getElementById("rating-select");
  const flipBtn = document.getElementById("flip-btn");
  const backBtn = document.getElementById("back-btn");
  const hintBtn = document.getElementById("hint-btn");
  const resetBtn = document.getElementById("reset-btn");
  const newLineBtn = document.getElementById("new-line-btn");

  const state = {
    chess: new Chess(),
    opening: null,
    setupMoves: [],
    historyStack: [], // {san, uci, fen}
    statsForCurrent: null,
    engine: null,
    pendingOpponent: false,
    ratingMin: 0,
    ratingMax: 1000,
  };

  const board = new ChessBoard(boardEl, {
    canDrag: (sq, entry) => {
      // Only allow user to drag their own pieces on their turn
      if (!state.opening) return false;
      if (state.chess.turn() !== state.opening.side) return false;
      return entry.color === state.opening.side;
    },
    onSelect: (sq, entry) => {
      if (!state.opening) return;
      if (state.chess.turn() !== state.opening.side) return;
      if (entry.color !== state.opening.side) return;
      const moves = state.chess.moves({ square: sq, verbose: true });
      board.selectSquare(sq);
      board.highlightLegal(moves.map((m) => m.to));
    },
    onUserMove: (from, to, promotion) => {
      handleUserMove(from, to, promotion);
    },
  });

  // ====== Render opening list ======
  function renderOpeningList() {
    openingListEl.innerHTML = "";
    const groups = new Map();
    for (const o of OPENINGS) {
      if (!groups.has(o.group)) groups.set(o.group, []);
      groups.get(o.group).push(o);
    }
    for (const [group, items] of groups) {
      const label = document.createElement("div");
      label.className = "opening-group-label";
      label.textContent = group;
      openingListEl.appendChild(label);
      for (const o of items) {
        const item = document.createElement("div");
        item.className = "opening-item";
        item.dataset.id = o.id;
        item.innerHTML = `
          <div class="name"><span class="side ${o.side === "w" ? "white" : "black"}"></span>${o.name}</div>
          <div class="meta">${o.description}</div>
        `;
        item.onclick = () => selectOpening(o.id);
        openingListEl.appendChild(item);
      }
    }
  }

  function selectOpening(id) {
    const opening = OPENINGS.find((o) => o.id === id);
    if (!opening) return;
    state.opening = opening;
    state.chess = new Chess();
    state.historyStack = [];
    state.setupMoves = [...opening.moves];

    // Highlight active item
    [...openingListEl.querySelectorAll(".opening-item")].forEach((el) =>
      el.classList.toggle("active", el.dataset.id === id)
    );

    openingTitleEl.textContent = opening.name;
    coachEl.className = "coach-msg";
    coachEl.innerHTML = `<strong>${opening.name}</strong> — ${opening.description}<br><br>` +
      `<em>Key ideas:</em><ul style="margin:6px 0 0 18px;padding:0;">` +
      opening.principles.map((p) => `<li>${p}</li>`).join("") + `</ul>`;

    // Orient board so the user's side is at the bottom
    board.flip(opening.side);

    // Replay setup moves with quick animations
    replaySetupAndStart();

    backBtn.disabled = false;
    hintBtn.disabled = false;
    resetBtn.disabled = false;
    newLineBtn.disabled = false;
  }

  async function replaySetupAndStart() {
    // Show position with no animation, then advance through setup moves with animation.
    state.chess = new Chess();
    board.setPosition(state.chess.fen(), { animate: false, lastMove: null });
    renderHistory();
    statusEl.textContent = "Setting up line…";
    for (const uci of state.setupMoves) {
      await wait(220);
      const move = applyUci(uci);
      if (!move) break;
      board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
      pushHistory(move);
      renderHistory();
    }
    afterMove();
  }

  function applyUci(uci) {
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length === 5 ? uci[4] : undefined;
    return state.chess.move({ from, to, promotion });
  }

  function pushHistory(move) {
    state.historyStack.push({
      san: move.san,
      uci: move.from + move.to + (move.promotion || ""),
      fen: state.chess.fen(),
    });
  }

  function renderHistory() {
    historyEl.innerHTML = "";
    const moves = state.historyStack;
    for (let i = 0; i < moves.length; i += 2) {
      const li = document.createElement("li");
      li.value = i / 2 + 1;
      const w = document.createElement("span");
      w.className = "move" + (i === moves.length - 1 ? " last" : "");
      w.textContent = moves[i].san;
      li.appendChild(w);
      if (moves[i + 1]) {
        li.appendChild(document.createTextNode(" "));
        const b = document.createElement("span");
        b.className = "move" + (i + 1 === moves.length - 1 ? " last" : "");
        b.textContent = moves[i + 1].san;
        li.appendChild(b);
      }
      historyEl.appendChild(li);
    }
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function afterMove() {
    // Update check highlight
    if (state.chess.in_check()) {
      const kingSq = findKingSquare(state.chess.turn());
      board.setCheck(kingSq);
    } else {
      board.setCheck(null);
    }

    // Check end-of-game
    if (state.chess.game_over()) {
      let msg;
      if (state.chess.in_checkmate()) msg = state.chess.turn() === state.opening.side ? "Checkmate — you lost." : "Checkmate — you won!";
      else if (state.chess.in_stalemate()) msg = "Stalemate.";
      else if (state.chess.in_threefold_repetition()) msg = "Draw by repetition.";
      else if (state.chess.insufficient_material()) msg = "Draw by insufficient material.";
      else msg = "Game over.";
      statusEl.textContent = msg;
      hintBtn.disabled = true;
      return;
    }

    // Whose turn
    const turn = state.chess.turn();
    const myTurn = turn === state.opening.side;
    statusEl.textContent = myTurn ? "Your move." : "Opponent thinking…";

    refreshStats();
    runEngine();

    if (!myTurn) {
      playOpponentMove();
    }
  }

  function findKingSquare(color) {
    const board2 = state.chess.board();
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const sq = board2[r][f];
      if (sq && sq.type === "k" && sq.color === color) {
        return String.fromCharCode(97 + f) + (8 - r);
      }
    }
    return null;
  }

  async function playOpponentMove() {
    if (state.pendingOpponent) return;
    state.pendingOpponent = true;
    try {
      const data = await LichessExplorer.fetchPosition({
        fen: state.chess.fen(),
        ratingMin: state.ratingMin,
        ratingMax: state.ratingMax,
      });
      let chosen = LichessExplorer.sampleWeightedMove(data.moves);
      let uci;
      if (chosen) {
        uci = chosen.uci;
      } else {
        // Position has no game data — fall back to engine.
        await state.engine?.ready();
        const ev = await state.engine.evaluate(state.chess.fen(), { depth: 10 });
        uci = ev.bestMove;
      }
      if (!uci) return;
      await wait(450 + Math.random() * 350); // small "thinking" delay
      const move = applyUci(uci);
      if (!move) return;
      board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
      pushHistory(move);
      renderHistory();
      afterMove();
    } catch (e) {
      console.error(e);
      statusEl.textContent = "Couldn't reach Lichess — try again.";
    } finally {
      state.pendingOpponent = false;
    }
  }

  async function handleUserMove(from, to, promotion) {
    const move = state.chess.move({ from, to, promotion: promotion || undefined });
    if (!move) return; // illegal
    // Evaluate user's move BEFORE animating, against the prior stats
    const stats = state.statsForCurrent;
    const uci = move.from + move.to + (move.promotion || "");
    const verdict = judgeMove(stats, uci, move.san);
    coachVerdict(verdict, move);

    board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
    pushHistory(move);
    renderHistory();
    afterMove();
  }

  function judgeMove(stats, uci, san) {
    if (!stats || !stats.moves || stats.moves.length === 0) {
      return { kind: "no-data", san };
    }
    const sorted = [...stats.moves].sort(
      (a, b) => (b.white + b.draws + b.black) - (a.white + a.draws + a.black)
    );
    const total = sorted.reduce((s, m) => s + m.white + m.draws + m.black, 0);
    const idx = sorted.findIndex((m) => m.uci === uci);
    if (idx === -1) return { kind: "off-book", san };
    const entry = sorted[idx];
    const games = entry.white + entry.draws + entry.black;
    const pct = (games / total) * 100;
    if (idx === 0) return { kind: "top", san, pct, rank: 1 };
    if (idx <= 2) return { kind: "common", san, pct, rank: idx + 1 };
    return { kind: "sideline", san, pct, rank: idx + 1 };
  }

  function coachVerdict(v, move) {
    coachEl.classList.remove("good", "warn", "bad");
    let html;
    switch (v.kind) {
      case "top":
        coachEl.classList.add("good");
        html = `<strong>${v.san}</strong> — most common reply at this rating (${v.pct.toFixed(0)}%). Solid choice.`;
        break;
      case "common":
        coachEl.classList.add("good");
        html = `<strong>${v.san}</strong> — a known alternative (#${v.rank} most popular, ${v.pct.toFixed(0)}%).`;
        break;
      case "sideline":
        coachEl.classList.add("warn");
        html = `<strong>${v.san}</strong> — playable but uncommon at this rating (#${v.rank}, ${v.pct.toFixed(0)}%). The mainline is usually safer.`;
        break;
      case "off-book":
        coachEl.classList.add("warn");
        html = `<strong>${v.san}</strong> — out of book at this rating band. I'll let the engine evaluate.`;
        break;
      default:
        html = `<strong>${v.san}</strong> — no game data here.`;
    }
    coachEl.innerHTML = html;
  }

  async function refreshStats() {
    statsCtxEl.textContent = `(rating ${state.ratingMin}–${state.ratingMax})`;
    statsEl.textContent = "Loading…";
    try {
      const data = await LichessExplorer.fetchPosition({
        fen: state.chess.fen(),
        ratingMin: state.ratingMin,
        ratingMax: state.ratingMax,
      });
      state.statsForCurrent = data;
      renderStats(data);
    } catch (e) {
      console.error(e);
      statsEl.textContent = "Couldn't load stats.";
    }
  }

  function renderStats(data) {
    statsEl.innerHTML = "";
    if (!data.moves || data.moves.length === 0) {
      statsEl.textContent = "No game data at this rating band.";
      return;
    }
    const total = data.moves.reduce((s, m) => s + m.white + m.draws + m.black, 0);
    const top = data.moves.slice(0, 8);
    top.forEach((m, i) => {
      const games = m.white + m.draws + m.black;
      const pct = (games / total) * 100;
      const wPct = (m.white / games) * 100;
      const dPct = (m.draws / games) * 100;
      const bPct = (m.black / games) * 100;
      const row = document.createElement("div");
      row.className = "stat-row" + (i === 0 ? " book" : "");
      row.title = `${games.toLocaleString()} games · ${pct.toFixed(1)}% of plays · W ${wPct.toFixed(0)}% / D ${dPct.toFixed(0)}% / B ${bPct.toFixed(0)}%`;
      row.innerHTML = `
        <div class="san">${m.san}</div>
        <div class="bar">
          <span class="w" style="width:${wPct}%"></span>
          <span class="d" style="width:${dPct}%"></span>
          <span class="b" style="width:${bPct}%"></span>
        </div>
        <div class="pct">${pct.toFixed(0)}%</div>
      `;
      statsEl.appendChild(row);
    });
  }

  async function runEngine() {
    if (!state.engine) return;
    engineEl.textContent = "thinking…";
    try {
      await state.engine.ready();
      const fen = state.chess.fen();
      const ev = await state.engine.evaluate(fen, { depth: 13 });
      if (state.chess.fen() !== fen) return; // moved on
      let scoreStr;
      if (ev.mateIn !== null) scoreStr = `M${ev.mateIn}`;
      else {
        // chess.js turn determines whose perspective. Stockfish gives score from side-to-move.
        // Convert to white-positive convention.
        let s = ev.score;
        if (state.chess.turn() === "b") s = -s;
        scoreStr = (s >= 0 ? "+" : "") + s.toFixed(2);
      }
      const bestSan = ev.bestMove ? uciToSanSafe(ev.bestMove) : "?";
      engineEl.textContent = `${scoreStr}   best: ${bestSan}   d${ev.depth}`;
    } catch (e) {
      engineEl.textContent = "engine error";
    }
  }

  function uciToSanSafe(uci) {
    const tmp = new Chess(state.chess.fen());
    const m = tmp.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length === 5 ? uci[4] : undefined });
    return m ? m.san : uci;
  }

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  // ====== Buttons ======
  flipBtn.onclick = () => {
    const cur = board.orientation;
    board.flip(cur === "w" ? "b" : "w");
  };
  ratingSelect.onchange = () => {
    const [min, max] = ratingSelect.value.split(",").map(Number);
    state.ratingMin = min;
    state.ratingMax = max;
    if (state.opening) refreshStats();
  };
  backBtn.onclick = () => {
    if (state.historyStack.length === 0) return;
    state.chess.undo();
    state.historyStack.pop();
    const last = state.historyStack[state.historyStack.length - 1];
    const lm = last
      ? { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) }
      : null;
    board.setPosition(state.chess.fen(), { animate: true, lastMove: lm });
    renderHistory();
    afterMove();
  };
  hintBtn.onclick = () => {
    if (!state.statsForCurrent || !state.statsForCurrent.moves?.length) return;
    const top = state.statsForCurrent.moves[0];
    coachEl.classList.remove("good", "warn", "bad");
    coachEl.classList.add("good");
    coachEl.innerHTML = `Hint: most popular move here is <strong>${top.san}</strong>. Try it.`;
    // Show hint dot on the destination
    const fromUci = top.uci;
    const fromSq = fromUci.slice(0, 2);
    const toSq = fromUci.slice(2, 4);
    board.selectSquare(fromSq);
    board.highlightLegal([toSq]);
  };
  resetBtn.onclick = () => selectOpening(state.opening.id);
  newLineBtn.onclick = () => selectOpening(state.opening.id);

  // ====== Engine init ======
  (async function initEngine() {
    try {
      state.engine = new Engine();
      await state.engine.ready();
      engineStatusEl.textContent = "ready";
    } catch (e) {
      engineStatusEl.textContent = "unavailable";
      console.warn("Engine failed to init:", e);
    }
  })();

  renderOpeningList();
})();
