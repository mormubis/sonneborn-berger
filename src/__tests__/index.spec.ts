import { describe, expect, it } from 'vitest';

import { sonnebornBerger, sonnebornBergerCut1 } from '../index.js';

import type { Game } from '../types.js';

// 4 players, 3 rounds:
// Round 1: A(W) 1-0 B, C(W) 0-1 D
// Round 2: A(W) 0.5-0.5 D, C(W) 0-1 B
// Round 3: A(W) 1-0 C, D(W) 1-0 B
// Scores: A=2.5, D=2.5, B=1, C=0

const GAMES: Game[] = [
  { blackId: 'B', result: 1, round: 1, whiteId: 'A' },
  { blackId: 'D', result: 0, round: 1, whiteId: 'C' },
  { blackId: 'D', result: 0.5, round: 2, whiteId: 'A' },
  { blackId: 'B', result: 0, round: 2, whiteId: 'C' },
  { blackId: 'C', result: 1, round: 3, whiteId: 'A' },
  { blackId: 'B', result: 1, round: 3, whiteId: 'D' },
];

describe('sonnebornBerger', () => {
  it('returns sum of result × opponent final score', () => {
    // A beat B(1) → 1*1=1, drew D(2.5) → 0.5*2.5=1.25, beat C(0) → 1*0=0
    // total = 2.25
    expect(sonnebornBerger('A', GAMES)).toBe(2.25);
  });

  it('handles player with no games', () => {
    expect(sonnebornBerger('A', [])).toBe(0);
  });
});

describe('sonnebornBergerCut1', () => {
  it('drops contribution from opponent with lowest score (FIDE 14.1.1.d)', () => {
    // A contributions: C(0)→0, B(1)→1, D(2.5)→1.25
    // drop lowest opponent score (C=0) → 1 + 1.25 = 2.25
    expect(sonnebornBergerCut1('A', GAMES)).toBe(2.25);
  });

  it('returns 0 when only one opponent', () => {
    const games: Game[] = [{ blackId: 'B', result: 1, round: 1, whiteId: 'A' }];
    expect(sonnebornBergerCut1('A', games)).toBe(0);
  });
});
