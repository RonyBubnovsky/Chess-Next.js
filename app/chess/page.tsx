'use client';

import React, { useState } from 'react';
import Protected from '../../components/Protected'; // Adjust path if needed
import ChessBoard from '../../components/ChessBoard'; // Adjust path if needed

export default function ChessPage() {
  // orientation: 'white', 'black', or null
  const [orientation, setOrientation] = useState<'white' | 'black' | null>(null);
  // timeControl in minutes (3, 5, or 10) or null
  const [timeControl, setTimeControl] = useState<number | null>(null);
  // boardKey forces a remount of the ChessBoard when changed
  const [boardKey, setBoardKey] = useState(0);

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

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
        {/* Step 1: Choose color */}
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
          // Step 2: Choose time
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
          // Step 3: Render the board
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">
              You are {orientation} side, {timeControl} min
            </h1>
            <ChessBoard key={boardKey} orientation={orientation} timeControl={timeControl} />
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
