import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores';
import { Layout, LoadingPage, Alert } from '../components';
import { UserProfileCard, RatingCard } from '../components/profile';
import type { UserRating } from '../types';

export function ProfilePage() {
  const { user, isLoading, error, refreshUser, clearError } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Clear any previous errors when mounting
    clearError();
  }, [clearError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading && !user) {
    return (
      <Layout>
        <LoadingPage />
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Alert type="error" message="Failed to load user profile" />
        </div>
      </Layout>
    );
  }

  // Get ratings that exist
  const ratings = user.ratings || {};
  const ratingTypes = ['blitz', 'rapid', 'classical', 'bullet', 'correspondence', 'chess960', 'puzzle'] as const;
  const availableRatings = ratingTypes.filter(
    (type) => ratings[type] && ratings[type]!.games > 0
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              dismissible
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Profile Card */}
        <UserProfileCard user={user} />

        {/* Ratings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Ratings</h2>
          
          {availableRatings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableRatings.map((type) => (
                <RatingCard
                  key={type}
                  type={type}
                  rating={ratings[type] as UserRating}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-400">No ratings available yet. Start playing on Lichess!</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href={`https://lichess.org/@/${user.username}/perf/blitz`}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:bg-lichess-dark-light transition-colors"
            >
              <h3 className="font-medium text-white">⚡ Blitz Stats</h3>
              <p className="text-sm text-gray-400">View detailed Blitz statistics on Lichess</p>
            </a>
            <a
              href={`https://lichess.org/@/${user.username}/perf/rapid`}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:bg-lichess-dark-light transition-colors"
            >
              <h3 className="font-medium text-white">🐢 Rapid Stats</h3>
              <p className="text-sm text-gray-400">View detailed Rapid statistics on Lichess</p>
            </a>
            <a
              href={`https://lichess.org/training`}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:bg-lichess-dark-light transition-colors"
            >
              <h3 className="font-medium text-white">🧩 Puzzles</h3>
              <p className="text-sm text-gray-400">Train with chess puzzles</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
