import React from 'react';

interface PromotionOverlayProps {
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

const pieceMap = {
  w: { q: '\u2655', r: '\u2656', b: '\u2657', n: '\u2658' },
  b: { q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E' },
};

const PromotionOverlay: React.FC<PromotionOverlayProps> = ({ color, onSelect, onCancel }) => {
  const promotions: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n'];

  return (
    <div
      className="absolute inset-0 z-30 flex items-start justify-center"
      onClick={onCancel}
    >
      <div
        className="mt-4 p-4 bg-gray-800 text-white rounded shadow-md flex space-x-6"
        onClick={(e) => e.stopPropagation()}
      >
        {promotions.map((p) => (
          <div
            key={p}
            className="cursor-pointer transform transition-transform hover:scale-125"
            onClick={() => onSelect(p)}
          >
            <span className="text-5xl">{pieceMap[color][p]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionOverlay;
