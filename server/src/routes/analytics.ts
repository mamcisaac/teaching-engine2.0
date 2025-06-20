/**
 * Analytics API Routes
 *
 * Provides endpoints for accessing analytics data and insights
 * for Teaching Engine 2.0 dashboards and visualizations.
 */

import express from 'express';
import {
  curriculumAnalyticsService,
  domainAnalyticsService,
  themeAnalyticsService,
  vocabularyAnalyticsService,
  exportService,
  analyticsCache,
} from '../services/analytics';

const router = express.Router();

/**
 * Curriculum Analytics Endpoints
 */

// GET /api/analytics/curriculum-heatmap
router.get('/curriculum-heatmap', async (req, res) => {
  try {
    const {
      teacherId,
      subject,
      domain,
      viewMode = 'planned',
      startWeek,
      endWeek,
      year,
    } = req.query;

    // Validate viewMode parameter
    const validViewModes = ['planned', 'taught', 'assessed', 'reinforced'];
    const validatedViewMode = validViewModes.includes(viewMode as string)
      ? (viewMode as 'planned' | 'taught' | 'assessed' | 'reinforced')
      : 'planned';

    const params = {
      ...(teacherId && { teacherId: parseInt(teacherId as string) }),
      ...(subject && { subject: subject as string }),
      ...(domain && { domain: domain as string }),
      viewMode: validatedViewMode,
      ...(startWeek && { startWeek: parseInt(startWeek as string) }),
      ...(endWeek && { endWeek: parseInt(endWeek as string) }),
      ...(year && { year: parseInt(year as string) }),
    };

    const heatmapData = await curriculumAnalyticsService.generateHeatmapData(params);
    res.json(heatmapData);
  } catch (error) {
    console.error('Error generating curriculum heatmap:', error);
    res.status(500).json({
      error: 'Failed to generate curriculum heatmap',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/curriculum-summary
router.get('/curriculum-summary', async (req, res) => {
  try {
    const { teacherId, subject, term, year } = req.query;

    const params = {
      ...(teacherId && { teacherId: parseInt(teacherId as string) }),
      ...(subject && { subject: subject as string }),
      ...(term && { term: term as string }),
      ...(year && { year: parseInt(year as string) }),
    };

    const summary = await curriculumAnalyticsService.getCurriculumSummary(params);
    res.json(summary);
  } catch (error) {
    console.error('Error generating curriculum summary:', error);
    res.status(500).json({
      error: 'Failed to generate curriculum summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Domain Analytics Endpoints
 */

// GET /api/analytics/domain-strength/:studentId
router.get('/domain-strength/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, compareTo, teacherId } = req.query;

    // const params = {
    //   studentId: parseInt(studentId),
    //   ...(term && { term: term as string }),
    //   ...(compareTo && { compareTo: compareTo as string }),
    //   ...(teacherId && { teacherId: parseInt(teacherId as string) }),
    // };

    const params = {
      studentId: parseInt(studentId),
      ...(term && { term: term as string }),
      ...(compareTo && { compareTo: compareTo as string }),
    };

    const radarData = await domainAnalyticsService.generateStudentRadar(params);
    res.json(radarData);
  } catch (error) {
    console.error('Error generating domain strength radar:', error);
    res.status(500).json({
      error: 'Failed to generate domain strength radar',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/class-domain-summary
router.get('/class-domain-summary', async (req, res) => {
  try {
    const { teacherId, term, grade } = req.query;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    // const params = {
    //   teacherId: parseInt(teacherId as string),
    //   ...(term && { term: term as string }),
    //   ...(grade && { grade: parseInt(grade as string) }),
    // };

    const params = {
      teacherId: parseInt(teacherId as string),
      ...(term && { term: term as string }),
      ...(grade && { grade: parseInt(grade as string) }),
    };

    const summary = await domainAnalyticsService.generateClassSummary(params);
    res.json(summary);
  } catch (error) {
    console.error('Error generating class domain summary:', error);
    res.status(500).json({
      error: 'Failed to generate class domain summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/domain-trends/:studentId/:domain
router.get('/domain-trends/:studentId/:domain', async (req, res) => {
  try {
    const { studentId, domain } = req.params;
    const { weekCount, teacherId } = req.query;

    // const params = {
    //   studentId: parseInt(studentId),
    //   domain,
    //   ...(weekCount && { weekCount: parseInt(weekCount as string) }),
    //   ...(teacherId && { teacherId: parseInt(teacherId as string) }),
    // };

    const params = {
      studentId: parseInt(studentId),
      domain,
      ...(weekCount && { weekCount: parseInt(weekCount as string) }),
    };

    const trendData = await domainAnalyticsService.generateDomainTrends(params);
    res.json(trendData);
  } catch (error) {
    console.error('Error generating domain trends:', error);
    res.status(500).json({
      error: 'Failed to generate domain trends',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Theme Analytics Endpoints
 */

// GET /api/analytics/theme-usage
router.get('/theme-usage', async (req, res) => {
  try {
    const { teacherId, term, subject, year } = req.query;

    // const params = {
    //   ...(teacherId && { teacherId: parseInt(teacherId as string) }),
    //   ...(term && { term: term as string }),
    //   ...(subject && { subject: subject as string }),
    //   ...(year && { year: parseInt(year as string) }),
    // };

    const params = {
      ...(teacherId && { teacherId: parseInt(teacherId as string) }),
      ...(term && { term: term as string }),
      ...(subject && { subject: subject as string }),
    };

    const analytics = await themeAnalyticsService.getThemeUsageAnalytics(params);
    res.json(analytics);
  } catch (error) {
    console.error('Error generating theme analytics:', error);
    res.status(500).json({
      error: 'Failed to generate theme analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/theme-matrix
router.get('/theme-matrix', async (req, res) => {
  try {
    const { teacherId, term, viewBy = 'domain', year } = req.query;

    // const params = {
    //   ...(teacherId && { teacherId: parseInt(teacherId as string) }),
    //   ...(term && { term: term as string }),
    //   viewBy: viewBy as 'domain' | 'subject',
    //   ...(year && { year: parseInt(year as string) }),
    // };

    const params = {
      ...(teacherId && { teacherId: parseInt(teacherId as string) }),
      ...(term && { term: term as string }),
    };

    const matrixData = await themeAnalyticsService.getThemeMatrix(params);
    res.json(matrixData);
  } catch (error) {
    console.error('Error generating theme matrix:', error);
    res.status(500).json({
      error: 'Failed to generate theme matrix',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/theme-trends/:theme
router.get('/theme-trends/:theme', async (req, res) => {
  try {
    const { theme } = req.params;
    const { teacherId, weekCount, year } = req.query;

    // const params = {
    //   theme: decodeURIComponent(theme),
    //   ...(teacherId && { teacherId: parseInt(teacherId as string) }),
    //   ...(weekCount && { weekCount: parseInt(weekCount as string) }),
    //   ...(year && { year: parseInt(year as string) }),
    // };

    // For now, return empty trends data as the method doesn't exist yet
    res.json({ trends: [], message: 'Theme trends visualization coming soon' });
  } catch (error) {
    console.error('Error generating theme trends:', error);
    res.status(500).json({
      error: 'Failed to generate theme trends',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Vocabulary Analytics Endpoints
 */

// GET /api/analytics/vocabulary-growth/:studentId
router.get('/vocabulary-growth/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, teacherId, weekCount } = req.query;

    const params = {
      studentId: parseInt(studentId),
      ...(term && { term: term as string }),
      ...(teacherId && { teacherId: parseInt(teacherId as string) }),
      ...(weekCount && { weekCount: parseInt(weekCount as string) }),
    };

    const growthData = await vocabularyAnalyticsService.generateStudentGrowthData(params);
    res.json(growthData);
  } catch (error) {
    console.error('Error generating vocabulary growth data:', error);
    res.status(500).json({
      error: 'Failed to generate vocabulary growth data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/bilingual-vocabulary/:studentId
router.get('/bilingual-vocabulary/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, teacherId } = req.query;

    const params = {
      studentId: parseInt(studentId),
      ...(term && { term: term as string }),
      ...(teacherId && { teacherId: parseInt(teacherId as string) }),
    };

    const bilingualData = await vocabularyAnalyticsService.generateBilingualAnalytics(params);
    res.json(bilingualData);
  } catch (error) {
    console.error('Error generating bilingual vocabulary data:', error);
    res.status(500).json({
      error: 'Failed to generate bilingual vocabulary data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/analytics/class-vocabulary-summary
router.get('/class-vocabulary-summary', async (req, res) => {
  try {
    const { teacherId, term, grade } = req.query;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId is required' });
    }

    const params = {
      teacherId: parseInt(teacherId as string),
      ...(term && { term: term as string }),
      ...(grade && { grade: parseInt(grade as string) }),
    };

    const summary = await vocabularyAnalyticsService.generateClassSummary(params);
    res.json(summary);
  } catch (error) {
    console.error('Error generating class vocabulary summary:', error);
    res.status(500).json({
      error: 'Failed to generate class vocabulary summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Export Endpoints
 */

// POST /api/analytics/export
router.post('/export', async (req, res) => {
  try {
    const { type, format, data, options } = req.body;

    if (!type || !format || !data) {
      return res.status(400).json({
        error: 'Missing required fields: type, format, and data are required',
      });
    }

    const exportRequest = { type, format, data, options };
    const result = await exportService.exportData(exportRequest);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length.toString(),
    });

    res.send(result.buffer);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Cache Management Endpoints
 */

// POST /api/analytics/invalidate-cache
router.post('/invalidate-cache', async (req, res) => {
  try {
    const { service, teacherId, studentId } = req.body;

    switch (service) {
      case 'curriculum':
        analyticsCache.invalidatePattern(`curriculum.*${teacherId || ''}`);
        break;
      case 'domain':
        if (studentId) {
          analyticsCache.invalidatePattern(`domain.*student.*${studentId}`);
        } else if (teacherId) {
          analyticsCache.invalidatePattern(`domain.*teacher.*${teacherId}`);
        }
        break;
      case 'theme':
        analyticsCache.invalidatePattern('theme.*');
        break;
      case 'vocabulary':
        if (studentId) {
          analyticsCache.invalidatePattern(`vocabulary.*student.*${studentId}`);
        } else if (teacherId) {
          analyticsCache.invalidatePattern(`vocabulary.*teacher.*${teacherId}`);
        }
        break;
      case 'all':
        analyticsCache.clear();
        break;
      default:
        return res.status(400).json({ error: 'Invalid service specified' });
    }

    res.json({ success: true, message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      error: 'Failed to invalidate cache',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health Check Endpoint
 */

// GET /api/analytics/health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      curriculum: 'operational',
      domain: 'operational',
      theme: 'operational',
      vocabulary: 'operational',
      export: 'operational',
    },
  });
});

export default router;
