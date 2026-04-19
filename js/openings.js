/* Curated opening repertoire focused on what sub-1000 players actually face.
   Each entry has:
     id          – unique key
     name        – display name
     group       – sidebar grouping (As White / As Black / Defenses)
     side        – 'w' or 'b' = the side YOU play
     description – one-liner shown in coach panel at start
     moves       – list of UCI moves to set up the starting position of the line.
                   These moves are pre-played automatically; practice begins from there.
*/
(function (global) {
  const OPENINGS = [
    // ===== As White =====
    {
      id: "london",
      name: "London System",
      group: "As White",
      side: "w",
      description:
        "A solid, system-based opening for White. Set up Bf4, e3, Nf3, Bd3, c3, Nbd2, then break with e4 or attack on the kingside.",
      moves: [], // start from move 1
      principles: [
        "Play 1.d4 then develop Bf4 before e3 to keep the bishop active.",
        "Aim for the d4-c3-e3 pawn triangle and Nbd2.",
        "Don't trade your light-squared bishop cheaply — it's your attacker.",
      ],
    },
    {
      id: "vs-scandi",
      name: "vs. Scandinavian Defense",
      group: "As White",
      side: "w",
      description:
        "Black plays 1...d5 against your e4. Take the pawn (2.exd5) and after 2...Qxd5 hit the queen with 3.Nc3, then develop normally.",
      moves: ["e2e4", "d7d5"],
      principles: [
        "Always take the pawn: 2.exd5.",
        "After 2...Qxd5, play 3.Nc3 to gain a tempo on the queen.",
        "Develop with Nf3, Bc4/Bd3, d4, O-O.",
      ],
    },
    {
      id: "vs-englund",
      name: "vs. Englund Gambit",
      group: "As White",
      side: "w",
      description:
        "Black plays 1...e5 against 1.d4 — just take the pawn. Common low-rated trap is 4...Qb4+ trying to win the rook; you have to know the refutation.",
      moves: ["d2d4", "e7e5"],
      principles: [
        "Take the pawn: 2.dxe5.",
        "After Nc6 3.Nf3 Qe7 4.Bf4 (defending e5), don't fall for ...Qb4+.",
        "If ...Qb4+, block with 5.Bd2 (NOT Nc3 dropping b2), then Qxb4 Bxb4 and you're up a pawn.",
      ],
    },
    {
      id: "italian",
      name: "Italian Game (White)",
      group: "As White",
      side: "w",
      description:
        "Classical 1.e4 e5 2.Nf3 Nc6 3.Bc4. Aim for the Giuoco Pianissimo: c3, d3, O-O, Re1, Nbd2.",
      moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
      principles: [
        "Castle early. Don't play d4 too soon.",
        "Watch the f7 square and Black's ...Nf6 attacking your e4.",
        "Be ready for the Two Knights: 3...Nf6, where 4.Ng5 is sharp but 4.d3 keeps it quiet.",
      ],
    },

    // ===== As Black =====
    {
      id: "vs-london",
      name: "vs. London System",
      group: "As Black",
      side: "b",
      description:
        "White plays the London setup. The cleanest reply is to mirror with ...d5, ...Nf6, ...c5 hitting d4, then ...Nc6 and ...Qb6 pressuring b2.",
      moves: ["d2d4", "d7d5", "c1f4"],
      principles: [
        "Play ...c5 early to challenge d4 — don't let White have it free.",
        "...Qb6 hits the b2 pawn behind White's bishop.",
        "Develop ...Nc6, ...Bf5 or ...Bg4 active.",
      ],
    },
    {
      id: "scandi",
      name: "Scandinavian Defense",
      group: "As Black",
      side: "b",
      description:
        "1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5 — the main line. Solid, easy to learn, gets your queen out early but to a safe square.",
      moves: ["e2e4", "d7d5", "e4d5", "d8d5"],
      principles: [
        "Retreat the queen to a5 (or d6/d8). a5 is the most common.",
        "Develop ...Nf6, ...c6 (giving the queen a retreat to c7), ...Bf5, ...e6.",
        "Castle queenside is a common plan in some lines.",
      ],
    },
    {
      id: "caro-kann",
      name: "Caro-Kann Defense",
      group: "As Black",
      side: "b",
      description:
        "1.e4 c6 prepares ...d5 with solid pawn support. Easy structures, hard to lose quickly.",
      moves: ["e2e4", "c7c6"],
      principles: [
        "After 2.d4 d5, the main lines are 3.Nc3 dxe4 4.Nxe4 and 3.exd5 cxd5 (Exchange).",
        "Develop ...Bf5 (key bishop!) before playing ...e6.",
        "Solid pawn chain c6-d5-e6.",
      ],
    },
    {
      id: "italian-black",
      name: "vs. Italian (Black)",
      group: "As Black",
      side: "b",
      description:
        "Face 1.e4 e5 2.Nf3 Nc6 3.Bc4. Reply 3...Bc5 (Giuoco Piano) or 3...Nf6 (Two Knights).",
      moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
      principles: [
        "...Nf6 is active and hits e4.",
        "Don't fall for the Fried Liver: after 3...Nf6 4.Ng5, play 4...d5 5.exd5 Na5! (not Nxd5 unless you know the lines).",
        "Aim to castle quickly.",
      ],
    },

    // ===== Defending common low-rated traps =====
    {
      id: "scholars",
      name: "Defend Scholar's Mate",
      group: "Defend Common Traps",
      side: "b",
      description:
        "1.e4 e5 2.Bc4 Qh5 (or 2.Qh5) — White goes for 4-move mate on f7. You must defend f7 and KICK the queen, gaining tempo.",
      moves: ["e2e4", "e7e5", "f1c4"],
      principles: [
        "Standard reply: 2...Nc6 (defends e5, prepares ...Nf6).",
        "If White plays Qh5: respond ...g6 to kick the queen, then ...Nf6 attacking it again.",
        "Never play ...Nf6 to block when White's queen is on h5 hitting f7+e5 — you may lose e5.",
        "Do NOT castle into a queen on h5 unprotected.",
      ],
    },
    {
      id: "wayward-queen",
      name: "Defend Wayward Queen (Qh5)",
      group: "Defend Common Traps",
      side: "b",
      description:
        "1.e4 e5 2.Qh5 — White brings queen out immediately. Just defend e5 and develop with tempo.",
      moves: ["e2e4", "e7e5", "d1h5"],
      principles: [
        "Best reply: 2...Nc6 (defends e5).",
        "White usually plays 3.Bc4. Reply 3...g6, kicking the queen.",
        "After 4.Qf3, play 4...Nf6 (defends f7-mate idea, develops).",
        "Then ...Nd4 hitting the queen and c2 is strong.",
      ],
    },
    {
      id: "fried-liver-defense",
      name: "Defend Fried Liver Attack",
      group: "Defend Common Traps",
      side: "b",
      description:
        "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 — the Fried Liver knight raid against f7. Know the Traxler / Knight-sac lines or just play the safe ...Na5 defense.",
      moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6", "f3g5"],
      principles: [
        "4...d5 is forced (kicking the bishop and opening lines).",
        "After 5.exd5, play 5...Na5! attacking the c4 bishop. NOT 5...Nxd5 (Fried Liver).",
        "After 6.Bb5+ c6 7.dxc6 bxc6 8.Be2, you've given a pawn but have huge development.",
      ],
    },

    // ===== Mating Tricks =====
    // Each has a `walkthrough` of {uci, note} pairs. The app plays them
    // out fast-forward with the note shown in the coach panel, then drops
    // you into practice mode from the starting position so you can try
    // to land the trap yourself against real low-rated opponents.
    {
      id: "mate-scholars",
      name: "Scholar's Mate",
      group: "Mating Tricks",
      side: "w",
      description:
        "The classic 4-move mate. Bring out queen and bishop to attack f7 — the weakest square in Black's camp at move 1. Works against opponents who don't know the defense.",
      moves: [],
      principles: [
        "1.e4 followed by 2.Bc4 and 3.Qh5 attacking f7 twice.",
        "Mate threat: Qxf7# (queen defended by bishop, no piece can capture).",
        "Black must play ...Nc6 + ...g6 to defend. If they play ...Nf6?? blocking the queen — you take f7 with mate.",
      ],
      walkthrough: [
        { uci: "e2e4", note: "1. e4 — open lines for the queen and bishop." },
        { uci: "e7e5", note: "...e5 — most common reply." },
        { uci: "f1c4", note: "2. Bc4 — bishop points straight at f7, the weakest square." },
        { uci: "b8c6", note: "...Nc6 — develops and defends e5." },
        { uci: "d1h5", note: "3. Qh5! — now Qxf7# is threatened. Black MUST defend f7." },
        { uci: "g8f6", note: "...Nf6?? — the classic blunder. It attacks the queen but doesn't defend f7. Correct was ...g6 or ...Qe7." },
        { uci: "h5f7", note: "4. Qxf7# — checkmate! Bishop on c4 defends the queen, king has nowhere to run." },
      ],
    },
    {
      id: "mate-fools",
      name: "Fool's Mate",
      group: "Mating Tricks",
      side: "b",
      description:
        "The fastest possible mate: 2 moves. Only works if White plays the two worst moves on the board. Worth knowing so you spot it instantly.",
      moves: [],
      principles: [
        "Requires White to weaken both diagonals to e1 (h4-e1 and a5-e1).",
        "After 1.f3 e5 2.g4??, the queen lands on h4 with mate.",
        "Real opportunity: notice when an opponent plays both f3/f4 and g4 — pounce.",
      ],
      walkthrough: [
        { uci: "f2f3", note: "1. f3?? — weakens the e1-h4 diagonal." },
        { uci: "e7e5", note: "...e5, opening the queen's path." },
        { uci: "g2g4", note: "2. g4?? — and now the killer..." },
        { uci: "d8h4", note: "...Qh4# — checkmate! No piece can interpose, no escape." },
      ],
    },
    {
      id: "mate-legal",
      name: "Légal's Trap",
      group: "Mating Tricks",
      side: "w",
      description:
        "A queen sacrifice for a forced mate, vs. an opponent who pins your knight with ...Bg4. Famous trap dating to the 1700s.",
      moves: [],
      principles: [
        "Setup: 1.e4 e5 2.Nf3 d6 3.Bc4 Bg4 — Black pins the knight to the queen.",
        "Trick: play 4.Nc3 (extra piece on e5), and if Black plays anything passive, you go 5.Nxe5! offering the queen.",
        "If Black takes the queen with ...Bxd1??, you mate with Bxf7+ and Nd5#.",
      ],
      walkthrough: [
        { uci: "e2e4", note: "1. e4" },
        { uci: "e7e5", note: "...e5" },
        { uci: "g1f3", note: "2. Nf3" },
        { uci: "d7d6", note: "...d6 (Philidor)" },
        { uci: "f1c4", note: "3. Bc4 — eyeing f7 as always" },
        { uci: "c8g4", note: "...Bg4 — pinning the knight to the queen. The trap is set." },
        { uci: "b1c3", note: "4. Nc3 — adding a piece, ignoring the pin." },
        { uci: "g7g6", note: "...g6?? — passive. Now we strike." },
        { uci: "f3e5", note: "5. Nxe5!! — offering the queen!" },
        { uci: "g4d1", note: "...Bxd1?? takes the bait." },
        { uci: "c4f7", note: "6. Bxf7+ — check, king can't escape easily" },
        { uci: "e8e7", note: "...Ke7 — forced." },
        { uci: "c3d5", note: "7. Nd5# — checkmate! The bishop and two knights cover everything." },
      ],
    },
    {
      id: "mate-blackburne-shilling",
      name: "Blackburne Shilling Gambit",
      group: "Mating Tricks",
      side: "b",
      description:
        "After 1.e4 e5 2.Nf3 Nc6 3.Bc4, play 3...Nd4!? — a 'shilling' trap White falls for if greedy. Best case: smothered mate in 8.",
      moves: [],
      principles: [
        "3...Nd4 looks like it just hangs e5, but it's a trap.",
        "If 4.Nxe5?? Qg5! threatens both Qxg2 AND Qxe5.",
        "If White then grabs 5.Nxf7?? (going for the rook), you play 5...Qxg2 6.Rf1 Qxe4+ 7.Be2 Nf3#! — smothered mate.",
      ],
      walkthrough: [
        { uci: "e2e4", note: "1. e4 e5 — standard setup" },
        { uci: "e7e5", note: "" },
        { uci: "g1f3", note: "2. Nf3" },
        { uci: "b8c6", note: "...Nc6" },
        { uci: "f1c4", note: "3. Bc4 — Italian setup" },
        { uci: "c6d4", note: "...Nd4!? — the shilling trap! Looks like a beginner blunder." },
        { uci: "f3e5", note: "4. Nxe5?? — White takes the bait, thinking Black just hung the pawn." },
        { uci: "d8g5", note: "...Qg5! — double attack: Qxe5 AND Qxg2." },
        { uci: "e5f7", note: "5. Nxf7?? — White goes for the rook, hoping for tactics." },
        { uci: "g5g2", note: "...Qxg2 — taking the rook on h1 next." },
        { uci: "h1f1", note: "6. Rf1 — the rook runs" },
        { uci: "g2e4", note: "...Qxe4+ — check and grabs the pawn!" },
        { uci: "c4e2", note: "7. Be2 — only legal block of the check." },
        { uci: "d4f3", note: "...Nf3# — smothered mate! King on e1, blocked by everything, knight gives mate." },
      ],
    },
    {
      id: "mate-englund-trap",
      name: "Englund Gambit Trap",
      group: "Mating Tricks",
      side: "b",
      description:
        "1.d4 e5!? — the Englund Gambit. If White plays sloppily, Black wins material with the ...Qb4+ trick.",
      moves: [],
      principles: [
        "After 1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4 Qb4+ — the trap is set.",
        "If White plays 5.Bd2?? (the natural block), then 5...Qxb2 attacks the rook AND threatens Qc1#.",
        "Best for White is 5.Nc3 (NOT Bd2), and Black's compensation is questionable.",
      ],
      walkthrough: [
        { uci: "d2d4", note: "1. d4 — White goes for queen-pawn." },
        { uci: "e7e5", note: "...e5!? — the Englund Gambit, sacrificing a pawn." },
        { uci: "d4e5", note: "2. dxe5 — White takes." },
        { uci: "b8c6", note: "...Nc6 — eyeing e5." },
        { uci: "g1f3", note: "3. Nf3 — defending e5." },
        { uci: "d8e7", note: "...Qe7 — pinning the e5 pawn to nothing... yet." },
        { uci: "c1f4", note: "4. Bf4 — overprotecting e5." },
        { uci: "e7b4", note: "...Qb4+! — the trap. Hits the bishop on f4 and gives check." },
        { uci: "f4d2", note: "5. Bd2?? — the natural block, but it's the losing move." },
        { uci: "b4b2", note: "...Qxb2 — eats the b2 pawn, attacks rook AND threatens Qc1#." },
        { uci: "d2c3", note: "6. Bc3 — trying to defend." },
        { uci: "f8b4", note: "...Bb4! — pinning the bishop. White is losing material no matter what." },
      ],
    },
    {
      id: "mate-smothered",
      name: "Smothered Mate (pattern)",
      group: "Mating Tricks",
      side: "w",
      description:
        "Smothered mate: the king has no escape squares because they're all blocked by its OWN pieces, and a knight delivers mate. This puzzle shows the canonical ending pattern.",
      moves: [],
      principles: [
        "Setup: enemy king in the corner with rook/queen and pawns blocking every escape square.",
        "Knight delivers mate from a square the king cannot reach.",
        "The full Philidor's Legacy starts with a discovered check + queen sacrifice on g8 to force the rook to block.",
      ],
      // Mate-in-1 puzzle: White N on e5 jumps to f7 with mate.
      startFen: "6rk/6pp/8/4N3/8/8/8/7K w - - 0 1",
      walkthrough: [
        { uci: "e5f7", note: "1. Nf7# — smothered mate! King on h8 has no squares: g8 blocked by rook, g7 and h7 blocked by its own pawns. King can't capture the knight on f7 (too far)." },
      ],
    },
    {
      id: "mate-back-rank",
      name: "Back Rank Mate Pattern",
      group: "Mating Tricks",
      side: "w",
      description:
        "The most common mate at every level: castled king with three pawns in front, no luft, rook or queen lands on the back rank.",
      moves: [],
      principles: [
        "Always look for back-rank weakness: king on g8/h8 with pawns f7/g7/h7 unmoved and no defender on the 8th rank.",
        "Defense: play h6 / h3 (\"luft\") so the king has an escape square.",
        "Watch for opportunities to deflect or remove the back-rank defender (their rook or queen).",
      ],
      startFen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
      walkthrough: [
        { uci: "d1d8", note: "1. Rd8# — rook to the 8th rank. Black king is hemmed in by its own f7/g7/h7 pawns. Mate!" },
      ],
    },
  ];

  global.OPENINGS = OPENINGS;
})(window);
