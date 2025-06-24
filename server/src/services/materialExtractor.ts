// import { prisma } from '../prisma'; // Currently unused

export interface MaterialItem {
  id: string;
  name: string;
  category: 'physical' | 'digital' | 'printable' | 'supplies' | 'equipment';
  quantity?: number;
  location?: string;
  preparation?: string;
  alternatives?: string[];
  priority: 'essential' | 'recommended' | 'optional';
  source: 'activity' | 'resource' | 'inferred';
}

export interface TimedMaterialList {
  time: string;
  activity: string;
  materials: MaterialItem[];
  setupTime?: number; // minutes needed for setup
  notes?: string;
}

export interface ExtractedMaterials {
  byTimeSlot: TimedMaterialList[];
  byCategory: {
    physical: MaterialItem[];
    digital: MaterialItem[];
    printable: MaterialItem[];
    supplies: MaterialItem[];
    equipment: MaterialItem[];
  };
  setupInstructions: string[];
  alternatives: Array<{
    original: string;
    backup: string;
    reason: string;
  }>;
  summary: {
    totalItems: number;
    prepTime: number;
    missingItems: string[];
  };
}

/**
 * Create an empty material list
 */
function createEmptyMaterialList(): ExtractedMaterials {
  return {
    byTimeSlot: [],
    byCategory: {
      physical: [],
      digital: [],
      printable: [],
      supplies: [],
      equipment: [],
    },
    setupInstructions: [],
    alternatives: [],
    summary: {
      totalItems: 0,
      prepTime: 0,
      missingItems: [],
    },
  };
}

/**
 * Extract all materials needed for a day's activities
 */
export async function extractDayMaterials(
  date: string,
  _userId: number = 1,
): Promise<ExtractedMaterials> {
  // DISABLED: Legacy function that used dailyPlan/Activity models
  // TODO: Reimplement using ETFO lesson plans and daybook entries
  console.warn('extractDayMaterials is disabled - legacy models removed');
  return createEmptyMaterialList();
}

/**
 * Extract materials for multiple days (weekly planning)
 */
export async function extractWeeklyMaterials(
  startDate: string,
  numDays: number = 5,
  userId: number = 1,
): Promise<Array<{ date: string; materials: ExtractedMaterials }>> {
  const weeklyMaterials = [];
  const startDateObj = new Date(startDate);

  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setUTCDate(startDateObj.getUTCDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayMaterials = await extractDayMaterials(dateStr, userId);
    weeklyMaterials.push({
      date: dateStr,
      materials: dayMaterials,
    });
  }

  return weeklyMaterials;
}

/**
 * Extract materials for a specific activity
 */
// Unused legacy function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function extractActivityMaterials(
  activity: {
    materials?: string[];
    title?: string;
    resources?: Array<{
      id?: string;
      type?: string;
      filename?: string;
      title?: string;
      url?: string;
    }>;
    publicNote?: string;
    privateNote?: string;
    milestone?: { subject?: { name?: string } };
    materialsText?: string;
  },
  _startMin: number,
): Promise<{
  materials: MaterialItem[];
  setupTime?: number;
  notes?: string;
}> {
  if (!activity) {
    return { materials: [] };
  }

  const materials: MaterialItem[] = [];
  let setupTime = 0;

  // Extract from linked resources
  if (activity.resources && activity.resources.length > 0) {
    for (const resource of activity.resources) {
      const materialItem = convertResourceToMaterial(resource);
      if (materialItem) {
        materials.push(materialItem);
      }
    }
  }

  // Parse activity description and materials text for material mentions
  const inferredMaterials = parseActivityDescription(
    activity.title || '',
    activity.publicNote || activity.privateNote || '',
    activity.milestone?.subject?.name,
  );
  materials.push(...inferredMaterials);

  // Parse materials text if available
  if (activity.materialsText) {
    const parsedMaterials = parseMaterialsText(activity.materialsText);
    materials.push(...parsedMaterials);
  }

  // Add subject-specific materials
  const subjectMaterials = getSubjectBasicMaterials(activity.milestone?.subject?.name);
  materials.push(...subjectMaterials);

  // Estimate setup time based on materials
  setupTime = estimateSetupTime(materials);

  return {
    materials: removeDuplicateMaterials(materials),
    setupTime,
    notes: generateActivityNotes(activity, materials),
  };
}

/**
 * Convert a resource to a material item
 */
function convertResourceToMaterial(resource: {
  id?: string;
  type?: string;
  filename?: string;
  title?: string;
  url?: string;
}): MaterialItem | null {
  if (!resource) return null;

  const category = determineResourceCategory(resource.type, resource.filename);

  return {
    id: `resource-${resource.id || Date.now()}`,
    name: resource.filename || 'Unknown Resource',
    category,
    location: resource.url ? 'Digital file' : 'File location unknown',
    priority: 'recommended',
    source: 'resource',
  };
}

/**
 * Parse activity description to find material mentions
 */
function parseActivityDescription(
  title: string,
  description: string,
  _subject?: string,
): MaterialItem[] {
  const text = `${title} ${description}`.toLowerCase();
  const materials: MaterialItem[] = [];

  // Common material patterns
  const materialPatterns = [
    // Physical materials
    {
      pattern: /\b(paper|worksheet|handout)s?\b/g,
      name: 'Paper/Worksheets',
      category: 'printable' as const,
    },
    {
      pattern: /\b(pencil|pen|marker|crayon)s?\b/g,
      name: 'Writing tools',
      category: 'supplies' as const,
    },
    {
      pattern: /\b(calculator|ruler|compass)s?\b/g,
      name: 'Math tools',
      category: 'equipment' as const,
    },
    { pattern: /\b(book|textbook|novel)s?\b/g, name: 'Books', category: 'physical' as const },
    { pattern: /\b(scissors|glue|tape)\b/g, name: 'Art supplies', category: 'supplies' as const },
    {
      pattern: /\b(computer|tablet|laptop)s?\b/g,
      name: 'Technology',
      category: 'equipment' as const,
    },
    {
      pattern: /\b(whiteboard|smartboard|projector)\b/g,
      name: 'Display equipment',
      category: 'equipment' as const,
    },

    // Digital materials
    {
      pattern: /\b(video|movie|presentation|slideshow)\b/g,
      name: 'Digital media',
      category: 'digital' as const,
    },
    {
      pattern: /\b(website|online|internet)\b/g,
      name: 'Online resources',
      category: 'digital' as const,
    },

    // Subject-specific
    {
      pattern: /\b(manipulative|counter|block)s?\b/g,
      name: 'Math manipulatives',
      category: 'equipment' as const,
    },
    {
      pattern: /\b(microscope|magnet|beaker)s?\b/g,
      name: 'Science equipment',
      category: 'equipment' as const,
    },
    {
      pattern: /\b(map|globe|chart)s?\b/g,
      name: 'Reference materials',
      category: 'physical' as const,
    },
  ];

  materialPatterns.forEach(({ pattern, name, category }) => {
    if (pattern.test(text)) {
      materials.push({
        id: `inferred-${name.replace(/\s+/g, '-').toLowerCase()}`,
        name,
        category,
        priority: 'recommended',
        source: 'inferred',
      });
    }
  });

  return materials;
}

/**
 * Parse comma-separated materials text into material items
 */
function parseMaterialsText(materialsText: string): MaterialItem[] {
  if (!materialsText) return [];

  const materials: MaterialItem[] = [];
  const items = materialsText
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  items.forEach((item, index) => {
    const category = determineMaterialCategory(item);
    materials.push({
      id: `material-text-${index}`,
      name: item,
      category,
      priority: 'essential', // Materials explicitly listed are likely essential
      source: 'activity',
    });
  });

  return materials;
}

/**
 * Determine resource category based on type and filename
 */
function determineResourceCategory(type?: string, filename?: string): MaterialItem['category'] {
  const combined = `${type || ''} ${filename || ''}`.toLowerCase();

  if (combined.includes('pdf') || combined.includes('worksheet') || combined.includes('handout')) {
    return 'printable';
  }
  if (combined.includes('video') || combined.includes('online') || combined.includes('website')) {
    return 'digital';
  }
  if (combined.includes('book') || combined.includes('card')) {
    return 'physical';
  }
  if (combined.includes('equipment') || combined.includes('tool')) {
    return 'equipment';
  }

  return 'supplies';
}

/**
 * Determine category based on material name
 */
function determineMaterialCategory(name: string): MaterialItem['category'] {
  const nameLower = name.toLowerCase();

  if (
    nameLower.includes('worksheet') ||
    nameLower.includes('handout') ||
    nameLower.includes('paper')
  ) {
    return 'printable';
  }
  if (
    nameLower.includes('computer') ||
    nameLower.includes('tablet') ||
    nameLower.includes('online') ||
    nameLower.includes('digital')
  ) {
    return 'digital';
  }
  if (nameLower.includes('book') || nameLower.includes('card') || nameLower.includes('poster')) {
    return 'physical';
  }
  if (
    nameLower.includes('calculator') ||
    nameLower.includes('projector') ||
    nameLower.includes('equipment')
  ) {
    return 'equipment';
  }

  // Default to supplies for things like pencils, markers, etc.
  return 'supplies';
}

/**
 * Get basic materials every subject typically needs
 */
function getSubjectBasicMaterials(subject?: string): MaterialItem[] {
  const basicMaterials: MaterialItem[] = [
    {
      id: 'basic-writing',
      name: 'Pencils/Pens',
      category: 'supplies',
      priority: 'essential',
      source: 'inferred',
    },
    {
      id: 'basic-paper',
      name: 'Paper',
      category: 'supplies',
      priority: 'essential',
      source: 'inferred',
    },
  ];

  if (!subject) return basicMaterials;

  const subjectLower = subject.toLowerCase();

  if (subjectLower.includes('math')) {
    basicMaterials.push(
      {
        id: 'math-manipulatives',
        name: 'Math manipulatives',
        category: 'equipment',
        priority: 'recommended',
        source: 'inferred',
      },
      {
        id: 'math-calculator',
        name: 'Calculator',
        category: 'equipment',
        priority: 'optional',
        source: 'inferred',
      },
    );
  }

  if (subjectLower.includes('science')) {
    basicMaterials.push({
      id: 'science-notebook',
      name: 'Science notebook',
      category: 'supplies',
      priority: 'recommended',
      source: 'inferred',
    });
  }

  if (subjectLower.includes('art')) {
    basicMaterials.push({
      id: 'art-supplies',
      name: 'Art supplies (crayons, markers)',
      category: 'supplies',
      priority: 'essential',
      source: 'inferred',
    });
  }

  if (subjectLower.includes('language') || subjectLower.includes('english')) {
    basicMaterials.push({
      id: 'reading-books',
      name: 'Reading books',
      category: 'physical',
      priority: 'recommended',
      source: 'inferred',
    });
  }

  return basicMaterials;
}

/**
 * Categorize materials by type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function categorizeMaterials(materials: MaterialItem[]) {
  return {
    physical: materials.filter((m) => m.category === 'physical'),
    digital: materials.filter((m) => m.category === 'digital'),
    printable: materials.filter((m) => m.category === 'printable'),
    supplies: materials.filter((m) => m.category === 'supplies'),
    equipment: materials.filter((m) => m.category === 'equipment'),
  };
}

/**
 * Remove duplicate materials based on name similarity
 */
function removeDuplicateMaterials(materials: MaterialItem[]): MaterialItem[] {
  const seen = new Set<string>();
  return materials.filter((material) => {
    const key = material.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Generate setup instructions for the day
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateSetupInstructions(timeSlots: TimedMaterialList[]): string[] {
  const instructions: string[] = [];

  // Morning setup
  const morningMaterials = timeSlots
    .filter((slot) => parseInt(slot.time.split(':')[0]) < 10)
    .flatMap((slot) => slot.materials);

  if (morningMaterials.length > 0) {
    instructions.push('Morning Setup:');
    instructions.push('- Arrive 15 minutes early to set up materials');
    instructions.push('- Check that all technology is working');
    instructions.push('- Prepare first activity materials at student desks');
  }

  // Special equipment setup
  const equipment = timeSlots.flatMap((slot) =>
    slot.materials.filter((m) => m.category === 'equipment'),
  );

  if (equipment.length > 0) {
    instructions.push('Equipment Setup:');
    equipment.forEach((item) => {
      instructions.push(`- Test ${item.name} before students arrive`);
    });
  }

  // Transition preparations
  timeSlots.forEach((slot, index) => {
    if (slot.setupTime && slot.setupTime > 5) {
      const nextSlot = timeSlots[index + 1];
      if (nextSlot) {
        instructions.push(
          `Before ${slot.time}: Allow ${slot.setupTime} minutes to prepare materials for "${slot.activity}"`,
        );
      }
    }
  });

  return instructions;
}

/**
 * Generate alternative materials for common scenarios
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateMaterialAlternatives(materials: MaterialItem[]) {
  const alternatives = [];

  // Technology alternatives
  const techItems = materials.filter((m) => m.category === 'digital' || m.category === 'equipment');
  if (techItems.length > 0) {
    alternatives.push({
      original: 'Digital/Technology materials',
      backup: 'Paper-based worksheets and hands-on activities',
      reason: 'Technology failure or unavailability',
    });
  }

  // Specific alternatives
  const specificAlts = [
    { original: 'Smartboard', backup: 'Whiteboard and markers', reason: 'Technology issues' },
    { original: 'Computers', backup: 'Worksheets and group work', reason: 'No computer access' },
    { original: 'Art supplies', backup: 'Basic drawing materials', reason: 'Missing art supplies' },
    {
      original: 'Science equipment',
      backup: 'Demonstration or video',
      reason: 'Safety or missing equipment',
    },
    { original: 'Books', backup: 'Shared reading or audio books', reason: 'Insufficient copies' },
  ];

  materials.forEach((material) => {
    const alt = specificAlts.find((a) =>
      material.name.toLowerCase().includes(a.original.toLowerCase()),
    );
    if (alt && !alternatives.some((existing) => existing.original === alt.original)) {
      alternatives.push(alt);
    }
  });

  return alternatives;
}

/**
 * Estimate setup time based on materials complexity
 */
function estimateSetupTime(materials: MaterialItem[]): number {
  let time = 0;

  materials.forEach((material) => {
    switch (material.category) {
      case 'equipment':
        time += 3; // 3 minutes per equipment item
        break;
      case 'digital':
        time += 2; // 2 minutes for digital setup
        break;
      case 'supplies':
        time += 1; // 1 minute for supplies distribution
        break;
      default:
        time += 0.5; // Basic items
    }
  });

  return Math.max(0, Math.round(time));
}

/**
 * Generate activity-specific notes
 */
function generateActivityNotes(
  activity: {
    materials?: string[];
    title?: string;
    resources?: Array<{
      id?: string;
      type?: string;
      filename?: string;
      title?: string;
      url?: string;
    }>;
    publicNote?: string;
    privateNote?: string;
    milestone?: { subject?: { name?: string } };
    materialsText?: string;
    type?: string;
    duration?: number;
  },
  materials: MaterialItem[],
): string | undefined {
  const notes = [];

  if (materials.some((m) => m.category === 'equipment')) {
    notes.push('Test all equipment before activity begins');
  }

  if (materials.some((m) => m.category === 'digital')) {
    notes.push('Have backup plan ready in case of technology issues');
  }

  if (activity.duration && activity.duration > 60) {
    notes.push('Long activity - prepare materials for smooth transitions');
  }

  return notes.length > 0 ? notes.join('; ') : undefined;
}

/**
 * Identify potentially missing items that should be checked
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function identifyPotentialMissingItems(materials: MaterialItem[]): string[] {
  const missing = [];

  const essentialCategories = ['supplies', 'equipment'];
  essentialCategories.forEach((category) => {
    const categoryItems = materials.filter((m) => m.category === category);
    if (categoryItems.length === 0) {
      missing.push(`No ${category} identified - check if any are needed`);
    }
  });

  return missing;
}

/**
 * Format time from minutes to HH:MM
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
