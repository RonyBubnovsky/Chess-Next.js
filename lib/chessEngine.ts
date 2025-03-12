import { Chess, Move } from 'chess.js';

// Piece-Square Tables: These give position-dependent values to pieces
// Pawns are encouraged to advance and control the center
const pawnTable: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

// Knights are better near the center and penalized at the edges
const knightTable: number[][] = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

// Bishops prefer diagonals and open positions
const bishopTable: number[][] = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

// Rooks prefer open files and 7th rank
const rookTable: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0]
];

// Queens combine aspects of rooks and bishops
const queenTable: number[][] = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20]
];

// Kings want safety in the early/middle game
const kingMiddleTable: number[][] = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20]
];

// Kings want to be active in the endgame
const kingEndTable: number[][] = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50]
];

// Opening book with common variations
type OpeningMove = {
  fen: string;
  moves: string[];
  weights: number[]; // Probability weights
};

const openingBook: OpeningMove[] = [
  // Common white first moves
  {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "d4", "c4", "Nf3"],
    weights: [4, 4, 1, 1] // Higher weights for e4/d4
  },
  // Response to e4
  {
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
    moves: ["e5", "c5", "e6", "c6"],
    weights: [4, 3, 2, 1] // Common responses
  },
  // Response to d4
  {
    fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
    moves: ["Nf6", "d5", "e6", "g6"],
    weights: [3, 3, 2, 2] // Common responses
  },
  // Italian Game
  {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["Bc4", "d4", "Nc3", "Bb5"],
    weights: [4, 2, 2, 2] // Bishop to c4 is classic Italian
  },
  // Sicilian Defense
  {
    fen: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moves: ["Nf3", "Nc3", "c3", "d4"],
    weights: [3, 3, 2, 2] // Common Sicilian continuations
  }
  // Add more opening positions as needed
];

// Piece values
const PIECE_VALUES: { [piece: string]: number } = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Get the appropriate piece-square table
function getPieceSquareTable(piece: string, isEndgame: boolean): number[][] {
  switch (piece.toLowerCase()) {
    case 'p': return pawnTable;
    case 'n': return knightTable;
    case 'b': return bishopTable;
    case 'r': return rookTable;
    case 'q': return queenTable;
    case 'k': return isEndgame ? kingEndTable : kingMiddleTable;
    default: return Array(8).fill(Array(8).fill(0));
  }
}

// Count material to determine game phase
function countMaterial(gameInstance: Chess): number {
  let material = 0;
  const board = gameInstance.board();
  
  for (const row of board) {
    for (const piece of row) {
      if (piece && piece.type !== 'k') {
        material += PIECE_VALUES[piece.type];
      }
    }
  }
  
  return material;
}

// Check if we're in endgame
function isEndgame(gameInstance: Chess): boolean {
  // If total non-king material is less than ~1 queen + 1 rook
  return countMaterial(gameInstance) < 1500;
}

// Add randomness to make the engine less predictable
function addRandomness(evaluation: number, depth: number): number {
  // Add more randomness at lower depths (opening and early game)
  const randomFactor = depth > 3 ? 10 : 5;
  return evaluation + (Math.random() * randomFactor - randomFactor / 2);
}

// Helper function to convert moves to algebraic notation
function moveToAlgebraic(gameInstance: Chess, move: Move): string {
  // Make a clone to avoid modifying the original game state
  const tempGame = new Chess(gameInstance.fen());
  
  // Make the move and get the SAN (Standard Algebraic Notation)
  const result = tempGame.move({
    from: move.from,
    to: move.to,
    promotion: move.promotion
  });
  
  // Return the SAN notation
  return result.san;
}

// Check opening book for the current position
function checkOpeningBook(gameInstance: Chess): Move | null {
  const currentFen = gameInstance.fen().split(' ').slice(0, 4).join(' ');
  
  for (const entry of openingBook) {
    const bookFen = entry.fen.split(' ').slice(0, 4).join(' ');
    
    if (currentFen === bookFen) {
      // Weighted random selection
      const totalWeight = entry.weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < entry.moves.length; i++) {
        random -= entry.weights[i];
        if (random <= 0) {
          // Convert algebraic move to Move object
          try {
            const moves = gameInstance.moves({ verbose: true }) as Move[];
            const moveStr = entry.moves[i];
            
            // Find the move that matches the algebraic notation
            for (const move of moves) {
              if (moveToAlgebraic(gameInstance, move) === moveStr) {
                return move;
              }
            }
            return null;
          } catch {
            return null;
          }
        }
      }
    }
  }
  
  return null;
}

// Improved evaluation function
export function evaluateBoard(gameInstance: Chess, aiColor: string): number {
  // Handle draws and stalemates explicitly
  if (gameInstance.isDraw() || gameInstance.isStalemate() || gameInstance.isThreefoldRepetition()) {
    return 0; // Draws are neutral
  }
  
  const endgame = isEndgame(gameInstance);
  let evaluation = 0;
  const board = gameInstance.board();
  
  // Material and positional evaluation
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      
      // Base piece value
      const pieceValue = PIECE_VALUES[piece.type];
      
      // Position value from piece-square tables
      const table = getPieceSquareTable(piece.type, endgame);
      let positionValue = 0;
      
      if (piece.color === 'w') {
        positionValue = table[7 - row][col];
      } else {
        positionValue = table[row][col];
      }
      
      // Add material and positional values to evaluation
      if (piece.color === aiColor) {
        evaluation += pieceValue + positionValue * 0.1;
      } else {
        evaluation -= pieceValue + positionValue * 0.1;
      }
    }
  }
  
  // Mobility (number of legal moves)
  const currentTurn = gameInstance.turn();
  const currentMoves = gameInstance.moves().length;
  
  // Clone the game to evaluate opponent's mobility
  const clonedGame = new Chess(gameInstance.fen());
  const moves = clonedGame.moves({ verbose: true });
  if (moves.length > 0) {
    clonedGame.move(moves[0]);
    clonedGame.undo();
  }
  const opponentMoves = clonedGame.moves().length;
  
  const mobilityFactor = 5;
  if (currentTurn === aiColor) {
    evaluation += currentMoves * mobilityFactor;
    evaluation -= opponentMoves * mobilityFactor;
  } else {
    evaluation -= currentMoves * mobilityFactor;
    evaluation += opponentMoves * mobilityFactor;
  }
  
  // Pawn structure: doubled and isolated pawns
  const pawnColumns = { w: Array(8).fill(0), b: Array(8).fill(0) };
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'p') {
        pawnColumns[piece.color][col]++;
      }
    }
  }
  
  const doubledPawnPenalty = 15;
  for (let col = 0; col < 8; col++) {
    if (pawnColumns['w'][col] > 1) {
      evaluation -= (pawnColumns['w'][col] - 1) * doubledPawnPenalty * (aiColor === 'w' ? 1 : -1);
    }
    if (pawnColumns['b'][col] > 1) {
      evaluation += (pawnColumns['b'][col] - 1) * doubledPawnPenalty * (aiColor === 'w' ? 1 : -1);
    }
  }
  
  const isolatedPawnPenalty = 20;
  for (let col = 0; col < 8; col++) {
    const leftNeighbor = col > 0 ? pawnColumns['w'][col - 1] : 0;
    const rightNeighbor = col < 7 ? pawnColumns['w'][col + 1] : 0;
    
    if (pawnColumns['w'][col] > 0 && leftNeighbor === 0 && rightNeighbor === 0) {
      evaluation -= isolatedPawnPenalty * (aiColor === 'w' ? 1 : -1);
    }
    
    const bLeftNeighbor = col > 0 ? pawnColumns['b'][col - 1] : 0;
    const bRightNeighbor = col < 7 ? pawnColumns['b'][col + 1] : 0;
    
    if (pawnColumns['b'][col] > 0 && bLeftNeighbor === 0 && bRightNeighbor === 0) {
      evaluation += isolatedPawnPenalty * (aiColor === 'w' ? 1 : -1);
    }
  }
  
  // King safety evaluation
  const kingPenalty = 10;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'k') {
        const kingColor = piece.color;
        let friendlyPieces = 0;
        let attackingPieces = 0;
        
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              const nearby = board[r][c];
              if (nearby) {
                if (nearby.color === kingColor) {
                  friendlyPieces++;
                } else {
                  attackingPieces++;
                }
              }
            }
          }
        }
        
        if (kingColor === aiColor) {
          evaluation -= attackingPieces * kingPenalty;
          evaluation += friendlyPieces * kingPenalty * 0.5;
        } else {
          evaluation += attackingPieces * kingPenalty;
          evaluation -= friendlyPieces * kingPenalty * 0.5;
        }
      }
    }
  }
  
  // Small bonus/penalty if in check
  if (gameInstance.inCheck()) {
    if (gameInstance.turn() === aiColor) {
      evaluation -= 50;
    } else {
      evaluation += 50;
    }
  }
  
  // Apply randomness to the evaluation.
  // Here we use a depth-based randomness factor.
  evaluation = addRandomness(evaluation, isEndgame(gameInstance) ? 4 : 2);
  
  return evaluation;
}

// Minimax algorithm with alpha-beta pruning
export function minimax(
  gameInstance: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiColor: string
): [number, Move | null] {
  // Base case: if depth is zero or game over, handle terminal cases
  if (depth === 0 || gameInstance.isGameOver()) {
    if (gameInstance.isCheckmate()) {
      // When in checkmate, the side whose turn it is has no moves.
      // Return a mate score adjusted by depth so that a faster mate is preferred.
      return [gameInstance.turn() === aiColor ? -100000 + depth : 100000 - depth, null];
    }
    return [evaluateBoard(gameInstance, aiColor), null];
  }
  
  // Check opening book if deep enough in the tree
  if (depth >= 3) {
    const bookMove = checkOpeningBook(gameInstance);
    if (bookMove) {
      return [0, bookMove];
    }
  }
  
  const moves = gameInstance.moves({ verbose: true }) as Move[];
  // Move ordering: prefer moves that capture higher value pieces
  moves.sort((a, b) => {
    const aScore = a.captured ? PIECE_VALUES[a.captured] : 0;
    const bScore = b.captured ? PIECE_VALUES[b.captured] : 0;
    return bScore - aScore;
  });
  
  let bestMove: Move | null = null;
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const [evalScore] = minimax(gameInstance, depth - 1, alpha, beta, false, aiColor);
      gameInstance.undo();
      
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      gameInstance.move(move);
      const [evalScore] = minimax(gameInstance, depth - 1, alpha, beta, true, aiColor);
      gameInstance.undo();
      
      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = move;
      }
      
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return [minEval, bestMove];
  }
}

// Function to find the best move using iterative deepening
export function findBestMove(
  gameInstance: Chess,
  aiColor: string,
  maxDepth = 3
): Move | null {
  let bestMove: Move | null = null;
  
  for (let depth = 1; depth <= maxDepth; depth++) {
    const [, move] = minimax(
      gameInstance,
      depth,
      -Infinity,
      Infinity,
      gameInstance.turn() === aiColor,
      aiColor
    );
    
    if (move) {
      bestMove = move;
    }
  }
  
  // Occasional randomness in move selection for variety
  if (bestMove && Math.random() < 0.1) {
    const moves = gameInstance.moves({ verbose: true }) as Move[];
    if (moves.length > 0) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
  }
  
  return bestMove;
}
