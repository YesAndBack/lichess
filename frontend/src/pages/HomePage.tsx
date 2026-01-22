import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuthStore } from '../stores';
import { LoadingSpinner, Alert } from '../components/ui';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/profile');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { auth_url, state } = await api.startOAuth();
      // Store state for callback verification
      sessionStorage.setItem('oauth_state', state);
      // Redirect to Lichess
      window.location.href = auth_url;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start login. Please try again.');
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-lichess-dark-lighter rounded-full flex items-center justify-center mb-4">
            <Crown className="w-14 h-14 text-lichess-green" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Lichess Stats</h1>
          <p className="text-gray-400">
            View your chess statistics and game history from Lichess
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              message={error}
              dismissible
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 mb-8 text-left">
          <div className="card">
            <h3 className="font-semibold text-white mb-1">📊 Track Your Ratings</h3>
            <p className="text-sm text-gray-400">
              View ratings for Blitz, Rapid, Classical, and more
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-1">🎮 Game History</h3>
            <p className="text-sm text-gray-400">
              Browse and filter your recent games with detailed statistics
            </p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-1">📱 Mobile Friendly</h3>
            <p className="text-sm text-gray-400">
              Access your stats on any device with responsive design
            </p>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Connecting...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5" />
              Login with Lichess
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          Secure authentication via Lichess OAuth2
        </p>
      </div>
    </div>
  );
}
