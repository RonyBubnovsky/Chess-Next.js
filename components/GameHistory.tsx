'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

interface GameRecord {
  result: 'win' | 'loss' | 'draw';
  date: string;
}

interface GameHistoryProps {
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ onClose }) => {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/history');
        if (!res.ok) {
          console.error('Failed to fetch game history');
          return;
        }
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching game history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 text-white rounded-xl p-6 w-full max-w-2xl relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-4">Game History</h2>

          {loading ? (
            <p>Loading...</p>
          ) : games.length === 0 ? (
            <p>No games recorded yet.</p>
          ) : (
            // Wrap the list in a container with fixed max height and vertical scrolling
            <div className="max-h-80 overflow-y-auto">
              <ul>
                {games.map((game, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-700 py-2 hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <Link
                      href={`/game-history/${encodeURIComponent(game.date)}`}
                      onClick={onClose}
                    >
                      <div className="flex justify-between items-center cursor-pointer p-2">
                        <span className="capitalize font-medium">
                          {game.result}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(game.date).toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameHistory;
