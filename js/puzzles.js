/* Curated puzzle bank for the Puzzles mode.
   Each puzzle solution is a sequence of plies: [userMove, oppResponse, userMove, ...]
   For mate-in-1 puzzles the solution is just [userMove].
   Every FEN + solution has been validated against chess.js. */
(function (global) {
  const PUZZLES = [
    {
      id: "p-back-rank",
      name: "Back-rank classic",
      category: "Mate in 1",
      difficulty: 1,
      fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
      solution: ["d1d8"],
      description: "White to mate in 1. The king is trapped behind its own pawns.",
    },
    {
      id: "p-corner-queen",
      name: "Corner the king",
      category: "Mate in 1",
      difficulty: 1,
      fen: "7k/8/6K1/8/8/8/8/Q7 w - - 0 1",
      solution: ["a1a8"],
      description: "White to mate in 1. K+Q vs. K — the queen delivers, the king covers escape squares.",
    },
    {
      id: "p-two-rooks",
      name: "Two rooks ladder",
      category: "Mate in 1",
      difficulty: 1,
      fen: "7k/8/6K1/8/8/8/8/R6R w - - 0 1",
      solution: ["a1a8"],
      description: "White to mate in 1. Rook to the back rank — the king's escape is cut off.",
    },
    {
      id: "p-smothered",
      name: "Smothered mate",
      category: "Mate in 1",
      difficulty: 2,
      fen: "6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1",
      solution: ["e5f7"],
      description: "White to mate in 1. The black king is surrounded by its own pieces — a knight finishes the job.",
    },
    {
      id: "p-q-knight",
      name: "Queen + knight assault",
      category: "Mate in 1",
      difficulty: 2,
      fen: "6rk/6pp/8/6NQ/8/8/8/6K1 w - - 0 1",
      solution: ["h5h7"],
      description: "White to mate in 1. The knight defends the queen so the king can't capture it.",
    },
    {
      id: "p-support-mate",
      name: "King-supported mate",
      category: "Mate in 1",
      difficulty: 2,
      fen: "7k/6pp/6K1/8/8/8/8/7Q w - - 0 1",
      solution: ["h1h7"],
      description: "White to mate in 1. The white king supports the queen's killing blow.",
    },
    {
      id: "p-ra7-mate",
      name: "7th-rank net",
      category: "Mate in 1",
      difficulty: 2,
      fen: "7k/R7/6K1/8/8/8/8/R7 w - - 0 1",
      solution: ["a7a8"],
      description: "White to mate in 1. One rook holds the 7th rank; the other delivers on the 8th.",
    },
    {
      id: "p-long-diag",
      name: "Long-diagonal mate",
      category: "Mate in 1",
      difficulty: 3,
      fen: "6k1/5ppp/8/8/8/7Q/5PPP/6K1 w - - 0 1",
      solution: ["h3c8"],
      description: "White to mate in 1. The queen sweeps down the long diagonal.",
    },
  ];

  global.PUZZLES = PUZZLES;
})(window);
