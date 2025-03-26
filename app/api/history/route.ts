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
    // Parse the game record from the request body
    const body = (await request.json()) as GameRecord;
    const key = `user:${userId}:games`;

    // Use a Redis multi/exec transaction to push and trim in one go
    const pipeline = redis.multi();
    pipeline.lPush(key, JSON.stringify(body));
    pipeline.lTrim(key, 0, 49); // Keep only the 50 most recent records
    await pipeline.exec();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game record:', error);
    return NextResponse.json({ error: 'Failed to save game record' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  try {
    const key = `user:${userId}:games`;
    // support pagination via query parameters "offset" and "limit"
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    // Redis lRange stop index is inclusive, so calculate accordingly.
    const records = await redis.lRange(key, offset, offset + limit - 1);
    const games: GameRecord[] = records.map(record => JSON.parse(record));
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json({ error: 'Failed to fetch game history' }, { status: 500 });
  }
}
