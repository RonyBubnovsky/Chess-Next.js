'use client';
import { useState } from 'react';
import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard';

export default function ChessPage() {
  // side can be 'white', 'black', or null if not chosen yet
  const [side, setSide] = useState<'white' | 'black' | null>(null);

  // "boardKey" is used to force a new <ChessBoard> mount when we start/restart
  const [boardKey, setBoardKey] = useState(0);

  function handleChooseColor(color: 'white' | 'black') {
    setSide(color);
    setBoardKey(prev => prev + 1);
  }

  function handleChooseRandom() {
    const randomColor = Math.random() < 0.5 ? 'white' : 'black';
    setSide(randomColor);
    setBoardKey(prev => prev + 1);
  }

  function handleRestart() {
    // Return to color selection
    setSide(null);
  }

  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
        {side === null ? (
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
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">
              {side === 'white' ? 'Playing as White' : 'Playing as Black'}
            </h1>
            {/* Render ChessBoard with a unique key to force a fresh instance */}
            <ChessBoard key={boardKey} orientation={side} />
            <button
              onClick={handleRestart}
              className="mt-6 px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                         transition shadow-sm transform 
                         hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                         cursor-pointer"
            >
              Restart (Choose Again)
            </button>
          </div>
        )}
      </div>
    </Protected>
  );
}
