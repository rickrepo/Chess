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
      moves: [],
      mainLine: [
        { uci: "d2d4", note: "Start with 1.d4 — the foundation of the London." },
        { uci: "d7d5" },
        { uci: "c1f4", note: "Bf4 BEFORE e3 — the #1 London move. Keeps the bishop active outside the pawn chain." },
        { uci: "g8f6" },
        { uci: "e2e3", note: "e3 supports d4 and opens Bd3." },
        { uci: "e7e6" },
        { uci: "g1f3", note: "Develop the knight toward the kingside." },
        { uci: "f8d6" },
        { uci: "f4g3", note: "Bg3 keeps the bishop and avoids a trade that weakens your structure." },
        { uci: "e8g8" },
        { uci: "f1d3", note: "Bd3 points at h7 — classic London attacking setup." },
        { uci: "b8d7" },
        { uci: "b1d2", note: "Nbd2 completes development. Castle next, then consider e4 or kingside attack." },
      ],
      principles: [
        "1.d4 then Bf4 BEFORE e3 — keeps the bishop active.",
        "Pawn triangle: c3-d4-e3. Develop Nf3, Nbd2, Bd3.",
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
      mainLine: [
        { uci: "e4d5", note: "Always take the pawn — 2.exd5." },
        { uci: "d8d5" },
        { uci: "b1c3", note: "Nc3! Gains a tempo on the queen — she must move." },
        { uci: "d5a5" },
        { uci: "d2d4", note: "Now build your center with d4." },
        { uci: "g8f6" },
        { uci: "g1f3", note: "Develop your knight." },
        { uci: "c7c6" },
        { uci: "f1c4", note: "Bc4 — active diagonal, eyeing f7." },
        { uci: "c8f5" },
        { uci: "c1d2", note: "Bd2 prepares queenside safety and the queen's defense." },
        { uci: "e7e6" },
        { uci: "d1e2", note: "Qe2 finishes development; castle queenside next." },
      ],
      principles: [
        "Always take the pawn: 2.exd5.",
        "After 2...Qxd5, play 3.Nc3 to gain a tempo on the queen.",
        "Develop with Nf3, Bc4/Bd3, d4, then castle.",
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
      mainLine: [
        { uci: "d4e5", note: "Just take the pawn." },
        { uci: "b8c6" },
        { uci: "g1f3", note: "Nf3 defends the e5 pawn." },
        { uci: "d8e7" },
        { uci: "c1f4", note: "Bf4 overprotects e5. Watch out for the ...Qb4+ trap next." },
        { uci: "e7b4" },
        { uci: "b1c3", note: "Nc3! Do NOT play Bd2 — that loses to Qxb2. Nc3 blocks the check AND defends b2." },
        { uci: "b4b2" },
        { uci: "c3d5", note: "Nd5! Attacks the queen AND threatens Nxc7+ forking." },
      ],
      principles: [
        "Take the pawn: 2.dxe5.",
        "After ...Qb4+, block with Nc3 (NOT Bd2 which drops b2).",
        "Then Nd5 gives White a winning attack.",
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
      mainLine: [
        { uci: "f8c5", note: "Black plays the Giuoco Piano (Bc5)." },
        { uci: "c2c3", note: "c3! Prepares a future d4 center break." },
        { uci: "g8f6" },
        { uci: "d2d3", note: "d3 — Pianissimo. Quiet development, no early d4." },
        { uci: "d7d6" },
        { uci: "b1d2", note: "Nbd2 — plans Nf1-g3 rerouting." },
        { uci: "e8g8" },
        { uci: "e1g1", note: "Castle short." },
        { uci: "a7a6" },
        { uci: "h2h3", note: "h3 stops ...Bg4 and makes luft for your king." },
      ],
      principles: [
        "Castle early. Don't play d4 too soon.",
        "c3+d3 = Pianissimo — slow but safe.",
        "Watch the f7 square; it's always the target.",
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
      mainLine: [
        { uci: "g8f6", note: "Develop knight — don't rush." },
        { uci: "e2e3" },
        { uci: "c7c5", note: "c5! — challenge the center. THE key move against the London." },
        { uci: "g1f3" },
        { uci: "b8c6", note: "Develop naturally." },
        { uci: "c2c3" },
        { uci: "d8b6", note: "Qb6! — hits the b2 pawn behind White's bishop. Huge pressure." },
        { uci: "d1b3" },
        { uci: "b6b3", note: "Trade queens — simplifies and leaves you with a great structure." },
        { uci: "a2b3" },
      ],
      principles: [
        "...c5 early to challenge d4 — don't let White have it free.",
        "...Qb6 hits b2 behind the bishop — often forces a queen trade.",
        "Develop ...Nc6 and an active ...Bf5 or ...Bg4.",
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
      mainLine: [
        { uci: "b1c3" },
        { uci: "d5a5", note: "Qa5! — standard retreat, safe from attack." },
        { uci: "d2d4" },
        { uci: "g8f6", note: "Develop with tempo." },
        { uci: "g1f3" },
        { uci: "c7c6", note: "c6 gives the queen a safe retreat to c7." },
        { uci: "f1c4" },
        { uci: "c8f5", note: "Bf5! Develop BEFORE playing ...e6 (otherwise the bishop is stuck)." },
        { uci: "e1g1" },
        { uci: "e7e6", note: "Now ...e6 is safe." },
      ],
      principles: [
        "Retreat the queen to a5 — most solid.",
        "...Nf6, ...c6 (queen retreat), ...Bf5 BEFORE ...e6.",
        "Castle queenside in many lines.",
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
      mainLine: [
        { uci: "d2d4" },
        { uci: "d7d5", note: "Now challenge the center with pawn support from c6." },
        { uci: "b1c3" },
        { uci: "d5e4", note: "dxe4 — win the tempo and open lines." },
        { uci: "c3e4" },
        { uci: "c8f5", note: "Bf5! — key bishop OUT before ...e6." },
        { uci: "e4g3" },
        { uci: "f5g6", note: "Retreat bishop to safety." },
        { uci: "h2h4" },
        { uci: "h7h6", note: "h6 stops Nh5 chasing the bishop." },
      ],
      principles: [
        "c6 + d5: solid pawn chain.",
        "Develop ...Bf5 BEFORE ...e6 (otherwise bishop is trapped).",
        "Classical, hard to lose quickly.",
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
      mainLine: [
        { uci: "f8c5", note: "Bc5 — solid symmetrical setup (Giuoco Piano)." },
        { uci: "c2c3" },
        { uci: "g8f6", note: "Nf6 hits e4 and develops." },
        { uci: "d2d3" },
        { uci: "d7d6", note: "Mirror White's pawn structure." },
        { uci: "e1g1" },
        { uci: "e8g8", note: "Castle right after development." },
        { uci: "b1d2" },
        { uci: "a7a6", note: "a6 prevents any Bb5 ideas." },
      ],
      principles: [
        "...Bc5 (symmetrical) is easiest to learn.",
        "Develop ...Nf6 to hit e4 and then castle quickly.",
        "Avoid the Fried Liver (3...Nf6 4.Ng5) unless you know the lines.",
      ],
    },

    // ===== Defending common low-rated traps =====
    {
      id: "scholars",
      name: "Defend Scholar's Mate",
      group: "Defend Common Traps",
      side: "b",
      description:
        "1.e4 e5 2.Bc4 Qh5 — White goes for 4-move mate on f7. You must defend f7 and KICK the queen, gaining tempo.",
      moves: ["e2e4", "e7e5", "f1c4"],
      mainLine: [
        { uci: "b8c6", note: "Nc6 — defends e5, prepares Nf6. Standard." },
        { uci: "d1h5", note: "White plays the scholar's attack Qh5." },
        { uci: "g7g6", note: "g6! KICKS the queen. Do NOT play ...Nf6 — that leaves f7 hanging!" },
        { uci: "h5f3", note: "White tries Qf3, still threatening Qxf7#." },
        { uci: "g8f6", note: "Nf6! — now safe (queen on f3 doesn't hit h5), and blocks the mate." },
        { uci: "f3b3" },
        { uci: "d8e7", note: "Qe7 defends f7 once more. White's attack is defused." },
      ],
      principles: [
        "Reply ...Nc6 (defends e5).",
        "When queen goes to h5: KICK with ...g6.",
        "NEVER play ...Nf6 while queen is on h5 — you lose f7.",
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
      mainLine: [
        { uci: "b8c6", note: "Nc6 defends e5 from Qxe5+." },
        { uci: "f1c4" },
        { uci: "g7g6", note: "g6 KICKS the queen — gains tempo." },
        { uci: "h5f3", note: "Queen retreats to f3, still eyeing f7." },
        { uci: "g8f6", note: "Nf6 blocks the Qxf7# threat AND develops." },
        { uci: "d2d3" },
        { uci: "c6d4", note: "Nd4! — forks the queen on f3 and the c2 pawn. Powerful." },
      ],
      principles: [
        "...Nc6 defends e5.",
        "...g6 kicks the queen. ...Nf6 blocks the mate.",
        "...Nd4 forks queen and c2 — turn defense into attack.",
      ],
    },
    {
      id: "fried-liver-defense",
      name: "Defend Fried Liver Attack",
      group: "Defend Common Traps",
      side: "b",
      description:
        "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 — the Fried Liver knight raid against f7. Play the safe ...Na5 defense (Polerio).",
      moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6", "f3g5"],
      mainLine: [
        { uci: "d7d5", note: "d5! — FORCED. Kicks the bishop and blocks the diagonal to f7." },
        { uci: "e4d5" },
        { uci: "c6a5", note: "Na5! — Polerio defense. Attacks the bishop on c4. NEVER play ...Nxd5 (that's the Fried Liver trap)." },
        { uci: "c4b5" },
        { uci: "c7c6", note: "c6 attacks the bishop AND the d5 pawn." },
        { uci: "d5c6" },
        { uci: "b7c6", note: "Recapture with the pawn. You're a pawn down but have huge development." },
        { uci: "b5e2" },
        { uci: "h7h6", note: "h6 kicks the knight away from g5." },
      ],
      principles: [
        "4...d5 FORCED — blocks the diagonal.",
        "5...Na5 (NOT ...Nxd5 which is the Fried Liver).",
        "Accept the pawn loss for development advantage.",
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
