import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";
import { allCategories, allThemes, DIFFICULTIES } from "@/data/puzzles";
import { PuzzleFilter } from "@/hooks/usePuzzleGame";

interface Props {
  visible: boolean;
  filter: PuzzleFilter;
  totalFiltered: number;
  onChange: (next: PuzzleFilter) => void;
  onClose: () => void;
}

export function FilterSheet({ visible, filter, totalFiltered, onChange, onClose }: Props) {
  const themes = React.useMemo(() => allThemes(), []);
  const categories = React.useMemo(() => allCategories(), []);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Text style={styles.count}>{totalFiltered} puzzles</Text>
          </View>

          <Section label="Difficulty">
            <Chip
              label="Any"
              active={filter.difficulty === ""}
              onPress={() => onChange({ ...filter, difficulty: "" })}
            />
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d}
                label={"★".repeat(d)}
                active={filter.difficulty === String(d)}
                onPress={() => onChange({ ...filter, difficulty: String(d) })}
              />
            ))}
          </Section>

          <Section label="Category">
            <Chip
              label="Any"
              active={filter.category === ""}
              onPress={() => onChange({ ...filter, category: "" })}
            />
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                active={filter.category === c}
                onPress={() => onChange({ ...filter, category: c })}
              />
            ))}
          </Section>

          <Section label="Theme">
            <Chip
              label="Any"
              active={filter.theme === ""}
              onPress={() => onChange({ ...filter, theme: "" })}
            />
            {themes.map((t) => (
              <Chip
                key={t}
                label={t}
                active={filter.theme === t}
                onPress={() => onChange({ ...filter, theme: t })}
              />
            ))}
          </Section>

          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  dismissArea: { flex: 1 },
  sheet: {
    backgroundColor: theme.colors.panel,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    paddingBottom: theme.spacing(8),
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  title: { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: "700" },
  count: { color: theme.colors.muted, fontSize: theme.fontSize.sm },
  section: { gap: theme.spacing(2) },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  chip: {
    backgroundColor: theme.colors.panel2,
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    borderRadius: theme.radius.pill,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
  },
  chipTextActive: {
    color: "#1c1b18",
    fontWeight: "700",
  },
  closeBtn: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing(3),
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing(2),
  },
  closeBtnText: {
    color: "#1c1b18",
    fontWeight: "700",
    fontSize: theme.fontSize.md,
  },
});
