/**
 * PDF Curriculum Parser
 * Parses curriculum expectations from PDF files
 */

// Temporarily disabled to avoid startup issues
// import * as pdfParse from 'pdf-parse';
import { pdfParse } from '../../../__mocks__/pdf-parse';

import type { ParsedCurriculum, ParsedExpectation } from './CurriculumParser';
import { CurriculumParser } from './CurriculumParser';

export interface PDFSection {
  title: string;
  content: string;
  pageNumber: number;
}

export class PDFParser extends CurriculumParser {
  /**
   * Parse PDF content
   */
  async parse(content: string | Buffer): Promise<ParsedCurriculum> {
    // Parse PDF
    const buffer = content instanceof Buffer ? content : Buffer.from(content);
    const data = await pdfParse(buffer);

    if (!data.text) {
      throw new Error('No text content found in PDF');
    }

    // Extract metadata from PDF info
    const metadata = this.extractMetadata(data);

    // Split into sections
    const sections = this.extractSections(data.text);

    // Find curriculum sections
    const curriculumSections = this.findCurriculumSections(sections);

    if (curriculumSections.length === 0) {
      throw new Error('No curriculum expectations found in PDF');
    }

    // Parse expectations from sections
    const expectations: ParsedExpectation[] = [];

    for (const section of curriculumSections) {
      const sectionExpectations = this.parseSection(section, metadata);
      expectations.push(...sectionExpectations);
    }

    const curriculum: ParsedCurriculum = {
      subject: metadata.subject ?? 'Unknown',
      grade: metadata.grade ?? 0,
      expectations: this.deduplicateExpectations(expectations),
      metadata: {
        source: 'PDF Import',
        lastUpdated: new Date(),
        version: metadata.version,
      },
    };

    if (!this.validate(curriculum)) {
      throw new Error('Invalid curriculum data structure');
    }

    return curriculum;
  }

  /**
   * Extract metadata from PDF
   */
  private extractMetadata(pdfData: unknown): {
    grade?: number;
    subject?: string;
    version?: string;
  } {
    const metadata: {
      grade?: number;
      subject?: string;
      version?: string;
    } = {};

    // Try to extract from PDF metadata
    if (pdfData && typeof pdfData === 'object' && 'info' in pdfData) {
      const {info} = (pdfData as { info?: { Title?: string; Subject?: string } });
      metadata.version = info?.Title ?? info?.Subject;
    }

    // Extract from text content
    const text =
      pdfData && typeof pdfData === 'object' && 'text' in pdfData
        ? (pdfData as { text: string }).text
        : '';

    // Look for grade
    const gradeMatch = text.match(/Grade\s*(\d+)/i);
    if (gradeMatch) {
      metadata.grade = parseInt(gradeMatch[1]);
    }

    // Look for subject
    const subjects = [
      'Mathematics',
      'Language',
      'Science',
      'Social Studies',
      'The Arts',
      'Health and Physical Education',
      'French',
    ];

    for (const subject of subjects) {
      if (text.includes(subject)) {
        metadata.subject = subject;
        break;
      }
    }

    return metadata;
  }

  /**
   * Extract sections from PDF text
   */
  private extractSections(text: string): PDFSection[] {
    const sections: PDFSection[] = [];

    // Split by common section headers
    const sectionPatterns = [
      /^Overall Expectations?$/im,
      /^Specific Expectations?$/im,
      /^Strand [A-Z]:/im,
      /^[A-Z0-9]+\.\s+[A-Z][^.]+$/m,
    ];

    // Split text into lines
    const lines = text.split('\n');
    let currentSection: PDFSection | null = null;
    let pageNumber = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for page break
      if (line.includes('Page') && line.match(/\d+/)) {
        const match = line.match(/Page\s*(\d+)/i);
        if (match) {
          pageNumber = parseInt(match[1]);
        }
      }

      // Check if line is a section header
      let isHeader = false;
      for (const pattern of sectionPatterns) {
        if (pattern.test(line)) {
          isHeader = true;
          break;
        }
      }

      if (isHeader) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          title: line,
          content: '',
          pageNumber,
        };
      } else if (currentSection && line.length > 0) {
        // Add to current section
        currentSection.content += `${line  }\n`;
      }
    }

    // Save last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Find sections containing curriculum expectations
   */
  private findCurriculumSections(sections: PDFSection[]): PDFSection[] {
    return sections.filter((section) => {
      const title = section.title.toLowerCase();
      const content = section.content.toLowerCase();

      return (
        title.includes('expectation') ||
        title.includes('strand') ||
        content.includes('students will') ||
        content.includes('demonstrate') ||
        content.includes('understanding')
      );
    });
  }

  /**
   * Parse expectations from a section
   */
  private parseSection(
    section: PDFSection,
    metadata: { grade?: number; subject?: string },
  ): ParsedExpectation[] {
    const expectations: ParsedExpectation[] = [];

    // Determine if this is overall or specific expectations
    const isOverall = section.title.toLowerCase().includes('overall');
    const type: 'overall' | 'specific' = isOverall ? 'overall' : 'specific';

    // Extract strand from section title
    const strand = this.extractStrand(section.title) ?? 'General';

    // Parse expectations using different patterns
    const patterns = [
      // Pattern 1: Code. Description
      /([A-Z0-9]+\.[A-Z0-9]+(?:\.[A-Z0-9]+)?)\.\s*(.+?)(?=\n[A-Z0-9]+\.|$)/gs,
      // Pattern 2: Numbered list
      /(\d+)\.\s*(.+?)(?=\n\d+\.|$)/gs,
      // Pattern 3: Bullet points
      /[•·]\s*(.+?)(?=\n[•·]|$)/gs,
    ];

    for (const pattern of patterns) {
      const matches = [...section.content.matchAll(pattern)];

      for (const match of matches) {
        let code: string;
        let description: string;

        if (match.length >= 3) {
          // Pattern with code and description
          code = match[1];
          description = match[2];
        } else if (match.length >= 2) {
          // Pattern with just description
          code = `${strand}.${expectations.length + 1}`;
          description = match[1];
        } else {
          continue;
        }

        description = this.cleanText(description);

        if (description.length < 10) {
continue;
} // Skip very short descriptions

        const expectation: ParsedExpectation = {
          code: this.cleanText(code),
          description,
          type,
          strand,
          grade: metadata.grade,
          subject: metadata.subject,
        };

        if (this.options.extractKeywords) {
          expectation.keywords = this.extractKeywords(description);
        }

        expectations.push(expectation);
      }

      // If we found expectations with this pattern, don't try others
      if (expectations.length > 0) {
        break;
      }
    }

    return expectations;
  }

  /**
   * Extract strand from section title
   */
  private extractStrand(title: string): string | undefined {
    // Pattern: Strand A: Number Sense
    const strandMatch = title.match(/Strand\s*([A-Z]):\s*(.+)/i);
    if (strandMatch) {
      return strandMatch[2].trim();
    }

    // Pattern: A. Number Sense
    const letterMatch = title.match(/^([A-Z])\.\s*(.+)/);
    if (letterMatch) {
      return letterMatch[2].trim();
    }

    // Check for known strand names
    const strandNames = [
      'Number Sense',
      'Measurement',
      'Geometry',
      'Patterning',
      'Data Management',
      'Probability',
      'Algebra',
    ];

    for (const strandName of strandNames) {
      if (title.includes(strandName)) {
        return strandName;
      }
    }

    return undefined;
  }

  /**
   * Remove duplicate expectations
   */
  private deduplicateExpectations(expectations: ParsedExpectation[]): ParsedExpectation[] {
    const seen = new Set<string>();
    const unique: ParsedExpectation[] = [];

    for (const exp of expectations) {
      const key = `${exp.code}-${exp.description.substring(0, 50)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(exp);
      }
    }

    return unique;
  }

  /**
   * Validate parsed curriculum
   */
  validate(data: ParsedCurriculum): boolean {
    if (!data.subject || !data.grade || !data.expectations) {
      return false;
    }

    if (data.expectations.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.pdf'];
  }
}
