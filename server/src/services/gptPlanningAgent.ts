import { prisma } from '../prisma';
import { openai } from './llmService';
import { z } from 'zod';
import logger from '../logger';
import { aiActivityGeneratorEnhanced } from './aiActivityGeneratorEnhanced';
import { aiWeeklyPlanGenerator } from './aiWeeklyPlanGenerator';
import { v4 as uuidv4 } from 'uuid';

// Schema for agent responses
const AgentResponseSchema = z.object({
  message: z.string(),
  actions: z.array(z.object({
    type: z.enum(['generate_activity', 'generate_plan', 'analyze_coverage', 'show_suggestions', 'schedule_activity']),
    parameters: z.record(z.unknown()),
  })).optional(),
  suggestions: z.array(z.string()).optional(),
  data: z.record(z.unknown()).optional(),
});

interface ConversationContext {
  sessionId: string;
  userId: number;
  recentMessages: Array<{ role: string; content: string }>;
  currentFocus?: string;
  metadata?: Record<string, unknown>;
}

export class GPTPlanningAgentService {
  private conversationContexts = new Map<string, ConversationContext>();

  /**
   * Start a new conversation session
   */
  async startSession(userId: number): Promise<string> {
    const sessionId = uuidv4();
    
    this.conversationContexts.set(sessionId, {
      sessionId,
      userId,
      recentMessages: [],
      metadata: {
        startTime: new Date(),
        messageCount: 0,
      },
    });

    // Save initial session
    await prisma.planningConversation.create({
      data: {
        userId,
        sessionId,
        role: 'system',
        content: 'Planning assistant session started',
        metadata: JSON.stringify({ event: 'session_start' }),
      },
    });

    return sessionId;
  }

  /**
   * Process a user message and generate response with actions
   */
  async processMessage(sessionId: string, message: string): Promise<any> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) {
      throw new Error('Invalid session');
    }

    try {
      // Save user message
      await prisma.planningConversation.create({
        data: {
          userId: context.userId,
          sessionId,
          role: 'user',
          content: message,
        },
      });

      // Add to context
      context.recentMessages.push({ role: 'user', content: message });
      if (context.recentMessages.length > 10) {
        context.recentMessages.shift(); // Keep only recent messages
      }

      // Analyze user intent
      const intent = await this.analyzeIntent(message, context);
      
      // Generate response based on intent
      const response = await this.generateResponse(intent, context);

      // Execute any actions
      const actionResults = await this.executeActions(response.actions || [], context);

      // Save assistant response
      await prisma.planningConversation.create({
        data: {
          userId: context.userId,
          sessionId,
          role: 'assistant',
          content: response.message,
          metadata: JSON.stringify({
            actions: response.actions,
            actionResults,
          }),
        },
      });

      // Update context
      context.recentMessages.push({ role: 'assistant', content: response.message });
      context.metadata!.messageCount = (context.metadata!.messageCount as number || 0) + 1;

      return {
        message: response.message,
        actions: response.actions,
        actionResults,
        suggestions: response.suggestions,
        data: response.data,
      };

    } catch (error) {
      logger.error('Error processing planning message:', error);
      
      const errorMessage = "I apologize, but I encountered an error. Could you please rephrase your request?";
      
      await prisma.planningConversation.create({
        data: {
          userId: context.userId,
          sessionId,
          role: 'assistant',
          content: errorMessage,
          metadata: JSON.stringify({ error: true }),
        },
      });

      return {
        message: errorMessage,
        error: true,
      };
    }
  }

  /**
   * Analyze user intent from their message
   */
  private async analyzeIntent(message: string, context: ConversationContext) {
    const systemPrompt = `You are an AI planning assistant for a Grade 1 French Immersion teacher.
Analyze the user's message and determine their intent.

Common intents:
- Generate activities for specific outcomes or subjects
- Create a weekly plan
- Analyze curriculum coverage
- Get teaching suggestions
- Schedule activities
- Ask about student progress
- Request help with specific topics

Consider the conversation context when determining intent.`;

    const userPrompt = `Analyze this message from a teacher:
"${message}"

Recent conversation:
${context.recentMessages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}

Determine:
1. Primary intent
2. Key entities (subjects, outcomes, dates, etc.)
3. Required actions
4. Follow-up questions if needed`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const analysis = completion.choices[0]?.message?.content || '';
      
      return {
        rawAnalysis: analysis,
        message: message.toLowerCase(),
        context,
      };

    } catch (error) {
      logger.error('Error analyzing intent:', error);
      return {
        rawAnalysis: '',
        message: message.toLowerCase(),
        context,
      };
    }
  }

  /**
   * Generate appropriate response based on intent
   */
  private async generateResponse(intent: any, context: ConversationContext) {
    const systemPrompt = `You are a helpful AI planning assistant for a Grade 1 French Immersion teacher.

Your capabilities:
- Generate curriculum-aligned activities
- Create weekly lesson plans
- Analyze curriculum coverage
- Provide teaching suggestions
- Help with scheduling

Guidelines:
- Be concise but thorough
- Use a friendly, professional tone
- Suggest concrete actions when appropriate
- Ask clarifying questions when needed
- Reference curriculum outcomes when relevant

Respond with a JSON object containing:
- message: Your response to the teacher
- actions: Array of actions to take (if any)
- suggestions: Quick suggestions for next steps
- data: Any relevant data to display`;

    const userPrompt = `Based on this analysis:
${intent.rawAnalysis}

Original message: "${intent.message}"

Generate an appropriate response with any necessary actions.

Actions can be:
- generate_activity: Create activities for outcomes
- generate_plan: Create a weekly plan
- analyze_coverage: Show curriculum coverage analysis
- show_suggestions: Display activity suggestions
- schedule_activity: Add activity to calendar

Format response as JSON.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from AI');
      }

      const parsed = JSON.parse(responseContent);
      return AgentResponseSchema.parse(parsed);

    } catch (error) {
      logger.error('Error generating response:', error);
      
      // Fallback response
      return {
        message: this.generateFallbackResponse(intent.message),
        actions: [],
        suggestions: ['Try asking about specific subjects or outcomes', 'Request a weekly plan', 'Ask for activity suggestions'],
      };
    }
  }

  /**
   * Execute actions requested by the agent
   */
  private async executeActions(actions: any[], context: ConversationContext) {
    const results = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'generate_activity': {
            const activities = await aiActivityGeneratorEnhanced.generateActivities({
              outcomeIds: (action.parameters.outcomeIds as string[]) || [],
              userId: context.userId,
              theme: action.parameters.theme as string,
              complexity: action.parameters.complexity as 'simple' | 'moderate' | 'complex',
            });
            results.push({
              type: 'activities_generated',
              data: activities,
            });
            break;
          }

          case 'generate_plan': {
            const plan = await aiWeeklyPlanGenerator.generateWeeklyPlan({
              userId: context.userId,
              weekStart: (action.parameters.weekStart as string) || this.getNextMonday(),
              preferences: action.parameters.preferences as Record<string, unknown>,
            });
            results.push({
              type: 'plan_generated',
              data: plan,
            });
            break;
          }

          case 'analyze_coverage': {
            const analysis = await aiActivityGeneratorEnhanced.analyzeCurriculumGaps(
              context.userId,
              action.parameters.subjectId as number
            );
            results.push({
              type: 'coverage_analysis',
              data: analysis,
            });
            break;
          }

          case 'show_suggestions': {
            const suggestions = await prisma.aISuggestedActivity.findMany({
              where: {
                userId: context.userId,
                ...(action.parameters.outcomeId && { outcomeId: action.parameters.outcomeId as string }),
                ...(action.parameters.theme && { theme: action.parameters.theme as string }),
              },
              include: {
                outcome: true,
              },
              orderBy: {
                qualityScore: 'desc',
              },
              take: 5,
            });
            results.push({
              type: 'suggestions_retrieved',
              data: suggestions,
            });
            break;
          }

          case 'schedule_activity':
            // TODO: Implement activity scheduling
            results.push({
              type: 'activity_scheduled',
              data: { success: false, message: 'Scheduling not yet implemented' },
            });
            break;

          default:
            logger.warn(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        logger.error(`Error executing action ${action.type}:`, error);
        results.push({
          type: 'error',
          action: action.type,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId: string, userId: number) {
    const messages = await prisma.planningConversation.findMany({
      where: {
        sessionId,
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
      metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
    }));
  }

  /**
   * Get quick action suggestions based on current context
   */
  async getQuickActions(userId: number) {
    // Analyze recent activity to suggest relevant actions

    const upcomingMilestones = await prisma.milestone.findMany({
      where: {
        userId,
        targetDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
      include: {
        activities: true,
      },
      take: 5,
    });

    const suggestions = [];

    // Suggest planning for upcoming milestones with few activities
    for (const milestone of upcomingMilestones) {
      if (milestone.activities.length < 3) {
        suggestions.push({
          label: `Create activities for "${milestone.title}"`,
          action: 'generate_activity',
          parameters: { milestoneId: milestone.id },
        });
      }
    }

    // Suggest weekly planning if it's near the weekend
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek >= 4) { // Thursday or later
      suggestions.push({
        label: 'Generate next week\'s plan',
        action: 'generate_plan',
        parameters: { weekStart: this.getNextMonday() },
      });
    }

    // Always include coverage analysis
    suggestions.push({
      label: 'Analyze curriculum coverage',
      action: 'analyze_coverage',
      parameters: {},
    });

    return suggestions.slice(0, 4); // Return top 4 suggestions
  }

  // Helper methods

  private generateFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('activity') || lowerMessage.includes('activité')) {
      return "I can help you generate activities! Which subject or learning outcome would you like to focus on?";
    } else if (lowerMessage.includes('plan') || lowerMessage.includes('week')) {
      return "I can create a weekly plan for you. Would you like me to generate one for next week?";
    } else if (lowerMessage.includes('coverage') || lowerMessage.includes('curriculum')) {
      return "I can analyze your curriculum coverage. Would you like an overall analysis or focus on a specific subject?";
    } else if (lowerMessage.includes('help') || lowerMessage.includes('aide')) {
      return "I'm here to help with:\n• Generating curriculum-aligned activities\n• Creating weekly lesson plans\n• Analyzing curriculum coverage\n• Providing teaching suggestions\n\nWhat would you like to work on?";
    } else {
      return "I'm your planning assistant. I can help generate activities, create weekly plans, or analyze curriculum coverage. What would you like to do?";
    }
  }

  private getNextMonday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday.toISOString().split('T')[0];
  }

  /**
   * Clean up old sessions
   */
  async cleanupSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Remove old sessions from memory
    for (const [sessionId, context] of this.conversationContexts.entries()) {
      if (context.metadata?.startTime && context.metadata.startTime < oneDayAgo) {
        this.conversationContexts.delete(sessionId);
      }
    }

    // Note: Database records are kept for history
  }
}

export const gptPlanningAgent = new GPTPlanningAgentService();