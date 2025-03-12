/// <reference lib="webworker" />
import { Chess } from 'chess.js';
import { findBestMove } from '../lib/chessEngine';

addEventListener('message', (event) => {
  const { fen, aiColor, maxDepth } = event.data;
  const game = new Chess(fen);
  const bestMove = findBestMove(game, aiColor, maxDepth);
  postMessage(bestMove);
});
