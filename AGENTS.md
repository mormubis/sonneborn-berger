# AGENTS.md

Agent guidance for the `@echecs/sonneborn-berger` repository — a TypeScript
library implementing the Sonneborn-Berger tiebreak following FIDE Tiebreak
Regulations (section 9.1).

See the root `AGENTS.md` for workspace-wide conventions.

**Backlog:** tracked in
[GitHub Issues](https://github.com/mormubis/sonneborn-berger/issues).

---

## Project Overview

Pure calculation library, no runtime dependencies. Exports two functions:

| Function              | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `sonnebornBerger`     | Full Sonneborn-Berger score                                     |
| `sonnebornBergerCut1` | Sonneborn-Berger minus the lowest-contributing opponent's score |

All functions conform to the signature:

```ts
(playerId: string, games: Game[][], players?: Player[]) => number;
```

`Game[][]` is a round-indexed structure: `games[0]` contains round-1 games,
`games[1]` contains round-2 games, and so on. The `Game` type no longer has a
`round` field — round is determined by array position.

The `Game` type carries an optional `kind?: GameKind` field used to classify
unplayed rounds for FIDE article 16 compliance:

```ts
type GameKind =
  | 'forfeit-loss' // 16.2.4 — forfeit loss (VUR)
  | 'forfeit-win' // 16.2.2 — forfeit win
  | 'full-bye' // 16.2.1 — pairing-allocated / full-point bye
  | 'half-bye' // 16.2.3 or 16.2.5 — requested half-point bye
  | 'pairing-bye' // alias for full-bye
  | 'zero-bye'; // 16.2.3 or 16.2.5 — requested zero-point bye
```

When `kind` is absent, the game is treated as a normal over-the-board result.

FIDE reference: https://handbook.fide.com/chapter/TieBreakRegulations032026
(section 9.1 — Sonneborn-Berger System; section 16 — Unplayed Rounds Management)

All source lives in `src/index.ts`; tests in `src/__tests__/index.spec.ts`.

---

## Commands

### Build

```bash
pnpm run build          # bundle TypeScript → dist/ via tsdown
```

### Test

```bash
pnpm run test                          # run all tests once
pnpm run test:watch                    # watch mode
pnpm run test:coverage                 # with coverage report

# Run a single test file
pnpm run test src/__tests__/index.spec.ts

# Run a single test by name (substring match)
pnpm run test -- --reporter=verbose -t "sonnebornBerger"
```

### Lint & Format

```bash
pnpm run lint           # ESLint + tsc type-check (auto-fixes style issues)
pnpm run lint:ci        # strict — zero warnings allowed, no auto-fix
pnpm run lint:style     # ESLint only (auto-fixes)
pnpm run lint:types     # tsc --noEmit type-check only
pnpm run format         # Prettier (writes changes)
pnpm run format:ci      # Prettier check only (no writes)
```

### Full pre-PR check

```bash
pnpm lint && pnpm test && pnpm build
```

---

## Architecture Notes

- The Sonneborn-Berger score for a player is the sum of the final tournament
  scores of every opponent the player **defeated**, plus half the final scores
  of every opponent the player **drew** with. Losses contribute nothing.
- A `Game` with `black: ''` (empty string) represents a **bye**. Byes are
  excluded from the Sonneborn-Berger calculation.
- `sonnebornBergerCut1` removes the opponent whose contribution to the
  Sonneborn-Berger score is lowest before summing. This is useful as a secondary
  tiebreaker to reduce the effect of a weak opponent.
- This system is primarily used in round-robin (all-play-all) tournaments but
  the implementation does not restrict its use to that format.
- **FIDE article 16 — Unplayed Rounds Management**: when a `Game` has a `kind`
  field, unplayed rounds are handled per FIDE article 16.3–16.5. The `kind`
  value determines how a player's score is adjusted for their opponents'
  tie-break calculations (16.3) and how dummy scores are applied to the player's
  own tie-break (16.4). The Cut-1 exception (16.5) prioritises cutting VUR
  contributions over the globally-lowest contribution when determining what to
  exclude in `sonnebornBergerCut1`.
- **No runtime dependencies** — keep it that way.
- **ESM-only** — the package ships only ESM. Do not add a CJS build.

---

## Validation

Input validation is provided by TypeScript's strict type system at compile time.
There is no runtime validation library. Do not add runtime type-checking guards
unless there is an explicit trust boundary (user-supplied strings, external
data).

---

## Error Handling

All functions are pure calculations and do not throw. An unplayed tournament
(zero games) returns `0` rather than throwing.
