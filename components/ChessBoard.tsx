'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type Orientation = 'white' | 'black';

interface ChessBoardProps {
  orientation: Orientation;
  timeControl: number; // in minutes
  onGameEnd?: (result: 'win' | 'loss' | 'draw') => void;
}

function minutesToSeconds(minutes: number) {
  return minutes * 60;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface MoveHistoryItem {
  fen: string;
  lastMove: { from: string; to: string } | null;
}

export default function ChessBoard({
  orientation,
  timeControl,
  onGameEnd,
}: ChessBoardProps) {
  // Create the chess instance once
  const gameRef = useRef(new Chess());
  const game = gameRef.current;

  // State
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([
    { fen: game.fen(), lastMove: null },
  ]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [displayFen, setDisplayFen] = useState(game.fen());
  const [highlightSquares, setHighlightSquares] = useState<{
    [square: string]: React.CSSProperties;
  }>({});
  const [gameMessage, setGameMessage] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{
    [square: string]: React.CSSProperties;
  }>({});
  const [gameEnded, setGameEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const userColor = orientation === 'white' ? 'w' : 'b';
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // Clocks
  const initialTime = minutesToSeconds(timeControl);
  const [userTime, setUserTime] = useState(initialTime);
  const [aiTime, setAiTime] = useState(initialTime);

  // Promotion
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: 'w' | 'b';
  } | null>(null);

  // Helpers
  const highlightLastMove = useCallback((from: string, to: string) => {
    setHighlightSquares({
      [from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    });
  }, []);

  // Goes back exactly one move in the moveHistory
  const handleGoBack = useCallback(() => {
    if (currentPosition > 0) {
      const newPosition = currentPosition - 1;
      setCurrentPosition(newPosition);
      const historyItem = moveHistory[newPosition];
      setDisplayFen(historyItem.fen);

      if (historyItem.lastMove) {
        highlightLastMove(historyItem.lastMove.from, historyItem.lastMove.to);
      } else {
        setHighlightSquares({});
      }
      setSelectedSquare(null);
      setMoveSquares({});
    }
  }, [currentPosition, moveHistory, highlightLastMove]);

  // Goes forward exactly one move in the moveHistory
  const handleGoForward = useCallback(() => {
    if (currentPosition < moveHistory.length - 1) {
      const newPosition = currentPosition + 1;
      setCurrentPosition(newPosition);
      const historyItem = moveHistory[newPosition];
      setDisplayFen(historyItem.fen);

      if (historyItem.lastMove) {
        highlightLastMove(historyItem.lastMove.from, historyItem.lastMove.to);
      } else {
        setHighlightSquares({});
      }
      setSelectedSquare(null);
      setMoveSquares({});
    }
  }, [currentPosition, moveHistory, highlightLastMove]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleGoForward();
      }
    },
    [handleGoBack, handleGoForward]
  );

  // Are we at the "live" position?
  const isAtLivePosition = currentPosition === moveHistory.length - 1;

  // Record a move in the history (each half-move)
  function recordMove(move: Move) {
    const newFen = game.fen();
    const newHistoryItem: MoveHistoryItem = {
      fen: newFen,
      lastMove: { from: move.from, to: move.to },
    };

    setMoveHistory((prevHistory) => {
      // If at live position, just push
      // Otherwise, truncate and then push
      const newHistory = isAtLivePosition
        ? [...prevHistory, newHistoryItem]
        : [...prevHistory.slice(0, currentPosition + 1), newHistoryItem];

      setCurrentPosition(newHistory.length - 1);
      setDisplayFen(newFen);
      highlightLastMove(move.from, move.to);
      return newHistory;
    });

    setMoveCount((prevCount) => prevCount + 1);
  }

  // Check for checkmate, draw, etc.
  function checkGameStatus() {
    if (game.isCheckmate()) {
      const result = game.turn() === userColor ? 'loss' : 'win';
      if (result === 'win') {
        setGameMessage('Checkmate! You win. You gained +50 ELO.');
      } else {
        setGameMessage('Checkmate! You lose. You lost -50 ELO.');
      }
      if (!gameEnded && onGameEnd) {
        onGameEnd(result);
        setGameEnded(true);
      }
    } else if (game.isStalemate() || game.isDraw()) {
      setGameMessage("It's a draw!");
      if (!gameEnded && onGameEnd) {
        onGameEnd('draw');
        setGameEnded(true);
      }
    }
  }

  // The AI picks a random move (only if it's actually AI's turn)
  function makeAIMove() {
    // Ensure it's the AI's turn
    if (game.turn() !== aiColor) return;

    const moves = game.moves({ verbose: true }) as Move[];
    if (moves.length === 0 || game.isGameOver()) return;
    const randomIndex = Math.floor(Math.random() * moves.length);
    const aiMove = moves[randomIndex];
    game.move(aiMove);
    recordMove(aiMove);
    checkGameStatus();
  }

  // Make a user move
  function userMove(from: string, to: string, promotion?: string): boolean {
    if (!isAtLivePosition) {
      // Load the live position
      const liveFen = moveHistory[moveHistory.length - 1].fen;
      game.load(liveFen);
      setDisplayFen(liveFen);
      setCurrentPosition(moveHistory.length - 1);
    }

    const move = game.move({
      from: from as Square,
      to: to as Square,
      promotion,
    }) as Move | null;
    if (!move) return false;

    recordMove(move);
    checkGameStatus();
    setSelectedSquare(null);
    setMoveSquares({});

    // AI move if it's AI's turn
    setTimeout(() => {
      makeAIMove();
    }, 1500);

    return true;
  }

  // Check if we need to promote
  function tryMove(from: string, to: string) {
    const piece = game.get(from as Square);
    if (
      piece?.type === 'p' &&
      ((piece.color === 'w' && to.endsWith('8')) ||
        (piece.color === 'b' && to.endsWith('1')))
    ) {
      setPendingPromotion({ from: from as Square, to: to as Square, color: piece.color });
      return false;
    }
    return userMove(from, to);
  }

  // Chessboard callbacks
  function onDrop(sourceSquare: string, targetSquare: string) {
    if (game.turn() !== userColor) return false;
    return tryMove(sourceSquare, targetSquare);
  }

  function onSquareClick(square: string) {
    if (!isAtLivePosition || game.turn() !== userColor) return;
    if (selectedSquare && square !== selectedSquare && moveSquares[square]) {
      tryMove(selectedSquare, square);
      return;
    }
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setMoveSquares({});
      return;
    }
    const piece = game.get(square as Square);
    if (piece && piece.color === userColor) {
      // Show possible moves
      const moves = game.moves({ square: square as Square, verbose: true }) as Move[];
      const newSquares: { [sq: string]: React.CSSProperties } = {};

      moves.forEach((m) => {
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

  // Handle promotion
  function handlePromotionChoice(piece: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    userMove(from, to, piece);
  }

  function handleCancelPromotion() {
    setPendingPromotion(null);
  }

  // Keydown listener for arrow keys
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Make AI's first move if player is black
  useEffect(() => {
    // Only run this effect once when the component mounts
    if (!gameStarted && orientation === 'black') {
      setGameStarted(true);
      // Add a small delay to make it feel more natural
      setTimeout(() => {
        makeAIMove();
      }, 1500);
    }
  }, [orientation, gameStarted]);

  // Clock effect
  useEffect(() => {
    const clockInterval = setInterval(() => {
      if (gameMessage || game.isGameOver()) return;
      // Only tick the clock if we're at the live position
      if (currentPosition === moveHistory.length - 1) {
        const turn = game.turn();
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
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [userColor, gameMessage, currentPosition, moveHistory.length, game]);

  // Clocks + Move Display
  const userClock = formatTime(userTime);
  const aiClock = formatTime(aiTime);
  const moveDisplay = moveCount === 0 ? 'Game Start' : `Move ${moveCount}`;

  return (
    <div className="relative">
      {/* Move navigation */}
      <div className="flex items-center space-x-4 mb-2">
        <button
          onClick={handleGoBack}
          className="px-2 py-1 bg-gray-300 text-black rounded disabled:opacity-50"
          disabled={currentPosition <= 0}
        >
          ←
        </button>
        <button
          onClick={handleGoForward}
          className="px-2 py-1 bg-gray-300 text-black rounded disabled:opacity-50"
          disabled={currentPosition >= moveHistory.length - 1}
        >
          →
        </button>
        <div className="text-gray-200">{moveDisplay}</div>
        {currentPosition !== moveHistory.length - 1 && (
          <div className="text-yellow-400 text-sm">
            Viewing history - click arrows to navigate
          </div>
        )}
      </div>

      {/* Clocks */}
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

      {/* The chessboard */}
      <Chessboard
        position={displayFen}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        boardWidth={400}
        boardOrientation={orientation}
        customSquareStyles={{
          ...highlightSquares,
          ...moveSquares,
        }}
        customBoardStyle={{ background: 'transparent', boxShadow: 'none' }}
      />

      {/* Promotion overlay */}
      {pendingPromotion && (
        <PromotionOverlay
          color={pendingPromotion.color}
          onSelect={handlePromotionChoice}
          onCancel={handleCancelPromotion}
        />
      )}

      {/* Game message (checkmate/draw) */}
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
 * Promotion overlay for pawn promotion.
 */
function PromotionOverlay({
  color,
  onSelect,
  onCancel,
}: {
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}) {
  const pieceMap = {
    w: { q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658' },
    b: { q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E' },
  };
  const promotions: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n'];

  return (
    <div
      className="absolute inset-0 z-30 flex items-start justify-center"
      onClick={onCancel}
    >
      <div
        className="mt-4 p-4 bg-gray-800 text-white rounded shadow-md flex space-x-6"
        onClick={(e) => e.stopPropagation()}
      >
        {promotions.map((p) => (
          <div
            key={p}
            className="cursor-pointer transform transition-transform hover:scale-125"
            onClick={() => onSelect(p)}
          >
            <span className="text-5xl">{pieceMap[color][p]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}