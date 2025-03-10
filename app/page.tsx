'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import ThreeDScene from '../components/ThreeDScene';

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-200 to-gray-300">
      {/* 3D Scene in the background */}
      <ThreeDScene />

      <div className="relative z-10 max-w-md w-full bg-white bg-opacity-90 backdrop-blur-md rounded-xl p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Welcome to Next.js Chess</h1>
        <p className="text-lg text-gray-700 mb-8">
          A modern chess experience with Clerk authentication.
        </p>
        {isSignedIn ? (
          <Link href="/chess">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
              Play Chess
            </button>
          </Link>
        ) : (
          <>
            <Link href="/sign-in">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition mr-4">
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
