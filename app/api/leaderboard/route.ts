import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import redis from '../../../lib/redis';

export async function GET() {
  const clerk = await clerkClient();
  const leaderboard: Array<{ username: string; elo: number }> = [];

  // treat cursor as a number in v4, starting at 0
  let cursor = 0;

  do {
    // node-redis v4 returns an object: { cursor, keys }
    const { cursor: newCursor, keys: foundKeys } = await redis.scan(cursor, {
      MATCH: 'user:*:stats',
      COUNT: 100,
    });
    cursor = newCursor;

    if (foundKeys.length > 0) {
      const pipeline = redis.multi();
      for (const key of foundKeys) {
        pipeline.get(key);
      }
      const results = await pipeline.exec(); // array of raw replies

      for (let i = 0; i < foundKeys.length; i++) {
        const key = foundKeys[i];
        const statsStr = results[i] as string | null;
        if (!statsStr) continue;

        const stats = JSON.parse(statsStr);

        // Extract user id from key: "user:{id}:stats"
        const match = key.match(/^user:(.+):stats$/);
        if (!match) continue;
        const userId = match[1];

        // If we already have a username in stats, skip Clerk
        let { username } = stats;
        if (!username) {
          try {
            const user = await clerk.users.getUser(userId);
            username = user.username || user.firstName || 'Anonymous';
            // Store username in stats so future lookups skip Clerk
            stats.username = username;
            await redis.set(key, JSON.stringify(stats));
          } catch (error) {
            console.error('Error fetching user:', userId, error);
            continue;
          }
        }
        leaderboard.push({ username, elo: stats.elo });
      }
    }
  } while (cursor !== 0); // Continue scanning until cursor is 0

  // Sort leaderboard descending by ELO and take top 10
  leaderboard.sort((a, b) => b.elo - a.elo);
  const top10 = leaderboard.slice(0, 10);

  // Compute Rank based on ELO thresholds and add position
  const ranked = top10.map((entry, index) => {
    let rank = '';
    if (entry.elo < 1000) {
      rank = 'Novice';
    } else if (entry.elo < 1500) {
      rank = 'Master';
    } else {
      rank = 'GrandMaster';
    }
    return {
      position: index + 1,
      ...entry,
      rank,
    };
  });

  return NextResponse.json(ranked);
}
