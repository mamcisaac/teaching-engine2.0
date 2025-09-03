/**
 * CSV Bulk Import Service
 * Allows teacher to import all 25 students at once from a CSV file
 * 
 * Expected CSV format:
 * firstName,lastName,studentId,grade,email,parentEmail,notes
 * John,Smith,JS001,1,john.smith@school.ca,parent.smith@email.ca,Allergies: peanuts
 */

import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@teaching-engine/database';
import { logger } from '../logger';

const prisma = new PrismaClient();

export interface StudentImportRow {
  firstName: string;
  lastName: string;
  studentId?: string;
  grade?: string;
  email?: string;
  parentEmail?: string;
  notes?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: any;
  }>;
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

/**
 * Import students from CSV buffer
 */
export const importStudentsFromCSV = async (
  csvBuffer: Buffer,
  userId: number,
  options: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
  } = {}
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
    students: []
  };

  try {
    // Parse CSV
    const records = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Clean up values
        if (value === '' || value === 'null' || value === 'NULL') {
          return null;
        }
        return value;
      }
    });

    logger.info(`Parsed ${records.length} student records from CSV`);

    // Validate and import each student
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // Account for header row

      try {
        // Validate required fields
        if (!row.firstName || !row.lastName) {
          result.errors.push({
            row: rowNumber,
            error: 'Missing required fields: firstName and lastName',
            data: row
          });
          result.failed++;
          continue;
        }

        // Clean and prepare data
        const studentData = {
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          studentNumber: row.studentId?.trim() || generateStudentId(row.firstName, row.lastName, i),
          grade: parseInt(row.grade?.trim() || '1'), // Convert to integer
          notes: row.notes?.trim() || null,
          isActive: true,
          // Store contact info in parentContact JSON field if provided
          ...(row.email || row.parentEmail ? {
            parentContact: {
              studentEmail: row.email?.trim() || null,
              parentEmail: row.parentEmail?.trim() || null
            }
          } : {})
        };

        // Check for duplicates
        let existing: any = null;
        if (!options.updateExisting) {
          existing = await prisma.student.findFirst({
            where: {
              userId,
              OR: [
                { studentNumber: studentData.studentNumber },
                {
                  AND: [
                    { firstName: studentData.firstName },
                    { lastName: studentData.lastName }
                  ]
                }
              ]
            }
          });

          if (existing) {
            if (options.skipDuplicates) {
              logger.info(`Skipping duplicate student: ${studentData.firstName} ${studentData.lastName}`);
              continue;
            } else {
              result.errors.push({
                row: rowNumber,
                error: 'Student already exists',
                data: row
              });
              result.failed++;
              continue;
            }
          }
        }

        // Import or update student
        let student;
        if (options.updateExisting && existing) {
          // Update existing student
          student = await prisma.student.update({
            where: { id: existing.id },
            data: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              studentNumber: studentData.studentNumber,
              grade: studentData.grade,
              notes: studentData.notes
            }
          });
        } else {
          // Create new student
          student = await prisma.student.create({
            data: {
              ...studentData,
              userId
            }
          });
        }

        result.imported++;
        result.students.push({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        });

        logger.info(`Imported student: ${student.firstName} ${student.lastName} (${student.studentNumber || 'no number'})`);

      } catch (error: unknown) {
        logger.error(`Failed to import row ${rowNumber}:`, error instanceof Error ? error.message : String(error));
        result.errors.push({
          row: rowNumber,
          error: (error as Error).message,
          data: row
        });
        result.failed++;
      }
    }

    result.success = result.failed === 0;

    logger.info(`CSV import completed: ${result.imported} imported, ${result.failed} failed`);

  } catch (error: unknown) {
    logger.error('CSV parsing failed:', error instanceof Error ? error.message : String(error));
    result.success = false;
    result.errors.push({
      row: 0,
      error: `CSV parsing failed: ${(error as Error).message}`,
      data: null
    });
  }

  return result;
};

/**
 * Generate a student ID from name and index
 */
function generateStudentId(firstName: string, lastName: string, index: number): string {
  const initials = (firstName[0] + lastName[0]).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${initials}${timestamp}${index.toString().padStart(2, '0')}`;
}

/**
 * Validate CSV format before import
 */
export const validateCSVFormat = (csvBuffer: Buffer): {
  valid: boolean;
  errors: string[];
  rowCount: number;
} => {
  const errors: string[] = [];
  let rowCount = 0;

  try {
    const records = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      to: 1 // Just check the header
    });

    if (records.length === 0) {
      errors.push('CSV file is empty');
      return { valid: false, errors, rowCount: 0 };
    }

    // Check for required columns
    const headers = Object.keys(records[0]);
    const requiredColumns = ['firstName', 'lastName'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Count total rows
    const allRecords = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true
    });
    rowCount = allRecords.length;

    // Check for reasonable class size
    if (rowCount > 35) {
      errors.push(`CSV contains ${rowCount} students. Maximum recommended is 35 for a single class.`);
    }

  } catch (error: unknown) {
    errors.push(`Invalid CSV format: ${(error as Error).message}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    rowCount
  };
};

/**
 * Generate sample CSV template
 */
export const generateCSVTemplate = (): string => {
  const template = `firstName,lastName,studentId,grade,email,parentEmail,notes
Emma,Johnson,EJ001,1,emma.j@school.ca,johnson.family@email.ca,Speaks French at home
Liam,Smith,LS002,1,liam.s@school.ca,smith.parents@email.ca,
Olivia,Brown,OB003,1,olivia.b@school.ca,brown.family@email.ca,Has reading support
Noah,Davis,ND004,1,noah.d@school.ca,davis.parents@email.ca,
Ava,Wilson,AW005,1,ava.w@school.ca,wilson.family@email.ca,Gifted program candidate`;

  return template;
};

/**
 * Export students to CSV
 */
export const exportStudentsToCSV = async (userId: number): Promise<string> => {
  const students = await prisma.student.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: [
      { grade: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' }
    ]
  });

  const csvRows = [
    'firstName,lastName,studentId,grade,email,parentEmail,notes'
  ];

  for (const student of students) {
    const row = [
      student.firstName,
      student.lastName,
      student.studentNumber || '',
      student.grade.toString(),
      (student.parentContact as any)?.studentEmail || '',
      (student.parentContact as any)?.parentEmail || '',
      student.notes || ''
    ].map(field => {
      // Escape fields containing commas or quotes
      if (field.includes(',') || field.includes('"')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });

    csvRows.push(row.join(','));
  }

  return csvRows.join('\n');
};