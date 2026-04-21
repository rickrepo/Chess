# Opener — Mobile (iOS / Android)

Expo-powered React Native port of the Opener chess puzzle game. Same
curated puzzle bank as the web app, built as a native app you can
install on your iPhone through Expo Go or the App Store.

## What's in here

- **Tap-to-move chess board** with animated piece transitions, last-move
  highlights, legal-move dots, and hint overlay (glowing source/
  destination squares).
- **Timed puzzle mode** — pick a puzzle, solve it fast, get scored.
  `base = 100 × difficulty`, multiplied by `1 − elapsed/60` (floor 20%).
- **Filter sheet** — modal chip picker for difficulty (★/★★/★★★),
  category, and theme. Filters persist across launches.
- **Persistent best score** via AsyncStorage.
- **Hint banner** — tap the banner to play the recommended move
  instantly (on by default; toggle in the control row).
- **Zero assets** — chess pieces render as Unicode glyphs with the
  system font, so there are no images to bundle.

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

## Adding more puzzles

Edit `src/data/puzzles.ts`. Each puzzle needs:
- `id`, `name`, `category`, `themes[]`, `difficulty` (1-3)
- `fen` — legal starting position, side to move = the solver
- `solution` — UCI moves `[user, opp, user, ...]`
- `description` — one-line prompt

The puzzle bank is kept in sync with the web version
(`/js/puzzles.js`). Every solution is validated against chess.js in the
web repo's `puzzle-validate` test script — copy a verified puzzle over.

## Known limitations / future work

- **Drag-and-drop** — currently tap-to-move only. The board is already
  structured to make adding drag gestures (via
  `react-native-gesture-handler` + `react-native-reanimated`) mostly a
  drop-in; happy to follow up.
- **Mate-in-2 puzzles** — the puzzle engine supports multi-ply
  solutions (user → forced opponent response → user → mate), but the
  current bank is all mate-in-1 while I finish curating solid 2-move
  sequences.
- **Engine integration** — unlike the web version, there's no Stockfish
  here. Puzzle grading uses the fixed solution, not dynamic engine
  analysis. Adding WASM Stockfish in RN is possible but a bigger lift.
