import { ExternalLink, Clock, Swords, Trophy, X, Scale } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Game } from '../../types';

interface GameRowProps {
  game: Game;
}

const resultConfig = {
  win: { 
    style: 'badge-win', 
    label: 'Win',
    icon: Trophy,
    border: 'border-l-green-500',
    glow: 'shadow-green-500/10'
  },
  loss: { 
    style: 'badge-loss', 
    label: 'Loss',
    icon: X,
    border: 'border-l-red-500',
    glow: 'shadow-red-500/10'
  },
  draw: { 
    style: 'badge-draw', 
    label: 'Draw',
    icon: Scale,
    border: 'border-l-yellow-500',
    glow: 'shadow-yellow-500/10'
  },
};

const statusLabels: Record<string, string> = {
  mate: 'Checkmate',
  resign: 'Resignation',
  stalemate: 'Stalemate',
  timeout: 'Timeout',
  draw: 'Draw',
  outoftime: 'Out of time',
  cheat: 'Cheat detected',
  noStart: 'No start',
  unknownFinish: 'Unknown',
  variantEnd: 'Variant end',
};

const speedConfig: Record<string, { emoji: string; color: string }> = {
  ultraBullet: { emoji: '🚀', color: 'text-purple-400' },
  bullet: { emoji: '🔵', color: 'text-blue-400' },
  blitz: { emoji: '⚡', color: 'text-yellow-400' },
  rapid: { emoji: '🐢', color: 'text-green-400' },
  classical: { emoji: '♟️', color: 'text-amber-400' },
  correspondence: { emoji: '📮', color: 'text-gray-400' },
};

export function GameRow({ game }: GameRowProps) {
  const formatTimeControl = (initial?: number, increment?: number): string => {
    if (!initial) return '-';
    const minutes = Math.floor(initial / 60);
    return increment ? `${minutes}+${increment}` : `${minutes}`;
  };

  const result = resultConfig[game.result];
  const speed = speedConfig[game.speed] || { emoji: '♟️', color: 'text-gray-400' };
  const ResultIcon = result.icon;

  return (
    <div className={clsx(
      'group bg-gradient-to-r from-lichess-dark-light to-lichess-dark-lighter',
      'rounded-xl p-4 border-l-4 transition-all duration-300',
      'hover:shadow-lg hover:scale-[1.01] hover:from-lichess-dark-lighter hover:to-lichess-dark-light',
      result.border,
      result.glow
    )}>
      {/* Desktop: Grid layout for consistent columns */}
      <div className="hidden md:grid md:grid-cols-[minmax(200px,1fr)_minmax(180px,1fr)_minmax(250px,1fr)] items-center gap-4">
        {/* Result & Game Type */}
        <div className="flex items-center gap-3">
          <span className={clsx('badge gap-1.5 shrink-0', result.style)}>
            <ResultIcon className="w-3 h-3" />
            {result.label}
          </span>
          
          <div className={clsx('flex items-center gap-1.5 text-sm', speed.color)}>
            <span className="text-base">{speed.emoji}</span>
            <span className="font-medium capitalize">{game.perf_type}</span>
            <span className="text-gray-500 text-xs">
              ({formatTimeControl(game.time_control_initial, game.time_control_increment)})
            </span>
          </div>
        </div>

        {/* Opponent - Fixed width center column */}
        <div className="flex items-center justify-center gap-2">
          <Swords className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-gray-400 text-sm">vs</span>
          <a
            href={`https://lichess.org/@/${game.opponent_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white hover:text-lichess-green transition-colors truncate max-w-[120px]"
            title={game.opponent_username}
          >
            {game.opponent_username}
          </a>
          {game.opponent_rating && (
            <span className="px-2 py-0.5 bg-lichess-dark rounded-full text-xs text-gray-400 shrink-0">
              {game.opponent_rating}
            </span>
          )}
        </div>

        {/* Status, Date & Link */}
        <div className="flex items-center gap-3 text-sm text-gray-400 justify-end">
          <span className="px-2 py-1 bg-lichess-dark/50 rounded text-xs">
            {statusLabels[game.status] || game.status}
          </span>
          
          <span className="flex items-center gap-1.5 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(game.created_at), 'MMM d, yyyy')}
          </span>
          
          <a
            href={game.lichess_url || `https://lichess.org/${game.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-lichess-dark hover:bg-lichess-green text-gray-400 hover:text-white transition-all duration-200"
            title="View on Lichess"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={clsx('badge gap-1.5', result.style)}>
              <ResultIcon className="w-3 h-3" />
              {result.label}
            </span>
            <div className={clsx('flex items-center gap-1 text-sm', speed.color)}>
              <span>{speed.emoji}</span>
              <span className="capitalize">{game.perf_type}</span>
              <span className="text-gray-500 text-xs">
                ({formatTimeControl(game.time_control_initial, game.time_control_increment)})
              </span>
            </div>
          </div>
          <a
            href={game.lichess_url || `https://lichess.org/${game.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-lichess-dark hover:bg-lichess-green text-gray-400 hover:text-white transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">vs</span>
            <a
              href={`https://lichess.org/@/${game.opponent_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white hover:text-lichess-green"
            >
              {game.opponent_username}
            </a>
            {game.opponent_rating && (
              <span className="px-2 py-0.5 bg-lichess-dark rounded-full text-xs text-gray-400">
                {game.opponent_rating}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            {format(new Date(game.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Opening */}
      {game.opening_name && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            {game.opening_eco && (
              <span className="px-2 py-0.5 bg-lichess-dark rounded text-xs font-mono text-lichess-green">
                {game.opening_eco}
              </span>
            )}
            <span className="truncate">{game.opening_name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
