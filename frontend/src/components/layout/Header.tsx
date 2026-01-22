import { Link } from 'react-router-dom';
import { Crown, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-lichess-dark-lighter border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Crown className="w-8 h-8 text-lichess-green" />
            <span className="hidden sm:inline">Lichess Stats</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/games"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Games
              </Link>
            </nav>
          )}

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-5 h-5" />
                  <span>
                    {user.title && (
                      <span className={`title-${user.title.toLowerCase()} font-bold mr-1`}>
                        {user.title}
                      </span>
                    )}
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/" className="btn btn-primary">
                Login with Lichess
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-lichess-dark-light border-t border-gray-700">
          <div className="px-4 py-4 space-y-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 text-gray-300 pb-4 border-b border-gray-700">
                  <User className="w-5 h-5" />
                  <span>
                    {user.title && (
                      <span className={`title-${user.title.toLowerCase()} font-bold mr-1`}>
                        {user.title}
                      </span>
                    )}
                    {user.username}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="block text-gray-300 hover:text-white py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/games"
                  className="block text-gray-300 hover:text-white py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Games
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 py-2 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="btn btn-primary w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login with Lichess
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
