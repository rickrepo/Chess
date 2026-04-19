/* Stockfish engine wrapper.
   We load stockfish.js via CDN as a Web Worker. Communicates over UCI.
   Public API:
     const eng = new Engine();
     await eng.ready();
     const { score, bestMove, pv } = await eng.evaluate(fen, { depth: 12 });
     eng.stop();
*/
(function (global) {
  // Use jsdelivr-hosted stockfish.js (single-threaded, asm.js + wasm).
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
        // Some browsers block cross-origin workers; fall back to a Blob shim
        // that imports the script.
        const shim = `importScripts("${STOCKFISH_URL}");`;
        const blob = new Blob([shim], { type: "application/javascript" });
        this.worker = new Worker(URL.createObjectURL(blob));
      }
      this.worker.onmessage = (e) => this._onLine(e.data);
      this._send("uci");
      await this._waitFor((line) => line === "uciok", 5000);
      this._send("setoption name Threads value 1");
      this._send("setoption name Hash value 16");
      this._send("isready");
      await this._waitFor((line) => line === "readyok", 5000);
    }

    ready() { return this.readyPromise; }

    _send(cmd) {
      this.worker.postMessage(cmd);
    }

    _onLine(line) {
      if (typeof line !== "string") return;
      // Ad-hoc waiters
      if (this._waiters) {
        for (const w of [...this._waiters]) {
          if (w.match(line)) {
            this._waiters.delete(w);
            w.resolve(line);
          }
        }
      }
      if (this.current) {
        if (line.startsWith("info ")) {
          // parse score and pv
          const m = line.match(/depth (\d+).*?score (cp|mate) (-?\d+).*?\bpv (.+)$/);
          if (m) {
            this.current.lastInfo = {
              depth: parseInt(m[1], 10),
              scoreType: m[2],
              scoreValue: parseInt(m[3], 10),
              pv: m[4].split(" "),
            };
            if (this.current.onInfo) this.current.onInfo(this.current.lastInfo);
          }
        } else if (line.startsWith("bestmove")) {
          const parts = line.split(" ");
          const best = parts[1];
          const info = this.current.lastInfo || { depth: 0, scoreType: "cp", scoreValue: 0, pv: [] };
          const out = {
            bestMove: best === "(none)" ? null : best,
            score: info.scoreType === "cp" ? info.scoreValue / 100 : null,
            mateIn: info.scoreType === "mate" ? info.scoreValue : null,
            depth: info.depth,
            pv: info.pv,
          };
          this.current.resolve(out);
          this.current = null;
          this._drain();
        }
      }
    }

    _waitFor(matchFn, timeoutMs = 3000) {
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
      return new Promise((resolve) => {
        const job = { fen, depth, resolve, onInfo: opts.onInfo, lastInfo: null };
        this.queue.push(job);
        if (!this.current) this._drain();
      });
    }

    _drain() {
      if (this.current || this.queue.length === 0) return;
      this.current = this.queue.shift();
      this._send("ucinewgame");
      this._send(`position fen ${this.current.fen}`);
      this._send(`go depth ${this.current.depth}`);
    }

    stop() {
      if (this.current) {
        this._send("stop");
      }
      this.queue = [];
    }
  }

  global.Engine = Engine;
})(window);
