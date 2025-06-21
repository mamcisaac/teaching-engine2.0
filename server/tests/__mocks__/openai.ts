// Mock OpenAI client for tests
export class OpenAI {
  chat = {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                content: 'Mocked newsletter content',
                sections: [],
                suggestions: []
              })
            }
          }
        ]
      })
    }
  };

  embeddings = {
    create: jest.fn().mockResolvedValue({
      data: [
        {
          embedding: Array(1536).fill(0.1)
        }
      ]
    })
  };
}

export default OpenAI;