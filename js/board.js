/* Chess board UI with smooth animations and drag/drop.
   Pieces are absolutely positioned within a "pieces" overlay so they can
   slide between squares with CSS transforms. The board grid below is just
   colored squares + coordinates + move-hint dots.

   Public API (constructed in app.js):
     const board = new ChessBoard(rootEl, { onUserMove(from, to, promotion) });
     board.setPosition(fen, { animate, lastMove })
     board.flip(orientation)              // 'w' | 'b'
     board.highlightLegal(squares)        // for selected piece
     board.setLastMove({from, to})
     board.setCheck(squareOrNull)
     board.askPromotion(color, fromFile, toFile) -> Promise<'q'|'r'|'b'|'n'|null>
*/
(function (global) {
  const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
  // Piece images served from chessboardjs CDN (well-known, fast).
  const PIECE_BASE = "https://chessboardjs.com/img/chesspieces/wikipedia/";
  const PROMO_PIECES = ["q", "r", "b", "n"];

  function pieceImg(color, type) {
    // type is 'p','n','b','r','q','k' (lowercase from chess.js)
    return `${PIECE_BASE}${color}${type.toUpperCase()}.png`;
  }

  function squareToCoord(sq) {
    return { file: sq.charCodeAt(0) - 97, rank: 8 - parseInt(sq[1], 10) };
  }
  function coordToSquare(file, rank) {
    return `${FILES[file]}${8 - rank}`;
  }

  class ChessBoard {
    constructor(root, opts = {}) {
      this.root = root;
      this.opts = opts;
      this.orientation = "w";
      this.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      this.position = this._parseFen(this.fen).board;
      this.pieceEls = new Map(); // square -> { el, color, type }
      this.selected = null;
      this.legalForSelected = [];
      this.lastMove = null;
      this.checkSquare = null;
      this.promotionResolver = null;

      this._build();
      this._bindEvents();
      this.setPosition(this.fen);
    }

    _build() {
      this.root.innerHTML = "";
      this.squares = {};
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = document.createElement("div");
          const isLight = (r + f) % 2 === 0;
          sq.className = "square " + (isLight ? "light" : "dark");
          const square = coordToSquare(f, r);
          sq.dataset.square = square;
          if (f === 0) {
            const rank = document.createElement("span");
            rank.className = "coord rank";
            rank.textContent = 8 - r;
            sq.appendChild(rank);
          }
          if (r === 7) {
            const file = document.createElement("span");
            file.className = "coord file";
            file.textContent = FILES[f];
            sq.appendChild(file);
          }
          this.root.appendChild(sq);
          this.squares[square] = sq;
        }
      }
      this.piecesLayer = document.createElement("div");
      this.piecesLayer.className = "pieces";
      this.root.appendChild(this.piecesLayer);

      // SVG overlay for arrows (hints)
      this.arrowLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.arrowLayer.setAttribute("class", "arrows");
      this.arrowLayer.setAttribute("viewBox", "0 0 800 800");
      this.arrowLayer.setAttribute("preserveAspectRatio", "none");
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `<marker id="arrowhead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="rgba(80,170,80,0.85)"/></marker>`;
      this.arrowLayer.appendChild(defs);
      this.root.appendChild(this.arrowLayer);

      this._applyOrientation();
    }

    drawArrow(from, to) {
      this.clearArrows();
      if (!from || !to) return;
      const fromC = this._squareCenter(from);
      const toC = this._squareCenter(to);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", fromC.x);
      line.setAttribute("y1", fromC.y);
      // Pull endpoint back so the arrowhead doesn't overshoot the square
      const dx = toC.x - fromC.x, dy = toC.y - fromC.y;
      const len = Math.hypot(dx, dy);
      const back = 25;
      line.setAttribute("x2", toC.x - (dx / len) * back);
      line.setAttribute("y2", toC.y - (dy / len) * back);
      line.setAttribute("stroke", "rgba(80,170,80,0.85)");
      line.setAttribute("stroke-width", "14");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("marker-end", "url(#arrowhead)");
      this.arrowLayer.appendChild(line);
    }

    clearArrows() {
      [...this.arrowLayer.querySelectorAll("line")].forEach((n) => n.remove());
    }

    _squareCenter(sq) {
      const { file, rank } = squareToCoord(sq);
      const f = this.orientation === "w" ? file : 7 - file;
      const r = this.orientation === "w" ? rank : 7 - rank;
      return { x: f * 100 + 50, y: r * 100 + 50 };
    }

    _applyOrientation() {
      // Re-order squares in the grid based on orientation
      const order = [];
      if (this.orientation === "w") {
        for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) order.push(coordToSquare(f, r));
      } else {
        for (let r = 7; r >= 0; r--) for (let f = 7; f >= 0; f--) order.push(coordToSquare(f, r));
      }
      order.forEach((sq) => this.root.appendChild(this.squares[sq]));
      this.root.appendChild(this.piecesLayer);
      // Update file/rank coord visibility — always show on board edge
      Object.values(this.squares).forEach((s) => {
        const c = s.querySelectorAll(".coord");
        c.forEach((x) => x.remove());
      });
      for (const sq of order) {
        const { file, rank } = squareToCoord(sq);
        const el = this.squares[sq];
        const isFirstFileVisually =
          this.orientation === "w" ? file === 0 : file === 7;
        const isBottomRankVisually =
          this.orientation === "w" ? rank === 7 : rank === 0;
        if (isFirstFileVisually) {
          const r2 = document.createElement("span");
          r2.className = "coord rank";
          r2.textContent = 8 - rank;
          el.appendChild(r2);
        }
        if (isBottomRankVisually) {
          const f2 = document.createElement("span");
          f2.className = "coord file";
          f2.textContent = FILES[file];
          el.appendChild(f2);
        }
      }
      this._repositionAllPieces();
    }

    flip(orientation) {
      this.orientation = orientation;
      this._applyOrientation();
    }

    _parseFen(fen) {
      const [pos, turn] = fen.split(" ");
      const rows = pos.split("/");
      const board = {};
      rows.forEach((row, rIdx) => {
        let f = 0;
        for (const ch of row) {
          if (/\d/.test(ch)) {
            f += parseInt(ch, 10);
          } else {
            const color = ch === ch.toUpperCase() ? "w" : "b";
            const type = ch.toLowerCase();
            board[coordToSquare(f, rIdx)] = { color, type };
            f++;
          }
        }
      });
      return { board, turn };
    }

    setPosition(fen, opts = {}) {
      const { animate = true, lastMove = null } = opts;
      this.fen = fen;
      const { board: newPos } = this._parseFen(fen);

      // Diff-based update so untouched pieces don't re-render.
      const oldPos = this.position;
      const oldKeys = Object.keys(oldPos);
      const newKeys = Object.keys(newPos);
      const newSet = new Set(newKeys);

      // Detect moves: a piece "from" disappears, "to" gets matching color/type.
      // For animation we use the lastMove hint when provided.
      let moveFrom = lastMove ? lastMove.from : null;
      let moveTo = lastMove ? lastMove.to : null;

      // 1) Move primary piece (if known)
      if (moveFrom && moveTo && this.pieceEls.has(moveFrom)) {
        const entry = this.pieceEls.get(moveFrom);
        // Handle capture animation: if target had a piece, fade it out
        if (this.pieceEls.has(moveTo)) {
          const cap = this.pieceEls.get(moveTo);
          this._captureAnim(cap.el);
          this.pieceEls.delete(moveTo);
        }
        const newPieceData = newPos[moveTo];
        if (newPieceData && (newPieceData.type !== entry.type || newPieceData.color !== entry.color)) {
          // promotion: change image after slide
          this._slideTo(entry.el, moveTo);
          setTimeout(() => {
            entry.el.style.backgroundImage = `url("${pieceImg(newPieceData.color, newPieceData.type)}")`;
            entry.type = newPieceData.type;
            entry.color = newPieceData.color;
          }, 180);
        } else {
          this._slideTo(entry.el, moveTo);
        }
        entry.square = moveTo;
        this.pieceEls.delete(moveFrom);
        this.pieceEls.set(moveTo, entry);
      }

      // 2) Castling: if it was a king move, also slide the rook.
      if (lastMove && this.pieceEls.has(moveTo)) {
        const moverType = this.pieceEls.get(moveTo).type;
        if (moverType === "k") {
          const fromCoord = squareToCoord(moveFrom);
          const toCoord = squareToCoord(moveTo);
          if (Math.abs(toCoord.file - fromCoord.file) === 2) {
            // kingside if to file = 6 (g), queenside if to file = 2 (c)
            const rank = fromCoord.rank;
            const rookFromSq =
              toCoord.file === 6 ? coordToSquare(7, rank) : coordToSquare(0, rank);
            const rookToSq =
              toCoord.file === 6 ? coordToSquare(5, rank) : coordToSquare(3, rank);
            if (this.pieceEls.has(rookFromSq)) {
              const rentry = this.pieceEls.get(rookFromSq);
              this._slideTo(rentry.el, rookToSq);
              rentry.square = rookToSq;
              this.pieceEls.delete(rookFromSq);
              this.pieceEls.set(rookToSq, rentry);
            }
          }
        }
      }

      // 3) En-passant capture: if pawn moved diagonally to empty target,
      // remove the pawn behind it.
      if (lastMove && moveFrom && moveTo) {
        const oldEntry = oldPos[moveFrom];
        if (oldEntry && oldEntry.type === "p") {
          const fromC = squareToCoord(moveFrom);
          const toC = squareToCoord(moveTo);
          if (fromC.file !== toC.file && !oldPos[moveTo]) {
            const capSq = coordToSquare(toC.file, fromC.rank);
            if (this.pieceEls.has(capSq)) {
              this._captureAnim(this.pieceEls.get(capSq).el);
              this.pieceEls.delete(capSq);
            }
          }
        }
      }

      // 4) Reconcile any other differences (e.g. when we set position cold).
      // Remove pieces that shouldn't be there
      for (const sq of [...this.pieceEls.keys()]) {
        const want = newPos[sq];
        const have = this.pieceEls.get(sq);
        if (!want || want.color !== have.color || want.type !== have.type) {
          have.el.remove();
          this.pieceEls.delete(sq);
        }
      }
      // Add pieces that should be there
      for (const sq of newKeys) {
        if (!this.pieceEls.has(sq)) {
          this._spawnPiece(sq, newPos[sq]);
        }
      }

      this.position = newPos;
      this.setLastMove(lastMove);
      this._renderHighlights();
    }

    _spawnPiece(sq, piece) {
      const el = document.createElement("div");
      el.className = "piece";
      el.style.backgroundImage = `url("${pieceImg(piece.color, piece.type)}")`;
      el.dataset.square = sq;
      this.piecesLayer.appendChild(el);
      const entry = { el, color: piece.color, type: piece.type, square: sq };
      this.pieceEls.set(sq, entry);
      this._positionPiece(el, sq);
      this._attachDrag(el, entry);
    }

    _positionPiece(el, sq) {
      const { file, rank } = squareToCoord(sq);
      const f = this.orientation === "w" ? file : 7 - file;
      const r = this.orientation === "w" ? rank : 7 - rank;
      el.style.transform = `translate(${f * 100}%, ${r * 100}%)`;
      el.dataset.square = sq;
    }

    _slideTo(el, sq) {
      this._positionPiece(el, sq);
    }

    _captureAnim(el) {
      el.classList.add("captured-anim");
      setTimeout(() => el.remove(), 220);
    }

    _repositionAllPieces() {
      this.pieceEls.forEach((entry, sq) => this._positionPiece(entry.el, sq));
    }

    setLastMove(lm) {
      this.lastMove = lm;
      this._renderHighlights();
    }
    setCheck(sq) {
      this.checkSquare = sq;
      this._renderHighlights();
    }

    highlightLegal(squares) {
      this.legalForSelected = squares || [];
      this._renderHighlights();
    }

    selectSquare(sq) {
      this.selected = sq;
      this._renderHighlights();
    }

    _renderHighlights() {
      Object.values(this.squares).forEach((s) => {
        s.classList.remove("last", "sel", "check", "has-piece");
        const dot = s.querySelector(".move-dot");
        if (dot) dot.remove();
      });
      if (this.lastMove) {
        this.squares[this.lastMove.from]?.classList.add("last");
        this.squares[this.lastMove.to]?.classList.add("last");
      }
      if (this.selected) {
        this.squares[this.selected]?.classList.add("sel");
      }
      if (this.checkSquare) {
        this.squares[this.checkSquare]?.classList.add("check");
      }
      for (const sq of this.legalForSelected) {
        const sel = this.squares[sq];
        if (!sel) continue;
        if (this.position[sq]) sel.classList.add("has-piece");
        const dot = document.createElement("div");
        dot.className = "move-dot";
        sel.appendChild(dot);
      }
    }

    _bindEvents() {
      // Click-to-move (alternative to drag). Handles clicks on squares AND on
      // pieces (pieces are in an overlay layer, so we resolve the underlying
      // square either by data-square on the piece or by hit-testing).
      this.root.addEventListener("click", (e) => {
        if (this._suppressNextClick) {
          this._suppressNextClick = false;
          return;
        }
        const pieceEl = e.target.closest(".piece");
        if (pieceEl) {
          this._handleSquareClick(pieceEl.dataset.square);
          return;
        }
        const sqEl = e.target.closest(".square");
        if (!sqEl) return;
        this._handleSquareClick(sqEl.dataset.square);
      });
    }

    _handleSquareClick(sq) {
      if (this.selected && this.legalForSelected.includes(sq)) {
        const from = this.selected;
        this.selected = null;
        this.legalForSelected = [];
        this._renderHighlights();
        this._tryMove(from, sq);
        return;
      }
      const piece = this.position[sq];
      if (piece) {
        if (this.opts.onSelect) this.opts.onSelect(sq, piece);
      } else {
        this.selected = null;
        this.legalForSelected = [];
        this._renderHighlights();
      }
    }

    _attachDrag(el, entry) {
      el.addEventListener("pointerdown", (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        if (!this.opts.canDrag || !this.opts.canDrag(entry.square, entry)) return;
        e.preventDefault();
        const startSq = entry.square;
        if (this.opts.onSelect) this.opts.onSelect(startSq, entry);
        const rect = this.root.getBoundingClientRect();
        const sqSize = rect.width / 8;
        const startX = e.clientX;
        const startY = e.clientY;
        const baseTransform = el.style.transform;
        // On touch, lift the piece up + scale it so the user can see it
        // above their finger. Mouse: no lift offset.
        const isTouch = e.pointerType === "touch" || e.pointerType === "pen";
        const liftY = isTouch ? -sqSize * 0.9 : 0;
        const scale = isTouch ? 1.6 : 1.0;
        let lastX = startX;
        let lastY = startY;
        let moved = false;

        el.classList.add("dragging");
        try { el.setPointerCapture?.(e.pointerId); } catch (_) {}

        const updateTransform = (cx, cy) => {
          const dx = cx - startX;
          const dy = cy - startY;
          el.style.transform = `${baseTransform} translate(${dx}px, ${dy + liftY}px) scale(${scale})`;
        };
        updateTransform(startX, startY);

        const onMove = (ev) => {
          ev.preventDefault();
          lastX = ev.clientX;
          lastY = ev.clientY;
          if (!moved && (Math.abs(lastX - startX) > 4 || Math.abs(lastY - startY) > 4)) {
            moved = true;
          }
          updateTransform(lastX, lastY);
        };

        const onUp = (ev) => {
          el.classList.remove("dragging");
          el.style.transform = baseTransform;
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          window.removeEventListener("pointercancel", onUp);

          // Use the "logical" finger position (where the piece was visually)
          const cx = (ev.clientX ?? lastX);
          const cy = (ev.clientY ?? lastY) + liftY;
          const x = cx - rect.left;
          const y = cy - rect.top;
          if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            this.selected = null;
            this.legalForSelected = [];
            this._renderHighlights();
            return;
          }
          const fIdx = Math.floor(x / sqSize);
          const rIdx = Math.floor(y / sqSize);
          const f = this.orientation === "w" ? fIdx : 7 - fIdx;
          const r = this.orientation === "w" ? rIdx : 7 - rIdx;
          const dest = coordToSquare(f, r);
          if (dest === startSq) {
            // treat as click — keep selection
            return;
          }
          if (moved) this._suppressNextClick = true;
          if (!this.legalForSelected.includes(dest)) {
            this.selected = null;
            this.legalForSelected = [];
            this._renderHighlights();
            return;
          }
          this.selected = null;
          this.legalForSelected = [];
          this._renderHighlights();
          this._tryMove(startSq, dest);
        };
        window.addEventListener("pointermove", onMove, { passive: false });
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      });
    }

    async _tryMove(from, to) {
      // Promotion check happens at app level via callback; we just pass null and let app re-call.
      let promotion = null;
      const piece = this.position[from];
      if (piece && piece.type === "p") {
        const toRank = parseInt(to[1], 10);
        if ((piece.color === "w" && toRank === 8) || (piece.color === "b" && toRank === 1)) {
          promotion = await this.askPromotion(piece.color);
          if (!promotion) return;
        }
      }
      if (this.opts.onUserMove) this.opts.onUserMove(from, to, promotion);
    }

    askPromotion(color) {
      return new Promise((resolve) => {
        const modal = document.getElementById("promotion-modal");
        const opts = document.getElementById("promo-options");
        opts.innerHTML = "";
        PROMO_PIECES.forEach((p) => {
          const b = document.createElement("button");
          b.style.backgroundImage = `url("${pieceImg(color, p)}")`;
          b.title = p.toUpperCase();
          b.onclick = () => {
            modal.classList.add("hidden");
            resolve(p);
          };
          opts.appendChild(b);
        });
        modal.classList.remove("hidden");
      });
    }
  }

  global.ChessBoard = ChessBoard;
})(window);
