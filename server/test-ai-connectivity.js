#!/usr/bin/env node

// Simple test to verify OpenAI API connectivity
import { config } from 'dotenv';
// Note: readFileSync available if needed for file operations
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test environment
config({ path: path.join(__dirname, '.env.test') });

async function testOpenAIConnectivity() {
  console.log('🔍 Testing OpenAI API Connectivity');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API Key present:', !!process.env.OPENAI_API_KEY);
  console.log('API Key (first 20 chars):', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ No OpenAI API key found in .env.test');
    return false;
  }

  try {
    // Dynamically import OpenAI (since it's ESM only)
    const { default: OpenAI } = await import('openai');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
    });

    console.log('🚀 Testing OpenAI chat completion...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello in exactly 3 words.' }],
      max_tokens: 10,
    });

    console.log('✅ Chat completion successful!');
    console.log('Response:', completion.choices[0]?.message?.content);
    console.log('Tokens used:', completion.usage?.total_tokens);

    console.log('🧬 Testing OpenAI embeddings...');

    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Test embedding generation',
    });

    console.log('✅ Embedding generation successful!');
    console.log('Embedding dimensions:', embedding.data[0].embedding.length);
    console.log('Tokens used:', embedding.usage?.total_tokens);

    return true;
  } catch (error) {
    console.error('❌ OpenAI API test failed:');
    console.error('Error:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
    return false;
  }
}

// Test rate limiting configuration
function testRateLimitConfig() {
  console.log('\n📊 Rate Limiting Configuration:');
  console.log('AI_REQUEST_DELAY_MS:', process.env.AI_REQUEST_DELAY_MS || 'not set (default: 1000)');
  console.log('AI_BATCH_SIZE:', process.env.AI_BATCH_SIZE || 'not set (default: 5)');
  console.log('AI_MAX_RETRIES:', process.env.AI_MAX_RETRIES || 'not set (default: 3)');
  console.log('AI_TIMEOUT_MS:', process.env.AI_TIMEOUT_MS || 'not set (default: 30000)');
}

async function main() {
  console.log('🧪 Teaching Engine 2.0 - AI Service Connectivity Test\n');

  testRateLimitConfig();

  const success = await testOpenAIConnectivity();

  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 All tests passed! AI services are properly configured.');
  } else {
    console.log('💥 Tests failed. Check your OpenAI API configuration.');
    process.exit(1);
  }
}

main().catch(console.error);
