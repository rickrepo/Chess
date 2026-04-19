/* Lichess Opening Explorer wrapper.
   Docs: https://lichess.org/api#tag/Opening-Explorer
   We use the "lichess" database with a rating filter so stats reflect
   real games at the user's rating band.
*/
(function (global) {
  const BASE = "https://explorer.lichess.ovh/lichess";
  const cache = new Map(); // key -> Promise<json>

  // Lichess accepts these rating buckets: 0,1000,1200,1400,1600,1800,2000,2200,2500
  // We pass a comma-separated subset that covers the user's chosen band.
  function ratingBuckets(min, max) {
    const all = [0, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500];
    return all.filter((r) => r >= min && r < max).join(",");
  }

  async function fetchPosition({ fen, ratingMin = 0, ratingMax = 1000, speeds = "blitz,rapid,classical" }) {
    const ratings = ratingBuckets(ratingMin, ratingMax) || "0";
    const params = new URLSearchParams({
      variant: "standard",
      fen,
      speeds,
      ratings,
      moves: "12",
      topGames: "0",
      recentGames: "0",
    });
    const url = `${BASE}?${params.toString()}`;
    if (cache.has(url)) return cache.get(url);
    const p = fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`Lichess explorer: HTTP ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        cache.delete(url);
        throw err;
      });
    cache.set(url, p);
    return p;
  }

  // Pick a move using the empirical distribution of opponent moves at this rating band.
  function sampleWeightedMove(moves) {
    if (!moves || moves.length === 0) return null;
    const total = moves.reduce((s, m) => s + (m.white + m.draws + m.black), 0);
    if (total === 0) return null;
    let r = Math.random() * total;
    for (const m of moves) {
      const w = m.white + m.draws + m.black;
      if (r < w) return m;
      r -= w;
    }
    return moves[moves.length - 1];
  }

  global.LichessExplorer = { fetchPosition, sampleWeightedMove };
})(window);
