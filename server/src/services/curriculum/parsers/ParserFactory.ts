/**
 * Parser Factory
 * Creates appropriate parser based on file type
 */

import path from 'path';

import { CurriculumParser, ParserOptions } from './CurriculumParser';
import { CSVParser } from './CSVParser';
import { ExcelParser } from './ExcelParser';
import { PDFParser } from './PDFParser';
import { JSONParser } from './JSONParser';

export class ParserFactory {
  private static parsers = new Map<string, new (options?: ParserOptions) => CurriculumParser>([
    ['.csv', CSVParser],
    ['.txt', CSVParser],
    ['.xlsx', ExcelParser],
    ['.xls', ExcelParser],
    ['.xlsm', ExcelParser],
    ['.pdf', PDFParser],
    ['.json', JSONParser],
  ]);

  /**
   * Create parser for file
   */
  static createParser(
    filename: string,
    options?: ParserOptions
  ): CurriculumParser {
    const ext = path.extname(filename).toLowerCase();
    
    const ParserClass = this.parsers.get(ext);
    
    if (!ParserClass) {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    return new ParserClass(options);
  }

  /**
   * Get supported file extensions
   */
  static getSupportedExtensions(): string[] {
    return Array.from(this.parsers.keys());
  }

  /**
   * Check if file type is supported
   */
  static isSupported(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.parsers.has(ext);
  }

  /**
   * Register custom parser
   */
  static registerParser(
    extension: string,
    parserClass: new (options?: ParserOptions) => CurriculumParser
  ): void {
    this.parsers.set(extension.toLowerCase(), parserClass);
  }

  /**
   * Create parser from MIME type
   */
  static createParserFromMimeType(
    mimeType: string,
    options?: ParserOptions
  ): CurriculumParser {
    const mimeToExt: Record<string, string> = {
      'text/csv': '.csv',
      'text/plain': '.txt',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'application/pdf': '.pdf',
      'application/json': '.json',
    };

    const ext = mimeToExt[mimeType];
    
    if (!ext) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    const ParserClass = this.parsers.get(ext);
    
    if (!ParserClass) {
      throw new Error(`No parser found for MIME type: ${mimeType}`);
    }

    return new ParserClass(options);
  }
}