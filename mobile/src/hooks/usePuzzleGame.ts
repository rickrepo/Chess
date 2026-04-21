import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Puzzle, PUZZLES } from "@/data/puzzles";
import { findKing, isCheck, isCheckmate, sanOf } from "@/util/chess";

export interface PuzzleFilter {
  theme: string;
  difficulty: string; // "", "1", "2", "3"
  category: string;
}

export type PuzzleStatus = "playing" | "solved" | "failed";

export interface PuzzleGameState {
  puzzle: Puzzle | null;
  chess: Chess;
  fen: string;
  status: PuzzleStatus;
  elapsedMs: number;
  solutionPly: number;
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  feedback: string | null;
}

export interface UsePuzzleGameOpts {
  filter: PuzzleFilter;
  onSolve: (elapsedSec: number, difficulty: number) => void;
}

export function filteredPuzzles(filter: PuzzleFilter): Puzzle[] {
  return PUZZLES.filter((p) => {
    if (filter.category && p.category !== filter.category) return false;
    if (filter.difficulty && p.difficulty !== (parseInt(filter.difficulty, 10) as 1 | 2 | 3))
      return false;
    if (filter.theme && !p.themes.includes(filter.theme)) return false;
    return true;
  });
}

export function usePuzzleGame(opts: UsePuzzleGameOpts) {
  const { filter, onSolve } = opts;
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const chessRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [status, setStatus] = useState<PuzzleStatus>("playing");
  const [solutionPly, setSolutionPly] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [checkSquare, setCheckSquare] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Timer
  const [startTs, setStartTs] = useState<number>(Date.now());
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    if (status !== "playing") return;
    const iv = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(iv);
  }, [status, startTs]);
  const elapsedMs = status === "playing" ? now - startTs : now - startTs;

  const loadPuzzle = useCallback((p: Puzzle) => {
    chessRef.current = new Chess(p.fen);
    setPuzzle(p);
    setFen(chessRef.current.fen());
    setStatus("playing");
    setSolutionPly(0);
    setLastMove(null);
    setCheckSquare(
      isCheck(chessRef.current) ? findKing(chessRef.current, chessRef.current.turn()) : null
    );
    setFeedback(null);
    setStartTs(Date.now());
    setNow(Date.now());
  }, []);

  const nextPuzzle = useCallback(() => {
    const pool = filteredPuzzles(filter);
    if (pool.length === 0) {
      setFeedback("No puzzles match those filters. Relax them and try again.");
      setPuzzle(null);
      return;
    }
    const remaining = pool.filter((p) => p.id !== puzzle?.id);
    const selectPool = remaining.length ? remaining : pool;
    const next = selectPool[Math.floor(Math.random() * selectPool.length)];
    loadPuzzle(next);
  }, [filter, loadPuzzle, puzzle?.id]);

  const restart = useCallback(() => {
    if (puzzle) loadPuzzle(puzzle);
    else nextPuzzle();
  }, [loadPuzzle, nextPuzzle, puzzle]);

  // Play a user move. Returns true if legal (whether correct or not).
  const playMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!puzzle || status !== "playing") return false;
      const chess = chessRef.current;
      const expected = puzzle.solution[solutionPly];
      const playedUci = from + to + (promotion ?? "");
      const priorFen = chess.fen();

      const move = chess.move({ from, to, promotion });
      if (!move) return false;

      setLastMove({ from: move.from, to: move.to });
      setFen(chess.fen());
      setCheckSquare(isCheck(chess) ? findKing(chess, chess.turn()) : null);

      if (playedUci !== expected) {
        setStatus("failed");
        const expectedSan = sanOf(puzzle.fen, expected);
        setFeedback(`Not the best. The winning move was ${expectedSan}.`);
        return true;
      }

      const nextPly = solutionPly + 1;
      if (nextPly >= puzzle.solution.length) {
        // Solved!
        setSolutionPly(nextPly);
        setStatus("solved");
        const elapsedSec = (Date.now() - startTs) / 1000;
        setFeedback(`Solved in ${elapsedSec.toFixed(1)}s!`);
        onSolve(elapsedSec, puzzle.difficulty);
        return true;
      }

      // Play forced opponent response after a short delay
      setSolutionPly(nextPly);
      setTimeout(() => {
        const oppUci = puzzle.solution[nextPly];
        if (!oppUci) return;
        const oppMove = chess.move({
          from: oppUci.slice(0, 2),
          to: oppUci.slice(2, 4),
          promotion: oppUci[4],
        });
        if (oppMove) {
          setLastMove({ from: oppMove.from, to: oppMove.to });
          setFen(chess.fen());
          setCheckSquare(isCheck(chess) ? findKing(chess, chess.turn()) : null);
          const afterPly = nextPly + 1;
          setSolutionPly(afterPly);
          if (afterPly >= puzzle.solution.length) {
            setStatus("solved");
            const elapsedSec = (Date.now() - startTs) / 1000;
            setFeedback(`Solved in ${elapsedSec.toFixed(1)}s!`);
            onSolve(elapsedSec, puzzle.difficulty);
          }
        }
      }, 450);

      return true;
    },
    [puzzle, solutionPly, status, startTs, onSolve]
  );

  const hintUci = useMemo(() => {
    if (!puzzle || status !== "playing") return null;
    return puzzle.solution[solutionPly] ?? null;
  }, [puzzle, solutionPly, status]);

  const state: PuzzleGameState = {
    puzzle,
    chess: chessRef.current,
    fen,
    status,
    elapsedMs,
    solutionPly,
    lastMove,
    checkSquare,
    feedback,
  };

  return { state, loadPuzzle, nextPuzzle, restart, playMove, hintUci };
}
