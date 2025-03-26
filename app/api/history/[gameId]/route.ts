import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import redis from '../../../../lib/redis';

interface MoveHistoryItem {
  fen: string;
  lastMove: { from: string; to: string } | null;
  capturedPiece: {
    type: 'p' | 'n' | 'b' | 'r' | 'q';
    color: 'w' | 'b';
  } | null;
}

interface GameRecord {
  result: 'win' | 'loss' | 'draw';
  date: string;
  moveHistory: MoveHistoryItem[];
  orientation: 'white' | 'black';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const gameIdDecoded = decodeURIComponent(gameId);

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const key = `user:${userId}:games`;
    const records = await redis.lRange(key, 0, -1);
    const gameRecord: GameRecord | undefined = records
      .map(record => JSON.parse(record) as GameRecord)
      .find(r => r.date === gameIdDecoded);
    if (!gameRecord) {
      return NextResponse.json({ error: 'Game record not found' }, { status: 404 });
    }
    return NextResponse.json(gameRecord);
  } catch (error) {
    console.error('Error fetching game record:', error);
    return NextResponse.json({ error: 'Failed to fetch game record' }, { status: 500 });
  }
}
