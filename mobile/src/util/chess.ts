import { Chess, Square } from "chess.js";

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export interface Piece {
  color: Color;
  type: PieceType;
}

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function coordToSquare(file: number, rank: number): Square {
  // rank here is 0-indexed from top (0 = 8th rank, 7 = 1st rank)
  return `${FILES[file]}${8 - rank}` as Square;
}

export function squareToCoord(sq: string): { file: number; rank: number } {
  return { file: sq.charCodeAt(0) - 97, rank: 8 - parseInt(sq[1], 10) };
}

export function piecesFromFen(fen: string): Record<string, Piece> {
  const [pos] = fen.split(" ");
  const rows = pos.split("/");
  const out: Record<string, Piece> = {};
  rows.forEach((row, rIdx) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        f += parseInt(ch, 10);
      } else {
        const color: Color = ch === ch.toUpperCase() ? "w" : "b";
        const type = ch.toLowerCase() as PieceType;
        out[coordToSquare(f, rIdx)] = { color, type };
        f++;
      }
    }
  });
  return out;
}

export function legalMovesFrom(chess: Chess, from: string): string[] {
  return chess.moves({ square: from as Square, verbose: true }).map((m) => m.to);
}

export function sanOf(fen: string, uci: string): string {
  const c = new Chess(fen);
  const m = c.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci[4],
  });
  return m ? m.san : uci;
}

export function findKing(chess: Chess, color: Color): string | null {
  const b = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = b[r][f];
      if (sq && sq.type === "k" && sq.color === color) {
        return String.fromCharCode(97 + f) + (8 - r);
      }
    }
  }
  return null;
}

export function isCheck(chess: Chess): boolean {
  // chess.js >= 1.0 uses isCheck(); older uses in_check().
  const anyC = chess as unknown as { isCheck?: () => boolean; in_check?: () => boolean };
  return (anyC.isCheck?.() ?? anyC.in_check?.() ?? false);
}

export function isCheckmate(chess: Chess): boolean {
  const anyC = chess as unknown as { isCheckmate?: () => boolean; in_checkmate?: () => boolean };
  return (anyC.isCheckmate?.() ?? anyC.in_checkmate?.() ?? false);
}
