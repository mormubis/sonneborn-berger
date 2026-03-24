# Sonneborn-Berger

[![npm](https://img.shields.io/npm/v/@echecs/sonneborn-berger)](https://www.npmjs.com/package/@echecs/sonneborn-berger)
[![Test](https://github.com/mormubis/sonneborn-berger/actions/workflows/test.yml/badge.svg)](https://github.com/mormubis/sonneborn-berger/actions/workflows/test.yml)
[![Coverage](https://codecov.io/gh/mormubis/sonneborn-berger/branch/main/graph/badge.svg)](https://codecov.io/gh/mormubis/sonneborn-berger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Sonneborn-Berger** is a TypeScript library implementing the Sonneborn-Berger
tiebreak for chess tournaments, following the
[FIDE Tiebreak Regulations](https://handbook.fide.com/chapter/TieBreakRegulations032026)
(section 9.1). Zero runtime dependencies.

## Installation

```bash
npm install @echecs/sonneborn-berger
```

## Quick Start

```typescript
import { sonnebornBerger } from '@echecs/sonneborn-berger';

// games[n] = round n+1; Game has no `round` field
const games = [
  [{ black: 'B', result: 1, white: 'A' }], // round 1
  [{ black: 'C', result: 0.5, white: 'A' }], // round 2
  [{ black: 'A', result: 0, white: 'D' }], // round 3
];

const score = sonnebornBerger('A', games);
// Returns sum of defeated opponents' scores plus half of drawn opponents' scores
```

## API

All functions accept `(playerId: string, games: Game[][], players?: Player[])`
and return `number`. Round is determined by array position: `games[0]` = round
1, `games[1]` = round 2, etc. The `Game` type has no `round` field.

### `sonnebornBerger(playerId, games, players?)`

**FIDE section 9.1** — Full Sonneborn-Berger score. For each game played by
`playerId`, adds the final tournament score of the opponent multiplied by the
result (1 for a win, 0.5 for a draw, 0 for a loss). Byes are excluded. Primarily
used in round-robin tournaments.

### `sonnebornBergerCut1(playerId, games, players?)`

**FIDE section 9.1** — Sonneborn-Berger minus the lowest-contributing opponent.
Computes all per-opponent contributions and removes the one with the smallest
value before summing. Returns `0` when no games have been played.

## Contributing

Contributions are welcome. Please open an issue at
[github.com/mormubis/sonneborn-berger/issues](https://github.com/mormubis/sonneborn-berger/issues).
