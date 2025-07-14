/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lesson Template Provider
 * Provides templates for lesson plans
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import type { Template, TemplateContext, DataRequirement } from './TemplateProvider';
import { TemplateProvider } from './TemplateProvider';

export class LessonTemplateProvider extends TemplateProvider {
  constructor() {
    super('LessonTemplateProvider');
    this.loadTemplates();
  }

  /**
   * Get template based on context
   */
  async getTemplate(context: TemplateContext): Promise<Template> {
    // Determine template based on parameters
    const templateType = context.parameters?.type || 'standard';
    const grade = context.parameters?.grade;
    const subject = context.parameters?.subject;

    // Build template ID
    let templateId = `lesson-${templateType}`;
    if (grade) {
      templateId += `-grade${grade}`;
    }
    if (subject) {
      templateId += `-${String(subject).toLowerCase()}`;
    }

    // Try specific template first, fall back to general
    let template = await this.getTemplateById(templateId);
    if (!template) {
      template = await this.getTemplateById(`lesson-${templateType}`);
    }
    if (!template) {
      template = await this.getTemplateById('lesson-standard');
    }

    if (!template) {
      throw new Error(`No lesson template found for context: ${JSON.stringify(context)}`);
    }

    return template;
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Validate context
   */
  validateContext(context: TemplateContext): boolean {
    return context.userId != null && context.userId !== 0;
  }

  /**
   * Load templates
   */
  protected async loadTemplates(): Promise<void> {
    // Register standard lesson template
    this.registerTemplate({
      id: 'lesson-standard',
      name: 'Standard Lesson Plan',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html'],
      content: this.getStandardLessonTemplate(),
      dataRequirements: this.getStandardDataRequirements(),
      metadata: {
        version: '1.0',
        tags: ['lesson', 'standard', 'etfo'],
      },
    });

    // Register detailed lesson template
    this.registerTemplate({
      id: 'lesson-detailed',
      name: 'Detailed Lesson Plan',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html'],
      content: this.getDetailedLessonTemplate(),
      dataRequirements: this.getDetailedDataRequirements(),
      metadata: {
        version: '1.0',
        tags: ['lesson', 'detailed', 'comprehensive'],
      },
    });

    // Register quick lesson template
    this.registerTemplate({
      id: 'lesson-quick',
      name: 'Quick Lesson Plan',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html'],
      content: this.getQuickLessonTemplate(),
      dataRequirements: this.getQuickDataRequirements(),
      metadata: {
        version: '1.0',
        tags: ['lesson', 'quick', 'simple'],
      },
    });

    // Load custom templates from files if they exist
    await this.loadCustomTemplates();
  }

  /**
   * Load custom templates from files
   */
  private async loadCustomTemplates(): Promise<void> {
    try {
      const templatesDir = path.join(__dirname, '../templates/lessons');
      const files = await fs.readdir(templatesDir);

      for (const file of files) {
        if (file.endsWith('.hbs') || file.endsWith('.html')) {
          const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
          const templateId = `lesson-custom-${path.basename(file, path.extname(file))}`;
          
          this.registerTemplate({
            id: templateId,
            name: `Custom: ${path.basename(file, path.extname(file))}`,
            engine: 'handlebars',
            format: 'html',
            supportedFormats: ['html'],
            content,
            dataRequirements: this.extractDataRequirements(content),
            metadata: {
              version: '1.0',
              tags: ['lesson', 'custom'],
            },
          });
        }
      }
    } catch (_error) {
      // Directory might not exist, which is fine
    }
  }

  /**
   * Extract data requirements from template
   */
  private extractDataRequirements(content: string): DataRequirement[] {
    const variables = this.extractVariables(content);
    const requirements: DataRequirement[] = [];

    // Map common variables to data requirements
    const variableMap: Record<string, DataRequirement> = {
      'lesson.title': { key: 'lesson', type: 'lesson', required: true },
      'lesson.date': { key: 'lesson', type: 'lesson', required: true },
      'lesson.subject': { key: 'lesson', type: 'lesson', required: true },
      'lesson.grade': { key: 'lesson', type: 'lesson', required: true },
      'user.name': { key: 'user', type: 'user', required: true },
      'students': { key: 'students', type: 'student', required: false },
      'expectations': { key: 'expectations', type: 'curriculum', required: false },
    };

    for (const variable of variables) {
      const baseVar = variable.split('.')[0];
      if (variableMap[variable]) {
        requirements.push(variableMap[variable]);
      } else if (variableMap[baseVar]) {
        requirements.push(variableMap[baseVar]);
      }
    }

    // Remove duplicates
    return requirements.filter((req, index, self) =>
      index === self.findIndex(r => r.key === req.key)
    );
  }

  /**
   * Get standard lesson template
   */
  private getStandardLessonTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>{{lesson.title}} - Lesson Plan</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .section { margin: 20px 0; }
    .section h2 { color: #666; }
    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 8px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>{{lesson.title}}</h1>
  
  <table>
    <tr>
      <th>Date:</th><td>{{formatDate lesson.date}}</td>
      <th>Subject:</th><td>{{lesson.subject}}</td>
    </tr>
    <tr>
      <th>Grade:</th><td>{{lesson.grade}}</td>
      <th>Duration:</th><td>{{lesson.duration}} minutes</td>
    </tr>
    <tr>
      <th>Teacher:</th><td>{{user.name}}</td>
      <th>Unit:</th><td>{{lesson.unit.title}}</td>
    </tr>
  </table>

  <div class="section">
    <h2>Learning Goals</h2>
    <p>{{lesson.learningGoals}}</p>
  </div>

  <div class="section">
    <h2>Success Criteria</h2>
    <ul>
    {{#each lesson.successCriteria}}
      <li>{{this}}</li>
    {{/each}}
    </ul>
  </div>

  <div class="section">
    <h2>Curriculum Expectations</h2>
    <ul>
    {{#each expectations}}
      <li><strong>{{this.code}}</strong>: {{this.description}}</li>
    {{/each}}
    </ul>
  </div>

  <div class="section">
    <h2>Materials</h2>
    <ul>
    {{#each lesson.materials}}
      <li>{{this}}</li>
    {{/each}}
    </ul>
  </div>

  <div class="section">
    <h2>Lesson Structure</h2>
    
    <h3>Minds On ({{lesson.mindsOnTime}} minutes)</h3>
    <p>{{lesson.mindsOn}}</p>
    
    <h3>Action ({{lesson.actionTime}} minutes)</h3>
    <p>{{lesson.action}}</p>
    
    <h3>Consolidation ({{lesson.consolidationTime}} minutes)</h3>
    <p>{{lesson.consolidation}}</p>
  </div>

  <div class="section">
    <h2>Assessment</h2>
    <p>{{lesson.assessment}}</p>
  </div>

  <div class="section">
    <h2>Differentiation</h2>
    <p>{{lesson.differentiation}}</p>
  </div>

  {{#if lesson.teacherNotes}}
  <div class="section">
    <h2>Teacher Notes</h2>
    <p>{{lesson.teacherNotes}}</p>
  </div>
  {{/if}}
</body>
</html>
    `;
  }

  /**
   * Get detailed lesson template
   */
  private getDetailedLessonTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>{{lesson.title}} - Detailed Lesson Plan</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    .header { background: #f0f0f0; padding: 20px; margin-bottom: 20px; }
    .section { margin: 25px 0; page-break-inside: avoid; }
    .subsection { margin-left: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    td, th { padding: 10px; border: 1px solid #ddd; text-align: left; }
    th { background: #f5f5f5; }
    .materials-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .assessment-rubric { background: #fafafa; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{lesson.title}}</h1>
    <p><em>{{lesson.bigIdea}}</em></p>
  </div>

  <table>
    <tr>
      <th>Date & Time:</th><td>{{formatDate lesson.date}} at {{lesson.time}}</td>
      <th>Subject(s):</th><td>{{lesson.subject}} {{#if lesson.crossCurricular}}+ {{lesson.crossCurricular}}{{/if}}</td>
    </tr>
    <tr>
      <th>Grade/Class:</th><td>Grade {{lesson.grade}} - {{lesson.className}}</td>
      <th>Duration:</th><td>{{lesson.duration}} minutes</td>
    </tr>
    <tr>
      <th>Teacher:</th><td>{{user.name}}</td>
      <th>Location:</th><td>{{lesson.location}}</td>
    </tr>
    <tr>
      <th>Unit:</th><td colspan="3">{{lesson.unit.title}} (Week {{lesson.unit.week}})</td>
    </tr>
  </table>

  <div class="section">
    <h2>Essential Question</h2>
    <p><strong>{{lesson.essentialQuestion}}</strong></p>
  </div>

  <div class="section">
    <h2>Learning Goals & Success Criteria</h2>
    <div class="subsection">
      <h3>Learning Goals (Student-Friendly Language)</h3>
      <ul>
      {{#each lesson.learningGoals}}
        <li>{{this}}</li>
      {{/each}}
      </ul>
    </div>
    <div class="subsection">
      <h3>Co-Created Success Criteria</h3>
      <ul>
      {{#each lesson.successCriteria}}
        <li>{{this}}</li>
      {{/each}}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Curriculum Connections</h2>
    <h3>Overall Expectations</h3>
    <ul>
    {{#each expectations.overall}}
      <li><strong>{{this.code}}</strong>: {{this.description}}</li>
    {{/each}}
    </ul>
    <h3>Specific Expectations</h3>
    <ul>
    {{#each expectations.specific}}
      <li><strong>{{this.code}}</strong>: {{this.description}}</li>
    {{/each}}
    </ul>
  </div>

  <div class="section">
    <h2>Materials & Resources</h2>
    <div class="materials-grid">
      <div>
        <h3>Teacher Materials</h3>
        <ul>
        {{#each lesson.materials.teacher}}
          <li>{{this}}</li>
        {{/each}}
        </ul>
      </div>
      <div>
        <h3>Student Materials</h3>
        <ul>
        {{#each lesson.materials.student}}
          <li>{{this}}</li>
        {{/each}}
        </ul>
      </div>
    </div>
    {{#if lesson.materials.technology}}
    <h3>Technology Requirements</h3>
    <ul>
    {{#each lesson.materials.technology}}
      <li>{{this}}</li>
    {{/each}}
    </ul>
    {{/if}}
  </div>

  <div class="section">
    <h2>Three-Part Lesson Plan</h2>
    
    <div class="subsection">
      <h3>Minds On ({{lesson.mindsOnTime}} minutes)</h3>
      <p><strong>Hook:</strong> {{lesson.hook}}</p>
      <p><strong>Activity:</strong> {{lesson.mindsOn}}</p>
      <p><strong>Key Questions:</strong></p>
      <ul>
      {{#each lesson.mindsOnQuestions}}
        <li>{{this}}</li>
      {{/each}}
      </ul>
    </div>

    <div class="subsection">
      <h3>Action ({{lesson.actionTime}} minutes)</h3>
      <p>{{lesson.action}}</p>
      
      <h4>Teacher Moves</h4>
      <ul>
      {{#each lesson.teacherMoves}}
        <li>{{this}}</li>
      {{/each}}
      </ul>
      
      <h4>Student Actions</h4>
      <ul>
      {{#each lesson.studentActions}}
        <li>{{this}}</li>
      {{/each}}
      </ul>
      
      <h4>Key Vocabulary</h4>
      <ul>
      {{#each lesson.vocabulary}}
        <li><strong>{{this.term}}</strong>: {{this.definition}}</li>
      {{/each}}
      </ul>
    </div>

    <div class="subsection">
      <h3>Consolidation ({{lesson.consolidationTime}} minutes)</h3>
      <p>{{lesson.consolidation}}</p>
      <p><strong>Exit Ticket:</strong> {{lesson.exitTicket}}</p>
    </div>
  </div>

  <div class="section">
    <h2>Assessment Plan</h2>
    <div class="assessment-rubric">
      <h3>Assessment FOR Learning</h3>
      <p>{{lesson.assessment.for}}</p>
      
      <h3>Assessment AS Learning</h3>
      <p>{{lesson.assessment.as}}</p>
      
      <h3>Assessment OF Learning</h3>
      <p>{{lesson.assessment.of}}</p>
      
      {{#if lesson.assessment.rubric}}
      <h3>Success Criteria Rubric</h3>
      <table>
        <tr>
          <th>Criteria</th>
          <th>Level 1</th>
          <th>Level 2</th>
          <th>Level 3</th>
          <th>Level 4</th>
        </tr>
        {{#each lesson.assessment.rubric}}
        <tr>
          <td>{{this.criteria}}</td>
          <td>{{this.level1}}</td>
          <td>{{this.level2}}</td>
          <td>{{this.level3}}</td>
          <td>{{this.level4}}</td>
        </tr>
        {{/each}}
      </table>
      {{/if}}
    </div>
  </div>

  <div class="section">
    <h2>Differentiation & Accommodations</h2>
    <h3>For Students Requiring Support</h3>
    <ul>
    {{#each lesson.differentiation.support}}
      <li>{{this}}</li>
    {{/each}}
    </ul>
    
    <h3>For Students Requiring Extension</h3>
    <ul>
    {{#each lesson.differentiation.extension}}
      <li>{{this}}</li>
    {{/each}}
    </ul>
    
    {{#if lesson.differentiation.iep}}
    <h3>IEP Accommodations</h3>
    <ul>
    {{#each lesson.differentiation.iep}}
      <li><strong>{{this.student}}</strong>: {{this.accommodation}}</li>
    {{/each}}
    </ul>
    {{/if}}
    
    {{#if lesson.differentiation.ell}}
    <h3>ELL Supports</h3>
    <ul>
    {{#each lesson.differentiation.ell}}
      <li>{{this}}</li>
    {{/each}}
    </ul>
    {{/if}}
  </div>

  <div class="section">
    <h2>Reflection & Next Steps</h2>
    {{#if lesson.reflection}}
    <div class="subsection">
      <h3>Post-Lesson Reflection</h3>
      <p><strong>What worked well:</strong> {{lesson.reflection.worked}}</p>
      <p><strong>Challenges:</strong> {{lesson.reflection.challenges}}</p>
      <p><strong>Student engagement:</strong> {{lesson.reflection.engagement}}</p>
      <p><strong>Evidence of learning:</strong> {{lesson.reflection.evidence}}</p>
    </div>
    {{/if}}
    
    <div class="subsection">
      <h3>Next Steps</h3>
      <ul>
      {{#each lesson.nextSteps}}
        <li>{{this}}</li>
      {{/each}}
      </ul>
    </div>
  </div>

  {{#if lesson.resources}}
  <div class="section">
    <h2>Additional Resources</h2>
    <ul>
    {{#each lesson.resources}}
      <li><a href="{{this.url}}">{{this.title}}</a> - {{this.description}}</li>
    {{/each}}
    </ul>
  </div>
  {{/if}}

  <div class="section">
    <p><em>Generated on {{formatDate 'now'}} by {{user.name}}</em></p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get quick lesson template
   */
  private getQuickLessonTemplate(): string {
    return `
# {{lesson.title}}

**Date:** {{formatDate lesson.date}}  
**Subject:** {{lesson.subject}} | **Grade:** {{lesson.grade}} | **Duration:** {{lesson.duration}} min

## Learning Goal
{{lesson.learningGoals}}

## Materials
{{#each lesson.materials}}
- {{this}}
{{/each}}

## Lesson Flow

### Minds On ({{lesson.mindsOnTime}} min)
{{lesson.mindsOn}}

### Action ({{lesson.actionTime}} min)
{{lesson.action}}

### Consolidation ({{lesson.consolidationTime}} min)
{{lesson.consolidation}}

## Assessment
{{lesson.assessment}}

## Notes
{{lesson.teacherNotes}}

---
*{{user.name}} - {{formatDate 'now'}}*
    `;
  }

  /**
   * Get standard data requirements
   */
  private getStandardDataRequirements(): DataRequirement[] {
    return [
      { key: 'lesson', type: 'lesson', required: true, description: 'Lesson plan data' },
      { key: 'user', type: 'user', required: true, description: 'Teacher information' },
      { key: 'expectations', type: 'curriculum', required: false, description: 'Curriculum expectations' },
    ];
  }

  /**
   * Get detailed data requirements
   */
  private getDetailedDataRequirements(): DataRequirement[] {
    return [
      { key: 'lesson', type: 'lesson', required: true, description: 'Detailed lesson plan data' },
      { key: 'user', type: 'user', required: true, description: 'Teacher information' },
      { key: 'expectations', type: 'curriculum', required: true, description: 'Curriculum expectations grouped by type' },
      { key: 'students', type: 'student', required: false, description: 'Student information for differentiation' },
    ];
  }

  /**
   * Get quick data requirements
   */
  private getQuickDataRequirements(): DataRequirement[] {
    return [
      { key: 'lesson', type: 'lesson', required: true, description: 'Basic lesson plan data' },
      { key: 'user', type: 'user', required: true, description: 'Teacher name' },
    ];
  }
}