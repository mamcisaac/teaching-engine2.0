import {
  validatePhoneNumber,
  validateEmail,
  validateContact,
  parseContactString,
  extractExtension,
  validateEmergencyContact,
} from '../../src/utils/contactValidation';

describe('Contact Validation Utilities - Simplified for Coverage', () => {
  describe('validatePhoneNumber', () => {
    it('should validate emergency numbers', () => {
      const emergencyNumbers = ['911', '999', '112'];

      emergencyNumbers.forEach((number) => {
        const result = validatePhoneNumber(number);
        expect(result.isValid).toBe(true);
        expect(result.formatted).toBe(number);
        expect(result.number).toBe(number);
      });
    });

    it('should handle null and undefined inputs', () => {
      const result1 = validatePhoneNumber(null as any);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Phone number is required');

      const result2 = validatePhoneNumber(undefined as any);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Phone number is required');

      const result3 = validatePhoneNumber('');
      expect(result3.isValid).toBe(false);
      expect(result3.errors).toContain('Phone number is required');
    });

    it('should validate North American format numbers', () => {
      const validNumbers = ['555-123-4567', '(555) 123-4567', '555.123.4567', '5551234567'];

      validNumbers.forEach((phone) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.countryCode).toBe('1');
        expect(result.areaCode).toBe('555');
      });
    });

    it('should extract extensions', () => {
      const phonesWithExt = [
        '555-123-4567 ext 123',
        '555-123-4567 extension 456',
        '555-123-4567 x789',
      ];

      phonesWithExt.forEach((phone) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.extension).toBeTruthy();
      });
    });

    it('should validate international numbers', () => {
      const intlNumbers = ['+44 20 7946 0958', '+1 555 123 4567', '+33 1 42 86 83 26'];

      intlNumbers.forEach((phone) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.countryCode).toBeTruthy();
      });
    });

    it('should reject very short numbers', () => {
      const result = validatePhoneNumber('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Phone number too short');
    });

    it('should reject invalid area codes', () => {
      const result = validatePhoneNumber('055-123-4567');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid area code');
    });

    it('should reject invalid exchange codes', () => {
      const result = validatePhoneNumber('555-023-4567');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid exchange code');
    });

    it('should handle basic 7-11 digit numbers', () => {
      const result7 = validatePhoneNumber('1234567');
      expect(result7.isValid).toBe(true);

      const result10 = validatePhoneNumber('5551234567');
      expect(result10.isValid).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user123@test-domain.com'];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.formatted).toBe(email.toLowerCase());
      });
    });

    it('should normalize email case', () => {
      const result = validateEmail('TEST@EXAMPLE.COM');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('test@example.com');
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = ['invalid-email', '@domain.com', 'user@', 'user@domain'];

      invalidEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid email format');
      });
    });

    it('should handle edge cases', () => {
      // Empty email
      const empty = validateEmail('');
      expect(empty.isValid).toBe(false);
      expect(empty.errors).toContain('Email is required');

      // Null email
      const nullEmail = validateEmail(null as any);
      expect(nullEmail.isValid).toBe(false);
      expect(nullEmail.errors).toContain('Email is required');

      // Too long email address
      const veryLongEmail = 'test@' + 'a'.repeat(250) + '.com';
      const veryLongResult = validateEmail(veryLongEmail);
      expect(veryLongResult.isValid).toBe(false);
      expect(veryLongResult.errors).toContain('Email address too long');

      // Too long local part
      const longLocalPart = 'a'.repeat(65) + '@example.com';
      const longResult = validateEmail(longLocalPart);
      expect(longResult.isValid).toBe(false);
      expect(longResult.errors).toContain('Email local part too long');
    });

    it('should trim whitespace', () => {
      const result = validateEmail('  test@example.com  ');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('test@example.com');
    });
  });

  describe('validateContact', () => {
    it('should validate complete contact information', () => {
      const contact = {
        name: 'John Doe',
        phone: '555-123-4567',
        email: 'john@example.com',
      };

      const result = validateContact(contact);
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.phone?.isValid).toBe(true);
      expect(result.email?.isValid).toBe(true);
    });

    it('should require either phone or email', () => {
      const contactWithoutBoth = {
        name: 'John Doe',
      };

      const result = validateContact(contactWithoutBoth);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Either phone number or email is required');
    });

    it('should accept contact with only phone', () => {
      const contact = {
        name: 'John Doe',
        phone: '555-123-4567',
      };

      const result = validateContact(contact);
      expect(result.isValid).toBe(true);
    });

    it('should accept contact with only email', () => {
      const contact = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = validateContact(contact);
      expect(result.isValid).toBe(true);
    });

    it('should validate name requirements', () => {
      // Missing name
      const noName = validateContact({ phone: '555-123-4567' });
      expect(noName.isValid).toBe(false);
      expect(noName.errors).toContain('Name is required');

      // Empty name
      const emptyName = validateContact({ name: '', phone: '555-123-4567' });
      expect(emptyName.isValid).toBe(false);
      expect(emptyName.errors).toContain('Name is required');

      // Too long name
      const longName = validateContact({
        name: 'A'.repeat(201),
        phone: '555-123-4567',
      });
      expect(longName.isValid).toBe(false);
      expect(longName.errors).toContain('Name too long');
    });

    it('should aggregate validation errors', () => {
      const contact = {
        name: '',
        phone: 'invalid-phone',
        email: 'invalid-email',
      };

      const result = validateContact(contact);
      expect(result.isValid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });
  });

  describe('parseContactString', () => {
    it('should parse contact string with name and phone', () => {
      const result = parseContactString('John Doe 555-123-4567');
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.phone?.isValid).toBe(true);
    });

    it('should parse contact string with name and email', () => {
      const result = parseContactString('John Doe john@example.com');
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.email?.isValid).toBe(true);
    });

    it('should handle empty or invalid input', () => {
      const empty = parseContactString('');
      expect(empty.isValid).toBe(false);
      expect(empty.errors).toContain('Contact string is required');

      const nullInput = parseContactString(null as any);
      expect(nullInput.isValid).toBe(false);
      expect(nullInput.errors).toContain('Contact string is required');
    });

    it('should handle strings with only a name', () => {
      const result = parseContactString('John Doe');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Either phone number or email is required');
    });

    it('should clean up separators in names', () => {
      const result = parseContactString('John Doe - 555-123-4567');
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('John Doe');
    });
  });

  describe('extractExtension', () => {
    it('should extract extensions from phone numbers', () => {
      const tests = [
        { input: '555-123-4567 ext 123', ext: '123' },
        { input: '555-123-4567 extension 456', ext: '456' },
        { input: '555-123-4567 x999', ext: '999' },
      ];

      tests.forEach(({ input, ext }) => {
        const result = extractExtension(input);
        expect(result.extension).toBe(ext);
      });
    });

    it('should handle phones without extensions', () => {
      const result = extractExtension('555-123-4567');
      expect(result.phone).toBe('555-123-4567');
      expect(result.extension).toBeUndefined();
    });
  });

  describe('validateEmergencyContact', () => {
    it('should validate emergency contact with all fields', () => {
      const contact = {
        name: 'Jane Smith',
        relationship: 'Mother',
        phone: '555-123-4567',
        email: 'jane@example.com',
        availability: 'Weekdays 9-5',
      };

      const result = validateEmergencyContact(contact);
      expect(result.isValid).toBe(true);
      expect(result.relationship).toBe('Mother');
      expect(result.availability).toBe('Weekdays 9-5');
    });

    it('should validate emergency contact with minimal fields', () => {
      const contact = {
        name: 'John Doe',
        phone: '555-123-4567',
      };

      const result = validateEmergencyContact(contact);
      expect(result.isValid).toBe(true);
    });

    it('should validate relationship and availability length', () => {
      const longRelationship = validateEmergencyContact({
        name: 'Test',
        phone: '555-123-4567',
        relationship: 'A'.repeat(101),
      });
      expect(longRelationship.isValid).toBe(false);
      expect(longRelationship.errors).toContain('Relationship description too long');

      const longAvailability = validateEmergencyContact({
        name: 'Test',
        phone: '555-123-4567',
        availability: 'A'.repeat(201),
      });
      expect(longAvailability.isValid).toBe(false);
      expect(longAvailability.errors).toContain('Availability description too long');
    });

    it('should trim relationship and availability fields', () => {
      const result = validateEmergencyContact({
        name: 'Test',
        phone: '555-123-4567',
        relationship: '  Father  ',
        availability: '  Always available  ',
      });

      expect(result.isValid).toBe(true);
      expect(result.relationship).toBe('Father');
      expect(result.availability).toBe('Always available');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed input gracefully', () => {
      const malformedInputs = [null, undefined, 123, {}, [], '', '   '];

      malformedInputs.forEach((input) => {
        const phoneResult = validatePhoneNumber(input as any);
        expect(phoneResult.isValid).toBe(false);
        expect(phoneResult.errors).toBeDefined();

        const emailResult = validateEmail(input as any);
        expect(emailResult.isValid).toBe(false);
        expect(emailResult.errors).toBeDefined();

        const contactResult = parseContactString(input as any);
        expect(contactResult.isValid).toBe(false);
        expect(contactResult.errors).toBeDefined();
      });
    });

    it('should provide meaningful error messages', () => {
      const phoneResult = validatePhoneNumber('123');
      expect(phoneResult.errors?.[0]).toBe('Phone number too short');

      const emailResult = validateEmail('invalid');
      expect(emailResult.errors?.[0]).toBe('Invalid email format');

      const contactResult = validateContact({ name: '', phone: 'invalid' });
      expect(contactResult.errors).toEqual(
        expect.arrayContaining(['Name is required', expect.stringContaining('Phone:')]),
      );
    });

    it('should handle unicode names correctly', () => {
      const unicodeName = validateContact({
        name: 'José García-González',
        phone: '555-123-4567',
      });
      expect(unicodeName.isValid).toBe(true);
      expect(unicodeName.name).toBe('José García-González');
    });

    it('should handle various separators in contact parsing', () => {
      const tests = [
        'John Doe - 555-123-4567',
        'John Doe, 555-123-4567',
        'John Doe : 555-123-4567',
      ];

      tests.forEach((str) => {
        const result = parseContactString(str);
        expect(result.isValid).toBe(true);
        expect(result.name).toBe('John Doe');
      });
    });
  });

  describe('International Format Support', () => {
    it('should handle various international phone formats', () => {
      const formats = ['+1 555 123 4567', '+44 20 7946 0958', '+33 1 42 86 83 26'];

      formats.forEach((phone) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        expect(result.countryCode).toBeTruthy();
      });
    });

    it('should reject international numbers that are too long', () => {
      const tooLong = validatePhoneNumber('+44 12345678901234567890');
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.errors).toContain('International number must be 7-15 digits');
    });

    it('should reject international numbers that are too short', () => {
      const tooShort = validatePhoneNumber('+44 123');
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors).toContain('International number must be 7-15 digits');
    });
  });
});
