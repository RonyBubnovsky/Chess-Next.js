'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import PromotionOverlay from './PromotionOverlay';
import MaterialTracker from './MaterialTracker';
import { minutesToSeconds, formatTime } from '../lib/utils';

type Orientation = 'white' | 'black';
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q';
type PieceColor = 'w' | 'b';

interface CapturedPiece {
  type: PieceType;
  color: PieceColor;
}

interface ChessBoardProps {
  orientation: Orientation;
  timeControl: number; // in minutes
  onGameEnd?: (result: 'win' | 'loss' | 'draw') => void;
}

interface MoveHistoryItem {
  fen: string;
  lastMove: { from: string; to: string } | null;
  capturedPiece: CapturedPiece | null;
}

// Define a type for minimal move input.
interface MoveInputType {
  from: Square;
  to: Square;
  promotion?: string;
}

export default function ChessBoard({
  orientation,
  timeControl,
  onGameEnd,
}: ChessBoardProps) {
  // Create the chess instance once
  const gameRef = useRef(new Chess());
  const game = gameRef.current;
  
  // Reference to the chessboard container
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // State initialization
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([
    { fen: game.fen(), lastMove: null, capturedPiece: null },
  ]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [displayFen, setDisplayFen] = useState(game.fen());
  const [highlightSquares, setHighlightSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameMessage, setGameMessage] = useState<string | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameEnded, setGameEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Material tracking
  const [capturedByUser, setCapturedByUser] = useState<CapturedPiece[]>([]);
  const [capturedByAI, setCapturedByAI] = useState<CapturedPiece[]>([]);

  const userColor = orientation === 'white' ? 'w' : 'b';
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // Clocks
  const initialTime = minutesToSeconds(timeControl);
  const [userTime, setUserTime] = useState(initialTime);
  const [aiTime, setAiTime] = useState(initialTime);

  // Promotion
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square; color: 'w' | 'b'; } | null>(null);

  // Helpers
  const highlightLastMove = useCallback((from: string, to: string) => {
    setHighlightSquares({
      [from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    });
  }, []);

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

  const isAtLivePosition = currentPosition === moveHistory.length - 1;
  
  function updateCapturedPieces(capturedPiece: CapturedPiece | null, byPlayer: boolean) {
    if (!capturedPiece) return;
    
    if (byPlayer) {
      setCapturedByUser(prev => [...prev, capturedPiece]);
    } else {
      setCapturedByAI(prev => [...prev, capturedPiece]);
    }
  }

  function recordMove(move: Move) {
    const newFen = game.fen();
    
    // Check if a piece was captured
    let capturedPiece: CapturedPiece | null = null;
    if (move.captured) {
      capturedPiece = {
        type: move.captured as PieceType,
        color: move.color === 'w' ? 'b' : 'w'
      };
      
      // Update captured pieces based on who made the move
      const byPlayer = move.color === userColor;
      updateCapturedPieces(capturedPiece, byPlayer);
    }
    
    const newHistoryItem: MoveHistoryItem = {
      fen: newFen,
      lastMove: { from: move.from, to: move.to },
      capturedPiece
    };

    setMoveHistory((prevHistory) => {
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

  function checkGameStatus() {
    if (game.isCheckmate()) {
      const result = game.turn() === userColor ? 'loss' : 'win';
      setGameMessage(result === 'win' ? 'Checkmate! You win. You gained +50 ELO.' : 'Checkmate! You lose. You lost -50 ELO.');
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

  function endGameByTime(timeoutColor: 'w' | 'b') {
    if (gameEnded) return;
    
    let result: 'win' | 'loss' | 'draw';
    let message: string;
    
    if (timeoutColor === userColor) {
      result = 'loss';
      message = 'You ran out of time! You lose. You lost -50 ELO.';
    } else {
      result = 'win';
      message = 'AI ran out of time! You win. You gained +50 ELO.';
    }
    
    setGameMessage(message);
    
    if (onGameEnd) {
      onGameEnd(result);
      setGameEnded(true);
    }
  }

  // Use a Web Worker to compute the AI move in a separate thread
  function makeAIMove() {
    if (game.turn() !== aiColor || game.isGameOver()) return;
    
    const aiWorker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url));
    
    // Post the current game state to the worker
    aiWorker.postMessage({
      fen: game.fen(),
      aiColor,
      maxDepth: 3,
    });
    
    aiWorker.onmessage = (event) => {
      const bestMove = event.data as Move | null;
      if (bestMove) {
        // Build a minimal move input using our defined type.
        const moveInput: MoveInputType = { from: bestMove.from, to: bestMove.to, promotion: bestMove.promotion };
        const moveMade = game.move(moveInput);
        if (moveMade) {
          recordMove(moveMade);
          checkGameStatus();
        }
      }
      aiWorker.terminate();
    };

    aiWorker.onerror = (error) => {
      console.error('AI Worker error:', error);
      aiWorker.terminate();
    };
  }

  function userMove(from: string, to: string, promotion?: string): boolean {
    if (!isAtLivePosition) {
      const liveFen = moveHistory[moveHistory.length - 1].fen;
      game.load(liveFen);
      setDisplayFen(liveFen);
      setCurrentPosition(moveHistory.length - 1);
    }
    const move = game.move({ from: from as Square, to: to as Square, promotion }) as Move | null;
    if (!move) return false;

    recordMove(move);
    checkGameStatus();
    setSelectedSquare(null);
    setMoveSquares({});

    setTimeout(() => {
      makeAIMove();
    }, 1500);

    return true;
  }

  function tryMove(from: string, to: string) {
    const piece = game.get(from as Square);
    if (
      piece?.type === 'p' &&
      ((piece.color === 'w' && to.endsWith('8')) || (piece.color === 'b' && to.endsWith('1')))
    ) {
      setPendingPromotion({ from: from as Square, to: to as Square, color: piece.color });
      return false;
    }
    return userMove(from, to);
  }

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

  function handlePromotionChoice(piece: 'q' | 'r' | 'b' | 'n') {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    userMove(from, to, piece);
  }

  function handleCancelPromotion() {
    setPendingPromotion(null);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameStarted && orientation === 'black') {
      setGameStarted(true);
      setTimeout(() => {
        makeAIMove();
      }, 1500);
    }
  }, [orientation, gameStarted]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      if (gameEnded || game.isGameOver()) return;
      if (currentPosition === moveHistory.length - 1) {
        const turn = game.turn();
        if (turn === userColor) {
          setUserTime((prev) => {
            if (prev <= 1) {
              endGameByTime(userColor);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setAiTime((prev) => {
            if (prev <= 1) {
              endGameByTime(aiColor);
              return 0;
            }
            return prev - 1;
          });
        }
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [userColor, aiColor, gameEnded, currentPosition, moveHistory.length, game]);

  const userClock = formatTime(userTime);
  const aiClock = formatTime(aiTime);
  const moveDisplay = moveCount === 0 ? 'Game Start' : `Move ${moveCount}`;

  return (
    <div className="relative">
      <MaterialTracker
        capturedByUser={capturedByUser}
        capturedByAI={capturedByAI}
        userColor={userColor}
      />

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

      <div 
        ref={boardContainerRef}
        className="chess-container relative" 
        style={{ width: '400px', height: '400px' }}
      >
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
          customBoardStyle={{ 
            background: 'transparent', 
            boxShadow: 'none'
          }}
          arePiecesDraggable={false}
          animationDuration={200}
        />
      </div>

      {pendingPromotion && (
        <PromotionOverlay
          color={pendingPromotion.color}
          onSelect={handlePromotionChoice}
          onCancel={handleCancelPromotion}
        />
      )}

      {gameMessage && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-6 rounded shadow-lg z-20 max-w-2xl w-full">
          <h1 className="text-5xl font-bold text-center">
            {gameMessage}
          </h1>
        </div>
      )}
    </div>
  );
}
