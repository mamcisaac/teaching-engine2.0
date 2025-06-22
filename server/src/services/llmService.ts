import OpenAI from 'openai';
import logger from '../logger';

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export { openai };

export async function generateContent(prompt: string, systemMessage?: string): Promise<string> {
  if (!openai) {
    logger.warn('OpenAI API key not configured, returning placeholder content');
    return 'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.';
  }

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    if (chat?.usage?.total_tokens) {
      logger.info({ tokens: chat.usage.total_tokens }, 'LLM tokens used for content generation');
    }

    return chat?.choices?.[0]?.message?.content?.trim() || 'No content generated';
  } catch (err) {
    logger.error({ err }, 'LLM content generation failed');
    return 'Failed to generate content. Please try again later.';
  }
}

export async function generateBilingualContent(
  prompt: string,
  systemMessage?: string,
): Promise<{ french: string; english: string }> {
  const bilingualSystemMessage = `${systemMessage || ''}\n\nPlease respond with content in both French and English. Format your response as:

FRENCH:
[French content here]

ENGLISH:
[English content here]`;

  const content = await generateContent(prompt, bilingualSystemMessage);

  // Parse the bilingual response
  const frenchMatch = content.match(/FRENCH:\s*([\s\S]*?)(?=ENGLISH:|$)/i);
  const englishMatch = content.match(/ENGLISH:\s*([\s\S]*?)$/i);

  return {
    french: frenchMatch?.[1]?.trim() || content,
    english: englishMatch?.[1]?.trim() || content,
  };
}
