# Fix @typescript-eslint/prefer-nullish-coalescing Summary

## Overview
Fixed @typescript-eslint/prefer-nullish-coalescing errors in store files by converting appropriate `||` operators to `??` (nullish coalescing).

## Files Modified

### 1. basePlanningStore.ts
- **Changed:** `config.mergingStrategy || 'local-wins'` → `config.mergingStrategy ?? 'local-wins'`
- **Kept:** Timestamp comparisons with `||` (intentional for empty string fallback)

### 2. lessonPlanStore.ts
- **Changed:** 
  - `startDate || 'all'` → `startDate ?? 'all'` (2 occurrences)
  - `endDate || 'all'` → `endDate ?? 'all'` (2 occurrences)
  - `allPlans || []` → `allPlans ?? []`
  - `cachedPlans || []` → `cachedPlans ?? []`
  - Fixed duplicated error instanceof checks
- **Kept:** Timestamp comparison with `||`

### 3. unitPlanStore.ts
- **Changed:**
  - `cachedPlans || []` → `cachedPlans ?? []`
  - Fixed duplicated error instanceof checks
- **Kept:** Timestamp comparison with `||`

### 4. daybookStore.ts
- **Changed:**
  - `cachedEntries || []` → `cachedEntries ?? []`
  - Fixed duplicated error instanceof check

### 5. helpStore.ts
- **Changed:**
  - `state.tutorialProgress[tutorialId] || 0` → `state.tutorialProgress[tutorialId] ?? 0` (2 occurrences)

### 6. languageStore.ts
- **Changed:**
  - `translations[state.language] || translations.en` → `translations[state.language] ?? translations.en`
  - `translations[state.language][key] || fallback || key` → `translations[state.language][key] ?? fallback ?? key`
  - `localizedValue || obj[field] || ''` → `localizedValue ?? obj[field] ?? ''`

### 7. onboardingStore.ts
- **Changed:**
  - `state.currentFlow?.steps[state.currentStepIndex] || null` → `state.currentFlow?.steps[state.currentStepIndex] ?? null`

## Key Decisions

### When to use `??` instead of `||`:
1. **Empty arrays:** Always use `??` to preserve empty arrays from cache
2. **Translation strings:** Use `??` to preserve empty string translations
3. **Configuration values:** Use `??` when empty string is a valid config
4. **Progress/count values:** Use `??` when 0 is a valid value

### When to keep `||`:
1. **Timestamp comparisons:** Keep `||` for fallback to empty string in comparisons
2. **Boolean logic:** Keep `||` for actual boolean operations
3. **Event checks:** Keep `||` for keyboard event modifier checks

## Testing
Created comprehensive test files for:
- basePlanningStore.test.ts (existing, already had tests)
- lessonPlanStore.test.ts (new)
- unitPlanStore.test.ts (new)

Each test file verifies:
- Behavior with null/undefined values
- Preservation of falsy values (empty string, 0, false)
- Error handling improvements

## Error Handling Improvements
Fixed duplicated error instanceof checks in all stores:
- Before: `error instanceof Error ? (error instanceof Error ? error.message : String(error)) : 'Failed message'`
- After: `error instanceof Error ? error.message : 'Failed message'`

## Results
Successfully addressed prefer-nullish-coalescing errors in store files while preserving correct behavior for cases where `||` is intentionally used for boolean logic or string comparisons.