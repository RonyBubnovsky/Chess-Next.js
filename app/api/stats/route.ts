
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import redis from '../../../lib/redis';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const key = `user:${user.id}:stats`;
  const statsStr = await redis.get(key);
  let stats;
  if (!statsStr) {
    stats = { played: 0, wins: 0, losses: 0, draws: 0, elo: 500 };
    await redis.set(key, JSON.stringify(stats));
  } else {
    stats = JSON.parse(statsStr);
  }
  return NextResponse.json(stats);
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const key = `user:${user.id}:stats`;
  const { result } = await request.json();
  const statsStr = await redis.get(key);
  let stats;
  if (!statsStr) {
    stats = { played: 0, wins: 0, losses: 0, draws: 0, elo: 500 };
  } else {
    stats = JSON.parse(statsStr);
  }
  stats.played++;
  if (result === 'win') {
    stats.wins++;
    stats.elo += 50;
  } else if (result === 'loss') {
    stats.losses++;
    stats.elo -= 50;
  } else if (result === 'draw') {
    stats.draws++;
  }
  await redis.set(key, JSON.stringify(stats));
  return NextResponse.json(stats);
}
