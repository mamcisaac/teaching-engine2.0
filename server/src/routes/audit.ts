import { Router } from 'express';
import { z } from 'zod';
import {
  CurriculumAuditService,
  OutcomeCoverage,
  AuditFilters,
  CoverageSummary,
} from '../services/curriculumAuditService';

const router = Router();
const auditService = new CurriculumAuditService();

/**
 * GET /api/audit/curriculum-coverage
 * Get curriculum coverage audit data
 */
router.get('/curriculum-coverage', async (req, res) => {
  try {
    // Validate query parameters
    const querySchema = z.object({
      classId: z.string().optional(),
      term: z.string().optional(),
      subject: z.string().optional(),
      grade: z.string().optional(),
      domain: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });

    const query = querySchema.parse(req.query);

    // Build filters
    const filters = {
      userId: req.user?.userId,
      classId: query.classId ? parseInt(query.classId) : undefined,
      term: query.term,
      subject: query.subject,
      grade: query.grade ? parseInt(query.grade) : undefined,
      domain: query.domain,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const coverage = await auditService.getCurriculumCoverage(filters);

    res.json(coverage);
  } catch (error) {
    console.error('Error fetching curriculum coverage:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to fetch curriculum coverage' });
    }
  }
});

/**
 * GET /api/audit/curriculum-coverage/summary
 * Get curriculum coverage summary statistics
 */
router.get('/curriculum-coverage/summary', async (req, res) => {
  try {
    // Use same query validation as main endpoint
    const querySchema = z.object({
      classId: z.string().optional(),
      term: z.string().optional(),
      subject: z.string().optional(),
      grade: z.string().optional(),
      domain: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });

    const query = querySchema.parse(req.query);

    // Build filters
    const filters = {
      userId: req.user?.userId,
      classId: query.classId ? parseInt(query.classId) : undefined,
      term: query.term,
      subject: query.subject,
      grade: query.grade ? parseInt(query.grade) : undefined,
      domain: query.domain,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const summary = await auditService.getCoverageSummary(filters);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching coverage summary:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to fetch coverage summary' });
    }
  }
});

/**
 * GET /api/audit/curriculum-coverage/export
 * Export curriculum coverage data in various formats
 */
router.get('/curriculum-coverage/export', async (req, res) => {
  try {
    const querySchema = z.object({
      format: z.enum(['csv', 'markdown', 'json']).default('json'),
      classId: z.string().optional(),
      term: z.string().optional(),
      subject: z.string().optional(),
      grade: z.string().optional(),
      domain: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });

    const query = querySchema.parse(req.query);

    // Build filters
    const filters = {
      userId: req.user?.userId,
      classId: query.classId ? parseInt(query.classId) : undefined,
      term: query.term,
      subject: query.subject,
      grade: query.grade ? parseInt(query.grade) : undefined,
      domain: query.domain,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    const coverage = await auditService.getCurriculumCoverage(filters);
    const summary = await auditService.getCoverageSummary(filters);

    switch (query.format) {
      case 'csv': {
        const csv = generateCSV(coverage);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="curriculum-audit.csv"');
        res.send(csv);
        break;
      }

      case 'markdown': {
        const markdown = generateMarkdown(coverage, summary, filters);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', 'attachment; filename="curriculum-audit.md"');
        res.send(markdown);
        break;
      }

      default:
        res.json({ coverage, summary });
    }
  } catch (error) {
    console.error('Error exporting curriculum coverage:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to export curriculum coverage' });
    }
  }
});

// Helper functions for export formats
function generateCSV(coverage: OutcomeCoverage[]): string {
  const headers = [
    'Outcome Code',
    'Description',
    'Domain',
    'Times Covered',
    'Assessed',
    'Last Used',
  ];
  const rows = coverage.map((item) => [
    item.outcomeCode,
    `"${item.outcomeDescription.replace(/"/g, '""')}"`,
    item.domain || '',
    item.coveredCount,
    item.assessed ? 'Yes' : 'No',
    item.lastUsed ? new Date(item.lastUsed).toISOString().split('T')[0] : '',
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

function generateMarkdown(
  coverage: OutcomeCoverage[],
  summary: CoverageSummary,
  filters: AuditFilters,
): string {
  const date = new Date().toLocaleDateString();
  let markdown = `# Curriculum Coverage Audit Report\n\n`;
  markdown += `**Generated:** ${date}\n\n`;

  if (filters.term) markdown += `**Term:** ${filters.term}\n`;
  if (filters.subject) markdown += `**Subject:** ${filters.subject}\n`;
  if (filters.grade) markdown += `**Grade:** ${filters.grade}\n`;
  if (filters.domain) markdown += `**Domain:** ${filters.domain}\n`;

  markdown += `\n## Summary\n\n`;
  markdown += `- **Total Outcomes:** ${summary.total}\n`;
  markdown += `- **Covered:** ${summary.covered} (${summary.coveragePercentage}%)\n`;
  markdown += `- **Assessed:** ${summary.assessed} (${summary.assessmentPercentage}%)\n`;
  markdown += `- **Overused (>3x):** ${summary.overused}\n`;
  markdown += `- **Not Covered:** ${summary.uncovered}\n`;

  markdown += `\n## Detailed Coverage\n\n`;
  markdown += `| Outcome | Description | Domain | Covered | Assessed | Overused | Last Used |\n`;
  markdown += `|---------|-------------|--------|---------|----------|----------|------------|\n`;

  coverage.forEach((item) => {
    const covered = item.coveredCount > 0 ? '✅' : '❌';
    const assessed = item.assessed ? '✅' : '❌';
    const overused = item.coveredCount > 3 ? '⚠️' : '✅';
    const lastUsed = item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : '—';

    markdown += `| ${item.outcomeCode} | ${item.outcomeDescription} | ${item.domain || '—'} | ${covered} | ${assessed} | ${overused} | ${lastUsed} |\n`;
  });

  return markdown;
}

export default router;
