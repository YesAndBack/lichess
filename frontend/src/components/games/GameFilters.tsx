import { Filter, X } from 'lucide-react';
import type { GameFilters, GameResult } from '../../types';

interface GameFiltersProps {
  filters: GameFilters;
  onFilterChange: (filters: GameFilters) => void;
  onReset: () => void;
}

const perfTypes = [
  { value: '', label: 'All Types' },
  { value: 'bullet', label: '🔵 Bullet' },
  { value: 'blitz', label: '⚡ Blitz' },
  { value: 'rapid', label: '🐢 Rapid' },
  { value: 'classical', label: '♟️ Classical' },
];

const resultOptions = [
  { value: '', label: 'All Results' },
  { value: 'win', label: '✓ Wins' },
  { value: 'loss', label: '✗ Losses' },
  { value: 'draw', label: '= Draws' },
];

export function GameFiltersComponent({ filters, onFilterChange, onReset }: GameFiltersProps) {
  const hasActiveFilters = filters.perf_type || filters.result || filters.rated !== undefined;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 text-gray-400">
        <Filter className="w-5 h-5" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Game Type Filter */}
        <select
          value={filters.perf_type || ''}
          onChange={(e) => onFilterChange({ ...filters, perf_type: e.target.value || undefined })}
          className="input py-1.5 px-3 w-auto text-sm"
        >
          {perfTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Result Filter */}
        <select
          value={filters.result || ''}
          onChange={(e) => onFilterChange({ ...filters, result: (e.target.value as GameResult) || undefined })}
          className="input py-1.5 px-3 w-auto text-sm"
        >
          {resultOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Rated Filter */}
        <select
          value={filters.rated === undefined ? '' : filters.rated.toString()}
          onChange={(e) => {
            const value = e.target.value;
            onFilterChange({
              ...filters,
              rated: value === '' ? undefined : value === 'true',
            });
          }}
          className="input py-1.5 px-3 w-auto text-sm"
        >
          <option value="">All Games</option>
          <option value="true">Rated Only</option>
          <option value="false">Casual Only</option>
        </select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
