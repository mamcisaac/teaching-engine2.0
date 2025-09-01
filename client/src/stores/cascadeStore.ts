import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { CascadeSelection } from '../components/PlanningCascadeView/types';

export interface FilterState {
  academicYear?: string;
  subject?: string;
  grade?: number;
  searchQuery?: string;
}

export interface CascadeViewState {
  // UI State
  expandedNodes: Set<string>;
  selectedNode: CascadeSelection | null;
  loadingNodes: Set<string>;
  errorNodes: Map<string, string>;
  
  // Filters
  filters: FilterState;
  
  // View Options
  viewMode: 'tree' | 'grid' | 'list';
  showCompleted: boolean;
  showProgress: boolean;
  
  // Search
  searchQuery: string;
  searchResults: string[];
  isSearching: boolean;
  
  // Selection for bulk operations
  selectedNodes: Set<string>;
  isMultiSelectMode: boolean;
  
  // Cache
  nodeDataCache: Map<string, any>;
  lastFetchTime: Map<string, number>;
}

export interface CascadeViewActions {
  // Node operations
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  selectNode: (selection: CascadeSelection | null) => void;
  
  // Multi-select operations
  toggleMultiSelect: () => void;
  toggleNodeSelection: (nodeId: string) => void;
  selectAllNodes: (nodeIds: string[]) => void;
  clearSelection: () => void;
  
  // Loading states
  setNodeLoading: (nodeId: string, isLoading: boolean) => void;
  setNodeError: (nodeId: string, error: string | null) => void;
  
  // Filters
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  setSearching: (isSearching: boolean) => void;
  
  // View options
  setViewMode: (mode: 'tree' | 'grid' | 'list') => void;
  toggleShowCompleted: () => void;
  toggleShowProgress: () => void;
  
  // Cache management
  setCachedData: (nodeId: string, data: any) => void;
  getCachedData: (nodeId: string) => any | null;
  clearCache: () => void;
  
  // Bulk operations
  expandAll: () => void;
  collapseAll: () => void;
  
  // Persistence
  saveState: () => void;
  loadState: () => void;
}

const STORAGE_KEY = 'cascade-view-state';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCascadeStore = create<CascadeViewState & CascadeViewActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      expandedNodes: new Set<string>(),
      selectedNode: null,
      loadingNodes: new Set<string>(),
      errorNodes: new Map<string, string>(),
      filters: {},
      viewMode: 'tree',
      showCompleted: true,
      showProgress: true,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      selectedNodes: new Set<string>(),
      isMultiSelectMode: false,
      nodeDataCache: new Map(),
      lastFetchTime: new Map(),

      // Node operations
      toggleNode: (nodeId) => set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        if (newExpanded.has(nodeId)) {
          newExpanded.delete(nodeId);
        } else {
          newExpanded.add(nodeId);
        }
        return { expandedNodes: newExpanded };
      }),

      expandNode: (nodeId) => set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        newExpanded.add(nodeId);
        return { expandedNodes: newExpanded };
      }),

      collapseNode: (nodeId) => set((state) => {
        const newExpanded = new Set(state.expandedNodes);
        newExpanded.delete(nodeId);
        return { expandedNodes: newExpanded };
      }),

      selectNode: (selection) => set({ selectedNode: selection }),

      // Multi-select operations
      toggleMultiSelect: () => set((state) => ({
        isMultiSelectMode: !state.isMultiSelectMode,
        selectedNodes: state.isMultiSelectMode ? new Set() : state.selectedNodes,
      })),

      toggleNodeSelection: (nodeId) => set((state) => {
        const newSelected = new Set(state.selectedNodes);
        if (newSelected.has(nodeId)) {
          newSelected.delete(nodeId);
        } else {
          newSelected.add(nodeId);
        }
        return { selectedNodes: newSelected };
      }),

      selectAllNodes: (nodeIds) => set({ selectedNodes: new Set(nodeIds) }),
      
      clearSelection: () => set({ selectedNodes: new Set() }),

      // Loading states
      setNodeLoading: (nodeId, isLoading) => set((state) => {
        const newLoading = new Set(state.loadingNodes);
        if (isLoading) {
          newLoading.add(nodeId);
        } else {
          newLoading.delete(nodeId);
        }
        return { loadingNodes: newLoading };
      }),

      setNodeError: (nodeId, error) => set((state) => {
        const newErrors = new Map(state.errorNodes);
        if (error) {
          newErrors.set(nodeId, error);
        } else {
          newErrors.delete(nodeId);
        }
        return { errorNodes: newErrors };
      }),

      // Filters
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),

      clearFilters: () => set({ filters: {} }),

      // Search
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSearching: (isSearching) => set({ isSearching }),

      // View options
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleShowCompleted: () => set((state) => ({ showCompleted: !state.showCompleted })),
      toggleShowProgress: () => set((state) => ({ showProgress: !state.showProgress })),

      // Cache management
      setCachedData: (nodeId, data) => set((state) => {
        const newCache = new Map(state.nodeDataCache);
        const newFetchTime = new Map(state.lastFetchTime);
        newCache.set(nodeId, data);
        newFetchTime.set(nodeId, Date.now());
        return {
          nodeDataCache: newCache,
          lastFetchTime: newFetchTime,
        };
      }),

      getCachedData: (nodeId) => {
        const state = get();
        const lastFetch = state.lastFetchTime.get(nodeId);
        if (!lastFetch || Date.now() - lastFetch > CACHE_DURATION) {
          return null;
        }
        return state.nodeDataCache.get(nodeId) || null;
      },

      clearCache: () => set({
        nodeDataCache: new Map(),
        lastFetchTime: new Map(),
      }),

      // Bulk operations
      expandAll: () => {
        // This would need to know all node IDs
        // Implementation would depend on having access to the tree data
        console.log('Expand all nodes');
      },

      collapseAll: () => set({ expandedNodes: new Set() }),

      // Persistence
      saveState: () => {
        const state = get();
        const stateToSave = {
          expandedNodes: Array.from(state.expandedNodes),
          filters: state.filters,
          viewMode: state.viewMode,
          showCompleted: state.showCompleted,
          showProgress: state.showProgress,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      },

      loadState: () => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            set({
              expandedNodes: new Set(parsed.expandedNodes || []),
              filters: parsed.filters || {},
              viewMode: parsed.viewMode || 'tree',
              showCompleted: parsed.showCompleted ?? true,
              showProgress: parsed.showProgress ?? true,
            });
          } catch (error) {
            console.error('Failed to load saved state:', error);
          }
        }
      },
    })),
    {
      name: 'cascade-view-store',
    }
  )
);

// Selector hooks for optimized re-renders
export const useExpandedNodes = () => useCascadeStore((state) => state.expandedNodes);
export const useSelectedNode = () => useCascadeStore((state) => state.selectedNode);
export const useFilters = () => useCascadeStore((state) => state.filters);
export const useViewMode = () => useCascadeStore((state) => state.viewMode);
export const useSearchQuery = () => useCascadeStore((state) => state.searchQuery);
export const useIsMultiSelectMode = () => useCascadeStore((state) => state.isMultiSelectMode);
export const useSelectedNodes = () => useCascadeStore((state) => state.selectedNodes);