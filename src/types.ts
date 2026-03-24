type Result = 0 | 0.5 | 1;

interface Game {
  black: string;
  result: Result;
  white: string;
}

interface Player {
  id: string;
}

export type { Game, Player, Result };
