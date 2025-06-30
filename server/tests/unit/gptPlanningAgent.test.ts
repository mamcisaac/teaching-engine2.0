import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Import the uuid mock to get a reference to the mock function
import { v4 as uuidv4 } from 'uuid';

// Mocks are already set up in setup-all-mocks.ts, just need to cast them
const mockUuidV4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

// Import the service after mocks are set up
import { GPTPlanningAgentService } from '../../src/services/gptPlanningAgent';

describe('GPTPlanningAgentService', () => {
  let service: GPTPlanningAgentService;
  let mockCreateCompletion: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset the UUID mock to return predictable values
    mockUuidV4.mockImplementation(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9));
    
    service = new GPTPlanningAgentService();
    
    const llmModule = await import('../../src/services/llmService');
    mockCreateCompletion = llmModule.openai?.chat?.completions?.create as jest.Mock;
    if (!mockCreateCompletion) {
      // Create a mock if openai is null
      mockCreateCompletion = jest.fn();
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startSession', () => {
    it('should create a new session with unique ID', async () => {
      const mockSessionId = 'test-session-123';
      mockUuidV4.mockReturnValue(mockSessionId);

      const sessionId = await service.startSession(1);

      expect(sessionId).toBe(mockSessionId);
      expect(mockUuidV4).toHaveBeenCalled();
    });

    it('should initialize session context correctly', async () => {
      const mockSessionId = 'test-session-456';
      const userId = 42;
      mockUuidV4.mockReturnValue(mockSessionId);

      const sessionId = await service.startSession(userId);

      // Verify session was created by trying to get conversation history
      const history = await service.getConversationHistory(sessionId, userId);
      expect(history).toEqual([]);
    });
  });

  describe('processMessage', () => {
    const sessionId = 'test-session';
    const userId = 1;

    beforeEach(async () => {
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);
    });

    it('should process a simple message successfully', async () => {
      const userMessage = 'I need help planning a math lesson';
      
      // Mock intent analysis
      mockCreateCompletion
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'Primary intent: Generate lesson activities\nKey entities: math\nRequired actions: suggest activities\nFollow-up: What grade level?'
            }
          }]
        })
        // Mock response generation
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: "I'd be happy to help you plan a math lesson! What grade level are you teaching?",
                actions: [],
                suggestions: [
                  'Specify the grade level',
                  'Mention specific math topics',
                  'Indicate lesson duration'
                ]
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, userMessage);

      expect(result).toMatchObject({
        message: expect.stringContaining('help you plan a math lesson'),
        suggestions: expect.arrayContaining(['Specify the grade level']),
        error: undefined
      });
    });

    it('should handle messages with actions', async () => {
      const userMessage = 'Generate activities for grade 3 fractions';
      
      mockCreateCompletion
        .mockResolvedValueOnce({
          choices: [{
            message: { content: 'Intent: generate activities for fractions' }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: "I'll help you create fraction activities for Grade 3.",
                actions: [{
                  type: 'generate_activity',
                  parameters: { grade: 3, topic: 'fractions' }
                }],
                suggestions: ['View generated activities', 'Modify parameters']
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, userMessage);

      expect(result).toMatchObject({
        message: expect.stringContaining('fraction activities'),
        actions: expect.arrayContaining([{
          type: 'generate_activity',
          payload: { grade: 3, topic: 'fractions' }
        }]),
        actionResults: expect.arrayContaining([{
          type: 'activities_generated',
          data: expect.objectContaining({
            redirect: '/planner/lessons'
          })
        }])
      });
    });

    it('should handle invalid session', async () => {
      await expect(service.processMessage('invalid-session', 'test')).rejects.toThrow('Invalid session');
    });

    it('should handle API errors gracefully', async () => {
      mockCreateCompletion.mockRejectedValueOnce(new Error('API Error'));

      const result = await service.processMessage(sessionId, 'test message');

      expect(result).toMatchObject({
        message: 'I apologize, but I encountered an error. Could you please rephrase your request?',
        error: true
      });
    });

    it('should maintain conversation context', async () => {
      // First message
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis 1' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'First response',
                actions: []
              })
            }
          }]
        });

      await service.processMessage(sessionId, 'First message');

      // Second message - should include context
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis 2' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Second response with context',
                actions: []
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, 'Second message');

      // Verify context was passed to intent analysis
      const intentCall = mockCreateCompletion.mock.calls[2][0];
      expect(intentCall.messages[1].content).toContain('Recent conversation:');
    });

    it('should limit conversation history to 10 messages', async () => {
      // Add 12 messages to test the limit
      for (let i = 0; i < 12; i++) {
        mockCreateCompletion
          .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
          .mockResolvedValueOnce({
            choices: [{
              message: {
                content: JSON.stringify({
                  message: `Response ${i}`,
                  actions: []
                })
              }
            }]
          });

        await service.processMessage(sessionId, `Message ${i}`);
      }

      const history = await service.getConversationHistory(sessionId, userId);
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getConversationHistory', () => {
    it('should return empty array for non-existent session', async () => {
      const history = await service.getConversationHistory('non-existent', 1);
      expect(history).toEqual([]);
    });

    it('should return empty array for wrong user', async () => {
      const sessionId = 'test-session';
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(1);

      const history = await service.getConversationHistory(sessionId, 2);
      expect(history).toEqual([]);
    });

    it('should return conversation history with timestamps', async () => {
      const sessionId = 'test-session';
      const userId = 1;
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);

      // Add a message
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Test response',
                actions: []
              })
            }
          }]
        });

      await service.processMessage(sessionId, 'Test message');

      const history = await service.getConversationHistory(sessionId, userId);

      expect(history).toHaveLength(2);
      expect(history[0]).toMatchObject({
        role: 'user',
        content: 'Test message',
        timestamp: expect.any(Date),
        metadata: null
      });
      expect(history[1]).toMatchObject({
        role: 'assistant',
        content: 'Test response',
        timestamp: expect.any(Date),
        metadata: null
      });
    });
  });

  describe('getQuickActions', () => {
    it('should suggest lesson planning for unit plans with few lessons', async () => {
      const prismaModule = await import('../../src/prisma');
      const mockPrisma = prismaModule.prisma as any;
      
      mockPrisma.unitPlan.findMany.mockResolvedValueOnce([
        {
          id: 'unit-1',
          title: 'Fractions Unit',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lessonPlans: [{ id: 'lesson-1' }]
        },
        {
          id: 'unit-2',
          title: 'Geometry Unit',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          lessonPlans: []
        }
      ]);

      const suggestions = await service.getQuickActions(1);

      expect(suggestions).toEqual(expect.arrayContaining([
        {
          label: 'Create lesson plans for "Fractions Unit"',
          action: 'generate_activity',
          parameters: { unitPlanId: 'unit-1' }
        },
        {
          label: 'Create lesson plans for "Geometry Unit"',
          action: 'generate_activity',
          parameters: { unitPlanId: 'unit-2' }
        }
      ]));
    });

    it('should suggest weekly planning on Thursday or later', async () => {
      const prismaModule = await import('../../src/prisma');
      const mockPrisma = prismaModule.prisma as any;
      mockPrisma.unitPlan.findMany.mockResolvedValueOnce([]);

      // Mock Date to be Thursday
      const mockDate = new Date('2024-01-11'); // Thursday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const suggestions = await service.getQuickActions(1);

      expect(suggestions).toEqual(expect.arrayContaining([
        {
          label: "Generate next week's plan",
          action: 'generate_plan',
          parameters: expect.objectContaining({ weekStart: expect.any(String) })
        }
      ]));

      jest.restoreAllMocks();
    });

    it('should always include coverage analysis', async () => {
      const prismaModule = await import('../../src/prisma');
      const mockPrisma = prismaModule.prisma as any;
      mockPrisma.unitPlan.findMany.mockResolvedValueOnce([]);

      const suggestions = await service.getQuickActions(1);

      expect(suggestions).toEqual(expect.arrayContaining([
        {
          label: 'Analyze curriculum coverage',
          action: 'analyze_coverage',
          parameters: {}
        }
      ]));
    });

    it('should limit suggestions to 4', async () => {
      const prismaModule = await import('../../src/prisma');
      const mockPrisma = prismaModule.prisma as any;
      
      // Create many unit plans
      const manyUnitPlans = Array(10).fill(null).map((_, i) => ({
        id: `unit-${i}`,
        title: `Unit ${i}`,
        startDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        lessonPlans: []
      }));

      mockPrisma.unitPlan.findMany.mockResolvedValueOnce(manyUnitPlans);

      const suggestions = await service.getQuickActions(1);

      expect(suggestions).toHaveLength(4);
    });
  });

  describe('cleanupSessions', () => {
    it('should remove sessions older than 24 hours', async () => {
      // Create old and new sessions
      const oldSessionId = 'old-session';
      const newSessionId = 'new-session';
      const userId = 1;

      // Create old session
      mockUuidV4.mockReturnValue(oldSessionId);
      await service.startSession(userId);

      // Manually set the start time to 25 hours ago
      const sessions = service['conversationContexts'];
      const oldSession = sessions.get(oldSessionId);
      if (oldSession && oldSession.metadata) {
        oldSession.metadata.startTime = new Date(Date.now() - 25 * 60 * 60 * 1000);
      }

      // Create new session
      mockUuidV4.mockReturnValue(newSessionId);
      await service.startSession(userId);

      expect(sessions.size).toBe(2);

      // Clean up
      await service.cleanupSessions();

      expect(sessions.size).toBe(1);
      expect(sessions.has(newSessionId)).toBe(true);
      expect(sessions.has(oldSessionId)).toBe(false);
    });
  });

  describe('Action execution', () => {
    const sessionId = 'test-session';
    const userId = 1;

    beforeEach(async () => {
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);
    });

    it('should execute generate_activity action', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Generating activity',
                actions: [{
                  type: 'generate_activity',
                  parameters: { subject: 'Math' }
                }]
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, 'Generate math activity');

      expect(result.actionResults).toEqual([{
        type: 'activities_generated',
        data: {
          message: 'Activity generation has been moved to the ETFO lesson planning workflow with Activity Discovery feature',
          redirect: '/planner/lessons'
        }
      }]);
    });

    it('should execute generate_plan action', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Generating plan',
                actions: [{
                  type: 'generate_plan',
                  parameters: {}
                }]
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, 'Generate weekly plan');

      expect(result.actionResults).toEqual([{
        type: 'plan_generated',
        data: {
          message: 'Plan generation is now handled through the ETFO 5-level planning workflow',
          redirect: '/planner/dashboard'
        }
      }]);
    });

    it('should execute analyze_coverage action', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Analyzing coverage',
                actions: [{
                  type: 'analyze_coverage',
                  parameters: {}
                }]
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, 'Analyze my curriculum coverage');

      expect(result.actionResults).toEqual([{
        type: 'coverage_analysis',
        data: {
          message: 'Coverage analysis is now available through curriculum expectations tracking',
          redirect: '/curriculum'
        }
      }]);
    });

    it('should handle unknown action types', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Unknown action',
                actions: [{
                  type: 'unknown_action',
                  parameters: {}
                }]
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, 'Do something unknown');

      expect(result.actionResults).toEqual([]);
    });

    it('should handle action execution errors', async () => {
      // Mock an action that throws an error
      const originalExecuteActions = service['executeActions'];
      service['executeActions'] = jest.fn().mockRejectedValueOnce(new Error('Action failed'));

      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                message: 'Action message',
                actions: [{ type: 'test_action', parameters: {} }]
              })
            }
          }]
        });

      const result = await service.processMessage(sessionId, 'Test action error');

      expect(result.error).toBe(true);
      expect(result.message).toContain('encountered an error');

      service['executeActions'] = originalExecuteActions;
    });
  });

  describe('Fallback responses', () => {
    const sessionId = 'test-session';

    beforeEach(async () => {
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(1);
    });

    it('should provide activity-related fallback', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockRejectedValueOnce(new Error('Response generation failed'));

      const result = await service.processMessage(sessionId, 'I need an activity for tomorrow');

      expect(result.message).toContain('generate activities');
      expect(result.suggestions).toContain('Try asking about specific subjects or outcomes');
    });

    it('should provide planning-related fallback', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockRejectedValueOnce(new Error('Response generation failed'));

      const result = await service.processMessage(sessionId, 'Help me plan next week');

      expect(result.message).toContain('weekly plan');
    });

    it('should provide coverage-related fallback', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockRejectedValueOnce(new Error('Response generation failed'));

      const result = await service.processMessage(sessionId, 'Check my curriculum coverage');

      expect(result.message).toContain('curriculum coverage');
    });

    it('should provide help-related fallback', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockRejectedValueOnce(new Error('Response generation failed'));

      const result = await service.processMessage(sessionId, 'I need help');

      expect(result.message).toContain('here to help with');
      expect(result.message).toContain('Generating curriculum-aligned activities');
    });

    it('should provide generic fallback for unrecognized input', async () => {
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockRejectedValueOnce(new Error('Response generation failed'));

      const result = await service.processMessage(sessionId, 'Random unrelated message');

      expect(result.message).toContain('planning assistant');
      expect(result.message).toContain('What would you like to do?');
    });
  });

  describe('Helper methods', () => {
    it('should calculate next Monday correctly', () => {
      const service = new GPTPlanningAgentService();
      
      // Test from different days of the week
      const testCases = [
        { day: new Date('2024-01-08'), expected: '2024-01-15' }, // Monday -> next Monday
        { day: new Date('2024-01-09'), expected: '2024-01-15' }, // Tuesday
        { day: new Date('2024-01-13'), expected: '2024-01-15' }, // Saturday
        { day: new Date('2024-01-14'), expected: '2024-01-15' }, // Sunday -> Monday
      ];

      testCases.forEach(({ day, expected }) => {
        jest.spyOn(global, 'Date').mockImplementation(() => day as any);
        const nextMonday = service['getNextMonday']();
        expect(nextMonday).toBe(expected);
        jest.restoreAllMocks();
      });
    });
  });
});