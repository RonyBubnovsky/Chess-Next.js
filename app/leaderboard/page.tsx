
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  position: number;
  username: string;
  elo: number;
  rank: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>
      {loading ? (
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-16 w-16 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p className="mt-4 text-xl">Loading leaderboard...</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full max-w-4xl">
        <table className="min-w-full bg-gray-900 text-white border border-gray-700">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-center">#</th>
              <th className="py-3 px-4 border-b text-left">Name</th>
              <th className="py-3 px-4 border-b text-center">ELO</th>
              <th className="py-3 px-4 border-b text-center">Rank</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.position} className="hover:bg-gray-800">
                <td className="py-3 px-4 border-b text-center">{entry.position}</td>
                <td className="py-3 px-4 border-b text-left">{entry.username}</td>
                <td className="py-3 px-4 border-b text-center">{entry.elo}</td>
                <td className="py-3 px-4 border-b text-center">{entry.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <div className="mt-8">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md transition shadow-sm transform hover:scale-105 hover:-translate-y-0.5"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
