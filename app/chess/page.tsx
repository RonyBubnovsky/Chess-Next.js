'use client';

import React, { useState, useEffect } from 'react';
import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard'; 
import StatisticsSection, { Stats } from '../../components/StatisticsSection';

function getStoredStats(): Stats {
  const stored = localStorage.getItem("ronychess_stats");
  if (stored) return JSON.parse(stored);
  return { played: 0, wins: 0, losses: 0, draws: 0, elo: 500 };
}

export default function ChessPage() {
  // Step selection: orientation and timeControl
  const [orientation, setOrientation] = useState<'white' | 'black' | null>(null);
  const [timeControl, setTimeControl] = useState<number | null>(null);
  // boardKey forces a remount of ChessBoard when changed (for a fresh game)
  const [boardKey, setBoardKey] = useState(0);
  // Stats state loaded from localStorage
  const [stats, setStats] = useState<Stats>(() => {
    return typeof window !== "undefined" ? getStoredStats() : { played: 0, wins: 0, losses: 0, draws: 0, elo: 500 };
  });

  useEffect(() => {
    // On mount, load stats from localStorage
    setStats(getStoredStats());
  }, []);

  function handleChooseColor(color: 'white' | 'black') {
    setOrientation(color);
  }

  function handleChooseRandom() {
    const rand = Math.random() < 0.5 ? 'white' : 'black';
    setOrientation(rand);
  }

  function handleChooseTime(minutes: number) {
    setTimeControl(minutes);
    // Increment boardKey to force a fresh ChessBoard instance
    setBoardKey(prev => prev + 1);
  }

  function handleRestart() {
    setOrientation(null);
    setTimeControl(null);
    // Force a remount of ChessBoard when starting again
    setBoardKey(prev => prev + 1);
  }

  // Update stats when a game ends.
  function handleGameEnd(result: "win" | "loss" | "draw") {
    setStats(prev => {
      const newStats = { ...prev, played: prev.played + 1 };
      if (result === "win") {
        newStats.wins = prev.wins + 1;
        newStats.elo = prev.elo + 50;
      } else if (result === "loss") {
        newStats.losses = prev.losses + 1;
        newStats.elo = prev.elo - 50;
      } else if (result === "draw") {
        newStats.draws = prev.draws + 1;
      }
      localStorage.setItem("ronychess_stats", JSON.stringify(newStats));
      return newStats;
    });
  }

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
        {/* Show statistics when no game has been started */}
        {orientation === null && (
          <div className="mb-8">
            <StatisticsSection stats={stats} />
          </div>
        )}
        {orientation === null ? (
          // Step 1: Choose Color
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Choose Your Color</h1>
            <div className="space-x-4">
              <button
                onClick={() => handleChooseColor('white')}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
              >
                Play as White
              </button>
              <button
                onClick={() => handleChooseColor('black')}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
              >
                Play as Black
              </button>
              <button
                onClick={handleChooseRandom}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
              >
                Random
              </button>
            </div>
          </div>
        ) : timeControl === null ? (
          // Step 2: Choose Time
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-4">
              You chose {orientation} side. Now select time:
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => handleChooseTime(10)}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
              >
                10 minutes
              </button>
              <button
                onClick={() => handleChooseTime(5)}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
              >
                5 minutes
              </button>
              <button
                onClick={() => handleChooseTime(3)}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
              >
                3 minutes
              </button>
            </div>
          </div>
        ) : (
          // Step 3: Render the ChessBoard with onGameEnd callback
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">
              You are {orientation} side, {timeControl} min
            </h1>
            <ChessBoard
              key={boardKey}
              orientation={orientation}
              timeControl={timeControl}
              onGameEnd={handleGameEnd}
            />
            <button
              onClick={handleRestart}
              className="mt-6 px-6 py-3 bg-white text-gray-800 font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 cursor-pointer"
            >
              Restart (Pick Color/Time)
            </button>
          </div>
        )}
      </div>
    </Protected>
  );
}
