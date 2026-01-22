import { useEffect, useState } from 'react';
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useGamesStore } from '../stores';
import { Layout, LoadingPage, LoadingSpinner, Alert } from '../components';
import { GameRow, GameFiltersComponent, GameStatsCard } from '../components/games';

const GAMES_PER_PAGE = 10;

export function GamesPage() {
  const {
    games,
    total,
    filters,
    stats,
    isLoading,
    isSyncing,
    error,
    fetchGames,
    syncGames,
    fetchStats,
    setFilters,
    resetFilters,
    clearError,
  } = useGamesStore();

  const [syncResult, setSyncResult] = useState<{ fetched: number; saved: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(total / GAMES_PER_PAGE);

  useEffect(() => {
    // Fetch games and stats on mount
    fetchGames(currentPage, false);
    fetchStats();
  }, [fetchGames, fetchStats, currentPage]);

  const handleSync = async () => {
    setSyncResult(null);
    try {
      const result = await syncGames(100);
      setSyncResult(result);
      setCurrentPage(1);
    } catch (err) {
      // Error is handled in store
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Game History</h1>
            <p className="text-gray-400 text-sm">
              {total > 0 ? `${total.toLocaleString()} games` : 'No games yet'}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn btn-primary flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <LoadingSpinner size="sm" />
                Syncing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Sync Games
              </>
            )}
          </button>
        </div>

        {/* Alerts */}
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

        {syncResult && (
          <div className="mb-6">
            <Alert
              type="success"
              message={`Synced ${syncResult.saved} new games (${syncResult.fetched} fetched from Lichess)`}
              dismissible
              onDismiss={() => setSyncResult(null)}
            />
          </div>
        )}

        {/* Stats */}
        {stats && stats.total > 0 && (
          <div className="mb-6">
            <GameStatsCard stats={stats} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 card">
          <GameFiltersComponent
            filters={filters}
            onFilterChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        {/* Games List */}
        {isLoading && games.length === 0 ? (
          <LoadingPage />
        ) : games.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-4">
              {filters.perf_type || filters.result
                ? 'No games match your filters'
                : 'No games synced yet'}
            </p>
            {!filters.perf_type && !filters.result && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="btn btn-primary"
              >
                {isSyncing ? 'Syncing...' : 'Sync Games from Lichess'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Games Container */}
            <div className="w-full space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                games.map((game) => (
                  <GameRow key={game.id} game={game} />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                {/* Page Info */}
                <p className="text-sm text-gray-400">
                  Showing {((currentPage - 1) * GAMES_PER_PAGE) + 1} - {Math.min(currentPage * GAMES_PER_PAGE, total)} of {total.toLocaleString()} games
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    title="First page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((pageNum, index) => (
                      typeof pageNum === 'number' ? (
                        <button
                          key={index}
                          onClick={() => goToPage(pageNum)}
                          className={`pagination-num ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      ) : (
                        <span key={index} className="px-2 text-gray-500">
                          {pageNum}
                        </span>
                      )
                    ))}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    title="Last page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {totalPages <= 1 && games.length > 0 && (
              <p className="mt-6 text-center text-gray-500 text-sm">
                All {total.toLocaleString()} games shown
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
