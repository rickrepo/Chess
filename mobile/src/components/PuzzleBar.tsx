import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import { Puzzle } from "@/data/puzzles";

interface Props {
  puzzle: Puzzle | null;
  elapsedMs: number;
  sessionScore: number;
  bestScore: number;
  solvedCount: number;
  totalFilteredCount: number;
}

export function PuzzleBar({
  puzzle,
  elapsedMs,
  sessionScore,
  bestScore,
  solvedCount,
  totalFilteredCount,
}: Props) {
  const elapsed = (elapsedMs / 1000).toFixed(1);
  const stars = "★".repeat(puzzle?.difficulty ?? 1);
  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <Text style={styles.badge}>{stars}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {puzzle ? puzzle.name : "—"}
        </Text>
        <Text style={styles.timer}>{elapsed}s</Text>
      </View>
      {puzzle?.description ? (
        <Text style={styles.desc} numberOfLines={2}>
          {puzzle.description}
        </Text>
      ) : null}
      <View style={styles.row}>
        <ScorePill label="Session" value={sessionScore} />
        <ScorePill label="Best" value={bestScore} />
        <ScorePill label="Solved" value={`${solvedCount}/${totalFilteredCount}`} />
      </View>
    </View>
  );
}

function ScorePill({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: theme.colors.panel2,
    borderColor: "rgba(217,124,44,0.5)",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warn,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing(3),
    gap: theme.spacing(2),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  badge: {
    color: "#ffc180",
    backgroundColor: "rgba(217,124,44,0.25)",
    borderWidth: 1,
    borderColor: "rgba(217,124,44,0.6)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: 2,
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    flex: 1,
    minWidth: 100,
  },
  timer: {
    color: theme.colors.text,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
    minWidth: 60,
    textAlign: "right",
  },
  desc: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  pill: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1),
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing(1),
  },
  pillLabel: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  pillValue: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
