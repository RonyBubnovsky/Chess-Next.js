'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from './ConfirmModal';

interface GameRecord {
  result: 'win' | 'loss' | 'draw';
  date: string;
}

interface GameHistoryProps {
  onClose: () => void;
}

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel: string;
  action: (() => Promise<void>) | null;
}

const GameHistory: React.FC<GameHistoryProps> = ({ onClose }) => {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    title: '',
    description: '',
    confirmLabel: 'Delete',
    action: null,
  });

  const fetchHistory = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function deleteGame(date: string) {
    setDeletingDate(date);
    try {
      const res = await fetch(`/api/history/${encodeURIComponent(date)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error('Failed to delete game record');
        return;
      }
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting game record:', error);
    } finally {
      setDeletingDate(null);
    }
  }

  async function deleteAllGames() {
    setDeletingAll(true);
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error('Failed to delete all game history');
        return;
      }
      await fetchHistory();
    } catch (error) {
      console.error('Error deleting all game history:', error);
    } finally {
      setDeletingAll(false);
    }
  }

  function closeConfirmModal() {
    setConfirmState({
      title: '',
      description: '',
      confirmLabel: 'Delete',
      action: null,
    });
  }

  function openDeleteGameConfirm(date: string) {
    setConfirmState({
      title: 'Delete Game',
      description: 'Remove this game from your history. This action cannot be undone.',
      confirmLabel: 'Delete Game',
      action: async () => {
        await deleteGame(date);
      },
    });
  }

  function openDeleteAllConfirm() {
    setConfirmState({
      title: 'Delete All History',
      description: 'Remove every saved game from your history. This action cannot be undone.',
      confirmLabel: 'Delete All',
      action: async () => {
        await deleteAllGames();
      },
    });
  }

  async function handleConfirmAction() {
    if (!confirmState.action) return;
    await confirmState.action();
    closeConfirmModal();
  }

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
            <>
              <div className="mb-4 flex justify-end">
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={openDeleteAllConfirm}
                  disabled={deletingAll || deletingDate !== null}
                >
                  <Trash2 size={16} />
                  Delete All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
              <ul>
                {games.map((game, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-700 py-2 hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3 p-2">
                      <Link
                        href={`/game-history/${encodeURIComponent(game.date)}`}
                        onClick={onClose}
                        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between"
                      >
                        <span className="capitalize font-medium">
                          {game.result}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(game.date).toLocaleString()}
                        </span>
                      </Link>

                      <button
                        className="rounded-md p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => openDeleteGameConfirm(game.date)}
                        disabled={deletingAll || deletingDate === game.date}
                        aria-label="Delete game"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      <ConfirmModal
        isOpen={confirmState.action !== null}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        confirmDisabled={deletingAll || deletingDate !== null}
        onConfirm={handleConfirmAction}
        onCancel={closeConfirmModal}
      />
    </AnimatePresence>
  );
};

export default GameHistory;
