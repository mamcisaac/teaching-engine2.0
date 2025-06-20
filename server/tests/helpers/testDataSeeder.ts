/**
 * Test Data Seeder for Messenger Agent Tests
 * 
 * Creates consistent, realistic test data for all messenger agent features
 */

import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';

import { User, Student, ParentContact, EmailTemplate, Subject } from '@teaching-engine/database';

export interface TestDataSeed {
  users: User[];
  students: Student[];
  parentContacts: ParentContact[];
  emailTemplates: EmailTemplate[];
  assessmentResults: unknown[];
  subjects: Subject[];
}

export class TestDataSeeder {
  constructor(private prisma: PrismaClient) {}

  async seedAll(): Promise<TestDataSeed> {
    // Clean existing data but keep users
    await this.cleanupTestData();

    // Always ensure users exist (create if missing)
    let users = await this.prisma.user.findMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com']
        }
      }
    });
    
    if (users.length === 0) {
      users = await this.createTestUsers();
    }
    
    // Create subjects (needed for assessments)
    const subjects = await this.createTestSubjects(users[0].id);
    
    // Create students
    const students = await this.createTestStudents(users[0].id);
    
    // Create parent contacts
    const parentContacts = await this.createTestParentContacts(students);
    
    // Create email templates
    const emailTemplates = await this.createTestEmailTemplates(users[0].id);
    
    // Create assessment data for report generation
    const assessmentResults = await this.createTestAssessmentData(students, subjects);

    return {
      users,
      students,
      parentContacts,
      emailTemplates,
      assessmentResults,
      subjects
    };
  }

  async cleanupTestData(): Promise<void> {
    // Delete in correct order to respect foreign key constraints
    // NOTE: We keep users around to avoid foreign key issues in tests
    await this.prisma.emailTemplate.deleteMany({
      where: { 
        user: { 
          email: { 
            in: ['test@example.com', 'test2@example.com', 'teacher@test.com'] 
          } 
        } 
      }
    });
    
    await this.prisma.parentContact.deleteMany({
      where: {
        student: {
          user: {
            email: {
              in: ['test@example.com', 'test2@example.com', 'teacher@test.com']
            }
          }
        }
      }
    });
    
    await this.prisma.student.deleteMany({
      where: {
        user: {
          email: {
            in: ['test@example.com', 'test2@example.com', 'teacher@test.com']
          }
        }
      }
    });
    
    await this.prisma.subject.deleteMany({
      where: {
        user: {
          email: {
            in: ['test@example.com', 'test2@example.com', 'teacher@test.com']
          }
        }
      }
    });
    
    // Don't delete users - let Jest global teardown handle this
    // This prevents foreign key constraint issues when tests run together
  }
  
  async forceCleanupUsers(): Promise<void> {
    // This method can be called explicitly when we really want to clean up users
    await this.prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'test2@example.com', 'teacher@test.com']
        }
      }
    });
  }

  private async createTestUsers() {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    
    const users = [];
    
    // Primary test user
    const user1 = await this.prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test Teacher',
        password: hashedPassword,
        role: 'teacher',
        preferredLanguage: 'en'
      }
    });
    users.push(user1);

    // Secondary test user for isolation testing
    const user2 = await this.prisma.user.create({
      data: {
        email: 'test2@example.com',
        name: 'Test Teacher 2',
        password: hashedPassword,
        role: 'teacher',
        preferredLanguage: 'fr'
      }
    });
    users.push(user2);

    return users;
  }

  private async createTestSubjects(userId: number) {
    const subjects = [];

    const mathSubject = await this.prisma.subject.create({
      data: {
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
        userId
      }
    });
    subjects.push(mathSubject);

    const englishSubject = await this.prisma.subject.create({
      data: {
        name: 'English Language Arts',
        nameEn: 'English Language Arts',
        nameFr: 'Arts du langage anglais',
        userId
      }
    });
    subjects.push(englishSubject);

    const frenchSubject = await this.prisma.subject.create({
      data: {
        name: 'French',
        nameEn: 'French',
        nameFr: 'Français',
        userId
      }
    });
    subjects.push(frenchSubject);

    return subjects;
  }

  private async createTestStudents(userId: number) {
    const students = [];

    // Student 1: High performer
    const student1 = await this.prisma.student.create({
      data: {
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: 5,
        userId
      }
    });
    students.push(student1);

    // Student 2: Average performer
    const student2 = await this.prisma.student.create({
      data: {
        firstName: 'Liam',
        lastName: 'Chen',
        grade: 5,
        userId
      }
    });
    students.push(student2);

    // Student 3: Needs support
    const student3 = await this.prisma.student.create({
      data: {
        firstName: 'Sophia',
        lastName: 'Williams',
        grade: 4,
        userId
      }
    });
    students.push(student3);

    // Student 4: French immersion
    const student4 = await this.prisma.student.create({
      data: {
        firstName: 'Gabriel',
        lastName: 'Dubois',
        grade: 5,
        userId
      }
    });
    students.push(student4);

    return students;
  }

  private async createTestParentContacts(students: Student[]) {
    const contacts = [];

    // Emma's parents
    const emmaParent1 = await this.prisma.parentContact.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        studentId: students[0].id
      }
    });
    contacts.push(emmaParent1);

    const emmaParent2 = await this.prisma.parentContact.create({
      data: {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        studentId: students[0].id
      }
    });
    contacts.push(emmaParent2);

    // Liam's parents
    const liamParent = await this.prisma.parentContact.create({
      data: {
        name: 'Li Chen',
        email: 'li.chen@email.com',
        studentId: students[1].id
      }
    });
    contacts.push(liamParent);

    // Sophia's guardian
    const sophiaGuardian = await this.prisma.parentContact.create({
      data: {
        name: 'Maria Williams',
        email: 'maria.williams@email.com',
        studentId: students[2].id
      }
    });
    contacts.push(sophiaGuardian);

    // Gabriel's parents (French immersion)
    const gabrielParent = await this.prisma.parentContact.create({
      data: {
        name: 'Claire Dubois',
        email: 'claire.dubois@email.com',
        studentId: students[3].id
      }
    });
    contacts.push(gabrielParent);

    return contacts;
  }

  private async createTestEmailTemplates(userId: number) {
    const templates = [];

    // Weekly newsletter template
    const weeklyTemplate = await this.prisma.emailTemplate.create({
      data: {
        name: 'Weekly Newsletter',
        subject: 'Weekly Update - {studentName}',
        contentFr: `Bonjour {parentName},

Voici le résumé de la semaine pour {studentName} :

**Cette semaine, nous avons travaillé sur :**
- {weeklyTopics}

**Réalisations de {studentName} :**
- {achievements}

**Prochaine semaine :**
- {nextWeekPreview}

Cordialement,
{teacherName}`,
        contentEn: `Hello {parentName},

Here's this week's summary for {studentName}:

**This week we worked on:**
- {weeklyTopics}

**{studentName}'s achievements:**
- {achievements}

**Next week:**
- {nextWeekPreview}

Best regards,
{teacherName}`,
        variables: JSON.stringify(['parentName', 'studentName', 'weeklyTopics', 'achievements', 'nextWeekPreview', 'teacherName']),
        userId
      }
    });
    templates.push(weeklyTemplate);

    // Progress report template
    const progressTemplate = await this.prisma.emailTemplate.create({
      data: {
        name: 'Progress Report',
        subject: 'Progress Report - {studentName}',
        contentFr: `Bonjour {parentName},

Je vous envoie le rapport de progrès de {studentName} pour la période du {startDate} au {endDate}.

**Points forts :**
{strengths}

**Domaines à améliorer :**
{improvements}

**Prochaines étapes :**
{nextSteps}

N'hésitez pas à me contacter pour discuter.

Cordialement,
{teacherName}`,
        contentEn: `Hello {parentName},

I'm sending you {studentName}'s progress report for the period from {startDate} to {endDate}.

**Strengths:**
{strengths}

**Areas for improvement:**
{improvements}

**Next steps:**
{nextSteps}

Please feel free to contact me to discuss.

Best regards,
{teacherName}`,
        variables: JSON.stringify(['parentName', 'studentName', 'startDate', 'endDate', 'strengths', 'improvements', 'nextSteps', 'teacherName']),
        userId
      }
    });
    templates.push(progressTemplate);

    // Event notification template
    const eventTemplate = await this.prisma.emailTemplate.create({
      data: {
        name: 'Event Notification',
        subject: 'Upcoming Event - {eventName}',
        contentFr: `Bonjour {parentName},

J'espère que vous allez bien. Je vous écris pour vous informer d'un événement à venir :

**Événement :** {eventName}
**Date :** {eventDate}
**Heure :** {eventTime}
**Lieu :** {eventLocation}

**Description :**
{eventDescription}

Veuillez confirmer la participation de {studentName} avant le {rsvpDate}.

Cordialement,
{teacherName}`,
        contentEn: `Hello {parentName},

I hope you're doing well. I'm writing to inform you about an upcoming event:

**Event:** {eventName}
**Date:** {eventDate}
**Time:** {eventTime}
**Location:** {eventLocation}

**Description:**
{eventDescription}

Please confirm {studentName}'s attendance by {rsvpDate}.

Best regards,
{teacherName}`,
        variables: JSON.stringify(['parentName', 'studentName', 'eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'rsvpDate', 'teacherName']),
        userId
      }
    });
    templates.push(eventTemplate);

    return templates;
  }

  private async createTestAssessmentData(_students?: Student[], _subjects?: Subject[]) {
    // For now, return empty array since we don't have assessment tables in schema
    // This would be implemented when assessment models are added
    // Parameters are optional for future implementation
    return [];
  }

  /**
   * Create realistic test scenarios for specific test cases
   */
  async createBulkEmailTestData(userId: number) {
    const students = await this.prisma.student.findMany({
      where: { userId },
      include: { parentContacts: true }
    });

    const recipients = students.flatMap(student => 
      student.parentContacts.map(contact => ({
        email: contact.email,
        name: contact.name,
        studentName: `${student.firstName} ${student.lastName}`,
        studentId: student.id
      }))
    );

    return recipients;
  }

  /**
   * Create test data for report generation
   */
  async createReportTestData(studentId: number) {
    // Mock data for report generation testing
    return {
      studentId,
      assessments: [
        { subject: 'Mathematics', score: 85, date: new Date('2024-01-15') },
        { subject: 'English', score: 92, date: new Date('2024-01-20') },
        { subject: 'French', score: 78, date: new Date('2024-01-25') }
      ],
      goals: [
        { text: 'Improve math problem-solving skills', status: 'active' },
        { text: 'Read 2 books per month', status: 'completed' }
      ],
      artifacts: [
        { title: 'Creative Writing Sample', description: 'Excellent storytelling', date: new Date('2024-01-10') }
      ]
    };
  }
}

/**
 * Global test data seeder instance
 */
export async function seedTestData(prisma: PrismaClient): Promise<TestDataSeed> {
  const seeder = new TestDataSeeder(prisma);
  return await seeder.seedAll();
}

/**
 * Cleanup all test data
 */
export async function cleanupTestData(prisma: PrismaClient): Promise<void> {
  const seeder = new TestDataSeeder(prisma);
  await seeder.cleanupTestData();
}