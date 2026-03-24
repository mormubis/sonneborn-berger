import type { Game, GameKind } from './types.js';

const BYE_SENTINEL = '';

const VUR_KINDS = new Set<GameKind>(['forfeit-loss', 'half-bye', 'zero-bye']);

/**
 * Returns the game kind from a specific player's perspective.
 * For forfeits, the perspective matters: 'forfeit-win' from white's
 * perspective is 'forfeit-loss' from black's perspective.
 */
function playerGameKind(player: string, game: Game): GameKind | undefined {
  if (game.kind === undefined) {
    return undefined;
  }
  if (game.kind === 'forfeit-win') {
    return game.white === player ? 'forfeit-win' : 'forfeit-loss';
  }
  if (game.kind === 'forfeit-loss') {
    return game.white === player ? 'forfeit-loss' : 'forfeit-win';
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
  player: string,
  games: Game[][],
  roundIndex: number,
): boolean {
  for (let index = roundIndex + 1; index < games.length; index++) {
    for (const g of games[index] ?? []) {
      if (g.white === player || g.black === player) {
        const pKind = playerGameKind(player, g);
        if (!isVUR(pKind)) {
          return false;
        }
      }
    }
  }
  return true;
}

function gamesForPlayer(player: string, games: Game[][]): Game[] {
  return games.flat().filter((g) => g.white === player || g.black === player);
}

/**
 * Raw score — sum of awarded points, no FIDE 16 adjustments.
 */
function score(player: string, games: Game[][]): number {
  let sum = 0;
  for (const g of gamesForPlayer(player, games)) {
    sum += g.white === player ? g.result : 1 - g.result;
  }
  return sum;
}

/**
 * FIDE 16.3: Adjusted score for the purpose of calculating opponents'
 * tiebreaks. Terminal requested byes (16.2.5) are evaluated as draws.
 */
function adjustedScore(player: string, games: Game[][]): number {
  let sum = 0;
  for (const [roundIndex, round] of games.entries()) {
    for (const g of round) {
      if (g.white !== player && g.black !== player) {
        continue;
      }
      const points = g.white === player ? g.result : 1 - g.result;
      const pKind = playerGameKind(player, g);
      sum +=
        (pKind === 'half-bye' || pKind === 'zero-bye') &&
        isTerminalBye(player, games, roundIndex)
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
function dummyScore(player: string, games: Game[][], game: Game): number {
  const playerOwnScore = score(player, games);
  const pKind = playerGameKind(player, game);
  if (pKind === 'forfeit-win' || pKind === 'forfeit-loss') {
    const opponent = game.white === player ? game.black : game.white;
    if (opponent === BYE_SENTINEL) {
      return Math.min(playerOwnScore, games.length * 0.5);
    }
    return Math.min(playerOwnScore, adjustedScore(opponent, games));
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
