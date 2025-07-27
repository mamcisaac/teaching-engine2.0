/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Lesson Template Provider Test Suite
 */

import { LessonTemplateProvider } from '../LessonTemplateProvider';
import { TemplateContext } from '../TemplateProvider';

describe('LessonTemplateProvider', () => {
  let provider: LessonTemplateProvider;

  beforeEach(() => {
    provider = new LessonTemplateProvider();
  });

  describe('Template Selection', () => {
    it('should get standard template by default', async () => {
      const context: TemplateContext = {
        userId: 1,
      };

      const template = await provider.getTemplate(context);

      expect(template).toBeDefined();
      expect(template.id).toBe('lesson-standard');
      expect(template.name).toBe('Standard Lesson Plan');
      expect(template.engine).toBe('handlebars');
      expect(template.format).toBe('html');
    });

    it('should get detailed template when requested', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: {
          type: 'detailed',
        },
      };

      const template = await provider.getTemplate(context);

      expect(template.id).toBe('lesson-detailed');
      expect(template.name).toBe('Detailed Lesson Plan');
    });

    it('should get quick template when requested', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: {
          type: 'quick',
        },
      };

      const template = await provider.getTemplate(context);

      expect(template.id).toBe('lesson-quick');
      expect(template.name).toBe('Quick Lesson Plan');
    });

    it('should build template ID based on parameters', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: {
          type: 'standard',
          grade: 3,
          subject: 'Mathematics',
        },
      };

      // Should try specific template first, then fall back
      const template = await provider.getTemplate(context);
      expect(template).toBeDefined();
    });

    it('should fall back to standard template for unknown types', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: {
          type: 'unknown-type',
        },
      };

      const template = await provider.getTemplate(context);
      expect(template.id).toBe('lesson-standard');
    });
  });

  describe('Template Content', () => {
    it('should have valid handlebars template content', async () => {
      const templates = await provider.listTemplates();

      for (const template of templates) {
        expect(template.content).toBeDefined();
        expect(template.content.length).toBeGreaterThan(0);
        
        // Check for basic handlebars syntax
        expect(template.content).toMatch(/\{\{[^}]+\}\}/);
      }
    });

    it('should include required variables in templates', async () => {
      const context: TemplateContext = { userId: 1 };
      const standardTemplate = await provider.getTemplate(context);

      // Check for expected variables
      expect(standardTemplate.content).toContain('{{lesson.title}}');
      expect(standardTemplate.content).toContain('{{formatDate lesson.date}}');
      expect(standardTemplate.content).toContain('{{user.name}}');
    });

    it('should have appropriate styles in HTML templates', async () => {
      const context: TemplateContext = { userId: 1 };
      const template = await provider.getTemplate(context);

      if (template.format === 'html') {
        expect(template.content).toContain('<style>');
        expect(template.content).toContain('</style>');
      }
    });
  });

  describe('Data Requirements', () => {
    it('should define data requirements for templates', async () => {
      const templates = await provider.listTemplates();

      for (const template of templates) {
        expect(template.dataRequirements).toBeDefined();
        expect(Array.isArray(template.dataRequirements)).toBe(true);
        
        // Should at least require lesson and user data
        const requirementKeys = template.dataRequirements.map(r => r.key);
        expect(requirementKeys).toContain('lesson');
        expect(requirementKeys).toContain('user');
      }
    });

    it('should have different requirements for different template types', async () => {
      const standardContext: TemplateContext = {
        userId: 1,
        parameters: { type: 'standard' },
      };
      const detailedContext: TemplateContext = {
        userId: 1,
        parameters: { type: 'detailed' },
      };

      const standardTemplate = await provider.getTemplate(standardContext);
      const detailedTemplate = await provider.getTemplate(detailedContext);

      // Detailed template should have more requirements
      expect(detailedTemplate.dataRequirements.length).toBeGreaterThanOrEqual(
        standardTemplate.dataRequirements.length
      );
    });

    it('should mark essential requirements as required', async () => {
      const context: TemplateContext = { userId: 1 };
      const template = await provider.getTemplate(context);

      const lessonReq = template.dataRequirements.find(r => r.key === 'lesson');
      const userReq = template.dataRequirements.find(r => r.key === 'user');

      expect(lessonReq?.required).toBe(true);
      expect(userReq?.required).toBe(true);
    });
  });

  describe('Template Listing', () => {
    it('should list all available templates', async () => {
      const templates = await provider.listTemplates();

      expect(templates.length).toBeGreaterThanOrEqual(3);
      
      const templateIds = templates.map(t => t.id);
      expect(templateIds).toContain('lesson-standard');
      expect(templateIds).toContain('lesson-detailed');
      expect(templateIds).toContain('lesson-quick');
    });

    it('should include metadata for all templates', async () => {
      const templates = await provider.listTemplates();

      for (const template of templates) {
        expect(template.metadata).toBeDefined();
        expect(template.metadata?.tags).toBeDefined();
        expect(Array.isArray(template.metadata?.tags)).toBe(true);
        expect(template.metadata?.version).toBeDefined();
      }
    });
  });

  describe('Context Validation', () => {
    it('should validate context requires userId', () => {
      const validContext: TemplateContext = { userId: 1 };
      const invalidContext: TemplateContext = { userId: 0 };

      expect(provider.validateContext(validContext)).toBe(true);
      expect(provider.validateContext(invalidContext)).toBe(false);
    });
  });

  describe('Template Variables', () => {
    it('should extract variables from template content', () => {
      const content = '{{lesson.title}} - {{user.name}} - {{formatDate lesson.date}}';
      const variables = provider['extractVariables'](content);

      expect(variables).toContain('lesson.title');
      expect(variables).toContain('user.name');
      expect(variables).toContain('formatDate lesson.date');
    });

    it('should not duplicate variables', () => {
      const content = '{{user.name}} teaches {{lesson.title}}. {{user.name}} is great!';
      const variables = provider['extractVariables'](content);

      const userNameCount = variables.filter(v => v === 'user.name').length;
      expect(userNameCount).toBe(1);
    });
  });

  describe('Template Structure', () => {
    it('should have three-part lesson structure in standard template', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: { type: 'standard' },
      };
      const template = await provider.getTemplate(context);

      expect(template.content).toContain('Minds On');
      expect(template.content).toContain('Action');
      expect(template.content).toContain('Consolidation');
    });

    it('should include assessment in detailed template', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: { type: 'detailed' },
      };
      const template = await provider.getTemplate(context);

      expect(template.content).toContain('Assessment FOR Learning');
      expect(template.content).toContain('Assessment AS Learning');
      expect(template.content).toContain('Assessment OF Learning');
    });

    it('should have simplified structure in quick template', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: { type: 'quick' },
      };
      const template = await provider.getTemplate(context);

      // Quick template should be shorter
      expect(template.content.length).toBeLessThan(2000);
      // But still have basic structure
      expect(template.content).toContain('Learning Goal');
      expect(template.content).toContain('Materials');
    });
  });

  describe('Template Features', () => {
    it('should support curriculum expectations in templates', async () => {
      const templates = await provider.listTemplates();

      for (const template of templates) {
        if (template.id !== 'lesson-quick') {
          expect(template.content).toContain('expectations');
          
          const hasExpectationsRequirement = template.dataRequirements.some(
            r => r.key === 'expectations'
          );
          expect(hasExpectationsRequirement).toBe(true);
        }
      }
    });

    it('should support differentiation in detailed template', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: { type: 'detailed' },
      };
      const template = await provider.getTemplate(context);

      expect(template.content).toContain('differentiation');
      expect(template.content).toContain('IEP');
      expect(template.content).toContain('ELL');
    });

    it('should include reflection section in detailed template', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: { type: 'detailed' },
      };
      const template = await provider.getTemplate(context);

      expect(template.content).toContain('Reflection');
      expect(template.content).toContain('Next Steps');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when no template found', async () => {
      // Mock provider that can't find any templates
      const emptyProvider = new LessonTemplateProvider();
      emptyProvider['templates'].clear();

      const context: TemplateContext = { userId: 1 };

      await expect(emptyProvider.getTemplate(context)).rejects.toThrow(
        'No lesson template found'
      );
    });
  });

  describe('Template Customization', () => {
    it('should support grade-specific templates', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: {
          type: 'standard',
          grade: 1,
        },
      };

      // Should attempt to find grade-specific template
      const template = await provider.getTemplate(context);
      expect(template).toBeDefined();
    });

    it('should support subject-specific templates', async () => {
      const context: TemplateContext = {
        userId: 1,
        parameters: {
          type: 'standard',
          subject: 'mathematics',
        },
      };

      // Should attempt to find subject-specific template
      const template = await provider.getTemplate(context);
      expect(template).toBeDefined();
    });
  });
});