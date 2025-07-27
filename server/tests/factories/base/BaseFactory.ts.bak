/**
 * BaseFactory - Foundation for all test factories
 * 
 * Provides common functionality for creating test data with faker.js
 * Includes support for:
 * - Batch creation
 * - Relationship building
 * - Localization (English/French)
 * - Performance testing
 */

import { faker } from '@faker-js/faker';
import { fakerFR_CA } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

export interface FactoryOptions {
  locale?: 'en' | 'fr';
  seed?: number;
  persist?: boolean; // Whether to save to database
}

export abstract class BaseFactory<T> {
  protected faker = faker;
  protected fakerFr = fakerFR_CA;
  protected prisma?: PrismaClient;
  protected locale: 'en' | 'fr' = 'en';

  constructor(options?: FactoryOptions) {
    if (options?.locale) {
      this.locale = options.locale;
    }
    if (options?.seed) {
      this.faker.seed(options.seed);
      this.fakerFr.seed(options.seed);
    }
  }

  /**
   * Get faker instance for current locale
   */
  protected get currentFaker() {
    return this.locale === 'fr' ? this.fakerFr : this.faker;
  }

  /**
   * Abstract method to create a single instance
   */
  abstract create(overrides?: Partial<T>): T | Promise<T>;

  /**
   * Create multiple instances
   */
  async createMany(count: number, overrides?: Partial<T>): Promise<T[]> {
    const items: T[] = [];
    for (let i = 0; i < count; i++) {
      const item = await this.create(overrides);
      items.push(item);
    }
    return items;
  }

  /**
   * Create with specific attributes
   */
  async createWithAttributes(attributes: Partial<T>): Promise<T> {
    return this.create(attributes);
  }

  /**
   * Generate realistic Canadian data
   */
  protected canadianData() {
    const provinces = [
      { code: 'ON', name: 'Ontario', nameFr: 'Ontario' },
      { code: 'QC', name: 'Quebec', nameFr: 'Québec' },
      { code: 'BC', name: 'British Columbia', nameFr: 'Colombie-Britannique' },
      { code: 'AB', name: 'Alberta', nameFr: 'Alberta' },
      { code: 'MB', name: 'Manitoba', nameFr: 'Manitoba' },
      { code: 'SK', name: 'Saskatchewan', nameFr: 'Saskatchewan' },
      { code: 'NS', name: 'Nova Scotia', nameFr: 'Nouvelle-Écosse' },
      { code: 'NB', name: 'New Brunswick', nameFr: 'Nouveau-Brunswick' },
      { code: 'NL', name: 'Newfoundland and Labrador', nameFr: 'Terre-Neuve-et-Labrador' },
      { code: 'PE', name: 'Prince Edward Island', nameFr: 'Île-du-Prince-Édouard' },
    ];

    const province = this.faker.helpers.arrayElement(provinces);
    
    return {
      province: this.locale === 'fr' ? province.nameFr : province.name,
      provinceCode: province.code,
      city: this.currentFaker.location.city(),
      postalCode: this.faker.helpers.replaceSymbols('?#? #?#').toUpperCase(),
      phoneNumber: this.faker.helpers.replaceSymbols('(###) ###-####'),
    };
  }

  /**
   * Generate bilingual content
   */
  protected bilingualContent(
    enGenerator: () => string,
    frGenerator?: () => string
  ): { en: string; fr: string } {
    return {
      en: enGenerator(),
      fr: frGenerator ? frGenerator() : this.fakerFr.lorem.sentence(),
    };
  }

  /**
   * Generate Ontario curriculum codes
   */
  protected generateCurriculumCode(grade: number, subject: string): string {
    const subjectCodes: Record<string, string[]> = {
      Mathematics: ['N', 'M', 'G', 'P', 'D'], // Number, Measurement, Geometry, Patterning, Data
      Language: ['OE', 'R', 'W', 'MS'], // Oral/Visual, Reading, Writing, Media Studies
      Science: ['LS', 'MS', 'ES', 'SS'], // Life, Matter, Earth, Structures
      'Social Studies': ['H', 'G', 'C'], // Heritage, Geography, Citizenship
      'The Arts': ['D', 'DR', 'M', 'VA'], // Dance, Drama, Music, Visual Arts
      'Health and Physical Education': ['AS', 'MS', 'LS'], // Active, Movement, Living Skills
      French: ['PC', 'PI', 'PE', 'PO'], // Comprehension, Interaction, Expression, Oral
    };

    const codes = subjectCodes[subject] || ['A', 'B', 'C'];
    const strand = this.faker.helpers.arrayElement(codes);
    const specificExpectation = this.faker.number.int({ min: 1, max: 5 });
    
    return `${grade}.${strand}.${specificExpectation}`;
  }

  /**
   * Generate realistic teacher names (Canadian context)
   */
  protected generateTeacherName(): { first: string; last: string; full: string; title: string } {
    const faker = this.currentFaker;
    const gender = faker.person.sexType();
    const first = faker.person.firstName(gender);
    const last = faker.person.lastName();
    const title = gender === 'female' ? 
      (this.locale === 'fr' ? 'Mme' : 'Ms.') : 
      (this.locale === 'fr' ? 'M.' : 'Mr.');
    
    return {
      first,
      last,
      full: `${first} ${last}`,
      title: `${title} ${last}`,
    };
  }

  /**
   * Generate school year data
   */
  protected generateSchoolYear(date?: Date): {
    year: string;
    term: number;
    semester: number;
    quarter: number;
  } {
    const d = date || new Date();
    const month = d.getMonth();
    const year = d.getFullYear();
    
    // School year runs September to June
    const schoolYear = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    
    // Terms: Sept-Nov (1), Dec-Feb (2), Mar-June (3)
    let term = 1;
    if (month >= 11 || month <= 1) term = 2;
    else if (month >= 2 && month <= 5) term = 3;
    
    // Semesters: Sept-Jan (1), Feb-June (2)
    const semester = month >= 8 || month <= 0 ? 1 : 2;
    
    // Quarters
    let quarter = 1;
    if (month >= 10 || month === 0) quarter = 2;
    else if (month >= 1 && month <= 3) quarter = 3;
    else if (month >= 4 && month <= 5) quarter = 4;
    
    return { year: schoolYear, term, semester, quarter };
  }

  /**
   * Ontario grade levels
   */
  protected generateGradeLevel(): {
    grade: number;
    division: 'primary' | 'junior' | 'intermediate';
    divisionFr: 'primaire' | 'moyen' | 'intermédiaire';
  } {
    const grade = this.faker.number.int({ min: 1, max: 8 });
    let division: 'primary' | 'junior' | 'intermediate';
    let divisionFr: 'primaire' | 'moyen' | 'intermédiaire';
    
    if (grade <= 3) {
      division = 'primary';
      divisionFr = 'primaire';
    } else if (grade <= 6) {
      division = 'junior';
      divisionFr = 'moyen';
    } else {
      division = 'intermediate';
      divisionFr = 'intermédiaire';
    }
    
    return { grade, division, divisionFr };
  }

  /**
   * Generate date within school year
   */
  protected generateSchoolDate(options?: {
    excludeWeekends?: boolean;
    excludeHolidays?: boolean;
    minDate?: Date;
    maxDate?: Date;
  }): Date {
    const currentYear = new Date().getFullYear();
    const defaultMin = new Date(currentYear, 8, 1); // Sept 1
    const defaultMax = new Date(currentYear + 1, 5, 30); // June 30
    
    let date = this.faker.date.between({
      from: options?.minDate ?? defaultMin,
      to: options?.maxDate ?? defaultMax,
    });
    
    // Exclude weekends if requested
    if (options?.excludeWeekends) {
      while (date.getDay() === 0 || date.getDay() === 6) {
        date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    
    // Simple holiday exclusion (can be expanded)
    if (options?.excludeHolidays) {
      const holidays = [
        { month: 11, day: 25 }, // Christmas
        { month: 11, day: 26 }, // Boxing Day
        { month: 0, day: 1 },   // New Year
      ];
      
      const isHoliday = holidays.some(h => 
        date.getMonth() === h.month && date.getDate() === h.day
      );
      
      if (isHoliday) {
        return this.generateSchoolDate(options); // Recursive call
      }
    }
    
    return date;
  }

  /**
   * Set database connection for persistence
   */
  setPrisma(prisma: PrismaClient): void {
    this.prisma = prisma;
  }

  /**
   * Clear created test data (should be implemented by subclasses)
   */
  abstract cleanup?(): Promise<void>;
}