/**
 * Mock Data Service for Analytics
 *
 * Generates realistic demo data for analytics dashboards while the
 * actual data collection systems are being implemented.
 */

export interface MockOutcome {
  id: string;
  code: string;
  description: string;
  subject: string;
  domain: string;
  grade: number;
}

export interface MockActivity {
  id: number;
  title: string;
  activityType: string;
  createdAt: Date;
  outcomeIds: string[];
}

export interface MockStudent {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
}

class MockDataService {
  private outcomes: MockOutcome[] = [];
  private activities: MockActivity[] = [];
  private students: MockStudent[] = [];

  constructor() {
    this.generateMockData();
  }

  private generateMockData(): void {
    this.generateOutcomes();
    this.generateActivities();
    this.generateStudents();
  }

  private generateOutcomes(): void {
    const subjects = ['Mathematics', 'Language Arts', 'Science', 'Social Studies', 'French'];
    const domains = {
      Mathematics: ['Number Sense', 'Algebra', 'Geometry', 'Measurement', 'Data Management'],
      'Language Arts': ['Reading', 'Writing', 'Oral Communication', 'Media Literacy'],
      Science: [
        'Life Systems',
        'Matter and Energy',
        'Structures and Mechanisms',
        'Earth and Space',
      ],
      'Social Studies': ['Heritage and Identity', 'People and Environments', 'Citizenship'],
      French: ['Oral Communication', 'Reading', 'Writing', 'Intercultural Understanding'],
    };

    let outcomeId = 1;
    for (const subject of subjects) {
      const subjectDomains = domains[subject as keyof typeof domains] || ['General'];
      for (const domain of subjectDomains) {
        for (let i = 1; i <= 8; i++) {
          this.outcomes.push({
            id: `${subject.toLowerCase().replace(/ /g, '-')}-${domain.toLowerCase().replace(/ /g, '-')}-${i}`,
            code: `${subject.charAt(0)}${domain
              .split(' ')
              .map((w) => w.charAt(0))
              .join('')}.${i}`,
            description: `${subject} outcome for ${domain} - Level ${i}`,
            subject,
            domain,
            grade: 3 + Math.floor(i / 3), // Grades 3-5
          });
          outcomeId++;
        }
      }
    }
  }

  private generateActivities(): void {
    const activityTypes = ['lesson', 'assessment', 'project', 'review', 'practice'];

    for (let i = 1; i <= 200; i++) {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const weeksAgo = Math.floor(Math.random() * 20);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - weeksAgo * 7);

      // Randomly select 1-3 outcomes
      const outcomeCount = 1 + Math.floor(Math.random() * 3);
      const selectedOutcomes = this.getRandomOutcomes(outcomeCount);

      this.activities.push({
        id: i,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Activity ${i}`,
        activityType: type,
        createdAt,
        outcomeIds: selectedOutcomes.map((o) => o.id),
      });
    }
  }

  private generateStudents(): void {
    const firstNames = [
      'Emma',
      'Liam',
      'Olivia',
      'Noah',
      'Ava',
      'Oliver',
      'Isabella',
      'William',
      'Sophia',
      'Elijah',
      'Charlotte',
      'James',
      'Amelia',
      'Benjamin',
      'Mia',
      'Lucas',
      'Harper',
      'Mason',
      'Evelyn',
      'Ethan',
      'Abigail',
      'Alexander',
      'Emily',
      'Henry',
    ];

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
    ];

    for (let i = 1; i <= 30; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      this.students.push({
        id: i,
        firstName,
        lastName,
        grade: 3 + Math.floor(Math.random() * 3), // Grades 3-5
      });
    }
  }

  // Public methods for accessing mock data

  getOutcomes(filters?: { subject?: string; domain?: string; grade?: number }): MockOutcome[] {
    let filtered = [...this.outcomes];

    if (filters?.subject) {
      filtered = filtered.filter((o) => o.subject === filters.subject);
    }
    if (filters?.domain) {
      filtered = filtered.filter((o) => o.domain === filters.domain);
    }
    if (filters?.grade) {
      filtered = filtered.filter((o) => o.grade === filters.grade);
    }

    return filtered;
  }

  getActivities(filters?: {
    teacherId?: number;
    startDate?: Date;
    endDate?: Date;
    outcomeIds?: string[];
  }): MockActivity[] {
    let filtered = [...this.activities];

    if (filters?.startDate) {
      filtered = filtered.filter((a) => a.createdAt >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter((a) => a.createdAt <= filters.endDate!);
    }
    if (filters?.outcomeIds) {
      filtered = filtered.filter((a) =>
        a.outcomeIds.some((id) => filters.outcomeIds!.includes(id)),
      );
    }

    return filtered;
  }

  getStudents(filters?: { teacherId?: number; grade?: number }): MockStudent[] {
    let filtered = [...this.students];

    if (filters?.grade) {
      filtered = filtered.filter((s) => s.grade === filters.grade);
    }

    return filtered;
  }

  private getRandomOutcomes(count: number): MockOutcome[] {
    const shuffled = [...this.outcomes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Generate coverage data for heatmaps
  generateCoverageData(
    outcomes: MockOutcome[],
    weeks: number[],
    viewMode: 'planned' | 'taught' | 'assessed' | 'reinforced',
  ): Record<string, Record<number, number>> {
    const grid: Record<string, Record<number, number>> = {};

    for (const outcome of outcomes) {
      grid[outcome.id] = {};

      for (const week of weeks) {
        // Generate realistic coverage patterns
        let probability = 0.1; // Base 10% chance

        switch (viewMode) {
          case 'planned':
            probability = 0.3; // 30% chance of being planned
            break;
          case 'taught':
            probability = 0.25; // 25% chance of being taught
            break;
          case 'assessed':
            probability = 0.15; // 15% chance of being assessed
            break;
          case 'reinforced':
            probability = 0.2; // 20% chance of being reinforced
            break;
        }

        // Some outcomes are more frequently used
        if (outcome.subject === 'Mathematics' || outcome.subject === 'Language Arts') {
          probability *= 1.5;
        }

        // Generate count (0-3 activities per week)
        const count = Math.random() < probability ? 1 + Math.floor(Math.random() * 3) : 0;

        grid[outcome.id][week] = count;
      }
    }

    return grid;
  }

  // Generate vocabulary data for students
  generateVocabularyData(
    studentId: number,
    weekCount: number = 20,
  ): Array<{
    word: string;
    language: 'en' | 'fr';
    domain: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
    dateIntroduced: Date;
    acquired: boolean;
  }> {
    const vocabularyData = [];
    const domains = ['reading', 'writing', 'oral', 'math', 'science'];

    const enWords = {
      basic: ['cat', 'dog', 'house', 'tree', 'book', 'water', 'happy', 'run', 'big', 'small'],
      intermediate: [
        'adventure',
        'explore',
        'discover',
        'create',
        'imagine',
        'compare',
        'analyze',
        'describe',
      ],
      advanced: [
        'magnificent',
        'extraordinary',
        'perseverance',
        'contemplation',
        'metamorphosis',
        'synthesize',
      ],
    };

    const frWords = {
      basic: [
        'chat',
        'chien',
        'maison',
        'arbre',
        'livre',
        'eau',
        'heureux',
        'courir',
        'grand',
        'petit',
      ],
      intermediate: [
        'aventure',
        'explorer',
        'découvrir',
        'créer',
        'imaginer',
        'comparer',
        'analyser',
        'décrire',
      ],
      advanced: [
        'magnifique',
        'extraordinaire',
        'persévérance',
        'contemplation',
        'métamorphose',
        'synthétiser',
      ],
    };

    // Generate 60-120 vocabulary words
    const wordCount = 60 + Math.floor(Math.random() * 60);

    for (let i = 0; i < wordCount; i++) {
      const language = Math.random() > 0.5 ? 'en' : 'fr';
      const difficulty =
        Math.random() < 0.5 ? 'basic' : Math.random() < 0.8 ? 'intermediate' : 'advanced';
      const domain = domains[Math.floor(Math.random() * domains.length)];

      const wordList = language === 'en' ? enWords[difficulty] : frWords[difficulty];
      const word = wordList[Math.floor(Math.random() * wordList.length)];

      // Generate date within the past weeks
      const weeksAgo = Math.floor(Math.random() * weekCount);
      const dateIntroduced = new Date();
      dateIntroduced.setDate(dateIntroduced.getDate() - weeksAgo * 7);

      vocabularyData.push({
        word: `${word}_${i}`, // Make unique
        language,
        domain,
        difficulty,
        dateIntroduced,
        acquired: Math.random() > 0.3, // 70% acquisition rate
      });
    }

    return vocabularyData;
  }
}

export const mockDataService = new MockDataService();
