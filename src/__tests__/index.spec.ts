import { describe, expect, it } from 'vitest';

import { sonnebornBergerCut1 } from '../cut1.js';
import { sonnebornBerger } from '../index.js';

import type { CompletedRound, Player } from '@echecs/tournament';

const PLAYERS: Player[] = [
  { id: 'A', points: 2.5, rank: 1 },
  { id: 'B', points: 1, rank: 3 },
  { id: 'C', points: 0, rank: 4 },
  { id: 'D', points: 2.5, rank: 2 },
];

const ROUNDS: CompletedRound[] = [
  {
    byes: [],
    games: [
      { black: 'B', result: 'white', white: 'A' },
      { black: 'D', result: 'black', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'D', result: 'draw', white: 'A' },
      { black: 'B', result: 'black', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'C', result: 'white', white: 'A' },
      { black: 'B', result: 'white', white: 'D' },
    ],
  },
];

describe('sonnebornBerger', () => {
  it('returns sum of result x opponent final score', () => {
    expect(sonnebornBerger('A', ROUNDS, PLAYERS)).toBe(2.25);
  });

  it('handles player with no games', () => {
    expect(sonnebornBerger('A', [], PLAYERS)).toBe(0);
  });
});

describe('sonnebornBergerCut1', () => {
  it('drops contribution from opponent with lowest score (FIDE 14.1.1.d)', () => {
    expect(sonnebornBergerCut1('A', ROUNDS, PLAYERS)).toBe(2.25);
  });

  it('returns 0 when only one opponent', () => {
    const rounds: CompletedRound[] = [
      { byes: [], games: [{ black: 'B', result: 'white', white: 'A' }] },
    ];
    expect(sonnebornBergerCut1('A', rounds, PLAYERS)).toBe(0);
  });
});

// FIDE 16 fixture
const PLAYERS_FIDE16: Player[] = [
  { id: 'A', points: 2.5, rank: 1 },
  { id: 'B', points: 1, rank: 3 },
  { id: 'C', points: 1, rank: 4 },
  { id: 'D', points: 1, rank: 2 },
];

const ROUNDS_FIDE16: CompletedRound[] = [
  {
    byes: [],
    games: [
      { black: 'B', result: 'white', white: 'A' },
      { black: 'D', forfeit: 'black', result: 'white', white: 'C' },
    ],
  },
  {
    byes: [],
    games: [
      { black: 'D', result: 'draw', white: 'A' },
      { black: 'B', result: 'black', white: 'C' },
    ],
  },
  {
    byes: [{ kind: 'half', player: 'D' }],
    games: [{ black: 'C', result: 'white', white: 'A' }],
  },
];

describe('sonnebornBerger with FIDE 16', () => {
  it('uses adjusted opponent scores for OTB games (16.3)', () => {
    expect(sonnebornBerger('A', ROUNDS_FIDE16, PLAYERS_FIDE16)).toBe(2.5);
  });

  it('creates dummy opponents for own unplayed rounds (16.4)', () => {
    expect(sonnebornBerger('D', ROUNDS_FIDE16, PLAYERS_FIDE16)).toBe(1.75);
  });
});

describe('sonnebornBergerCut1 with FIDE 16', () => {
  it('cuts the higher of lowestVUR and leastSignificant (FIDE 16.5)', () => {
    expect(sonnebornBergerCut1('D', ROUNDS_FIDE16, PLAYERS_FIDE16)).toBe(1.75);
  });

  it('cuts VUR when VUR contribution exceeds least significant', () => {
    expect(sonnebornBergerCut1('A', ROUNDS_FIDE16, PLAYERS_FIDE16)).toBe(2);
  });
});
