import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { ChessBoard } from "@/components/ChessBoard";
import { PuzzleBar } from "@/components/PuzzleBar";
import { HintBanner } from "@/components/HintBanner";
import { FilterSheet } from "@/components/FilterSheet";
import { useAsyncStorage } from "@/hooks/useAsyncStorage";
import { filteredPuzzles, PuzzleFilter, usePuzzleGame } from "@/hooks/usePuzzleGame";
import { theme } from "@/theme";
import { sanOf } from "@/util/chess";

function Screen() {
  const insets = useSafeAreaInsets();
  const [bestScore, setBestScore] = useAsyncStorage<number>("opener.puzzle.best", 0);
  const [sessionScore, setSessionScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [filter, setFilter, filterLoaded] = useAsyncStorage<PuzzleFilter>(
    "opener.puzzle.filter",
    { theme: "", difficulty: "", category: "" }
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [hintsOn, setHintsOn] = useState(true);

  const onSolve = useCallback(
    (elapsedSec: number, difficulty: number) => {
      const base = 100 * difficulty;
      const timeFactor = Math.max(0.2, 1 - elapsedSec / 60);
      const gained = Math.round(base * timeFactor);
      setSessionScore((s) => {
        const next = s + gained;
        if (next > bestScore) setBestScore(next);
        return next;
      });
      setSolvedCount((n) => n + 1);
    },
    [bestScore, setBestScore]
  );

  const { state, nextPuzzle, restart, playMove, hintUci } = usePuzzleGame({
    filter,
    onSolve,
  });

  // Start first puzzle once filters have loaded from storage.
  useEffect(() => {
    if (filterLoaded && !state.puzzle) {
      nextPuzzle();
    }
  }, [filterLoaded, state.puzzle, nextPuzzle]);

  // Whenever the filter changes (theme/difficulty/category), pick a new puzzle
  // from the filtered pool so the player isn't stuck on one out-of-filter.
  const filterKey = `${filter.theme}|${filter.difficulty}|${filter.category}`;
  useEffect(() => {
    if (filterLoaded) nextPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, filterLoaded]);

  const filteredCount = useMemo(() => filteredPuzzles(filter).length, [filter]);

  const { width, height } = Dimensions.get("window");
  const maxBoard = Math.min(width - 20, height - 360);
  const boardSize = Math.max(260, maxBoard);

  const hintSan = hintUci && state.puzzle ? sanOf(state.fen, hintUci) : null;
  const hintPlayable = !!hintUci && state.status === "playing";

  // Solver side = whose move it is in the starting FEN (doesn't change as
  // the puzzle progresses, so the board stays oriented).
  const solverSide: "w" | "b" = state.puzzle
    ? ((state.puzzle.fen.split(" ")[1] as "w" | "b") ?? "w")
    : "w";

  const statusText = (() => {
    if (state.status === "solved") return state.feedback ?? "Solved!";
    if (state.status === "failed") return state.feedback ?? "Incorrect.";
    return "Your move.";
  })();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.brand}>♞ Chess Puzzles</Text>
          <Pressable
            onPress={() => setFilterOpen(true)}
            style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.filterBtnText}>Filters ({filteredCount})</Text>
          </Pressable>
        </View>

        <PuzzleBar
          puzzle={state.puzzle}
          elapsedMs={state.elapsedMs}
          sessionScore={sessionScore}
          bestScore={bestScore}
          solvedCount={solvedCount}
          totalFilteredCount={filteredCount}
        />

        <HintBanner
          san={hintSan}
          note={statusText}
          playable={hintPlayable && hintsOn}
          onPress={() => {
            if (!hintUci) return;
            playMove(hintUci.slice(0, 2), hintUci.slice(2, 4), hintUci[4]);
          }}
        />

        <View style={styles.boardWrap}>
          <ChessBoard
            fen={state.fen}
            chess={state.chess}
            orientation={solverSide}
            boardSize={boardSize}
            interactive={state.status === "playing"}
            lastMove={state.lastMove}
            checkSquare={state.checkSquare}
            hintUci={hintUci}
            hintsOn={hintsOn}
            onMove={(from, to, promotion) => playMove(from, to, promotion)}
          />
        </View>

        <View style={styles.controls}>
          <ControlBtn
            label={hintsOn ? "Hide hints" : "Show hints"}
            onPress={() => setHintsOn((v) => !v)}
          />
          <ControlBtn label="Restart" onPress={restart} />
          <ControlBtn
            label={state.status === "playing" ? "Skip" : "Next puzzle"}
            primary
            onPress={nextPuzzle}
          />
        </View>
      </ScrollView>

      <FilterSheet
        visible={filterOpen}
        filter={filter}
        totalFiltered={filteredCount}
        onChange={(next) => setFilter(next)}
        onClose={() => setFilterOpen(false)}
      />

      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
    </View>
  );
}

function ControlBtn({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ctrlBtn,
        primary && styles.ctrlBtnPrimary,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.ctrlBtnText, primary && styles.ctrlBtnTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Screen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    padding: theme.spacing(3),
    gap: theme.spacing(3),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: theme.colors.text,
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
  },
  filterBtn: {
    backgroundColor: theme.colors.panel2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
  },
  filterBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
  boardWrap: {
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    gap: theme.spacing(2),
    justifyContent: "space-between",
  },
  ctrlBtn: {
    flex: 1,
    backgroundColor: theme.colors.panel2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing(3),
    alignItems: "center",
  },
  ctrlBtnPrimary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  ctrlBtnText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
  ctrlBtnTextPrimary: {
    color: "#1c1b18",
    fontWeight: "700",
  },
});
