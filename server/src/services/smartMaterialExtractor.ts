// import { PrismaClient } from '@teaching-engine/database'; // Unused import
import OpenAI from 'openai';

// const prisma = new PrismaClient(); // Unused

// Lazy initialization of OpenAI to avoid startup errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'test-api-key',
    });
  }
  return openai;
}

export interface SmartMaterial {
  name: string;
  category: 'supplies' | 'technology' | 'books' | 'equipment' | 'printables' | 'other';
  priority: 'essential' | 'helpful' | 'optional';
  quantity?: string;
  notes?: string;
  prepTime?: number; // minutes needed for preparation
}

export interface WeeklyMaterialPlan {
  weekStart: string;
  totalPrepTime: number;
  materials: SmartMaterial[];
  preparation: {
    printingNeeded: SmartMaterial[];
    setupRequired: SmartMaterial[];
    purchaseNeeded: SmartMaterial[];
  };
  byDay: Array<{
    day: number;
    dayName: string;
    activities: Array<{
      activityId: number;
      title: string;
      timeSlot: string;
      materials: SmartMaterial[];
    }>;
  }>;
}

export class SmartMaterialExtractor {
  /**
   * Extract materials from activity text using AI when available,
   * fallback to pattern matching
   */
  async extractMaterialsFromText(text: string): Promise<SmartMaterial[]> {
    if (!text?.trim()) return [];

    // First try pattern-based extraction (fast)
    const patternMaterials = this.extractMaterialsPattern(text);

    // If OpenAI is available and we have meaningful text, enhance with AI
    if (process.env.OPENAI_API_KEY && text.length > 50) {
      try {
        const aiMaterials = await this.extractMaterialsWithAI(text);
        // Merge AI results with pattern results, preferring AI categorization
        return this.mergeMaterialLists(patternMaterials, aiMaterials);
      } catch (error) {
        console.warn('AI material extraction failed, using pattern matching:', error);
        return patternMaterials;
      }
    }

    return patternMaterials;
  }

  /**
   * Pattern-based material extraction (existing logic enhanced)
   */
  private extractMaterialsPattern(text: string): SmartMaterial[] {
    const materials: SmartMaterial[] = [];
    const lines = text.split(/\r?\n/);

    const materialKeywords = [
      'materials?',
      'supplies',
      'equipment',
      'resources',
      'tools',
      'needed',
      'required',
      'bring',
      'prepare',
      'setup',
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for material header lines
      const headerMatch = line.match(
        new RegExp(
          `^(?:additional\\s+|extra\\s+)?(?:${materialKeywords.join('|')})(?:\\s+needed|\\s+required)?:?\\s*(.*)`,
          'i',
        ),
      );

      if (headerMatch) {
        const headerContent = headerMatch[1];
        if (headerContent) {
          this.parseMaterialItems(headerContent).forEach((item) => materials.push(item));
        }

        // Look for list items after the header
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (/^[-*•]\s+/.test(nextLine)) {
            const itemText = nextLine.replace(/^[-*•]\s+/, '');
            this.parseMaterialItems(itemText).forEach((item) => materials.push(item));
          } else if (!nextLine) {
            continue; // Skip empty lines
          } else if (!nextLine.startsWith(' ')) {
            break; // End of list
          }
        }
      }
    }

    return this.deduplicateMaterials(materials);
  }

  /**
   * AI-powered material extraction with smart categorization
   */
  private async extractMaterialsWithAI(text: string): Promise<SmartMaterial[]> {
    const prompt = `
Analyze the following activity description and extract all materials, supplies, equipment, and resources needed.

For each item, provide:
- name: The material name
- category: One of "supplies", "technology", "books", "equipment", "printables", "other"
- priority: One of "essential", "helpful", "optional"
- quantity: If mentioned (e.g., "5 sheets", "1 per student")
- prepTime: Estimated minutes needed to prepare this item

Return a JSON array of objects with these properties.

Activity text:
${text}

Example output:
[
  {
    "name": "construction paper",
    "category": "supplies",
    "priority": "essential",
    "quantity": "1 sheet per student",
    "prepTime": 2
  }
]
`;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that extracts materials from lesson plans. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const materials = JSON.parse(jsonMatch[0]) as SmartMaterial[];

      // Validate and clean up the results
      return materials.filter((m) => m.name && m.category && m.priority);
    } catch (error) {
      console.error('AI material extraction error:', error);
      return [];
    }
  }

  /**
   * Parse individual material items from text
   */
  private parseMaterialItems(text: string): SmartMaterial[] {
    return text
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => this.createBasicMaterial(item));
  }

  /**
   * Create a basic material object from text
   */
  private createBasicMaterial(text: string): SmartMaterial {
    const name = text.toLowerCase();

    // Simple categorization based on keywords
    let category: SmartMaterial['category'] = 'other';
    if (/paper|pencil|crayon|marker|scissors|glue|tape/i.test(name)) {
      category = 'supplies';
    } else if (/computer|tablet|ipad|projector|smartboard/i.test(name)) {
      category = 'technology';
    } else if (/book|novel|textbook|dictionary/i.test(name)) {
      category = 'books';
    } else if (/microscope|scale|ruler|calculator/i.test(name)) {
      category = 'equipment';
    } else if (/worksheet|handout|printout|template/i.test(name)) {
      category = 'printables';
    }

    // Simple priority based on keywords
    let priority: SmartMaterial['priority'] = 'helpful';
    if (/essential|required|must|need/i.test(text)) {
      priority = 'essential';
    } else if (/optional|extra|bonus|if available/i.test(text)) {
      priority = 'optional';
    }

    return {
      name: text,
      category,
      priority,
      prepTime: this.estimatePrepTime(name, category),
    };
  }

  /**
   * Estimate preparation time for materials
   */
  private estimatePrepTime(name: string, category: SmartMaterial['category']): number {
    if (category === 'printables') return 5;
    if (category === 'technology') return 10;
    if (category === 'equipment') return 3;
    if (/cut|organize|sort|setup/i.test(name)) return 8;
    return 2;
  }

  /**
   * Merge pattern-based and AI-based material lists
   */
  private mergeMaterialLists(pattern: SmartMaterial[], ai: SmartMaterial[]): SmartMaterial[] {
    const merged = [...ai];

    // Add pattern items that aren't covered by AI
    for (const patternItem of pattern) {
      const similar = ai.find((aiItem) => this.areSimilarMaterials(patternItem.name, aiItem.name));
      if (!similar) {
        merged.push(patternItem);
      }
    }

    return this.deduplicateMaterials(merged);
  }

  /**
   * Check if two material names are similar
   */
  private areSimilarMaterials(name1: string, name2: string): boolean {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();

    if (n1 === n2) return true;
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Check for common synonyms
    const synonyms = [
      ['paper', 'sheets'],
      ['pencil', 'pencils'],
      ['marker', 'markers'],
      ['computer', 'laptop', 'device'],
    ];

    for (const group of synonyms) {
      if (group.some((s) => n1.includes(s)) && group.some((s) => n2.includes(s))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Remove duplicate materials
   */
  private deduplicateMaterials(materials: SmartMaterial[]): SmartMaterial[] {
    const seen = new Set<string>();
    return materials.filter((material) => {
      const key = material.name.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate comprehensive weekly material plan
   */
  async generateWeeklyMaterialPlan(weekStart: string): Promise<WeeklyMaterialPlan> {
    // DISABLED: Legacy lessonPlan model removed in ETFO migration
    // const plan = null; // Legacy lessonPlan query disabled

    // Return empty plan for now
    return {
      weekStart,
      totalPrepTime: 0,
      materials: [],
      preparation: {
        printingNeeded: [],
        setupRequired: [],
        purchaseNeeded: [],
      },
      byDay: [],
    };
  }

  /**
   * Placeholder for orphaned code removal
   */
  private async _legacyCodeRemoved() {
    // This method contains orphaned code from legacy implementation
    return;
  }

  /**
   * Auto-update material list for a week
   */
  async autoUpdateMaterialList(weekStart: string): Promise<void> {
    const materialPlan = await this.generateWeeklyMaterialPlan(weekStart);

    // DISABLED: MaterialList model has been archived
    // TODO: Implement using ETFO UnitPlanResource and ETFOLessonPlanResource models
    const materialItems = materialPlan.materials.map((m) => m.name);
    console.warn(`autoUpdateMaterialList is disabled - MaterialList model archived. Items for ${weekStart}:`, materialItems);
  }
}

export const smartMaterialExtractor = new SmartMaterialExtractor();
