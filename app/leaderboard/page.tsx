'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Protected from '../../components/Protected';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Trophy, ChevronLeft } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface LeaderboardEntry {
  position: number;
  username: string;
  elo: number;
  rank: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Retrieve current user from Clerk
  const { user } = useUser();
  const currentUsername = user?.username || '';

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <Protected>
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
      {/* Background bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => {
          const size = Math.random() * 200 + 80;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: size,
                height: size,
              }}
              initial={{ opacity: 0.15, scale: 0.8 }}
              animate={{
                opacity: [0.15, 0.3, 0.15],
                scale: [0.8, 1.2, 0.8],
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, Math.random() * 50 - 25, 0],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* Main container */}
      <motion.div
        className="relative z-10 max-w-5xl w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Trophy size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                Leaderboard
              </span>
            </h1>
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-2">
            <Link href="/chess" className="group">
              <motion.button
                className="px-4 py-2 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all group-hover:bg-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </motion.button>
            </Link>

            <Link href="/" className="group">
              <motion.button
                className="px-4 py-2 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl text-white font-medium transition-all group-hover:bg-white/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home size={18} />
                <span>Home</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg
                className="animate-spin h-16 w-16 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="mt-4 text-xl text-white/70">
                Loading leaderboard...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="loaded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="overflow-x-auto">
                <motion.table
                  className="w-full text-left bg-black/30 border border-white/10 rounded-xl overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <thead className="bg-white/10">
                    <tr className="text-sm uppercase tracking-wide text-gray-200">
                      <th className="py-3 px-4 text-center">#</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4 text-center">ELO</th>
                      <th className="py-3 px-4 text-center">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.username === currentUsername;
                      return (
                        <motion.tr
                          key={entry.position}
                          className={`transition-colors duration-300 ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white font-semibold shadow-md'
                              : 'hover:bg-white/10'
                          }`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                        >
                          <td className="py-3 px-4 text-center border-b border-white/10">
                            {entry.position}
                          </td>
                          <td className="py-3 px-4 border-b border-white/10">
                            {entry.username}
                          </td>
                          <td className="py-3 px-4 text-center border-b border-white/10">
                            {entry.elo}
                          </td>
                          <td className="py-3 px-4 text-center border-b border-white/10">
                            {entry.rank}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </motion.table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="relative z-10 mt-8 text-white/40 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        © {new Date().getFullYear()} RonyChess. All rights reserved.
      </motion.div>
    </div>
    </Protected>
  );
}
