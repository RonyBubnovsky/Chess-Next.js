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
  stats: Stats;
}

export default function StatisticsSection({ stats }: StatisticsSectionProps) {
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
