// Stub for AnthropicService to fix missing import
export class AnthropicService {
  constructor() {}

  async generateActivity(_params: unknown): Promise<{
    title: string;
    description: string;
    duration: number;
    materials: string[];
    learningGoals: string[];
  }> {
    // Stub implementation
    return {
      title: 'Generated Activity',
      description: 'This is a stub implementation',
      duration: 30,
      materials: [],
      learningGoals: [],
    };
  }

  async generateResponse(_prompt: string): Promise<string> {
    // Stub implementation
    return 'This is a stub response';
  }

  async generateCompletion(_params: {
    prompt: string;
    systemPrompt?: string;
    temperature?: number;
  }): Promise<string> {
    // Stub implementation
    return 'This is a stub completion response';
  }
}
