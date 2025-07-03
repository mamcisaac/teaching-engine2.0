/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImportStatus } from '@teaching-engine/database';
import { prisma } from '../prisma';
import logger from '../logger';
// Import pdf-parse dynamically to avoid loading test files during module initialization
let pdf: any;
import mammoth from 'mammoth';
import OpenAI from 'openai';

export interface ImportProgress {
  importId: string;
  status: ImportStatus;
  totalOutcomes: number;
  processedOutcomes: number;
  errors: string[];
}

export class CurriculumImportService {
  private openai: OpenAI | null = null;

  constructor() {
    // Only initialize OpenAI if we have an API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.openai = new OpenAI({ apiKey });
      logger.info('OpenAI client initialized successfully');
    } else {
      logger.warn('OpenAI API key not found - AI features will be disabled');
      this.openai = null;
    }
  }

  /**
   * Confirm import and create curriculum expectations
   */
  async confirmImport(importId: string): Promise<{ created: number }> {
    try {
      const importRecord = await prisma.curriculumImport.findUnique({
        where: { id: importId },
      });

      if (!importRecord) {
        throw new Error('Import session not found');
      }

      if (importRecord.status !== ImportStatus.READY_FOR_REVIEW) {
        throw new Error('Import is not ready for confirmation');
      }

      // Get parsed subjects from metadata
      const metadata = importRecord.metadata as any;
      const subjects = metadata?.parsedSubjects || [];

      let createdCount = 0;

      // Create curriculum expectations
      for (const subject of subjects) {
        for (const expectation of subject.expectations) {
          try {
            // Check if expectation already exists
            const existing = await prisma.curriculumExpectation.findUnique({
              where: { code: expectation.code },
            });

            if (!existing) {
              await prisma.curriculumExpectation.create({
                data: {
                  code: expectation.code,
                  description: expectation.description,
                  descriptionFr: expectation.descriptionFr || null,
                  strand: expectation.strand,
                  substrand: expectation.substrand || null,
                  grade: expectation.grade,
                  subject: expectation.subject,
                },
              });
              createdCount++;
            }
          } catch (error) {
            logger.warn(
              { error, code: expectation.code },
              'Failed to create expectation, skipping',
            );
          }
        }
      }

      // Update import status
      await this.updateImportStatus(importId, ImportStatus.COMPLETED);
      await this.setCompletionTime(importId);

      logger.info(
        { importId, created: createdCount },
        'Import confirmed and expectations created',
      );

      return { created: createdCount };
    } catch (error) {
      logger.error({ error, importId }, 'Failed to confirm import');
      throw error;
    }
  }

  /**
   * Start a new curriculum import session
   */
  async startImport(
    userId: number,
    grade: number,
    subject: string,
    sourceFormat: 'csv' | 'pdf' | 'docx' | 'manual',
    sourceFile?: string,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    try {
      const curriculumImport = await prisma.curriculumImport.create({
        data: {
          userId,
          grade,
          subject,
          sourceFormat,
          sourceFile,
          status: ImportStatus.UPLOADING,
          metadata: (metadata || {}) as any,
        },
      });

      logger.info(
        { importId: curriculumImport.id, userId, grade, subject, sourceFormat },
        'Started curriculum import session',
      );

      return curriculumImport.id;
    } catch (error) {
      logger.error({ error, userId, grade, subject }, 'Failed to start curriculum import');
      throw new Error('Failed to start import session');
    }
  }

  /**
   * Parse CSV content into curriculum expectations
   */
  parseCSV(csvContent: string): Array<{
    code: string;
    description: string;
    subject: string;
    grade: number;
    strand?: string;
    substrand?: string;
  }> {
    try {
      // Handle different line endings and trim content
      const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
      const lines = normalizedContent.split('\n');

      if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
        throw new Error('CSV file is empty');
      }

      // Parse header line handling quoted values
      const headerLine = lines[0].toLowerCase();
      const headers: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < headerLine.length; j++) {
        const char = headerLine[j];
        const nextChar = j < headerLine.length - 1 ? headerLine[j + 1] : '';

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote within quoted field
            current += '"';
            j++; // Skip the next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Process the field
          let value = current.trim();
          // Remove outer quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"'); // Handle escaped quotes
          }
          headers.push(value);
          current = '';
        } else {
          current += char;
        }
      }
      // Process the last field
      let value = current.trim();
      // Remove outer quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"'); // Handle escaped quotes
      }
      headers.push(value);

      const codeIndex = headers.indexOf('code');
      const descriptionIndex = headers.indexOf('description');
      const subjectIndex = headers.indexOf('subject');
      const gradeIndex = headers.indexOf('grade');
      const domainIndex = headers.indexOf('domain');

      if (codeIndex === -1 || descriptionIndex === -1) {
        throw new Error('CSV must contain "code" and "description" columns');
      }

      const expectations: Array<{
        code: string;
        description: string;
        subject: string;
        grade: number;
        strand?: string;
        substrand?: string;
      }> = [];

      // Parse data rows - handle newlines within quotes
      const dataRows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = '';
      let inFieldQuotes = false;
      let i = 1; // Start after header

      while (i < lines.length) {
        const line = lines[i];

        // If we're in quotes from a previous line, add a newline
        if (inFieldQuotes && currentField.length > 0) {
          currentField += '\n';
        }

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          const nextChar = j < line.length - 1 ? line[j + 1] : '';

          if (char === '"') {
            if (inFieldQuotes && nextChar === '"') {
              // Escaped quote within quoted field
              currentField += '"';
              j++; // Skip the next quote
            } else {
              inFieldQuotes = !inFieldQuotes;
            }
          } else if (char === ',' && !inFieldQuotes) {
            // End of field
            let value = currentField.trim();
            // Remove outer quotes if present and unescape inner quotes
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1).replace(/""/g, '"');
            }
            currentRow.push(value);
            currentField = '';
          } else {
            currentField += char;
          }
        }

        // If we're not in quotes, this line is complete
        if (!inFieldQuotes) {
          // Process the last field of the line
          let value = currentField.trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1).replace(/""/g, '"');
          }
          currentRow.push(value);

          // Add the row if it has content
          if (currentRow.length > 0 && currentRow.some((field) => field.length > 0)) {
            dataRows.push(currentRow);
          }

          // Reset for next row
          currentRow = [];
          currentField = '';
        }

        i++;
      }

      // Process the rows
      for (const columns of dataRows) {
        if (columns.length < Math.max(codeIndex, descriptionIndex) + 1) {
          logger.warn({ columns, columnCount: columns.length }, 'Skipping invalid CSV line');
          continue;
        }

        // Sanitize grade value
        let grade = 0;
        if (gradeIndex >= 0 && gradeIndex < columns.length) {
          const gradeValue = columns[gradeIndex];
          // Handle various grade formats: "1", "Grade 1", "K", "JK/SK", etc.
          if (gradeValue) {
            const gradeMatch = gradeValue.match(/\d+/);
            if (gradeMatch) {
              grade = parseInt(gradeMatch[0]) || 0;
            } else if (gradeValue.toLowerCase().includes('k')) {
              grade = 0; // Kindergarten
            }
          }
        }

        const expectation = {
          code: columns[codeIndex] || '',
          description: columns[descriptionIndex] || '',
          subject:
            subjectIndex >= 0 && subjectIndex < columns.length ? columns[subjectIndex] : 'Unknown',
          grade,
          strand:
            domainIndex >= 0 && domainIndex < columns.length ? columns[domainIndex] : 'General',
        };

        // Only add if we have both code and description
        if (expectation.code && expectation.description) {
          expectations.push(expectation);
        } else {
          logger.warn(
            { expectation },
            'Skipping expectation with missing code or description',
          );
        }
      }

      return expectations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error, errorMessage }, 'Failed to parse CSV content');
      throw new Error(`CSV parsing failed: ${errorMessage}`);
    }
  }

  /**
   * Extract curriculum expectations from PDF using pdf-parse and AI
   */
  async parsePDF(fileBuffer: Buffer): Promise<
    Array<{
      code: string;
      description: string;
      subject: string;
      grade: number;
      strand?: string;
      substrand?: string;
    }>
  > {
    try {
      logger.info('Starting PDF parsing');

      // Lazy load pdf-parse to avoid initialization issues
      if (!pdf) {
        pdf = (await import('pdf-parse')).default;
      }

      // Extract text from PDF
      const pdfData = await pdf(fileBuffer);
      const text = pdfData.text;

      if (!text || text.trim().length === 0) {
        throw new Error('PDF appears to be empty');
      }

      if (text.trim().length < 100) {
        throw new Error('PDF content is too short to contain curriculum expectations');
      }

      logger.info(
        {
          textLength: text.length,
          firstChars: text.substring(0, 100),
        },
        'Extracted text from PDF',
      );

      // Use AI to parse the curriculum text
      const expectations = await this.parseTextWithAI(text);

      logger.info(`Parsed ${expectations.length} expectations from PDF`);
      return expectations;
    } catch (error) {
      logger.error({ error }, 'Failed to parse PDF');
      throw new Error(
        `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Extract curriculum expectations from DOCX using mammoth and AI
   */
  async parseDOCX(fileBuffer: Buffer): Promise<
    Array<{
      code: string;
      description: string;
      subject: string;
      grade: number;
      strand?: string;
      substrand?: string;
    }>
  > {
    try {
      logger.info('Starting DOCX parsing');

      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('DOCX appears to be empty');
      }

      if (text.trim().length < 100) {
        throw new Error('DOCX content is too short to contain curriculum expectations');
      }

      logger.info(`Extracted ${text.length} characters from DOCX`);

      // Use AI to parse the curriculum text
      const expectations = await this.parseTextWithAI(text);

      logger.info(`Parsed ${expectations.length} expectations from DOCX`);
      return expectations;
    } catch (error) {
      logger.error({ error }, 'Failed to parse DOCX');
      throw new Error(
        `DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get import progress
   */
  async getImportProgress(importId: string): Promise<ImportProgress | null> {
    try {
      const importRecord = await prisma.curriculumImport.findUnique({
        where: { id: importId },
      });

      if (!importRecord) return null;

      return {
        importId,
        status: importRecord.status,
        totalOutcomes: importRecord.totalOutcomes,
        processedOutcomes: importRecord.processedOutcomes,
        errors: (importRecord.errorLog as string[]) || [],
      };
    } catch (error) {
      logger.error({ error, importId }, 'Failed to get import progress');
      return null;
    }
  }

  /**
   * Cancel an import session
   */
  async cancelImport(importId: string): Promise<boolean> {
    try {
      await this.updateImportStatus(importId, ImportStatus.CANCELLED);
      logger.info({ importId }, 'Cancelled curriculum import');
      return true;
    } catch (error) {
      logger.error({ error, importId }, 'Failed to cancel import');
      return false;
    }
  }

  /**
   * Get import history for a user
   */
  async getImportHistory(userId: number, limit: number = 20): Promise<unknown[]> {
    try {
      const imports = await prisma.curriculumImport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          clusters: {
            select: {
              id: true,
              clusterName: true,
              clusterType: true,
            },
          },
          _count: {
            select: {
              curriculumExpectations: true,
            },
          },
        },
      });

      return imports;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get import history');
      return [];
    }
  }

  // Private helper methods

  private async updateImportStatus(
    importId: string,
    status: ImportStatus,
    totalOutcomes?: number,
  ): Promise<void> {
    const updateData: any = { status };
    if (totalOutcomes !== undefined) {
      updateData.totalOutcomes = totalOutcomes;
    }

    await prisma.curriculumImport.update({
      where: { id: importId },
      data: updateData,
    });
  }

  private async updateProgress(importId: string, processedOutcomes: number): Promise<void> {
    await prisma.curriculumImport.update({
      where: { id: importId },
      data: { processedOutcomes },
    });
  }

  private async setCompletionTime(importId: string): Promise<void> {
    await prisma.curriculumImport.update({
      where: { id: importId },
      data: { completedAt: new Date() },
    });
  }

  private async logErrors(importId: string, errors: string[]): Promise<void> {
    await prisma.curriculumImport.update({
      where: { id: importId },
      data: { errorLog: errors },
    });
  }

  /**
   * Parse curriculum text using AI to extract expectations
   */
  private async parseTextWithAI(text: string): Promise<
    Array<{
      code: string;
      description: string;
      descriptionFr?: string;
      subject: string;
      grade: number;
      strand?: string;
      strandFr?: string;
      substrand?: string;
      substrandFr?: string;
    }>
  > {
    try {
      // Detect if document is in French or bilingual
      const isFrench = this.detectLanguage(text);
      const isBilingual = this.detectBilingual(text);

      // Split text into chunks if it's too long (GPT-4 has token limits)
      const chunks = this.chunkText(text, 3000); // ~750 words per chunk
      const allExpectations: Array<{
        code: string;
        description: string;
        descriptionFr?: string;
        subject: string;
        grade: number;
        strand?: string;
        strandFr?: string;
        substrand?: string;
        substrandFr?: string;
      }> = [];

      for (let i = 0; i < chunks.length; i++) {
        logger.info(`Processing chunk ${i + 1} of ${chunks.length}`);

        const languageInfo = isFrench
          ? 'French'
          : isBilingual
            ? 'bilingual (English and French)'
            : 'English';
        const prompt = `You are an expert in curriculum design for elementary education. Extract curriculum expectations from the following ${languageInfo} text.

Please extract and return in JSON format:
- Subject name
- Grade level
- For each expectation:
  - Code (e.g., "A1.1", "B2.3")
  - Type ("overall" or "specific")
  - Description (the full text of the expectation)
  - Strand (major category like "Oral Communication", "Reading", etc.)
  - Domain (if applicable)

Return ONLY a JSON object with this structure:
{
  "subject": "Subject Name",
  "grade": 1,
  "expectations": [
    {
      "code": "A1.1",
      "type": "overall",
      "description": "Full expectation text",
      "strand": "Strand Name",
      "domain": "Domain Name (optional)"
    }
  ]
}

Only include data you are confident about. Do not invent or hallucinate expectations.

Text to parse:
"""
${chunks[i]}
"""`;

        if (!this.openai) {
          throw new Error('OpenAI API key not configured');
        }

        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert curriculum analyst. Extract curriculum expectations accurately.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1, // Low temperature for accuracy
          max_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          logger.warn(`No content returned for chunk ${i + 1}`);
          continue;
        }

        try {
          const parsed = JSON.parse(content);
          if (parsed.expectations && Array.isArray(parsed.expectations)) {
            const expectations = parsed.expectations.map((exp: any) => ({
              code: exp.code || `AUTO_${i}_${allExpectations.length}`,
              description: exp.description || '',
              descriptionFr: exp.descriptionFr,
              subject: parsed.subject || 'Unknown',
              grade: parsed.grade || 1,
              strand: exp.strand || exp.domain || 'General',
              strandFr: exp.strandFr,
              substrand: exp.substrand,
              substrandFr: exp.substrandFr,
            }));

            allExpectations.push(...expectations);
          }
        } catch (parseError) {
          logger.error({ parseError, chunk: i }, 'Failed to parse AI response');
        }
      }

      return allExpectations;
    } catch (error) {
      logger.error({ error }, 'Failed to parse text with AI');
      throw new Error('AI parsing failed');
    }
  }

  /**
   * Detect if text is primarily in French
   */
  private detectLanguage(text: string): boolean {
    const frenchIndicators = [
      'attentes',
      'domaine',
      'année',
      'élève',
      'apprentissage',
      'français',
      'mathématiques',
      'sciences',
      'études sociales',
      "contenus d'apprentissage",
      'pistes de réflexion',
    ];

    const textLower = text.toLowerCase();
    const frenchCount = frenchIndicators.filter((indicator) =>
      textLower.includes(indicator),
    ).length;

    return frenchCount >= 3;
  }

  /**
   * Detect if text contains both English and French
   */
  private detectBilingual(text: string): boolean {
    const englishIndicators = ['expectations', 'strand', 'grade', 'student', 'learning'];
    const frenchIndicators = ['attentes', 'domaine', 'année', 'élève', 'apprentissage'];

    const textLower = text.toLowerCase();
    const hasEnglish = englishIndicators.some((indicator) => textLower.includes(indicator));
    const hasFrench = frenchIndicators.some((indicator) => textLower.includes(indicator));

    return hasEnglish && hasFrench;
  }

  /**
   * Split text into manageable chunks for AI processing
   */
  private chunkText(text: string, maxCharsPerChunk: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxCharsPerChunk && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Determine if an expectation is overall or specific based on code pattern
   */
  private determineExpectationType(code: string, description: string): 'overall' | 'specific' {
    // Common patterns for overall expectations:
    // - Single letter or number (e.g., "A", "1")
    // - Ends with .0 (e.g., "A1.0")
    // - Contains "overall" in description
    // - Pattern like A1, B2 without decimal
    // - Starts with "Overall" in description
    // - No decimal point in code (e.g., "M1" vs "M1.1")

    const codeUpper = code.toUpperCase();
    const descLower = description.toLowerCase();

    // Single character codes are overall
    if (code.length === 1) return 'overall';

    // Codes ending with .0 are overall
    if (code.endsWith('.0')) return 'overall';

    // Description contains "overall"
    if (descLower.includes('overall')) return 'overall';

    // Pattern like A1, B2 (letter + number, no decimal)
    if (codeUpper.match(/^[A-Z]+\d+$/)) return 'overall';

    // If code has no decimal point and is short, likely overall
    if (!code.includes('.') && code.length <= 3) return 'overall';

    // Codes with decimal points (except .0) are specific
    if (code.includes('.') && !code.endsWith('.0')) return 'specific';

    // Default to specific for everything else
    return 'specific';
  }

  /**
   * Store uploaded file content for parsing
   */
  async storeUploadedFile(importId: string, file: Express.Multer.File): Promise<void> {
    try {
      // Store file metadata and content
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: {
          sourceFile: file.originalname,
          metadata: {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          },
          // Store file content as base64 for now (in production, would use cloud storage)
          rawText: file.buffer.toString('base64'),
        },
      });

      logger.info(`File stored for import ${importId}: ${file.originalname}`);
    } catch (error) {
      logger.error({ error, importId }, 'Failed to store uploaded file');
      throw error;
    }
  }

  /**
   * Parse uploaded file and extract curriculum expectations
   */
  async parseUploadedFile(
    importId: string,
    _options: { useAI?: boolean } = {},
  ): Promise<{
    subjects: Array<{
      name: string;
      expectations: Array<{
        code: string;
        type: 'overall' | 'specific';
        description: string;
        strand: string;
        substrand?: string;
        subject: string;
        grade: number;
      }>;
    }>;
    errors?: string[];
  }> {
    try {
      const importRecord = await prisma.curriculumImport.findUnique({
        where: { id: importId },
      });

      if (!importRecord) {
        throw new Error('Import session not found');
      }

      if (!importRecord.rawText) {
        throw new Error('No file content found for parsing');
      }

      // Update status to processing
      await this.updateImportStatus(importId, ImportStatus.PROCESSING);

      // Decode the file content from base64
      const fileBuffer = Buffer.from(importRecord.rawText, 'base64');

      // Parse based on file format
      let expectations: Array<{
        code: string;
        description: string;
        subject: string;
        grade: number;
        strand?: string;
        substrand?: string;
      }> = [];

      if (importRecord.sourceFormat === 'pdf') {
        expectations = await this.parsePDF(fileBuffer);
      } else if (importRecord.sourceFormat === 'docx') {
        expectations = await this.parseDOCX(fileBuffer);
      } else if (importRecord.sourceFormat === 'csv') {
        // Convert buffer to string for CSV
        const csvContent = fileBuffer.toString('utf-8');
        expectations = this.parseCSV(csvContent);
      } else {
        throw new Error(`Unsupported file format: ${importRecord.sourceFormat}`);
      }

      // Group expectations by subject
      const subjectMap = new Map<string, any>();

      for (const expectation of expectations) {
        const subjectName = expectation.subject || 'Unknown';

        if (!subjectMap.has(subjectName)) {
          subjectMap.set(subjectName, {
            name: subjectName,
            expectations: [],
          });
        }

        const subject = subjectMap.get(subjectName);
        subject.expectations.push({
          code: expectation.code,
          type: this.determineExpectationType(expectation.code, expectation.description),
          description: expectation.description,
          strand: expectation.strand || 'General',
          substrand: expectation.substrand,
          subject: subjectName,
          grade: expectation.grade || importRecord.grade,
        });
      }

      const subjects = Array.from(subjectMap.values());

      // Store parsed subjects in metadata for later use
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: {
          metadata: {
            ...((importRecord.metadata as any) || {}),
            parsedSubjects: subjects,
          },
        },
      });

      // Update status to ready for review
      await this.updateImportStatus(importId, ImportStatus.READY_FOR_REVIEW);

      logger.info(`File parsed for import ${importId}: ${subjects.length} subjects`);

      return {
        subjects: subjects,
        errors: [],
      };
    } catch (error) {
      logger.error({ error, importId }, 'Failed to parse uploaded file');
      await this.updateImportStatus(importId, ImportStatus.FAILED);
      throw error;
    }
  }

  /**
   * Load preset curriculum data
   */
  async loadPresetCurriculum(
    userId: number,
    presetId: string,
  ): Promise<{
    sessionId: string;
    subjects: Array<{
      name: string;
      expectations: Array<{
        code: string;
        type: 'overall' | 'specific';
        description: string;
        strand: string;
        substrand?: string;
        subject: string;
        grade: number;
      }>;
    }>;
  }> {
    try {
      // Create new import session for preset
      const sessionId = await this.startImport(
        userId,
        1, // Default grade for presets
        'Multi-Subject',
        'manual',
        `Preset: ${presetId}`,
      );

      // Mock preset data based on presetId
      let subjects: Array<{
        name: string;
        expectations: Array<{
          code: string;
          type: 'overall' | 'specific';
          description: string;
          strand: string;
          substrand?: string;
          subject: string;
          grade: number;
        }>;
      }> = [];

      switch (presetId) {
        case 'pei-grade1-french':
          subjects = [
            {
              name: 'Français Langue Première',
              expectations: [
                {
                  code: 'CO1',
                  type: 'overall',
                  description: 'Comprendre des messages oraux en français',
                  strand: 'Communication orale',
                  subject: 'Français Langue Première',
                  grade: 1,
                },
                {
                  code: 'CO1.1',
                  type: 'specific',
                  description: 'Suivre des instructions orales simples',
                  strand: 'Communication orale',
                  substrand: 'Écoute',
                  subject: 'Français Langue Première',
                  grade: 1,
                },
              ],
            },
            {
              name: 'Mathématiques',
              expectations: [
                {
                  code: 'N1',
                  type: 'overall',
                  description: 'Comprendre les nombres de 0 à 20',
                  strand: 'Nombre',
                  subject: 'Mathématiques',
                  grade: 1,
                },
              ],
            },
          ];
          break;

        case 'ontario-grade1-english':
          subjects = [
            {
              name: 'Language',
              expectations: [
                {
                  code: '1.O1',
                  type: 'overall',
                  description: 'Listen in order to understand and respond appropriately',
                  strand: 'Oral Communication',
                  subject: 'Language',
                  grade: 1,
                },
              ],
            },
            {
              name: 'Mathematics',
              expectations: [
                {
                  code: '1.N1',
                  type: 'overall',
                  description: 'Count to 50 and represent numbers to 20',
                  strand: 'Number Sense and Numeration',
                  subject: 'Mathematics',
                  grade: 1,
                },
              ],
            },
          ];
          break;

        case 'bc-grade1-core':
          subjects = [
            {
              name: 'English Language Arts',
              expectations: [
                {
                  code: 'ELA1-O1',
                  type: 'overall',
                  description: 'Use speaking and listening to interact with others',
                  strand: 'Oral Language',
                  subject: 'English Language Arts',
                  grade: 1,
                },
              ],
            },
          ];
          break;

        default:
          throw new Error(`Unknown preset: ${presetId}`);
      }

      // Store parsed subjects in metadata for later use
      await prisma.curriculumImport.update({
        where: { id: sessionId },
        data: {
          metadata: {
            presetId,
            parsedSubjects: subjects,
            loadedAt: new Date().toISOString(),
          },
        },
      });

      // Update import status
      await this.updateImportStatus(sessionId, 'READY_FOR_REVIEW');

      logger.info(`Preset curriculum loaded: ${presetId} for user ${userId}`);

      return {
        sessionId,
        subjects,
      };
    } catch (error) {
      logger.error({ error, presetId, userId }, 'Failed to load preset curriculum');
      throw error;
    }
  }

  /**
   * Finalize import and create actual curriculum expectations in the ETFO system
   */
  async finalizeImport(
    importId: string,
    _userId: number,
  ): Promise<{
    totalExpectations: number;
    subjects: string[];
  }> {
    try {
      const importRecord = await prisma.curriculumImport.findUnique({
        where: { id: importId },
        include: {
          curriculumExpectations: true,
        },
      });

      if (!importRecord) {
        throw new Error('Import session not found');
      }

      // Get the parsed subjects from the import metadata
      const parsedSubjects = (importRecord.metadata as any)?.parsedSubjects || [];

      let totalExpectations = 0;
      const subjects: string[] = [];

      // Create curriculum expectations for each subject
      for (const subject of parsedSubjects) {
        subjects.push(subject.name);

        for (const expectation of subject.expectations) {
          await prisma.curriculumExpectation.create({
            data: {
              code: expectation.code,
              description: expectation.description,
              strand: expectation.strand,
              substrand: expectation.substrand,
              grade: expectation.grade,
              subject: expectation.subject,
              importId,
            },
          });
          totalExpectations++;
        }
      }

      // Update import status to completed
      await this.updateImportStatus(importId, 'COMPLETED');
      await this.setCompletionTime(importId);

      // Store final results in metadata
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: {
          metadata: {
            ...((importRecord.metadata as any) || {}),
            finalResults: {
              totalExpectations,
              subjects,
              completedAt: new Date().toISOString(),
            },
          },
        },
      });

      logger.info(`Import finalized: ${importId}, created ${totalExpectations} expectations`);

      return {
        totalExpectations,
        subjects,
      };
    } catch (error) {
      logger.error({ error, importId }, 'Failed to finalize import');
      await this.updateImportStatus(importId, 'FAILED');
      throw error;
    }
  }
}

// Export singleton instance
export const curriculumImportService = new CurriculumImportService();
