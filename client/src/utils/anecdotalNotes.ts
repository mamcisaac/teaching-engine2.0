/**
 * Anecdotal Notes Utility Functions
 * Issue #318: Quick observations about individual students
 * 
 * Following TDD steps 1-7:
 * - Basic note concepts (step 1-2)
 * - Student association (step 2)
 * - Timestamps and context (step 3-4)
 * - History and search (step 7)
 */

export interface AnecdotalNote {
  id?: string;
  studentId: string;
  text: string;
  timestamp: Date;
  lessonId?: string;
  subject?: string;
  lessonContext?: string;
}

export interface NoteContext {
  lessonId?: string;
  lessonTitle?: string;
  subject?: string;
  date?: Date;
}

/**
 * Creates a new anecdotal note (TDD Steps 1-2)
 */
export function createNote(studentId: string, text: string, context?: NoteContext): AnecdotalNote {
  return {
    studentId,
    text,
    timestamp: context?.date || new Date(),
    lessonId: context?.lessonId,
    subject: context?.subject,
    lessonContext: context?.lessonTitle,
  };
}

/**
 * Student note history manager (TDD Step 7)
 */
export class StudentNoteHistory {
  private notes: AnecdotalNote[] = [];

  addNote(studentId: string, text: string, timestamp?: Date, context?: NoteContext): void {
    const note = createNote(studentId, text, {
      ...context,
      date: timestamp || new Date(),
    });
    this.notes.push(note);
  }

  getStudentNotes(studentId: string): AnecdotalNote[] {
    return this.notes
      .filter(n => n.studentId === studentId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getNotesInRange(studentId: string, startDate: Date, endDate: Date): AnecdotalNote[] {
    return this.notes
      .filter(n => 
        n.studentId === studentId &&
        n.timestamp >= startDate &&
        n.timestamp <= endDate
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  searchNotes(studentId: string, keyword: string): AnecdotalNote[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.notes.filter(n => 
      n.studentId === studentId &&
      n.text.toLowerCase().includes(lowerKeyword)
    );
  }

  getAllNotes(): AnecdotalNote[] {
    return [...this.notes].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clear(): void {
    this.notes = [];
  }
}

/**
 * Auto-context generation for notes (TDD Steps 3-4)
 */
export function generateNoteContext(lessonId?: string, lessonTitle?: string, subject?: string): NoteContext {
  const now = new Date();
  return {
    lessonId,
    lessonTitle,
    subject,
    date: now,
  };
}

/**
 * Format note with context for display
 */
export function formatNoteWithContext(note: AnecdotalNote): string {
  const timeStr = note.timestamp.toLocaleString();
  const contextParts = [];
  
  if (note.lessonContext) {
    contextParts.push(note.lessonContext);
  }
  if (note.subject) {
    contextParts.push(note.subject);
  }
  
  const contextStr = contextParts.length > 0 ? ` (${contextParts.join(' - ')})` : '';
  
  return `[${timeStr}${contextStr}] ${note.text}`;
}

/**
 * Validates note text
 */
export function validateNoteText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Note text cannot be empty' };
  }
  
  if (text.length > 1000) {
    return { valid: false, error: 'Note text cannot exceed 1000 characters' };
  }
  
  // Security: Check for potential XSS patterns
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /javascript:/i,
    /on\w+\s*=/i, // onload=, onclick=, etc.
    /<link/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return { valid: false, error: 'Note contains potentially dangerous content' };
    }
  }
  
  // Professional content check - flag inappropriate content for student records
  const inappropriatePatterns = [
    /\b(hate|stupid|dumb|idiot)\b/i,
    /\b(can't|cannot)\s+(learn|understand|do)\b/i,
    /\b(never|always)\s+(fails|wrong|bad)\b/i
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      return { valid: false, error: 'Note should use professional, growth-oriented language' };
    }
  }
  
  return { valid: true };
}

/**
 * Check if an assessment is actually an anecdotal note
 * Used to separate anecdotal notes from real curriculum assessments
 */
export function isAnecdotalNote(assessment: { subject: string; notes?: string }): boolean {
  return assessment.subject.startsWith('ANECDOTAL_') && !!assessment.notes;
}

/**
 * Extract clean subject from anecdotal note subject field
 * Converts "ANECDOTAL_12345_Math" to "Math"
 */
export function extractSubjectFromAnecdotal(subject: string): string {
  if (!subject.startsWith('ANECDOTAL_')) return subject;
  
  const parts = subject.split('_');
  // Format: ANECDOTAL_timestamp_subject
  // Return everything after the timestamp
  return parts.slice(2).join('_') || 'General';
}

/**
 * Default note history instance for the app
 */
export const noteHistory = new StudentNoteHistory();