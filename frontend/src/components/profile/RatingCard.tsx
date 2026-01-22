import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { UserRating } from '../../types';

interface RatingCardProps {
  type: string;
  rating: UserRating;
}

const typeLabels: Record<string, string> = {
  bullet: '🔵 Bullet',
  blitz: '⚡ Blitz',
  rapid: '🐢 Rapid',
  classical: '♟️ Classical',
  correspondence: '📮 Correspondence',
  chess960: '🎲 Chess960',
  puzzle: '🧩 Puzzles',
};

const typeColors: Record<string, string> = {
  bullet: 'from-blue-600 to-blue-800',
  blitz: 'from-yellow-600 to-yellow-800',
  rapid: 'from-green-600 to-green-800',
  classical: 'from-purple-600 to-purple-800',
  correspondence: 'from-gray-600 to-gray-800',
  chess960: 'from-pink-600 to-pink-800',
  puzzle: 'from-orange-600 to-orange-800',
};

export function RatingCard({ type, rating }: RatingCardProps) {
  const prog = rating.prog || 0;
  const isProvisional = rating.prov === true;

  return (
    <div className={`card bg-gradient-to-br ${typeColors[type] || 'from-gray-600 to-gray-800'} p-4`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-white/80">
          {typeLabels[type] || type}
        </h3>
        {prog > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            +{prog}
          </div>
        )}
        {prog < 0 && (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <TrendingDown className="w-3 h-3" />
            {prog}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">
          {rating.rating}
        </span>
        {isProvisional && (
          <span className="text-lg text-white/40">?</span>
        )}
      </div>
      
      <p className="text-sm text-white/60 mt-1">
        {rating.games.toLocaleString()} games
      </p>
    </div>
  );
}
