import React, { useMemo, useRef, useEffect } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Chess } from "chess.js";
import { theme } from "@/theme";
import {
  FILES,
  coordToSquare,
  legalMovesFrom,
  piecesFromFen,
  squareToCoord,
} from "@/util/chess";
import { PIECE_COLORS, glyph } from "@/util/pieces";

interface Props {
  fen: string;
  chess: Chess;
  orientation: "w" | "b";
  boardSize: number;
  interactive: boolean;
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  hintUci: string | null;
  hintsOn: boolean;
  onMove: (from: string, to: string, promotion?: string) => boolean;
}

export function ChessBoard({
  fen,
  chess,
  orientation,
  boardSize,
  interactive,
  lastMove,
  checkSquare,
  hintUci,
  hintsOn,
  onMove,
}: Props) {
  const sqSize = boardSize / 8;
  const pieces = useMemo(() => piecesFromFen(fen), [fen]);

  const [selected, setSelected] = React.useState<string | null>(null);
  const [legalTargets, setLegalTargets] = React.useState<string[]>([]);

  // Clear selection when position changes
  useEffect(() => {
    setSelected(null);
    setLegalTargets([]);
  }, [fen]);

  const hintFrom = hintsOn && hintUci ? hintUci.slice(0, 2) : null;
  const hintTo = hintsOn && hintUci ? hintUci.slice(2, 4) : null;

  const orient = (sq: string) => {
    const { file, rank } = squareToCoord(sq);
    return {
      f: orientation === "w" ? file : 7 - file,
      r: orientation === "w" ? rank : 7 - rank,
    };
  };

  const handleSquarePress = (sq: string) => {
    if (!interactive) return;
    const piece = pieces[sq];

    // Play hint directly if user taps source/dest of active hint.
    if (!selected && hintUci) {
      if (sq === hintUci.slice(0, 2) || sq === hintUci.slice(2, 4)) {
        const from = hintUci.slice(0, 2);
        const to = hintUci.slice(2, 4);
        const promo = hintUci[4];
        onMove(from, to, promo);
        return;
      }
    }

    if (selected && legalTargets.includes(sq)) {
      onMove(selected, sq);
      setSelected(null);
      setLegalTargets([]);
      return;
    }

    if (piece && piece.color === chess.turn()) {
      setSelected(sq);
      setLegalTargets(legalMovesFrom(chess, sq));
      return;
    }

    setSelected(null);
    setLegalTargets([]);
  };

  // Build 64 squares
  const squares: { sq: string; light: boolean; f: number; r: number }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = coordToSquare(f, r);
      const { f: vf, r: vr } = orient(sq);
      squares.push({ sq, light: (r + f) % 2 === 0, f: vf, r: vr });
    }
  }

  return (
    <View
      style={[
        styles.board,
        { width: boardSize, height: boardSize, borderRadius: theme.radius.md },
      ]}
    >
      {squares.map(({ sq, light, f, r }) => {
        const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
        const isSel = selected === sq;
        const isHintFrom = hintFrom === sq;
        const isHintTo = hintTo === sq;
        const isCheck = checkSquare === sq;
        const isLegalDest = legalTargets.includes(sq);
        return (
          <Pressable
            key={sq}
            onPress={() => handleSquarePress(sq)}
            style={[
              styles.square,
              {
                width: sqSize,
                height: sqSize,
                left: f * sqSize,
                top: r * sqSize,
                backgroundColor: light ? theme.colors.lightSq : theme.colors.darkSq,
              },
              isLast && styles.squareLast,
              isSel && styles.squareSel,
              isCheck && styles.squareCheck,
              isHintFrom && styles.squareHintFrom,
              isHintTo && styles.squareHintTo,
            ]}
          >
            {f === 0 && (
              <Text
                style={[
                  styles.coord,
                  styles.coordRank,
                  { color: light ? "rgba(120,90,60,0.9)" : "rgba(245,220,185,0.9)" },
                ]}
              >
                {8 - squareToCoord(sq).rank}
              </Text>
            )}
            {r === 7 && (
              <Text
                style={[
                  styles.coord,
                  styles.coordFile,
                  { color: light ? "rgba(120,90,60,0.9)" : "rgba(245,220,185,0.9)" },
                ]}
              >
                {FILES[squareToCoord(sq).file]}
              </Text>
            )}
            {isLegalDest && !pieces[sq] && (
              <View style={[styles.moveDot, { width: sqSize * 0.3, height: sqSize * 0.3 }]} />
            )}
            {isLegalDest && pieces[sq] && (
              <View
                style={[
                  styles.captureRing,
                  { width: sqSize * 0.92, height: sqSize * 0.92, borderRadius: sqSize * 0.46 },
                ]}
              />
            )}
          </Pressable>
        );
      })}

      {/* Pieces layer, absolutely positioned above squares */}
      {Object.entries(pieces).map(([sq, piece]) => (
        <AnimatedPiece
          key={`${sq}-${piece.color}-${piece.type}`}
          sq={sq}
          color={piece.color}
          type={piece.type}
          sqSize={sqSize}
          orientation={orientation}
          isHintPiece={hintFrom === sq}
          pointerThrough
        />
      ))}
    </View>
  );
}

interface PieceProps {
  sq: string;
  color: "w" | "b";
  type: import("@/util/chess").PieceType;
  sqSize: number;
  orientation: "w" | "b";
  isHintPiece: boolean;
  pointerThrough: boolean;
}

function AnimatedPiece({ sq, color, type, sqSize, orientation, isHintPiece, pointerThrough }: PieceProps) {
  const { file, rank } = squareToCoord(sq);
  const f = orientation === "w" ? file : 7 - file;
  const r = orientation === "w" ? rank : 7 - rank;
  const x = useRef(new Animated.Value(f * sqSize)).current;
  const y = useRef(new Animated.Value(r * sqSize)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(x, {
        toValue: f * sqSize,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(y, {
        toValue: r * sqSize,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [f, r, sqSize, x, y]);

  const isWhite = color === "w";
  const fontSize = sqSize * 0.78;
  return (
    <Animated.View
      pointerEvents={pointerThrough ? "none" : "auto"}
      style={{
        position: "absolute",
        width: sqSize,
        height: sqSize,
        transform: [{ translateX: x }, { translateY: y }],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize,
          lineHeight: sqSize,
          textAlign: "center",
          color: isWhite ? PIECE_COLORS.white : PIECE_COLORS.black,
          textShadowColor: isWhite ? PIECE_COLORS.whiteStroke : PIECE_COLORS.blackStroke,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: isHintPiece ? 10 : 2,
        }}
      >
        {glyph(color, type)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#000",
  },
  square: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  squareLast: { backgroundColor: "#e8d26b" },
  squareSel: { backgroundColor: "#95c077" },
  squareCheck: { backgroundColor: "#dc5a46" },
  squareHintFrom: { backgroundColor: "#8ec878" },
  squareHintTo: { backgroundColor: "#b3e39b" },
  coord: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "700",
  },
  coordRank: { top: 2, left: 4 },
  coordFile: { bottom: 2, right: 4 },
  moveDot: {
    borderRadius: 999,
    backgroundColor: "rgba(40, 100, 30, 0.55)",
  },
  captureRing: {
    borderWidth: 4,
    borderColor: "rgba(40, 100, 30, 0.75)",
    backgroundColor: "transparent",
  },
});
