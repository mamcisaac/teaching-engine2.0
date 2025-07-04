/**
 * UserFactory - Creates realistic teacher user data
 */

import { User, Prisma } from '@prisma/client';
import { BaseFactory, FactoryOptions } from '../base/BaseFactory';
import bcrypt from 'bcryptjs';

export class UserFactory extends BaseFactory<User> {
  private createdUsers: string[] = [];

  constructor(options?: FactoryOptions) {
    super(options);
  }

  /**
   * Create a realistic teacher user
   */
  async create(overrides?: Partial<User>): Promise<User> {
    const teacherName = this.generateTeacherName();
    const canadianData = this.canadianData();
    
    const email = overrides?.email || 
      this.faker.internet.email({
        firstName: teacherName.first.toLowerCase(),
        lastName: teacherName.last.toLowerCase(),
        provider: this.faker.helpers.arrayElement([
          'school.ca',
          'board.ca',
          'ontario.ca',
          'education.ca',
        ])
      });

    const user: User = {
      id: this.faker.number.int({ min: 1, max: 999999 }),
      email,
      password: await bcrypt.hash(overrides?.password || 'Test123!@#', 10),
      name: overrides?.name || teacherName.full,
      role: overrides?.role || 'teacher',
      preferredLanguage: overrides?.preferredLanguage || this.locale,
      ...overrides,
    } as User;

    // If persistence is enabled
    if (this.prisma && this.options?.persist !== false) {
      const created = await this.prisma.user.create({ data: user });
      this.createdUsers.push(created.id.toString());
      return created;
    }

    return user;
  }

  /**
   * Create a teacher with specific teaching preferences
   */
  async createWithPreferences(preferences: {
    grades?: number[];
    subjects?: string[];
    language?: 'en' | 'fr' | 'bilingual';
    experience?: 'new' | 'experienced' | 'veteran';
  }): Promise<User & { metadata: any }> {
    const yearsExperience = {
      new: this.faker.number.int({ min: 0, max: 3 }),
      experienced: this.faker.number.int({ min: 4, max: 15 }),
      veteran: this.faker.number.int({ min: 16, max: 35 }),
    }[preferences.experience || 'experienced'];

    const user = await this.create({
      preferredLanguage: preferences.language === 'bilingual' ? 'en' : 
        (preferences.language || this.locale),
    });

    const metadata = {
      yearsExperience,
      certifications: this.generateTeacherCertifications(preferences),
      specializations: preferences.subjects || this.generateSubjects(),
      gradesTaught: preferences.grades || [this.generateGradeLevel().grade],
      bilingualCapable: preferences.language === 'bilingual',
    };

    return { ...user, metadata };
  }

  /**
   * Create an admin user
   */
  async createAdmin(overrides?: Partial<User>): Promise<User> {
    return this.create({
      ...overrides,
      role: 'admin',
      email: overrides?.email || `admin.${Date.now()}@school.ca`,
    });
  }

  /**
   * Create a principal user
   */
  async createPrincipal(overrides?: Partial<User>): Promise<User> {
    const teacherName = this.generateTeacherName();
    return this.create({
      ...overrides,
      role: 'principal',
      name: overrides?.name || `Principal ${teacherName.last}`,
      email: overrides?.email || `principal.${teacherName.last.toLowerCase()}@school.ca`,
    });
  }

  /**
   * Create a supply teacher
   */
  async createSupplyTeacher(overrides?: Partial<User>): Promise<User> {
    return this.create({
      ...overrides,
      role: 'supply',
      email: overrides?.email || 
        `supply.${this.faker.string.alphanumeric(6)}@board.ca`,
    });
  }

  /**
   * Generate teacher certifications
   */
  private generateTeacherCertifications(preferences: any): string[] {
    const basicCerts = ['Ontario Teaching Certificate'];
    
    const additionalCerts = [
      'Primary/Junior',
      'Junior/Intermediate',
      'Intermediate/Senior',
      'Special Education Part 1',
      'Special Education Part 2',
      'ESL Part 1',
      'French as a Second Language',
      'Reading Specialist',
      'Mathematics Specialist',
      'Guidance and Career Education',
      'Computer Studies',
      'Cooperative Education',
    ];

    const numAdditional = this.faker.number.int({ min: 1, max: 4 });
    const selected = this.faker.helpers.arrayElements(additionalCerts, numAdditional);

    return [...basicCerts, ...selected];
  }

  /**
   * Generate realistic subject combinations
   */
  private generateSubjects(): string[] {
    const primarySubjects = [
      'Language Arts',
      'Mathematics',
      'Science',
      'Social Studies',
      'The Arts',
      'Physical Education',
      'French as a Second Language',
    ];

    const specialtySubjects = [
      'Music',
      'Visual Arts',
      'Drama',
      'Dance',
      'Health Education',
      'Computer Studies',
    ];

    // Most teachers teach core subjects
    const numCore = this.faker.number.int({ min: 3, max: 5 });
    const core = this.faker.helpers.arrayElements(primarySubjects, numCore);

    // Some have specialties
    if (this.faker.datatype.boolean({ probability: 0.3 })) {
      const numSpecialty = this.faker.number.int({ min: 1, max: 2 });
      const specialty = this.faker.helpers.arrayElements(specialtySubjects, numSpecialty);
      return [...core, ...specialty];
    }

    return core;
  }

  /**
   * Create a school staff scenario
   */
  async createSchoolStaff(options?: {
    schoolName?: string;
    size?: 'small' | 'medium' | 'large';
  }): Promise<{
    principal: User;
    viceprincipals: User[];
    teachers: User[];
    supplyTeachers: User[];
    school: any;
  }> {
    const sizes = {
      small: { teachers: 15, vp: 0, supply: 2 },
      medium: { teachers: 30, vp: 1, supply: 4 },
      large: { teachers: 50, vp: 2, supply: 8 },
    };

    const config = sizes[options?.size || 'medium'];
    const schoolName = options?.schoolName || 
      `${this.faker.person.lastName()} ${this.faker.helpers.arrayElement(['Elementary', 'Public', 'Catholic'])} School`;

    const principal = await this.createPrincipal({ name: `Principal of ${schoolName}` });
    
    const viceprincipals = await this.createMany(config.vp, { 
      role: 'viceprinciple',
      name: `Vice Principal`,
    });

    const teachers = await this.createMany(config.teachers);
    const supplyTeachers = await this.createMany(config.supply, { role: 'supply' });

    const school = {
      name: schoolName,
      board: this.faker.helpers.arrayElement([
        'Toronto District School Board',
        'Ottawa-Carleton District School Board',
        'Peel District School Board',
        'York Region District School Board',
      ]),
      ...this.canadianData(),
    };

    return { principal, viceprincipals, teachers, supplyTeachers, school };
  }

  /**
   * Cleanup created users
   */
  async cleanup(): Promise<void> {
    if (this.prisma && this.createdUsers.length > 0) {
      await this.prisma.user.deleteMany({
        where: { id: { in: this.createdUsers.map(id => parseInt(id)) } }
      });
      this.createdUsers = [];
    }
  }
}