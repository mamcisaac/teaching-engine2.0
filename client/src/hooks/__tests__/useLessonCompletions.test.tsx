/**
 * TDD Test Suite for useLessonCompletions Hook
 * Issue #292: Implement Lesson Completion Tracking System
 * 
 * CRITICAL: Hook should be used ONLY in parent components (TodayView)
 * NEVER in child components
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLessonCompletions } from '../useLessonCompletions';
import { server } from '../../test/mocks/server';
import { rest } from 'msw';

describe('useLessonCompletions Hook - TDD RED Phase', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Gate 3: Parent-Child Integration', () => {
    describe('Initial Data Fetching', () => {
      it('should fetch completions on mount', async () => {
        const mockCompletions = [
          { id: '1', lessonId: 'lesson-1', userId: 1, completedAt: '2024-01-01T10:00:00Z' },
          { id: '2', lessonId: 'lesson-2', userId: 1, completedAt: '2024-01-01T11:00:00Z' }
        ];

        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: mockCompletions }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        // Initially loading
        expect(result.current.isLoading).toBe(true);
        expect(result.current.completions).toEqual([]);

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.completions).toEqual(mockCompletions);
      });

      it('should handle empty completions', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.completions).toEqual([]);
        expect(result.current.isLessonCompleted('any-lesson')).toBe(false);
      });

      it('should handle fetch errors gracefully', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.status(500), ctx.json({ error: 'Server error' }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.completions).toEqual([]);
      });
    });

    describe('CRITICAL: Single Hook Instance Management', () => {
      it('should be called only once in parent component', () => {
        const hookCallSpy = vi.fn();
        
        // Mock the hook to track calls
        vi.mock('../useLessonCompletions', async (importOriginal) => {
          const original = await importOriginal();
          return {
            ...original,
            useLessonCompletions: (...args: any[]) => {
              hookCallSpy(...args);
              return original.useLessonCompletions(...args);
            }
          };
        });

        // Simulate parent component with multiple children
        const ParentComponent = () => {
          const hookResult = useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' });
          
          // Simulate passing to multiple children
          return (
            <>
              <div data-testid="child-1">{hookResult.isLessonCompleted('lesson-1')}</div>
              <div data-testid="child-2">{hookResult.isLessonCompleted('lesson-2')}</div>
              <div data-testid="child-3">{hookResult.isLessonCompleted('lesson-3')}</div>
            </>
          );
        };

        renderHook(() => ParentComponent(), { wrapper });

        // Hook should only be called once despite multiple children
        expect(hookCallSpy).toHaveBeenCalledTimes(1);
      });

      it('should provide methods that maintain single source of truth', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          }),
          rest.post('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ 
              id: 'new-1', 
              lessonId: 'lesson-1', 
              userId: 1, 
              completedAt: new Date().toISOString() 
            }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Initially no completions
        expect(result.current.isLessonCompleted('lesson-1')).toBe(false);
        expect(result.current.isLessonCompleted('lesson-2')).toBe(false);

        // Mark lesson-1 complete
        await act(async () => {
          await result.current.markComplete({ lessonId: 'lesson-1' });
        });

        // State should update for lesson-1 only
        expect(result.current.isLessonCompleted('lesson-1')).toBe(true);
        expect(result.current.isLessonCompleted('lesson-2')).toBe(false);
      });
    });

    describe('Completion Management', () => {
      describe('markComplete', () => {
        it('should mark a lesson as complete with optimistic update', async () => {
          server.use(
            rest.get('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.json({ completions: [] }));
            }),
            rest.post('/api/lesson-completions', (req, res, ctx) => {
              return res(
                ctx.delay(100), // Simulate network delay
                ctx.json({ 
                  id: 'new-1', 
                  lessonId: 'lesson-1', 
                  userId: 1, 
                  completedAt: new Date().toISOString() 
                })
              );
            })
          );

          const { result } = renderHook(
            () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
            { wrapper }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Start marking complete
          act(() => {
            result.current.markComplete({ lessonId: 'lesson-1' });
          });

          // Optimistic update should happen immediately
          expect(result.current.isLessonCompleted('lesson-1')).toBe(true);
          expect(result.current.isSaving).toBe(true);

          // Wait for server response
          await waitFor(() => {
            expect(result.current.isSaving).toBe(false);
          });

          // Completion should persist
          expect(result.current.isLessonCompleted('lesson-1')).toBe(true);
        });

        it('should revert optimistic update on error', async () => {
          server.use(
            rest.get('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.json({ completions: [] }));
            }),
            rest.post('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.status(500), ctx.json({ error: 'Server error' }));
            })
          );

          const { result } = renderHook(
            () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
            { wrapper }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Attempt to mark complete
          act(() => {
            result.current.markComplete({ lessonId: 'lesson-1' });
          });

          // Optimistic update
          expect(result.current.isLessonCompleted('lesson-1')).toBe(true);

          // Wait for error and revert
          await waitFor(() => {
            expect(result.current.isSaving).toBe(false);
          });

          // Should revert to uncompleted
          expect(result.current.isLessonCompleted('lesson-1')).toBe(false);
          expect(result.current.error).toBeTruthy();
        });

        it('should include optional details when marking complete', async () => {
          let capturedRequest: any = null;

          server.use(
            rest.get('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.json({ completions: [] }));
            }),
            rest.post('/api/lesson-completions', async (req, res, ctx) => {
              capturedRequest = await req.json();
              return res(ctx.json({ 
                id: 'new-1',
                ...capturedRequest,
                userId: 1,
                completedAt: new Date().toISOString()
              }));
            })
          );

          const { result } = renderHook(
            () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
            { wrapper }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          await act(async () => {
            await result.current.markComplete({
              lessonId: 'lesson-1',
              notes: 'Students struggled with /ou/ sound',
              actualDuration: 55,
              wentWell: false,
              needsFollowUp: true
            });
          });

          expect(capturedRequest).toEqual({
            lessonId: 'lesson-1',
            notes: 'Students struggled with /ou/ sound',
            actualDuration: 55,
            wentWell: false,
            needsFollowUp: true
          });
        });
      });

      describe('markIncomplete', () => {
        it('should mark a lesson as incomplete with optimistic update', async () => {
          const existingCompletion = {
            id: '1',
            lessonId: 'lesson-1',
            userId: 1,
            completedAt: '2024-01-01T10:00:00Z'
          };

          server.use(
            rest.get('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.json({ completions: [existingCompletion] }));
            }),
            rest.delete('/api/lesson-completions/lesson-1', (req, res, ctx) => {
              return res(ctx.status(204));
            })
          );

          const { result } = renderHook(
            () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
            { wrapper }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Initially completed
          expect(result.current.isLessonCompleted('lesson-1')).toBe(true);

          // Mark incomplete
          act(() => {
            result.current.markIncomplete('lesson-1');
          });

          // Optimistic update
          expect(result.current.isLessonCompleted('lesson-1')).toBe(false);

          await waitFor(() => {
            expect(result.current.isSaving).toBe(false);
          });

          // Should remain incomplete
          expect(result.current.isLessonCompleted('lesson-1')).toBe(false);
        });

        it('should handle deletion errors', async () => {
          const existingCompletion = {
            id: '1',
            lessonId: 'lesson-1',
            userId: 1,
            completedAt: '2024-01-01T10:00:00Z'
          };

          server.use(
            rest.get('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.json({ completions: [existingCompletion] }));
            }),
            rest.delete('/api/lesson-completions/lesson-1', (req, res, ctx) => {
              return res(ctx.status(500), ctx.json({ error: 'Server error' }));
            })
          );

          const { result } = renderHook(
            () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
            { wrapper }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Initially completed
          expect(result.current.isLessonCompleted('lesson-1')).toBe(true);

          // Attempt to mark incomplete
          act(() => {
            result.current.markIncomplete('lesson-1');
          });

          // Optimistic update
          expect(result.current.isLessonCompleted('lesson-1')).toBe(false);

          await waitFor(() => {
            expect(result.current.isSaving).toBe(false);
          });

          // Should revert to completed
          expect(result.current.isLessonCompleted('lesson-1')).toBe(true);
          expect(result.current.error).toBeTruthy();
        });
      });

      describe('updateCompletion', () => {
        it('should update completion details', async () => {
          const existingCompletion = {
            id: '1',
            lessonId: 'lesson-1',
            userId: 1,
            completedAt: '2024-01-01T10:00:00Z',
            notes: 'Initial notes',
            wentWell: true
          };

          let capturedUpdate: any = null;

          server.use(
            rest.get('/api/lesson-completions', (req, res, ctx) => {
              return res(ctx.json({ completions: [existingCompletion] }));
            }),
            rest.put('/api/lesson-completions/lesson-1', async (req, res, ctx) => {
              capturedUpdate = await req.json();
              return res(ctx.json({
                ...existingCompletion,
                ...capturedUpdate
              }));
            })
          );

          const { result } = renderHook(
            () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
            { wrapper }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          await act(async () => {
            await result.current.updateCompletion('lesson-1', {
              notes: 'Updated: Students needed extra support',
              wentWell: false,
              needsFollowUp: true
            });
          });

          expect(capturedUpdate).toEqual({
            notes: 'Updated: Students needed extra support',
            wentWell: false,
            needsFollowUp: true
          });
        });
      });
    });

    describe('Batch Operations', () => {
      it('should handle batch marking of multiple lessons', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          }),
          rest.post('/api/lesson-completions/batch', (req, res, ctx) => {
            return res(ctx.json({ created: 3 }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3'];

        await act(async () => {
          await result.current.markBatchComplete(lessonIds);
        });

        // All should be marked complete
        lessonIds.forEach(id => {
          expect(result.current.isLessonCompleted(id)).toBe(true);
        });
      });

      it('should batch operations for performance', async () => {
        const batchRequestSpy = vi.fn();

        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          }),
          rest.post('/api/lesson-completions/batch', (req, res, ctx) => {
            batchRequestSpy();
            return res(ctx.json({ created: 2 }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Mark multiple lessons in quick succession
        act(() => {
          result.current.markComplete({ lessonId: 'lesson-1' });
          result.current.markComplete({ lessonId: 'lesson-2' });
        });

        // Should batch into single request
        await waitFor(() => {
          expect(batchRequestSpy).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('Statistics and Progress', () => {
      it('should calculate completion statistics', async () => {
        const completions = [
          { id: '1', lessonId: 'lesson-1', userId: 1, completedAt: '2024-01-01T10:00:00Z' },
          { id: '2', lessonId: 'lesson-2', userId: 1, completedAt: '2024-01-01T11:00:00Z' }
        ];

        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ 
            startDate: '2024-01-01', 
            endDate: '2024-01-02',
            totalLessons: 4
          }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.statistics).toEqual({
          completed: 2,
          total: 4,
          percentage: 50,
          remaining: 2
        });
      });

      it('should provide getProgress method', async () => {
        const completions = [
          { id: '1', lessonId: 'lesson-1', userId: 1, completedAt: '2024-01-01T10:00:00Z' },
          { id: '2', lessonId: 'lesson-2', userId: 1, completedAt: '2024-01-01T11:00:00Z' },
          { id: '3', lessonId: 'lesson-3', userId: 1, completedAt: '2024-01-01T12:00:00Z' }
        ];

        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'];
        const progress = result.current.getProgress(lessonIds);

        expect(progress).toEqual({
          completed: 3,
          total: 4,
          percentage: 75,
          completedIds: ['lesson-1', 'lesson-2', 'lesson-3'],
          remainingIds: ['lesson-4']
        });
      });
    });

    describe('Performance Requirements', () => {
      it('should respond to state changes within 100ms', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          }),
          rest.post('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ 
              id: 'new-1', 
              lessonId: 'lesson-1', 
              userId: 1, 
              completedAt: new Date().toISOString() 
            }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const startTime = performance.now();

        act(() => {
          result.current.markComplete({ lessonId: 'lesson-1' });
        });

        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Optimistic update should be immediate
        expect(responseTime).toBeLessThan(100);
        expect(result.current.isLessonCompleted('lesson-1')).toBe(true);
      });

      it('should cache completion data to avoid redundant fetches', async () => {
        const fetchSpy = vi.fn();

        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            fetchSpy();
            return res(ctx.json({ completions: [] }));
          })
        );

        const { result, rerender } = renderHook(
          () => useLessonCompletions({ startDate: '2024-01-01', endDate: '2024-01-02' }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Initial fetch
        expect(fetchSpy).toHaveBeenCalledTimes(1);

        // Re-render with same params
        rerender();

        // Should use cached data, no new fetch
        expect(fetchSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge Cases', () => {
      it('should handle 0 lessons correctly', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ 
            startDate: '2024-01-01', 
            endDate: '2024-01-02',
            totalLessons: 0
          }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.statistics).toEqual({
          completed: 0,
          total: 0,
          percentage: 0,
          remaining: 0
        });
      });

      it('should handle Friday (no lessons) correctly', async () => {
        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            return res(ctx.json({ completions: [] }));
          })
        );

        const { result } = renderHook(
          () => useLessonCompletions({ 
            startDate: '2024-01-05', // Friday
            endDate: '2024-01-06',
            totalLessons: 0
          }),
          { wrapper }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.completions).toEqual([]);
        expect(result.current.statistics.total).toBe(0);
        expect(result.current.error).toBeNull();
      });

      it('should handle date transitions correctly', async () => {
        const todayCompletions = [
          { id: '1', lessonId: 'lesson-1', userId: 1, completedAt: new Date().toISOString() }
        ];

        server.use(
          rest.get('/api/lesson-completions', (req, res, ctx) => {
            const url = new URL(req.url);
            const startDate = url.searchParams.get('startDate');
            
            if (startDate === new Date().toISOString().split('T')[0]) {
              return res(ctx.json({ completions: todayCompletions }));
            }
            
            return res(ctx.json({ completions: [] }));
          })
        );

        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const { result, rerender } = renderHook(
          ({ date }) => useLessonCompletions({ startDate: date, endDate: date }),
          { 
            wrapper,
            initialProps: { date: today }
          }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.completions).toHaveLength(1);

        // Change to tomorrow
        rerender({ date: tomorrow });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.completions).toHaveLength(0);
      });
    });
  });
});