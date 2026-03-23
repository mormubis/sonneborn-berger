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

const games = [
  { blackId: 'B', result: 1, round: 1, whiteId: 'A' },
  { blackId: 'C', result: 0.5, round: 2, whiteId: 'A' },
  { blackId: 'A', result: 0, round: 3, whiteId: 'D' },
];

const score = sonnebornBerger('A', games);
// Returns sum of defeated opponents' scores plus half of drawn opponents' scores
```

## API

All functions accept `(playerId: string, games: Game[])` and return `number`.
They are drop-in compatible with the shared `Tiebreak` type
`(playerId: string, games: Game[], players: Player[]) => number`.

### `sonnebornBerger(playerId, games)`

**FIDE section 9.1** — Full Sonneborn-Berger score. For each game played by
`playerId`, adds the final tournament score of the opponent multiplied by the
result (1 for a win, 0.5 for a draw, 0 for a loss). Byes are excluded. Primarily
used in round-robin tournaments.

### `sonnebornBergerCut1(playerId, games)`

**FIDE section 9.1** — Sonneborn-Berger minus the lowest-contributing opponent.
Computes all per-opponent contributions and removes the one with the smallest
value before summing. Returns `0` when no games have been played.

## Contributing

Contributions are welcome. Please open an issue at
[github.com/mormubis/sonneborn-berger/issues](https://github.com/mormubis/sonneborn-berger/issues).
