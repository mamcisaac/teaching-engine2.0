import { clsx } from 'clsx';
import React, { useState, useRef, useEffect } from 'react';

import { useHelp } from '../../contexts/HelpContext';
import { useHelpSearch, useHelpContent } from '../../hooks/useHelp';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

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
}): React.ReactElement => {
  const { query, setQuery, suggestions, popularSearches } = useHelpSearch();
  const { content, availableFilters } = useHelpContent();
  const { state, addFilter, removeFilter, clearFilters } = useHelp();
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
        setShowFiltersDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
 document.removeEventListener('mousedown', handleClickOutside); 
};
  }, [])

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setShowSuggestionsDropdown(false);
    // Results will automatically update through the useHelpContent hook
  };

  const handleSuggestionClick = (suggestion: string): void => {
    setQuery(suggestion);
    setShowSuggestionsDropdown(false);
  };

  const handleFilterToggle = (filterValue: string): void => {
    if (state.activeFilters.includes(filterValue)) {
      removeFilter(filterValue);
    } else {
      addFilter(filterValue);
    }
  };

  const handleClearAll = (): void => {
    setQuery('');
    clearFilters();
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <form className="relative" onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Input
            className="w-full pr-24"
            placeholder={placeholder}
            type="text"
            value={query}
            onChange={(e): void => {
              setQuery(e.target.value);
              setShowSuggestionsDropdown(e.target.value.length > 0 && showSuggestions);
            }}
            onFocus={(): void => {
 setShowSuggestionsDropdown(query.length > 0 && showSuggestions); 
}}
          />
          
          {/* Search Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {showFilters && (
              <Button
                className={clsx(
                  'p-1',
                  state.activeFilters.length > 0 && 'text-blue-600 bg-blue-50'
                )}
                size="sm"
                type="button"
                variant="ghost"
                onClick={(): void => {
 setShowFiltersDropdown(!showFiltersDropdown); 
}}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                {state.activeFilters.length > 0 && (
                  <span className="ml-1 text-xs">{state.activeFilters.length}</span>
                )}
              </Button>
            )}
            
            <Button className="p-1" size="sm" type="submit" variant="ghost">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </Button>
          </div>
        </div>
      </form>

      {/* Active Filters */}
      {state.activeFilters.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filters:</span>
          {state.activeFilters.map((filter, _index) => (
            <span
              key={filter}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {filter}
              <button
                className="ml-1 text-blue-600 hover:text-blue-800"
                type="button"
                onClick={(): void => {
 removeFilter(filter); 
}}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </span>
          ))}
          <button
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            type="button"
            onClick={handleClearAll}
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
              {content.slice(0, 3).map((item, _index) => (
                <button
                  key={item.id}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm"
                  onClick={(): void => {
                    if (onResultSelect) {
                      onResultSelect(item.id);
                    }
                    setShowSuggestionsDropdown(false);
                  }}
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
              {suggestions.map((suggestion, _index) => (
                <button
                  key={_index}
                  className="block w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                  onClick={(): void => {
 handleSuggestionClick(suggestion); 
}}
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
              {popularSearches.map((search, _index) => (
                <button
                  key={_index}
                  className="block w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                  onClick={(): void => {
 handleSuggestionClick(search); 
}}
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
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                  onClick={clearFilters}
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
                  {['beginner', 'intermediate', 'advanced'].map((difficulty, _index) => {
                    const filter = availableFilters.find(f => f.value === difficulty);
                    if (!filter) {
return null;
}
                    
                    return (
                      <label key={difficulty} className="flex items-center">
                        <input
                          checked={state.activeFilters.includes(difficulty)}
                          className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          type="checkbox"
                          onChange={(): void => {
 handleFilterToggle(difficulty); 
}}
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
                    .map((filter, _index) => (
                      <label key={filter.value} className="flex items-center">
                        <input
                          checked={state.activeFilters.includes(filter.value)}
                          className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          type="checkbox"
                          onChange={(): void => {
 handleFilterToggle(filter.value); 
}}
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