import type { Game } from './types.js';

const BYE_SENTINEL = '';

function gamesForPlayer(playerId: string, games: Game[][]): Game[] {
  return games
    .flat()
    .filter((g) => g.white === playerId || g.black === playerId);
}

function score(playerId: string, games: Game[][]): number {
  let sum = 0;
  for (const g of gamesForPlayer(playerId, games)) {
    sum += g.white === playerId ? g.result : 1 - g.result;
  }
  return sum;
}

export { BYE_SENTINEL, gamesForPlayer, score };
