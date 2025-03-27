import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import redisClient from '../../../lib/redis'; 

export async function DELETE() {
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
    await redisClient.del(`user:${userId}:stats`);
    
    // Delete the user's games and game cache from Redis.
    await redisClient.del(`user:${userId}:games`);
    await redisClient.del(`user:${userId}:games:cache`);
  
    // Return a success message after deleting account, leaderboard entry, and games.
    return NextResponse.json({ message: 'Account, leaderboard entry, and games deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error deleting account or related data:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete account' },
        { status: 500 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }  
}
