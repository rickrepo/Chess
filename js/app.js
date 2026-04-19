/* Main app: glues Board + chess.js + local Stockfish.
   NO network calls during play — opponent moves come from a baked-in
   mainLine for as long as the user stays on it, and from Stockfish
   (running locally as a Web Worker) once the user deviates or a line
   doesn't cover the current position.

   Hints: when it's the user's turn, an arrow on the board always points
   to the recommended move (from the line if on it, otherwise from
   Stockfish). A toggle in the footer hides arrows if you want to test
   yourself. */
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
  const mobileOpeningSelect = document.getElementById("mobile-opening-select");
  const hintBannerEl = document.getElementById("hint-banner");
  const hintSanEl = document.getElementById("hint-san");
  const hintWhyEl = document.getElementById("hint-why");
  const puzzleBarEl = document.getElementById("puzzle-bar");
  const puzzleTitleEl = document.getElementById("puzzle-title");
  const puzzleDescEl = document.getElementById("puzzle-desc");
  const puzzleDiffEl = document.getElementById("puzzle-diff");
  const puzzleTimerEl = document.getElementById("puzzle-timer");
  const puzzleScoreEl = document.getElementById("puzzle-score");
  const puzzleBestEl = document.getElementById("puzzle-best");
  const puzzleNextBtn = document.getElementById("puzzle-next");
  const puzzleFilterTheme = document.getElementById("puzzle-filter-theme");
  const puzzleFilterDiff = document.getElementById("puzzle-filter-diff");
  const puzzleFilterCat = document.getElementById("puzzle-filter-cat");
  const puzzleSolvedEl = document.getElementById("puzzle-solved");
  const puzzleTotalEl = document.getElementById("puzzle-total");
  const flipBtn = document.getElementById("flip-btn");
  const backBtn = document.getElementById("back-btn");
  const hintBtn = document.getElementById("hint-btn");
  const resetBtn = document.getElementById("reset-btn");
  const newLineBtn = document.getElementById("new-line-btn");

  const state = {
    chess: new Chess(),
    opening: null,
    historyStack: [],
    engine: null,
    pendingOpponent: false,
    mode: "practice", // "practice" | "demo" | "puzzle"
    demoCancelled: false,
    linePly: 0,
    lineDeviated: false,
    hintsOn: true,
    puzzle: null,
    puzzlePly: 0,
    puzzleStartTs: 0,
    puzzleTimerIv: null,
    puzzleFailed: false,
    puzzleDone: false,
    puzzleSessionScore: 0,
    puzzleBestScore: parseInt(localStorage.getItem("opener.puzzle.best") || "0", 10),
    puzzleSolved: 0,
    puzzleFilter: {
      theme: localStorage.getItem("opener.puzzle.filter.theme") || "",
      difficulty: localStorage.getItem("opener.puzzle.filter.difficulty") || "",
      category: localStorage.getItem("opener.puzzle.filter.category") || "",
    },
  };

  const board = new ChessBoard(boardEl, {
    canDrag: (sq, entry) => {
      if (state.mode === "demo") return false;
      if (state.mode === "puzzle") {
        if (!state.puzzle || state.puzzleDone) return false;
        return entry.color === state.chess.turn();
      }
      if (!state.opening) return false;
      if (state.chess.turn() !== state.opening.side) return false;
      return entry.color === state.opening.side;
    },
    onSelect: (sq, entry) => {
      if (state.mode === "demo") return;
      if (state.mode === "puzzle") {
        if (!state.puzzle || state.puzzleDone) return;
        if (entry.color !== state.chess.turn()) return;
        const moves = state.chess.moves({ square: sq, verbose: true });
        board.selectSquare(sq);
        board.highlightLegal(moves.map((m) => m.to));
        return;
      }
      if (!state.opening) return;
      if (state.chess.turn() !== state.opening.side) return;
      if (entry.color !== state.opening.side) return;
      const moves = state.chess.moves({ square: sq, verbose: true });
      board.selectSquare(sq);
      board.highlightLegal(moves.map((m) => m.to));
    },
    onUserMove: (from, to, promotion) => {
      if (state.mode === "demo") return;
      if (state.mode === "puzzle") return handlePuzzleMove(from, to, promotion);
      handleUserMove(from, to, promotion);
    },
  });

  // ===== Sidebar list (Puzzles first, then Openings) =====
  function renderOpeningList() {
    openingListEl.innerHTML = "";
    mobileOpeningSelect.innerHTML = '<option value="">— pick one —</option>';

    // Puzzles section FIRST (primary mode).
    if (window.PUZZLES && window.PUZZLES.length) {
      const label = document.createElement("div");
      label.className = "opening-group-label";
      label.textContent = "Puzzles";
      openingListEl.appendChild(label);

      const rushItem = document.createElement("div");
      rushItem.className = "opening-item";
      rushItem.dataset.id = "puzzle:random";
      rushItem.innerHTML = `
        <div class="name"><span class="badge badge-puzzle">game</span> Puzzle Rush</div>
        <div class="meta">Solve mating puzzles — best score saved locally. Filter by theme & difficulty.</div>
      `;
      rushItem.onclick = () => startPuzzle("random");
      openingListEl.appendChild(rushItem);

      // Quick-pick by difficulty
      for (const d of window.PUZZLE_DIFFICULTIES || [1, 2, 3]) {
        const item = document.createElement("div");
        item.className = "opening-item";
        item.dataset.id = `puzzle:diff:${d}`;
        const count = PUZZLES.filter((p) => p.difficulty === d).length;
        item.innerHTML = `
          <div class="name">${"\u2605".repeat(d)} puzzles <span class="muted small">(${count})</span></div>
          <div class="meta">Only ${d === 1 ? "easy" : d === 2 ? "medium" : "hard"} puzzles.</div>
        `;
        item.onclick = () => {
          state.puzzleFilter.difficulty = String(d);
          state.puzzleFilter.theme = "";
          state.puzzleFilter.category = "";
          localStorage.setItem("opener.puzzle.filter.difficulty", state.puzzleFilter.difficulty);
          localStorage.setItem("opener.puzzle.filter.theme", "");
          localStorage.setItem("opener.puzzle.filter.category", "");
          populatePuzzleFilters();
          startPuzzle("random");
        };
        openingListEl.appendChild(item);
      }

      const optGroup = document.createElement("optgroup");
      optGroup.label = "Puzzles";
      const opt = document.createElement("option");
      opt.value = "puzzle:random";
      opt.textContent = "\u2665 Puzzle Rush";
      optGroup.appendChild(opt);
      mobileOpeningSelect.appendChild(optGroup);
    }

    // Openings section (secondary).
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
      const optGroup = document.createElement("optgroup");
      optGroup.label = group;
      for (const o of items) {
        const item = document.createElement("div");
        item.className = "opening-item";
        item.dataset.id = o.id;
        const tag = o.walkthrough ? '<span class="badge">demo</span>' : "";
        item.innerHTML = `
          <div class="name"><span class="side ${o.side === "w" ? "white" : "black"}"></span>${o.name} ${tag}</div>
          <div class="meta">${o.description}</div>
        `;
        item.onclick = () => selectOpening(o.id);
        openingListEl.appendChild(item);

        const opt = document.createElement("option");
        opt.value = o.id;
        opt.textContent = (o.side === "w" ? "\u2659 " : "\u265F ") + o.name;
        optGroup.appendChild(opt);
      }
      mobileOpeningSelect.appendChild(optGroup);
    }
  }

  function selectOpening(id) {
    const opening = OPENINGS.find((o) => o.id === id);
    if (!opening) return;
    state.demoCancelled = true;
    state.mode = "practice";
    stopPuzzleTimer();
    hidePuzzleBar();
    state.puzzle = null;
    state.opening = opening;
    state.historyStack = [];
    state.linePly = 0;
    state.lineDeviated = false;

    [...openingListEl.querySelectorAll(".opening-item")].forEach((el) =>
      el.classList.toggle("active", el.dataset.id === id)
    );
    if (mobileOpeningSelect.value !== id) mobileOpeningSelect.value = id;

    openingTitleEl.textContent = opening.name;
    board.flip(opening.side);
    board.clearArrows();

    backBtn.disabled = false;
    hintBtn.disabled = false;
    resetBtn.disabled = false;
    newLineBtn.disabled = false;

    if (opening.walkthrough && opening.walkthrough.length) {
      runDemoThenPractice(opening);
    } else {
      coachEl.className = "coach-msg";
      coachEl.innerHTML = principlesHtml(opening);
      replaySetupAndStart();
    }
  }

  function principlesHtml(opening) {
    return `<strong>${opening.name}</strong> — ${opening.description}<br><br>` +
      `<em>Key ideas:</em><ul style="margin:6px 0 0 18px;padding:0;">` +
      (opening.principles || []).map((p) => `<li>${p}</li>`).join("") + `</ul>`;
  }

  function setStartingPosition(opening) {
    state.chess = opening.startFen ? new Chess(opening.startFen) : new Chess();
  }

  // The "line" followed by the opponent + graded against for the user
  // comes from:
  //   opening.mainLine  (string[] of UCI) - for openings
  //   opening.walkthrough ({uci,note}[]) - for mating tricks
  //   opening.moves ([] of UCI setup)    - these are played before practice
  //
  // setupMoves are NOT part of the line — they're pre-played to land at
  // the practice start. The line begins at move (setup.length) counted
  // from the starting position.
  function getLine(opening) {
    if (!opening) return null;
    if (opening.walkthrough) {
      // Walkthrough is played from the very start of the opening's FEN —
      // during practice, we replay it move-by-move and the user follows.
      return opening.walkthrough.map((s) => (typeof s === "string" ? { uci: s } : s));
    }
    if (opening.mainLine) {
      return opening.mainLine.map((s) => (typeof s === "string" ? { uci: s } : s));
    }
    return null;
  }

  function expectedLineMove() {
    const op = state.opening;
    if (!op || state.lineDeviated) return null;
    const line = getLine(op);
    if (!line) return null;
    return line[state.linePly] || null;
  }

  async function replaySetupAndStart() {
    state.mode = "practice";
    setStartingPosition(state.opening);
    state.historyStack = [];
    state.linePly = 0;
    state.lineDeviated = false;
    board.clearArrows();
    board.setPosition(state.chess.fen(), { animate: false, lastMove: null });
    renderHistory();
    const setupMoves = state.opening.moves || [];
    statusEl.textContent = setupMoves.length ? "Setting up line…" : "";
    for (const uci of setupMoves) {
      await wait(220);
      const move = applyUci(uci);
      if (!move) break;
      board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
      pushHistory(move);
      renderHistory();
    }
    afterMove();
  }

  async function runDemoThenPractice(opening) {
    state.mode = "demo";
    state.demoCancelled = false;
    setStartingPosition(opening);
    state.historyStack = [];
    state.linePly = 0;
    state.lineDeviated = false;
    board.clearArrows();
    board.setPosition(state.chess.fen(), { animate: false, lastMove: null });
    renderHistory();
    statusEl.textContent = "Demo — watch the trap unfold";
    coachEl.className = "coach-msg";
    coachEl.innerHTML = `<strong>${opening.name}</strong> — ${opening.description}<br><br>` +
      `<em>Watch the moves. Then you'll play it from ${opening.side === "w" ? "White's" : "Black's"} side.</em>`;

    const stepDelay = 850;
    await wait(700);
    for (let i = 0; i < opening.walkthrough.length; i++) {
      if (state.demoCancelled) return;
      const step = opening.walkthrough[i];
      const move = applyUci(step.uci);
      if (!move) break;
      board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
      pushHistory(move);
      renderHistory();
      board.setCheck(state.chess.in_check() ? findKingSquare(state.chess.turn()) : null);
      coachEl.className = "coach-msg";
      coachEl.innerHTML = `<strong>${move.san}</strong> — ${step.note || ""}`;
      await wait(stepDelay);
    }
    if (state.demoCancelled) return;

    statusEl.textContent = "Demo finished";
    coachEl.className = "coach-msg good";
    coachEl.innerHTML =
      `<strong>That's the pattern.</strong> Now you try it from ${opening.side === "w" ? "White's" : "Black's"} side.<br><br>` +
      `<em>Key ideas:</em><ul style="margin:6px 0 0 18px;padding:0;">` +
      (opening.principles || []).map((p) => `<li>${p}</li>`).join("") + `</ul>` +
      `<br><button id="start-practice-btn" class="primary-btn" style="margin-top:8px;">Practice it</button>` +
      `<button id="replay-demo-btn" class="ghost-btn" style="margin-left:8px;">Replay demo</button>`;
    document.getElementById("start-practice-btn").onclick = () => replaySetupAndStart();
    document.getElementById("replay-demo-btn").onclick = () => runDemoThenPractice(opening);
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
    board.setCheck(state.chess.in_check() ? findKingSquare(state.chess.turn()) : null);

    if (state.chess.game_over()) {
      let msg;
      if (state.chess.in_checkmate()) msg = state.chess.turn() === state.opening.side ? "Checkmate — you lost." : "Checkmate — you won!";
      else if (state.chess.in_stalemate()) msg = "Stalemate.";
      else if (state.chess.in_threefold_repetition()) msg = "Draw by repetition.";
      else if (state.chess.insufficient_material()) msg = "Draw by insufficient material.";
      else msg = "Game over.";
      statusEl.textContent = msg;
      hintBtn.disabled = true;
      board.clearArrows();
      hideHintBanner();
      return;
    }

    const myTurn = state.chess.turn() === state.opening.side;
    statusEl.textContent = myTurn ? "Your move." : "Opponent thinking…";
    refreshStats();
    // Skip background engine eval when on-line — saves the worker for
    // opponent moves. runEngine() only runs for off-line positions.
    if (state.lineDeviated) runEngine();
    else engineEl.textContent = "on line — eval skipped";

    if (!myTurn) {
      board.clearArrows();
      hideHintBanner();
      playOpponentMove();
    } else {
      updateHintArrow();
    }
  }

  function findKingSquare(color) {
    const b = state.chess.board();
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const sq = b[r][f];
      if (sq && sq.type === "k" && sq.color === color) {
        return String.fromCharCode(97 + f) + (8 - r);
      }
    }
    return null;
  }

  // ===== Opponent: follow the line, or let Stockfish play =====
  async function playOpponentMove() {
    if (state.pendingOpponent) return;
    state.pendingOpponent = true;
    try {
      await wait(400 + Math.random() * 300);
      let uci = null;
      const expected = expectedLineMove();
      if (expected) {
        const tmp = new Chess(state.chess.fen());
        const ok = tmp.move({ from: expected.uci.slice(0, 2), to: expected.uci.slice(2, 4), promotion: expected.uci[4] });
        if (ok) uci = expected.uci;
      }
      if (!uci && state.engine) {
        try {
          await state.engine.ready();
          const ev = await state.engine.evaluate(state.chess.fen(), { depth: 10, multiPv: 3 });
          if (ev.lines && ev.lines.length) {
            const r = Math.random();
            const i = r < 0.7 ? 0 : r < 0.9 ? Math.min(1, ev.lines.length - 1) : Math.min(2, ev.lines.length - 1);
            uci = ev.lines[i].move;
          } else if (ev.bestMove) {
            uci = ev.bestMove;
          }
        } catch (_) {}
      }
      if (!uci) {
        const moves = state.chess.moves({ verbose: true });
        if (!moves.length) { afterMove(); return; }
        const m = moves[Math.floor(Math.random() * moves.length)];
        uci = m.from + m.to + (m.promotion || "");
      }
      const move = applyUci(uci);
      if (!move) { afterMove(); return; }
      if (expected && move.from + move.to + (move.promotion || "") === expected.uci) state.linePly++;
      board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
      pushHistory(move);
      renderHistory();
      afterMove();
    } catch (e) {
      console.error(e);
      statusEl.textContent = "Engine error — try Restart.";
    } finally {
      state.pendingOpponent = false;
    }
  }

  // ===== User move: grade against the line, or let engine evaluate =====
  async function handleUserMove(from, to, promotion) {
    board.clearArrows();
    const expected = expectedLineMove();
    const expectedUci = expected ? expected.uci : null;
    const expectedSan = expected ? sanOfMoveFromFen(state.chess.fen(), expected.uci) : null;
    const move = state.chess.move({ from, to, promotion: promotion || undefined });
    if (!move) return;
    const playedUci = move.from + move.to + (move.promotion || "");

    if (expected && playedUci === expectedUci) {
      state.linePly++;
      coachEl.className = "coach-msg good";
      coachEl.innerHTML = `<strong>${move.san}</strong> &#10003; — matches the recommended line.` +
        (expected.note ? `<br><span class="muted small">${expected.note}</span>` : "");
    } else if (expected) {
      state.lineDeviated = true;
      coachEl.className = "coach-msg warn";
      coachEl.innerHTML = `<strong>${move.san}</strong> — off the prepared line. Recommended: <strong>${expectedSan}</strong>.` +
        (expected.note ? `<br><span class="muted small">Why ${expectedSan}: ${expected.note}</span>` : "") +
        `<br><span class="muted small">Engine continues from here. Hit <em>Back</em> to retry.</span>`;
    } else {
      coachEl.className = "coach-msg";
      coachEl.innerHTML = `<strong>${move.san}</strong> — engine continuation below.`;
    }

    board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
    pushHistory(move);
    renderHistory();
    afterMove();
  }

  function sanOfMoveFromFen(fen, uci) {
    const tmp = new Chess(fen);
    const m = tmp.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    return m ? m.san : uci;
  }

  // ===== Hint arrow =====
  function showHintBanner(san, why, playable) {
    if (!san) { hintBannerEl.classList.add("hidden"); return; }
    hintSanEl.textContent = san;
    hintWhyEl.textContent = why || "";
    hintBannerEl.classList.remove("hidden");
    hintBannerEl.dataset.playable = playable ? "1" : "0";
    const tap = hintBannerEl.querySelector(".hint-tap");
    if (tap) tap.style.display = playable ? "" : "none";
  }

  function hideHintBanner() { hintBannerEl.classList.add("hidden"); hintBannerEl.dataset.playable = "0"; }

  hintBannerEl.addEventListener("click", () => {
    if (hintBannerEl.dataset.playable !== "1") return;
    const hint = board.currentHint;
    if (!hint) return;
    handleUserMove(hint.from, hint.to, null);
  });

  function updateHintArrow() {
    if (!state.opening || !state.hintsOn) { board.clearArrows(); hideHintBanner(); return; }
    if (state.chess.turn() !== state.opening.side) { board.clearArrows(); hideHintBanner(); return; }
    const expected = expectedLineMove();
    if (expected) {
      board.drawArrow(expected.uci.slice(0, 2), expected.uci.slice(2, 4));
      const san = sanOfMoveFromFen(state.chess.fen(), expected.uci);
      showHintBanner(san, expected.note || "", true);
      return;
    }
    // Off the prepared line — DON'T block on the engine.
    board.clearArrows();
    showHintBanner("Off line", "Tap Back to retry from the last line move, or Restart to start over.", false);
  }

  // ===== Stats panel: line move only (no engine queue piling) =====
  function refreshStats() {
    statsCtxEl.textContent = "";
    const expected = expectedLineMove();
    let html = "";
    if (expected) {
      const san = sanOfMoveFromFen(state.chess.fen(), expected.uci);
      html += `<div class="stat-row book"><div class="san">${san}</div><div class="bar"><span class="w" style="width:100%"></span></div><div class="pct">line</div></div>`;
      if (expected.note) html += `<div class="muted small" style="padding:6px 6px 0;">${expected.note}</div>`;
    } else if (state.lineDeviated) {
      html += `<div class="muted small" style="padding:4px 6px;">Off the prepared line. Tap <em>Back</em> to retry.</div>`;
    } else {
      html += `<div class="muted small" style="padding:4px 6px;">No line here — the game continues.</div>`;
    }
    statsEl.innerHTML = html;
  }

  async function runEngine() {
    if (!state.engine) return;
    engineEl.textContent = "thinking…";
    try {
      await state.engine.ready();
      const fen = state.chess.fen();
      const ev = await state.engine.evaluate(fen, { depth: 12, multiPv: 1 });
      if (state.chess.fen() !== fen) return;
      let scoreStr;
      if (ev.mateIn !== null) scoreStr = `M${ev.mateIn}`;
      else {
        let s = ev.score;
        if (state.chess.turn() === "b") s = -s;
        scoreStr = (s >= 0 ? "+" : "") + s.toFixed(2);
      }
      const bestSan = ev.bestMove ? sanOfMoveFromFen(fen, ev.bestMove) : "?";
      engineEl.textContent = `${scoreStr}   best: ${bestSan}   d${ev.depth}`;
    } catch (_) {
      engineEl.textContent = "engine error";
    }
  }

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  // ===== Puzzle mode =====
  function filteredPuzzles() {
    const f = state.puzzleFilter;
    return PUZZLES.filter((p) => {
      if (f.category && p.category !== f.category) return false;
      if (f.difficulty && p.difficulty !== parseInt(f.difficulty, 10)) return false;
      if (f.theme && !(p.themes || []).includes(f.theme)) return false;
      return true;
    });
  }

  function populatePuzzleFilters() {
    // Gather all themes from the puzzle bank
    const themes = new Set();
    for (const p of PUZZLES) (p.themes || []).forEach((t) => themes.add(t));
    const sorted = [...themes].sort();
    puzzleFilterTheme.innerHTML = '<option value="">Any</option>' +
      sorted.map((t) => `<option value="${t}">${t}</option>`).join("");
    puzzleFilterTheme.value = state.puzzleFilter.theme || "";
    puzzleFilterDiff.value = state.puzzleFilter.difficulty || "";
    puzzleFilterCat.value = state.puzzleFilter.category || "";
    const total = filteredPuzzles().length;
    puzzleTotalEl.textContent = total;
  }

  function onFilterChange() {
    state.puzzleFilter.theme = puzzleFilterTheme.value;
    state.puzzleFilter.difficulty = puzzleFilterDiff.value;
    state.puzzleFilter.category = puzzleFilterCat.value;
    localStorage.setItem("opener.puzzle.filter.theme", state.puzzleFilter.theme);
    localStorage.setItem("opener.puzzle.filter.difficulty", state.puzzleFilter.difficulty);
    localStorage.setItem("opener.puzzle.filter.category", state.puzzleFilter.category);
    const total = filteredPuzzles().length;
    puzzleTotalEl.textContent = total;
    if (total === 0) {
      coachEl.className = "coach-msg warn";
      coachEl.innerHTML = "No puzzles match those filters. Relax them and try again.";
    }
  }

  function startPuzzle(kind) {
    stopPuzzleTimer();
    state.demoCancelled = true;
    state.opening = null;
    state.historyStack = [];
    state.mode = "puzzle";
    state.puzzleFailed = false;
    state.puzzleDone = false;
    state.puzzlePly = 0;

    // Pick puzzle. "random" uses the current filters.
    let puzzle;
    if (kind === "random" || kind === "puzzle:random") {
      const pool = filteredPuzzles();
      if (pool.length === 0) {
        coachEl.className = "coach-msg warn";
        coachEl.innerHTML = "No puzzles match those filters. Relax them and try again.";
        return;
      }
      const remaining = pool.filter((p) => p.id !== (state.puzzle && state.puzzle.id));
      const selectPool = remaining.length ? remaining : pool;
      puzzle = selectPool[Math.floor(Math.random() * selectPool.length)];
    } else {
      puzzle = PUZZLES.find((p) => p.id === kind) || PUZZLES[0];
    }
    state.puzzle = puzzle;
    state.chess = new Chess(puzzle.fen);
    const side = state.chess.turn(); // whose move = the solver's side

    // Update UI
    openingTitleEl.textContent = "Puzzle";
    statusEl.textContent = "";
    hideHintBanner();
    board.clearArrows();
    board.flip(side);
    board.setPosition(state.chess.fen(), { animate: false, lastMove: null });
    renderHistory();
    [...openingListEl.querySelectorAll(".opening-item")].forEach((el) =>
      el.classList.toggle("active", el.dataset.id === "puzzle:random")
    );

    // Show puzzle bar, hide coach principles
    coachEl.className = "coach-msg";
    coachEl.innerHTML = "<strong>Find the best move.</strong> Score is based on speed — faster = more points.";
    puzzleBarEl.classList.remove("hidden");
    puzzleTitleEl.textContent = `${puzzle.category} — ${puzzle.name}`;
    puzzleDescEl.textContent = puzzle.description || "";
    puzzleDiffEl.textContent = "\u2605".repeat(puzzle.difficulty || 1);
    puzzleScoreEl.textContent = state.puzzleSessionScore;
    puzzleBestEl.textContent = state.puzzleBestScore;
    puzzleSolvedEl.textContent = state.puzzleSolved;
    puzzleTotalEl.textContent = filteredPuzzles().length;
    puzzleNextBtn.disabled = false;
    puzzleNextBtn.textContent = "Skip";

    // Disable practice-only buttons
    hintBtn.disabled = false;
    hintBtn.textContent = state.hintsOn ? "Hide hints" : "Show hints";
    backBtn.disabled = true;
    resetBtn.disabled = false;
    newLineBtn.disabled = true;

    startPuzzleTimer();
  }

  function startPuzzleTimer() {
    state.puzzleStartTs = performance.now();
    if (state.puzzleTimerIv) clearInterval(state.puzzleTimerIv);
    state.puzzleTimerIv = setInterval(() => {
      const t = (performance.now() - state.puzzleStartTs) / 1000;
      puzzleTimerEl.textContent = t.toFixed(1) + "s";
    }, 100);
  }
  function stopPuzzleTimer() {
    if (state.puzzleTimerIv) { clearInterval(state.puzzleTimerIv); state.puzzleTimerIv = null; }
  }

  function puzzleElapsed() { return (performance.now() - state.puzzleStartTs) / 1000; }

  async function handlePuzzleMove(from, to, promotion) {
    if (state.puzzleDone) return;
    const playedUci = from + to + (promotion || "");
    const expected = state.puzzle.solution[state.puzzlePly];
    if (!expected) return;

    if (playedUci !== expected) {
      // Wrong move. Mark failed but allow trying again after reset.
      state.puzzleFailed = true;
      state.puzzleDone = true;
      stopPuzzleTimer();
      // Still show the move for visual feedback
      const move = state.chess.move({ from, to, promotion: promotion || undefined });
      if (move) {
        board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
        pushHistory(move);
        renderHistory();
      }
      const expectedSan = sanOfMoveFromFen(state.puzzle.fen, expected);
      coachEl.className = "coach-msg bad";
      coachEl.innerHTML = `<strong>Not the best.</strong> The winning move was <strong>${expectedSan}</strong>.`;
      puzzleNextBtn.textContent = "Next puzzle";
      return;
    }

    // Correct move
    const move = state.chess.move({ from, to, promotion: promotion || undefined });
    if (!move) return;
    state.puzzlePly++;
    board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: move.from, to: move.to } });
    pushHistory(move);
    renderHistory();
    board.setCheck(state.chess.in_check() ? findKingSquare(state.chess.turn()) : null);

    if (state.puzzlePly >= state.puzzle.solution.length) {
      return finishPuzzle();
    }

    // Otherwise play the opponent's forced response
    await wait(400);
    const oppUci = state.puzzle.solution[state.puzzlePly];
    const oppMove = state.chess.move({ from: oppUci.slice(0, 2), to: oppUci.slice(2, 4), promotion: oppUci[4] });
    if (oppMove) {
      state.puzzlePly++;
      board.setPosition(state.chess.fen(), { animate: true, lastMove: { from: oppMove.from, to: oppMove.to } });
      pushHistory(oppMove);
      renderHistory();
      board.setCheck(state.chess.in_check() ? findKingSquare(state.chess.turn()) : null);
      if (state.puzzlePly >= state.puzzle.solution.length) return finishPuzzle();
    }
  }

  function finishPuzzle() {
    state.puzzleDone = true;
    stopPuzzleTimer();
    const elapsed = puzzleElapsed();
    const base = 100 * (state.puzzle.difficulty || 1);
    const timeFactor = Math.max(0.2, 1 - elapsed / 60);
    const gained = Math.round(base * timeFactor);
    state.puzzleSessionScore += gained;
    if (state.puzzleSessionScore > state.puzzleBestScore) {
      state.puzzleBestScore = state.puzzleSessionScore;
      localStorage.setItem("opener.puzzle.best", String(state.puzzleBestScore));
    }
    state.puzzleSolved++;
    puzzleSolvedEl.textContent = state.puzzleSolved;
    puzzleScoreEl.textContent = state.puzzleSessionScore;
    puzzleBestEl.textContent = state.puzzleBestScore;
    puzzleNextBtn.textContent = "Next puzzle";
    coachEl.className = "coach-msg good";
    coachEl.innerHTML = `<strong>Solved in ${elapsed.toFixed(1)}s!</strong> +${gained} points.`;
  }

  function hidePuzzleBar() { puzzleBarEl.classList.add("hidden"); }

  // ===== Buttons =====
  flipBtn.onclick = () => board.flip(board.orientation === "w" ? "b" : "w");
  backBtn.onclick = () => {
    if (state.historyStack.length === 0) return;
    state.chess.undo();
    state.historyStack.pop();
    // If we were on the line, step back the line pointer too; if we were
    // off, leave deviated flag alone.
    if (!state.lineDeviated && state.linePly > 0) state.linePly--;
    const last = state.historyStack[state.historyStack.length - 1];
    const lm = last ? { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) } : null;
    board.setPosition(state.chess.fen(), { animate: true, lastMove: lm });
    renderHistory();
    afterMove();
  };
  hintBtn.onclick = () => {
    state.hintsOn = !state.hintsOn;
    hintBtn.textContent = state.hintsOn ? "Hide hints" : "Show hints";
    if (state.hintsOn) updateHintArrow();
    else { board.clearArrows(); hideHintBanner(); }
  };
  resetBtn.onclick = () => {
    if (state.mode === "puzzle" && state.puzzle) {
      // Restart the same puzzle
      startPuzzle(state.puzzle.id);
      return;
    }
    if (!state.opening) return;
    state.demoCancelled = true;
    replaySetupAndStart();
  };
  newLineBtn.onclick = () => state.opening && selectOpening(state.opening.id);
  mobileOpeningSelect.onchange = () => {
    const id = mobileOpeningSelect.value;
    if (!id) return;
    if (id === "puzzle:random") startPuzzle("random");
    else selectOpening(id);
  };

  puzzleNextBtn.onclick = () => startPuzzle("random");
  puzzleFilterTheme.onchange = () => onFilterChange();
  puzzleFilterDiff.onchange = () => onFilterChange();
  puzzleFilterCat.onchange = () => onFilterChange();

  // ===== Engine init =====
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
  populatePuzzleFilters();
  hintBtn.textContent = "Hide hints";

  // Land in Puzzle mode by default — this is the primary experience now.
  startPuzzle("random");
})();
