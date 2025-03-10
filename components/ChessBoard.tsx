'use client';

import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type Orientation = 'white' | 'black';

function squareToCoords(sq: string) {
  const file = sq.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(sq[1], 10) - 1;
  return { file, rank };
}

export default function ChessBoard({ orientation }: { orientation: Orientation }) {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameMessage, setGameMessage] = useState<string | null>(null);

  // Promotion
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: 'w' | 'b';
  } | null>(null);

  // Derive userColor from orientation
  const userColor = orientation === 'white' ? 'w' : 'b';
  // AI color is the opposite
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // Checkmate/stalemate
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

  // Make a move
  const handleMove = (from: Square, to: Square, promotion?: string) => {
    const move = game.move({ from, to, promotion });
    if (move === null) return false;

    setFen(game.fen());
    setSelectedSquare(null);
    setMoveSquares({});

    if (checkGameStatus()) return true;

    // After user moves, let AI move if it's AI's turn
    if (game.turn() === aiColor) {
      setTimeout(makeAIMove, 500);
    }
    return true;
  };

  // If a move triggers promotion
  const tryMove = (from: Square, to: Square) => {
    const piece = game.get(from);
    if (
      piece?.type === 'p' &&
      ((piece.color === 'w' && to.endsWith('8')) ||
        (piece.color === 'b' && to.endsWith('1')))
    ) {
      setPendingPromotion({ from, to, color: piece.color as 'w' | 'b' });
      return false;
    }
    return handleMove(from, to);
  };

  // Drag-and-drop
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Only allow user to drop if it's userColor's turn
    if (game.turn() !== userColor) return false;
    return tryMove(sourceSquare as Square, targetSquare as Square);
  };

  // Click-to-move
  const onSquareClick = (square: string) => {
    // If not userColor's turn, ignore
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
    // Only highlight if piece.color == userColor
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
    // If the game is over or no moves
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;

    // If it's AI's turn, pick random move
    if (game.turn() === aiColor) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      game.move(possibleMoves[randomIndex]);
      setFen(game.fen());
      checkGameStatus();
    }
  };

  // Promotion choice
  const handlePromotionChoice = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    handleMove(from, to, piece);
  };

  // If user is black, white moves first automatically (the AI).
  // We'll do this once at mount:
  useEffect(() => {
    if (userColor === 'b') {
      // White moves first => AI is white => let AI do a move
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
        boardOrientation={orientation} // flip if orientation=black
        customBoardStyle={{ 
          background: 'transparent',
          boxShadow: 'none'
        }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
        customSquareStyles={moveSquares}
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
  );
}

/** Promotion UI (unchanged) */
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

  if (color === 'w') {
    offsetY -= squareSize * 3;
  } else {
    offsetY += squareSize;
  }

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
