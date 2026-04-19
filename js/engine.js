/* Stockfish engine wrapper. 100% local: runs as a Web Worker, no network
   calls during play. Exposes:
     await eng.ready()
     await eng.evaluate(fen, { depth, multiPv })   -> { bestMove, score, mateIn, depth, lines: [{move, scoreCp, mateIn, pv}] }
     eng.stop()
*/
(function (global) {
  const STOCKFISH_URL = "https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js";

  class Engine {
    constructor() {
      this.worker = null;
      this.queue = [];
      this.current = null;
      this.readyPromise = this._init();
    }

    async _init() {
      try {
        this.worker = new Worker(STOCKFISH_URL);
      } catch (e) {
        const shim = `importScripts("${STOCKFISH_URL}");`;
        const blob = new Blob([shim], { type: "application/javascript" });
        this.worker = new Worker(URL.createObjectURL(blob));
      }
      this.worker.onmessage = (e) => this._onLine(e.data);
      this._send("uci");
      await this._waitFor((line) => line === "uciok", 8000);
      this._send("setoption name Threads value 1");
      this._send("setoption name Hash value 16");
      this._send("isready");
      await this._waitFor((line) => line === "readyok", 8000);
    }

    ready() { return this.readyPromise; }

    _send(cmd) { this.worker.postMessage(cmd); }

    _onLine(line) {
      if (typeof line !== "string") return;
      if (this._waiters) {
        for (const w of [...this._waiters]) {
          if (w.match(line)) {
            this._waiters.delete(w);
            w.resolve(line);
          }
        }
      }
      if (!this.current) return;

      if (line.startsWith("info ")) {
        const m = line.match(/depth (\d+).*?(?:multipv (\d+) )?score (cp|mate) (-?\d+).*?\bpv (.+)$/);
        if (m) {
          const depth = parseInt(m[1], 10);
          const multiPv = m[2] ? parseInt(m[2], 10) : 1;
          const scoreType = m[3];
          const scoreVal = parseInt(m[4], 10);
          const pv = m[5].split(" ");
          this.current.lines[multiPv - 1] = {
            depth, scoreType, scoreVal, move: pv[0], pv,
          };
          this.current.lastDepth = Math.max(this.current.lastDepth || 0, depth);
        }
      } else if (line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const best = parts[1];
        const lines = this.current.lines.filter(Boolean);
        const top = lines[0] || {};
        const out = {
          bestMove: best === "(none)" ? null : best,
          score: top.scoreType === "cp" ? top.scoreVal / 100 : null,
          mateIn: top.scoreType === "mate" ? top.scoreVal : null,
          depth: this.current.lastDepth || 0,
          lines: lines.map((ln) => ({
            move: ln.move,
            scoreCp: ln.scoreType === "cp" ? ln.scoreVal : null,
            mateIn: ln.scoreType === "mate" ? ln.scoreVal : null,
            pv: ln.pv,
          })),
        };
        const job = this.current;
        this.current = null;
        job.resolve(out);
        this._drain();
      }
    }

    _waitFor(matchFn, timeoutMs = 5000) {
      if (!this._waiters) this._waiters = new Set();
      return new Promise((resolve, reject) => {
        const w = { match: matchFn, resolve };
        this._waiters.add(w);
        setTimeout(() => {
          if (this._waiters.has(w)) {
            this._waiters.delete(w);
            reject(new Error("engine timeout"));
          }
        }, timeoutMs);
      });
    }

    evaluate(fen, opts = {}) {
      const depth = opts.depth ?? 12;
      const multiPv = opts.multiPv ?? 1;
      return new Promise((resolve) => {
        const job = { fen, depth, multiPv, resolve, lines: [] };
        this.queue.push(job);
        if (!this.current) this._drain();
      });
    }

    _drain() {
      if (this.current || this.queue.length === 0) return;
      this.current = this.queue.shift();
      this._send(`setoption name MultiPV value ${this.current.multiPv}`);
      this._send("ucinewgame");
      this._send(`position fen ${this.current.fen}`);
      this._send(`go depth ${this.current.depth}`);
    }

    stop() {
      if (this.current) this._send("stop");
      this.queue = [];
    }
  }

  global.Engine = Engine;
})(window);
