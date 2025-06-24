## H10: Add Frontend AI Error Handling and Loading Indicators

**Goal:** Improve UX when AI generation fails or takes time, with proper error messages and retry options.

**Success Criteria:**

- All AI generation buttons show loading state
- Progress indicators for multi-step AI operations
- Clear error messages when AI fails
- Retry buttons for failed operations
- Fallback to manual entry when AI unavailable
- Loading skeletons for AI-generated content

**Tasks:**

1. Create `AILoadingIndicator.tsx` component:
   - Animated progress bar
   - Step descriptions
   - Cancel button
2. Create `AIErrorBoundary.tsx`:
   - Catch AI-specific errors
   - Show user-friendly messages
   - Retry and manual fallback options
3. Update all AI generation hooks:
   - Add loading states
   - Add error handling
   - Add retry logic
4. Add loading states to:
   - Prompt generator panel
   - Unit plan AI generation
   - Lesson plan AI generation
   - Parent summary generation
5. Create `useAIStatus` hook to check API key availability
