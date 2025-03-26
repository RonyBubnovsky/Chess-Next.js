import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import redis from '../../../lib/redis';

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

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    // Parse the game record from the request
    const body = (await request.json()) as GameRecord;
    // Use a Redis list to store game records for this user
    const key = `user:${userId}:games`;
    await redis.lPush(key, JSON.stringify(body));
    // Keep only the 50 most recent records
    await redis.lTrim(key, 0, 49);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game record:', error);
    return NextResponse.json({ error: 'Failed to save game record' }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  try {
    const key = `user:${userId}:games`;
    const records = await redis.lRange(key, 0, -1);
    const games: GameRecord[] = records.map(record => JSON.parse(record));
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json({ error: 'Failed to fetch game history' }, { status: 500 });
  }
}
