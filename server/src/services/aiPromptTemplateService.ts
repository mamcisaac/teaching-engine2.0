/**
 * AI Prompt Template Service
 * 
 * This service provides improved AI prompts that:
 * 1. Use natural teacher language and voice
 * 2. Follow ETFO Planning for Student Learning framework accurately
 * 3. Include proper differentiation and assessment strategies
 * 4. Support bilingual/French immersion contexts
 * 5. Provide version control and A/B testing capabilities
 */


export interface PromptContext {
  grade: number;
  subject: string;
  language?: 'en' | 'fr' | 'both';
  isImmersion?: boolean;
  academicYear?: string;
  term?: string;
  timeframe?: string;
  specialNeeds?: string[];
}

export interface CurriculumExpectation {
  id?: string;
  code: string;
  description: string;
  type: 'overall' | 'specific';
  strand: string;
  substrand?: string;
  grade?: number;
  subject?: string;
  keywords?: string[];
}

// Version control for prompt templates
interface PromptTemplate {
  id: string;
  version: string;
  createdAt: Date;
  description: string;
  template: string;
  systemPrompt: string;
  temperature: number;
  metadata: {
    etfoAligned: boolean;
    bilingualSupport: boolean;
    differentiationIncluded: boolean;
    assessmentFramework: 'FOR_AS_OF' | 'OTHER';
  };
}

class AIPromptTemplateService {
  private templates: Map<string, PromptTemplate[]> = new Map();
  
  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Long-Range Plan Templates
    this.addTemplate('long-range-plan', {
      id: 'lrp-v2.0',
      version: '2.0',
      createdAt: new Date(),
      description: 'ETFO-aligned Long-Range Plan generation with natural teacher voice',
      template: this.getLongRangePlanTemplate(),
      systemPrompt: this.getETFOSystemPrompt(),
      temperature: 0.3,
      metadata: {
        etfoAligned: true,
        bilingualSupport: true,
        differentiationIncluded: true,
        assessmentFramework: 'FOR_AS_OF'
      }
    });

    // Unit Plan Templates
    this.addTemplate('unit-plan', {
      id: 'up-v2.0',
      version: '2.0',
      createdAt: new Date(),
      description: 'Three-part ETFO unit planning with comprehensive assessment',
      template: this.getUnitPlanTemplate(),
      systemPrompt: this.getETFOSystemPrompt(),
      temperature: 0.3,
      metadata: {
        etfoAligned: true,
        bilingualSupport: true,
        differentiationIncluded: true,
        assessmentFramework: 'FOR_AS_OF'
      }
    });

    // Lesson Plan Templates
    this.addTemplate('lesson-plan', {
      id: 'lp-v2.0',
      version: '2.0',
      createdAt: new Date(),
      description: 'Three-part lesson structure with authentic teacher language',
      template: this.getLessonPlanTemplate(),
      systemPrompt: this.getETFOSystemPrompt(),
      temperature: 0.4,
      metadata: {
        etfoAligned: true,
        bilingualSupport: true,
        differentiationIncluded: true,
        assessmentFramework: 'FOR_AS_OF'
      }
    });

    // Activity Generation Templates
    this.addTemplate('activity-generation', {
      id: 'ag-v2.0',
      version: '2.0',
      createdAt: new Date(),
      description: 'Engaging, age-appropriate activity generation',
      template: this.getActivityGenerationTemplate(),
      systemPrompt: this.getETFOSystemPrompt(),
      temperature: 0.6,
      metadata: {
        etfoAligned: true,
        bilingualSupport: true,
        differentiationIncluded: true,
        assessmentFramework: 'FOR_AS_OF'
      }
    });
  }

  private getETFOSystemPrompt(): string {
    return `You are an experienced elementary school teacher and ETFO member with 15+ years of classroom experience. You understand child development, Ontario curriculum, and practical classroom realities.

Your planning follows the ETFO Planning for Student Learning framework with authentic teacher voice - you write like a real teacher talking to another teacher.

Key principles you follow:
- Students come first - all decisions center on what's best for kids
- Curriculum serves learning, not the other way around
- Assessment drives instruction (Assessment FOR, AS, and OF learning)
- Differentiation is natural and embedded, not an add-on
- Cross-curricular connections happen organically
- You understand that real classrooms are messy and plans need flexibility
- French immersion considerations when applicable
- Indigenous ways of knowing are respectfully incorporated
- You write in a warm, professional teacher voice - not robotic or overly formal

You avoid educational jargon overload and focus on practical, actionable content that real teachers can actually use in their busy classrooms.`;
  }

  private getLongRangePlanTemplate(): string {
    return `I'm planning my long-range plan for Grade {{grade}} {{subject}} for the {{academicYear}} school year. I need to organize these curriculum expectations into meaningful units that make sense for how kids learn and grow throughout the year.

Here's what I'm working with:

**Curriculum Expectations to Cover:**
{{expectations}}

**My Context:**
- Grade: {{grade}}
- Subject: {{subject}}
- {{#isImmersion}}French Immersion Program{{/isImmersion}}
- School year structure: {{termStructure}}
{{#specialConsiderations}}
- Special considerations: {{specialConsiderations}}
{{/specialConsiderations}}

**What I need from you:**
Help me create 4-6 units that feel natural and build on each other. I want units that excite kids and make connections they can understand. Think about:

1. **Unit Flow**: How do the big ideas connect and build throughout the year?
2. **Seasonal Connections**: What makes sense when? (e.g., nature units in fall/spring)
3. **Student Development**: How do Grade {{grade}} kids typically grow over the year?
4. **Real Classroom Life**: Accounting for holidays, assemblies, and the reality of school life
5. **Cross-Curricular Magic**: Where can we naturally connect subjects?

For each unit, I need:
- A title that kids would find interesting (not just "Unit 1")
- Big ideas that connect to their world
- Which curriculum expectations fit naturally
- Realistic timing (considering everything else happening in school)
- Quick notes about assessment opportunities

Please organize this in a JSON format I can work with, but write like you're talking to a fellow teacher. I want to feel excited about teaching these units!

{{#frenchImmersion}}
Note: Since this is French immersion, please consider how concepts transfer between languages and suggest opportunities for language development alongside content learning.
{{/frenchImmersion}}`;
  }

  private getUnitPlanTemplate(): string {
    return `I'm diving deeper into planning my "{{unitTitle}}" unit for Grade {{grade}} {{subject}}. This unit is part of my year-long plan and needs to fit with what we've learned before and what's coming next.

**Unit Context:**
- Grade: {{grade}} {{subject}}
- Estimated Duration: {{duration}} weeks
- {{#longRangePlanContext}}Connected to: {{longRangePlanContext}}{{/longRangePlanContext}}
{{#isImmersion}}
- French Immersion context
{{/isImmersion}}

**Curriculum Expectations I'm addressing:**
{{expectations}}

**The Three-Part ETFO Framework I'm following:**

**PART 1: FRAMING THE UNIT**
Help me identify the big ideas that will anchor this unit - the "so what?" that helps kids see why this matters in their world. What essential questions will drive our inquiry and keep kids curious?

**PART 2: LEARNING GOALS & SUCCESS CRITERIA**
I need learning goals that are clear but written in kid-friendly language. Success criteria should help students self-assess and understand what good work looks like in Grade {{grade}}.

**PART 3: ASSESSMENT PLAN**
This is where the magic happens - how will I:
- **Assess FOR learning**: Find out what kids already know/think (diagnostics)
- **Assess AS learning**: Support their learning journey with feedback (formatives)  
- **Assess OF learning**: Celebrate their growth and determine next steps (summatives)

**What I'm hoping for:**
- Big ideas that Grade {{grade}} kids can grasp and get excited about
- Essential questions that spark genuine curiosity
- Learning goals that feel achievable but challenging
- Assessment ideas that feel natural, not forced
- Differentiation strategies that work in real classrooms
- Cross-curricular connections that emerge organically
- A timeline that accounts for actual school life

Please respond in JSON format, but keep the teacher voice - like you're sharing ideas with a colleague over coffee.

{{#specialNeeds}}
**Classroom considerations**: {{specialNeeds}}
{{/specialNeeds}}`;
  }

  private getLessonPlanTemplate(): string {
    return `I'm planning a lesson for my Grade {{grade}} {{subject}} class as part of our "{{unitTitle}}" unit. This is {{#lessonNumber}}lesson {{lessonNumber}} in the unit{{/lessonNumber}}{{^lessonNumber}}one of our key lessons{{/lessonNumber}}, and I have {{duration}} minutes to work with.

**What I'm covering:**
{{expectations}}

**Unit context:**
{{#unitContext}}{{unitContext}}{{/unitContext}}

**The lesson structure I'm following (Three-Part ETFO Model):**

**MINDS ON** (~15% of time - getting kids hooked and ready)
This is where I grab their attention and connect to what they already know. What's a great way to start that will have them leaning in and curious?

**ACTION** (~70% of time - the main learning)
This is the heart of the lesson where kids are actively engaged with the new learning. I need activities that are hands-on, minds-on, and appropriate for Grade {{grade}} attention spans and abilities.

**CONSOLIDATION** (~15% of time - making sense of it all)
How do we wrap up in a way that helps kids reflect on their learning and make connections? This should feel like a satisfying conclusion, not just "time's up!"

**What I need:**
- A lesson that feels engaging and purposeful
- Activities that match Grade {{grade}} developmental needs
- Clear learning goals kids can understand
- Success criteria that help them self-assess
- Materials I can actually get/afford
- Differentiation that's built in, not tacked on
- Assessment opportunities that feel natural
- Timing that's realistic (including transitions!)

**Classroom reality check:**
- I have typical Grade {{grade}} energy levels and attention spans
- Mixed ability group with diverse learners
- {{#accommodations}}Need to consider: {{accommodations}}{{/accommodations}}
- Need backup plans for when technology doesn't work
- Should work for a substitute if needed

Please give me a practical lesson plan in JSON format, written like you're sharing with a fellow teacher. I want to feel confident and excited about teaching this!

{{#frenchImmersion}}
**Language considerations**: This is French immersion, so please consider vocabulary development and language scaffolding alongside content learning.
{{/frenchImmersion}}`;
  }

  private getActivityGenerationTemplate(): string {
    return `I need an engaging activity for my Grade {{grade}} {{subject}} class. Here's what I'm working with:

**Context:**
- Grade: {{grade}}
- Subject: {{subject}}
- Duration: {{duration}} minutes
- Part of lesson: {{section}}
{{#learningGoals}}
- Learning goals: {{learningGoals}}
{{/learningGoals}}

**What I'm hoping for:**
{{#activityType}}
- Activity type: {{activityType}}
{{/activityType}}
{{#materials}}
- Materials I have available: {{materials}}
{{/materials}}
{{#groupSize}}
- Group arrangement: {{groupSize}}
{{/groupSize}}

**My classroom reality:**
- Typical Grade {{grade}} energy and attention spans
- Mix of learning styles and abilities
- Some kids who need extra support, others ready for challenges
- Limited prep time (let's be honest!)
- Need activities that actually work in practice

**What makes a great activity for my kids:**
- Clear purpose that connects to their world
- Hands-on engagement (they learn by doing)
- Appropriate challenge level - not too easy, not impossible
- Built-in opportunities for different entry points
- Materials that won't break the budget
- Instructions kids can follow without me repeating 10 times
- Natural assessment opportunities
- Cleanup that doesn't take forever

{{#inspiration}}
**For inspiration, here are some activities I've seen work well:**
{{inspiration}}
{{/inspiration}}

Please suggest an activity that feels doable and exciting. Include step-by-step instructions I can actually follow, differentiation ideas that work in real classrooms, and assessment suggestions that feel natural.

Respond in JSON format but keep that practical teacher voice - like you're sharing a great idea you just tried with your class!

{{#safetyConsiderations}}
**Safety note**: Please consider any safety aspects for Grade {{grade}} students.
{{/safetyConsiderations}}`;
  }

  // Template management methods
  private addTemplate(type: string, template: PromptTemplate) {
    if (!this.templates.has(type)) {
      this.templates.set(type, []);
    }
    this.templates.get(type)!.push(template);
  }

  public getTemplate(type: string, version?: string): PromptTemplate | null {
    const templates = this.templates.get(type);
    if (!templates || templates.length === 0) return null;

    if (version) {
      return templates.find(t => t.version === version) || null;
    }
    
    // Return latest version
    return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  public getAllVersions(type: string): PromptTemplate[] {
    return this.templates.get(type) || [];
  }

  // Template compilation with Handlebars-like syntax
  public compileTemplate(template: string, context: Record<string, any>): string {
    let compiled = template;
    
    // Replace simple variables {{variable}}
    compiled = compiled.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] !== undefined ? String(context[key]) : match;
    });

    // Handle conditional blocks {{#if}}{{/if}}
    compiled = compiled.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
      return context[key] ? content : '';
    });

    // Handle negative conditional blocks {{^if}}{{/if}}
    compiled = compiled.replace(/\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
      return !context[key] ? content : '';
    });

    return compiled.trim();
  }

  // Generate prompts for specific planning types
  public generateLongRangePlanPrompt(context: PromptContext, expectations: CurriculumExpectation[]): { prompt: string; systemPrompt: string; temperature: number } {
    const template = this.getTemplate('long-range-plan');
    if (!template) throw new Error('Long-range plan template not found');

    const promptContext = {
      ...context,
      expectations: expectations.map(exp => 
        `${exp.code} (${exp.type}): ${exp.description}`
      ).join('\n'),
      frenchImmersion: context.isImmersion,
      termStructure: context.term || 'semester',
      specialConsiderations: context.specialNeeds?.join(', ') || ''
    };

    return {
      prompt: this.compileTemplate(template.template, promptContext),
      systemPrompt: template.systemPrompt,
      temperature: template.temperature
    };
  }

  public generateUnitPlanPrompt(
    context: PromptContext, 
    unitTitle: string, 
    expectations: CurriculumExpectation[],
    duration: number = 3,
    longRangePlanContext?: string
  ): { prompt: string; systemPrompt: string; temperature: number } {
    const template = this.getTemplate('unit-plan');
    if (!template) throw new Error('Unit plan template not found');

    const promptContext = {
      ...context,
      unitTitle,
      duration,
      longRangePlanContext,
      expectations: expectations.map(exp => 
        `${exp.code} (${exp.type}): ${exp.description}\n  → ${exp.strand}${exp.substrand ? ` / ${exp.substrand}` : ''}`
      ).join('\n'),
      specialNeeds: context.specialNeeds?.join(', ') || ''
    };

    return {
      prompt: this.compileTemplate(template.template, promptContext),
      systemPrompt: template.systemPrompt,
      temperature: template.temperature
    };
  }

  public generateLessonPlanPrompt(
    context: PromptContext,
    unitTitle: string,
    expectations: CurriculumExpectation[],
    duration: number,
    unitContext?: string,
    lessonNumber?: number,
    accommodations?: string[]
  ): { prompt: string; systemPrompt: string; temperature: number } {
    const template = this.getTemplate('lesson-plan');
    if (!template) throw new Error('Lesson plan template not found');

    const promptContext = {
      ...context,
      unitTitle,
      duration,
      unitContext,
      lessonNumber,
      expectations: expectations.map(exp => 
        `${exp.code}: ${exp.description}`
      ).join('\n'),
      accommodations: accommodations?.join(', ') || '',
      frenchImmersion: context.isImmersion
    };

    return {
      prompt: this.compileTemplate(template.template, promptContext),
      systemPrompt: template.systemPrompt,
      temperature: template.temperature
    };
  }

  public generateActivityPrompt(
    context: PromptContext,
    activityContext: {
      duration: number;
      section: 'mindsOn' | 'action' | 'consolidation';
      learningGoals?: string[];
      activityType?: string;
      materials?: string[];
      groupSize?: string;
      inspiration?: string[];
      safetyConsiderations?: boolean;
    }
  ): { prompt: string; systemPrompt: string; temperature: number } {
    const template = this.getTemplate('activity-generation');
    if (!template) throw new Error('Activity generation template not found');

    const promptContext = {
      ...context,
      ...activityContext,
      learningGoals: activityContext.learningGoals?.join(', ') || '',
      materials: activityContext.materials?.join(', ') || 'standard classroom materials',
      inspiration: activityContext.inspiration?.map(i => `- ${i}`).join('\n') || '',
      safetyConsiderations: activityContext.safetyConsiderations
    };

    return {
      prompt: this.compileTemplate(template.template, promptContext),
      systemPrompt: template.systemPrompt,
      temperature: template.temperature
    };
  }

  // A/B Testing and Analytics
  public recordPromptUsage(_templateId: string, success: boolean, feedback?: string) {
    // In a real implementation, this would log to analytics
    console.log(`Template ${templateId}: ${success ? 'SUCCESS' : 'FAILURE'}`, feedback);
  }

  public getTemplateMetrics(_templateId: string) {
    // In a real implementation, this would return usage analytics
    return {
      usageCount: 0,
      successRate: 0,
      avgRating: 0,
      commonFeedback: []
    };
  }
}

export const aiPromptTemplateService = new AIPromptTemplateService();