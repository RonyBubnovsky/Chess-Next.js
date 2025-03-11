import { Chess, Move } from 'chess.js';

export function evaluateBoard(gameInstance: Chess, aiColor: string): number {
  const values: { [piece: string]: number } = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };
  let evaluation = 0;
  const board = gameInstance.board();
  for (const row of board) {
    for (const piece of row) {
      if (piece) {
        const value = values[piece.type];
        evaluation += piece.color === aiColor ? value : -value;
      }
    }
  }
  return evaluation;
}

export function minimax(
  gameInstance: Chess,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiColor: string
): { evaluation: number; move?: Move } {
  if (depth === 0 || gameInstance.isGameOver()) {
    return { evaluation: evaluateBoard(gameInstance, aiColor) };
  }

  let bestMove: Move | undefined;
  const moves = gameInstance.moves({ verbose: true }) as Move[];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const result = minimax(gameInstance, depth - 1, false, alpha, beta, aiColor);
      gameInstance.undo();
      if (result.evaluation > maxEval) {
        maxEval = result.evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.evaluation);
      if (beta <= alpha) break;
    }
    return { evaluation: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const result = minimax(gameInstance, depth - 1, true, alpha, beta, aiColor);
      gameInstance.undo();
      if (result.evaluation < minEval) {
        minEval = result.evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, result.evaluation);
      if (beta <= alpha) break;
    }
    return { evaluation: minEval, move: bestMove };
  }
}

export function findBestMove(gameInstance: Chess, depth: number, aiColor: string): Move | null {
  const clonedGame = new Chess(gameInstance.fen());
  const result = minimax(clonedGame, depth, true, -Infinity, Infinity, aiColor);
  return result.move || null;
}
