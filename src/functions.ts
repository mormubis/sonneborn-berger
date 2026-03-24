import {
  BYE_SENTINEL,
  adjustedScore,
  dummyScore,
  isUnplayed,
  isVUR,
  playerGameKind,
} from './utilities.js';

import type { Game } from './types.js';

interface Contribution {
  isVUR: boolean;
  opponentScore: number;
  value: number;
}

/**
 * Collect Sonneborn-Berger contributions for a player per FIDE 16.
 * Each contribution is playerResult × opponentScore, where opponentScore is:
 * - FIDE 16.3: adjusted score for OTB games
 * - FIDE 16.4: dummy score for the player's own unplayed rounds
 */
function contributions(player: string, games: Game[][]): Contribution[] {
  const result: Contribution[] = [];

  for (const round of games) {
    for (const g of round) {
      if (g.white !== player && g.black !== player) {
        continue;
      }

      const pKind = playerGameKind(player, g);
      const playerResult = g.white === player ? g.result : 1 - g.result;

      if (isUnplayed(pKind)) {
        // FIDE 16.4: participant's own unplayed round → dummy opponent
        const dummy = dummyScore(player, games, g);
        result.push({
          isVUR: isVUR(pKind),
          opponentScore: dummy,
          value: playerResult * dummy,
        });
      } else if (g.black !== BYE_SENTINEL && g.white !== BYE_SENTINEL) {
        // OTB game → opponent's adjusted score (FIDE 16.3)
        const opponent = g.white === player ? g.black : g.white;
        const adjScore = adjustedScore(opponent, games);
        result.push({
          isVUR: false,
          opponentScore: adjScore,
          value: playerResult * adjScore,
        });
      }
      // Sentinel byes without kind are skipped
    }
  }

  return result;
}

function sonnebornBerger(player: string, games: Game[][]): number {
  let sum = 0;
  for (const c of contributions(player, games)) {
    sum += c.value;
  }
  return sum;
}

/**
 * FIDE 16.5 Cut-1 for Sonneborn-Berger:
 * Determine the least significant value per 14.1.1.d (opponent with lowest
 * adjusted score; among ties, lowest contribution value). Also find the
 * lowest VUR contribution. Cut the HIGHER of the two.
 */
function sonnebornBergerCut1(player: string, games: Game[][]): number {
  const items = contributions(player, games);
  if (items.length === 0) {
    return 0;
  }

  // Find least significant per 14.1.1.d: opponent with lowest score,
  // among ties the one with lowest contribution value
  let leastSignificant: Contribution = items[0] as Contribution;
  for (const c of items) {
    if (
      c.opponentScore < leastSignificant.opponentScore ||
      (c.opponentScore === leastSignificant.opponentScore &&
        c.value < leastSignificant.value)
    ) {
      leastSignificant = c;
    }
  }

  // FIDE 16.5: find lowest VUR contribution
  let lowestVUR: Contribution | undefined;
  for (const c of items) {
    if (c.isVUR && (lowestVUR === undefined || c.value < lowestVUR.value)) {
      lowestVUR = c;
    }
  }

  // Determine which contribution to cut (FIDE 16.5):
  // cut the VUR if it exists and is >= least significant, otherwise standard cut
  const toCut =
    lowestVUR !== undefined && lowestVUR.value >= leastSignificant.value
      ? lowestVUR
      : leastSignificant;

  // Remove first occurrence of toCut and sum the rest
  const cutIndex = items.indexOf(toCut);
  let sum = 0;
  for (const [index, item] of items.entries()) {
    if (index !== cutIndex) {
      sum += item.value;
    }
  }
  return sum;
}

export { sonnebornBerger, sonnebornBergerCut1 };
