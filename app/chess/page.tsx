'use client';

import React, { useState, useEffect, useCallback, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Trophy, Clock, RotateCcw, Home, Award, Zap, InfinityIcon } from 'lucide-react';
import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard';
import StatisticsSection, { Stats } from '../../components/StatisticsSection';

async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/stats');
  if (!res.ok) {
    console.error('Fetch error:', res.status, await res.text());
    throw new Error('Failed to fetch stats');
  }
  return res.json();
}

async function updateStats(result: "win" | "loss" | "draw"): Promise<Stats> {
  const res = await fetch('/api/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result }),
  });
  if (!res.ok) throw new Error('Failed to update stats');
  return res.json();
}

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const PrimaryButton: React.FC<ButtonProps> = ({ onClick, children, className = '', icon = null }) => (
  <motion.button
    onClick={onClick}
    className={`px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 ${className}`}
    whileHover={{ scale: 1.05, y: -3 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {icon}
    {children}
  </motion.button>
);

const SecondaryButton: React.FC<ButtonProps> = ({ onClick, children, className = '', icon = null }) => (
  <motion.button
    onClick={onClick}
    className={`px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 ${className}`}
    whileHover={{ scale: 1.05, y: -3, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {icon}
    {children}
  </motion.button>
);

// Helper to safely access sessionStorage.
function getSavedGameState() {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('chessGameState');
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

export default function ChessPage(): ReactElement {
  const savedState = getSavedGameState();
  const [orientation, setOrientation] = useState<'white' | 'black' | null>(
    savedState && savedState.orientation ? savedState.orientation : null
  );
  const [timeControl, setTimeControl] = useState<number | null>(
    savedState && savedState.timeControl !== undefined ? savedState.timeControl : null
  );
  const [boardKey, setBoardKey] = useState(0);
  const [freshStart, setFreshStart] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  // When in setup mode, clear any saved game.
  useEffect(() => {
    if (orientation === null && typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }, [orientation]);

  useEffect(() => {
    fetchStats()
      .then((data) => {
        setStats(data);
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingStats(false);
      });
  }, []);

  const handleChooseColor = useCallback((color: 'white' | 'black') => {
    setOrientation(color);
  }, []);

  const handleChooseRandom = useCallback(() => {
    const rand = Math.random() < 0.5 ? 'white' : 'black';
    setOrientation(rand);
  }, []);

  const handleChooseTime = useCallback((minutes: number | 0) => {
    sessionStorage.removeItem('chessGameState');
    setTimeControl(minutes);
    setBoardKey(prev => prev + 1);
    setFreshStart(true);
  }, []);

  const handleRestart = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chessGameState');
    }
    setOrientation(null);
    setTimeControl(null);
    setBoardKey(prev => prev + 1);
    setFreshStart(true);
  }, []);

  const handleGameEnd = useCallback((result: "win" | "loss" | "draw") => {
    updateStats(result)
      .then((updatedStats) => setStats(updatedStats))
      .catch(console.error);
  }, []);

  const getGradient = () => {
    if (orientation === 'white') {
      return 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900';
    } else if (orientation === 'black') {
      return 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900';
    }
    return 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900';
  };

  return (
    <Protected>
      <div className={`min-h-screen ${getGradient()} text-white flex flex-col items-center justify-center p-6 transition-all duration-1000 ease-in-out relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/20"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                }}
                initial={{ opacity: 0.1 }}
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [1, 1.2, 1],
                  x: [0, Math.random() * 50 - 25, 0],
                  y: [0, Math.random() * 50 - 25, 0],
                }}
                transition={{
                  duration: Math.random() * 20 + 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="container max-w-5xl mx-auto z-10 backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Trophy size={28} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                  RonyChess
                </span>
              </h1>
            </motion.div>

            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/">
                <SecondaryButton icon={<Home size={18} />} className="!px-3 !py-2" onClick={() => {}}>
                  Home
                </SecondaryButton>
              </Link>
              <Link href="/leaderboard">
                <SecondaryButton icon={<Award size={18} />} className="!px-3 !py-2" onClick={() => {}}>
                  Leaderboard
                </SecondaryButton>
              </Link>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {orientation === null && (
              <motion.div
                key="choose-color"
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-full mb-8">
                  <StatisticsSection stats={stats} loading={loadingStats} />
                </div>
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold mb-2">Choose Your Side</h2>
                  <p className="text-white/60 mb-6">Select your preferred color or get a random assignment</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                  <motion.div
                    className={`relative overflow-hidden rounded-xl border-2 ${hoveredColor === 'white' ? 'border-indigo-400' : 'border-white/10'} transition-all cursor-pointer`}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredColor('white')}
                    onHoverEnd={() => setHoveredColor(null)}
                    onClick={() => handleChooseColor('white')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 opacity-80" />
                    <div className="p-6 flex flex-col items-center relative z-10">
                      <div className="h-16 w-16 rounded-full bg-white mb-3 flex items-center justify-center shadow-lg">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center text-3xl text-black">
                          ♔
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-1 text-black">Play White</h3>
                      <p className="text-black/60 text-sm">Move first</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`relative overflow-hidden rounded-xl border-2 ${hoveredColor === 'black' ? 'border-indigo-400' : 'border-white/10'} transition-all cursor-pointer`}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredColor('black')}
                    onHoverEnd={() => setHoveredColor(null)}
                    onClick={() => handleChooseColor('black')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-70" />
                    <div className="p-6 flex flex-col items-center relative z-10">
                      <div className="h-16 w-16 rounded-full bg-gray-900 mb-3 flex items-center justify-center shadow-lg">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-3xl">
                          ♚
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-1">Play Black</h3>
                      <p className="text-white/60 text-sm">Counter attack</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`relative overflow-hidden rounded-xl border-2 ${hoveredColor === 'random' ? 'border-indigo-400' : 'border-white/10'} transition-all cursor-pointer`}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredColor('random')}
                    onHoverEnd={() => setHoveredColor(null)}
                    onClick={handleChooseRandom}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-purple-900 opacity-20" />
                    <div className="p-6 flex flex-col items-center relative z-10">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-3 flex items-center justify-center shadow-lg">
                        <Zap size={28} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">Random</h3>
                      <p className="text-white/60 text-sm">Surprise me</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {orientation !== null && timeControl === null && (
              <motion.div
                key="choose-time"
                className="flex flex-col items-center"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="flex items-center gap-2 self-start mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <SecondaryButton 
                    onClick={() => setOrientation(null)} 
                    className="!px-3 !py-2"
                    icon={<ChevronLeft size={18} />}
                  >
                    Back
                  </SecondaryButton>
                  <div className="text-white/60">
                    You chose <span className="text-white font-semibold">{orientation}</span>
                  </div>
                </motion.div>

                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-3xl font-bold mb-2">Set Time Control</h2>
                  <p className="text-white/60 mb-6">Choose how long each player has for the entire game</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-3xl">
                  <motion.div
                    className={`relative overflow-hidden rounded-xl border-2 ${hoveredTime === 0 ? 'border-indigo-400' : 'border-white/10'} transition-all cursor-pointer`}
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onHoverStart={() => setHoveredTime(0)}
                    onHoverEnd={() => setHoveredTime(null)}
                    onClick={() => handleChooseTime(0)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-900 opacity-20" />
                    <div className="p-6 flex flex-col items-center relative z-10">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 mb-3 flex items-center justify-center shadow-lg">
                        <InfinityIcon size={28} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-1">No Limit</h3>
                      <p className="text-white/60 text-sm">Free play</p>
                    </div>
                  </motion.div>
                  
                  {[10, 5, 3].map((minutes) => (
                    <motion.div
                      key={minutes}
                      className={`relative overflow-hidden rounded-xl border-2 ${hoveredTime === minutes ? 'border-indigo-400' : 'border-white/10'} transition-all cursor-pointer`}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredTime(minutes)}
                      onHoverEnd={() => setHoveredTime(null)}
                      onClick={() => handleChooseTime(minutes)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-900 opacity-20" />
                      <div className="p-6 flex flex-col items-center relative z-10">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-3 flex items-center justify-center shadow-lg">
                          <Clock size={28} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-1">{minutes} Minutes</h3>
                        <p className="text-white/60 text-sm">
                          {minutes === 10 ? 'Slower pace' : minutes === 5 ? 'Standard game' : 'Quick match'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {orientation !== null && timeControl !== null && (
              <motion.div
                key="chessboard"
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                    <div className={`w-3 h-3 rounded-full ${orientation === 'white' ? 'bg-white' : 'bg-gray-800 border border-gray-600'}`}></div>
                    <h2 className="text-lg font-medium">
                      Playing as <span className="font-bold">{orientation}</span> • {timeControl === 0 ? 'No time limit' : `${timeControl} min`}
                    </h2>
                    <div className="flex items-center gap-1">
                      {timeControl === 0 ? <InfinityIcon size={14} className="text-white/60" /> : <Clock size={14} className="text-white/60" />}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="relative backdrop-blur-sm bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl overflow-hidden" />
                  <div className="relative z-10">
                    <ChessBoard
                      key={boardKey}
                      orientation={orientation}
                      timeControl={timeControl}
                      onGameEnd={handleGameEnd}
                      freshStart={freshStart}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="mt-8 flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PrimaryButton
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-rose-500 to-orange-500"
                    icon={<RotateCcw size={18} />}
                  >
                    New Game
                  </PrimaryButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mt-8 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © {new Date().getFullYear()} RonyChess. All rights reserved.
        </motion.div>
      </div>
    </Protected>
  );
}
