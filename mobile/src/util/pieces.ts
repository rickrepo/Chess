import { Color, PieceType } from "./chess";

// Unicode chess glyphs. We render WHITE pieces (always filled outlines) in
// light color and BLACK pieces in dark color. This gives crisp, zero-asset
// rendering on iOS/Android with the system font.
const WHITE: Record<PieceType, string> = {
  k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙",
};
// Using white-outline glyphs for BLACK too, rendered in dark color so both
// sides render as filled silhouettes. This reads better than mixing outline
// (black glyphs) and filled (white glyphs) styles on one board.
export function glyph(color: Color, type: PieceType): string {
  return WHITE[type];
}

export const PIECE_COLORS = {
  white: "#fafafa",
  whiteStroke: "#2a2a2a",
  black: "#1a1a1a",
  blackStroke: "#f0f0f0",
} as const;
