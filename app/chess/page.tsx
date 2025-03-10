'use client';
import { useState } from 'react';
import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard';

export default function ChessPage() {
  // orientation: 'white', 'black', or null if not chosen
  const [orientation, setOrientation] = useState<'white' | 'black' | null>(null);
  // timeControl in minutes (10, 5, or 3), or null if not chosen
  const [timeControl, setTimeControl] = useState<number | null>(null);

  // We'll use a "boardKey" to force a new <ChessBoard> instance on start/restart
  const [boardKey, setBoardKey] = useState(0);

  // Step 1: user picks color => setOrientation
  function handleChooseColor(color: 'white' | 'black') {
    setOrientation(color);
  }

  function handleChooseRandom() {
    const rand = Math.random() < 0.5 ? 'white' : 'black';
    setOrientation(rand);
  }

  // Step 2: user picks time => setTimeControl
  function handleChooseTime(minutes: number) {
    setTimeControl(minutes);
    setBoardKey(prev => prev + 1); // once color + time are set, we can mount the board
  }

  // Restart: user can pick color/time again
  function handleRestart() {
    setOrientation(null);
    setTimeControl(null);
  }

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
        {/* If orientation is not chosen, show color selection */}
        {orientation === null ? (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Choose Your Color</h1>
            <div className="space-x-4">
              <button
                onClick={() => handleChooseColor('white')}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                Play as White
              </button>
              <button
                onClick={() => handleChooseColor('black')}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                Play as Black
              </button>
              <button
                onClick={handleChooseRandom}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                Random
              </button>
            </div>
          </div>
        ) : timeControl === null ? (
          // If orientation is chosen but time not chosen, show time selection
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-4">
              You chose {orientation} side. Now select time:
            </h1>
            <div className="space-x-4">
              <button
                onClick={() => handleChooseTime(10)}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                10 minutes
              </button>
              <button
                onClick={() => handleChooseTime(5)}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                5 minutes
              </button>
              <button
                onClick={() => handleChooseTime(3)}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                3 minutes
              </button>
            </div>
          </div>
        ) : (
          // Both orientation & time chosen => show ChessBoard + Restart
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">
              You are {orientation} side, {timeControl} min
            </h1>
            <ChessBoard
              key={boardKey}
              orientation={orientation}
              timeControl={timeControl}
            />
            <button
              onClick={handleRestart}
              className="mt-6 px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                         transition shadow-sm transform 
                         hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                         cursor-pointer"
            >
              Restart (Pick Color/Time)
            </button>
          </div>
        )}
      </div>
    </Protected>
  );
}
