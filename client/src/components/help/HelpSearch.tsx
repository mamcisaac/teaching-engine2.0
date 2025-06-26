import React, { useState, useRef, useEffect } from 'react';
import { useHelpSearch, useHelpContent } from '../../hooks/useHelp';
import { useHelp } from '../../contexts/HelpContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';

interface HelpSearchProps {
  placeholder?: string;
  showFilters?: boolean;
  showSuggestions?: boolean;
  onResultSelect?: (contentId: string) => void;
}

export const HelpSearch: React.FC<HelpSearchProps> = ({
  placeholder = "Search help topics...",
  showFilters = true,
  showSuggestions = true,
  onResultSelect
}) => {
  const { query, setQuery, suggestions, popularSearches } = useHelpSearch();
  const { content, availableFilters } = useHelpContent();
  const { state, addFilter, removeFilter, clearFilters } = useHelp();
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
        setShowFiltersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestionsDropdown(false);
    // Results will automatically update through the useHelpContent hook
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionsDropdown(false);
  };

  const handleFilterToggle = (filterValue: string) => {
    if (state.activeFilters.includes(filterValue)) {
      removeFilter(filterValue);
    } else {
      addFilter(filterValue);
    }
  };

  const handleClearAll = () => {
    setQuery('');
    clearFilters();
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestionsDropdown(e.target.value.length > 0 && showSuggestions);
            }}
            onFocus={() => setShowSuggestionsDropdown(query.length > 0 && showSuggestions)}
            className="w-full pr-24"
          />
          
          {/* Search Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {showFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                className={clsx(
                  'p-1',
                  state.activeFilters.length > 0 && 'text-blue-600 bg-blue-50'
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                {state.activeFilters.length > 0 && (
                  <span className="ml-1 text-xs">{state.activeFilters.length}</span>
                )}
              </Button>
            )}
            
            <Button type="submit" variant="ghost" size="sm" className="p-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </div>
        </div>
      </form>

      {/* Active Filters */}
      {state.activeFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filters:</span>
          {state.activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {filter}
              <button
                type="button"
                onClick={() => removeFilter(filter)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search Suggestions Dropdown */}
      {showSuggestionsDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {/* Current Query Results */}
          {content.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">Search Results ({content.length})</div>
              {content.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (onResultSelect) {
                      onResultSelect(item.id);
                    }
                    setShowSuggestionsDropdown(false);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                >
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-gray-600 text-xs mt-1">{item.section}</div>
                </button>
              ))}
              {content.length > 3 && (
                <div className="text-xs text-gray-500 mt-2">
                  {content.length - 3} more results...
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {query.length === 0 && (
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Popular Searches</div>
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="block w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters Dropdown */}
      {showFiltersDropdown && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Filters</h4>
              {state.activeFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Difficulty Filters */}
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Difficulty</h5>
                <div className="space-y-1">
                  {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
                    const filter = availableFilters.find(f => f.value === difficulty);
                    if (!filter) return null;
                    
                    return (
                      <label key={difficulty} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={state.activeFilters.includes(difficulty)}
                          onChange={() => handleFilterToggle(difficulty)}
                          className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {filter.label} ({filter.count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Topic Filters */}
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Topics</h5>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableFilters
                    .filter(f => !['beginner', 'intermediate', 'advanced'].includes(f.value))
                    .slice(0, 8) // Limit to prevent overflow
                    .map((filter) => (
                      <label key={filter.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={state.activeFilters.includes(filter.value)}
                          onChange={() => handleFilterToggle(filter.value)}
                          className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {filter.label} ({filter.count})
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};