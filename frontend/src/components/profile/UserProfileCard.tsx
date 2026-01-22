import { Calendar, Clock, Trophy, MapPin, ExternalLink } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { User } from '../../types';

interface UserProfileCardProps {
  user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-lichess-dark-light flex items-center justify-center text-3xl font-bold text-lichess-green flex-shrink-0">
          {user.username.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            {user.title && (
              <span className={`title-${user.title.toLowerCase()} font-bold text-lg`}>
                {user.title}
              </span>
            )}
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            {user.patron && (
              <Trophy className="w-5 h-5 text-yellow-500" title="Lichess Patron" />
            )}
          </div>

          {user.profile?.bio && (
            <p className="text-gray-400 mb-3 max-w-lg">{user.profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-400">
            {user.profile?.country && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.profile.country}</span>
              </div>
            )}
            
            {user.created_at_lichess && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(user.created_at_lichess), 'MMM yyyy')}</span>
              </div>
            )}
            
            {user.seen_at && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Active {formatDistanceToNow(new Date(user.seen_at))} ago</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Play time: {formatPlayTime(user.play_time_total)}</span>
            </div>
          </div>

          <a
            href={`https://lichess.org/@/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-4 text-lichess-green hover:underline"
          >
            View on Lichess
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
