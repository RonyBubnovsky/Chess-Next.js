

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import redisClient from '../../../lib/redis'; 

export async function DELETE(request: Request) {
  // Get the current user id from Clerk auth.
  const { userId } = await auth();

  // If the user is not authenticated, return a 401 Unauthorized.
  if (!userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    // Delete the user account from Clerk.
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);

    // Delete the user's leaderboard stats from Redis.
    // The key format is "user:${userId}:stats"
    await redisClient.del(`user:${userId}:stats`);

    // Return a success message after deleting account and leaderboard entry.
    return NextResponse.json({ message: 'Account and leaderboard entry deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting account or leaderboard entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
