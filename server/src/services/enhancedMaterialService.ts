import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { extractMaterials } from './materialGenerator';
import BaseService from './base/BaseService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
const tempDir = path.join(__dirname, '../../temp');

export interface BulkMaterialRequest {
  activityIds: number[];
  format: 'pdf' | 'docx' | 'zip';
  includeInstructions: boolean;
  groupByTheme: boolean;
}

export interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: 'worksheet' | 'assessment' | 'activity' | 'handout';
}

export interface GeneratedMaterial {
  activityId: number;
  activityTitle: string;
  materials: string[];
  filePaths: string[];
  instructions?: string;
  estimatedPrepTime: number;
}

export class EnhancedMaterialService extends BaseService {
  private templates: Map<string, MaterialTemplate> = new Map();

  constructor() {
    super('EnhancedMaterialService');
    this.initializeTemplates();
    this.ensureDirectories();
  }

  /**
   * Generate materials for multiple activities in bulk
   */
  async generateBulkMaterials(request: BulkMaterialRequest): Promise<{
    zipPath?: string;
    materials: GeneratedMaterial[];
    totalPrepTime: number;
    errors: string[];
  }> {
    try {
      this.logger.info({ 
        activityCount: request.activityIds.length, 
        format: request.format 
      }, 'Starting bulk material generation');

      const materials: GeneratedMaterial[] = [];
      const errors: string[] = [];
      let totalPrepTime = 0;

      // Get activities with their details
      const activities = await this.prisma.activity.findMany({
        where: { id: { in: request.activityIds } },
        include: {
          milestone: {
            include: {
              subject: true
            }
          },
          outcomes: {
            include: {
              outcome: true
            }
          }
        }
      });

      // Group by theme if requested
      let activityGroups: typeof activities[];
      if (request.groupByTheme) {
        activityGroups = this.groupActivitiesByTheme(activities);
      } else {
        activityGroups = [activities];
      }

      // Generate materials for each group
      for (const group of activityGroups) {
        for (const activity of group) {
          try {
            const generatedMaterial = await this.generateActivityMaterials(activity, request);
            materials.push(generatedMaterial);
            totalPrepTime += generatedMaterial.estimatedPrepTime;
          } catch (error) {
            const errorMsg = `Failed to generate materials for activity ${activity.id}: ${error.message}`;
            this.logger.error({ error, activityId: activity.id }, errorMsg);
            errors.push(errorMsg);
          }
        }
      }

      // Create ZIP archive if requested
      let zipPath: string | undefined;
      if (request.format === 'zip' && materials.length > 0) {
        zipPath = await this.createMaterialsZip(materials, request.groupByTheme);
      }

      this.logger.info({ 
        materialsGenerated: materials.length, 
        totalPrepTime, 
        errorsCount: errors.length 
      }, 'Completed bulk material generation');

      return {
        zipPath,
        materials,
        totalPrepTime,
        errors
      };
    } catch (error) {
      this.logger.error({ error, request }, 'Failed bulk material generation');
      throw new Error(`Bulk material generation failed: ${error.message}`);
    }
  }

  /**
   * Generate a consolidated material list for multiple activities
   */
  async generateConsolidatedMaterialList(activityIds: number[]): Promise<{
    allMaterials: string[];
    byCategory: { [category: string]: string[] };
    duplicatesRemoved: number;
    estimatedCost?: number;
  }> {
    try {
      const activities = await this.prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true, title: true, privateNote: true, publicNote: true }
      });

      const allMaterialsSet = new Set<string>();
      const byCategory: { [category: string]: string[] } = {};
      let originalCount = 0;

      for (const activity of activities) {
        const allNotes = [activity.privateNote, activity.publicNote].filter(Boolean).join('\n');
        const materials = extractMaterials(allNotes);
        originalCount += materials.length;

        for (const material of materials) {
          allMaterialsSet.add(material.toLowerCase().trim());
          
          // Categorize materials
          const category = this.categorizeMaterial(material);
          if (!byCategory[category]) byCategory[category] = [];
          
          // Avoid duplicates in categories too
          const normalizedMaterial = material.trim();
          if (!byCategory[category].includes(normalizedMaterial)) {
            byCategory[category].push(normalizedMaterial);
          }
        }
      }

      const allMaterials = Array.from(allMaterialsSet);
      const duplicatesRemoved = originalCount - allMaterials.length;

      // Sort materials for better organization
      allMaterials.sort();
      Object.keys(byCategory).forEach(category => {
        byCategory[category].sort();
      });

      return {
        allMaterials,
        byCategory,
        duplicatesRemoved,
        estimatedCost: this.estimateMaterialCost(allMaterials)
      };
    } catch (error) {
      this.logger.error({ error, activityIds }, 'Failed to generate consolidated material list');
      throw error;
    }
  }

  /**
   * Create custom material templates
   */
  async createMaterialTemplate(template: Omit<MaterialTemplate, 'id'>): Promise<string> {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTemplate: MaterialTemplate = {
      id,
      ...template
    };

    this.templates.set(id, newTemplate);
    
    // TODO: Persist templates to database
    this.logger.info({ templateId: id, name: template.name }, 'Created new material template');
    
    return id;
  }

  /**
   * Get available material templates
   */
  getAvailableTemplates(): MaterialTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Generate materials using a specific template
   */
  async generateFromTemplate(
    templateId: string, 
    variables: { [key: string]: string },
    outputFormat: 'pdf' | 'docx' = 'pdf'
  ): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let content = template.template;
    
    // Replace template variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    // Generate file
    const fileName = `${template.name}_${Date.now()}.${outputFormat}`;
    const filePath = path.join(tempDir, fileName);

    // For now, just save as text file - TODO: Implement PDF/DOCX generation
    fs.writeFileSync(filePath.replace(`.${outputFormat}`, '.txt'), content);

    this.logger.info({ templateId, fileName }, 'Generated material from template');
    
    return filePath;
  }

  /**
   * Analyze material usage patterns
   */
  async analyzeMaterialUsage(userId: number, days: number = 30): Promise<{
    mostUsedMaterials: { material: string; count: number }[];
    categoryDistribution: { category: string; percentage: number }[];
    trends: string[];
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const activities = await this.prisma.activity.findMany({
        where: {
          milestone: { userId }
        },
        select: { privateNote: true, publicNote: true }
      });

      const materialCounts = new Map<string, number>();
      const categoryCounts = new Map<string, number>();

      for (const activity of activities) {
        const allNotes = [activity.privateNote, activity.publicNote].filter(Boolean).join('\n');
        const materials = extractMaterials(allNotes);
        
        for (const material of materials) {
          const normalizedMaterial = material.toLowerCase().trim();
          materialCounts.set(normalizedMaterial, (materialCounts.get(normalizedMaterial) || 0) + 1);
          
          const category = this.categorizeMaterial(material);
          categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
        }
      }

      // Most used materials
      const mostUsedMaterials = Array.from(materialCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([material, count]) => ({ material, count }));

      // Category distribution
      const totalMaterials = Array.from(categoryCounts.values()).reduce((a, b) => a + b, 0);
      const categoryDistribution = Array.from(categoryCounts.entries())
        .map(([category, count]) => ({
          category,
          percentage: totalMaterials > 0 ? (count / totalMaterials) * 100 : 0
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Generate trends
      const trends: string[] = [];
      if (mostUsedMaterials.length > 0) {
        trends.push(`Most frequently used: ${mostUsedMaterials[0].material} (${mostUsedMaterials[0].count} times)`);
      }
      
      if (categoryDistribution.length > 0) {
        trends.push(`Primary category: ${categoryDistribution[0].category} (${categoryDistribution[0].percentage.toFixed(1)}%)`);
      }

      return {
        mostUsedMaterials,
        categoryDistribution,
        trends
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to analyze material usage');
      return {
        mostUsedMaterials: [],
        categoryDistribution: [],
        trends: []
      };
    }
  }

  // Private helper methods

  private async generateActivityMaterials(
    activity: any, 
    request: BulkMaterialRequest
  ): Promise<GeneratedMaterial> {
    const allNotes = [activity.privateNote, activity.publicNote].filter(Boolean).join('\n');
    const materials = extractMaterials(allNotes);
    const filePaths: string[] = [];
    
    // Generate instruction file if requested
    let instructions: string | undefined;
    if (request.includeInstructions) {
      instructions = this.generateInstructions(activity, materials);
      
      const instructionFile = path.join(tempDir, `instructions_${activity.id}.txt`);
      fs.writeFileSync(instructionFile, instructions);
      filePaths.push(instructionFile);
    }

    // Estimate preparation time (5 minutes base + 2 minutes per material)
    const estimatedPrepTime = 5 + (materials.length * 2);

    return {
      activityId: activity.id,
      activityTitle: activity.title,
      materials,
      filePaths,
      instructions,
      estimatedPrepTime
    };
  }

  private groupActivitiesByTheme(activities: any[]): typeof activities[] {
    // Simple grouping by subject and grade level
    const groups = new Map<string, typeof activities>();
    
    for (const activity of activities) {
      const subject = activity.milestone?.subject?.name || 'Unknown';
      const outcomes = activity.outcomes?.map((ao: any) => ao.outcome.grade).join(',') || '0';
      const key = `${subject}_${outcomes}`;
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(activity);
    }

    return Array.from(groups.values());
  }

  private async createMaterialsZip(
    materials: GeneratedMaterial[], 
    groupByTheme: boolean
  ): Promise<string> {
    const zipFileName = `materials_${Date.now()}.zip`;
    const zipPath = path.join(uploadDir, zipFileName);
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => {
        this.logger.info({ zipPath, totalBytes: archive.pointer() }, 'Created materials ZIP');
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        this.logger.error({ error: err }, 'Failed to create materials ZIP');
        reject(err);
      });

      archive.pipe(output);

      // Add materials to ZIP
      for (const material of materials) {
        const folderName = groupByTheme ? 
          `${material.activityTitle.replace(/[^a-zA-Z0-9]/g, '_')}/` : '';

        // Add material list
        const materialList = material.materials.join('\n');
        archive.append(materialList, { name: `${folderName}materials_${material.activityId}.txt` });

        // Add instruction file if exists
        if (material.instructions) {
          archive.append(material.instructions, { name: `${folderName}instructions_${material.activityId}.txt` });
        }

        // Add any generated files
        for (const filePath of material.filePaths) {
          if (fs.existsSync(filePath)) {
            const fileName = path.basename(filePath);
            archive.file(filePath, { name: `${folderName}${fileName}` });
          }
        }
      }

      // Add summary file
      const summary = this.generateBulkSummary(materials);
      archive.append(summary, { name: 'SUMMARY.txt' });

      archive.finalize();
    });
  }

  private generateInstructions(activity: any, materials: string[]): string {
    const instructions = [
      `PREPARATION INSTRUCTIONS FOR: ${activity.title}`,
      '=' .repeat(50),
      '',
      'MATERIALS NEEDED:',
      ...materials.map(m => `• ${m}`),
      '',
      'PREPARATION STEPS:',
      '1. Gather all materials listed above',
      '2. Set up workspace/classroom layout',
      '3. Prepare any copies or handouts needed',
      '4. Test any technology or equipment',
      '5. Review activity objectives and outcomes',
      '',
      'ESTIMATED PREP TIME: ' + (5 + materials.length * 2) + ' minutes',
      '',
      'NOTES:',
      [activity.privateNote, activity.publicNote].filter(Boolean).join('\n') || 'No additional notes provided'
    ];

    return instructions.join('\n');
  }

  private generateBulkSummary(materials: GeneratedMaterial[]): string {
    const totalActivities = materials.length;
    const totalPrepTime = materials.reduce((sum, m) => sum + m.estimatedPrepTime, 0);
    const uniqueMaterials = new Set<string>();
    
    materials.forEach(m => m.materials.forEach(mat => uniqueMaterials.add(mat.toLowerCase())));

    const summary = [
      'BULK MATERIALS GENERATION SUMMARY',
      '=' .repeat(40),
      '',
      `Total Activities: ${totalActivities}`,
      `Total Preparation Time: ${totalPrepTime} minutes (${Math.round(totalPrepTime / 60 * 10) / 10} hours)`,
      `Unique Materials Needed: ${uniqueMaterials.size}`,
      '',
      'ACTIVITIES INCLUDED:',
      ...materials.map(m => `• ${m.activityTitle} (${m.estimatedPrepTime} min prep)`),
      '',
      'ALL UNIQUE MATERIALS:',
      ...Array.from(uniqueMaterials).sort().map(m => `• ${m}`),
      '',
      `Generated on: ${new Date().toLocaleString()}`,
    ];

    return summary.join('\n');
  }

  private categorizeMaterial(material: string): string {
    const materialLower = material.toLowerCase();
    
    if (materialLower.includes('paper') || materialLower.includes('worksheet') || materialLower.includes('handout')) {
      return 'Paper Materials';
    }
    if (materialLower.includes('pen') || materialLower.includes('pencil') || materialLower.includes('marker') || materialLower.includes('crayon')) {
      return 'Writing Tools';
    }
    if (materialLower.includes('computer') || materialLower.includes('tablet') || materialLower.includes('laptop')) {
      return 'Technology';
    }
    if (materialLower.includes('book') || materialLower.includes('textbook')) {
      return 'Books';
    }
    if (materialLower.includes('scissors') || materialLower.includes('glue') || materialLower.includes('tape')) {
      return 'Craft Supplies';
    }
    
    return 'General Supplies';
  }

  private estimateMaterialCost(materials: string[]): number {
    // Simple cost estimation based on material types
    let totalCost = 0;
    
    for (const material of materials) {
      const materialLower = material.toLowerCase();
      
      if (materialLower.includes('paper')) totalCost += 0.05;
      else if (materialLower.includes('pen') || materialLower.includes('pencil')) totalCost += 1.00;
      else if (materialLower.includes('book')) totalCost += 15.00;
      else if (materialLower.includes('computer') || materialLower.includes('tablet')) totalCost += 0; // Assume already owned
      else totalCost += 2.00; // Default for other supplies
    }
    
    return Math.round(totalCost * 100) / 100;
  }

  private initializeTemplates(): void {
    // Initialize some default templates
    this.templates.set('worksheet_basic', {
      id: 'worksheet_basic',
      name: 'Basic Worksheet',
      description: 'Simple worksheet template with title and questions',
      template: `{{title}}

Name: _________________ Date: _________________

{{instructions}}

{{questions}}

`,
      variables: ['title', 'instructions', 'questions'],
      category: 'worksheet'
    });

    this.templates.set('activity_plan', {
      id: 'activity_plan',
      name: 'Activity Plan',
      description: 'Structured activity plan template',
      template: `ACTIVITY PLAN: {{title}}

OBJECTIVE: {{objective}}

MATERIALS NEEDED:
{{materials}}

INSTRUCTIONS:
{{instructions}}

ASSESSMENT:
{{assessment}}

TIME: {{duration}} minutes
`,
      variables: ['title', 'objective', 'materials', 'instructions', 'assessment', 'duration'],
      category: 'activity'
    });
  }

  private ensureDirectories(): void {
    [uploadDir, tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
}

// Export singleton instance
export const enhancedMaterialService = new EnhancedMaterialService();