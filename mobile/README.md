# Chess Puzzles — Mobile (iOS / Android)

Expo-powered React Native chess puzzle app. Solve mate-in-N and
tactical puzzles against a timer, scored on speed and difficulty.
Built as a native app you can install on your iPhone through Expo Go
or the App Store.

> **Working name** — rename to your preferred brand in three places
> before App Store submission: `app.json` (`name`, `slug`,
> `bundleIdentifier`), `package.json` (`name`), and the brand `<Text>`
> in `App.tsx`.

## What's in here

- **Tap-to-move chess board** with SVG pieces (cburnett set, same as
  Lichess), animated transitions, last-move highlights, legal-move dots,
  and hint overlay (glowing source/destination squares).
- **Timed puzzle mode** — pick a puzzle, solve it fast, get scored.
  `base = 100 × difficulty`, multiplied by `1 − elapsed/60` (floor 20%).
- **Filter sheet** — modal chip picker for difficulty (★/★★/★★★),
  category, and theme. Filters persist across launches.
- **Persistent best score** via AsyncStorage.
- **Hint banner** — tap the banner to play the recommended move
  instantly (on by default; toggle in the control row).
- **Lichess puzzle importer** — run `node scripts/import-lichess-puzzles.js`
  pointed at the open Lichess puzzle CSV (CC0) to swell the puzzle bank
  from 15 curated mates to thousands of themed tactics in under a
  minute. Puzzles are pre-validated and bundled into the app at build.

## Run in dev (simplest path — Expo Go)

Requires Node 18+ and the **Expo Go** app on your phone.

```bash
cd mobile
npm install
npm run start
```

Scan the QR code with your iPhone camera (iOS) or the Expo Go app
directly. The app hot-reloads as you edit.

If you want it in the iOS simulator (macOS only):

```bash
npm run ios
```

## Build a standalone iOS app (TestFlight / App Store)

Production builds use **EAS Build** (Expo Application Services), which
handles provisioning and code-signing for you.

```bash
npm install -g eas-cli
eas login                      # uses your Expo account
eas build:configure            # generates eas.json the first time
eas build --platform ios       # produces an .ipa in the cloud
```

When the build finishes, EAS gives you a link to download the `.ipa`
or submit directly to TestFlight:

```bash
eas submit --platform ios      # upload to App Store Connect
```

Requirements:
- Apple Developer account ($99/year) for TestFlight / App Store.
- For a free dev-only install (ad-hoc), add your UDID to the
  provisioning profile during `eas build:configure`.

Detailed reference: <https://docs.expo.dev/build/introduction/>.

## File layout

```
mobile/
├── App.tsx                   # root screen; wires everything together
├── index.ts                  # registers App with Expo
├── app.json                  # Expo + iOS config (bundleId, theme)
├── package.json              # deps: expo, chess.js, AsyncStorage
├── tsconfig.json             # strict TS with @/* path alias
├── babel.config.js
├── src/
│   ├── theme.ts              # colors, spacing, type sizes
│   ├── data/puzzles.ts       # 15 validated puzzles
│   ├── util/
│   │   ├── chess.ts          # FEN parsing, chess.js helpers
│   │   └── pieces.ts         # Unicode glyph map
│   ├── hooks/
│   │   ├── usePuzzleGame.ts  # puzzle state machine
│   │   └── useAsyncStorage.ts
│   └── components/
│       ├── ChessBoard.tsx    # 8x8 squares + absolutely-positioned pieces
│       ├── PuzzleBar.tsx     # title, difficulty, timer, score pills
│       ├── HintBanner.tsx    # "PLAY Rd8# — tap to play" banner
│       └── FilterSheet.tsx   # bottom-sheet modal with chip filters
└── README.md
```

## Adding more puzzles (the easy way — import Lichess)

The app ships with 15 hand-curated mate-in-1 puzzles. For production
you'll want thousands of puzzles across all themes and difficulties.
The **Lichess puzzle database** is CC0 (public domain) and has ~4
million puzzles rated 400–3000 with theme tags (`mateIn1`, `mateIn2`,
`fork`, `pin`, `skewer`, `smotheredMate`, …).

```bash
# 1. Download the Lichess DB (~300 MB zstd-compressed, ~1 GB expanded).
curl -L -o lichess_puzzle.csv.zst https://database.lichess.org/lichess_db_puzzle.csv.zst
zstd -d lichess_puzzle.csv.zst

# 2. Run the importer — defaults to 2000 puzzles rated 700–1400,
#    balanced across difficulty buckets, favouring tactical themes.
node scripts/import-lichess-puzzles.js lichess_puzzle.csv

# 3. Restart Expo — the app will now use the imported bundle
#    alongside the 15 curated ones.
```

Customize:

```bash
node scripts/import-lichess-puzzles.js lichess_puzzle.csv \
  --count 3000 --min-rating 600 --max-rating 1600 \
  --themes mateIn1,mateIn2,fork,pin,skewer,smotheredMate
```

The script pre-applies the opponent's setup move (Lichess's convention
is that move 1 in the CSV belongs to the opponent and positions the
puzzle), validates every move with chess.js, and writes
`src/data/lichess-puzzles.ts`. That file is gitignored-by-default if
you prefer not to commit the generated bundle; right now it's checked
in as an empty placeholder so the import is a no-op fallback.

### Manual puzzles

Add entries directly to `src/data/puzzles.ts`. Each puzzle needs:
- `id`, `name`, `category`, `themes[]`, `difficulty` (1-3)
- `fen` — legal starting position, side to move = the solver
- `solution` — UCI moves `[user, opp, user, ...]`
- `description` — one-line prompt

## Piece graphics license

The board uses the **cburnett** piece SVGs from Lichess, bundled inline
in `src/util/piece-svgs.ts` (~7 KB total). These are licensed
**GPL-3.0-or-later** (the same license as Lichess itself). Using them
means your app is effectively distributed under GPL-3.0-compatible
terms. If you'd rather ship under a permissive license for the App
Store, swap the SVG strings in `piece-svgs.ts` for a set with a
compatible license — e.g. the **Chess.com-style** open sets on GitHub
(MIT) or the **pirouetti** set.

## Known limitations / future work

- **Drag-and-drop** — currently tap-to-move only. The board is already
  structured to make adding drag gestures (via
  `react-native-gesture-handler` + `react-native-reanimated`) mostly
  drop-in; happy to follow up.
- **App Store polish** — before submission you'll still want an app
  icon, splash screen, onboarding screens, settings, haptics
  (`expo-haptics`), sound effects, privacy policy URL, and App Store
  Connect metadata (screenshots, description, keywords).
- **Engine integration** — unlike the web version, there's no Stockfish
  here. Puzzle grading uses the fixed solution. Adding WASM Stockfish
  in RN is possible but a bigger lift.
