'use client';

import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function squareToCoords(sq: string) {
  const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(sq[1], 10) - 1;
  return { file, rank };
}

export default function ModernChessBoard() {
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

  // Check checkmate/stalemate
  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      const msg =
        game.turn() === 'w'
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

    setTimeout(makeAIMove, 500);
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
      // It's a promotion
      setPendingPromotion({ from, to, color: piece.color as 'w' | 'b' });
      return false;
    }
    return handleMove(from, to);
  };

  // Drag-and-drop
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    return tryMove(sourceSquare as Square, targetSquare as Square);
  };

  // Click-to-move
  const onSquareClick = (square: string) => {
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
    if (piece && piece.color === 'w') {
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

  // Random AI move
  const makeAIMove = () => {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    setFen(game.fen());
    checkGameStatus();
  };

  // User picks a piece for promotion
  const handlePromotionChoice = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    handleMove(from, to, piece);
  };

  return (
    // Full-page dark gradient
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center p-4 overflow-hidden">
      {/* Title at the top, clearly visible */}
      <h1 className="text-3xl font-bold text-white mb-6">Chess Game</h1>

      {/* Board container */}
      <div className="relative">
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          boardWidth={400}
          // Force transparent background for the board
          customBoardStyle={{ 
            background: 'transparent',
            boxShadow: 'none'
          }}
          // Optionally customize squares for standard chess color
          customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
          customDarkSquareStyle={{ backgroundColor: '#b58863' }}
          customSquareStyles={moveSquares}
          id="chess-board"
        />

        {/* Promotion squares if we have a pendingPromotion */}
        {pendingPromotion && (
          <PromotionSquares
            pendingPromotion={pendingPromotion}
            onSelect={handlePromotionChoice}
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

      {/* Additional global CSS to ensure no white backgrounds */}
      <style jsx global>{`
        #chess-board {
          background: transparent !important;
          box-shadow: none !important;
        }
        #chess-board > div,
        #chess-board > div > div {
          background: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}

/**
 * Renders 4 mini squares near the promotion square with piece icons
 */
function PromotionSquares({
  pendingPromotion,
  onSelect
}: {
  pendingPromotion: { from: Square; to: Square; color: 'w' | 'b' };
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
}) {
  const { to, color } = pendingPromotion;
  const { file, rank } = squareToCoords(to);

  const squareSize = 400 / 8; // 50
  const offsetX = file * squareSize;
  let offsetY = (8 - rank - 1) * squareSize;

  // If white, place squares "above"; if black, place squares "below"
  if (color === 'w') {
    offsetY -= squareSize * 3;
  } else {
    offsetY += squareSize;
  }

  // Use Unicode pieces or images
  const pieceMap = {
    q: color === 'w' ? '♕' : '♛',
    r: color === 'w' ? '♖' : '♜',
    b: color === 'w' ? '♗' : '♝',
    n: color === 'w' ? '♘' : '♞'
  };

  return (
    <div
      className="absolute z-30 transition-transform"
      style={{
        width: `${squareSize}px`,
        height: `${squareSize * 4}px`,
        left: offsetX,
        top: offsetY,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {(['q', 'r', 'b', 'n'] as const).map((p) => (
        <div
          key={p}
          className="w-full h-full flex items-center justify-center bg-white text-black 
                     cursor-pointer hover:bg-gray-200 border border-gray-400"
          style={{
            height: `${squareSize}px`
          }}
          onClick={() => onSelect(p)}
        >
          <span style={{ fontSize: '1.5rem' }}>{pieceMap[p]}</span>
        </div>
      ))}
    </div>
  );
}
