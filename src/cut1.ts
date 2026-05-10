import { contributions } from './utilities.js';

import type { Contribution } from './utilities.js';
import type { CompletedRound, Player } from '@echecs/tournament';

function sonnebornBergerCut1(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  const items = contributions(player, rounds);
  if (items.length === 0) {
    return 0;
  }

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

  let lowestVUR: Contribution | undefined;
  for (const c of items) {
    if (c.isVUR && (lowestVUR === undefined || c.value < lowestVUR.value)) {
      lowestVUR = c;
    }
  }

  const toCut =
    lowestVUR !== undefined && lowestVUR.value >= leastSignificant.value
      ? lowestVUR
      : leastSignificant;

  const cutIndex = items.indexOf(toCut);
  let sum = 0;
  for (const [index, item] of items.entries()) {
    if (index !== cutIndex) {
      sum += item.value;
    }
  }
  return sum;
}

export { sonnebornBergerCut1, sonnebornBergerCut1 as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';
