'use client';

import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type Orientation = 'white' | 'black';

interface ChessBoardProps {
  orientation: Orientation;
  timeControl: number; // in minutes
}

// Convert minutes to seconds for the clock
function minutesToSeconds(minutes: number) {
  return minutes * 60;
}

// Format seconds as mm:ss
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChessBoard({ orientation, timeControl }: ChessBoardProps) {
  const [game] = useState(new Chess());
  const [fen, setFen] = useState('start');
  const [gameMessage, setGameMessage] = useState<string | null>(null);

  // For click-to-move
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: React.CSSProperties }>({});

  // userColor vs. AI color
  const userColor = orientation === 'white' ? 'w' : 'b';
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // Time control in seconds
  const initialSeconds = minutesToSeconds(timeControl);
  const [userTime, setUserTime] = useState(initialSeconds);
  const [aiTime, setAiTime] = useState(initialSeconds);

  // For storing a pending promotion move
  // e.g. { from: 'e7', to: 'e8', color: 'w' }
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: 'w' | 'b';
  } | null>(null);

  // On mount, if user is black => let white (AI) move first
  useEffect(() => {
    if (userColor === 'b') {
      makeAIMove();
    }

    // Clock interval
    const clockInterval = setInterval(() => {
      if (gameMessage) return; // if game over, do nothing
      if (game.isGameOver()) return;

      // Whose turn is it?
      const turn = game.turn(); // 'w' or 'b'
      if (turn === userColor) {
        setUserTime((prev) => {
          if (prev <= 0) {
            setGameMessage('You ran out of time! You lose.');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setAiTime((prev) => {
          if (prev <= 0) {
            setGameMessage('AI ran out of time! You win.');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(clockInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Make a user move
  function userMove(from: string, to: string, promotion?: string): boolean {
    // Only allow user moves if it's userColor's turn
    if (game.turn() !== userColor) return false;

    const move = game.move({ from: from as Square, to: to as Square, promotion });
    if (!move) return false;

    setFen(game.fen());
    setSelectedSquare(null);
    setMoveSquares({});
    checkGameStatus();

    // If AI's turn
    if (!game.isGameOver() && game.turn() === aiColor) {
      setTimeout(makeAIMove, 500);
    }
    return true;
  }

  // Let AI do a random move
  function makeAIMove() {
    const moves = game.moves();
    if (moves.length === 0 || game.isGameOver()) return;
    const randomIndex = Math.floor(Math.random() * moves.length);
    game.move(moves[randomIndex]);
    setFen(game.fen());
    checkGameStatus();
  }

  // Check for checkmate/stalemate/draw
  function checkGameStatus() {
    if (game.isCheckmate()) {
      // If it's userColor's turn => user is in check => user lost
      // Otherwise => user delivered checkmate => user won
      if (game.turn() === userColor) {
        setGameMessage('Checkmate! You lose.');
      } else {
        setGameMessage('Checkmate! You win.');
      }
    } else if (game.isStalemate()) {
      setGameMessage("Stalemate! It's a draw. No legal moves left.");
    } else if (game.isDraw()) {
      setGameMessage("It's a draw! No progress can be made.");
    }
  }

  // Attempt a move that might be a promotion
  function tryMove(from: string, to: string) {
    const piece = game.get(from as Square);
    if (
      piece?.type === 'p' &&
      ((piece.color === 'w' && to.endsWith('8')) ||
        (piece.color === 'b' && to.endsWith('1')))
    ) {
      // It's a potential promotion
      setPendingPromotion({ from: from as Square, to: to as Square, color: piece.color });
      return false;
    }
    return userMove(from, to);
  }

  // Drag-and-drop
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // If not userColor's turn => do nothing
    if (game.turn() !== userColor) return false;
    return tryMove(sourceSquare, targetSquare);
  };

  // Click-to-move
  function onSquareClick(square: string) {
    if (game.turn() !== userColor) return; // only user color can move

    // If we have a selected square & the clicked square is one of the highlighted moves
    if (selectedSquare && square !== selectedSquare && moveSquares[square]) {
      tryMove(selectedSquare, square);
      return;
    }

    // If user clicks the same square => deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setMoveSquares({});
      return;
    }

    // Otherwise, highlight if the clicked square has a piece of userColor
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
  }

  // If user picks a piece in the promotion overlay
  function handlePromotionChoice(piece: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    userMove(from, to, piece);
  }

  // If user clicks away from promotion => discard
  function handleCancelPromotion() {
    setPendingPromotion(null);
  }

  // Format times
  const userClock = formatTime(userTime);
  const aiClock = formatTime(aiTime);

  return (
    <div className="relative">
      {/* Clock display */}
      <div className="flex justify-between items-center mb-2 text-white text-lg">
        {orientation === 'white' ? (
          <>
            <div>White Time: {userClock}</div>
            <div>Black Time: {aiClock}</div>
          </>
        ) : (
          <>
            <div>Black Time: {userClock}</div>
            <div>White Time: {aiClock}</div>
          </>
        )}
      </div>

      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardWidth={400}
        boardOrientation={orientation}
        customSquareStyles={moveSquares}
        customBoardStyle={{ background: 'transparent', boxShadow: 'none' }}
      />

      {/* Promotion Overlay if pending */}
      {pendingPromotion && (
        <PromotionOverlay
          color={pendingPromotion.color}
          onSelect={handlePromotionChoice}
          onCancel={handleCancelPromotion}
        />
      )}

      {/* If there's a game over message, show overlay */}
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
 * Renders a top-center overlay with 4 piece glyphs for promotion.
 * If user clicks outside, we cancel. If user clicks a glyph, we finalize that promotion.
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
  // Mapping color + piece to the correct Unicode glyph
  const pieceMap = {
    w: {
      q: '\u2655', // White Queen
      r: '\u2656', // White Rook
      b: '\u2657', // White Bishop
      n: '\u2658'  // White Knight
    },
    b: {
      q: '\u265B', // Black Queen
      r: '\u265C', // Black Rook
      b: '\u265D', // Black Bishop
      n: '\u265E'  // Black Knight
    }
  };

  // The 4 possible promotions in chess: Q, R, B, N
  const promotions: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n'];

  return (
    <div
      className="absolute inset-0 z-30 flex items-start justify-center"
      onClick={onCancel} // click outside => cancel
    >
      <div
        className="mt-4 p-4 bg-gray-800 text-white rounded shadow-md flex space-x-6"
        onClick={(e) => e.stopPropagation()} // prevent outside click
      >
        {promotions.map((p) => (
          <div
            key={p}
            className="cursor-pointer transform transition-transform hover:scale-125"
            onClick={() => onSelect(p)}
          >
            <span className="text-5xl">
              {pieceMap[color][p]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
