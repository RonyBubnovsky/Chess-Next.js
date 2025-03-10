'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import ThreeDScene from '../components/ThreeDScene';

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen flex">
      {/* Left side: 3D knight animation */}
      <section className="relative w-1/2 overflow-hidden">
        <ThreeDScene />
      </section>

      {/* Right side: Welcome panel */}
      <section className="w-1/2 bg-gradient-to-br from-indigo-300 to-purple-300 flex flex-col items-center justify-center p-10">
        <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Welcome to Next.js Chess
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A modern chess experience with Clerk authentication.
          </p>
          {isSignedIn ? (
            <Link href="/chess">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-semibold">
                Play Chess
              </button>
            </Link>
          ) : (
            <div className="space-x-4">
              <Link href="/sign-in">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-semibold">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-semibold">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
