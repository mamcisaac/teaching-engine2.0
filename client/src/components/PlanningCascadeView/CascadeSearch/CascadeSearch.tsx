import React, { useState, useCallback, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useCascadeStore } from '../../../stores/cascadeStore';
import { useDebounce } from '../../../hooks/useDebounce';
import type { TreeNodeData } from '../VirtualizedTree/types';

interface CascadeSearchProps {
  data: TreeNodeData[];
  onResultSelect: (node: TreeNodeData) => void;
  className?: string;
}

export const CascadeSearch = React.memo(({
  data,
  onResultSelect,
  className,
}: CascadeSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [results, setResults] = useState<TreeNodeData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const searchQuery = useCascadeStore((state) => state.searchQuery);
  const setSearchQuery = useCascadeStore((state) => state.setSearchQuery);
  const isSearching = useCascadeStore((state) => state.isSearching);
  const setSearching = useCascadeStore((state) => state.setSearching);
  
  const debouncedQuery = useDebounce(localQuery, 300);
  
  // Flatten tree for searching
  const flattenTree = useCallback((nodes: TreeNodeData[]): TreeNodeData[] => {
    const flat: TreeNodeData[] = [];
    
    const traverse = (node: TreeNodeData) => {
      flat.push(node);
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    nodes.forEach(traverse);
    return flat;
  }, []);
  
  // Initialize Fuse.js
  const fuse = React.useMemo(() => {
    const flatData = flattenTree(data);
    
    return new Fuse(flatData, {
      keys: [
        { name: 'label', weight: 0.7 },
        { name: 'data.title', weight: 0.5 },
        { name: 'data.titleFr', weight: 0.5 },
        { name: 'data.description', weight: 0.3 },
        { name: 'data.descriptionFr', weight: 0.3 },
        { name: 'data.code', weight: 0.6 },
        { name: 'data.goals', weight: 0.3 },
        { name: 'data.learningGoals', weight: 0.3 },
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [data, flattenTree]);
  
  // Perform search
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setSearching(true);
      
      // Simulate async search (could be moved to web worker for large datasets)
      setTimeout(() => {
        const searchResults = fuse.search(debouncedQuery);
        const items = searchResults.map(result => result.item);
        setResults(items);
        setSearchQuery(debouncedQuery);
        setSearching(false);
        setSelectedIndex(0);
      }, 100);
    } else {
      setResults([]);
      setSearchQuery('');
      setSearching(false);
    }
  }, [debouncedQuery, fuse, setSearchQuery, setSearching]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
        
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
        
      case 'Tab':
        if (e.shiftKey) {
          // Tab backwards
          if (selectedIndex === 0) {
            e.preventDefault();
            setSelectedIndex(results.length - 1);
          }
        } else {
          // Tab forwards
          if (selectedIndex === results.length - 1) {
            e.preventDefault();
            setSelectedIndex(0);
          }
        }
        break;
    }
  }, [results, selectedIndex]);
  
  const handleResultSelect = useCallback((node: TreeNodeData) => {
    onResultSelect(node);
    handleClose();
  }, [onResultSelect]);
  
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setLocalQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);
  
  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  // Scroll selected result into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, results.length]);
  
  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);
  
  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'curriculum': return 'Expectation';
      case 'lrp': return 'Long Range Plan';
      case 'unit': return 'Unit Plan';
      case 'lesson': return 'Lesson Plan';
      case 'daybook': return 'Daybook Entry';
      default: return type;
    }
  };
  
  return (
    <>
      {/* Search trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn('gap-2', className)}
        aria-label="Search (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
        <kbd className="ml-auto text-xs bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </Button>
      
      {/* Search modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            aria-hidden="true"
          />
          
          {/* Search container */}
          <div 
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Search planning items"
          >
            {/* Search input */}
            <div className="flex items-center border-b p-4">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <Input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search curriculum, plans, lessons..."
                className="flex-1 border-0 focus:ring-0 p-0"
                aria-label="Search query"
                aria-controls="search-results"
                aria-expanded={results.length > 0}
              />
              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search results */}
            {results.length > 0 && (
              <div
                ref={resultsRef}
                id="search-results"
                className="max-h-96 overflow-y-auto"
                role="listbox"
                aria-label="Search results"
              >
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0",
                      index === selectedIndex && "bg-blue-50"
                    )}
                    onClick={() => handleResultSelect(result)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    tabIndex={-1}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{result.label}</div>
                        {result.data?.description && (
                          <div className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                            {result.data.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getNodeTypeLabel(result.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No results */}
            {!isSearching && localQuery.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No results found for "{localQuery}"</p>
                <p className="text-sm mt-2">Try different keywords or check your filters</p>
              </div>
            )}
            
            {/* Search hints */}
            {localQuery.length === 0 && (
              <div className="p-4 text-sm text-gray-500">
                <p className="mb-2">Quick tips:</p>
                <ul className="space-y-1">
                  <li>• Search by title, description, or code</li>
                  <li>• Use arrow keys to navigate results</li>
                  <li>• Press Enter to select</li>
                  <li>• Press Escape to close</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

CascadeSearch.displayName = 'CascadeSearch';