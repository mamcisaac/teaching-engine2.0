// Global mock setup for all tests
// This file runs before any tests and sets up all required mocks
import { jest } from '@jest/globals';

// Mock all services that need mocking
jest.mock('../src/prisma');
jest.mock('openai');
jest.mock('../src/services/llmService');
jest.mock('../src/services/embeddingService');
jest.mock('../src/services/clusteringService');
jest.mock('../src/services/curriculumImportService');
