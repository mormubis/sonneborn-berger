import { contributions } from './utilities.js';

import type { Tiebreak } from '@echecs/tournament';

const sonnebornBerger: Tiebreak = (player, rounds, _players) => {
  let sum = 0;
  for (const c of contributions(player, rounds)) {
    sum += c.value;
  }
  return sum;
};

export { sonnebornBerger, sonnebornBerger as tiebreak };

export type {
  Bye,
  CompletedRound,
  Game,
  Pairing,
  Player,
} from '@echecs/tournament';
