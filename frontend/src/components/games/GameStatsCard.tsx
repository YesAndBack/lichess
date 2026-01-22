import { Trophy, X, Equal } from 'lucide-react';
import type { GameStats } from '../../types';

interface GameStatsCardProps {
  stats: GameStats;
}

export function GameStatsCard({ stats }: GameStatsCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Games */}
      <div className="card text-center">
        <p className="text-gray-400 text-sm mb-1">Total Games</p>
        <p className="text-3xl font-bold text-white">{stats.total.toLocaleString()}</p>
      </div>

      {/* Wins */}
      <div className="card text-center bg-green-900/20 border border-green-800/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-green-400" />
          <p className="text-green-400 text-sm">Wins</p>
        </div>
        <p className="text-3xl font-bold text-green-400">{stats.results.win.toLocaleString()}</p>
      </div>

      {/* Losses */}
      <div className="card text-center bg-red-900/20 border border-red-800/30">
        <div className="flex items-center justify-center gap-2 mb-1">
          <X className="w-4 h-4 text-red-400" />
          <p className="text-red-400 text-sm">Losses</p>
        </div>
        <p className="text-3xl font-bold text-red-400">{stats.results.loss.toLocaleString()}</p>
      </div>

      {/* Win Rate */}
      <div className="card text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Equal className="w-4 h-4 text-gray-400" />
          <p className="text-gray-400 text-sm">Win Rate</p>
        </div>
        <p className="text-3xl font-bold text-lichess-green">{stats.win_rate}%</p>
      </div>
    </div>
  );
}
