/**
 * Advanced XSS Protection Simple Test Suite
 * Focused on core security functionality rather than complex edge cases
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  sanitizeHtmlAdvanced,
  sanitizeEmailAdvanced,
  sanitizeUrlAdvanced,
  sanitizeCssContent,
  detectXssAttempt,
  unicodeNormalization,
} from '../../src/middleware/advancedXssProtection';

// Logger is mocked globally, no need to mock here

describe('Advanced XSS Protection Core Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('XSS Detection', () => {
    it('should detect basic XSS patterns', () => {
      expect(detectXssAttempt('<script>alert("XSS")</script>')).toBe(true);
      expect(detectXssAttempt('<svg onload=alert("XSS")>')).toBe(true);
      expect(detectXssAttempt('javascript:alert("XSS")')).toBe(true);
      expect(detectXssAttempt('<iframe src="javascript:alert(1)"></iframe>')).toBe(true);

      // Safe content should not be detected as XSS
      expect(detectXssAttempt('Hello world')).toBe(false);
      expect(detectXssAttempt('<p>Safe content</p>')).toBe(false);
      expect(detectXssAttempt('https://example.com')).toBe(false);
    });

    it('should detect Unicode-obfuscated XSS', () => {
      expect(detectXssAttempt('java\u0130script:alert(1)')).toBe(true);
      expect(detectXssAttempt('j\u0430v\u0430script:alert(1)')).toBe(true);
    });

    it('should detect HTML entity encoded XSS', () => {
      // After normalization, this should be detected
      const encoded =
        '&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;&#x61;&#x6C;&#x65;&#x72;&#x74;&#x28;&#x31;&#x29;';
      expect(detectXssAttempt(encoded)).toBe(true);
    });
  });

  describe('HTML Sanitization', () => {
    it('should remove dangerous script tags', () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeHtmlAdvanced(input, 'strict');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert(');
    });

    it('should remove dangerous SVG elements', () => {
      const input = '<svg onload=alert("XSS")>';
      const result = sanitizeHtmlAdvanced(input, 'strict');
      expect(result).not.toContain('<svg');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('alert(');
    });

    it('should preserve safe HTML in moderate mode', () => {
      const input = '<p>This is <strong>safe</strong> content</p>';
      const result = sanitizeHtmlAdvanced(input, 'moderate');
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('safe');
      expect(result).toContain('content');
    });

    it('should remove dangerous attributes while preserving content', () => {
      const input = '<p onclick="alert(\\"XSS\\")">Safe content here</p>';
      const result = sanitizeHtmlAdvanced(input, 'moderate');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert(');
      expect(result).toContain('Safe content here');
    });

    it('should handle text-only mode', () => {
      const input = '<p>Text <strong>content</strong> only</p>';
      const result = sanitizeHtmlAdvanced(input, 'text');
      expect(result).not.toContain('<p>');
      expect(result).not.toContain('<strong>');
      expect(result).toContain('Text content only');
    });
  });

  describe('CSS Sanitization', () => {
    it('should remove dangerous CSS expressions', () => {
      const input = 'body { background: url(javascript:alert("XSS")); }';
      const result = sanitizeCssContent(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert(');
    });

    it('should remove CSS imports with dangerous URLs', () => {
      const input = '@import "javascript:alert(\\"XSS\\")"';
      const result = sanitizeCssContent(input);
      expect(result).not.toContain('@import');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert(');
    });

    it('should remove IE expression() calls', () => {
      const input = 'color: expression(alert("XSS"))';
      const result = sanitizeCssContent(input);
      expect(result).not.toContain('expression(');
      expect(result).not.toContain('alert(');
    });

    it('should preserve safe CSS', () => {
      const input = 'color: red; font-size: 14px;';
      const result = sanitizeCssContent(input);
      expect(result).toContain('color:');
      expect(result).toContain('red');
      expect(result).toContain('font-size:');
      expect(result).toContain('14px');
    });
  });

  describe('URL Sanitization', () => {
    it('should block dangerous JavaScript URLs', () => {
      expect(sanitizeUrlAdvanced('javascript:alert("XSS")')).toBe('');
      expect(sanitizeUrlAdvanced('vbscript:msgbox("XSS")')).toBe('');
      expect(sanitizeUrlAdvanced('data:text/html,<script>alert("XSS")</script>')).toBe('');
    });

    it('should allow safe URLs', () => {
      const safeUrls = [
        'https://example.com',
        'http://localhost:3000',
        'mailto:user@example.com',
        'tel:+1234567890',
      ];

      for (const url of safeUrls) {
        expect(sanitizeUrlAdvanced(url)).toBe(url);
      }
    });

    it('should allow safe data URIs', () => {
      const safeDataUris = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        'data:text/plain;charset=utf-8,Hello%20World',
      ];

      for (const uri of safeDataUris) {
        expect(sanitizeUrlAdvanced(uri)).toBe(uri);
      }
    });

    it('should block dangerous data URIs', () => {
      const dangerousUris = [
        'data:text/html,<script>alert("XSS")</script>',
        'data:image/svg+xml,<svg onload=alert("XSS")>',
      ];

      for (const uri of dangerousUris) {
        expect(sanitizeUrlAdvanced(uri)).toBe('');
      }
    });
  });

  describe('Email Sanitization', () => {
    it('should sanitize email addresses', () => {
      const testCases = [
        { input: 'USER@EXAMPLE.COM', expected: 'user@example.com' },
        { input: '  user@example.com  ', expected: 'user@example.com' },
        { input: 'user+tag@example.com', expected: 'user+tag@example.com' },
      ];

      for (const testCase of testCases) {
        const result = sanitizeEmailAdvanced(testCase.input);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should remove dangerous content from emails', () => {
      const maliciousEmails = [
        'user<script>@example.com',
        'user"@example.com',
        "user'@example.com",
      ];

      for (const email of maliciousEmails) {
        const result = sanitizeEmailAdvanced(email);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('"');
        expect(result).not.toContain("'");
      }
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        'user@',
        '@example.com',
        'user..double.dot@example.com',
      ];

      for (const email of invalidEmails) {
        const result = sanitizeEmailAdvanced(email);
        expect(result).toBe('');
      }
    });
  });

  describe('Unicode Normalization', () => {
    it('should normalize Turkish characters', () => {
      const input = 'java\u0130script:alert(1)'; // Turkish I with dot
      const result = unicodeNormalization(input);
      expect(result).not.toContain('\u0130');
      expect(result).toContain('i'); // Should be normalized to lowercase i
    });

    it('should normalize Cyrillic look-alikes', () => {
      const input = 'j\u0430v\u0430script:alert(1)'; // Cyrillic a characters
      const result = unicodeNormalization(input);
      expect(result).not.toContain('\u0430');
      expect(result).toContain('a'); // Should be normalized to Latin
    });

    it('should decode HTML entities', () => {
      const input = '&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;'; // "javascript:"
      const result = unicodeNormalization(input);
      expect(result).toContain('javascript:');
    });

    it('should handle nested encoding safely', () => {
      const input = '&amp;lt;script&amp;gt;';
      const result = unicodeNormalization(input);
      // Note: nested encoding like &amp;lt; should only decode one level for security
      expect(result).toContain('&lt;script&gt;'); // Should decode &amp; but not &lt;
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty and null inputs gracefully', () => {
      expect(sanitizeHtmlAdvanced('', 'strict')).toBe('');
      expect(sanitizeUrlAdvanced('')).toBe('');
      expect(sanitizeEmailAdvanced('')).toBe('');
      expect(sanitizeCssContent('')).toBe('');
      expect(detectXssAttempt('')).toBe(false);
    });

    it('should handle very long inputs efficiently', () => {
      const longInput = 'a'.repeat(10000) + '<script>alert("XSS")</script>' + 'b'.repeat(10000);

      const startTime = Date.now();
      const result = sanitizeHtmlAdvanced(longInput, 'strict');
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert(');
    });

    it('should handle circular references in objects', () => {
      // This is handled at the middleware level, just ensure functions don't crash
      expect(() => {
        sanitizeHtmlAdvanced('test', 'strict');
        sanitizeUrlAdvanced('https://example.com');
        sanitizeEmailAdvanced('user@example.com');
        sanitizeCssContent('color: red;');
      }).not.toThrow();
    });
  });

  describe('Real-world Attack Vectors', () => {
    it('should block modern XSS techniques', () => {
      const modernAttacks = [
        // Template literals
        '${alert("XSS")}',
        '{{alert("XSS")}}',

        // Event handlers
        'onmouseover=alert("XSS")',
        'onfocus=alert("XSS")',

        // SVG animations
        '<svg><animate attributeName=href values=javascript:alert(1)></animate>',

        // Math ML
        '<math href="javascript:alert(1)">CLICKME</math>',

        // CSS expression
        'expression(alert("XSS"))',

        // DOM clobbering
        '<img name="submit" src="x">',

        // Base64 encoded
        '<script>alert(atob("WFNTCg=="))</script>',
      ];

      for (const attack of modernAttacks) {
        const htmlResult = sanitizeHtmlAdvanced(attack, 'strict');
        const cssResult = sanitizeCssContent(attack);
        const urlResult = sanitizeUrlAdvanced(attack);

        // Results should either be empty or not contain dangerous patterns
        if (htmlResult) {
          expect(htmlResult).not.toContain('javascript:');
        }
        if (cssResult) {
          expect(cssResult).not.toContain('javascript:');
        }
        if (urlResult) {
          expect(urlResult).not.toContain('javascript:');
        }

        // Should be detected as XSS attempt
        expect(detectXssAttempt(attack)).toBe(true);
      }
    });

    it('should handle mixed content appropriately', () => {
      // Test with content that has both safe and dangerous parts
      const mixedInput = 'Safe content <script>alert("XSS")</script> more safe content';
      const result = sanitizeHtmlAdvanced(mixedInput, 'text');

      expect(result).toContain('Safe content');
      expect(result).toContain('more safe content');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert(');
    });
  });
});
