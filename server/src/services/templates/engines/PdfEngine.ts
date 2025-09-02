/**
 * PDF Engine - Simplified stub version
 * The actual PDF generation is handled by substitutePlanPdfService.ts using Puppeteer directly
 * This is kept as a stub to avoid breaking other parts of the codebase that reference it
 */

import { RenderEngine } from './RenderEngine';
import type { RenderResult, RenderContext } from './RenderEngine';
import type { Template } from '../providers/TemplateProvider';

export class PdfEngine extends RenderEngine {
  constructor() {
    super({});
  }

  async render(
    template: Template,
    context: RenderContext
  ): Promise<RenderResult> {
    // This is a stub implementation
    // Actual PDF generation is handled by substitutePlanPdfService.ts
    return {
      output: Buffer.from('PDF generation not implemented in this engine'),
      metadata: {
        engine: 'pdf-stub',
        timestamp: new Date().toISOString(),
      }
    };
  }

  async compile(template: Template): Promise<any> {
    // Stub implementation
    return template;
  }

  async cleanup(): Promise<void> {
    // No cleanup needed for stub
  }
}

// For backward compatibility
export interface PdfOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}