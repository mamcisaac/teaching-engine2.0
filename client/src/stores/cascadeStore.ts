import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CascadeData } from '../components/PlanningCascadeView/types';

// Node structure for the cascade tree
export interface CascadeNode {
  id: string;
  label: string;
  type: 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';
  hasChildren: boolean;
  childrenCount?: number;
  data?: CascadeData;
  progress?: {
    completed: number;
    total: number;
  };
}

// Selection information
export interface CascadeSelection {
  id: string;
  type: CascadeNode['type'];
  data: CascadeData;
  path?: string[];
}

export interface CascadeState {
  // Node management
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  selectedNode: CascadeSelection | null;
  nodeChildren: Map<string, CascadeNode[]>;
  loadingNodes: Set<string>;
  errorNodes: Map<string, string>;
  
  // Pagination state for progressive loading
  nodeLoadedCount: Map<string, number>;
  nodeTotalCount: Map<string, number>;
  nodeHasMore: Map<string, boolean>;
  
  // Multi-select
  selectedNodes: Set<string>;
  multiSelectMode: boolean;
  
  // Filters
  filters: {
    academicYear?: string;
    subject?: string;
    grade?: number;
    showCompleted?: boolean;
  };
  
  // Search
  searchQuery: string;
  searchResults: string[];
  isSearching: boolean;
  
  // View options
  viewMode: 'tree' | 'grid' | 'list';
  showProgress: boolean;
  
  // Cache (for performance)
  nodeDataCache: Map<string, any>;
  lastFetchTime: Map<string, number>;
  
  // Undo/Redo
  history: Array<Partial<CascadeState>>;
  historyIndex: number;
  maxHistorySize: number;
}

export interface CascadeActions {
  // Node operations
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  selectNode: (nodeId: string | null, selection?: CascadeSelection | null) => void;
  
  // Multi-select operations
  toggleMultiSelect: (nodeId: string) => void;
  setMultiSelectMode: (enabled: boolean) => void;
  clearMultiSelect: () => void;
  selectAll: (nodeIds: string[]) => void;
  
  // Data management
  setNodeChildren: (nodeId: string, children: CascadeNode[]) => void;
  setNodeLoading: (nodeId: string, loading: boolean) => void;
  setNodeError: (nodeId: string, error: string | null) => void;
  
  // Filters
  setFilters: (filters: Partial<CascadeState['filters']>) => void;
  clearFilters: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  setIsSearching: (searching: boolean) => void;
  
  // View options
  setViewMode: (mode: 'tree' | 'grid' | 'list') => void;
  setShowProgress: (show: boolean) => void;
  
  // Cache operations
  setCachedData: (nodeId: string, data: any) => void;
  getCachedData: (nodeId: string) => any;
  isCacheValid: (nodeId: string, ttl?: number) => boolean;
  clearCache: () => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
  
  // Utility
  reset: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

const initialState: CascadeState = {
  expandedNodes: new Set<string>(),
  selectedNodeId: null,
  selectedNode: null,
  loadingNodes: new Set<string>(),
  nodeChildren: new Map<string, CascadeNode[]>(),
  errorNodes: new Map<string, string>(),
  nodeLoadedCount: new Map<string, number>(),
  nodeTotalCount: new Map<string, number>(),
  nodeHasMore: new Map<string, boolean>(),
  selectedNodes: new Set<string>(),
  multiSelectMode: false,
  filters: {
    showCompleted: true
  },
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  viewMode: 'tree',
  showProgress: true,
  nodeDataCache: new Map<string, any>(),
  lastFetchTime: new Map<string, number>(),
  history: [],
  historyIndex: -1,
  maxHistorySize: 50
};

export const useCascadeStore = create<CascadeState & CascadeActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Node operations
        toggleNode: (nodeId) =>
          set((state) => {
            const expanded = new Set(state.expandedNodes);
            if (expanded.has(nodeId)) {
              expanded.delete(nodeId);
            } else {
              expanded.add(nodeId);
            }
            return { expandedNodes: expanded };
          }),
        
        expandNode: (nodeId) =>
          set((state) => {
            const expanded = new Set(state.expandedNodes);
            expanded.add(nodeId);
            return { expandedNodes: expanded };
          }),
        
        collapseNode: (nodeId) =>
          set((state) => {
            const expanded = new Set(state.expandedNodes);
            expanded.delete(nodeId);
            return { expandedNodes: expanded };
          }),
        
        expandAll: () =>
          set((state) => {
            const expanded = new Set<string>();
            state.nodeChildren.forEach((children, nodeId) => {
              if (children.length > 0) {
                expanded.add(nodeId);
              }
            });
            return { expandedNodes: expanded };
          }),
        
        collapseAll: () =>
          set({ expandedNodes: new Set<string>() }),
        
        selectNode: (nodeId, selection) =>
          set({ 
            selectedNodeId: nodeId,
            selectedNode: selection || null
          }),
        
        // Multi-select operations
        toggleMultiSelect: (nodeId) =>
          set((state) => {
            const selected = new Set(state.selectedNodes);
            if (selected.has(nodeId)) {
              selected.delete(nodeId);
            } else {
              selected.add(nodeId);
            }
            return { selectedNodes: selected };
          }),
        
        setMultiSelectMode: (enabled) =>
          set({ 
            multiSelectMode: enabled,
            selectedNodes: enabled ? get().selectedNodes : new Set()
          }),
        
        clearMultiSelect: () =>
          set({ selectedNodes: new Set() }),
        
        selectAll: (nodeIds) =>
          set({ selectedNodes: new Set(nodeIds) }),
        
        // Data management
        setNodeChildren: (nodeId, children) =>
          set((state) => {
            const nodeChildren = new Map(state.nodeChildren);
            nodeChildren.set(nodeId, children);
            return { nodeChildren };
          }),
        
        setNodeLoading: (nodeId, loading) =>
          set((state) => {
            const loadingNodes = new Set(state.loadingNodes);
            if (loading) {
              loadingNodes.add(nodeId);
            } else {
              loadingNodes.delete(nodeId);
            }
            return { loadingNodes };
          }),
        
        setNodeError: (nodeId, error) =>
          set((state) => {
            const errorNodes = new Map(state.errorNodes);
            if (error) {
              errorNodes.set(nodeId, error);
            } else {
              errorNodes.delete(nodeId);
            }
            return { errorNodes };
          }),
        
        // Filters
        setFilters: (filters) =>
          set((state) => ({ filters: { ...state.filters, ...filters } })),
        
        clearFilters: () =>
          set({ filters: { showCompleted: true } }),
        
        // Search
        setSearchQuery: (query) =>
          set({ searchQuery: query }),
        
        setSearchResults: (results) =>
          set({ searchResults: results }),
        
        setIsSearching: (searching) =>
          set({ isSearching: searching }),
        
        // View options
        setViewMode: (mode) =>
          set({ viewMode: mode }),
        
        setShowProgress: (show) =>
          set({ showProgress: show }),
        
        // Cache operations
        setCachedData: (nodeId, data) =>
          set((state) => {
            const cache = new Map(state.nodeDataCache);
            const fetchTimes = new Map(state.lastFetchTime);
            cache.set(nodeId, data);
            fetchTimes.set(nodeId, Date.now());
            return { 
              nodeDataCache: cache,
              lastFetchTime: fetchTimes
            };
          }),
        
        getCachedData: (nodeId) => {
          const state = get();
          return state.nodeDataCache.get(nodeId);
        },
        
        isCacheValid: (nodeId, ttl = CACHE_TTL) => {
          const state = get();
          const lastFetch = state.lastFetchTime.get(nodeId);
          if (!lastFetch) return false;
          return Date.now() - lastFetch < ttl;
        },
        
        clearCache: () =>
          set({ 
            nodeDataCache: new Map(),
            lastFetchTime: new Map()
          }),
        
        // Undo/Redo
        saveToHistory: () =>
          set((state) => {
            const snapshot = {
              expandedNodes: new Set(state.expandedNodes),
              selectedNodeId: state.selectedNodeId,
              selectedNode: state.selectedNode,
              selectedNodes: new Set(state.selectedNodes),
              multiSelectMode: state.multiSelectMode,
              filters: { ...state.filters },
              viewMode: state.viewMode,
              showProgress: state.showProgress
            };
            
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(snapshot);
            
            if (newHistory.length > state.maxHistorySize) {
              newHistory.shift();
            }
            
            return {
              history: newHistory,
              historyIndex: newHistory.length - 1
            };
          }),
        
        undo: () =>
          set((state) => {
            if (state.historyIndex > 0) {
              const newIndex = state.historyIndex - 1;
              const snapshot = state.history[newIndex];
              return {
                ...snapshot,
                historyIndex: newIndex
              };
            }
            return state;
          }),
        
        redo: () =>
          set((state) => {
            if (state.historyIndex < state.history.length - 1) {
              const newIndex = state.historyIndex + 1;
              const snapshot = state.history[newIndex];
              return {
                ...snapshot,
                historyIndex: newIndex
              };
            }
            return state;
          }),
        
        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,
        
        // Utility
        reset: () =>
          set(initialState),
      }),
      {
        name: 'cascade-store',
        partialize: (state) => ({
          expandedNodes: Array.from(state.expandedNodes),
          selectedNodeId: state.selectedNodeId,
          filters: state.filters,
          viewMode: state.viewMode,
          showProgress: state.showProgress
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert arrays back to Sets
            state.expandedNodes = new Set(state.expandedNodes as any);
          }
        }
      }
    ),
    {
      name: 'cascade-store',
    }
  )
);