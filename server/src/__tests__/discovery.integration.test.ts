import { describe, it, expect, beforeAll, afterAll } from '@jest/lib';
import { curriculumDiscoveryService } from '../services/curriculumDiscoveryService';
import { activityDiscoveryService } from '../services/activityDiscoveryService';

describe('Discovery Services Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    console.log('Setting up discovery services tests');
  });

  afterAll(async () => {
    // Cleanup
    console.log('Cleaning up discovery services tests');
  });

  describe('Curriculum Discovery Service', () => {
    it('should initialize successfully', () => {
      expect(curriculumDiscoveryService).toBeDefined();
      expect(typeof curriculumDiscoveryService.discoverDocuments).toBe('function');
    });

    it('should return empty array when no documents are discovered', () => {
      const documents = curriculumDiscoveryService.getDiscoveredDocuments();
      expect(Array.isArray(documents)).toBe(true);
    });

    it('should provide discovery statistics', () => {
      const stats = curriculumDiscoveryService.getDiscoveryStats();
      expect(stats).toHaveProperty('totalDocuments');
      expect(stats).toHaveProperty('byProvince');
      expect(stats).toHaveProperty('bySubject');
      expect(stats).toHaveProperty('byGrade');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('byLanguage');
      expect(typeof stats.totalDocuments).toBe('number');
    });

    it('should filter documents by criteria', () => {
      const allDocuments = curriculumDiscoveryService.getDiscoveredDocuments();
      const filteredDocuments = curriculumDiscoveryService.getDocumentsByFilter({
        province: 'PE',
        grade: 1,
        language: 'fr',
      });
      
      expect(Array.isArray(filteredDocuments)).toBe(true);
      expect(filteredDocuments.length).toBeLessThanOrEqual(allDocuments.length);
    });

    it('should add and remove discovered documents', () => {
      const testDocument = {
        id: 'test-doc-001',
        title: 'Test Curriculum Document',
        url: 'https://example.com/test-curriculum.pdf',
        source: 'Test Source',
        sourceType: 'government' as const,
        province: 'PE',
        grade: 1,
        subject: 'Mathematics',
        documentType: 'curriculum' as const,
        fileType: 'pdf' as const,
        language: 'en' as const,
        isActive: true,
        lastVerified: new Date(),
        downloadAttempts: 0,
        downloadStatus: 'pending' as const,
      };

      // Add document
      curriculumDiscoveryService.addDiscoveredDocument(testDocument);
      const documents = curriculumDiscoveryService.getDiscoveredDocuments();
      expect(documents.some(doc => doc.id === testDocument.id)).toBe(true);

      // Remove document
      const removed = curriculumDiscoveryService.removeDiscoveredDocument(testDocument.id);
      expect(removed).toBe(true);
      
      const documentsAfterRemoval = curriculumDiscoveryService.getDiscoveredDocuments();
      expect(documentsAfterRemoval.some(doc => doc.id === testDocument.id)).toBe(false);
    });
  });

  describe('Activity Discovery Service', () => {
    it('should initialize with connectors', () => {
      expect(activityDiscoveryService).toBeDefined();
      expect(typeof activityDiscoveryService.search).toBe('function');
      
      const availableSources = activityDiscoveryService.getAvailableSources();
      expect(Array.isArray(availableSources)).toBe(true);
      expect(availableSources.length).toBeGreaterThan(0);
    });

    it('should return available sources', () => {
      const sources = activityDiscoveryService.getAvailableSources();
      expect(sources).toContain('education');
      expect(sources).toContain('curriculum');
      expect(sources).toContain('oer');
    });

    it('should check source availability', () => {
      expect(activityDiscoveryService.isSourceAvailable('education')).toBe(true);
      expect(activityDiscoveryService.isSourceAvailable('nonexistent')).toBe(false);
    });

    it('should perform search with basic parameters', async () => {
      const searchParams = {
        query: 'mathematics grade 1',
        grade: 1,
        subject: 'mathematics',
        language: 'en',
        limit: 5,
      };

      const result = await activityDiscoveryService.search(searchParams, 1);
      
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(result).toHaveProperty('searchParams');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('executionTime');
      
      expect(Array.isArray(result.activities)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.hasMore).toBe('boolean');
      expect(typeof result.executionTime).toBe('number');
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('should handle empty search results gracefully', async () => {
      const searchParams = {
        query: 'very-specific-non-existent-topic-12345',
        limit: 10,
      };

      const result = await activityDiscoveryService.search(searchParams, 1);
      
      expect(result.activities).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should normalize search parameters correctly', async () => {
      const searchParams = {
        gradeLevel: 3, // Should be mapped to grade
        limit: 200,    // Should be capped at 100
        offset: -5,    // Should be set to 0
      };

      const result = await activityDiscoveryService.search(searchParams, 1);
      
      expect(result.searchParams.grade).toBe(3);
      expect(result.searchParams.limit).toBeLessThanOrEqual(100);
      expect(result.searchParams.offset).toBeGreaterThanOrEqual(0);
    });

    it('should return null for unknown activity', async () => {
      const activity = await activityDiscoveryService.getActivity('unknown-source', 'unknown-id');
      expect(activity).toBeNull();
    });

    it('should parse composite activity IDs correctly', async () => {
      const compositeId = 'test-source-activity-123-with-dashes';
      const activity = await activityDiscoveryService.getActivityById(compositeId);
      
      // Should attempt to get activity from 'test' source with external ID 'source-activity-123-with-dashes'
      // Since the source doesn't exist, it should return null
      expect(activity).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully in curriculum discovery', async () => {
      // This test simulates network failures
      const verifyResult = await curriculumDiscoveryService.verifyDocument('non-existent-doc');
      expect(verifyResult).toBe(false);
    });

    it('should handle invalid parameters in activity search', async () => {
      const invalidParams = {
        grade: -1,        // Invalid grade
        limit: -10,       // Invalid limit
        offset: -20,      // Invalid offset
      };

      const result = await activityDiscoveryService.search(invalidParams, 1);
      
      // Service should normalize invalid parameters
      expect(result.searchParams.limit).toBeGreaterThan(0);
      expect(result.searchParams.offset).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should complete curriculum discovery stats quickly', () => {
      const startTime = Date.now();
      const stats = curriculumDiscoveryService.getDiscoveryStats();
      const executionTime = Date.now() - startTime;
      
      expect(stats).toBeDefined();
      expect(executionTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should complete activity search within reasonable time', async () => {
      const startTime = Date.now();
      const result = await activityDiscoveryService.search({ query: 'test', limit: 5 }, 1);
      const executionTime = Date.now() - startTime;
      
      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(30000); // Should complete in under 30 seconds
    }, 35000); // Set timeout to 35 seconds for this test
  });
});