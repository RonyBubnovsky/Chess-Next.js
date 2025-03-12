'use client';

import React from 'react';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q';
type PieceColor = 'w' | 'b';

interface CapturedPiece {
  type: PieceType;
  color: PieceColor;
}

interface MaterialTrackerProps {
  capturedByUser: CapturedPiece[];
  capturedByAI: CapturedPiece[];
  userColor: PieceColor;
}

// Material values for each piece type
const PIECE_VALUES: Record<PieceType, number> = {
  'p': 1,  // pawn
  'n': 3,  // knight
  'b': 3,  // bishop
  'r': 5,  // rook
  'q': 9,  // queen
};

// Unicode representations for chess pieces
const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  'w': {
    'p': '♙',
    'n': '♘',
    'b': '♗',
    'r': '♖',
    'q': '♕',
  },
  'b': {
    'p': '♟',
    'n': '♞',
    'b': '♝',
    'r': '♜',
    'q': '♛',
  }
};

// Piece display order (highest value to lowest)
const PIECE_ORDER: PieceType[] = ['q', 'r', 'b', 'n', 'p'];

export default function MaterialTracker({ 
  capturedByUser, 
  capturedByAI, 
  userColor 
}: MaterialTrackerProps) {
  // Calculate AI color based on user color
  const aiColor: PieceColor = userColor === 'w' ? 'b' : 'w';
  
  // Calculate total material points
  const userPoints = capturedByUser.reduce((sum, piece) => sum + PIECE_VALUES[piece.type], 0);
  const aiPoints = capturedByAI.reduce((sum, piece) => sum + PIECE_VALUES[piece.type], 0);
  
  // Calculate advantage
  const advantage = userPoints - aiPoints;
  const advantageText = advantage > 0 ? `+${advantage}` : advantage < 0 ? `${advantage}` : '0';
  
  // Group and sort pieces by type for organized display
  const organizePieces = (pieces: CapturedPiece[]) => {
    // Group pieces by type
    const grouped: Record<PieceType, CapturedPiece[]> = {
      'p': [],
      'n': [],
      'b': [],
      'r': [],
      'q': [],
    };
    
    pieces.forEach(piece => {
      grouped[piece.type].push(piece);
    });
    
    // Return pieces in preferred order
    return PIECE_ORDER.flatMap(type => grouped[type]);
  };
  
  const organizedUserPieces = organizePieces(capturedByUser);
  const organizedAIPieces = organizePieces(capturedByAI);
  
  const userLabel = userColor === 'w' ? 'White' : 'Black';
  const aiLabel = userColor === 'w' ? 'Black' : 'White';
  
  return (
    <div className="bg-gray-800 backdrop-blur-sm bg-opacity-90 rounded-lg p-4 mb-4 text-white shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-300">Material Balance</h3>
        <div 
          className={`px-2 py-1 rounded-md font-bold text-sm ${
            advantage > 0 
              ? 'bg-green-600 text-green-100' 
              : advantage < 0 
                ? 'bg-red-600 text-red-100' 
                : 'bg-gray-700 text-gray-300'
          }`}
        >
          {advantageText}
        </div>
      </div>
      
      <div className="space-y-3">
        {/* User's captured pieces section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${userColor === 'w' ? 'bg-white' : 'bg-gray-900 border border-gray-600'}`}></div>
            <span className="font-medium text-sm">{userLabel}</span>
            <span className="text-xs text-gray-400">+{userPoints}</span>
          </div>
          <div className="flex flex-wrap justify-end">
            {organizedUserPieces.map((piece, i) => (
              <span 
                key={`user-${piece.type}-${i}`} 
                className="text-lg leading-none inline-block"
                style={{ marginLeft: '-2px' }}
              >
                {PIECE_UNICODE[aiColor][piece.type]}
              </span>
            ))}
          </div>
        </div>
        
        {/* AI's captured pieces section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${aiColor === 'w' ? 'bg-white' : 'bg-gray-900 border border-gray-600'}`}></div>
            <span className="font-medium text-sm">{aiLabel}</span>
            <span className="text-xs text-gray-400">+{aiPoints}</span>
          </div>
          <div className="flex flex-wrap justify-end">
            {organizedAIPieces.map((piece, i) => (
              <span 
                key={`ai-${piece.type}-${i}`} 
                className="text-lg leading-none inline-block"
                style={{ marginLeft: '-2px' }}
              >
                {PIECE_UNICODE[userColor][piece.type]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}