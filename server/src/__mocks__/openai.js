/**
 * Mock implementation of OpenAI for testing
 */

// Store the original mocks so they can be accessed from tests
const createMock = jest.fn();
const embeddingsMock = jest.fn();

const mockChatCompletion = {
  id: 'mock-completion-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150,
  },
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'Mock generated content',
      },
      index: 0,
      finish_reason: 'stop',
    },
  ],
};

const mockEmbedding = {
  object: 'list',
  data: [
    {
      object: 'embedding',
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()),
      index: 0,
    },
  ],
  model: 'text-embedding-ada-002',
  usage: {
    prompt_tokens: 8,
    total_tokens: 8,
  },
};

// Set default mock behaviors
createMock.mockResolvedValue(mockChatCompletion);
embeddingsMock.mockResolvedValue(mockEmbedding);

// Create a mock constructor that Jest can work with
function MockOpenAI(config = {}) {
  return {
    apiKey: config.apiKey || 'test-api-key',
    chat: {
      completions: {
        create: createMock,
      },
    },
    embeddings: {
      create: embeddingsMock,
    },
  };
}

// Add static properties for access from tests
MockOpenAI.mockCreate = createMock;
MockOpenAI.mockEmbeddings = embeddingsMock;

// Export for CommonJS compatibility
module.exports = MockOpenAI;
module.exports.OpenAI = MockOpenAI;
module.exports.default = MockOpenAI;
