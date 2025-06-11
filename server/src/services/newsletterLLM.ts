import OpenAI from 'openai';
import logger from '../logger';

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function rewriteNewsletter(draft: string): Promise<string> {
  if (!openai) return draft;
  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Rewrite the classroom newsletter in a warm, engaging tone for parents. Keep length similar.',
        },
        { role: 'user', content: draft },
      ],
      temperature: 0.7,
    });
    if (chat.usage?.total_tokens)
      logger.info({ tokens: chat.usage.total_tokens }, 'llm tokens used');
    return chat.choices[0]?.message?.content?.trim() || draft;
  } catch (err) {
    logger.error({ err }, 'llm rewrite failed');
    return draft;
  }
}
