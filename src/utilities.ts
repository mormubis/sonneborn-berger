import type { Game, GameKind } from './types.js';

const BYE_SENTINEL = '';

const VUR_KINDS = new Set<GameKind>(['forfeit-loss', 'half-bye', 'zero-bye']);

/**
 * Returns the game kind from a specific player's perspective.
 * For forfeits, the perspective matters: 'forfeit-win' from white's
 * perspective is 'forfeit-loss' from black's perspective.
 */
function playerGameKind(playerId: string, game: Game): GameKind | undefined {
  if (game.kind === undefined) {
    return undefined;
  }
  if (game.kind === 'forfeit-win') {
    return game.white === playerId ? 'forfeit-win' : 'forfeit-loss';
  }
  if (game.kind === 'forfeit-loss') {
    return game.white === playerId ? 'forfeit-loss' : 'forfeit-win';
  }
  return game.kind;
}

function isVUR(kind?: GameKind): boolean {
  return kind !== undefined && VUR_KINDS.has(kind);
}

function isUnplayed(kind?: GameKind): boolean {
  return kind !== undefined;
}

/**
 * FIDE 16.2.5: A requested bye is "terminal" if all subsequent rounds
 * for this player are also VURs (or it's the last round).
 */
function isTerminalBye(
  playerId: string,
  games: Game[][],
  roundIndex: number,
): boolean {
  for (let index = roundIndex + 1; index < games.length; index++) {
    for (const g of games[index] ?? []) {
      if (g.white === playerId || g.black === playerId) {
        const pKind = playerGameKind(playerId, g);
        if (!isVUR(pKind)) {
          return false;
        }
      }
    }
  }
  return true;
}

function gamesForPlayer(playerId: string, games: Game[][]): Game[] {
  return games
    .flat()
    .filter((g) => g.white === playerId || g.black === playerId);
}

/**
 * Raw score — sum of awarded points, no FIDE 16 adjustments.
 */
function score(playerId: string, games: Game[][]): number {
  let sum = 0;
  for (const g of gamesForPlayer(playerId, games)) {
    sum += g.white === playerId ? g.result : 1 - g.result;
  }
  return sum;
}

/**
 * FIDE 16.3: Adjusted score for the purpose of calculating opponents'
 * tiebreaks. Terminal requested byes (16.2.5) are evaluated as draws.
 */
function adjustedScore(playerId: string, games: Game[][]): number {
  let sum = 0;
  for (const [roundIndex, round] of games.entries()) {
    for (const g of round) {
      if (g.white !== playerId && g.black !== playerId) {
        continue;
      }
      const points = g.white === playerId ? g.result : 1 - g.result;
      const pKind = playerGameKind(playerId, g);
      sum +=
        (pKind === 'half-bye' || pKind === 'zero-bye') &&
        isTerminalBye(playerId, games, roundIndex)
          ? 0.5
          : points;
    }
  }
  return sum;
}

/**
 * FIDE 16.4: Dummy score for a participant's own unplayed round.
 * Dummy score = participant's score, capped at:
 * - 16.4.1: opponent's adjusted score (for forfeits)
 * - 16.4.2: 0.5 × total rounds (for other byes)
 */
function dummyScore(playerId: string, games: Game[][], game: Game): number {
  const playerOwnScore = score(playerId, games);
  const pKind = playerGameKind(playerId, game);
  if (pKind === 'forfeit-win' || pKind === 'forfeit-loss') {
    const opponentId = game.white === playerId ? game.black : game.white;
    if (opponentId === BYE_SENTINEL) {
      return Math.min(playerOwnScore, games.length * 0.5);
    }
    return Math.min(playerOwnScore, adjustedScore(opponentId, games));
  }
  return Math.min(playerOwnScore, games.length * 0.5);
}

export {
  BYE_SENTINEL,
  adjustedScore,
  dummyScore,
  gamesForPlayer,
  isTerminalBye,
  isUnplayed,
  isVUR,
  playerGameKind,
  score,
};
