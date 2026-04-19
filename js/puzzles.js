/* Curated puzzle bank.
   Every FEN + solution has been strictly validated against chess.js:
   - the starting position is legal (opponent's king not already in check),
   - every solution move is legal,
   - the final position is actually checkmate.

   Each puzzle:
     id          - unique key
     name        - display name
     category    - "Mate in 1" | "Mate in 2" | "Tactic" (for filtering)
     themes      - extra tags ("back-rank", "smothered", ...) for theme filtering
     difficulty  - 1..5 (scoring multiplier)
     fen         - starting position; side to move is the SOLVER
     solution    - array of plies [user, opp, user, ...]. For mate-in-1, just [user].
     description - shown above the board
*/
(function (global) {
  const PUZZLES = [
    // ===== ★1 (easy) =====
    {
      id: "p-back-rank",
      name: "Back-rank classic",
      category: "Mate in 1",
      themes: ["back-rank"],
      difficulty: 1,
      fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
      solution: ["d1d8"],
      description: "White to mate in 1. The king is trapped behind its own pawns.",
    },
    {
      id: "p-corner-queen",
      name: "Corner the king",
      category: "Mate in 1",
      themes: ["queen+king", "corner"],
      difficulty: 1,
      fen: "7k/8/6K1/Q7/8/8/8/8 w - - 0 1",
      solution: ["a5a8"],
      description: "White to mate in 1. K+Q vs. K — the queen delivers, the king covers the escape squares.",
    },
    {
      id: "p-two-rooks",
      name: "Two rooks ladder",
      category: "Mate in 1",
      themes: ["ladder", "back-rank"],
      difficulty: 1,
      fen: "6k1/8/6K1/8/8/8/8/R6R w - - 0 1",
      solution: ["a1a8"],
      description: "White to mate in 1. Two rooks team up — one holds the escape, the other mates.",
    },
    {
      id: "p-double-rook",
      name: "7th rank + 8th rank",
      category: "Mate in 1",
      themes: ["ladder", "back-rank"],
      difficulty: 1,
      fen: "6k1/7R/6K1/8/8/8/8/R7 w - - 0 1",
      solution: ["a1a8"],
      description: "White to mate in 1. The rook on the 7th covers the escape; bring the other one home.",
    },
    {
      id: "p-edge-rook",
      name: "Cornered king",
      category: "Mate in 1",
      themes: ["edge", "corner"],
      difficulty: 1,
      fen: "k7/8/1K6/8/8/8/8/5R2 w - - 0 1",
      solution: ["f1f8"],
      description: "White to mate in 1. The black king is in the corner — the rook slams the door.",
    },
    {
      id: "p-queen-close",
      name: "King + queen close mate",
      category: "Mate in 1",
      themes: ["queen+king"],
      difficulty: 1,
      fen: "7k/5K2/6Q1/8/8/8/8/8 w - - 0 1",
      solution: ["g6g8"],
      description: "White to mate in 1. The kings face off and the queen delivers.",
    },

    // ===== ★2 (medium) =====
    {
      id: "p-smothered",
      name: "Smothered mate",
      category: "Mate in 1",
      themes: ["smothered", "knight"],
      difficulty: 2,
      fen: "6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1",
      solution: ["e5f7"],
      description: "White to mate in 1. The king is surrounded by its own pieces — a knight slips where it can't escape.",
    },
    {
      id: "p-q-knight",
      name: "Queen + knight assault",
      category: "Mate in 1",
      themes: ["smothered", "knight"],
      difficulty: 2,
      fen: "6rk/6pp/8/6NQ/8/8/8/6K1 w - - 0 1",
      solution: ["h5h7"],
      description: "White to mate in 1. The knight defends the queen so the king can't capture it.",
    },
    {
      id: "p-knight-rook",
      name: "Knight + rook net",
      category: "Mate in 1",
      themes: ["knight", "edge"],
      difficulty: 2,
      fen: "4k3/3N4/4K3/8/8/8/8/7R w - - 0 1",
      solution: ["h1h8"],
      description: "White to mate in 1. The knight controls the escape squares.",
    },
    {
      id: "p-queenb",
      name: "King-supported queen mate",
      category: "Mate in 1",
      themes: ["queen+king", "edge"],
      difficulty: 2,
      fen: "7k/2Q5/6K1/8/8/8/8/8 w - - 0 1",
      solution: ["c7h7"],
      description: "White to mate in 1. The white king covers h8's neighbour; the queen mates on the rank.",
    },
    {
      id: "p-double-att",
      name: "Opposition mate",
      category: "Mate in 1",
      themes: ["queen+king"],
      difficulty: 2,
      fen: "7k/5Q2/7K/8/8/8/8/8 w - - 0 1",
      solution: ["f7g7"],
      description: "White to mate in 1. Direct queen + king opposition.",
    },
    {
      id: "p-epaulette",
      name: "Épaulette mate",
      category: "Mate in 1",
      themes: ["pawn-block", "edge"],
      difficulty: 2,
      fen: "5k2/5P2/5K2/8/8/8/8/6R1 w - - 0 1",
      solution: ["g1g8"],
      description: "White to mate in 1. The pawn blocks the king's escape — classic épaulette pattern.",
    },

    // ===== ★3 (harder) =====
    {
      id: "p-long-diag",
      name: "Long-diagonal sweep",
      category: "Mate in 1",
      themes: ["diagonal", "back-rank"],
      difficulty: 3,
      fen: "6k1/5ppp/8/8/8/7Q/5PPP/6K1 w - - 0 1",
      solution: ["h3c8"],
      description: "White to mate in 1. The queen sweeps down the long diagonal.",
    },
    {
      id: "p-bishop-help",
      name: "Knight-defended queen",
      category: "Mate in 1",
      themes: ["knight", "queen", "corner"],
      difficulty: 3,
      fen: "7k/6p1/5N2/5Q2/8/8/8/6K1 w - - 0 1",
      solution: ["f5h7"],
      description: "White to mate in 1. Find the square where the knight defends the queen.",
    },
    {
      id: "p-pin-mate",
      name: "Knight pins & rook captures",
      category: "Mate in 1",
      themes: ["pin", "back-rank"],
      difficulty: 3,
      fen: "r6k/6pp/8/4N3/8/8/8/R6K w - - 0 1",
      solution: ["a1a8"],
      description: "White to mate in 1. Trade rooks on the back rank — the knight blocks the escape.",
    },
  ];

  const CATEGORIES = ["Mate in 1"]; // mate-in-2 / tactics coming soon
  const DIFFICULTIES = [1, 2, 3];

  global.PUZZLES = PUZZLES;
  global.PUZZLE_CATEGORIES = CATEGORIES;
  global.PUZZLE_DIFFICULTIES = DIFFICULTIES;
})(window);
