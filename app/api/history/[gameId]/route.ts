import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRedisClient } from '../../../../lib/redis';

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
    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json({ error: 'Redis unavailable' }, { status: 503 });
    }

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  void request;
  const { gameId } = await params;
  const gameIdDecoded = decodeURIComponent(gameId);

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json({ error: 'Redis unavailable' }, { status: 503 });
    }

    const key = `user:${userId}:games`;
    const cacheKey = `user:${userId}:games:cache`;
    const records = await redis.lRange(key, 0, -1);
    const games = records.map(record => JSON.parse(record) as GameRecord);
    const filteredGames = games.filter(game => game.date !== gameIdDecoded);

    if (filteredGames.length === games.length) {
      return NextResponse.json({ error: 'Game record not found' }, { status: 404 });
    }

    const pipeline = redis.multi();
    pipeline.del(key);

    if (filteredGames.length > 0) {
      pipeline.rPush(
        key,
        filteredGames.map(game => JSON.stringify(game))
      );
    }

    pipeline.del(cacheKey);
    await pipeline.exec();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game record:', error);
    return NextResponse.json({ error: 'Failed to delete game record' }, { status: 500 });
  }
}
