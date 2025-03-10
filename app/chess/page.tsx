'use client';

import React, { useState, useEffect } from 'react';
import Protected from '../../components/Protected'; // Adjust path if needed
import ChessBoard from '../../components/ChessBoard'; // Adjust path if needed
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

export default function ChessPage() {
  const [orientation, setOrientation] = useState<'white' | 'black' | null>(null);
  const [timeControl, setTimeControl] = useState<number | null>(null);
  const [boardKey, setBoardKey] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

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

  function handleChooseColor(color: 'white' | 'black') {
    setOrientation(color);
  }

  function handleChooseRandom() {
    const rand = Math.random() < 0.5 ? 'white' : 'black';
    setOrientation(rand);
  }

  function handleChooseTime(minutes: number) {
    setTimeControl(minutes);
    setBoardKey(prev => prev + 1);
  }

  function handleRestart() {
    setOrientation(null);
    setTimeControl(null);
    setBoardKey(prev => prev + 1);
  }

  function handleGameEnd(result: "win" | "loss" | "draw") {
    updateStats(result)
      .then((updatedStats) => setStats(updatedStats))
      .catch(console.error);
  }

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
        {/* Show statistics when no game has been started */}
        {orientation === null && (
          <div className="mb-8">
            <StatisticsSection stats={stats} loading={loadingStats} />
          </div>
        )}
        {orientation === null ? (
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
