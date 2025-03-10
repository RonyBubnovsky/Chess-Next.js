'use client';

import React from 'react';

export interface Stats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  elo: number;
}

interface StatisticsSectionProps {
  stats: Stats | null;
  loading?: boolean;
}

export default function StatisticsSection({ stats, loading }: StatisticsSectionProps) {
  if (loading || !stats) {
    return (
      <div className="bg-gray-900 border-4 border-blue-500 rounded-xl p-8 shadow-2xl max-w-md mx-auto flex flex-col items-center justify-center">
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
        <p className="mt-4 text-xl text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-4 border-blue-500 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-blue-400 text-center">
        Your Chess Stats
      </h2>
      <div className="space-y-2">
        <p className="text-lg">
          Games Played: <span className="font-semibold text-white">{stats.played}</span>
        </p>
        <p className="text-lg">
          Wins: <span className="font-semibold text-green-400">{stats.wins}</span>
        </p>
        <p className="text-lg">
          Losses: <span className="font-semibold text-red-400">{stats.losses}</span>
        </p>
        <p className="text-lg">
          Draws/Stalemates: <span className="font-semibold text-yellow-400">{stats.draws}</span>
        </p>
        <p className="text-lg">
          RonyChess ELO: <span className="font-semibold text-purple-400">{stats.elo}</span>
        </p>
      </div>
    </div>
  );
}
