'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import PromotionOverlay from './PromotionOverlay';
import { minutesToSeconds, formatTime } from '../lib/utils';
import { findBestMove } from '../lib/chessEngine';

type Orientation = 'white' | 'black';

interface ChessBoardProps {
  orientation: Orientation;
  timeControl: number; // in minutes
  onGameEnd?: (result: 'win' | 'loss' | 'draw') => void;
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
  
  // Reference to the chessboard container
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // State initialization
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>([
    { fen: game.fen(), lastMove: null },
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

  function recordMove(move: Move) {
    const newFen = game.fen();
    const newHistoryItem: MoveHistoryItem = {
      fen: newFen,
      lastMove: { from: move.from, to: move.to },
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

  function makeAIMove() {
    if (game.turn() !== aiColor || game.isGameOver()) return;
    const bestMove = findBestMove(game, 3, aiColor);
    if (!bestMove) return;
    game.move(bestMove);
    recordMove(bestMove);
    checkGameStatus();
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

  // Fix piece dragging issues
  useEffect(() => {
    function fixDraggedPieceStyles() {
      const boardEl = boardContainerRef.current;
      if (!boardEl) return;
      
      // Set up a MutationObserver to detect when the piece-ghost element is added
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const dragGhost = boardEl.querySelector('.piece-ghost');
            if (dragGhost) {
              // Fix the position of the ghost piece
              (dragGhost as HTMLElement).style.position = 'absolute';
              (dragGhost as HTMLElement).style.pointerEvents = 'none';
              (dragGhost as HTMLElement).style.zIndex = '1000';
              (dragGhost as HTMLElement).style.transform = 'translate(-50%, -50%)';
            }
          }
        });
      });
      
      // Start observing
      observer.observe(boardEl, { childList: true, subtree: true });
      
      // Return cleanup function
      return () => observer.disconnect();
    }
    
    fixDraggedPieceStyles();
  }, []);

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

      {/* Chessboard - Using a custom wrapper div for better positioning context */}
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
          // Reduce the animation duration to make piece movement feel more responsive
          animationDuration={200}
        />
      </div>

      {/* Promotion overlay */}
      {pendingPromotion && (
        <PromotionOverlay
          color={pendingPromotion.color}
          onSelect={handlePromotionChoice}
          onCancel={handleCancelPromotion}
        />
      )}

      {/* Game message */}
      {gameMessage && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <h1 className="text-white text-2xl font-bold text-center p-4">
            {gameMessage}
          </h1>
        </div>
      )}

      {/* Global styles to fix drag issues */}
      <style jsx global>{`
        /* Ensure the board has the right positioning context */
        .chess-container {
          position: relative;
          overflow: visible;
        }
        
        /* Fix the board's structure */
        .chess-container > div {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        /* Make sure pieces are positioned correctly */
        .piece {
          transform-origin: center;
          will-change: transform;
        }
        
        /* Fix the dragging pieces */
        .piece-ghost {
          position: absolute !important;
          pointer-events: none !important;
          z-index: 1000 !important;
          transform: translate(-50%, -50%) !important;
          opacity: 0.8 !important;
        }
        
        /* Make sure squares are properly sized */
        .square {
          position: relative !important;
        }
      `}</style>
    </div>
  );
}