import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, MessageSquare, X, Sparkles, Mic, MicOff } from 'lucide-react';
import { api } from '../../api';
import { toast } from 'sonner';
import type { SpeechRecognition, SpeechRecognitionEvent } from '../../types/speech-recognition';

interface Action {
  type: string;
  data: unknown;
}

interface ActivityGeneratedResult {
  type: 'activities_generated';
  data: Activity[];
}

interface PlanGeneratedResult {
  type: 'plan_generated';
  data: Plan;
}

interface CoverageAnalysisResult {
  type: 'coverage_analysis';
  data: {
    coveragePercentage: number;
    [key: string]: unknown;
  };
}

type ActionResult = ActivityGeneratedResult | PlanGeneratedResult | CoverageAnalysisResult;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: Action[];
  actionResults?: ActionResult[];
}

interface Activity {
  id?: string | number;
  title: string;
  description: string;
  subject?: string;
  duration?: number;
  materials?: string[];
  expectationIds?: string[];
  [key: string]: unknown;
}

interface Plan {
  id?: string | number;
  weekStart?: string;
  activities?: Activity[];
  qualityMetrics?: {
    coverageScore: number;
    balanceScore: number;
    pacingScore: number;
    overallScore: number;
  };
  [key: string]: unknown;
}

interface GPTPlanningAgentProps {
  isOpen: boolean;
  onClose: () => void;
  onActivityGenerated?: (activities: Activity[]) => void;
  onPlanGenerated?: (plan: Plan) => void;
}

export function GPTPlanningAgent({
  isOpen,
  onClose,
  onActivityGenerated,
  onPlanGenerated,
}: GPTPlanningAgentProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Start session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/ai/agent/sessions');
      return response.data.data;
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages([
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId) throw new Error('No session');
      const response = await api.post('/api/ai/agent/messages', {
        sessionId,
        message,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          actions: data.actions,
          actionResults: data.actionResults,
        },
      ]);

      // Handle action results
      if (data.actionResults) {
        data.actionResults.forEach((result: ActionResult) => {
          switch (result.type) {
            case 'activities_generated':
              if (onActivityGenerated) {
                onActivityGenerated(result.data);
              }
              break;
            case 'plan_generated':
              if (onPlanGenerated) {
                onPlanGenerated(result.data);
              }
              break;
            // coverage_analysis doesn't need special handling
          }
        });
      }
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Get quick actions
  interface QuickAction {
    label: string;
    value?: string;
    description?: string;
  }

  const { data: quickActions } = useQuery<QuickAction[]>({
    queryKey: ['quick-actions'],
    queryFn: async () => {
      const response = await api.get('/api/ai/agent/quick-actions');
      return response.data.data;
    },
  });

  // Initialize session when opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      startSessionMutation.mutate();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSend = () => {
    if (!inputValue.trim() || sendMessageMutation.isPending) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    sendMessageMutation.mutate(userMessage);
  };

  const handleQuickAction = (action: QuickAction) => {
    const message = action.label;
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
    ]);
    sendMessageMutation.mutate(message);
  };

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Planning Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>

              {/* Action Results */}
              {message.actionResults && message.actionResults.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  {message.actionResults.map((result: ActionResult, idx: number) => (
                    <div key={idx} className="text-xs">
                      {result.type === 'activities_generated' && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Generated {result.data.length} activities
                        </span>
                      )}
                      {result.type === 'plan_generated' && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Generated weekly plan
                        </span>
                      )}
                      {result.type === 'coverage_analysis' && (
                        <span>Coverage: {result.data.coveragePercentage.toFixed(0)}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action: QuickAction, index: number) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about planning..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={toggleVoiceRecognition}
            className={`p-2 rounded-md ${
              isListening
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
