import { PrismaClient, ImportStatus } from '@teaching-engine/database';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import multer from 'multer';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedOutcome {
  code: string;
  description: string;
  strand?: string;
  substrand?: string;
}

export interface ParsedCurriculum {
  subject: string;
  grade: number;
  outcomes: ParsedOutcome[];
}

export interface ImportResult {
  importId: number;
  status: ImportStatus;
  outcomesCount: number;
  errorMessage?: string;
}

export class CurriculumImportService {
  private readonly uploadsDir = process.env.UPLOAD_DIR || './uploads';

  constructor() {
    // Ensure uploads directory exists
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Upload and save document file
   */
  async uploadDocument(
    file: Express.Multer.File,
    userId: number
  ): Promise<number> {
    const filename = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(this.uploadsDir, filename);

    await fs.writeFile(filePath, file.buffer);

    const importRecord = await prisma.curriculumImport.create({
      data: {
        userId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath,
        status: ImportStatus.UPLOADING,
      },
    });

    // Start processing asynchronously
    this.processDocument(importRecord.id).catch(console.error);

    return importRecord.id;
  }

  /**
   * Extract text from uploaded document
   */
  private async extractText(filePath: string, mimeType: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);

      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await pdf(fileBuffer);
          return pdfData.text;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          const docResult = await mammoth.extractRawText({ buffer: fileBuffer });
          return docResult.value;

        case 'text/plain':
          return fileBuffer.toString('utf-8');

        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse curriculum text using OpenAI
   */
  private async parseWithAI(text: string): Promise<ParsedCurriculum> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
You are a curriculum parser. Extract learning outcomes from the following curriculum document.

Please analyze the text and return a JSON object in this exact format:
{
  "subject": "string (e.g., 'Mathematics', 'English Language Arts', 'French')",
  "grade": number (1-12),
  "outcomes": [
    {
      "code": "string (e.g., 'M1.1', 'ELA2.3')",
      "description": "string (the full outcome description)",
      "strand": "string (optional - subject area like 'Number', 'Reading')",
      "substrand": "string (optional - more specific area)"
    }
  ]
}

Guidelines:
- Extract ALL learning outcomes/expectations from the document
- If no grade is specified, try to infer from context or use 1
- If no subject is clear, use "General"
- Outcome codes should follow the pattern found in the document
- Keep descriptions exactly as written in the source
- If strands/substrands aren't clear, leave them empty

Text to parse:
${text.substring(0, 8000)} ${text.length > 8000 ? '...(truncated)' : ''}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a curriculum parsing assistant. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in OpenAI response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as ParsedCurriculum;
      
      // Validate the parsed result
      if (!parsed.subject || typeof parsed.grade !== 'number' || !Array.isArray(parsed.outcomes)) {
        throw new Error('Invalid curriculum format from AI parsing');
      }

      return parsed;
    } catch (error) {
      console.error('AI parsing error:', error);
      throw new Error(`AI parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process uploaded document (extract text and parse with AI)
   */
  private async processDocument(importId: number): Promise<void> {
    try {
      // Update status to processing
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: { status: ImportStatus.PROCESSING },
      });

      const importRecord = await prisma.curriculumImport.findUnique({
        where: { id: importId },
      });

      if (!importRecord) {
        throw new Error('Import record not found');
      }

      // Extract text
      const rawText = await this.extractText(importRecord.filePath, importRecord.mimeType);

      // Parse with AI
      const parsedData = await this.parseWithAI(rawText);

      // Update record with results
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: {
          status: ImportStatus.READY_FOR_REVIEW,
          rawText,
          parsedData: JSON.stringify(parsedData),
          processedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Document processing error:', error);
      
      // Update record with error
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: {
          status: ImportStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date(),
        },
      });
    }
  }

  /**
   * Get import status and parsed data
   */
  async getImportStatus(importId: number, userId: number): Promise<{
    status: ImportStatus;
    parsedData?: ParsedCurriculum;
    errorMessage?: string;
    originalName: string;
  }> {
    const importRecord = await prisma.curriculumImport.findFirst({
      where: { id: importId, userId },
    });

    if (!importRecord) {
      throw new Error('Import not found');
    }

    let parsedData: ParsedCurriculum | undefined;
    if (importRecord.parsedData) {
      try {
        parsedData = JSON.parse(importRecord.parsedData);
      } catch {
        // If parsing fails, treat as error
      }
    }

    return {
      status: importRecord.status,
      parsedData,
      errorMessage: importRecord.errorMessage || undefined,
      originalName: importRecord.originalName,
    };
  }

  /**
   * Save confirmed curriculum to database
   */
  async confirmImport(
    importId: number, 
    userId: number, 
    reviewedData: ParsedCurriculum
  ): Promise<ImportResult> {
    const importRecord = await prisma.curriculumImport.findFirst({
      where: { id: importId, userId },
    });

    if (!importRecord) {
      throw new Error('Import not found');
    }

    if (importRecord.status !== ImportStatus.READY_FOR_REVIEW) {
      throw new Error('Import not ready for confirmation');
    }

    try {
      // Create subject if it doesn't exist
      let subject = await prisma.subject.findFirst({
        where: { 
          name: reviewedData.subject,
          userId 
        },
      });

      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            name: reviewedData.subject,
            userId,
          },
        });
      }

      // Create outcomes
      const createdOutcomes = [];
      for (const outcome of reviewedData.outcomes) {
        try {
          const createdOutcome = await prisma.outcome.create({
            data: {
              code: outcome.code,
              description: outcome.description,
              subject: reviewedData.subject,
              grade: reviewedData.grade,
              domain: outcome.strand || null,
            },
          });
          createdOutcomes.push(createdOutcome);
        } catch (error) {
          // Skip duplicate outcomes (code constraint violation)
          console.warn(`Skipping duplicate outcome: ${outcome.code}`);
        }
      }

      // Mark import as confirmed
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: { status: ImportStatus.CONFIRMED },
      });

      return {
        importId,
        status: ImportStatus.CONFIRMED,
        outcomesCount: createdOutcomes.length,
      };
    } catch (error) {
      console.error('Import confirmation error:', error);
      
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: { 
          status: ImportStatus.FAILED,
          errorMessage: `Confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
      });

      throw error;
    }
  }

  /**
   * Get user's import history
   */
  async getUserImports(userId: number): Promise<Array<{
    id: number;
    originalName: string;
    status: ImportStatus;
    createdAt: Date;
    processedAt?: Date;
    outcomesCount?: number;
  }>> {
    const imports = await prisma.curriculumImport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return imports.map(imp => ({
      id: imp.id,
      originalName: imp.originalName,
      status: imp.status,
      createdAt: imp.createdAt,
      processedAt: imp.processedAt || undefined,
      outcomesCount: imp.parsedData ? JSON.parse(imp.parsedData).outcomes?.length : undefined,
    }));
  }

  /**
   * Clean up old failed imports
   */
  async cleanupFailedImports(olderThanDays: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const failedImports = await prisma.curriculumImport.findMany({
      where: {
        status: ImportStatus.FAILED,
        createdAt: { lt: cutoffDate },
      },
    });

    // Delete files
    for (const imp of failedImports) {
      try {
        await fs.unlink(imp.filePath);
      } catch {
        // Ignore file deletion errors
      }
    }

    // Delete records
    const result = await prisma.curriculumImport.deleteMany({
      where: {
        status: ImportStatus.FAILED,
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}

// Configure multer for file uploads
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.'));
    }
  },
});

export const curriculumImportService = new CurriculumImportService();