import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createHash } from 'crypto';
import { getRedisClient } from '../../../lib/redis';

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

async function deleteMatchingKeys(redis: Awaited<ReturnType<typeof getRedisClient>>, pattern: string) {
  if (!redis) return;

  for await (const key of redis.scanIterator({ MATCH: pattern })) {
    await redis.del(key as string);
  }
}

function createGameFingerprint(game: GameRecord): string {
  // Ignore date so duplicate end callbacks for same game collapse together.
  return createHash('sha256')
    .update(
      JSON.stringify({
        result: game.result,
        orientation: game.orientation,
        moveHistory: game.moveHistory,
      })
    )
    .digest('hex');
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const redis = await getRedisClient();
    if (!redis) {
      return NextResponse.json({ error: 'Redis unavailable' }, { status: 503 });
    }

    // Parse the game record from the request body
    const body = (await request.json()) as GameRecord;
    const key = `user:${userId}:games`;
    const fingerprint = createGameFingerprint(body);
    const dedupeKey = `user:${userId}:games:dedupe:${fingerprint}`;

    // Block duplicate saves for same finished game during a short window.
    const shouldSave = await redis.set(dedupeKey, '1', { NX: true, EX: 120 });
    if (!shouldSave) {
      return NextResponse.json({ success: true, deduped: true });
    }

    // Use a Redis multi/exec transaction to push and trim in one go
    const pipeline = redis.multi();
    pipeline.lPush(key, JSON.stringify(body));
    pipeline.lTrim(key, 0, 49); // Keep only the 50 most recent records
    await pipeline.exec();

    // Invalidate any cached version so next GET returns fresh data.
    const cacheKey = `user:${userId}:games:cache`;
    await redis.del(cacheKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game record:', error);
    return NextResponse.json({ error: 'Failed to save game record' }, { status: 500 });
  }
}

export async function GET(_request: Request) {
  void _request;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  try {
    const redis = await getRedisClient();
    if (!redis) {
      // Return an empty history list so the history page still loads.
      return NextResponse.json([]);
    }

    const cacheKey = `user:${userId}:games:cache`;
    // Check if cached value exists.
    const cachedGames = await redis.get(cacheKey);
    if (cachedGames) {
      return NextResponse.json(JSON.parse(cachedGames));
    }

    const key = `user:${userId}:games`;
    const records = await redis.lRange(key, 0, -1);
    const games: GameRecord[] = records.map(record => JSON.parse(record));

    // Cache the result for 15 seconds.
    await redis.set(cacheKey, JSON.stringify(games), { EX: 15 });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json({ error: 'Failed to fetch game history' }, { status: 500 });
  }
}

export async function DELETE() {
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

    await redis.del([key, cacheKey]);
    await deleteMatchingKeys(redis, `user:${userId}:games:dedupe:*`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game history:', error);
    return NextResponse.json({ error: 'Failed to delete game history' }, { status: 500 });
  }
}
