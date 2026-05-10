import { contributions } from './utilities.js';

import type { CompletedRound, Player } from '@echecs/tournament';

function sonnebornBerger(
  player: string,
  rounds: CompletedRound[],
  _players: Player[],
): number {
  let sum = 0;
  for (const c of contributions(player, rounds)) {
    sum += c.value;
  }
  return sum;
}

export { sonnebornBerger, sonnebornBerger as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';
