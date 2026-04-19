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
  ];

  global.OPENINGS = OPENINGS;
})(window);
