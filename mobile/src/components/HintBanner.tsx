import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme";

interface Props {
  san: string | null;
  note?: string;
  playable: boolean;
  onPress?: () => void;
}

export function HintBanner({ san, note, playable, onPress }: Props) {
  const visible = !!san;
  return (
    <View style={[styles.container, !visible && styles.hidden]}>
      <Pressable
        disabled={!playable}
        onPress={onPress}
        style={({ pressed }) => [
          styles.banner,
          pressed && playable && styles.bannerPressed,
        ]}
      >
        <Text style={styles.label}>PLAY</Text>
        <Text style={styles.san}>{san ?? "—"}</Text>
        {note ? (
          <Text style={styles.note} numberOfLines={2}>
            {note}
          </Text>
        ) : null}
        {playable ? <Text style={styles.tap}>TAP TO PLAY</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
  },
  hidden: {
    opacity: 0,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(3),
    backgroundColor: "rgba(106,168,79,0.18)",
    borderWidth: 1,
    borderColor: "rgba(106,168,79,0.6)",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    borderRadius: theme.radius.md,
  },
  bannerPressed: {
    backgroundColor: "rgba(106,168,79,0.32)",
  },
  label: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.accent2,
    letterSpacing: 1,
    fontWeight: "700",
  },
  san: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.accent2,
    fontWeight: "800",
  },
  note: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
  tap: {
    color: theme.colors.accent2,
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.8,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(167,200,122,0.5)",
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: 2,
    marginLeft: "auto",
  },
});
