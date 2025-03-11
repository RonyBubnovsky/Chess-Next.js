import { NextResponse } from 'next/server';
import redis from '../../../lib/redis';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  // Retrieve all keys matching user:*:stats
  const keys = await redis.keys('user:*:stats');
  const leaderboard = [];

  // Await clerkClient once outside the loop.
  const clerk = await clerkClient();

  // For each key, get the stats and fetch the user's Clerk info
  for (const key of keys) {
    const statsStr = await redis.get(key);
    if (!statsStr) continue;
    const stats = JSON.parse(statsStr);
    // Extract user id from key: "user:{id}:stats"
    const match = key.match(/^user:(.+):stats$/);
    if (!match) continue;
    const userId = match[1];
    try {
      const user = await clerk.users.getUser(userId);
      // Use clerk username if available, otherwise first name or fallback to "Anonymous"
      const username = user.username || user.firstName || 'Anonymous';
      leaderboard.push({ username, elo: stats.elo });
    } catch (error) {
      console.error('Error fetching user:', userId, error);
    }
  }

  // Sort leaderboard descending by ELO and take the top 10 entries
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
    return { position: index + 1, ...entry, rank };
  });

  return NextResponse.json(ranked);
}
