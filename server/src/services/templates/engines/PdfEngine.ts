/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PDF Template Engine
 * Renders templates to PDF format
 */

import * as puppeteer from 'puppeteer';
import { RenderEngine, RenderResult, RenderContext } from './RenderEngine';
import { Template } from '../providers/TemplateProvider';
import { HandlebarsEngine } from './HandlebarsEngine';

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
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  preferCSSPageSize?: boolean;
}

export class PdfEngine extends RenderEngine {
  private handlebarsEngine: HandlebarsEngine;
  private browser: puppeteer.Browser | null = null;

  constructor() {
    super('pdf');
    this.handlebarsEngine = new HandlebarsEngine();
  }

  /**
   * Initialize browser
   */
  private async initBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  /**
   * Render template to PDF
   */
  async render(template: Template, context: RenderContext): Promise<RenderResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      // First render HTML using Handlebars
      const htmlResult = await this.handlebarsEngine.render(
        { ...template, format: 'html' },
        context
      );

      const html = htmlResult.content as string;

      // Convert HTML to PDF
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Get PDF options from context or use defaults
      const pdfOptions: PdfOptions = context.options?.pdf || {
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in',
        },
      };

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: pdfOptions.format,
        landscape: pdfOptions.landscape,
        printBackground: pdfOptions.printBackground,
        margin: pdfOptions.margin,
        displayHeaderFooter: pdfOptions.displayHeaderFooter,
        headerTemplate: pdfOptions.headerTemplate,
        footerTemplate: pdfOptions.footerTemplate,
        preferCSSPageSize: pdfOptions.preferCSSPageSize,
      });

      await page.close();

      return {
        content: Buffer.from(pdfBuffer),
        format: 'pdf',
        metadata: {
          renderTime: Date.now() - startTime,
          engine: this.name,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    } catch (_error) {
      throw new Error(`PDF render error: ${error.message}`);
    }
  }

  /**
   * Validate template
   */
  async validate(template: Template): Promise<boolean> {
    // Validate as HTML first
    return this.handlebarsEngine.validate(template);
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): string[] {
    return ['pdf'];
  }

  /**
   * Precompile template
   */
  async precompile(template: Template): Promise<unknown> {
    // Precompile as Handlebars template
    return this.handlebarsEngine.precompile(template);
  }

  /**
   * Close browser when done
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate PDF from HTML string
   */
  async generatePdfFromHtml(
    html: string,
    options?: PdfOptions
  ): Promise<Buffer> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      const defaultOptions: PdfOptions = {
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in',
        },
      };

      const pdfBuffer = await page.pdf({
        ...defaultOptions,
        ...options,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Add watermark to PDF
   */
  async addWatermark(
    pdfBuffer: Buffer,
    _watermarkText: string,
    _options?: {
      opacity?: number;
      fontSize?: number;
      color?: string;
      angle?: number;
    }
  ): Promise<Buffer> {
    // This would require a PDF manipulation library like pdf-lib
    // For now, return the original buffer
    return pdfBuffer;
  }

  /**
   * Merge multiple PDFs
   */
  async mergePdfs(pdfBuffers: Buffer[]): Promise<Buffer> {
    // This would require a PDF manipulation library like pdf-lib
    // For now, return the first buffer
    return pdfBuffers[0];
  }
}