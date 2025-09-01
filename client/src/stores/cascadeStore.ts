import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CascadeData } from '../components/PlanningCascadeView/types';

// Simplified state focused on actual needs
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

export interface CascadeState {
  // Essential UI State
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  selectedNodes: Set<string>; // Multi-select support
  
  // Data loading
  loadingNodes: Set<string>;
  nodeChildren: Map<string, CascadeNode[]>;
  
  // Filters (simple and effective)
  filters: {
    academicYear?: string;
    subject?: string;
    grade?: number;
  };
  
  // Search
  searchQuery: string;
  
  // UI State
  multiSelectMode: boolean;
}

export interface CascadeActions {
  // Node operations
  toggleNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  
  // Data management
  setNodeChildren: (nodeId: string, children: CascadeNode[]) => void;
  setNodeLoading: (nodeId: string, loading: boolean) => void;
  
  // Filters
  setFilters: (filters: Partial<CascadeState['filters']>) => void;
  clearFilters: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  
  // Utility
  reset: () => void;
}

const initialState: CascadeState = {
  expandedNodes: new Set<string>(),
  selectedNodeId: null,
  loadingNodes: new Set<string>(),
  nodeChildren: new Map<string, CascadeNode[]>(),
  filters: {},
  searchQuery: '',
};

export const useCascadeStore = create<CascadeState & CascadeActions>()(
  devtools(
    (set) => ({
      ...initialState,
      
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
      
      selectNode: (nodeId) =>
        set({ selectedNodeId: nodeId }),
      
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
      
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      
      clearFilters: () =>
        set({ filters: {} }),
      
      setSearchQuery: (query) =>
        set({ searchQuery: query }),
      
      reset: () =>
        set(initialState),
    }),
    {
      name: 'cascade-store',
    }
  )
);