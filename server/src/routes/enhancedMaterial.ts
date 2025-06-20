import { Router } from 'express';
import { enhancedMaterialService } from '../services/enhancedMaterialService';
import logger from '../logger';

const router = Router();

// Generate bulk materials
router.post('/bulk/generate', async (req, res, next) => {
  try {
    const {
      activityIds,
      format = 'pdf',
      includeInstructions = true,
      groupByTheme = true,
    } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: 'activityIds must be a non-empty array' });
    }

    const result = await enhancedMaterialService.generateBulkMaterials({
      activityIds,
      format,
      includeInstructions,
      groupByTheme,
    });

    // If ZIP was generated, return download link
    if (result.zipPath) {
      const filename = result.zipPath.split('/').pop();
      res.json({
        ...result,
        downloadUrl: `/api/enhanced-materials/download/${filename}`,
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    logger.error({ error }, 'Failed to generate bulk materials');
    next(error);
  }
});

// Generate consolidated material list
router.post('/list/consolidated', async (req, res, next) => {
  try {
    const { activityIds } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: 'activityIds must be a non-empty array' });
    }

    const result = await enhancedMaterialService.generateConsolidatedMaterialList(activityIds);

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Failed to generate consolidated material list');
    next(error);
  }
});

// Get available templates
router.get('/templates', async (req, res, next) => {
  try {
    const templates = enhancedMaterialService.getAvailableTemplates();
    res.json(templates);
  } catch (error) {
    logger.error({ error }, 'Failed to get templates');
    next(error);
  }
});

// Create custom template
router.post('/templates', async (req, res, next) => {
  try {
    const { name, description, template, variables, category } = req.body;

    if (!name || !template || !Array.isArray(variables) || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, template, variables (array), category' 
      });
    }

    const templateId = await enhancedMaterialService.createMaterialTemplate({
      name,
      description: description || '',
      template,
      variables,
      category,
    });

    res.json({
      message: 'Template created successfully',
      templateId,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to create template');
    next(error);
  }
});

// Generate from template
router.post('/templates/:templateId/generate', async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { variables, outputFormat = 'pdf' } = req.body;

    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({ error: 'variables must be an object' });
    }

    const filePath = await enhancedMaterialService.generateFromTemplate(
      templateId,
      variables,
      outputFormat as 'pdf' | 'docx'
    );

    const filename = filePath.split('/').pop();
    res.json({
      message: 'Material generated successfully',
      downloadUrl: `/api/enhanced-materials/download/${filename}`,
    });
  } catch (error) {
    logger.error({ error }, 'Failed to generate from template');
    next(error);
  }
});

// Analyze material usage
router.get('/usage/analysis', async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const analysis = await enhancedMaterialService.analyzeMaterialUsage(
      1, // TODO: Get userId from auth context
      Number(days)
    );

    res.json(analysis);
  } catch (error) {
    logger.error({ error }, 'Failed to analyze material usage');
    next(error);
  }
});

// Download generated file
router.get('/download/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Security: Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    // TODO: Implement proper file serving with security checks
    res.status(501).json({ error: 'File download not yet implemented' });
  } catch (error) {
    logger.error({ error }, 'Failed to download file');
    next(error);
  }
});

export default router;