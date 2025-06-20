import { embeddingService } from './embeddingService';
import BaseService from './base/BaseService';
import { ImportStatus } from '@teaching-engine/database';

export interface ImportOutcome {
  code: string;
  description: string;
  subject: string;
  grade: number;
  domain?: string;
}

export interface ImportProgress {
  importId: string;
  status: ImportStatus;
  totalOutcomes: number;
  processedOutcomes: number;
  errors: string[];
}

export interface ImportResult {
  importId: string;
  outcomes: { id: string; code: string }[];
  clusters: { id: string; name: string; outcomeIds: string[] }[];
  errors: string[];
}

export class CurriculumImportService extends BaseService {
  constructor() {
    super('CurriculumImportService');
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
    metadata?: Record<string, unknown>
  ): Promise<string> {
    try {
      const curriculumImport = await this.prisma.curriculumImport.create({
        data: {
          userId,
          grade,
          subject,
          sourceFormat,
          sourceFile,
          status: ImportStatus.PENDING,
          metadata: metadata || {}
        }
      });

      this.logger.info({ importId: curriculumImport.id, userId, grade, subject, sourceFormat }, 
        'Started curriculum import session');

      return curriculumImport.id;
    } catch (error) {
      this.logger.error({ error, userId, grade, subject }, 'Failed to start curriculum import');
      throw new Error('Failed to start import session');
    }
  }

  /**
   * Process curriculum import from various sources
   */
  async processImport(importId: string, outcomes: ImportOutcome[]): Promise<ImportResult> {
    try {
      // Update status to processing
      await this.updateImportStatus(importId, ImportStatus.PROCESSING, outcomes.length);

      const errors: string[] = [];
      const createdOutcomes: { id: string; code: string }[] = [];

      // Process outcomes in batches
      const batchSize = 50;
      for (let i = 0; i < outcomes.length; i += batchSize) {
        const batch = outcomes.slice(i, i + batchSize);
        
        try {
          const batchResults = await this.processBatchOutcomes(importId, batch);
          createdOutcomes.push(...batchResults.outcomes);
          errors.push(...batchResults.errors);

          // Update progress
          await this.updateProgress(importId, i + batch.length);
        } catch (error) {
          this.logger.error({ error, importId, batchIndex: i }, 'Failed to process batch');
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error}`);
        }
      }

      // Generate embeddings for created outcomes
      this.logger.info({ importId, outcomeCount: createdOutcomes.length }, 'Generating embeddings for imported outcomes');
      const embeddingData = createdOutcomes.map(outcome => ({
        id: outcome.id,
        text: `${outcome.code}: ${outcomes.find(o => o.code === outcome.code)?.description || ''}`
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);

      // Generate initial clusters
      const clusters = await this.generateInitialClusters(importId, createdOutcomes.map(o => o.id));

      // Mark as completed
      await this.updateImportStatus(importId, ImportStatus.COMPLETED);
      await this.setCompletionTime(importId);

      this.logger.info({ 
        importId, 
        outcomesCreated: createdOutcomes.length, 
        clustersGenerated: clusters.length,
        errorsCount: errors.length 
      }, 'Completed curriculum import');

      return {
        importId,
        outcomes: createdOutcomes,
        clusters,
        errors
      };
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to process curriculum import');
      await this.updateImportStatus(importId, ImportStatus.FAILED);
      await this.logErrors(importId, [error.toString()]);
      throw error;
    }
  }

  /**
   * Parse CSV content into outcomes
   */
  parseCSV(csvContent: string): ImportOutcome[] {
    try {
      const lines = csvContent.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      const codeIndex = headers.indexOf('code');
      const descriptionIndex = headers.indexOf('description');
      const subjectIndex = headers.indexOf('subject');
      const gradeIndex = headers.indexOf('grade');
      const domainIndex = headers.indexOf('domain');

      if (codeIndex === -1 || descriptionIndex === -1) {
        throw new Error('CSV must contain "code" and "description" columns');
      }

      const outcomes: ImportOutcome[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',').map(col => col.trim().replace(/^"(.*)"$/, '$1'));
        
        if (columns.length < Math.max(codeIndex, descriptionIndex) + 1) {
          this.logger.warn({ lineNumber: i + 1, line }, 'Skipping invalid CSV line');
          continue;
        }

        const outcome: ImportOutcome = {
          code: columns[codeIndex],
          description: columns[descriptionIndex],
          subject: subjectIndex >= 0 ? columns[subjectIndex] : 'Unknown',
          grade: gradeIndex >= 0 ? parseInt(columns[gradeIndex]) || 0 : 0,
          domain: domainIndex >= 0 ? columns[domainIndex] : undefined
        };

        outcomes.push(outcome);
      }

      return outcomes;
    } catch (error) {
      this.logger.error({ error }, 'Failed to parse CSV content');
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }

  /**
   * Extract outcomes from PDF (placeholder for future implementation)
   */
  async parsePDF(): Promise<ImportOutcome[]> {
    // TODO: Implement PDF parsing using pdf-parse or similar library
    this.logger.warn('PDF parsing not yet implemented');
    throw new Error('PDF parsing is not yet implemented. Please use CSV format or manual entry.');
  }

  /**
   * Extract outcomes from DOCX (placeholder for future implementation)
   */
  async parseDOCX(): Promise<ImportOutcome[]> {
    // TODO: Implement DOCX parsing using mammoth or similar library
    this.logger.warn('DOCX parsing not yet implemented');
    throw new Error('DOCX parsing is not yet implemented. Please use CSV format or manual entry.');
  }

  /**
   * Get import progress
   */
  async getImportProgress(importId: string): Promise<ImportProgress | null> {
    try {
      const importRecord = await this.prisma.curriculumImport.findUnique({
        where: { id: importId }
      });

      if (!importRecord) return null;

      return {
        importId,
        status: importRecord.status,
        totalOutcomes: importRecord.totalOutcomes,
        processedOutcomes: importRecord.processedOutcomes,
        errors: (importRecord.errorLog as string[]) || []
      };
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to get import progress');
      return null;
    }
  }

  /**
   * Cancel an import session
   */
  async cancelImport(importId: string): Promise<boolean> {
    try {
      await this.updateImportStatus(importId, ImportStatus.CANCELLED);
      this.logger.info({ importId }, 'Cancelled curriculum import');
      return true;
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to cancel import');
      return false;
    }
  }

  /**
   * Get import history for a user
   */
  async getImportHistory(userId: number, limit: number = 20): Promise<unknown[]> {
    try {
      const imports = await this.prisma.curriculumImport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          clusters: {
            select: {
              id: true,
              clusterName: true,
              clusterType: true
            }
          },
          _count: {
            select: {
              outcomes: true
            }
          }
        }
      });

      return imports;
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to get import history');
      return [];
    }
  }

  // Private helper methods

  private async processBatchOutcomes(importId: string, outcomes: ImportOutcome[]): Promise<{
    outcomes: { id: string; code: string }[];
    errors: string[];
  }> {
    const results: { id: string; code: string }[] = [];
    const errors: string[] = [];

    for (const outcomeData of outcomes) {
      try {
        // Check if outcome already exists
        const existing = await this.prisma.outcome.findUnique({
          where: { code: outcomeData.code }
        });

        if (existing) {
          this.logger.debug({ code: outcomeData.code }, 'Outcome already exists, skipping');
          results.push({ id: existing.id, code: existing.code });
          continue;
        }

        // Create new outcome
        const outcome = await this.prisma.outcome.create({
          data: {
            code: outcomeData.code,
            description: outcomeData.description,
            subject: outcomeData.subject,
            grade: outcomeData.grade,
            domain: outcomeData.domain,
            importId
          }
        });

        results.push({ id: outcome.id, code: outcome.code });
      } catch (error) {
        const errorMsg = `Failed to create outcome ${outcomeData.code}: ${error.message}`;
        this.logger.error({ error, outcome: outcomeData }, errorMsg);
        errors.push(errorMsg);
      }
    }

    return { outcomes: results, errors };
  }

  private async generateInitialClusters(importId: string, outcomeIds: string[]): Promise<{
    id: string;
    name: string;
    outcomeIds: string[];
  }[]> {
    // Simple initial clustering by subject/domain
    // TODO: Implement proper embedding-based clustering in clusteringService
    try {
      const outcomes = await this.prisma.outcome.findMany({
        where: { id: { in: outcomeIds } },
        select: { id: true, subject: true, domain: true, grade: true }
      });

      const subjectGroups = new Map<string, string[]>();
      
      for (const outcome of outcomes) {
        const key = `${outcome.subject}-${outcome.domain || 'General'}-Grade${outcome.grade}`;
        if (!subjectGroups.has(key)) {
          subjectGroups.set(key, []);
        }
        subjectGroups.get(key)!.push(outcome.id);
      }

      const clusters = [];
      for (const [clusterName, ids] of subjectGroups.entries()) {
        if (ids.length > 1) { // Only create clusters with multiple outcomes
          const cluster = await this.prisma.outcomeCluster.create({
            data: {
              importId,
              clusterName,
              clusterType: 'subject',
              outcomeIds: ids,
              confidence: 0.7 // Initial clustering confidence
            }
          });

          clusters.push({
            id: cluster.id,
            name: cluster.clusterName,
            outcomeIds: ids
          });
        }
      }

      return clusters;
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to generate initial clusters');
      return [];
    }
  }

  private async updateImportStatus(importId: string, status: ImportStatus, totalOutcomes?: number): Promise<void> {
    const updateData: unknown = { status };
    if (totalOutcomes !== undefined) {
      updateData.totalOutcomes = totalOutcomes;
    }

    await this.prisma.curriculumImport.update({
      where: { id: importId },
      data: updateData
    });
  }

  private async updateProgress(importId: string, processedOutcomes: number): Promise<void> {
    await this.prisma.curriculumImport.update({
      where: { id: importId },
      data: { processedOutcomes }
    });
  }

  private async setCompletionTime(importId: string): Promise<void> {
    await this.prisma.curriculumImport.update({
      where: { id: importId },
      data: { completedAt: new Date() }
    });
  }

  private async logErrors(importId: string, errors: string[]): Promise<void> {
    await this.prisma.curriculumImport.update({
      where: { id: importId },
      data: { errorLog: errors }
    });
  }
}

// Export singleton instance
export const curriculumImportService = new CurriculumImportService();