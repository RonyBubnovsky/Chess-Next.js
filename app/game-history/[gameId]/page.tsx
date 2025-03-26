'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Chess } from 'chess.js';
import ReplayChessBoard from '../../../components/ReplayChessBoard';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const dynamic = 'force-dynamic';

type CapturedPiece = { type: 'p' | 'n' | 'b' | 'r' | 'q'; color: 'w' | 'b'; };

interface MoveHistoryItem {
  fen: string;
  lastMove: { from: string; to: string } | null;
  capturedPiece: CapturedPiece | null;
}

interface GameRecord {
  result: 'win' | 'loss' | 'draw';
  date: string;
  moveHistory: MoveHistoryItem[];
  orientation: 'white' | 'black';
}

export default function GameReplayPage() {
  const { gameId: encoded } = useParams();
  const gameId = decodeURIComponent(encoded as string);
  const [gameRecord, setGameRecord] = useState<GameRecord | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);

  useEffect(() => {
    fetch(`/api/history/${encodeURIComponent(gameId)}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((record: GameRecord) => setGameRecord(record))
      .catch(console.error);
  }, [gameId]);

  const step = 2;
  const maxIndex = gameRecord ? gameRecord.moveHistory.length - 1 : 0;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!gameRecord) return;
    if (e.key === 'ArrowLeft') {
      setShowResultPopup(false);
      setCurrentPosition(p => Math.max(p - step, 0));
    } else if (e.key === 'ArrowRight') {
      if (currentPosition < maxIndex - step + 1) {
        setCurrentPosition(p => p + step);
      } else if (!showResultPopup) {
        setShowResultPopup(true);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameRecord, currentPosition, showResultPopup]);

  if (!gameRecord) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading game record...</div>;
  }

  const currentFen = gameRecord.moveHistory[currentPosition]?.fen || new Chess().fen();
  const fullMoves = Math.ceil((gameRecord.moveHistory.length - 1) / 2) + 1;
  const currentMove = Math.ceil((currentPosition + 1) / 2) - 1;

  const finalFen = gameRecord.moveHistory[maxIndex].fen;
  const chessInstance = new Chess(finalFen);
  let resultMessage = '';
  if (chessInstance.isCheckmate()) {
    const loser = chessInstance.turn() === 'w' ? 'White' : 'Black';
    resultMessage = `${loser} wins by checkmate.`;
  } else if (gameRecord.result === 'win') resultMessage = 'You won.';
  else if (gameRecord.result === 'loss') resultMessage = 'You lost.';
  else resultMessage = 'The game is a draw.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white relative">
      <Link href="/chess">
        <button className="absolute top-4 left-4 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20">
          <ChevronLeft size={20} /><span className="hidden sm:inline">Back</span>
        </button>
      </Link>

      <h1 className="text-3xl font-bold mb-4">Game Replay</h1>
      <div className="mb-4">
        <p>Move: {currentMove} / {fullMoves}</p>
        <p>Result: {gameRecord.result}</p>
      </div>

      <ReplayChessBoard position={currentFen} boardWidth={400} boardOrientation={gameRecord.orientation} />
      <p className="mt-4">Use left/right arrow keys to navigate moves.</p>

      <AnimatePresence>
        {showResultPopup && (
          <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-800 p-6 rounded-xl shadow-lg text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h2 className="text-2xl font-bold mb-4">Game Over</h2>
              <p className="mb-6">{resultMessage}</p>
              <button onClick={() => setShowResultPopup(false)} className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
