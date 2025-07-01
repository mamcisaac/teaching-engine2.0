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
          choices: [
            {
              message: {
                content:
                  'Primary intent: Generate lesson activities\nKey entities: math\nRequired actions: suggest activities\nFollow-up: What grade level?',
              },
            },
          ],
        })
        // Mock response generation
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  message:
                    "I'd be happy to help you plan a math lesson! What grade level are you teaching?",
                  actions: [],
                  suggestions: [
                    'Specify the grade level',
                    'Mention specific math topics',
                    'Indicate lesson duration',
                  ],
                }),
              },
            },
          ],
        });

      const result = await service.processMessage(sessionId, userMessage);

      expect(result).toMatchObject({
        message: expect.stringContaining('help you plan a math lesson'),
        suggestions: expect.arrayContaining(['Specify the grade level']),
        error: undefined,
      });
    });

    it('should handle messages with actions', async () => {
      const userMessage = 'Generate activities for grade 3 fractions';

      mockCreateCompletion
        .mockResolvedValueOnce({
          choices: [
            {
              message: { content: 'Intent: generate activities for fractions' },
            },
          ],
        })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  message: "I'll help you create fraction activities for Grade 3.",
                  actions: [
                    {
                      type: 'generate_activity',
                      parameters: { grade: 3, topic: 'fractions' },
                    },
                  ],
                  suggestions: ['View generated activities', 'Modify parameters'],
                }),
              },
            },
          ],
        });

      const result = await service.processMessage(sessionId, userMessage);

      expect(result).toMatchObject({
        message: expect.stringContaining('fraction activities'),
        actions: expect.arrayContaining([
          {
            type: 'generate_activity',
            payload: { grade: 3, topic: 'fractions' },
          },
        ]),
        actionResults: expect.arrayContaining([
          {
            type: 'activities_generated',
            data: expect.objectContaining({
              redirect: '/planner/lessons',
            }),
          },
        ]),
      });
    });

    it('should handle invalid session', async () => {
      await expect(service.processMessage('invalid-session', 'test')).rejects.toThrow(
        'Invalid session',
      );
    });

    it('should handle API errors gracefully', async () => {
      mockCreateCompletion.mockRejectedValueOnce(new Error('API Error'));

      const result = await service.processMessage(sessionId, 'test message');

      expect(result).toMatchObject({
        message: expect.stringContaining('apologize'),
        error: 'Failed to process message',
      });
    });
  });

  describe('conversation context', () => {
    const sessionId = 'context-session';
    const userId = 1;

    beforeEach(async () => {
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);
    });

    it('should maintain conversation context', async () => {
      // First message
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis 1' } }] })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  message: 'First response',
                  actions: [],
                }),
              },
            },
          ],
        });

      await service.processMessage(sessionId, 'First message');

      // Second message - should include context
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis 2' } }] })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  message: 'Second response with context',
                  actions: [],
                }),
              },
            },
          ],
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
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    message: `Response ${i}`,
                    actions: [],
                  }),
                },
              },
            ],
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

    it('should return conversation history for valid session', async () => {
      const sessionId = 'history-session';
      const userId = 1;

      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);

      // Add a message
      mockCreateCompletion
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Analysis' } }] })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  message: 'Test response',
                  actions: [],
                }),
              },
            },
          ],
        });

      await service.processMessage(sessionId, 'Test message');

      const history = await service.getConversationHistory(sessionId, userId);

      expect(history).toHaveLength(2); // User message + assistant response
      expect(history[0]).toMatchObject({
        role: 'user',
        content: 'Test message',
      });
      expect(history[1]).toMatchObject({
        role: 'assistant',
        content: expect.stringContaining('Test response'),
      });
    });

    it('should not return history for wrong user', async () => {
      const sessionId = 'user-session';
      const userId = 1;
      const wrongUserId = 2;

      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);

      const history = await service.getConversationHistory(sessionId, wrongUserId);
      expect(history).toEqual([]);
    });
  });

  describe('handleAction', () => {
    const sessionId = 'action-session';
    const userId = 1;

    beforeEach(async () => {
      mockUuidV4.mockReturnValue(sessionId);
      await service.startSession(userId);
    });

    it('should handle generate_activity action', async () => {
      const action = {
        type: 'generate_activity',
        parameters: { grade: 2, topic: 'addition' },
      };

      const result = await service['handleAction'](action);

      expect(result).toMatchObject({
        type: 'activities_generated',
        data: {
          message: expect.stringContaining('Activities generated'),
          redirect: '/planner/lessons',
        },
      });
    });

    it('should handle create_lesson action', async () => {
      const action = {
        type: 'create_lesson',
        parameters: { title: 'Math Lesson', duration: 45 },
      };

      const result = await service['handleAction'](action);

      expect(result).toMatchObject({
        type: 'lesson_created',
        data: {
          message: expect.stringContaining('Lesson created'),
          redirect: '/planner/lessons',
        },
      });
    });

    it('should handle analyze_curriculum action', async () => {
      const action = {
        type: 'analyze_curriculum',
        parameters: { grade: 4, subject: 'science' },
      };

      const result = await service['handleAction'](action);

      expect(result).toMatchObject({
        type: 'curriculum_analyzed',
        data: {
          message: expect.stringContaining('Curriculum analyzed'),
          redirect: '/curriculum',
        },
      });
    });

    it('should handle unknown action type', async () => {
      const action = {
        type: 'unknown_action',
        parameters: {},
      };

      const result = await service['handleAction'](action);

      expect(result).toMatchObject({
        type: 'error',
        data: {
          message: 'Unknown action type: unknown_action',
        },
      });
    });

    it('should handle action errors', async () => {
      const action = {
        type: 'generate_activity',
        parameters: null, // Invalid parameters
      };

      const result = await service['handleAction'](action);

      expect(result.type).toBe('error');
      expect(result.data.message).toContain('Error');
    });
  });
});
