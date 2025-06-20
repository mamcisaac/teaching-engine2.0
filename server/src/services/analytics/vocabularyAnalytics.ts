/**
 * Vocabulary Analytics Service
 *
 * Provides vocabulary growth tracking and bilingual analytics,
 * analyzing word acquisition patterns and cross-language connections.
 */

import { PrismaClient } from '@teaching-engine/database';
import { cached, analyticsCache } from './analyticsCache';

const prisma = new PrismaClient();

export interface VocabularyEntry {
  id: string;
  word: string;
  language: 'en' | 'fr';
  domain: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  dateIntroduced: Date;
  dateAcquired?: Date;
  cognateId?: string;
  contextSentence?: string;
  frequency: number;
}

export interface VocabularyGrowthData {
  studentId: number;
  studentName: string;
  totalWords: number;
  wordsThisTerm: number;
  weeklyGrowth: Array<{
    week: number;
    newWords: number;
    cumulativeWords: number;
    languages: { en: number; fr: number };
  }>;
  domainBreakdown: Record<
    string,
    {
      count: number;
      percentage: number;
      recentWords: string[];
    }
  >;
  difficultyProgression: {
    basic: number;
    intermediate: number;
    advanced: number;
  };
  acquisitionRate: number; // words per week
  targetGrowth: number;
  projectedEndOfTerm: number;
}

export interface BilingualAnalytics {
  studentId: number;
  cognateConnections: Array<{
    enWord: string;
    frWord: string;
    domain: string;
    similarity: number;
    acquired: boolean;
  }>;
  languageBalance: {
    english: { count: number; percentage: number };
    french: { count: number; percentage: number };
  };
  transferPatterns: Array<{
    pattern: string;
    examples: Array<{ en: string; fr: string }>;
    strength: number;
  }>;
  recommendedCognates: Array<{
    enWord: string;
    frWord: string;
    domain: string;
    priority: number;
    rationale: string;
  }>;
}

export interface ClassVocabularyInsights {
  classSize: number;
  averageWordsPerStudent: number;
  topPerformers: Array<{
    studentId: number;
    studentName: string;
    wordCount: number;
    acquisitionRate: number;
  }>;
  strugglingStudents: Array<{
    studentId: number;
    studentName: string;
    wordCount: number;
    recommendations: string[];
  }>;
  commonWords: Array<{
    word: string;
    language: 'en' | 'fr';
    studentCount: number;
    domain: string;
  }>;
  gapWords: Array<{
    word: string;
    language: 'en' | 'fr';
    expectedBy: number; // percentage of students
    actualBy: number; // percentage of students
    domain: string;
  }>;
  domainCoverage: Record<
    string,
    {
      averageWords: number;
      range: { min: number; max: number };
      distribution: number[]; // histogram
    }
  >;
}

class VocabularyAnalyticsService {
  /**
   * Generate vocabulary growth data for a student
   */
  @cached(15 * 60 * 1000) // 15 minute cache
  async generateStudentGrowthData(params: {
    studentId: number;
    term?: string;
    weekCount?: number;
    teacherId?: number;
  }): Promise<VocabularyGrowthData> {
    const { studentId, term, weekCount = 20, teacherId } = params;

    // Use mock student data for now
    const student = {
      id: studentId,
      firstName: `Student`,
      lastName: `${studentId}`,
    };

    // Get vocabulary entries (this would come from a vocabulary tracking system)
    const vocabularyEntries = await this.getStudentVocabulary(studentId, term, teacherId);

    // Calculate growth metrics
    const totalWords = vocabularyEntries.length;
    const termEntries = vocabularyEntries.filter((entry) =>
      this.isInTerm(entry.dateIntroduced, term),
    );
    const wordsThisTerm = termEntries.length;

    // Generate weekly growth data
    const weeklyGrowth = this.calculateWeeklyGrowth(vocabularyEntries, weekCount);

    // Analyze domain breakdown
    const domainBreakdown = this.analyzeDomainBreakdown(vocabularyEntries);

    // Calculate difficulty progression
    const difficultyProgression = this.analyzeDifficultyProgression(vocabularyEntries);

    // Calculate acquisition rate and projections
    const acquisitionRate = this.calculateAcquisitionRate(weeklyGrowth);
    const targetGrowth = this.calculateTargetGrowth(student.id, term);
    const projectedEndOfTerm = this.projectEndOfTermCount(acquisitionRate, weeklyGrowth);

    return {
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      totalWords,
      wordsThisTerm,
      weeklyGrowth,
      domainBreakdown,
      difficultyProgression,
      acquisitionRate,
      targetGrowth,
      projectedEndOfTerm,
    };
  }

  /**
   * Generate bilingual analytics for a student
   */
  @cached(20 * 60 * 1000) // 20 minute cache
  async generateBilingualAnalytics(params: {
    studentId: number;
    term?: string;
    teacherId?: number;
  }): Promise<BilingualAnalytics> {
    const { studentId, term, teacherId } = params;

    // Get student vocabulary
    const vocabularyEntries = await this.getStudentVocabulary(studentId, term, teacherId);

    // Get cognate pairs
    const cognateConnections = await this.getCognateConnections(vocabularyEntries);

    // Calculate language balance
    const languageBalance = this.calculateLanguageBalance(vocabularyEntries);

    // Identify transfer patterns
    const transferPatterns = this.identifyTransferPatterns(vocabularyEntries);

    // Generate cognate recommendations
    const recommendedCognates = await this.generateCognateRecommendations(
      studentId,
      vocabularyEntries,
    );

    return {
      studentId,
      cognateConnections,
      languageBalance,
      transferPatterns,
      recommendedCognates,
    };
  }

  /**
   * Generate class-wide vocabulary insights
   */
  @cached(25 * 60 * 1000) // 25 minute cache
  async generateClassInsights(params: {
    teacherId: number;
    term?: string;
    grade?: number;
  }): Promise<ClassVocabularyInsights> {
    const { teacherId, term, grade } = params;

    // Use mock student data
    const students = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      firstName: `Student`,
      lastName: `${i + 1}`,
    }));

    const classSize = students.length;

    // Get vocabulary data for all students (using mock data)
    const studentVocabularyData = await Promise.all(
      students.map(async (student) => ({
        student,
        vocabulary: await this.getStudentVocabulary(student.id, term, teacherId),
      })),
    );

    // Calculate class statistics
    const studentWordCounts = studentVocabularyData.map(({ vocabulary }) => vocabulary.length);
    const averageWordsPerStudent = Math.round(
      studentWordCounts.reduce((sum, count) => sum + count, 0) / Math.max(1, classSize),
    );

    // Identify top performers
    const topPerformers = studentVocabularyData
      .map(({ student, vocabulary }) => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        wordCount: vocabulary.length,
        acquisitionRate: this.calculateAcquisitionRate(this.calculateWeeklyGrowth(vocabulary, 12)),
      }))
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5);

    // Identify struggling students
    const strugglingStudents = studentVocabularyData
      .map(({ student, vocabulary }) => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        wordCount: vocabulary.length,
        recommendations: this.generateRecommendations(vocabulary, averageWordsPerStudent),
      }))
      .filter(({ wordCount }) => wordCount < averageWordsPerStudent * 0.7)
      .slice(0, 5);

    // Find common words
    const commonWords = this.findCommonWords(studentVocabularyData, 0.6); // Words known by 60%+ of class

    // Identify gap words
    const gapWords = this.identifyGapWords(studentVocabularyData);

    // Analyze domain coverage
    const domainCoverage = this.analyzeDomainCoverage(studentVocabularyData);

    return {
      classSize,
      averageWordsPerStudent,
      topPerformers,
      strugglingStudents,
      commonWords,
      gapWords,
      domainCoverage,
    };
  }

  /**
   * Get student vocabulary entries
   */
  private async getStudentVocabulary(
    studentId: number,
    term?: string,
    teacherId?: number,
  ): Promise<VocabularyEntry[]> {
    // Generate mock vocabulary data for demo purposes
    // In a real implementation, this would query actual vocabulary tracking data

    const vocabularyEntries: VocabularyEntry[] = [];
    const domains = ['reading', 'writing', 'oral', 'math', 'science'];

    // Generate 50-150 vocabulary words for the student
    const totalWords = 50 + Math.floor(Math.random() * 100);

    for (let i = 0; i < totalWords; i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const language = Math.random() > 0.5 ? 'en' : 'fr';
      const difficulty = this.assignDifficulty(new Date());

      // Generate dates over the past 20 weeks
      const weeksAgo = Math.floor(Math.random() * 20);
      const dateIntroduced = new Date();
      dateIntroduced.setDate(dateIntroduced.getDate() - weeksAgo * 7);

      vocabularyEntries.push({
        id: `student-${studentId}-vocab-${i}`,
        word: this.generateSampleWord(domain, language, difficulty),
        language,
        domain,
        difficulty,
        dateIntroduced,
        dateAcquired: Math.random() > 0.3 ? dateIntroduced : undefined,
        frequency: Math.floor(Math.random() * 10) + 1,
      });
    }

    return vocabularyEntries;
  }

  /**
   * Calculate weekly growth data
   */
  private calculateWeeklyGrowth(
    vocabularyEntries: VocabularyEntry[],
    weekCount: number,
  ): Array<{
    week: number;
    newWords: number;
    cumulativeWords: number;
    languages: { en: number; fr: number };
  }> {
    const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);
    let cumulativeWords = 0;

    return weeks.map((week) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekCount - week) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekWords = vocabularyEntries.filter(
        (entry) => entry.dateIntroduced >= weekStart && entry.dateIntroduced < weekEnd,
      );

      const newWords = weekWords.length;
      cumulativeWords += newWords;

      const languages = {
        en: weekWords.filter((w) => w.language === 'en').length,
        fr: weekWords.filter((w) => w.language === 'fr').length,
      };

      return {
        week,
        newWords,
        cumulativeWords,
        languages,
      };
    });
  }

  /**
   * Analyze domain breakdown
   */
  private analyzeDomainBreakdown(vocabularyEntries: VocabularyEntry[]): Record<
    string,
    {
      count: number;
      percentage: number;
      recentWords: string[];
    }
  > {
    const domainCounts: Record<string, VocabularyEntry[]> = {};

    vocabularyEntries.forEach((entry) => {
      if (!domainCounts[entry.domain]) {
        domainCounts[entry.domain] = [];
      }
      domainCounts[entry.domain].push(entry);
    });

    const totalWords = vocabularyEntries.length;
    const result: Record<string, any> = {};

    Object.entries(domainCounts).forEach(([domain, entries]) => {
      const recentWords = entries
        .sort((a, b) => b.dateIntroduced.getTime() - a.dateIntroduced.getTime())
        .slice(0, 5)
        .map((e) => e.word);

      result[domain] = {
        count: entries.length,
        percentage: Math.round((entries.length / totalWords) * 100),
        recentWords,
      };
    });

    return result;
  }

  /**
   * Analyze difficulty progression
   */
  private analyzeDifficultyProgression(vocabularyEntries: VocabularyEntry[]): {
    basic: number;
    intermediate: number;
    advanced: number;
  } {
    const counts = {
      basic: vocabularyEntries.filter((e) => e.difficulty === 'basic').length,
      intermediate: vocabularyEntries.filter((e) => e.difficulty === 'intermediate').length,
      advanced: vocabularyEntries.filter((e) => e.difficulty === 'advanced').length,
    };

    return counts;
  }

  /**
   * Calculate acquisition rate
   */
  private calculateAcquisitionRate(weeklyGrowth: Array<{ newWords: number }>): number {
    const recentWeeks = weeklyGrowth.slice(-4);
    const totalWords = recentWeeks.reduce((sum, week) => sum + week.newWords, 0);
    return Math.round((totalWords / Math.max(1, recentWeeks.length)) * 10) / 10;
  }

  /**
   * Calculate target growth for student
   */
  private calculateTargetGrowth(studentId: number, term?: string): number {
    // This would be based on curriculum expectations or individual goals
    return 30; // words per term
  }

  /**
   * Project end of term word count
   */
  private projectEndOfTermCount(
    acquisitionRate: number,
    weeklyGrowth: Array<{ cumulativeWords: number }>,
  ): number {
    const currentCount = weeklyGrowth[weeklyGrowth.length - 1]?.cumulativeWords || 0;
    const remainingWeeks = 10; // Approximate weeks left in term
    return Math.round(currentCount + acquisitionRate * remainingWeeks);
  }

  /**
   * Get cognate connections
   */
  private async getCognateConnections(vocabularyEntries: VocabularyEntry[]): Promise<
    Array<{
      enWord: string;
      frWord: string;
      domain: string;
      similarity: number;
      acquired: boolean;
    }>
  > {
    // This would use actual cognate pair data
    const enWords = vocabularyEntries.filter((e) => e.language === 'en');
    const frWords = vocabularyEntries.filter((e) => e.language === 'fr');

    const connections: Array<any> = [];

    // Sample cognate connections
    const sampleConnections = [
      { en: 'animal', fr: 'animal', similarity: 100 },
      { en: 'family', fr: 'famille', similarity: 85 },
      { en: 'important', fr: 'important', similarity: 100 },
      { en: 'nature', fr: 'nature', similarity: 100 },
      { en: 'different', fr: 'différent', similarity: 90 },
    ];

    sampleConnections.forEach((conn) => {
      const enEntry = enWords.find((w) => w.word.toLowerCase().includes(conn.en));
      const frEntry = frWords.find((w) => w.word.toLowerCase().includes(conn.fr));

      if (enEntry || frEntry) {
        connections.push({
          enWord: conn.en,
          frWord: conn.fr,
          domain: enEntry?.domain || frEntry?.domain || 'general',
          similarity: conn.similarity,
          acquired: !!(enEntry && frEntry),
        });
      }
    });

    return connections;
  }

  /**
   * Calculate language balance
   */
  private calculateLanguageBalance(vocabularyEntries: VocabularyEntry[]): {
    english: { count: number; percentage: number };
    french: { count: number; percentage: number };
  } {
    const enCount = vocabularyEntries.filter((e) => e.language === 'en').length;
    const frCount = vocabularyEntries.filter((e) => e.language === 'fr').length;
    const total = vocabularyEntries.length;

    return {
      english: {
        count: enCount,
        percentage: Math.round((enCount / total) * 100),
      },
      french: {
        count: frCount,
        percentage: Math.round((frCount / total) * 100),
      },
    };
  }

  /**
   * Identify transfer patterns
   */
  private identifyTransferPatterns(vocabularyEntries: VocabularyEntry[]): Array<{
    pattern: string;
    examples: Array<{ en: string; fr: string }>;
    strength: number;
  }> {
    // This would analyze actual linguistic patterns
    return [
      {
        pattern: '-tion → -tion',
        examples: [
          { en: 'creation', fr: 'création' },
          { en: 'nation', fr: 'nation' },
        ],
        strength: 95,
      },
      {
        pattern: '-ly → -ment',
        examples: [
          { en: 'quickly', fr: 'rapidement' },
          { en: 'slowly', fr: 'lentement' },
        ],
        strength: 80,
      },
    ];
  }

  /**
   * Generate cognate recommendations
   */
  private async generateCognateRecommendations(
    studentId: number,
    vocabularyEntries: VocabularyEntry[],
  ): Promise<
    Array<{
      enWord: string;
      frWord: string;
      domain: string;
      priority: number;
      rationale: string;
    }>
  > {
    // This would analyze gaps and suggest cognates
    return [
      {
        enWord: 'adventure',
        frWord: 'aventure',
        domain: 'reading',
        priority: 90,
        rationale: 'High cognate similarity, common in reading activities',
      },
      {
        enWord: 'telephone',
        frWord: 'téléphone',
        domain: 'communication',
        priority: 85,
        rationale: 'Perfect cognate, builds confidence',
      },
    ];
  }

  // Helper methods
  private isInTerm(date: Date, term?: string): boolean {
    if (!term) return true;
    const termStart = getTermStartDate(term);
    const termEnd = getTermEndDate(term);
    return date >= termStart && date <= termEnd;
  }

  private assignDifficulty(date: Date): 'basic' | 'intermediate' | 'advanced' {
    const random = Math.random();
    if (random < 0.5) return 'basic';
    if (random < 0.8) return 'intermediate';
    return 'advanced';
  }

  private generateSampleWord(domain: string, language: 'en' | 'fr', difficulty: string): string {
    const words = {
      en: {
        basic: ['cat', 'dog', 'house', 'tree', 'book'],
        intermediate: ['adventure', 'explore', 'discover', 'create', 'imagine'],
        advanced: [
          'magnificent',
          'extraordinary',
          'perseverance',
          'contemplation',
          'metamorphosis',
        ],
      },
      fr: {
        basic: ['chat', 'chien', 'maison', 'arbre', 'livre'],
        intermediate: ['aventure', 'explorer', 'découvrir', 'créer', 'imaginer'],
        advanced: ['magnifique', 'extraordinaire', 'persévérance', 'contemplation', 'métamorphose'],
      },
    };

    const wordList = words[language][difficulty as keyof typeof words.en];
    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  private generateRecommendations(vocabulary: VocabularyEntry[], classAverage: number): string[] {
    const recommendations: string[] = [];

    if (vocabulary.length < classAverage * 0.5) {
      recommendations.push('Focus on basic vocabulary building');
      recommendations.push('Increase reading exposure');
    }

    const frenchCount = vocabulary.filter((v) => v.language === 'fr').length;
    const englishCount = vocabulary.filter((v) => v.language === 'en').length;

    if (frenchCount < englishCount * 0.3) {
      recommendations.push('Increase French vocabulary focus');
    }

    return recommendations;
  }

  private findCommonWords(
    studentVocabularyData: Array<{ student: any; vocabulary: VocabularyEntry[] }>,
    threshold: number,
  ): Array<{ word: string; language: 'en' | 'fr'; studentCount: number; domain: string }> {
    const wordCounts: Record<string, { count: number; language: 'en' | 'fr'; domain: string }> = {};

    studentVocabularyData.forEach(({ vocabulary }) => {
      const uniqueWords = new Set(vocabulary.map((v) => v.word.toLowerCase()));
      uniqueWords.forEach((word) => {
        const entry = vocabulary.find((v) => v.word.toLowerCase() === word);
        if (entry) {
          if (!wordCounts[word]) {
            wordCounts[word] = { count: 0, language: entry.language, domain: entry.domain };
          }
          wordCounts[word].count++;
        }
      });
    });

    const minCount = Math.ceil(studentVocabularyData.length * threshold);

    return Object.entries(wordCounts)
      .filter(([, data]) => data.count >= minCount)
      .map(([word, data]) => ({
        word,
        language: data.language,
        studentCount: data.count,
        domain: data.domain,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 20);
  }

  private identifyGapWords(
    studentVocabularyData: Array<{ student: any; vocabulary: VocabularyEntry[] }>,
  ): Array<{
    word: string;
    language: 'en' | 'fr';
    expectedBy: number;
    actualBy: number;
    domain: string;
  }> {
    // This would identify words expected at grade level but missing from many students
    // Returning sample data for now
    return [
      {
        word: 'summarize',
        language: 'en',
        expectedBy: 80,
        actualBy: 45,
        domain: 'reading',
      },
      {
        word: 'résumer',
        language: 'fr',
        expectedBy: 75,
        actualBy: 30,
        domain: 'reading',
      },
    ];
  }

  private analyzeDomainCoverage(
    studentVocabularyData: Array<{ student: any; vocabulary: VocabularyEntry[] }>,
  ): Record<
    string,
    { averageWords: number; range: { min: number; max: number }; distribution: number[] }
  > {
    const domains = ['reading', 'writing', 'oral', 'math', 'science'];
    const coverage: Record<string, any> = {};

    domains.forEach((domain) => {
      const domainCounts = studentVocabularyData.map(
        ({ vocabulary }) => vocabulary.filter((v) => v.domain === domain).length,
      );

      coverage[domain] = {
        averageWords: Math.round(
          domainCounts.reduce((sum, count) => sum + count, 0) / domainCounts.length,
        ),
        range: {
          min: Math.min(...domainCounts),
          max: Math.max(...domainCounts),
        },
        distribution: this.createHistogram(domainCounts, 5),
      };
    });

    return coverage;
  }

  private createHistogram(values: number[], bins: number): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    const histogram = new Array(bins).fill(0);

    values.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    return histogram;
  }

  /**
   * Alias for generateClassInsights (for API compatibility)
   */
  async generateClassSummary(params: {
    teacherId: number;
    term?: string;
    grade?: number;
  }): Promise<ClassVocabularyInsights> {
    return this.generateClassInsights(params);
  }

  /**
   * Invalidate cache when vocabulary data changes
   */
  invalidateStudentCache(studentId: number): void {
    analyticsCache.invalidatePattern(`VocabularyAnalyticsService.*studentId:${studentId}`);
  }

  invalidateTeacherCache(teacherId: number): void {
    analyticsCache.invalidatePattern(`VocabularyAnalyticsService.*teacherId:${teacherId}`);
  }
}

export const vocabularyAnalyticsService = new VocabularyAnalyticsService();

// Helper functions (shared with other services)
function getTermStartDate(term: string): Date {
  const currentYear = new Date().getFullYear();
  switch (term) {
    case 'Term 1':
      return new Date(currentYear, 8, 1);
    case 'Term 2':
      return new Date(currentYear + 1, 0, 1);
    case 'Term 3':
      return new Date(currentYear + 1, 3, 1);
    default:
      return new Date(currentYear, 0, 1);
  }
}

function getTermEndDate(term: string): Date {
  const currentYear = new Date().getFullYear();
  switch (term) {
    case 'Term 1':
      return new Date(currentYear, 11, 31);
    case 'Term 2':
      return new Date(currentYear + 1, 2, 31);
    case 'Term 3':
      return new Date(currentYear + 1, 5, 30);
    default:
      return new Date(currentYear, 11, 31);
  }
}
