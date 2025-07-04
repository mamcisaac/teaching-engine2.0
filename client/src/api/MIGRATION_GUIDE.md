# API Module Migration Guide

## Overview

We're refactoring the monolithic `api.ts` file (2,202 lines) into a modular, domain-driven structure. This improves maintainability, code organization, and developer experience.

## Migration Status

### ✅ Completed Domains
- **Newsletter** - All newsletter-related APIs and hooks
- **Student** - Student management, goals, reflections, parent summaries
- **Planning** - Year plans, daily plans, lesson plans, materials
- **Auth** - Authentication and authorization
- **Calendar** - Calendar events and scheduling
- **Curriculum** - Subjects, expectations, thematic units
- **Notification** - User notifications
- **Parent** - Parent messages and communications
- **Teacher** - Teacher preferences and reflections
- **Routine** - Oral routines and templates (NEW)
- **Resource** - Media resources and file management (NEW)
- **Substitute** - Substitute teacher plans and templates (NEW)
- **Cognate** - French-English language learning pairs (NEW)
- **Notes** - Note management and journaling

### 🚧 Pending Domains
- None - All major domains have been migrated!

## Migration Steps

### 1. Update Imports

**Old:**
```typescript
import { useNewsletter, useCreateNewsletter } from '@/api';
```

**New:**
```typescript
import { useNewsletter, useCreateNewsletter } from '@/api/domains/newsletter';
// OR use the barrel export
import { useNewsletter, useCreateNewsletter } from '@/api';
```

### 2. Update Direct API Calls

**Old:**
```typescript
import { api } from '@/api';
const response = await api.get('/api/newsletters/1');
```

**New:**
```typescript
import { newsletterApi } from '@/api/domains/newsletter';
const response = await newsletterApi.getNewsletter(1);
// OR use the core client
import { apiClient } from '@/api/core';
const response = await apiClient.get('/api/newsletters/1');
```

### 3. Use Consistent Query Keys

**Old:**
```typescript
queryClient.invalidateQueries(['newsletters']);
```

**New:**
```typescript
import { queryKeys } from '@/api/core';
queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.all });
```

## Benefits

1. **Better Organization** - Each domain has its own folder with api, hooks, and types
2. **Improved Type Safety** - Domain-specific types are co-located with their APIs
3. **Easier Testing** - Smaller, focused modules are easier to test
4. **Better Performance** - Only import what you need
5. **Clearer Dependencies** - Easy to see what each component depends on

## File Structure

```
src/api/
├── core/                    # Core utilities and client
│   ├── client.ts           # Axios instance with interceptors
│   ├── utils.ts            # Shared utilities and query keys
│   └── index.ts           
├── domains/                 # Domain-specific modules
│   ├── newsletter/
│   │   ├── api.ts          # API endpoints
│   │   ├── hooks.ts        # React Query hooks
│   │   ├── types.ts        # Domain-specific types
│   │   └── index.ts        
│   ├── student/
│   ├── planning/
│   └── ...
├── legacy/                  # Old API (to be removed)
│   └── api.ts              
└── index.ts                # Main barrel export
```

## Best Practices

1. **Use Domain Imports** - Import from specific domains when possible
2. **Use Query Keys** - Always use the centralized query keys for consistency
3. **Handle Errors** - Use the shared error handling utilities
4. **Show Feedback** - Use the shared toast utilities for user feedback
5. **Type Safety** - Leverage domain-specific types for better type safety

## Examples

### Creating a New Domain Module

1. Create the folder structure:
```bash
mkdir -p src/api/domains/your-domain
```

2. Create the API file (`api.ts`):
```typescript
import { apiClient } from '../../core';
import type { YourType } from '../../../types';

export const yourDomainApi = {
  getItem: async (id: number) => {
    const { data } = await apiClient.get<YourType>(`/api/your-domain/${id}`);
    return data;
  },
};
```

3. Create the hooks file (`hooks.ts`):
```typescript
import { useQuery } from '@tanstack/react-query';
import { yourDomainApi } from './api';
import { queryKeys } from '../../core';

export const useYourItem = (id: number) =>
  useQuery({
    queryKey: ['your-domain', id],
    queryFn: () => yourDomainApi.getItem(id),
    enabled: !!id,
  });
```

4. Create the index file (`index.ts`):
```typescript
export * from './api';
export * from './hooks';
```

5. Add to main index:
```typescript
export * from './domains/your-domain';
```