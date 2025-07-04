/**
 * Handlebars Engine Test Suite
 */

import { HandlebarsEngine } from '../HandlebarsEngine';
import { Template } from '../../providers/TemplateProvider';
import { RenderContext } from '../RenderEngine';

describe('HandlebarsEngine', () => {
  let engine: HandlebarsEngine;

  beforeEach(() => {
    engine = new HandlebarsEngine();
  });

  describe('Basic Rendering', () => {
    it('should render simple template', async () => {
      const template: Template = {
        id: 'test-1',
        name: 'Test Template',
        engine: 'handlebars',
        format: 'html',
        content: '<h1>Hello {{name}}!</h1>',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { name: 'World' },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('<h1>Hello World!</h1>');
      expect(result.format).toBe('html');
      expect(result.metadata?.engine).toBe('handlebars');
      expect(result.metadata?.renderTime).toBeGreaterThan(0);
    });

    it('should handle nested data', async () => {
      const template: Template = {
        id: 'test-2',
        name: 'Nested Template',
        engine: 'handlebars',
        format: 'html',
        content: '<p>{{user.name}} - {{user.email}}</p>',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: {
          user: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('<p>John Doe - john@example.com</p>');
    });

    it('should handle arrays with each helper', async () => {
      const template: Template = {
        id: 'test-3',
        name: 'Array Template',
        engine: 'handlebars',
        format: 'html',
        content: '<ul>{{#each items}}<li>{{this}}</li>{{/each}}</ul>',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: {
          items: ['Apple', 'Banana', 'Cherry'],
        },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('<ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>');
    });
  });

  describe('Built-in Helpers', () => {
    it('should format dates with formatDate helper', async () => {
      const template: Template = {
        id: 'test-date',
        name: 'Date Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{formatDate date}} | {{formatDate date "short"}} | {{formatDate date "long"}}',
        dataRequirements: [],
      };

      const testDate = new Date('2024-01-15');
      const context: RenderContext = {
        data: { date: testDate },
      };

      const result = await engine.render(template, context);

      expect(result.content).toContain('January 15, 2024');
      expect(result.content).toContain('1/15/2024');
      expect(result.content).toContain('Monday');
    });

    it('should format times with formatTime helper', async () => {
      const template: Template = {
        id: 'test-time',
        name: 'Time Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{formatTime date}}',
        dataRequirements: [],
      };

      const testDate = new Date('2024-01-15T14:30:00');
      const context: RenderContext = {
        data: { date: testDate },
      };

      const result = await engine.render(template, context);

      expect(result.content).toMatch(/2:30\s*PM/);
    });

    it('should handle "now" special date value', async () => {
      const template: Template = {
        id: 'test-now',
        name: 'Now Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{formatDate "now"}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: {},
      };

      const result = await engine.render(template, context);

      // Should contain current year
      expect(result.content).toContain(new Date().getFullYear().toString());
    });

    it('should format numbers with formatNumber helper', async () => {
      const template: Template = {
        id: 'test-number',
        name: 'Number Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{formatNumber value}} | {{formatNumber value 2}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { value: 123.456 },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('123 | 123.46');
    });

    it('should format percentages with formatPercent helper', async () => {
      const template: Template = {
        id: 'test-percent',
        name: 'Percent Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{formatPercent value}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { value: 85.7 },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('86%');
    });
  });

  describe('Conditional Helpers', () => {
    it('should handle equality comparisons', async () => {
      const template: Template = {
        id: 'test-eq',
        name: 'Equality Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{#if (eq status "active")}}Active{{else}}Inactive{{/if}}',
        dataRequirements: [],
      };

      const activeResult = await engine.render(template, {
        data: { status: 'active' },
      });
      expect(activeResult.content).toBe('Active');

      const inactiveResult = await engine.render(template, {
        data: { status: 'inactive' },
      });
      expect(inactiveResult.content).toBe('Inactive');
    });

    it('should handle comparison operators', async () => {
      const template: Template = {
        id: 'test-compare',
        name: 'Comparison Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{#if (gt score 80)}}A{{else if (gte score 70)}}B{{else}}C{{/if}}',
        dataRequirements: [],
      };

      const gradeA = await engine.render(template, { data: { score: 85 } });
      expect(gradeA.content).toBe('A');

      const gradeB = await engine.render(template, { data: { score: 75 } });
      expect(gradeB.content).toBe('B');

      const gradeC = await engine.render(template, { data: { score: 65 } });
      expect(gradeC.content).toBe('C');
    });
  });

  describe('String Helpers', () => {
    it('should handle string transformations', async () => {
      const template: Template = {
        id: 'test-string',
        name: 'String Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{uppercase text}} | {{lowercase text}} | {{capitalize text}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { text: 'heLLo WoRLd' },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('HELLO WORLD | hello world | HeLLo WoRLd');
    });

    it('should truncate strings', async () => {
      const template: Template = {
        id: 'test-truncate',
        name: 'Truncate Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{truncate text 10}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { text: 'This is a very long text that should be truncated' },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('This is a ...');
    });
  });

  describe('Array Helpers', () => {
    it('should get array length', async () => {
      const template: Template = {
        id: 'test-length',
        name: 'Length Template',
        engine: 'handlebars',
        format: 'html',
        content: 'Total: {{length items}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { items: [1, 2, 3, 4, 5] },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('Total: 5');
    });

    it('should join array elements', async () => {
      const template: Template = {
        id: 'test-join',
        name: 'Join Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{join tags ", "}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { tags: ['math', 'science', 'english'] },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('math, science, english');
    });
  });

  describe('Math Helpers', () => {
    it('should perform math operations', async () => {
      const template: Template = {
        id: 'test-math',
        name: 'Math Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{add a b}} | {{subtract a b}} | {{multiply a b}} | {{divide a b}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { a: 10, b: 3 },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('13 | 7 | 30 | 3.3333333333333335');
    });

    it('should handle division by zero', async () => {
      const template: Template = {
        id: 'test-divide-zero',
        name: 'Divide Zero Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{divide a b}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { a: 10, b: 0 },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('0');
    });
  });

  describe('Utility Helpers', () => {
    it('should provide default values', async () => {
      const template: Template = {
        id: 'test-default',
        name: 'Default Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{default value "No value"}}',
        dataRequirements: [],
      };

      const withValue = await engine.render(template, { data: { value: 'Hello' } });
      expect(withValue.content).toBe('Hello');

      const withoutValue = await engine.render(template, { data: {} });
      expect(withoutValue.content).toBe('No value');
    });

    it('should pluralize words', async () => {
      const template: Template = {
        id: 'test-pluralize',
        name: 'Pluralize Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{count}} {{pluralize count "item" "items"}}',
        dataRequirements: [],
      };

      const single = await engine.render(template, { data: { count: 1 } });
      expect(single.content).toBe('1 item');

      const multiple = await engine.render(template, { data: { count: 5 } });
      expect(multiple.content).toBe('5 items');
    });

    it('should increment values', async () => {
      const template: Template = {
        id: 'test-inc',
        name: 'Increment Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{#each items}}{{inc @index}}. {{this}} {{/each}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { items: ['First', 'Second', 'Third'] },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('1. First 2. Second 3. Third ');
    });
  });

  describe('Custom Helpers and Partials', () => {
    it('should register custom helpers', async () => {
      const template: Template = {
        id: 'test-custom',
        name: 'Custom Helper Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{customGreeting name}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { name: 'Alice' },
        helpers: {
          customGreeting: (name: string) => `Welcome, ${name}!`,
        },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('Welcome, Alice!');
    });

    it('should register partials', async () => {
      const template: Template = {
        id: 'test-partial',
        name: 'Partial Template',
        engine: 'handlebars',
        format: 'html',
        content: '{{> header}} <main>Content</main> {{> footer}}',
        dataRequirements: [],
      };

      const context: RenderContext = {
        data: { title: 'My Page' },
        partials: {
          header: '<header>{{title}}</header>',
          footer: '<footer>Copyright 2024</footer>',
        },
      };

      const result = await engine.render(template, context);

      expect(result.content).toBe('<header>My Page</header> <main>Content</main> <footer>Copyright 2024</footer>');
    });
  });

  describe('Validation', () => {
    it('should validate valid templates', async () => {
      const validTemplate: Template = {
        id: 'valid',
        name: 'Valid',
        engine: 'handlebars',
        format: 'html',
        content: '{{#each items}}{{this}}{{/each}}',
        dataRequirements: [],
      };

      const isValid = await engine.validate(validTemplate);
      expect(isValid).toBe(true);
    });

    it('should invalidate templates with syntax errors', async () => {
      const invalidTemplate: Template = {
        id: 'invalid',
        name: 'Invalid',
        engine: 'handlebars',
        format: 'html',
        content: '{{#each items}}{{this}}', // Missing closing tag
        dataRequirements: [],
      };

      const isValid = await engine.validate(invalidTemplate);
      expect(isValid).toBe(false);
    });
  });

  describe('Precompilation', () => {
    it('should precompile templates for performance', async () => {
      const template: Template = {
        id: 'precompile-test',
        name: 'Precompile Test',
        engine: 'handlebars',
        format: 'html',
        content: '{{message}}',
        dataRequirements: [],
      };

      const compiled = await engine.precompile(template);
      expect(compiled).toBeDefined();
      expect(typeof compiled).toBe('function');

      // Should cache the compiled template
      const cachedCompiled = engine['compiledTemplates'].get(template.id);
      expect(cachedCompiled).toBe(compiled);
    });

    it('should use cached compiled templates', async () => {
      const template: Template = {
        id: 'cache-test',
        name: 'Cache Test',
        engine: 'handlebars',
        format: 'html',
        content: '{{value}}',
        dataRequirements: [],
      };

      // First render should compile
      await engine.render(template, { data: { value: 'First' } });
      const compiledCount = engine['compiledTemplates'].size;

      // Second render should use cache
      await engine.render(template, { data: { value: 'Second' } });
      expect(engine['compiledTemplates'].size).toBe(compiledCount);
    });
  });

  describe('Error Handling', () => {
    it('should handle render errors gracefully', async () => {
      const template: Template = {
        id: 'error-test',
        name: 'Error Test',
        engine: 'handlebars',
        format: 'html',
        content: '{{#each}}Invalid each usage{{/each}}',
        dataRequirements: [],
      };

      await expect(engine.render(template, { data: {} })).rejects.toThrow('Handlebars render error');
    });

    it('should handle missing data gracefully', async () => {
      const template: Template = {
        id: 'missing-data',
        name: 'Missing Data',
        engine: 'handlebars',
        format: 'html',
        content: '{{user.name}} - {{user.email}}',
        dataRequirements: [],
      };

      const result = await engine.render(template, { data: {} });
      expect(result.content).toBe(' - ');
    });
  });

  describe('Performance', () => {
    it('should handle large templates efficiently', async () => {
      const largeContent = Array(1000).fill('{{item}}').join(' ');
      const template: Template = {
        id: 'large-template',
        name: 'Large Template',
        engine: 'handlebars',
        format: 'html',
        content: largeContent,
        dataRequirements: [],
      };

      const startTime = Date.now();
      const result = await engine.render(template, { data: { item: 'X' } });
      const renderTime = Date.now() - startTime;

      expect(result.content).toBe(Array(1000).fill('X').join(' '));
      expect(renderTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should clear cache when requested', () => {
      // Add some compiled templates
      engine['compiledTemplates'].set('test1', {} as any);
      engine['compiledTemplates'].set('test2', {} as any);

      expect(engine['compiledTemplates'].size).toBe(2);

      engine.clearCache();

      expect(engine['compiledTemplates'].size).toBe(0);
    });
  });

  describe('Supported Formats', () => {
    it('should report supported formats', () => {
      const formats = engine.getSupportedFormats();

      expect(formats).toContain('html');
      expect(formats).toContain('text');
      expect(formats).toContain('markdown');
      expect(formats).not.toContain('pdf');
    });
  });
});