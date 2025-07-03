import { Request, Response, NextFunction } from 'express';
import { createDOMPurify } from 'isomorphic-dompurify';
import { JSDOM } from 'jsdom';
import logger from '../logger.js';

// Initialize DOMPurify with jsdom for server-side usage
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Window);

/**
 * Advanced XSS Protection Middleware
 * Provides comprehensive protection against sophisticated XSS attacks including:
 * - SVG/MathML XSS
 * - CSS injection
 * - Unicode bypasses
 * - Data URI attacks
 * - Context-aware sanitization
 */

// Enhanced DOMPurify configuration for maximum security
const advancedConfig = {
  // Completely remove these dangerous elements
  FORBID_TAGS: [
    'script',
    'object',
    'embed',
    'applet',
    'meta',
    'link',
    'style',
    'base',
    'iframe',
    'frame',
    'frameset',
    'form',
    'input',
    'button',
    'select',
    'textarea',
    'option',
    'optgroup',
    'video',
    'audio',
    'source',
    'track',
    'svg',
    'math',
    'use',
    'animate',
    'set',
    'foreignobject',
  ],

  // Allow only these safe tags for content
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'sub',
    'sup',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    'table',
    'thead',
    'tbody',
    'tr',
    'td',
    'th',
    'div',
    'span',
  ],

  // Allow only these safe attributes
  ALLOWED_ATTR: ['class', 'id', 'title'],

  // Keep text content when removing dangerous tags
  KEEP_CONTENT: true,

  // Remove unknown tags
  ALLOW_UNKNOWN_PROTOCOLS: false,

  // Sanitize DOM after parsing
  SANITIZE_DOM: true,

  // Additional security options
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  FORCE_BODY: false,

  // Custom allowed URI schemes (very restrictive)
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

// Strict text-only configuration for titles, names, etc.
const textOnlyConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  // Additional security to remove all tags
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

// Moderate configuration for rich content areas
const moderateConfig = {
  ...advancedConfig,
  ALLOWED_ATTR: ['class', 'id', 'title', 'alt', 'style'],
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'code',
    'div',
    'span',
  ],
  // Allow styles but sanitize dangerous CSS
  ALLOW_DATA_ATTR: false,
  SANITIZE_DOM: true,
};

/**
 * Unicode normalization to prevent bypass attacks
 */
export function unicodeNormalization(input: string): string {
  if (typeof input !== 'string') return input;

  try {
    // Normalize Unicode to canonical form
    let normalized = input.normalize('NFC');

    // Handle common Unicode bypasses (more comprehensive)
    const unicodeReplacements = new Map([
      // Turkish/Latin character substitutions
      ['\u0130', 'i'], // Turkish capital I with dot above -> i (for detection)
      ['\u0131', 'i'], // Turkish small dotless i

      // Cyrillic look-alikes
      ['\u0430', 'a'], // Cyrillic small letter a
      ['\u043e', 'o'], // Cyrillic small letter o
      ['\u0440', 'p'], // Cyrillic small letter er
      ['\u0435', 'e'], // Cyrillic small letter ie
      ['\u0455', 's'], // Cyrillic small letter dze
      ['\u0440', 'r'], // Cyrillic small letter er (fix mapping)
      ['\u0441', 'c'], // Cyrillic small letter es
      ['\u0442', 't'], // Cyrillic small letter te

      // Other look-alikes
      ['\u0040', '@'], // Normalize @ symbols
      ['\u2019', "'"], // Right single quotation mark to apostrophe
      ['\u201C', '"'], // Left double quotation mark
      ['\u201D', '"'], // Right double quotation mark
    ]);

    for (const [unicode, replacement] of unicodeReplacements) {
      normalized = normalized.replace(new RegExp(unicode, 'g'), replacement);
    }

    // After normalization, check for dangerous patterns and remove them
    // This ensures that even after Unicode normalization, dangerous patterns are caught
    if (/javascript\s*:/i.test(normalized)) {
      normalized = normalized.replace(/javascript\s*:/gi, '');
    }
    if (/vbscript\s*:/i.test(normalized)) {
      normalized = normalized.replace(/vbscript\s*:/gi, '');
    }

    // Decode HTML entities to prevent double-encoding bypasses
    normalized = normalized
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        try {
          return String.fromCharCode(parseInt(hex, 16));
        } catch {
          return '';
        }
      })
      .replace(/&#(\d+);/g, (_, dec) => {
        try {
          return String.fromCharCode(parseInt(dec, 10));
        } catch {
          return '';
        }
      })
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&'); // Do this last to avoid double-decoding

    return normalized;
  } catch (error) {
    logger.error({ error, input: input.substring(0, 100) }, 'Unicode normalization error');
    return input; // Return original if normalization fails
  }
}

/**
 * Advanced XSS pattern detection
 */
export function detectXssAttempt(input: string): boolean {
  if (typeof input !== 'string') return false;

  // Normalize first to catch Unicode bypasses
  const normalized = unicodeNormalization(input.toLowerCase());

  const xssPatterns = [
    // Script tags and JavaScript (make case insensitive and flexible)
    /<\s*script[\s\S]*?>/i,
    /javascript\s*:/i,
    /java\s*script\s*:/i, // Handle space variations
    /jav\w*script\s*:/i, // Handle typos like "javaiscript"
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /data\s*:\s*application\/x-/i,

    // Event handlers (more comprehensive patterns)
    /\bon\w+\s*=/gi, // Standard event handlers
    /\s+on\w+\s*=/gi, // Event handlers with leading space
    /on\w+\s*:/gi, // Event handlers with colon
    /\bon\w+\s*\(/i,
    /=\s*["']?\s*on\w+/i,

    // SVG attacks
    /<\s*svg[\s\S]*?onload/i,
    /<\s*svg[\s\S]*?href.*javascript/i,
    /<\s*use[\s\S]*?href/i,
    /<\s*animate[\s\S]*?values.*javascript/i,
    /<\s*set[\s\S]*?to.*javascript/i,

    // MathML attacks
    /<\s*math[\s\S]*?href/i,
    /<\s*maction[\s\S]*?xlink:href/i,

    // CSS injections
    /expression\s*\(/i,
    /@import.*javascript/i,
    /behavior\s*:/i,
    /-moz-binding\s*:/i,
    /url\s*\(\s*["']?javascript/i,
    /url\s*\(\s*["']?vbscript/i,
    /url\s*\(\s*["']?data:text\/html/i,

    // Template injection
    /\$\{[^}]*alert[^}]*\}/i,
    /\$\{[^}]*javascript[^}]*\}/i,
    /\{\{[^}]*alert[^}]*\}\}/i,
    /\{\{[^}]*javascript[^}]*\}\}/i,
    /#\{[^}]*alert[^}]*\}/i,
    /<[%][^%]*alert[^%]*[%]>/i,
    /\{%[^%]*alert[^%]*%\}/i,
    /\[\[[^\]]*alert[^\]]*\]\]/i,

    // Dangerous protocols
    /file\s*:/i,
    /ftp\s*:/i,
    /gopher\s*:/i,
    /ldap\s*:/i,

    // Common injection patterns
    /eval\s*\(/i,
    /function\s*\(/i,
    /settimeout\s*\(/i,
    /setinterval\s*\(/i,
    /document\./i,
    /window\./i,
    /location\./i,
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i,

    // DOM clobbering
    /<\s*input[\s\S]*?name\s*=\s*["']?(submit|action|form)/i,
    /<\s*img[\s\S]*?name\s*=\s*["']?submit/i,
    /<\s*iframe[\s\S]*?name\s*=\s*["']?alert/i,

    // Meta refresh attacks
    /<\s*meta[\s\S]*?http-equiv.*refresh/i,

    // Base tag attacks
    /<\s*base[\s\S]*?href/i,

    // Link rel attacks
    /<\s*link[\s\S]*?rel.*import/i,
    /<\s*link[\s\S]*?rel.*dns-prefetch/i,

    // XML/CDATA attacks
    /<!\[CDATA\[[\s\S]*?script[\s\S]*?\]\]>/i,
    /<\?xml[\s\S]*?>/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Sanitize CSS content to prevent CSS injection attacks
 */
export function sanitizeCssContent(css: string): string {
  if (typeof css !== 'string') return '';

  try {
    // Normalize first
    let sanitized = unicodeNormalization(css);

    // Remove dangerous CSS patterns
    const dangerousPatterns = [
      /expression\s*\([^)]*\)/gi,
      /javascript\s*:[^;"]*/gi,
      /vbscript\s*:[^;"]*/gi,
      /@import\s*[^;{]*javascript[^;{]*/gi,
      /@import\s*[^;{]*vbscript[^;{]*/gi,
      /@import\s*[^;{]*alert[^;{]*/gi, // Block @import with alert
      /@import\s*"[^"]*"/gi, // Remove all @import with quotes for security
      /@import\s*'[^']*'/gi, // Remove all @import with quotes for security
      /behavior\s*:[^;]*/gi,
      /-moz-binding\s*:[^;]*/gi,
      /url\s*\(\s*["']?javascript[^)]*\)/gi,
      /url\s*\(\s*["']?vbscript[^)]*\)/gi,
      /url\s*\(\s*["']?data:text\/html[^)]*\)/gi,
      /url\s*\(\s*["']?data:application\/x-[^)]*\)/gi,
    ];

    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove any remaining script/eval patterns
    sanitized = sanitized.replace(/\b(eval|alert|confirm|prompt|document|window|location)\b/gi, '');

    return sanitized.trim();
  } catch (error) {
    logger.error({ error, css: css.substring(0, 100) }, 'CSS sanitization error');
    return ''; // Return empty string if sanitization fails
  }
}

/**
 * Advanced HTML sanitization with context awareness
 */
export function sanitizeHtmlAdvanced(
  html: string,
  context: 'strict' | 'moderate' | 'text' = 'strict',
): string {
  if (typeof html !== 'string') return '';

  try {
    // First normalize Unicode to prevent bypasses
    let normalized = unicodeNormalization(html);

    // Detect XSS attempt for logging
    const isXssAttempt = detectXssAttempt(normalized);

    // Pre-process to remove standalone event handlers that DOMPurify might miss
    // This handles cases like plain text "onclick=alert('XSS')"
    if (isXssAttempt) {
      // Remove standalone event handlers and their values
      // Handle both quoted and unquoted values, including nested quotes
      normalized = normalized.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
      normalized = normalized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
      normalized = normalized.replace(/on\w+\s*:\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

      // Remove javascript: and other dangerous protocols
      normalized = normalized.replace(/javascript\s*:[^;\s]*/gi, '');
      normalized = normalized.replace(/vbscript\s*:[^;\s]*/gi, '');
      normalized = normalized.replace(/data\s*:\s*text\/html[^;\s]*/gi, '');

      // Remove alert, confirm, prompt calls
      normalized = normalized.replace(/\b(alert|confirm|prompt)\s*\([^)]*\)/gi, '');

      // Remove template injection patterns
      normalized = normalized.replace(/\$\{[^}]*\}/g, '');
      normalized = normalized.replace(/\{\{[^}]*\}\}/g, '');

      // Trim any resulting whitespace
      normalized = normalized.trim();
    }

    // Choose configuration based on context
    let config;
    switch (context) {
      case 'text':
        config = textOnlyConfig;
        break;
      case 'moderate':
        config = moderateConfig;
        break;
      default:
        config = advancedConfig;
    }

    // Add custom hooks for additional security
    DOMPurify.addHook('beforeSanitizeElements', (node) => {
      const element = node as Element;
      // Remove SVG with scripts
      if (element.tagName === 'SVG') {
        const svgContent = element.innerHTML;
        if (/script|onload|onerror|onmouse|onclick|href.*javascript/i.test(svgContent)) {
          element.remove();
          return;
        }
      }

      // Remove MathML with dangerous attributes
      if (element.tagName === 'MATH' || element.tagName?.startsWith('M')) {
        if (element.hasAttribute('href') || element.hasAttribute('xlink:href')) {
          element.remove();
          return;
        }
      }

      // Remove any element with dangerous data attributes
      if (element.hasAttributes && element.hasAttributes()) {
        const attrs = Array.from(element.attributes);
        for (const attr of attrs) {
          if (attr.name.startsWith('data-') && /script|javascript|vbscript/i.test(attr.value)) {
            element.remove();
            return;
          }
        }
      }
    });

    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      // Ensure no dangerous attributes survived
      const element = node as Element;
      if (element.hasAttributes && element.hasAttributes()) {
        const attrs = Array.from(element.attributes);
        for (const attr of attrs) {
          // Remove any attribute containing JavaScript
          if (/javascript|vbscript|data:text\/html|expression\(/i.test(attr.value)) {
            element.removeAttribute(attr.name);
          }

          // Remove event handlers that might have been missed
          if (/^on/i.test(attr.name)) {
            element.removeAttribute(attr.name);
          }
        }
      }
    });

    // Sanitize with DOMPurify
    const sanitized = DOMPurify.sanitize(normalized, config);

    // Log XSS attempts
    if (isXssAttempt && sanitized !== normalized) {
      logger.warn(
        {
          xssAttempt: true,
          originalLength: html.length,
          sanitizedLength: sanitized.length,
          sanitizedFrom: normalized.substring(0, 100),
          sanitizedTo: sanitized.substring(0, 100),
          context,
        },
        'XSS attempt detected and sanitized',
      );
    }

    // Clean up hooks to prevent memory leaks
    DOMPurify.removeAllHooks();

    return sanitized;
  } catch (error) {
    logger.error({ error, html: html.substring(0, 100) }, 'HTML sanitization error');
    return ''; // Return empty string if sanitization fails
  }
}

/**
 * Advanced email sanitization
 */
export function sanitizeEmailAdvanced(email: string): string {
  if (typeof email !== 'string') return '';

  try {
    // Normalize and trim
    let sanitized = unicodeNormalization(email.trim().toLowerCase());

    // First, try to preserve the email structure
    const emailParts = sanitized.match(/^([^@]+)@(.+)$/);
    if (!emailParts) {
      return ''; // Not a valid email structure
    }

    let [, localPart, domainPart] = emailParts;

    // Remove any HTML tags from each part separately
    localPart = sanitizeHtmlAdvanced(localPart, 'text');
    domainPart = sanitizeHtmlAdvanced(domainPart, 'text');

    // Remove dangerous characters but preserve valid email chars
    localPart = localPart.replace(/[<>'"]/g, '');
    domainPart = domainPart.replace(/[<>'"]/g, '');

    // Reconstruct email
    sanitized = `${localPart}@${domainPart}`;

    // Ensure it's a valid email format (allow + for tags)
    // More lenient regex that allows ending with + or other valid chars
    const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._+%-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

    // Check for consecutive dots
    if (sanitized.includes('..')) {
      return '';
    }

    if (!emailRegex.test(sanitized)) {
      // Try to be more lenient - remove invalid chars and retry
      localPart = localPart.replace(/[^a-zA-Z0-9._+%-]/g, '');
      domainPart = domainPart.replace(/[^a-zA-Z0-9.-]/g, '');
      sanitized = `${localPart}@${domainPart}`;

      if (!emailRegex.test(sanitized) || !localPart || !domainPart) {
        return '';
      }
    }

    // Limit length
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }

    return sanitized;
  } catch (error) {
    logger.error({ error, email: email.substring(0, 50) }, 'Email sanitization error');
    return '';
  }
}

/**
 * Advanced URL sanitization
 */
export function sanitizeUrlAdvanced(url: string): string {
  if (typeof url !== 'string') return '';

  try {
    // Don't use aggressive normalization for URLs as it might break protocol detection
    let sanitized = url.trim();

    // Check for dangerous protocols first before any normalization
    const dangerousProtocols = [
      'javascript:',
      'vbscript:',
      'file:',
      'ftp:',
      'gopher:',
      'ldap:',
      'dict:',
      'finger:',
      'telnet:',
    ];

    const lowerUrl = sanitized.toLowerCase();
    for (const protocol of dangerousProtocols) {
      if (lowerUrl.startsWith(protocol)) {
        return '';
      }
    }

    // Check for dangerous data URIs (but allow safe ones)
    if (lowerUrl.startsWith('data:')) {
      // Block dangerous data URIs
      if (
        lowerUrl.includes('data:text/html') ||
        lowerUrl.includes('data:application/x-') ||
        lowerUrl.includes('script') ||
        lowerUrl.includes('javascript') ||
        lowerUrl.includes('vbscript') ||
        lowerUrl.includes('onload') ||
        lowerUrl.includes('onerror')
      ) {
        return '';
      }
      // Allow safe data URIs (images, plain text)
      if (lowerUrl.startsWith('data:image/') || lowerUrl.startsWith('data:text/plain')) {
        return sanitized;
      }
    }

    // Only allow http, https, mailto, tel, data (safe)
    const allowedProtocolRegex = /^(https?|mailto|tel|data:(?:image\/|text\/plain)):/i;
    if (sanitized.includes(':') && !allowedProtocolRegex.test(sanitized)) {
      return '';
    }

    // Remove any HTML tags that might have been injected
    sanitized = sanitizeHtmlAdvanced(sanitized, 'text');

    // Basic URL validation for http/https
    try {
      if (sanitized.includes('://')) {
        new URL(sanitized); // This will throw if invalid
      }
    } catch {
      // Only return empty for http/https URLs that fail validation
      if (sanitized.startsWith('http')) {
        return '';
      }
    }

    return sanitized;
  } catch (error) {
    logger.error({ error, url: url.substring(0, 100) }, 'URL sanitization error');
    return '';
  }
}

/**
 * Recursively sanitize object with context-aware protection
 */
function sanitizeObjectAdvanced(obj: unknown, depth = 0, parentKey = ''): unknown {
  // Prevent infinite recursion and very deep objects
  if (depth > 20 || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Apply context-appropriate sanitization based on parent key
    if (/^(email|mail)/i.test(parentKey)) {
      return sanitizeEmailAdvanced(obj);
    } else if (/^(url|link|href)/i.test(parentKey)) {
      return sanitizeUrlAdvanced(obj);
    } else if (/^(css|style)/i.test(parentKey)) {
      return sanitizeCssContent(obj);
    } else if (/^(title|name|label)/i.test(parentKey)) {
      return sanitizeHtmlAdvanced(obj, 'text');
    } else if (/^(description|content|html|body)/i.test(parentKey)) {
      return sanitizeHtmlAdvanced(obj, 'moderate');
    } else {
      return sanitizeHtmlAdvanced(obj, 'strict');
    }
  }

  if (Array.isArray(obj)) {
    // For arrays, sanitize each item with parent key context
    const sanitized = obj.map((item) => sanitizeObjectAdvanced(item, depth + 1, parentKey));
    // Only filter out empty strings if not URLs (URLs can legitimately be empty after sanitization)
    if (!/^(url|link|href)/i.test(parentKey)) {
      return sanitized.filter((item) => item !== '');
    }
    return sanitized;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Pass the key context down for recursive sanitization
        sanitized[key] = sanitizeObjectAdvanced(obj[key], depth + 1, key);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Advanced XSS Protection Middleware
 */
export function advancedXssProtection(req: Request, res: Response, next: NextFunction): void {
  try {
    const startTime = Date.now();

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObjectAdvanced(req.body, 0, '');
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery: Record<string, unknown> = {};
      for (const key in req.query) {
        const value = req.query[key];
        if (typeof value === 'string') {
          sanitizedQuery[key] = sanitizeHtmlAdvanced(value, 'text');
        } else if (Array.isArray(value)) {
          sanitizedQuery[key] = value.map((v) =>
            typeof v === 'string' ? sanitizeHtmlAdvanced(v, 'text') : v,
          );
        } else {
          sanitizedQuery[key] = value;
        }
      }
      req.query = sanitizedQuery as typeof req.query;
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      const sanitizedParams: Record<string, unknown> = {};
      for (const key in req.params) {
        const value = req.params[key];
        if (typeof value === 'string') {
          sanitizedParams[key] = sanitizeHtmlAdvanced(value, 'text');
        } else {
          sanitizedParams[key] = value;
        }
      }
      req.params = sanitizedParams as typeof req.params;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log performance warning if sanitization takes too long
    if (duration > 1000) {
      logger.warn(
        {
          path: req.path,
          method: req.method,
          duration,
          bodySize: JSON.stringify(req.body || {}).length,
        },
        'XSS sanitization took longer than expected',
      );
    }

    next();
  } catch (error) {
    logger.error(
      {
        error,
        path: req.path,
        method: req.method,
        bodySize: req.body ? JSON.stringify(req.body).length : 0,
      },
      'Advanced XSS protection error',
    );

    res.status(400).json({
      error: 'Invalid Input',
      message: 'Request contains potentially dangerous content',
    });
  }
}

// Export all functions for testing and direct use
export {
  advancedXssProtection as default,
  sanitizeHtmlAdvanced as sanitizeHtml,
  sanitizeEmailAdvanced as sanitizeEmail,
  sanitizeUrlAdvanced as sanitizeUrl,
};
