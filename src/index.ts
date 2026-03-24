import { BYE_SENTINEL, gamesForPlayer, score } from './utilities.js';

import type { Game } from './types.js';

function sonnebornBerger(playerId: string, games: Game[][]): number {
  let sum = 0;
  for (const g of gamesForPlayer(playerId, games)) {
    if (g.blackId === BYE_SENTINEL || g.whiteId === BYE_SENTINEL) {
      continue;
    }
    const opponentId = g.whiteId === playerId ? g.blackId : g.whiteId;
    const playerResult = g.whiteId === playerId ? g.result : 1 - g.result;
    sum += playerResult * score(opponentId, games);
  }
  return sum;
}

function sonnebornBergerCut1(playerId: string, games: Game[][]): number {
  const contributions: { contribution: number; opponentScore: number }[] = [];
  for (const g of gamesForPlayer(playerId, games)) {
    if (g.blackId === BYE_SENTINEL || g.whiteId === BYE_SENTINEL) {
      continue;
    }
    const opponentId = g.whiteId === playerId ? g.blackId : g.whiteId;
    const playerResult = g.whiteId === playerId ? g.result : 1 - g.result;
    const opponentScore = score(opponentId, games);
    contributions.push({
      contribution: playerResult * opponentScore,
      opponentScore,
    });
  }
  if (contributions.length === 0) {
    return 0;
  }
  contributions.sort((a, b) => {
    if (a.opponentScore !== b.opponentScore) {
      return a.opponentScore - b.opponentScore;
    }
    return a.contribution - b.contribution;
  });
  return contributions.slice(1).reduce((sum, c) => sum + c.contribution, 0);
}

export { sonnebornBerger, sonnebornBergerCut1 };

export type { Game, Player, Result } from './types.js';
