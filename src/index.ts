import { contributions } from './utilities.js';

import type { Game } from '@echecs/tournament';

function sonnebornBerger(player: string, games: Game[][]): number {
  let sum = 0;
  for (const c of contributions(player, games)) {
    sum += c.value;
  }
  return sum;
}

export { sonnebornBerger, sonnebornBerger as tiebreak };

export type { Game, GameKind, Player, Result } from '@echecs/tournament';
