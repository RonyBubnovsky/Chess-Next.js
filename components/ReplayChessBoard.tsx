'use client';
import React from 'react';
import { Chessboard } from 'react-chessboard';

export interface ReplayChessBoardProps {
  position: string;
  boardWidth?: number;
  boardOrientation?: 'white' | 'black' | 'w' | 'b';
}

const ReplayChessBoard: React.FC<ReplayChessBoardProps> = ({
  position,
  boardWidth = 400,
  boardOrientation = 'white',
}) => {
  // Convert orientation if it's 'w' or 'b'
  const orientation =
    boardOrientation === 'w' ? 'white' : boardOrientation === 'b' ? 'black' : boardOrientation;

  return (
    <div style={{ width: boardWidth, height: boardWidth }}>
      <Chessboard 
        position={position} 
        boardWidth={boardWidth}
        boardOrientation={orientation}
        arePiecesDraggable={false}
      />
    </div>
  );
};

export default ReplayChessBoard;
