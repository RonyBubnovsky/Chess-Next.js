'use client';
import { useState, useEffect } from 'react';
import Protected from '../../components/Protected';
import ChessBoard from '../../components/ChessBoard';

export default function ChessPage() {
  // side is either 'white' or 'black' or null if not chosen
  const [side, setSide] = useState<'white' | 'black' | null>(null);

  // If user chooses black, we can automatically let the AI (white) make the first move.
  // We do that by passing a prop to ChessBoard so it knows to let white move first if user is black.
  
  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
        {!side ? (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold mb-4">Choose Your Side</h1>
            <div className="space-x-4">
              <button
                onClick={() => setSide('white')}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                Play as White
              </button>
              <button
                onClick={() => setSide('black')}
                className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-md 
                           transition shadow-sm transform 
                           hover:scale-105 hover:-translate-y-0.5 hover:bg-gray-200 
                           cursor-pointer"
              >
                Play as Black
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4">Chess Game</h1>
            <ChessBoard orientation={side} />
          </div>
        )}
      </div>
    </Protected>
  );
}
