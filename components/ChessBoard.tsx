'use client';

import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type Orientation = 'white' | 'black';

export default function ModernChessBoard({ orientation }: { orientation: Orientation }) {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameMessage, setGameMessage] = useState<string | null>(null);

  // For storing a pending promotion move
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: 'w' | 'b';
  } | null>(null);

  // Derive userColor from orientation
  const userColor = orientation === 'white' ? 'w' : 'b';
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // Check checkmate/stalemate
  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      const msg =
        game.turn() === userColor
          ? 'Checkmate! You lose. A beautiful defeat indeed.'
          : 'Checkmate! You win. A brilliant victory!';
      setGameMessage(msg);
      return true;
    } else if (game.isStalemate()) {
      setGameMessage("Stalemate! It's a draw. No legal moves left.");
      return true;
    }
    return false;
  };

  // Make a move in the Chess object
  const handleMove = (from: Square, to: Square, promotion?: string) => {
    const move = game.move({ from, to, promotion });
    if (move === null) return false;

    setFen(game.fen());
    setSelectedSquare(null);
    setMoveSquares({});

    if (checkGameStatus()) return true;

    // After user moves, if it's AI's turn, let AI move
    if (game.turn() === aiColor) {
      setTimeout(makeAIMove, 500);
    }
    return true;
  };

  // Check if the move triggers a promotion
  const tryMove = (from: Square, to: Square) => {
    const piece = game.get(from);
    if (
      piece?.type === 'p' &&
      ((piece.color === 'w' && to.endsWith('8')) ||
        (piece.color === 'b' && to.endsWith('1')))
    ) {
      // It's a promotion. Show the top-center overlay.
      setPendingPromotion({ from, to, color: piece.color as 'w' | 'b' });
      return false;
    }
    // Otherwise, just do the move immediately
    return handleMove(from, to);
  };

  // Drag-and-drop
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Only allow user to move if it's userColor's turn
    if (game.turn() !== userColor) return false;
    return tryMove(sourceSquare as Square, targetSquare as Square);
  };

  // Click-to-move
  const onSquareClick = (square: string) => {
    if (game.turn() !== userColor) return;

    if (selectedSquare && square !== selectedSquare && moveSquares[square]) {
      const success = tryMove(selectedSquare as Square, square as Square);
      if (success) return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setMoveSquares({});
      return;
    }

    const piece = game.get(square as Square);
    if (piece && piece.color === userColor) {
      const moves = game.moves({ square: square as Square, verbose: true });
      const newSquares: { [sq: string]: React.CSSProperties } = {};
      moves.forEach((m: any) => {
        newSquares[m.to] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' };
      });
      newSquares[square] = { backgroundColor: 'rgba(255, 255, 0, 0.6)' };
      setSelectedSquare(square);
      setMoveSquares(newSquares);
    } else {
      setSelectedSquare(null);
      setMoveSquares({});
    }
  };

  // AI move
  const makeAIMove = () => {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;

    if (game.turn() === aiColor) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      game.move(possibleMoves[randomIndex]);
      setFen(game.fen());
      checkGameStatus();
    }
  };

  // User picks a piece for promotion
  const handlePromotionChoice = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    handleMove(from, to, piece);
  };

  // If user is black, white moves first
  useEffect(() => {
    if (userColor === 'b') {
      makeAIMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userColor]);

  return (
    <div className="relative">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardWidth={400}
        boardOrientation={orientation}
        customBoardStyle={{ background: 'transparent', boxShadow: 'none' }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customSquareStyles={moveSquares}
      />

      {/* Promotion overlay if we have a pendingPromotion */}
      {pendingPromotion && (
        <PromotionOverlay
          color={pendingPromotion.color}
          onSelect={handlePromotionChoice}
          onCancel={() => setPendingPromotion(null)} // user clicks away => dismiss
        />
      )}

      {/* If game is over, show a message overlay */}
      {gameMessage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <h1 className="text-white text-2xl font-bold text-center p-4">
            {gameMessage}
          </h1>
        </div>
      )}
    </div>
  );
}

/**
 * PromotionOverlay always appears at the top center of the board.
 * The user can click outside to cancel or pick a piece to finalize promotion.
 */
function PromotionOverlay({
  color,
  onSelect,
  onCancel
}: {
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}) {
  // Piece icons
  const pieceMap = {
    q: color === 'w' ? '♕' : '♛',
    r: color === 'w' ? '♖' : '♜',
    b: color === 'w' ? '♗' : '♝',
    n: color === 'w' ? '♘' : '♞'
  };

  return (
    // Full overlay covers the board
    <div
      className="absolute inset-0 z-30 flex items-start justify-center"
      onClick={onCancel} // if user clicks outside the promotion box, we cancel
    >
      {/* The "modal" at top center. Stop clicks from bubbling up. */}
      <div
        className="mt-2 p-4 bg-gray-200 text-black rounded shadow-md flex space-x-3"
        onClick={(e) => e.stopPropagation()}
      >
        {(['q', 'r', 'b', 'n'] as const).map((p) => (
          <button
            key={p}
            className="px-3 py-2 bg-white border hover:bg-gray-300 rounded text-2xl"
            onClick={() => onSelect(p)}
          >
            {pieceMap[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
