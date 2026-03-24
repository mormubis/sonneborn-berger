import { contributions } from './utilities.js';

import type { Game } from './types.js';
import type { Contribution } from './utilities.js';

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

export { sonnebornBergerCut1 };
