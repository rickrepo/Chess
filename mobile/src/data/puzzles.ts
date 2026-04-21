/**
 * Curated puzzle bank — same data as the web version.
 * Every FEN + solution validated against chess.js:
 *   - starting position is legal (side-not-to-move NOT in check),
 *   - every solution move is legal,
 *   - the final position is actually checkmate.
 *
 * Also concatenates the Lichess-imported bundle (if generated — see
 * scripts/import-lichess-puzzles.js). The placeholder bundle is empty
 * until the user runs the importer.
 */
import { LICHESS_PUZZLES } from "./lichess-puzzles";

export interface Puzzle {
  id: string;
  name: string;
  category: string; // free-form: "Mate in 1" | "Mate in 2" | "Mate in 3" | "Mate" | "Tactic"
  themes: string[];
  difficulty: 1 | 2 | 3;
  fen: string;
  solution: string[]; // UCI moves: [user, opp, user, ...]
  description: string;
}

const CURATED_PUZZLES: Puzzle[] = [
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
    description:
      "White to mate in 1. K+Q vs. K — the queen delivers, the king covers the escape squares.",
  },
  {
    id: "p-two-rooks",
    name: "Two rooks ladder",
    category: "Mate in 1",
    themes: ["ladder", "back-rank"],
    difficulty: 1,
    fen: "6k1/8/6K1/8/8/8/8/R6R w - - 0 1",
    solution: ["a1a8"],
    description: "White to mate in 1. Two rooks team up.",
  },
  {
    id: "p-double-rook",
    name: "7th + 8th rank",
    category: "Mate in 1",
    themes: ["ladder", "back-rank"],
    difficulty: 1,
    fen: "6k1/7R/6K1/8/8/8/8/R7 w - - 0 1",
    solution: ["a1a8"],
    description: "White to mate in 1. The rook on the 7th covers escape; bring the other home.",
  },
  {
    id: "p-edge-rook",
    name: "Cornered king",
    category: "Mate in 1",
    themes: ["edge", "corner"],
    difficulty: 1,
    fen: "k7/8/1K6/8/8/8/8/5R2 w - - 0 1",
    solution: ["f1f8"],
    description: "White to mate in 1. Rook slams the door on the corner.",
  },
  {
    id: "p-queen-close",
    name: "Close-quarters mate",
    category: "Mate in 1",
    themes: ["queen+king"],
    difficulty: 1,
    fen: "7k/5K2/6Q1/8/8/8/8/8 w - - 0 1",
    solution: ["g6g8"],
    description: "White to mate in 1. Kings face off and the queen delivers.",
  },
  {
    id: "p-smothered",
    name: "Smothered mate",
    category: "Mate in 1",
    themes: ["smothered", "knight"],
    difficulty: 2,
    fen: "6rk/6pp/8/4N3/8/8/8/6K1 w - - 0 1",
    solution: ["e5f7"],
    description:
      "White to mate in 1. The king is surrounded by its own pieces — a knight slips where it can't escape.",
  },
  {
    id: "p-q-knight",
    name: "Queen + knight assault",
    category: "Mate in 1",
    themes: ["smothered", "knight"],
    difficulty: 2,
    fen: "6rk/6pp/8/6NQ/8/8/8/6K1 w - - 0 1",
    solution: ["h5h7"],
    description: "White to mate in 1. Knight defends the queen so the king can't capture it.",
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
    name: "King-supported queen",
    category: "Mate in 1",
    themes: ["queen+king", "edge"],
    difficulty: 2,
    fen: "7k/2Q5/6K1/8/8/8/8/8 w - - 0 1",
    solution: ["c7h7"],
    description: "White to mate in 1. Queen delivers on the rank, king covers h8's neighbour.",
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
    description: "White to mate in 1. Pawn blocks the king's escape — classic épaulette pattern.",
  },
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
    name: "Rook captures rook",
    category: "Mate in 1",
    themes: ["pin", "back-rank"],
    difficulty: 3,
    fen: "r6k/6pp/8/4N3/8/8/8/R6K w - - 0 1",
    solution: ["a1a8"],
    description: "White to mate in 1. Trade rooks on the back rank — the knight blocks escape.",
  },
];

export const PUZZLES: Puzzle[] = [...CURATED_PUZZLES, ...LICHESS_PUZZLES];

export const DIFFICULTIES: ReadonlyArray<1 | 2 | 3> = [1, 2, 3];

export function allThemes(): string[] {
  const set = new Set<string>();
  for (const p of PUZZLES) p.themes.forEach((t) => set.add(t));
  return [...set].sort();
}

export function allCategories(): string[] {
  const set = new Set<string>();
  for (const p of PUZZLES) set.add(p.category);
  return [...set].sort();
}
