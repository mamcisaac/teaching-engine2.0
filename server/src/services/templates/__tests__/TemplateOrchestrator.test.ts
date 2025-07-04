import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { TemplateOrchestrator } from '../TemplateOrchestrator';
import { TemplateRegistry } from '../TemplateRegistry';
import { TemplateCache } from '../TemplateCache';
import { RenderCoordinator } from '../RenderCoordinator';
import { TemplateValidator } from '../TemplateValidator';
import { MetricsCollector } from '../MetricsCollector';
import { TemplateExporter } from '../TemplateExporter';
import { prisma } from '@teaching-engine/database';
import { AppError } from '../../../utils/errors';

// Mock dependencies
vi.mock('../TemplateRegistry');
vi.mock('../TemplateCache');
vi.mock('../RenderCoordinator');
vi.mock('../TemplateValidator');
vi.mock('../MetricsCollector');
vi.mock('../TemplateExporter');

describe('TemplateOrchestrator', () => {
  let orchestrator: TemplateOrchestrator;
  let mockRegistry: jest.Mocked<TemplateRegistry>;
  let mockCache: jest.Mocked<TemplateCache>;
  let mockRenderer: jest.Mocked<RenderCoordinator>;
  let mockValidator: jest.Mocked<TemplateValidator>;
  let mockMetrics: jest.Mocked<MetricsCollector>;
  let mockExporter: jest.Mocked<TemplateExporter>;

  const mockUserId = 1;
  const mockTemplateId = 'lesson-standard';
  
  const mockTemplate = {
    id: 'lesson-standard',
    name: 'Standard Lesson Template',
    type: 'lesson',
    content: '<h1>{{title}}</h1><p>{{description}}</p>',
    schema: {
      title: { type: 'string', required: true },
      description: { type: 'string' },
    },
    metadata: {
      version: '1.0.0',
      author: 'System',
    },
  };

  const mockLessonData = {
    title: 'Introduction to Fractions',
    description: 'Learn about basic fractions',
    grade: 5,
    subject: 'Mathematics',
    duration: 60,
    learningGoals: 'Students will understand basic fractions',
    materials: ['Fraction tiles', 'Worksheets'],
  };

  beforeEach(() => {
    // Create mock instances
    mockRegistry = new TemplateRegistry() as jest.Mocked<TemplateRegistry>;
    mockCache = new TemplateCache() as jest.Mocked<TemplateCache>;
    mockRenderer = new RenderCoordinator() as jest.Mocked<RenderCoordinator>;
    mockValidator = new TemplateValidator() as jest.Mocked<TemplateValidator>;
    mockMetrics = new MetricsCollector() as jest.Mocked<MetricsCollector>;
    mockExporter = new TemplateExporter() as jest.Mocked<TemplateExporter>;

    // Set up default mock behaviors
    mockRegistry.getTemplate.mockResolvedValue(mockTemplate);
    mockRegistry.listTemplates.mockResolvedValue([mockTemplate]);
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);
    mockValidator.validate.mockResolvedValue({ isValid: true, errors: [] });
    mockRenderer.render.mockResolvedValue({
      html: '<h1>Introduction to Fractions</h1>',
      metadata: { renderTime: 100 },
    });

    // Create orchestrator instance
    orchestrator = new TemplateOrchestrator();
    orchestrator['registry'] = mockRegistry;
    orchestrator['cache'] = mockCache;
    orchestrator['renderer'] = mockRenderer;
    orchestrator['validator'] = mockValidator;
    orchestrator['metrics'] = mockMetrics;
    orchestrator['exporter'] = mockExporter;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('should render template with data successfully', async () => {
      const result = await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'html',
        }
      );

      expect(result).toEqual({
        html: '<h1>Introduction to Fractions</h1>',
        metadata: { renderTime: 100 },
      });

      // Verify workflow
      expect(mockRegistry.getTemplate).toHaveBeenCalledWith('lesson', mockTemplateId);
      expect(mockValidator.validate).toHaveBeenCalledWith(mockTemplate, { lesson: mockLessonData });
      expect(mockRenderer.render).toHaveBeenCalledWith(mockTemplate, { lesson: mockLessonData }, 'html');
      expect(mockMetrics.recordRender).toHaveBeenCalled();
    });

    it('should use cached result when available', async () => {
      const cachedResult = {
        html: '<h1>Cached Introduction to Fractions</h1>',
        metadata: { renderTime: 50, cached: true },
      };

      mockCache.get.mockResolvedValue(cachedResult);

      const result = await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'html',
        }
      );

      expect(result).toEqual(cachedResult);
      expect(mockRenderer.render).not.toHaveBeenCalled(); // Should not render
      expect(mockMetrics.recordCacheHit).toHaveBeenCalled();
    });

    it('should cache rendered result', async () => {
      const renderResult = {
        html: '<h1>Introduction to Fractions</h1>',
        metadata: { renderTime: 100 },
      };

      mockRenderer.render.mockResolvedValue(renderResult);

      await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'html',
        }
      );

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String), // Cache key
        renderResult,
        expect.any(Number) // TTL
      );
    });

    it('should handle template not found error', async () => {
      mockRegistry.getTemplate.mockRejectedValue(new AppError(404, 'Template not found'));

      await expect(
        orchestrator.render(
          { userId: mockUserId },
          {
            templateType: 'lesson',
            templateId: 'non-existent',
            data: { lesson: mockLessonData },
            format: 'html',
          }
        )
      ).rejects.toThrow('Template not found');
    });

    it('should handle validation errors', async () => {
      mockValidator.validate.mockResolvedValue({
        isValid: false,
        errors: ['Missing required field: title'],
      });

      await expect(
        orchestrator.render(
          { userId: mockUserId },
          {
            templateType: 'lesson',
            templateId: mockTemplateId,
            data: { lesson: {} }, // Missing required fields
            format: 'html',
          }
        )
      ).rejects.toThrow('Template validation failed');
    });

    it('should support different output formats', async () => {
      const pdfResult = {
        pdf: Buffer.from('PDF content'),
        metadata: { renderTime: 200 },
      };

      mockRenderer.render.mockResolvedValue(pdfResult);

      const result = await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'pdf',
        }
      );

      expect(result).toEqual(pdfResult);
      expect(mockRenderer.render).toHaveBeenCalledWith(
        mockTemplate,
        { lesson: mockLessonData },
        'pdf'
      );
    });

    it('should apply user customizations', async () => {
      const customTemplate = {
        ...mockTemplate,
        userCustomizations: {
          css: '.title { color: blue; }',
          headerText: 'My School Name',
        },
      };

      mockRegistry.getTemplate.mockResolvedValue(customTemplate);

      await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'html',
          options: { applyUserStyles: true },
        }
      );

      expect(mockRenderer.render).toHaveBeenCalledWith(
        customTemplate,
        { lesson: mockLessonData },
        'html'
      );
    });
  });

  describe('bulkRender', () => {
    it('should render multiple templates in batch', async () => {
      const renderRequests = [
        {
          templateType: 'lesson' as const,
          templateId: 'lesson-standard',
          data: { lesson: mockLessonData },
          format: 'html' as const,
        },
        {
          templateType: 'unit' as const,
          templateId: 'unit-overview',
          data: { unit: { title: 'Unit 1', description: 'First unit' } },
          format: 'html' as const,
        },
      ];

      mockRenderer.render
        .mockResolvedValueOnce({ html: '<h1>Lesson</h1>', metadata: {} })
        .mockResolvedValueOnce({ html: '<h1>Unit</h1>', metadata: {} });

      const results = await orchestrator.bulkRender(
        { userId: mockUserId },
        { requests: renderRequests }
      );

      expect(results).toHaveLength(2);
      expect(results[0].html).toBe('<h1>Lesson</h1>');
      expect(results[1].html).toBe('<h1>Unit</h1>');
    });

    it('should handle partial failures in bulk render', async () => {
      const renderRequests = [
        {
          templateType: 'lesson' as const,
          templateId: 'lesson-standard',
          data: { lesson: mockLessonData },
          format: 'html' as const,
        },
        {
          templateType: 'unit' as const,
          templateId: 'invalid-template',
          data: { unit: {} },
          format: 'html' as const,
        },
      ];

      mockRenderer.render.mockResolvedValueOnce({ html: '<h1>Lesson</h1>', metadata: {} });
      mockRegistry.getTemplate
        .mockResolvedValueOnce(mockTemplate)
        .mockRejectedValueOnce(new Error('Template not found'));

      const results = await orchestrator.bulkRender(
        { userId: mockUserId },
        { requests: renderRequests, continueOnError: true }
      );

      expect(results).toHaveLength(2);
      expect(results[0].html).toBe('<h1>Lesson</h1>');
      expect(results[1].error).toBe('Template not found');
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const newTemplate = {
        name: 'Custom Lesson Template',
        type: 'lesson' as const,
        content: '<h1>{{title}}</h1><div>{{content}}</div>',
        schema: {
          title: { type: 'string', required: true },
          content: { type: 'string' },
        },
      };

      mockValidator.validateTemplate.mockResolvedValue({ isValid: true, errors: [] });
      mockRegistry.createTemplate.mockResolvedValue({
        id: 'custom-lesson-1',
        ...newTemplate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await orchestrator.createTemplate(
        { userId: mockUserId },
        newTemplate
      );

      expect(result).toMatchObject({
        id: 'custom-lesson-1',
        name: 'Custom Lesson Template',
        type: 'lesson',
      });

      expect(mockValidator.validateTemplate).toHaveBeenCalledWith(newTemplate);
      expect(mockRegistry.createTemplate).toHaveBeenCalledWith(newTemplate, mockUserId);
    });

    it('should reject invalid template creation', async () => {
      const invalidTemplate = {
        name: '',
        type: 'lesson' as const,
        content: '<h1>{{title}</h1>', // Missing closing tag
        schema: {},
      };

      mockValidator.validateTemplate.mockResolvedValue({
        isValid: false,
        errors: ['Name is required', 'Invalid HTML structure'],
      });

      await expect(
        orchestrator.createTemplate({ userId: mockUserId }, invalidTemplate)
      ).rejects.toThrow('Template validation failed');
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', async () => {
      const updates = {
        name: 'Updated Lesson Template',
        content: '<h1>{{title}}</h1><p>{{description}}</p><footer>{{footer}}</footer>',
      };

      mockRegistry.getTemplate.mockResolvedValue(mockTemplate);
      mockValidator.validateTemplate.mockResolvedValue({ isValid: true, errors: [] });
      mockRegistry.updateTemplate.mockResolvedValue({
        ...mockTemplate,
        ...updates,
        updatedAt: new Date(),
      });

      const result = await orchestrator.updateTemplate(
        { userId: mockUserId },
        { templateId: mockTemplateId, templateType: 'lesson', updates }
      );

      expect(result.name).toBe('Updated Lesson Template');
      expect(mockCache.invalidate).toHaveBeenCalledWith(expect.stringContaining(mockTemplateId));
    });

    it('should prevent updating system templates', async () => {
      const systemTemplate = {
        ...mockTemplate,
        metadata: { ...mockTemplate.metadata, isSystem: true },
      };

      mockRegistry.getTemplate.mockResolvedValue(systemTemplate);

      await expect(
        orchestrator.updateTemplate(
          { userId: mockUserId },
          { templateId: mockTemplateId, templateType: 'lesson', updates: {} }
        )
      ).rejects.toThrow('Cannot modify system template');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a user template', async () => {
      const userTemplate = {
        ...mockTemplate,
        userId: mockUserId,
        metadata: { ...mockTemplate.metadata, isSystem: false },
      };

      mockRegistry.getTemplate.mockResolvedValue(userTemplate);
      mockRegistry.deleteTemplate.mockResolvedValue(true);

      const result = await orchestrator.deleteTemplate(
        { userId: mockUserId },
        { templateId: mockTemplateId, templateType: 'lesson' }
      );

      expect(result).toBe(true);
      expect(mockRegistry.deleteTemplate).toHaveBeenCalledWith('lesson', mockTemplateId);
      expect(mockCache.invalidate).toHaveBeenCalled();
    });

    it('should prevent deleting templates owned by other users', async () => {
      const otherUserTemplate = {
        ...mockTemplate,
        userId: 999, // Different user
      };

      mockRegistry.getTemplate.mockResolvedValue(otherUserTemplate);

      await expect(
        orchestrator.deleteTemplate(
          { userId: mockUserId },
          { templateId: mockTemplateId, templateType: 'lesson' }
        )
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('listTemplates', () => {
    it('should list available templates with filtering', async () => {
      const templates = [
        { ...mockTemplate, id: 'lesson-1', type: 'lesson' },
        { ...mockTemplate, id: 'lesson-2', type: 'lesson' },
        { ...mockTemplate, id: 'unit-1', type: 'unit' },
      ];

      mockRegistry.listTemplates.mockResolvedValue(templates);

      const result = await orchestrator.listTemplates(
        { userId: mockUserId },
        { type: 'lesson' }
      );

      expect(result).toHaveLength(2);
      expect(result.every(t => t.type === 'lesson')).toBe(true);
    });

    it('should include user templates and system templates', async () => {
      const templates = [
        { ...mockTemplate, id: 'system-1', userId: null, metadata: { isSystem: true } },
        { ...mockTemplate, id: 'user-1', userId: mockUserId, metadata: { isSystem: false } },
      ];

      mockRegistry.listTemplates.mockResolvedValue(templates);

      const result = await orchestrator.listTemplates(
        { userId: mockUserId },
        {}
      );

      expect(result).toHaveLength(2);
      expect(result.some(t => t.metadata.isSystem)).toBe(true);
      expect(result.some(t => !t.metadata.isSystem)).toBe(true);
    });
  });

  describe('exportTemplate', () => {
    it('should export template in different formats', async () => {
      mockRegistry.getTemplate.mockResolvedValue(mockTemplate);
      mockExporter.export.mockResolvedValue({
        content: JSON.stringify(mockTemplate, null, 2),
        mimeType: 'application/json',
        filename: 'lesson-standard.json',
      });

      const result = await orchestrator.exportTemplate(
        { userId: mockUserId },
        { templateId: mockTemplateId, templateType: 'lesson', format: 'json' }
      );

      expect(result).toMatchObject({
        mimeType: 'application/json',
        filename: 'lesson-standard.json',
      });

      expect(mockExporter.export).toHaveBeenCalledWith(mockTemplate, 'json');
    });
  });

  describe('importTemplate', () => {
    it('should import template from file', async () => {
      const importData = {
        name: 'Imported Template',
        type: 'lesson',
        content: '<h1>{{title}}</h1>',
        schema: { title: { type: 'string' } },
      };

      mockValidator.validateTemplate.mockResolvedValue({ isValid: true, errors: [] });
      mockRegistry.createTemplate.mockResolvedValue({
        id: 'imported-1',
        ...importData,
        userId: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await orchestrator.importTemplate(
        { userId: mockUserId },
        { data: importData }
      );

      expect(result).toMatchObject({
        id: 'imported-1',
        name: 'Imported Template',
      });
    });

    it('should validate imported template', async () => {
      const invalidImport = {
        // Missing required fields
        content: '<h1>Invalid</h1>',
      };

      mockValidator.validateTemplate.mockResolvedValue({
        isValid: false,
        errors: ['Missing required field: name', 'Missing required field: type'],
      });

      await expect(
        orchestrator.importTemplate({ userId: mockUserId }, { data: invalidImport })
      ).rejects.toThrow('Import validation failed');
    });
  });

  describe('getTemplateMetrics', () => {
    it('should return template usage metrics', async () => {
      const metrics = {
        templateId: mockTemplateId,
        totalRenders: 150,
        uniqueUsers: 25,
        averageRenderTime: 120,
        cacheHitRate: 0.75,
        lastUsed: new Date(),
        popularData: [
          { field: 'grade', value: '5', count: 45 },
          { field: 'subject', value: 'Mathematics', count: 38 },
        ],
      };

      mockMetrics.getTemplateMetrics.mockResolvedValue(metrics);

      const result = await orchestrator.getTemplateMetrics(
        { userId: mockUserId },
        { templateId: mockTemplateId, templateType: 'lesson' }
      );

      expect(result).toEqual(metrics);
      expect(mockMetrics.getTemplateMetrics).toHaveBeenCalledWith('lesson', mockTemplateId);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent render requests efficiently', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => ({
        templateType: 'lesson' as const,
        templateId: mockTemplateId,
        data: { lesson: { ...mockLessonData, title: `Lesson ${i}` } },
        format: 'html' as const,
      }));

      const renderPromises = concurrentRequests.map(req =>
        orchestrator.render({ userId: mockUserId }, req)
      );

      const results = await Promise.all(renderPromises);

      expect(results).toHaveLength(10);
      expect(mockRenderer.render).toHaveBeenCalledTimes(10);
    });

    it('should use cache effectively for repeated renders', async () => {
      // First render - cache miss
      await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'html',
        }
      );

      // Set up cache hit for subsequent calls
      mockCache.get.mockResolvedValue({
        html: '<h1>Cached</h1>',
        metadata: { cached: true },
      });

      // Repeated renders with same data
      for (let i = 0; i < 5; i++) {
        await orchestrator.render(
          { userId: mockUserId },
          {
            templateType: 'lesson',
            templateId: mockTemplateId,
            data: { lesson: mockLessonData },
            format: 'html',
          }
        );
      }

      // Should only render once (first call)
      expect(mockRenderer.render).toHaveBeenCalledTimes(1);
      expect(mockCache.get).toHaveBeenCalledTimes(5); // Subsequent calls hit cache
    });
  });

  describe('Error Recovery', () => {
    it('should handle render failures gracefully', async () => {
      mockRenderer.render.mockRejectedValue(new Error('Render engine error'));

      await expect(
        orchestrator.render(
          { userId: mockUserId },
          {
            templateType: 'lesson',
            templateId: mockTemplateId,
            data: { lesson: mockLessonData },
            format: 'html',
          }
        )
      ).rejects.toThrow('Render engine error');

      // Should not cache failed renders
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(mockMetrics.recordError).toHaveBeenCalled();
    });

    it('should continue on cache errors', async () => {
      mockCache.get.mockRejectedValue(new Error('Cache unavailable'));

      const result = await orchestrator.render(
        { userId: mockUserId },
        {
          templateType: 'lesson',
          templateId: mockTemplateId,
          data: { lesson: mockLessonData },
          format: 'html',
        }
      );

      // Should still render successfully
      expect(result.html).toBe('<h1>Introduction to Fractions</h1>');
      expect(mockRenderer.render).toHaveBeenCalled();
    });
  });
});