// app/api/history/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import redis from '../../../lib/redis';

interface GameRecord {
  result: 'win' | 'loss' | 'draw';
  date: string;
  moveHistory: MoveHistoryItem[];
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  
  try {
    const body: GameRecord = await request.json();
    // Use a Redis list to store game records per user.
    const key = `user:${userId}:games`;
    // Prepend the new record.
    await redis.lPush(key, JSON.stringify(body));
    // trim the list to keep only the most recent 50 games:
    await redis.lTrim(key, 0, 49);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game:', userId, error);
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
    // Retrieve all game records from Redis.
    const records = await redis.lRange(key, 0, -1);
    // Parse the JSON strings.
    const games: GameRecord[] = records.map((r) => JSON.parse(r));
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching game:', userId, error);
    return NextResponse.json({ error: 'Failed to fetch game history' }, { status: 500 });
  }
}
