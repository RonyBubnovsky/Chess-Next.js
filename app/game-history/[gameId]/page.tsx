'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Chess } from 'chess.js';
import ReplayChessBoard from '../../../components/ReplayChessBoard';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

// Define a type for a captured piece.
type CapturedPiece = {
  type: 'p' | 'n' | 'b' | 'r' | 'q';
  color: 'w' | 'b';
};

interface MoveHistoryItem {
  fen: string;
  lastMove: { from: string; to: string } | null;
  capturedPiece: CapturedPiece | null;
}

interface GameRecord {
  result: 'win' | 'loss' | 'draw';
  date: string;
  moveHistory: MoveHistoryItem[];
  orientation: 'white' | 'black'; // Indicates your side
}

export default function GameReplayPage() {
  const params = useParams();
  const gameIdEncoded = params.gameId as string;
  const gameId = decodeURIComponent(gameIdEncoded);
  const [gameRecord, setGameRecord] = useState<GameRecord | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [showResultPopup, setShowResultPopup] = useState<boolean>(false);

  useEffect(() => {
    async function fetchGame() {
      try {
        // Fetch the specific game record from the dedicated endpoint.
        const res = await fetch(`/api/history/${encodeURIComponent(gameId)}`);
        if (res.ok) {
          const record: GameRecord = await res.json();
          setGameRecord(record);
        }
      } catch (error) {
        console.error('Error fetching game record:', error);
      }
    }
    fetchGame();
  }, [gameId]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!gameRecord) return;
    if (e.key === 'ArrowLeft') {
      setShowResultPopup(false);
      setCurrentPosition(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'ArrowRight') {
      if (currentPosition === gameRecord.moveHistory.length - 1) {
        if (!showResultPopup) {
          setShowResultPopup(true);
        }
      } else {
        setCurrentPosition(prev => Math.min(prev + 1, gameRecord.moveHistory.length - 1));
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameRecord, currentPosition, showResultPopup]);

  if (!gameRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading game record...
      </div>
    );
  }

  const finalFen = gameRecord.moveHistory[gameRecord.moveHistory.length - 1].fen;
  const chessInstance = new Chess(finalFen);
  let resultMessage = '';

  if (chessInstance.isCheckmate()) {
    const losingSide = chessInstance.turn();
    const winningSide = losingSide === 'w' ? 'Black' : 'White';
    resultMessage = `${winningSide} wins by checkmate.`;
  } else if (gameRecord.result === 'win') {
    resultMessage = `You won by resignation/time.`;
  } else if (gameRecord.result === 'loss') {
    resultMessage = `You lost by resignation/time.`;
  } else if (gameRecord.result === 'draw') {
    resultMessage = `The game is a draw.`;
  } else {
    resultMessage = `Game Over.`;
  }

  const currentFen = gameRecord.moveHistory[currentPosition]?.fen || new Chess().fen();
  const boardOrientation = gameRecord.orientation;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white relative">
      {/* Back Button */}
      <Link href="/chess">
        <button className="absolute top-4 left-4 flex items-center gap-2 text-white px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-colors">
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </Link>

      <h1 className="text-3xl font-bold mb-4">Game Replay</h1>
      <div className="mb-4">
        <p>
          Move: {currentPosition} / {gameRecord.moveHistory.length - 1}
        </p>
        <p>Result: {gameRecord.result}</p>
      </div>
      <ReplayChessBoard 
        position={currentFen} 
        boardWidth={400} 
        boardOrientation={boardOrientation}
      />
      <p className="mt-4">Use left/right arrow keys to navigate moves.</p>

      <AnimatePresence>
        {showResultPopup && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4">Game Over</h2>
              <p className="mb-6">{resultMessage}</p>
              <button
                onClick={() => setShowResultPopup(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
