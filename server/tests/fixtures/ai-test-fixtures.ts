import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

/**
 * Test fixtures for AI services with consistent curriculum data
 */

export interface TestFixture {
  id: string;
  description: string;
  data: any;
}

export interface CurriculumTestData {
  expectations: Array<{
    id: string;
    code: string;
    description: string;
    subject: string;
    grade: number;
    strand: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    subject: string;
    expectationIds: string[];
  }>;
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    grade: number;
  }>;
  goals: Array<{
    id: string;
    description: string;
    studentId: string;
  }>;
  reflections: Array<{
    id: string;
    content: string;
    studentId: string;
  }>;
}

/**
 * Comprehensive curriculum test data for AI services
 */
export const CURRICULUM_TEST_DATA: CurriculumTestData = {
  expectations: [
    {
      id: 'test-math-001',
      code: 'M3.N1',
      description: 'Students will demonstrate understanding of place value for numbers to 1000',
      subject: 'Mathematics',
      grade: 3,
      strand: 'Number',
    },
    {
      id: 'test-math-002',
      code: 'M3.N2',
      description: 'Students will add and subtract whole numbers to 1000 using various strategies',
      subject: 'Mathematics',
      grade: 3,
      strand: 'Number',
    },
    {
      id: 'test-lang-001',
      code: 'L3.R1',
      description: 'Students will read and demonstrate comprehension of grade-appropriate texts',
      subject: 'Language',
      grade: 3,
      strand: 'Reading',
    },
    {
      id: 'test-sci-001',
      code: 'S3.L1',
      description: 'Students will demonstrate understanding of living and non-living things',
      subject: 'Science',
      grade: 3,
      strand: 'Life Systems',
    },
    {
      id: 'test-math-003',
      code: 'M3.G1',
      description: 'Students will identify and describe geometric shapes and their properties',
      subject: 'Mathematics',
      grade: 3,
      strand: 'Geometry',
    },
  ],
  activities: [
    {
      id: 'test-activity-001',
      title: 'Place Value Tower Building',
      description: 'Students use base-10 blocks to build towers representing three-digit numbers',
      subject: 'Mathematics',
      expectationIds: ['test-math-001'],
    },
    {
      id: 'test-activity-002',
      title: 'Mental Math Strategies Practice',
      description:
        'Students practice addition and subtraction using number lines and hundreds charts',
      subject: 'Mathematics',
      expectationIds: ['test-math-002'],
    },
    {
      id: 'test-activity-003',
      title: 'Guided Reading Comprehension',
      description: 'Students read leveled texts and answer comprehension questions',
      subject: 'Language',
      expectationIds: ['test-lang-001'],
    },
    {
      id: 'test-activity-004',
      title: 'Living vs Non-Living Classification',
      description:
        'Students sort various objects and organisms into living and non-living categories',
      subject: 'Science',
      expectationIds: ['test-sci-001'],
    },
    {
      id: 'test-activity-005',
      title: 'Shape Hunt and Description',
      description: 'Students find geometric shapes in the classroom and describe their properties',
      subject: 'Mathematics',
      expectationIds: ['test-math-003'],
    },
  ],
  students: [
    {
      id: 'test-student-001',
      firstName: 'Emma',
      lastName: 'Thompson',
      grade: 3,
    },
    {
      id: 'test-student-002',
      firstName: 'Liam',
      lastName: 'Chen',
      grade: 3,
    },
    {
      id: 'test-student-003',
      firstName: 'Sophie',
      lastName: 'Dubois',
      grade: 3,
    },
    {
      id: 'test-student-004',
      firstName: 'Marcus',
      lastName: 'Johnson',
      grade: 3,
    },
  ],
  goals: [
    {
      id: 'test-goal-001',
      description: 'Master multiplication facts for numbers 1-5',
      studentId: 'test-student-001',
    },
    {
      id: 'test-goal-002',
      description: 'Read independently for 20 minutes daily',
      studentId: 'test-student-001',
    },
    {
      id: 'test-goal-003',
      description: 'Improve problem-solving explanation skills',
      studentId: 'test-student-002',
    },
    {
      id: 'test-goal-004',
      description: 'Develop confidence in oral presentations',
      studentId: 'test-student-002',
    },
    {
      id: 'test-goal-005',
      description: 'Master addition and subtraction to 100',
      studentId: 'test-student-003',
    },
    {
      id: 'test-goal-006',
      description: 'Increase writing stamina and fluency',
      studentId: 'test-student-004',
    },
  ],
  reflections: [
    {
      id: 'test-reflection-001',
      content:
        'Emma shows excellent understanding of place value concepts. She can decompose numbers accurately.',
      studentId: 'test-student-001',
    },
    {
      id: 'test-reflection-002',
      content:
        "Emma's reading comprehension is strong. She makes thoughtful connections to prior knowledge.",
      studentId: 'test-student-001',
    },
    {
      id: 'test-reflection-003',
      content:
        'Liam is developing confidence in explaining his mathematical thinking step by step.',
      studentId: 'test-student-002',
    },
    {
      id: 'test-reflection-004',
      content: 'Sophie works well independently and shows persistence with challenging problems.',
      studentId: 'test-student-003',
    },
    {
      id: 'test-reflection-005',
      content:
        'Marcus has improved his focus during writing tasks and produces more detailed work.',
      studentId: 'test-student-004',
    },
  ],
};

/**
 * Test prompts for AI services to ensure consistent and meaningful testing
 */
export const AI_TEST_PROMPTS = {
  // LLM Service test prompts
  llm: {
    simple: 'Create a brief welcome message for elementary students.',
    educational: 'Design a math activity for grade 3 students learning about place value.',
    curriculum: 'Generate learning objectives for Ontario curriculum expectation M3.N1.',
    bilingual: 'Create a parent newsletter introduction about upcoming math activities.',
    complex:
      'Develop a comprehensive lesson plan for teaching addition strategies to grade 3 students with diverse learning needs.',
  },

  // Embedding service test texts
  embedding: {
    mathematics: [
      'Students will understand place value for three-digit numbers',
      'Students will add and subtract using various mental math strategies',
      'Students will solve word problems involving addition and subtraction',
      'Students will identify and describe properties of geometric shapes',
    ],
    language: [
      'Students will read fluently with appropriate expression and pacing',
      'Students will demonstrate comprehension through written responses',
      'Students will use phonics knowledge to decode unfamiliar words',
      'Students will write coherent paragraphs with proper structure',
    ],
    science: [
      'Students will classify living and non-living things in their environment',
      'Students will observe and record changes in plant growth over time',
      'Students will identify basic needs of living organisms',
      'Students will describe simple machines and their uses',
    ],
    unrelated: [
      'The quick brown fox jumps over the lazy dog',
      'Weather patterns vary significantly across different geographical regions',
      'Technology has transformed modern communication methods',
      'Historical events shape contemporary society and culture',
    ],
  },

  // Parent summary test scenarios
  parentSummary: {
    mathematics: 'Mathematics learning with place value and addition strategies',
    multiSubject: 'Cross-curricular learning including math, language, and science',
    socialEmotional: 'Social-emotional development and classroom collaboration',
    individualGrowth: 'Individual academic growth and personal achievements',
    challenges: 'Areas of growth and support strategies being implemented',
  },
};

/**
 * Embedding cache for cost optimization during testing
 */
export class EmbeddingTestCache {
  private cache: Map<string, number[]> = new Map();
  private readonly maxSize = 1000;

  /**
   * Get cached embedding for text
   */
  get(text: string): number[] | null {
    const key = this.generateKey(text);
    return this.cache.get(key) || null;
  }

  /**
   * Store embedding in cache
   */
  set(text: string, embedding: number[]): void {
    const key = this.generateKey(text);

    // Simple LRU: if cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, embedding);
  }

  /**
   * Check if embedding exists in cache
   */
  has(text: string): boolean {
    const key = this.generateKey(text);
    return this.cache.has(key);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  private generateKey(text: string): string {
    return crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex');
  }
}

/**
 * Rate limiter for API calls during testing
 */
export class TestRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 20, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(): boolean {
    const now = Date.now();

    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a request
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  /**
   * Wait until next request is allowed
   */
  async waitUntilAllowed(): Promise<void> {
    while (!this.isAllowed()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  /**
   * Get current usage stats
   */
  getStats(): { currentRequests: number; maxRequests: number; resetTime: number } {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      resetTime: this.requests.length > 0 ? Math.max(...this.requests) + this.windowMs : now,
    };
  }
}

/**
 * Database fixture manager for AI tests
 */
export class AITestFixtureManager {
  private prisma: PrismaClient;
  private testUserId: number | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Setup comprehensive test data
   */
  async setupTestData(): Promise<{ userId: number; studentIds: number[] }> {
    // Create test user
    const user = await this.prisma.user.create({
      data: {
        email: `test-ai-${Date.now()}@example.com`,
        name: 'Test Teacher',
        password: 'test-password-123',
        role: 'teacher',
      },
    });
    this.testUserId = user.id;

    // Create curriculum expectations (no userId field in this model)
    const expectations = await Promise.all(
      CURRICULUM_TEST_DATA.expectations.map((exp) =>
        this.prisma.curriculumExpectation.create({
          data: {
            id: exp.id,
            code: exp.code,
            description: exp.description,
            subject: exp.subject,
            grade: exp.grade,
            strand: exp.strand,
          },
        }),
      ),
    );

    // Create students
    const students = await Promise.all(
      CURRICULUM_TEST_DATA.students.map((student) =>
        this.prisma.student.create({
          data: {
            id: parseInt(student.id.replace('test-student-', '')),
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            userId: this.testUserId!,
          },
        }),
      ),
    );

    // Create daybook entries for activities
    await Promise.all(
      CURRICULUM_TEST_DATA.activities.map((activity) =>
        this.prisma.daybookEntry.create({
          data: {
            id: activity.id,
            date: new Date(),
            userId: this.testUserId!,
            notes: `${activity.title}: ${activity.description}`,
            expectations: {
              create: activity.expectationIds.map((expId) => ({
                expectationId: expId,
              })),
            },
          },
        }),
      ),
    );

    // Create student goals
    await Promise.all(
      CURRICULUM_TEST_DATA.goals.map((goal) =>
        this.prisma.studentGoal.create({
          data: {
            text: goal.description,
            studentId: parseInt(goal.studentId.replace('test-student-', '')),
            createdAt: new Date(),
          },
        }),
      ),
    );

    // Create student reflections
    await Promise.all(
      CURRICULUM_TEST_DATA.reflections.map((reflection) =>
        this.prisma.studentReflection.create({
          data: {
            content: reflection.content,
            studentId: parseInt(reflection.studentId.replace('test-student-', '')),
            date: new Date(),
          },
        }),
      ),
    );

    return {
      userId: this.testUserId,
      studentIds: students.map((s) => s.id),
    };
  }

  /**
   * Cleanup test data
   */
  async cleanup(): Promise<void> {
    if (!this.testUserId) return;

    // Clean up in proper order due to foreign key constraints
    await this.prisma.daybookEntryExpectation.deleteMany({
      where: { daybookEntry: { userId: this.testUserId } },
    });
    await this.prisma.studentReflection.deleteMany({
      where: { student: { userId: this.testUserId } },
    });
    await this.prisma.studentGoal.deleteMany({
      where: { student: { userId: this.testUserId } },
    });
    await this.prisma.daybookEntry.deleteMany({
      where: { userId: this.testUserId },
    });
    await this.prisma.curriculumExpectationEmbedding.deleteMany({
      where: { expectation: { id: { in: CURRICULUM_TEST_DATA.expectations.map((e) => e.id) } } },
    });
    await this.prisma.curriculumExpectation.deleteMany({
      where: { id: { in: CURRICULUM_TEST_DATA.expectations.map((e) => e.id) } },
    });
    await this.prisma.student.deleteMany({
      where: { userId: this.testUserId },
    });
    await this.prisma.user.deleteMany({
      where: { id: this.testUserId },
    });

    this.testUserId = null;
  }
}

/**
 * Performance monitoring for AI tests
 */
export class AITestPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Record a performance metric
   */
  record(metricName: string, value: number): void {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    this.metrics.get(metricName)!.push(value);
  }

  /**
   * Get statistics for a metric
   */
  getStats(metricName: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const values = this.metrics.get(metricName);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = sorted[p95Index];

    return { count, avg, min, max, p95 };
  }

  /**
   * Get all metrics summary
   */
  getAllStats(): Record<string, any> {
    const summary: Record<string, any> = {};

    for (const [metricName] of this.metrics) {
      summary[metricName] = this.getStats(metricName);
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Export global instances for test use
export const embeddingCache = new EmbeddingTestCache();
export const testRateLimiter = new TestRateLimiter();
export const performanceMonitor = new AITestPerformanceMonitor();
