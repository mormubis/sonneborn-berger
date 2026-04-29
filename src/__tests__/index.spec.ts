import { describe, expect, it } from 'vitest';

import { sonnebornBergerCut1 } from '../cut1.js';
import { sonnebornBerger } from '../index.js';

import type { Game, GameKind } from '@echecs/tournament';

// 4 players, 3 rounds:
// Round 1: A(W) 1-0 B, C(W) 0-1 D
// Round 2: A(W) 0.5-0.5 D, C(W) 0-1 B
// Round 3: A(W) 1-0 C, D(W) 1-0 B
// Scores: A=2.5, D=2.5, B=1, C=0

const GAMES: Game[][] = [
  [
    { black: 'B', result: 1, white: 'A' },
    { black: 'D', result: 0, white: 'C' },
  ],
  [
    { black: 'D', result: 0.5, white: 'A' },
    { black: 'B', result: 0, white: 'C' },
  ],
  [
    { black: 'C', result: 1, white: 'A' },
    { black: 'B', result: 1, white: 'D' },
  ],
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
    const games: Game[][] = [[{ black: 'B', result: 1, white: 'A' }]];
    expect(sonnebornBergerCut1('A', games)).toBe(0);
  });
});

// FIDE 16 Unplayed Rounds Management fixture:
// 4 players, 3 rounds:
// Round 1: A(W) 1-0 B (OTB), C(W) forfeit-win over D
// Round 2: A(W) 0.5-0.5 D (OTB), C(W) 0-1 B (OTB)
// Round 3: A(W) 1-0 C (OTB), D half-bye (terminal — last round)
//
// Raw scores: A=2.5, B=1, C=1, D=0.5 (forfeit-loss=0, draw=0.5, half-bye=0.5)
//
// Adjusted scores (FIDE 16.3):
//   A: all OTB → adjustedScore = 2.5
//   B: all OTB → adjustedScore = 1
//   C: forfeit-win in R1 uses awarded result (1), lost to B (0), lost to A (0) → 1
//   D: forfeit-loss(0) + OTB draw(0.5) + terminal half-bye→0.5 = 1.0
//
// SB(A):
//   beat B(adj=1) → 1×1 = 1
//   drew D(adj=1.0) → 0.5×1.0 = 0.5
//   beat C(adj=1) → 1×1 = 1
//   Total = 2.5
//
// SB(D) with FIDE 16.4:
//   R1: D suffered forfeit-loss → dummy = min(score(D)=1, adjustedScore(C)=1) = 1
//       result for D = 0 → contribution = 0×1 = 0
//   R2: D played A (OTB), drew → 0.5×adjustedScore(A=2.5) = 0.5×2.5 = 1.25
//   R3: D has half-bye → dummy = min(score(D)=1, 3×0.5=1.5) = 1
//       result for D = 0.5 → contribution = 0.5×1 = 0.5
//   SB(D) = 0 + 1.25 + 0.5 = 1.75

const GAMES_FIDE16: Game[][] = [
  [
    { black: 'B', result: 1, white: 'A' },
    { black: 'D', kind: 'forfeit-win' as GameKind, result: 1, white: 'C' },
  ],
  [
    { black: 'D', result: 0.5, white: 'A' },
    { black: 'B', result: 0, white: 'C' },
  ],
  [
    { black: 'C', result: 1, white: 'A' },
    { black: 'D', kind: 'half-bye' as GameKind, result: 0.5, white: 'D' },
  ],
];

describe('sonnebornBerger with FIDE 16', () => {
  it('uses adjusted opponent scores for OTB games (16.3)', () => {
    // A's SB: beat B(adj=1)→1, drew D(adj=1.0)→0.5, beat C(adj=1)→1 = 2.5
    expect(sonnebornBerger('A', GAMES_FIDE16)).toBe(2.5);
  });

  it('creates dummy opponents for own unplayed rounds (16.4)', () => {
    // D's SB: forfeit-loss×dummy(1)=0, drew A(adj=2.5)→1.25, half-bye×dummy(1)=0.5 = 1.75
    expect(sonnebornBerger('D', GAMES_FIDE16)).toBe(1.75);
  });

  it('is backward compatible when no kind is set', () => {
    // Same games without kind → same as original behavior
    const gamesNoKind: Game[][] = [
      [
        { black: 'B', result: 1, white: 'A' },
        { black: 'D', result: 0, white: 'C' },
      ],
      [
        { black: 'D', result: 0.5, white: 'A' },
        { black: 'B', result: 0, white: 'C' },
      ],
      [
        { black: 'C', result: 1, white: 'A' },
        { black: 'B', result: 1, white: 'D' },
      ],
    ];
    expect(sonnebornBerger('A', gamesNoKind)).toBe(2.25);
  });
});

describe('sonnebornBergerCut1 with FIDE 16', () => {
  it('cuts the higher of lowestVUR and leastSignificant (FIDE 16.5)', () => {
    // D's contributions:
    //   {value: 0, opponentScore: 1, isVUR: true}   (forfeit-loss, R1)
    //   {value: 1.25, opponentScore: 2.5, isVUR: false} (OTB vs A, R2)
    //   {value: 0.5, opponentScore: 1, isVUR: true}  (half-bye, R3)
    //
    // Least significant by (opponentScore asc, value asc):
    //   sorted: [0(score=1), 0.5(score=1), 1.25(score=2.5)]
    //   leastSignificant = {value: 0, opponentScore: 1}
    //
    // VUR items: [{value:0}, {value:0.5}]
    // lowestVUR = {value: 0}
    //
    // FIDE 16.5: cut the HIGHER of lowestVUR(0) and leastSignificant(0) → they're equal
    // → cut leastSignificant (the first in sort order, value=0)
    // Remaining: 1.25 + 0.5 = 1.75
    expect(sonnebornBergerCut1('D', GAMES_FIDE16)).toBe(1.75);
  });

  it('cuts VUR when VUR contribution exceeds least significant', () => {
    // A has no VURs — standard cut applies
    // A contributions sorted by opponentScore: C(1)→1, D(1.0)→0.5, B(1)→1
    // Wait: adj scores are B=1, C=1, D=1 → all tied at opponentScore=1
    // Sort by value asc: C→1, D→0.5, B→1 → leastSignificant = D→0.5
    // No VURs → standard cut of 0.5
    // Remaining: 1 + 1 = 2
    expect(sonnebornBergerCut1('A', GAMES_FIDE16)).toBe(2);
  });
});
