type Result = 0 | 0.5 | 1;

interface Game {
  blackId: string;
  result: Result;
  round: number;
  whiteId: string;
}

interface Player {
  id: string;
}

export type { Game, Player, Result };
