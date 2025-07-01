#!/usr/bin/env node

// Test to verify AI service detection in our codebase
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test environment
config({ path: path.join(__dirname, '.env.test') });

async function testServiceDetection() {
  console.log('🔍 Testing AI Service Detection in Teaching Engine Services');

  try {
    // Import our services
    const { openai } = await import('./src/services/llmService.ts');
    const { EmbeddingService } = await import('./src/services/embeddingService.ts');
    const { AIParentSummaryService } = await import('./src/services/aiParentSummaryService.ts');

    console.log('✅ Services imported successfully');

    // Test LLM service detection
    console.log('\n📡 LLM Service Status:');
    console.log('openai instance:', !!openai);

    // Test embedding service detection
    console.log('\n🧬 Embedding Service Status:');
    const embeddingService = new EmbeddingService();
    const embeddingAvailable = embeddingService.isEmbeddingServiceAvailable();
    console.log('Embedding service available:', embeddingAvailable);

    // Test AI parent summary service detection
    console.log('\n👨‍👩‍👧 AI Parent Summary Service Status:');
    const parentSummaryService = new AIParentSummaryService();
    const aiServiceAvailable = parentSummaryService.isAIServiceAvailable();
    console.log('AI service available:', aiServiceAvailable);

    if (embeddingAvailable && aiServiceAvailable) {
      console.log('\n🎉 All AI services are properly detected and available!');

      // Test actual embedding generation
      console.log('\n🧪 Testing real embedding generation...');
      const testResult = await embeddingService.generateEmbedding(
        'test-service-detection-001',
        'Test embedding for service detection',
      );
      console.log('Embedding test result:', !!testResult);
      console.log('Embedding dimensions:', testResult?.embedding?.length);

      return true;
    } else {
      console.log('\n❌ Some AI services are not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Service detection test failed:');
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Teaching Engine 2.0 - Service Detection Test\n');

  const success = await testServiceDetection();

  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 Service detection test passed!');
  } else {
    console.log('💥 Service detection test failed.');
    process.exit(1);
  }
}

main().catch(console.error);
