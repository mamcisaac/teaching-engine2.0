/**
 * Mock for mammoth (DOCX parser) library
 */
export const extractRawText = jest.fn().mockResolvedValue({
  value: 'Mock DOCX content for testing purposes',
  messages: [],
});

export default {
  extractRawText,
};
