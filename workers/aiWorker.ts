/// <reference lib="webworker" />
import { Chess, Move as ChessMove } from 'chess.js';
import { findBestMove } from '../lib/chessEngine';

addEventListener('message', (event) => {
  try {
    const { fen, aiColor, maxDepth = 3 } = event.data;

    // Create game instance
    const game = new Chess(fen);

    // Validate turn
    if (game.turn() !== aiColor) {
      throw new Error('Not AI\'s turn');
    }

    // Find best move
    const bestMove = findBestMove(game, aiColor, maxDepth);

    // Extensive move validation
    if (!bestMove) {
      throw new Error('No valid move found');
    }

    // Verify the move is valid by getting verbose moves
    const validMoves = game.moves({ verbose: true }) as ChessMove[];
    const validMove = validMoves.find(
      move => move.from === bestMove.from && move.to === bestMove.to
    );

    if (!validMove) {
      throw new Error(`Invalid move: from ${bestMove.from} to ${bestMove.to}`);
    }

    // Ensure promotion is handled if applicable
    const moveToSend = {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion || undefined
    };

    postMessage({
      move: moveToSend,
      success: true
    });

  } catch (error) {
    console.error('Worker error:', error);
    postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      move: null
    });
  }
});