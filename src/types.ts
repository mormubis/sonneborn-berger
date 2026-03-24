type GameKind =
  | 'forfeit-loss'
  | 'forfeit-win'
  | 'full-bye'
  | 'half-bye'
  | 'pairing-bye'
  | 'zero-bye';

type Result = 0 | 0.5 | 1;

interface Game {
  black: string;
  kind?: GameKind;
  result: Result;
  white: string;
}

interface Player {
  id: string;
}

export type { Game, GameKind, Player, Result };
