#!/usr/bin/env node
/* eslint-disable */
/**
 * Import Lichess puzzle database into our typed puzzle bundle.
 *
 * The Lichess puzzle database (CC0) is a CSV with columns:
 *   PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
 *
 * Key convention: FEN is the position BEFORE the opponent's setup move.
 * The first UCI in `Moves` is played by the opponent (whoever matches the
 * FEN's turn indicator) to REACH the puzzle position. The next move is
 * the user's solution. Remaining moves alternate (opp, user, opp, ...).
 *
 * This script:
 *   - streams the CSV (handles the full ~1GB file without OOM),
 *   - pre-applies the opponent's setup move so our app's FEN shows the
 *     position the solver actually sees,
 *   - trims the solution array to start with the user's first move,
 *   - validates every row with chess.js (drops rows that don't verify),
 *   - samples N puzzles balanced across difficulty buckets / themes,
 *   - emits `src/data/lichess-puzzles.ts` for the app to import.
 *
 * Usage:
 *   # Get the CSV (one-time, ~300MB zstd -> ~1GB CSV):
 *   curl -L -o lichess_puzzle.csv.zst https://database.lichess.org/lichess_db_puzzle.csv.zst
 *   zstd -d lichess_puzzle.csv.zst
 *
 *   # Run the importer (defaults: 2000 puzzles, rating 700-1400, any theme):
 *   node scripts/import-lichess-puzzles.js lichess_db_puzzle.csv
 *
 *   # Customize:
 *   node scripts/import-lichess-puzzles.js lichess_db_puzzle.csv \
 *     --count 3000 --min-rating 600 --max-rating 1600 \
 *     --themes mateIn1,mateIn2,fork,pin,skewer
 *
 * Database license: CC0 (public domain).
 * https://database.lichess.org/#puzzles
 */

const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { Chess } = require("chess.js");

function parseArgs(argv) {
  const args = {
    input: null,
    output: path.join(__dirname, "..", "src", "data", "lichess-puzzles.ts"),
    count: 2000,
    minRating: 700,
    maxRating: 1400,
    themes: null, // comma-separated whitelist; null = any
    seed: 42,
  };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--count") args.count = parseInt(rest[++i], 10);
    else if (a === "--min-rating") args.minRating = parseInt(rest[++i], 10);
    else if (a === "--max-rating") args.maxRating = parseInt(rest[++i], 10);
    else if (a === "--themes") args.themes = rest[++i].split(",").map((s) => s.trim());
    else if (a === "--output") args.output = rest[++i];
    else if (a === "--seed") args.seed = parseInt(rest[++i], 10);
    else if (!args.input && !a.startsWith("--")) args.input = a;
    else throw new Error(`unknown arg: ${a}`);
  }
  if (!args.input) {
    console.error("usage: import-lichess-puzzles.js <lichess_db_puzzle.csv> [options]");
    process.exit(2);
  }
  return args;
}

// Deterministic PRNG (mulberry32) so the sampled bundle is reproducible.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Bucket key from rating so we sample evenly across the range.
function bucketFor(rating, minR, maxR) {
  const buckets = 10;
  const clamped = Math.max(minR, Math.min(maxR, rating));
  const idx = Math.floor(((clamped - minR) / Math.max(1, maxR - minR)) * buckets);
  return Math.min(buckets - 1, Math.max(0, idx));
}

function tryMove(c, uci) {
  try {
    const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    return m || null;
  } catch (_) {
    return null;
  }
}

// Given a Lichess row (FEN is pre-setup, Moves[0] is the opponent's setup
// move), return { fen: post-setup FEN, solution: user-first ply list }.
// Returns null if any move is illegal or the FEN fails to parse.
function transformRow(fen, movesStr) {
  const moves = movesStr.split(" ");
  if (moves.length === 0) return null;
  let c;
  try {
    c = new Chess(fen);
  } catch (_) {
    return null;
  }
  const mSetup = tryMove(c, moves[0]);
  if (!mSetup) return null;
  const solverFen = c.fen();
  const solution = moves.slice(1);
  const verify = new Chess(solverFen);
  for (const u of solution) {
    if (!tryMove(verify, u)) return null;
  }
  return { fen: solverFen, solution };
}

function deriveCategoryAndDifficulty(themes, rating) {
  const t = new Set(themes);
  let category = "Tactic";
  if (t.has("mateIn1")) category = "Mate in 1";
  else if (t.has("mateIn2")) category = "Mate in 2";
  else if (t.has("mateIn3")) category = "Mate in 3";
  else if (t.has("mate")) category = "Mate";
  // Difficulty 1..3 from rating bands.
  const difficulty = rating < 900 ? 1 : rating < 1200 ? 2 : 3;
  return { category, difficulty };
}

// Priority themes — if a row has one of these we prefer to keep it.
const PRIORITY_THEMES = new Set([
  "mateIn1", "mateIn2", "backRankMate", "smotheredMate", "hookMate",
  "fork", "pin", "skewer", "discoveredAttack", "doubleAttack",
  "sacrifice", "deflection", "attraction", "clearance",
]);

async function main() {
  const args = parseArgs(process.argv);
  console.error(
    `Importing from ${args.input}, filter rating ${args.minRating}-${args.maxRating}, want ${args.count} puzzles…`
  );
  const allowedThemes = args.themes ? new Set(args.themes) : null;

  const rand = mulberry32(args.seed);
  // Reservoir-ish sampling per (difficulty bucket × theme-priority) so we get
  // a balanced spread.
  const BUCKETS = 10;
  const perBucketCap = Math.ceil(args.count / BUCKETS) + 20;
  const buckets = Array.from({ length: BUCKETS }, () => []);

  const rl = readline.createInterface({
    input: fs.createReadStream(args.input),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  let kept = 0;
  let rejectedLegal = 0;
  let rejectedTheme = 0;
  let rejectedRating = 0;
  for await (const line of rl) {
    lineNo++;
    if (lineNo === 1) continue; // header
    if (!line) continue;
    const cols = line.split(",");
    if (cols.length < 8) continue;
    const [puzzleId, fen, moves, ratingStr, _rd, _pop, _nb, themesStr] = cols;
    const rating = parseInt(ratingStr, 10);
    if (!rating || rating < args.minRating || rating > args.maxRating) {
      rejectedRating++;
      continue;
    }
    const themes = themesStr ? themesStr.split(" ") : [];
    if (allowedThemes && !themes.some((t) => allowedThemes.has(t))) {
      rejectedTheme++;
      continue;
    }
    const transformed = transformRow(fen, moves);
    if (!transformed) {
      rejectedLegal++;
      continue;
    }
    const { category, difficulty } = deriveCategoryAndDifficulty(themes, rating);
    const hasPriority = themes.some((t) => PRIORITY_THEMES.has(t));
    const bkt = bucketFor(rating, args.minRating, args.maxRating);
    const bucket = buckets[bkt];
    const row = {
      id: `l-${puzzleId}`,
      name: category,
      category,
      themes,
      difficulty,
      fen: transformed.fen,
      solution: transformed.solution,
      description: `${category} puzzle — rated ${rating}.`,
      priority: hasPriority,
      rating,
    };
    if (bucket.length < perBucketCap) {
      bucket.push(row);
      kept++;
    } else {
      // Reservoir replacement; favor priority themes.
      const idx = Math.floor(rand() * (lineNo + 1));
      if (idx < perBucketCap) {
        const target = bucket[idx];
        if (!target.priority || row.priority) {
          bucket[idx] = row;
        }
      }
    }
    if (lineNo % 50000 === 0) {
      console.error(
        `  read ${lineNo.toLocaleString()} rows, kept ${kept}, rej rating=${rejectedRating} theme=${rejectedTheme} legal=${rejectedLegal}`
      );
    }
  }

  // Flatten + shuffle deterministically + trim to count.
  const all = [].concat(...buckets);
  // Prefer priority rows first but still mix them in.
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const selected = all.slice(0, args.count).map(({ priority, rating, ...rest }) => rest);

  const out = `// AUTO-GENERATED by scripts/import-lichess-puzzles.js — do not edit by hand.
// Source: https://database.lichess.org/#puzzles (CC0 public domain).
// Regenerate with:
//   node scripts/import-lichess-puzzles.js <path/to/lichess_db_puzzle.csv>

import { Puzzle } from "./puzzles";

export const LICHESS_PUZZLES: Puzzle[] = ${JSON.stringify(selected, null, 2)} as Puzzle[];
`;
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, out);
  console.error(`\nWrote ${selected.length} puzzles to ${args.output}`);
  console.error(
    `Total read: ${lineNo - 1}. Rejected: rating=${rejectedRating}, theme=${rejectedTheme}, legality=${rejectedLegal}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
