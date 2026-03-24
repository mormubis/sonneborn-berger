import { contributions } from './utilities.js';

import type { Game } from './types.js';

function sonnebornBerger(player: string, games: Game[][]): number {
  let sum = 0;
  for (const c of contributions(player, games)) {
    sum += c.value;
  }
  return sum;
}

export { sonnebornBerger };
