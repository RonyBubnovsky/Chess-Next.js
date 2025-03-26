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
  onGameEnd?: (result: 'win' | 'loss' | 'draw', gameRecord: {
    result: 'win' | 'loss' | 'draw';
    date: string;
    moveHistory: MoveHistoryItem[];
  }) => void;
  freshStart?: boolean; // if true, ignore saved sessionStorage state on initial load
}

interface MoveHistoryItem {
  fen: string;
  lastMove: { from: string; to: string } | null;
  capturedPiece: CapturedPiece | null;
}

interface MoveInputType {
  from: Square;
  to: Square;
  promotion?: string;
}

export default function ChessBoard({
  orientation,
  timeControl,
  onGameEnd,
  freshStart = false,
}: ChessBoardProps) {
  // Create the chess instance once.
  const gameRef = useRef(new Chess());
  const game = gameRef.current;
  
  // Reference for the chessboard container.
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // A ref to track the current AI request id.
  const aiRequestId = useRef(0);

  const getSavedState = () => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('chessGameState');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  };

  // Calculate initial time in seconds.
  const initialTime = timeControl === 0 ? Infinity : minutesToSeconds(timeControl);

  // For timer dynamic update, adjust saved times using lastTimestamp.
  const adjustTime = (savedTime: number) => {
    const saved = getSavedState();
    if (saved.lastTimestamp) {
      const elapsed = Math.floor((Date.now() - saved.lastTimestamp) / 1000);
      return Math.max(savedTime - elapsed, 0);
    }
    return savedTime;
  };

  // Initialize state. If freshStart is true, we use default values.
  const [moveHistory, setMoveHistory] = useState<MoveHistoryItem[]>(() => {
    if (freshStart) return [{ fen: game.fen(), lastMove: null, capturedPiece: null }];
    const saved = getSavedState();
    return saved.moveHistory || [{ fen: game.fen(), lastMove: null, capturedPiece: null }];
  });
  const [currentPosition, setCurrentPosition] = useState<number>(() => {
    if (freshStart) return 0;
    const saved = getSavedState();
    return saved.currentPosition ?? 0;
  });
  const [moveCount, setMoveCount] = useState<number>(() => {
    if (freshStart) return 0;
    const saved = getSavedState();
    return saved.moveCount ?? 0;
  });
  const [displayFen, setDisplayFen] = useState<string>(() => {
    if (freshStart) return game.fen();
    const saved = getSavedState();
    return saved.displayFen || game.fen();
  });
  const [highlightSquares, setHighlightSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameMessage, setGameMessage] = useState<string | null>(() => {
    if (freshStart) return null;
    const saved = getSavedState();
    return saved.gameMessage || null;
  });
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ [square: string]: React.CSSProperties }>({});
  const [gameEnded, setGameEnded] = useState<boolean>(() => {
    if (freshStart) return false;
    const saved = getSavedState();
    return saved.gameEnded || false;
  });
  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    if (freshStart) return false;
    const saved = getSavedState();
    return saved.gameStarted || false;
  });

  // Material tracking.
  const [capturedByUser, setCapturedByUser] = useState<CapturedPiece[]>(() => {
    if (freshStart) return [];
    const saved = getSavedState();
    return saved.capturedByUser || [];
  });
  const [capturedByAI, setCapturedByAI] = useState<CapturedPiece[]>(() => {
    if (freshStart) return [];
    const saved = getSavedState();
    return saved.capturedByAI || [];
  });
  const [promotionBonusUser, setPromotionBonusUser] = useState<number>(() => {
    if (freshStart) return 0;
    const saved = getSavedState();
    return saved.promotionBonusUser || 0;
  });
  const [promotionBonusAI, setPromotionBonusAI] = useState<number>(() => {
    if (freshStart) return 0;
    const saved = getSavedState();
    return saved.promotionBonusAI || 0;
  });

  const [shouldPersist, setShouldPersist] = useState(!freshStart); 

  
  useEffect(() => {
    if (freshStart) {
      // Wait 500ms before enabling persistence so that the fresh state is fully in place.
      const timeout = setTimeout(() => {
        setShouldPersist(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [freshStart]);

  const userColor = orientation === 'white' ? 'w' : 'b';
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // Clocks (Infinity if timeControl is 0).
  // Create a temporary game using the saved FEN (if any) so we get the correct turn.
  const savedState = getSavedState();
  const savedFen = savedState.displayFen || new Chess().fen();
  const tmpGame = new Chess(savedFen);

  const [userTime, setUserTime] = useState<number>(() => {
    if (freshStart) return initialTime;
    const saved = getSavedState();
    const savedTime = saved.userTime ?? initialTime;
    return tmpGame.turn() === userColor ? adjustTime(savedTime) : savedTime;
  });
  const [aiTime, setAiTime] = useState<number>(() => {
    if (freshStart) return initialTime;
    const saved = getSavedState();
    const savedTime = saved.aiTime ?? initialTime;
    return tmpGame.turn() === aiColor ? adjustTime(savedTime) : savedTime;
  });
  const timerActive = timeControl !== 0;

  // Promotion state.
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square; color: 'w' | 'b'; } | null>(null);

  // New state for the square where the king is in check.
  const [checkSquare, setCheckSquare] = useState<string | null>(null);

  // Sync chess.js instance with displayFen.
  useEffect(() => {
    game.load(displayFen);
  }, [displayFen, game]);

  // Update checkSquare whenever the board changes.
  useEffect(() => {
    if (game.inCheck()) {
      // Find the king's square for the player whose turn it is.
      const board = game.board();
      let kingSquare: string | null = null;
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = board[rank][file];
          if (piece && piece.type === 'k' && piece.color === game.turn()) {
            const fileLetter = String.fromCharCode('a'.charCodeAt(0) + file);
            const rankNumber = 8 - rank;
            kingSquare = fileLetter + rankNumber;
            break;
          }
        }
        if (kingSquare) break;
      }
      setCheckSquare(kingSquare);
    } else {
      setCheckSquare(null);
    }
  }, [displayFen, game]);

  // Persist state to sessionStorage.
  useEffect(() => {
    if (!shouldPersist) return; // Do not persist until the fresh start delay has passed.
    if (typeof window !== 'undefined') {
      if (gameEnded) {
        sessionStorage.removeItem('chessGameState');
      } else {
        const gameState = {
          moveHistory,
          currentPosition,
          moveCount,
          displayFen,
          gameMessage,
          capturedByUser,
          capturedByAI,
          promotionBonusUser,
          promotionBonusAI,
          userTime,
          aiTime,
          gameStarted,
          gameEnded,
          orientation,
          timeControl,
          lastTimestamp: Date.now(), // timestamp for timer adjustment on refresh
        };
        sessionStorage.setItem('chessGameState', JSON.stringify(gameState));
      }
    }
  }, [
    moveHistory,
    currentPosition,
    moveCount,
    displayFen,
    gameMessage,
    capturedByUser,
    capturedByAI,
    promotionBonusUser,
    promotionBonusAI,
    userTime,
    aiTime,
    gameStarted,
    gameEnded,
    orientation,
    timeControl,
    shouldPersist,
  ]);
  

  // Generic effect to trigger AI move if it's AI's turn.
  useEffect(() => {
    if (isAtLivePosition() && game.turn() !== userColor && !game.isGameOver()) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [displayFen, userColor]);

  // Helper: check if we are at live position.
  const isAtLivePosition = () => currentPosition === moveHistory.length - 1;

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
    let capturedPiece: CapturedPiece | null = null;
    if (move.captured) {
      capturedPiece = {
        type: move.captured as PieceType,
        color: move.color === 'w' ? 'b' : 'w'
      };
      updateCapturedPieces(capturedPiece, move.color === userColor);
    }
  
    const newHistoryItem: MoveHistoryItem = {
      fen: newFen,
      lastMove: { from: move.from, to: move.to },
      capturedPiece,
    };
  
    setMoveHistory(prev => {
      const newHistory = isAtLivePosition()
        ? [...prev, newHistoryItem]
        : [...prev.slice(0, currentPosition + 1), newHistoryItem];
      setCurrentPosition(newHistory.length - 1);
      setDisplayFen(newHistoryItem.fen);
      highlightLastMove(move.from, move.to);
      return newHistory;
    });
  
    setMoveCount(prev => prev + 1);
  
    // Delay checkGameStatus until after React flushes the updated moveHistory
    setTimeout(checkGameStatus, 1);
  }
  

  // Helper function to finish the game by removing the saved state.
  function finishGame(result: 'win' | 'loss' | 'draw', message: string) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chessGameState');
      console.log('Session storage cleared:', sessionStorage.getItem('chessGameState'));
    }
    setGameMessage(message);
    if (onGameEnd) {
      const gameRecord = {
        result,
        date: new Date().toISOString(),
        moveHistory,
        orientation: userColor,
      };
      onGameEnd(result, gameRecord);
    }
    setGameEnded(true);
  }

  function checkGameStatus() {
    const historyVerbose = game.history({ verbose: true });
    if (historyVerbose.length === 0) return; // nothing to record
  
    const lastMove = historyVerbose[historyVerbose.length - 1];
    const capturedPiece: CapturedPiece | null = lastMove.captured
      ? { type: lastMove.captured as PieceType, color: (lastMove.color === 'w' ? 'b' : 'w') as PieceColor }
      : null;
  
    const finalItem: MoveHistoryItem = {
      fen: game.fen(),
      lastMove: { from: lastMove.from, to: lastMove.to },
      capturedPiece,
    };
  
    setMoveHistory(prev => {
      const newHistory = isAtLivePosition()
        ? [...prev, finalItem]
        : [...prev.slice(0, currentPosition + 1), finalItem];
      setCurrentPosition(newHistory.length - 1);
      setDisplayFen(finalItem.fen);
      highlightLastMove(lastMove.from, lastMove.to);
      return newHistory;
    });
  
    let result: 'win' | 'loss' | 'draw';
    let message: string;
  
    if (game.isCheckmate()) {
      result = game.turn() === userColor ? 'loss' : 'win';
      message = result === 'win'
        ? 'Checkmate! You win. You gained +50 ELO.'
        : 'Checkmate! You lose. You lost -50 ELO.';
    } else if (game.isStalemate()) {
      result = 'draw'; message = "Stalemate! No legal moves and you're not in check.";
    } else if (game.isThreefoldRepetition()) {
      result = 'draw'; message = "Draw by threefold repetition!";
    } else if (game.isInsufficientMaterial()) {
      result = 'draw'; message = "Draw due to insufficient material!";
    } else if (game.isDrawByFiftyMoves()) {
      result = 'draw'; message = "Draw by the 50‑move rule!";
    } else {
      return;
    }
  
    finishGame(result, message);
  }    
  

  function endGameByTime(timeoutColor: 'w' | 'b') {
    if (gameEnded) return;
    if (timeoutColor === userColor) {
      finishGame('loss', 'You ran out of time! You lose. You lost -50 ELO.');
    } else {
      finishGame('win', 'AI ran out of time! You win. You gained +50 ELO.');
    }
  }

  // Resign functionality: when the user clicks resign, end the game as a loss.
  function handleResign() {
    if (gameEnded || game.isGameOver()) return;
    finishGame('loss', "You resigned! You lost -50 ELO.");
  }

  function makeAIMove() {
    if (game.turn() !== aiColor || game.isGameOver()) return;
    // Increment the AI request ID so previous pending moves become outdated.
    aiRequestId.current++;
    const currentRequestId = aiRequestId.current;
    const currentFEN = game.fen();

    const aiWorker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url));
    aiWorker.postMessage({
      fen: currentFEN,
      aiColor,
      maxDepth: 3,
    });
    aiWorker.onmessage = (event) => {
      // Only accept the result if the board state hasn’t changed since this request was issued.
      if (aiRequestId.current !== currentRequestId) {
        console.log("Discarding outdated AI move (request ID mismatch)");
        aiWorker.terminate();
        return;
      }
      if (game.fen() !== currentFEN) {
        console.log("Board state changed. Discarding AI move.");
        aiWorker.terminate();
        return;
      }
    
      const { success, move } = event.data as { success: boolean; move: MoveInputType | null; error?: string };
    
      if (success && move) {
        const moveMade = game.move({ from: move.from, to: move.to, promotion: move.promotion });
        if (moveMade) {
          recordMove(moveMade);
          checkGameStatus();
        }
      } else if (!success) {
        console.error("AI Worker returned error:", event.data.error);
      }
    
      aiWorker.terminate();
    };    
    aiWorker.onerror = (error) => {
      console.error('AI Worker error:', error);
      aiWorker.terminate();
    };
  }

  function userMove(from: string, to: string, promotion?: string): boolean {
    if (!isAtLivePosition()) {
      const liveFen = moveHistory[moveHistory.length - 1].fen;
      game.load(liveFen);
      setDisplayFen(liveFen);
      setCurrentPosition(moveHistory.length - 1);
    }
    const move = game.move({ from: from as Square, to: to as Square, promotion }) as Move | null;
    if (!move) return false;
    recordMove(move);
    if (move && move.promotion) {
      const bonus = move.promotion === 'q' ? 9 : move.promotion === 'r' ? 5 : 3;
      if (move.color === userColor) {
        setPromotionBonusUser(prev => prev + bonus);
        setCapturedByAI(prev => [...prev, { type: 'p', color: userColor }]);
      } else {
        setPromotionBonusAI(prev => prev + bonus);
        setCapturedByUser(prev => [...prev, { type: 'p', color: aiColor }]);
      }
    }
    checkGameStatus();
    setSelectedSquare(null);
    setMoveSquares({});
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

  // Prevent moves if the game has ended.
  function onDrop(sourceSquare: string, targetSquare: string) {
    if (gameEnded) return false;
    if (game.turn() !== userColor) return false;
    return tryMove(sourceSquare, targetSquare);
  }

  // Prevent moves if the game has ended.
  function onSquareClick(square: string) {
    if (gameEnded) return;
    if (!isAtLivePosition() || game.turn() !== userColor) return;
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
    if (!gameStarted && !freshStart && game.turn() !== userColor) {
      setGameStarted(true);
    }
  }, [gameStarted, freshStart, userColor, displayFen]);

  useEffect(() => {
    if (!timerActive) return;
    const clockInterval = setInterval(() => {
      if (gameEnded || game.isGameOver()) return;
      if (isAtLivePosition()) {
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
  }, [userColor, aiColor, gameEnded, currentPosition, moveHistory.length, timerActive]);

  const userClock = timeControl === 0 ? '∞' : formatTime(userTime);
  const aiClock = timeControl === 0 ? '∞' : formatTime(aiTime);
  const moveDisplay = moveCount === 0 ? 'Game Start' : `Move ${moveCount}`;

  return (
    <div className="relative">
      <MaterialTracker
        capturedByUser={capturedByUser}
        capturedByAI={capturedByAI}
        userColor={userColor}
        promotionBonusUser={promotionBonusUser}
        promotionBonusAI={promotionBonusAI}
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
            ...(checkSquare ? { [checkSquare]: { border: '2px solid red' } } : {})
          }}
          customBoardStyle={{ 
            background: 'transparent', 
            boxShadow: 'none'
          }}
          arePiecesDraggable={false}
          animationDuration={200}
        />
      </div>

      {/* Resign Button */}
      { !gameEnded && !game.isGameOver() && (
        <div className="mt-4 flex justify-center">
          <button 
            onClick={handleResign} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Resign
          </button>
        </div>
      )}

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
