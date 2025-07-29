import DOMPurifyDefault from 'dompurify';
const DOMPurify = DOMPurifyDefault;
import { createElement, useMemo, type ReactElement } from 'react';

export const sanitizeHtml = (dirty: string | undefined | null): string => {
  if (dirty === null || dirty === undefined || dirty === '') {
    return '';
  }
  
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
      'div', 'span', 'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['class'],
    ALLOWED_URI_REGEXP: /^https?:\/\/[^\s]+$/,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe', 'link', 'meta', 'base', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'target', 'rel', 'href'],
    ALLOW_DATA_ATTR: false,
    SANITIZE_NAMED_PROPS: true,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true
  });
  
  return clean;
};

export const escapeHtml = (unsafe: string | undefined | null): string => {
  if (unsafe === null || unsafe === undefined || unsafe === '') {
    return '';
  }
  
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
}

export function SafeHtmlRenderer(props: SafeHtmlRendererProps): ReactElement {
  // Use a more secure approach - convert HTML to React elements
  const sanitizedHtml = sanitizeHtml(props.html);
  
  // For maximum security, we'll only render text content
  // Complex HTML rendering should use a proper HTML-to-React parser
  const textContent = useMemo(() => {
    if (typeof window !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitizedHtml;
      return tempDiv.textContent ?? tempDiv.innerText;
    }
    // Server-side fallback - strip all HTML tags
    return sanitizedHtml.replace(/<[^>]*>/g, '');
  }, [sanitizedHtml]);
  
  return createElement('div', {
    className: props.className
  }, textContent);
}

// Alternative: Use this for truly safe HTML rendering when needed
export function SafeTextRenderer({ text, className }: { text: string; className?: string }): ReactElement {
  return createElement('div', {
    className
  }, text);
}