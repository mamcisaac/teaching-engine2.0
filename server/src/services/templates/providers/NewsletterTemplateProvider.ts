/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Newsletter Template Provider
 * Provides templates for newsletters
 */

import { logger } from '../../../logger';

import type { Template, TemplateContext } from './TemplateProvider';
import { TemplateProvider } from './TemplateProvider';

export class NewsletterTemplateProvider extends TemplateProvider {
  constructor() {
    super('NewsletterTemplateProvider');
    try {
      this.loadTemplates();
    } catch (error: unknown) {
      logger.error('Failed to load newsletter templates:', error as string | undefined);
    }
  }

  /**
   * Get template based on context
   */
  async getTemplate(context: TemplateContext): Promise<Template> {
    const frequency = context.parameters?.frequency !== null && context.parameters?.frequency !== undefined ? context.parameters.frequency : 'weekly';
    const style = context.parameters?.style !== null && context.parameters?.style !== undefined ? context.parameters.style : 'standard';
    
    const templateId = `newsletter-${frequency}-${style}`;
    let template = await this.getTemplateById(templateId);
    
    if (!template) {
      template = await this.getTemplateById(`newsletter-${frequency}`);
    }
    
    if (!template) {
      template = await this.getTemplateById('newsletter-weekly-standard');
    }

    if (!template) {
      throw new Error(`No newsletter template found for context: ${JSON.stringify(context)}`);
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
    return context.userId !== null && context.userId !== 0;
  }

  /**
   * Load templates
   */
  protected loadTemplates(): void {
    // Weekly newsletter template
    this.registerTemplate({
      id: 'newsletter-weekly-standard',
      name: 'Weekly Newsletter - Standard',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html', 'text'],
      content: this.getWeeklyNewsletterTemplate(),
      dataRequirements: [
        { key: 'user', type: 'user', required: true },
        { key: 'lessons', type: 'lesson', required: true },
        { key: 'achievements', type: 'custom', required: false },
        { key: 'upcomingEvents', type: 'custom', required: false },
        { key: 'parentInfo', type: 'custom', required: false },
      ],
      metadata: {
        version: '1.0',
        tags: ['newsletter', 'weekly', 'parents'],
      },
    });

    // Monthly newsletter template
    this.registerTemplate({
      id: 'newsletter-monthly-detailed',
      name: 'Monthly Newsletter - Detailed',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html', 'text'],
      content: this.getMonthlyNewsletterTemplate(),
      dataRequirements: [
        { key: 'user', type: 'user', required: true },
        { key: 'monthSummary', type: 'custom', required: true },
        { key: 'studentHighlights', type: 'student', required: false },
        { key: 'curriculum', type: 'curriculum', required: false },
        { key: 'photos', type: 'custom', required: false },
      ],
      metadata: {
        version: '1.0',
        tags: ['newsletter', 'monthly', 'comprehensive'],
      },
    });

    // Bilingual newsletter template
    this.registerTemplate({
      id: 'newsletter-weekly-bilingual',
      name: 'Weekly Newsletter - Bilingual',
      engine: 'handlebars',
      format: 'html',
      supportedFormats: ['html', 'text'],
      content: this.getBilingualNewsletterTemplate(),
      dataRequirements: [
        { key: 'user', type: 'user', required: true },
        { key: 'lessons', type: 'lesson', required: true },
        { key: 'translations', type: 'custom', required: true },
      ],
      metadata: {
        version: '1.0',
        tags: ['newsletter', 'weekly', 'bilingual', 'french'],
      },
    });
  }

  /**
   * Get weekly newsletter template
   */
  private getWeeklyNewsletterTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Weekly Classroom Newsletter - {{user.className}}</title>
  <style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    .highlight { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
    .subject-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .subject-card { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    .subject-card h3 { color: #3498db; margin-top: 0; }
    .footer { background: #34495e; color: white; padding: 20px; text-align: center; }
    ul { padding-left: 20px; }
    .date-range { font-style: italic; color: #7f8c8d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{user.className}} Weekly Newsletter</h1>
      <p>{{formatDate weekStart}} - {{formatDate weekEnd}}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Dear Families,</h2>
        <p>{{openingMessage}}</p>
      </div>

      <div class="section">
        <h2>What We Learned This Week</h2>
        <div class="subject-grid">
          {{#each subjectSummaries}}
          <div class="subject-card">
            <h3>{{this.subject}}</h3>
            <p>{{this.summary}}</p>
            {{#if this.highlights}}
            <ul>
              {{#each this.highlights}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
            {{/if}}
          </div>
          {{/each}}
        </div>
      </div>

      {{#if achievements}}
      <div class="section">
        <h2>Celebrations & Achievements</h2>
        <div class="highlight">
          {{#each achievements}}
          <p>🌟 {{this}}</p>
          {{/each}}
        </div>
      </div>
      {{/if}}

      <div class="section">
        <h2>Looking Ahead</h2>
        <p>Next week we will be:</p>
        <ul>
          {{#each nextWeekPreview}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>

      {{#if upcomingEvents}}
      <div class="section">
        <h2>Important Dates & Reminders</h2>
        <ul>
          {{#each upcomingEvents}}
          <li><strong>{{formatDate this.date}}</strong>: {{this.event}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}

      {{#if parentInfo}}
      <div class="section">
        <h2>How You Can Help at Home</h2>
        <div class="highlight">
          {{#each parentInfo.suggestions}}
          <p>• {{this}}</p>
          {{/each}}
        </div>
      </div>
      {{/if}}

      <div class="section">
        <h2>Questions or Concerns?</h2>
        <p>Please don't hesitate to contact me at {{user.email}} or through the school office.</p>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your continued support!</p>
      <p>{{user.name}} | {{user.schoolName}}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get monthly newsletter template
   */
  private getMonthlyNewsletterTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>{{monthName}} Newsletter - {{user.className}}</title>
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background: #f9f9f9; }
    .container { max-width: 700px; margin: 0 auto; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; font-weight: normal; }
    .header .subtitle { margin-top: 10px; font-size: 18px; opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 40px; }
    .section h2 { color: #2d3748; font-size: 24px; margin-bottom: 20px; position: relative; }
    .section h2:after { content: ''; position: absolute; bottom: -5px; left: 0; width: 50px; height: 3px; background: #667eea; }
    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
    .photo-grid img { width: 100%; height: 150px; object-fit: cover; border-radius: 5px; }
    .student-spotlight { background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }
    .curriculum-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .curriculum-table th, .curriculum-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .curriculum-table th { background: #f7fafc; font-weight: bold; color: #2d3748; }
    .quote { font-style: italic; font-size: 18px; color: #4a5568; margin: 20px 0; padding: 20px; background: #f7fafc; border-radius: 5px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { text-align: center; padding: 20px; background: #f7fafc; border-radius: 5px; }
    .stat-card .number { font-size: 32px; color: #667eea; font-weight: bold; }
    .stat-card .label { color: #718096; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{monthName}} in Review</h1>
      <div class="subtitle">{{user.className}} Monthly Newsletter</div>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Month at a Glance</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="number">{{monthSummary.totalLessons}}</div>
            <div class="label">Lessons Taught</div>
          </div>
          <div class="stat-card">
            <div class="number">{{monthSummary.fieldTrips}}</div>
            <div class="label">Field Trips</div>
          </div>
          <div class="stat-card">
            <div class="number">{{monthSummary.guestSpeakers}}</div>
            <div class="label">Guest Speakers</div>
          </div>
          <div class="stat-card">
            <div class="number">{{monthSummary.specialEvents}}</div>
            <div class="label">Special Events</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Learning Journey</h2>
        <p>{{monthSummary.overview}}</p>
        
        <h3>Curriculum Highlights</h3>
        <table class="curriculum-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Key Topics</th>
              <th>Major Projects</th>
            </tr>
          </thead>
          <tbody>
            {{#each curriculum}}
            <tr>
              <td><strong>{{this.subject}}</strong></td>
              <td>{{this.topics}}</td>
              <td>{{this.projects}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>

      {{#if studentHighlights}}
      <div class="section">
        <h2>Student Spotlights</h2>
        {{#each studentHighlights}}
        <div class="student-spotlight">
          <h3>{{this.title}}</h3>
          <p>{{this.description}}</p>
          {{#if this.quote}}
          <div class="quote">"{{this.quote}}"</div>
          {{/if}}
        </div>
        {{/each}}
      </div>
      {{/if}}

      {{#if photos}}
      <div class="section">
        <h2>Memories from {{monthName}}</h2>
        <div class="photo-grid">
          {{#each photos}}
          <img src="{{this.url}}" alt="{{this.caption}}" title="{{this.caption}}">
          {{/each}}
        </div>
      </div>
      {{/if}}

      <div class="section">
        <h2>Looking Forward</h2>
        <p>As we move into {{nextMonth}}, here's what we have planned:</p>
        <ul>
          {{#each upcomingHighlights}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>

      <div class="section">
        <h2>Parent Partnership</h2>
        <p>Thank you to all the families who:</p>
        <ul>
          {{#each parentThanks}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>

      <div class="section" style="text-align: center; padding: 30px; background: #f7fafc; border-radius: 5px;">
        <h3>Stay Connected</h3>
        <p>Email: {{user.email}}<br>
        Class Website: {{user.classWebsite}}<br>
        School Phone: {{user.schoolPhone}}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Get bilingual newsletter template
   */
  private getBilingualNewsletterTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Newsletter Hebdomadaire / Weekly Newsletter</title>
  <style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 0 auto; background: white; }
    .header { background: #e74c3c; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .bilingual-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 30px; }
    .language-column { padding: 20px; }
    .french { background: #f8f9fa; border-left: 3px solid #3498db; }
    .english { background: #fff; border-left: 3px solid #e74c3c; }
    h2 { color: #2c3e50; font-size: 20px; }
    .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
    @media (max-width: 600px) {
      .bilingual-section { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{user.className}}</h1>
      <p>Newsletter Hebdomadaire / Weekly Newsletter</p>
      <p>{{formatDate weekStart}} - {{formatDate weekEnd}}</p>
    </div>
    
    <div class="bilingual-section">
      <div class="language-column french">
        <h2>Français</h2>
        
        <h3>Chers familles,</h3>
        <p>{{translations.fr.greeting}}</p>
        
        <h3>Cette semaine en classe</h3>
        {{#each translations.fr.weekHighlights}}
        <p>• {{this}}</p>
        {{/each}}
        
        <h3>La semaine prochaine</h3>
        {{#each translations.fr.nextWeek}}
        <p>• {{this}}</p>
        {{/each}}
        
        {{#if translations.fr.reminders}}
        <h3>Rappels importants</h3>
        {{#each translations.fr.reminders}}
        <p>📌 {{this}}</p>
        {{/each}}
        {{/if}}
        
        <h3>À la maison</h3>
        <p>{{translations.fr.homeConnection}}</p>
      </div>
      
      <div class="language-column english">
        <h2>English</h2>
        
        <h3>Dear Families,</h3>
        <p>{{translations.en.greeting}}</p>
        
        <h3>This Week in Class</h3>
        {{#each translations.en.weekHighlights}}
        <p>• {{this}}</p>
        {{/each}}
        
        <h3>Next Week</h3>
        {{#each translations.en.nextWeek}}
        <p>• {{this}}</p>
        {{/each}}
        
        {{#if translations.en.reminders}}
        <h3>Important Reminders</h3>
        {{#each translations.en.reminders}}
        <p>📌 {{this}}</p>
        {{/each}}
        {{/if}}
        
        <h3>At Home</h3>
        <p>{{translations.en.homeConnection}}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Merci! / Thank you!</p>
      <p>{{user.name}} | {{user.email}}</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}