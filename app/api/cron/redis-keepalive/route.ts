import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '../../../../lib/redis';

export const runtime = 'nodejs';

const keepAliveKey = 'app:keepalive:last_seen';

export async function GET(request: NextRequest) {
  // This blocks random public requests from touching Redis.
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = await getRedisClient();
  if (!redis) {
    // This tells Vercel logs that cron ran but Redis could not be reached.
    return NextResponse.json({ error: 'Redis unavailable' }, { status: 503 });
  }

  try {
    // This writes one small value so the free Redis instance stays active.
    const lastSeenAt = new Date().toISOString();
    await redis.set(keepAliveKey, lastSeenAt);

    return NextResponse.json({
      ok: true,
      key: keepAliveKey,
      lastSeenAt,
    });
  } catch (error) {
    console.error('Redis keepalive failed', error);

    // This keeps failure easy to spot in Vercel function logs.
    return NextResponse.json(
      { error: 'Redis keepalive failed' },
      { status: 500 }
    );
  }
}
