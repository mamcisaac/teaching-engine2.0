# State Management Guidelines

> **Last Updated**: 2025-07-05
> **Version**: 1.0
> **Purpose**: Standardize state management patterns across Teaching Engine 2.0

## Current State Audit

### Identified Patterns

1. **Zustand Stores** (Global State)
   - `lessonPlanStore.ts`, `unitPlanStore.ts`, `daybookStore.ts`, `weeklyPlannerStore.ts`
   - Complex offline-first stores with immer and persist middleware
   - Used for: Entity management, offline capabilities, auto-save

2. **Context API** (Provider Pattern)
   - `AuthContext.tsx`, `NotificationContext.tsx`, `ThemeContext.tsx`
   - `OnboardingContext.tsx`, `HelpContext.tsx`, `KeyboardShortcutsContext.tsx`
   - `LanguageContext.tsx`, `NavigationProvider.tsx`
   - Used for: Cross-cutting concerns, provider patterns

3. **React Query** (Server State)
   - Extensive usage in `api/domains/*/hooks.ts`
   - Used for: Server state management, caching, mutations

4. **Local useState** (Component State)
   - Standard React hooks for local component state
   - Used for: UI state, form state, temporary data

## Standardized Architecture

### 1. Zustand for Global State

**Use Cases:**
- Application-wide state that needs persistence
- Complex entity management (lesson plans, unit plans)
- Offline-first data with sync capabilities
- State that needs to be shared across multiple components

**Implementation Pattern:**
```typescript
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  // State shape
  data: Entity[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadData: () => Promise<void>;
  updateData: (id: string, updates: Partial<Entity>) => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        data: [],
        isLoading: false,
        error: null,
        
        // Actions
        loadData: async () => {
          set(state => { state.isLoading = true; });
          try {
            const data = await api.getData();
            set(state => { 
              state.data = data;
              state.isLoading = false;
            });
          } catch (error) {
            set(state => {
              state.error = error.message;
              state.isLoading = false;
            });
          }
        },
        
        updateData: async (id, updates) => {
          await api.updateData(id, updates);
          set(state => {
            const index = state.data.findIndex(item => item.id === id);
            if (index !== -1) {
              state.data[index] = { ...state.data[index], ...updates };
            }
          });
        },
        
        clearError: () => set(state => { state.error = null; })
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({
          data: state.data,
          // Only persist necessary state
        })
      }
    )
  )
);
```

### 2. React Query for Server State

**Use Cases:**
- Server data fetching and caching
- API mutations with optimistic updates
- Background refetching and synchronization
- Loading and error states for server operations

**Implementation Pattern:**
```typescript
// hooks/useEntityData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export const useEntityData = (id?: string) => {
  return useQuery({
    queryKey: ['entities', id],
    queryFn: () => api.getEntity(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
    onError: (error) => {
      // Handle error
    }
  });
};
```

### 3. Context API for Providers Only

**Use Cases:**
- Authentication state and methods
- Theme configuration
- Notification system
- Global UI state (modals, toasts)

**Restricted Usage:**
- Only for cross-cutting concerns
- Avoid for business logic
- Keep lightweight
- Use sparingly

**Implementation Pattern:**
```typescript
// contexts/AuthContext.tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Implementation using React Query for server state
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Handle successful login
    },
  });

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login: loginMutation.mutateAsync,
      logout: logoutMutation.mutateAsync 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. Local useState for Component State

**Use Cases:**
- Form input values
- UI state (expanded/collapsed, selected items)
- Temporary data
- Component-specific state

**Implementation Pattern:**
```typescript
const MyComponent = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Local state management
  const handleToggleExpanded = () => setIsExpanded(!isExpanded);
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  return (
    // Component JSX
  );
};
```

## Migration Strategy

### Phase 1: Context API Cleanup

**Remove unnecessary contexts:**
- `OnboardingContext.tsx` → Move to Zustand store
- `HelpContext.tsx` → Move to local state or Zustand
- `KeyboardShortcutsContext.tsx` → Move to Zustand store
- `LanguageContext.tsx` → Move to Zustand store

**Keep essential contexts:**
- `AuthContext.tsx` (refactor to use React Query)
- `NotificationContext.tsx` (refactor to use React Query)
- `ThemeContext.tsx` (lightweight UI state)

### Phase 2: Zustand Store Optimization

**Consolidate related stores:**
- Merge `lessonPlanStore`, `unitPlanStore`, `daybookStore` into `planningStore`
- Create `uiStore` for UI state management
- Create `settingsStore` for user preferences

**Standardize store structure:**
- Use immer middleware for immutable updates
- Implement persist middleware for important state
- Add proper TypeScript types
- Include error handling patterns

### Phase 3: React Query Integration

**Enhance server state management:**
- Move server operations out of Zustand stores
- Use React Query for all API calls
- Implement optimistic updates
- Add proper cache invalidation

## Best Practices

### General Principles

1. **Single Responsibility**: Each state management tool should have a clear purpose
2. **Minimal API Surface**: Keep state interfaces simple and focused
3. **TypeScript First**: All state should be properly typed
4. **Error Handling**: Implement consistent error patterns
5. **Performance**: Use selectors and memoization appropriately

### Zustand Best Practices

- Use `immer` middleware for complex state updates
- Implement `persist` middleware for important state
- Use `subscribeWithSelector` for performance optimization
- Keep actions co-located with state
- Use TypeScript interfaces for state shape

### React Query Best Practices

- Use query keys consistently
- Implement proper cache invalidation
- Handle loading and error states
- Use optimistic updates for better UX
- Configure appropriate stale times

### Context API Best Practices

- Only use for cross-cutting concerns
- Keep context values lightweight
- Avoid frequent updates
- Use multiple contexts instead of one large context
- Implement proper TypeScript types

## Testing Strategy

### Zustand Store Testing

```typescript
// store.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from './appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(initialState);
  });

  test('should update state correctly', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.updateData('1', { name: 'Updated' });
    });
    
    expect(result.current.data[0].name).toBe('Updated');
  });
});
```

### React Query Testing

```typescript
// hooks.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEntityData } from './useEntityData';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEntityData', () => {
  test('should fetch data successfully', async () => {
    const { result } = renderHook(() => useEntityData('1'), {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

## Performance Considerations

### Zustand Optimization

- Use selectors to subscribe to specific state slices
- Implement proper memoization for computed values
- Avoid unnecessary re-renders with `subscribeWithSelector`

### React Query Optimization

- Configure appropriate `staleTime` and `cacheTime`
- Use `keepPreviousData` for pagination
- Implement proper query key structure
- Use `select` option for data transformation

### Context API Optimization

- Split large contexts into smaller ones
- Use `useMemo` and `useCallback` for context values
- Implement proper provider composition

## Migration Timeline

### Week 1-2: Context API Cleanup
- Remove unnecessary contexts
- Refactor remaining contexts to use React Query
- Update all consumers

### Week 3-4: Zustand Store Consolidation
- Merge related stores
- Standardize store patterns
- Add proper TypeScript types

### Week 5-6: React Query Integration
- Move server operations to React Query
- Implement optimistic updates
- Add proper error handling

### Week 7: Testing and Documentation
- Add comprehensive tests
- Update documentation
- Performance optimization

## Success Metrics

- **Consistency**: All state management follows established patterns
- **Performance**: No unnecessary re-renders or API calls
- **Maintainability**: Clear separation of concerns
- **Type Safety**: Full TypeScript coverage
- **Test Coverage**: 90%+ coverage for state management logic

## Conclusion

This standardized approach will provide:

1. **Clarity**: Each tool has a specific purpose
2. **Consistency**: Predictable patterns across the codebase
3. **Performance**: Optimized state management
4. **Maintainability**: Easy to understand and modify
5. **Scalability**: Patterns that grow with the application

The migration should be done incrementally, with thorough testing at each phase to ensure no regressions are introduced.