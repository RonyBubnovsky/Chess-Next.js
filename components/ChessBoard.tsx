'use client';

import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

export default function ChessBoard() {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameMessage, setGameMessage] = useState<string | null>(null);

  // Check for checkmate or stalemate
  const checkGameStatus = () => {
    if (game.isCheckmate()) {
      const msg =
        game.turn() === 'w'
          ? "Checkmate! You lose. A beautiful defeat indeed."
          : "Checkmate! You win. A brilliant victory!";
      setGameMessage(msg);
      return true;
    } else if (game.isStalemate()) {
      setGameMessage("Stalemate! It's a draw. No legal moves left.");
      return true;
    }
    return false;
  };

  // Handle piece drop
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = game.move({
      from: sourceSquare as Square,
      to: targetSquare as Square,
      promotion: 'q'
    });
    if (move === null) return false;

    setFen(game.fen());
    setSelectedSquare(null);
    setMoveSquares({});

    if (checkGameStatus()) return true;

    setTimeout(makeAIMove, 500);
    return true;
  };

  // Highlight legal moves on click
  const onSquareClick = (square: string) => {
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

  // AI makes a random move
  const makeAIMove = () => {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    setFen(game.fen());
    checkGameStatus();
  };

  return (
    <div className="relative max-w-md mx-auto">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={moveSquares}
        boardWidth={400}
      />
      {gameMessage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <h1 className="text-white text-2xl font-bold text-center p-4">
            {gameMessage}
          </h1>
        </div>
      )}
    </div>
  );
}
