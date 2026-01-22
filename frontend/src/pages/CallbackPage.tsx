import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { LoadingSpinner, Alert } from '../components/ui';

export function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, error: authError, clearError } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Clear any previous errors
    clearError();
    
    const handleCallback = async () => {
      // Prevent double processing
      if (hasProcessed.current) return;
      hasProcessed.current = true;
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for OAuth error
      if (errorParam) {
        setError(errorDescription || `Authentication error: ${errorParam}`);
        setIsProcessing(false);
        return;
      }

      // Validate code and state
      if (!code || !state) {
        setError('Invalid callback: missing code or state');
        setIsProcessing(false);
        return;
      }

      // Verify state matches
      const savedState = sessionStorage.getItem('oauth_state');
      if (state !== savedState) {
        setError('Invalid state parameter. Please try logging in again.');
        setIsProcessing(false);
        return;
      }

      // Clear saved state
      sessionStorage.removeItem('oauth_state');

      try {
        await login(code, state);
        navigate('/profile', { replace: true });
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate, clearError]);

  if (isProcessing && !error && !authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-400">Completing login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Alert
          type="error"
          title="Authentication Failed"
          message={error || authError || 'An unexpected error occurred'}
        />
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary w-full mt-4"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
