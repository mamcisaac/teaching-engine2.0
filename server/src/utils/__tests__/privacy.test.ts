import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { PrivacyUtils } from '../privacy';

describe('Privacy Utilities', () => {
  let privacyUtils: PrivacyUtils;

  beforeEach(() => {
    privacyUtils = new PrivacyUtils({
      encryptionKey: process.env.ENCRYPTION_KEY || 'test-encryption-key-32-characters!!'
    });
    jest.clearAllMocks();
  });

  describe('PII Detection and Redaction', () => {
    test('should redact email addresses', () => {
      const text = 'Contact John at john.doe@example.com or jane@school.edu for details.';
      const redacted = privacyUtils.redactPII(text);

      expect(redacted).toBe('Contact John at [EMAIL_REDACTED] or [EMAIL_REDACTED] for details.');
      expect(redacted).not.toContain('@');
    });

    test('should redact phone numbers in various formats', () => {
      const testCases = [
        {
          input: 'Call me at 555-123-4567',
          expected: 'Call me at [PHONE_REDACTED]'
        },
        {
          input: 'Phone: (555) 123-4567',
          expected: 'Phone: [PHONE_REDACTED]'
        },
        {
          input: 'Mobile: +1-555-123-4567',
          expected: 'Mobile: [PHONE_REDACTED]'
        },
        {
          input: 'Contact: 5551234567',
          expected: 'Contact: [PHONE_REDACTED]'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(privacyUtils.redactPII(input)).toBe(expected);
      });
    });

    test('should redact social security numbers', () => {
      const testCases = [
        {
          input: 'SSN: 123-45-6789',
          expected: 'SSN: [SSN_REDACTED]'
        },
        {
          input: 'Social: 123 45 6789',
          expected: 'Social: [SSN_REDACTED]'
        },
        {
          input: 'ID: 123456789',
          expected: 'ID: [SSN_REDACTED]'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(privacyUtils.redactPII(input)).toBe(expected);
      });
    });

    test('should redact credit card numbers', () => {
      const testCases = [
        {
          input: 'Card: 4111 1111 1111 1111',
          expected: 'Card: [CC_REDACTED]'
        },
        {
          input: 'Payment: 4111-1111-1111-1111',
          expected: 'Payment: [CC_REDACTED]'
        },
        {
          input: 'Visa: 4111111111111111',
          expected: 'Visa: [CC_REDACTED]'
        },
        {
          input: 'Amex: 378282246310005',
          expected: 'Amex: [CC_REDACTED]'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(privacyUtils.redactPII(input)).toBe(expected);
      });
    });

    test('should preserve non-PII data', () => {
      const text = `Student Report
      Name: John Doe
      Grade: 3
      Teacher: Ms. Smith
      Comments: Excellent progress in mathematics.`;

      const redacted = privacyUtils.redactPII(text);

      expect(redacted).toContain('John Doe');
      expect(redacted).toContain('Grade: 3');
      expect(redacted).toContain('Ms. Smith');
      expect(redacted).toContain('Excellent progress');
    });

    test('should handle mixed content with multiple PII types', () => {
      const text = `Emergency Contact Form
      Student: Jane Smith
      Parent Email: parent@email.com
      Phone: 555-123-4567
      Alt Phone: (555) 987-6543
      SSN: 123-45-6789
      Notes: Allergic to peanuts`;

      const redacted = privacyUtils.redactPII(text);

      expect(redacted).toContain('Jane Smith');
      expect(redacted).toContain('[EMAIL_REDACTED]');
      expect(redacted.match(/\[PHONE_REDACTED\]/g)).toHaveLength(2);
      expect(redacted).toContain('[SSN_REDACTED]');
      expect(redacted).toContain('Allergic to peanuts');
    });

    test('should redact custom patterns', () => {
      privacyUtils.addCustomPattern({
        name: 'STUDENT_ID',
        pattern: /STU\d{6}/g,
        replacement: '[STUDENT_ID_REDACTED]'
      });

      const text = 'Student ID: STU123456 enrolled in Math 101';
      const redacted = privacyUtils.redactPII(text);

      expect(redacted).toBe('Student ID: [STUDENT_ID_REDACTED] enrolled in Math 101');
    });
  });

  describe('Field-Level Encryption', () => {
    test('should encrypt sensitive fields', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        grade: '3'
      };

      const encrypted = privacyUtils.encryptFields(data, ['email', 'phone']);

      expect(encrypted.name).toBe('John Doe');
      expect(encrypted.grade).toBe('3');
      expect(encrypted.email).not.toBe('john@example.com');
      expect(encrypted.phone).not.toBe('555-123-4567');
      expect(encrypted.email).toMatch(/^enc:/);
      expect(encrypted.phone).toMatch(/^enc:/);
    });

    test('should decrypt encrypted fields with correct key', () => {
      const original = {
        email: 'john@example.com',
        phone: '555-123-4567'
      };

      const encrypted = privacyUtils.encryptFields(original, ['email', 'phone']);
      const decrypted = privacyUtils.decryptFields(encrypted, ['email', 'phone']);

      expect(decrypted).toEqual(original);
    });

    test('should fail decryption with wrong key', () => {
      const data = { secret: 'sensitive data' };
      const encrypted = privacyUtils.encryptFields(data, ['secret']);

      // Create new instance with different key
      const wrongKeyUtils = new PrivacyUtils({
        encryptionKey: 'wrong-key-32-characters-long!!!!'
      });

      expect(() => {
        wrongKeyUtils.decryptFields(encrypted, ['secret']);
      }).toThrow('Decryption failed');
    });

    test('should handle nested object encryption', () => {
      const data = {
        user: {
          name: 'John Doe',
          contact: {
            email: 'john@example.com',
            phone: '555-123-4567'
          }
        },
        grade: '3'
      };

      const encrypted = privacyUtils.encryptNestedFields(data, {
        'user.contact.email': true,
        'user.contact.phone': true
      });

      expect(encrypted.user.name).toBe('John Doe');
      expect(encrypted.grade).toBe('3');
      expect(encrypted.user.contact.email).toMatch(/^enc:/);
      expect(encrypted.user.contact.phone).toMatch(/^enc:/);
    });

    test('should handle encryption key rotation', () => {
      const oldKey = 'old-encryption-key-32-characters';
      const newKey = 'new-encryption-key-32-characters';

      const oldUtils = new PrivacyUtils({ encryptionKey: oldKey });
      const data = { secret: 'sensitive data' };
      const encrypted = oldUtils.encryptFields(data, ['secret']);

      // Rotate key
      const rotated = privacyUtils.rotateEncryption(encrypted, ['secret'], oldKey, newKey);
      
      const newUtils = new PrivacyUtils({ encryptionKey: newKey });
      const decrypted = newUtils.decryptFields(rotated, ['secret']);

      expect(decrypted).toEqual(data);
    });
  });

  describe('Audit Logging', () => {
    test('should log PII access without exposing values', () => {
      const logSpy = jest.spyOn(privacyUtils, 'logAccess');

      const data = {
        email: 'john@example.com',
        phone: '555-123-4567'
      };

      privacyUtils.auditAccess('user-123', 'view_student', data);

      expect(logSpy).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'view_student',
        fields: ['email', 'phone'],
        timestamp: expect.any(Date),
        ip: expect.any(String)
      });

      // Should not log actual values
      expect(logSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.any(Object)
        })
      );
    });

    test('should track access patterns', () => {
      const userId = 'user-123';
      
      // Simulate multiple accesses
      for (let i = 0; i < 10; i++) {
        privacyUtils.auditAccess(userId, 'view_student', { email: 'test@test.com' });
      }

      const patterns = privacyUtils.getAccessPatterns(userId);

      expect(patterns).toMatchObject({
        userId: 'user-123',
        totalAccesses: 10,
        actions: {
          view_student: 10
        },
        fieldsAccessed: ['email']
      });
    });

    test('should detect suspicious access patterns', () => {
      const userId = 'suspicious-user';

      // Simulate bulk access
      for (let i = 0; i < 100; i++) {
        privacyUtils.auditAccess(userId, 'export_student_data', {
          email: `student${i}@school.com`,
          ssn: `123-45-${i.toString().padStart(4, '0')}`
        });
      }

      const alerts = privacyUtils.checkSuspiciousActivity(userId);

      expect(alerts).toContainEqual(
        expect.objectContaining({
          type: 'bulk_access',
          userId: 'suspicious-user',
          action: 'export_student_data',
          count: 100,
          severity: 'high'
        })
      );
    });

    test('should respect retention policies', () => {
      jest.useFakeTimers();
      const now = new Date('2024-01-15');
      jest.setSystemTime(now);

      // Add old access logs
      privacyUtils.auditAccess('user-1', 'view', { data: 'old' });

      // Move time forward 91 days
      jest.setSystemTime(new Date('2024-04-16'));

      // Add new access log
      privacyUtils.auditAccess('user-2', 'view', { data: 'new' });

      // Clean old logs (90 day retention)
      privacyUtils.cleanOldAuditLogs(90);

      const logs = privacyUtils.getAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe('user-2');

      jest.useRealTimers();
    });
  });

  describe('Data Masking', () => {
    test('should mask data for different access levels', () => {
      const data = {
        name: 'John Doe',
        email: 'john.doe@school.com',
        phone: '555-123-4567',
        ssn: '123-45-6789',
        grade: '3'
      };

      // Teacher access - partial masking
      const teacherView = privacyUtils.maskDataForRole(data, 'teacher');
      expect(teacherView.name).toBe('John Doe');
      expect(teacherView.email).toBe('john.doe@school.com');
      expect(teacherView.phone).toBe('555-***-****');
      expect(teacherView.ssn).toBeUndefined();
      expect(teacherView.grade).toBe('3');

      // Admin access - full view
      const adminView = privacyUtils.maskDataForRole(data, 'admin');
      expect(adminView).toEqual(data);

      // Parent access - limited view
      const parentView = privacyUtils.maskDataForRole(data, 'parent');
      expect(parentView.name).toBe('John D**');
      expect(parentView.email).toBeUndefined();
      expect(parentView.phone).toBeUndefined();
      expect(parentView.ssn).toBeUndefined();
      expect(parentView.grade).toBe('3');
    });

    test('should mask arrays of sensitive data', () => {
      const students = [
        { name: 'John Doe', email: 'john@school.com' },
        { name: 'Jane Smith', email: 'jane@school.com' }
      ];

      const masked = privacyUtils.maskArrayForRole(students, 'parent', ['email']);

      masked.forEach(student => {
        expect(student.email).toBeUndefined();
        expect(student.name).toBeDefined();
      });
    });
  });

  describe('Compliance Features', () => {
    test('should support GDPR data export', () => {
      const userData = {
        profile: { name: 'John Doe', email: 'john@test.com' },
        activities: [
          { date: '2024-01-01', action: 'login' },
          { date: '2024-01-02', action: 'view_grades' }
        ],
        preferences: { notifications: true }
      };

      const gdprExport = privacyUtils.generateGDPRExport('user-123', userData);

      expect(gdprExport).toMatchObject({
        userId: 'user-123',
        exportDate: expect.any(Date),
        data: userData,
        format: 'json',
        encrypted: false
      });
    });

    test('should support GDPR data deletion', () => {
      const deletionRequest = {
        userId: 'user-123',
        reason: 'user_request',
        verificationToken: 'valid-token'
      };

      const result = privacyUtils.processDataDeletion(deletionRequest);

      expect(result).toMatchObject({
        success: true,
        deletedFields: expect.any(Array),
        retainedFields: ['userId'], // Keep for audit trail
        deletionDate: expect.any(Date),
        certificateId: expect.any(String)
      });
    });

    test('should anonymize data instead of deletion when required', () => {
      const data = {
        userId: 'user-123',
        name: 'John Doe',
        email: 'john@test.com',
        grades: [85, 90, 88],
        attendanceRate: 0.95
      };

      const anonymized = privacyUtils.anonymizeData(data, {
        preserveAnalytics: true
      });

      expect(anonymized.userId).toMatch(/^anon-/);
      expect(anonymized.name).toBe('[ANONYMIZED]');
      expect(anonymized.email).toBe('[ANONYMIZED]');
      expect(anonymized.grades).toEqual([85, 90, 88]); // Preserved for analytics
      expect(anonymized.attendanceRate).toBe(0.95); // Preserved for analytics
    });
  });

  describe('Performance', () => {
    test('should efficiently redact large documents', () => {
      const largeText = Array(1000).fill(
        'Contact email@test.com or call 555-123-4567. '
      ).join('');

      const start = Date.now();
      const redacted = privacyUtils.redactPII(largeText);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
      expect(redacted).not.toContain('@');
      expect(redacted).not.toContain('555-123-4567');
    });

    test('should cache encryption operations', () => {
      const data = { email: 'test@test.com' };
      
      // First encryption
      const encrypted1 = privacyUtils.encryptFields(data, ['email']);
      
      // Second encryption of same data
      const encrypted2 = privacyUtils.encryptFields(data, ['email']);

      // Should return same encrypted value (cached)
      expect(encrypted1.email).toBe(encrypted2.email);
    });
  });
});