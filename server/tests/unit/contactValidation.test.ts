import {
  validatePhoneNumber,
  validateEmail,
  validateContact,
  parseContactString,
  extractExtension,
  validateEmergencyContact,
  PhoneValidationResult,
  EmailValidationResult,
  ContactValidationResult,
} from '../../src/utils/contactValidation';

describe('Contact Validation Utilities', () => {
  describe('validatePhoneNumber', () => {
    describe('North American Numbers', () => {
      it('should validate standard 10-digit numbers', () => {
        const tests = [
          '555-123-4567',
          '(555) 123-4567',
          '555.123.4567',
          '555 123 4567',
          '5551234567',
          '+1-555-123-4567',
          '1-555-123-4567',
        ];

        tests.forEach((phone) => {
          const result = validatePhoneNumber(phone);
          expect(result.isValid).toBe(true);
          expect(result.formatted).toBe('555-123-4567');
          expect(result.countryCode).toBe('1');
          expect(result.areaCode).toBe('555');
        });
      });

      it('should handle extensions correctly', () => {
        const tests = [
          '555-123-4567 ext 123',
          '555-123-4567 ext. 123',
          '555-123-4567 extension 123',
          '(555) 123-4567 x123',
        ];

        tests.forEach((phone) => {
          const result = validatePhoneNumber(phone);
          expect(result.isValid).toBe(true);
          expect(result.extension).toBe('123');
          expect(result.formatted).toBe('555-123-4567');
        });
      });

      it('should reject invalid area codes', () => {
        const invalidAreaCodes = [
          '055-123-4567', // starts with 0
          '155-123-4567', // starts with 1
        ];

        invalidAreaCodes.forEach((phone) => {
          const result = validatePhoneNumber(phone);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain('Invalid area code');
        });
      });

      it('should reject invalid exchange codes', () => {
        const invalidExchanges = [
          '555-023-4567', // starts with 0
          '555-123-4567', // this should be valid
          '555-123-4567',
        ];

        // Test invalid exchange
        const result1 = validatePhoneNumber('555-023-4567');
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('Invalid exchange code');

        // Test valid exchange
        const result2 = validatePhoneNumber('555-123-4567');
        expect(result2.isValid).toBe(true);
      });
    });

    describe('International Numbers', () => {
      it('should validate international formats', () => {
        const tests = [
          { input: '+44 20 7946 0958', country: '44' },
          { input: '+33 1 42 86 83 26', country: '33' },
          { input: '+49 30 12345678', country: '49' },
          { input: '+61 2 9374 4000', country: '61' },
          { input: '+86 10 8888 8888', country: '86' },
        ];

        tests.forEach(({ input, country }) => {
          const result = validatePhoneNumber(input);
          expect(result.isValid).toBe(true);
          expect(result.countryCode).toBe(country);
          expect(result.formatted).toContain(`+${country}`);
        });
      });

      it('should handle international numbers with extensions', () => {
        const result = validatePhoneNumber('+44 20 7946 0958 ext 123');
        expect(result.isValid).toBe(true);
        expect(result.countryCode).toBe('44');
        expect(result.extension).toBe('123');
      });

      it('should reject international numbers that are too short or long', () => {
        const tooShort = validatePhoneNumber('+44 123');
        expect(tooShort.isValid).toBe(false);
        expect(tooShort.errors).toContain('International number must be 7-15 digits');

        const tooLong = validatePhoneNumber('+44 12345678901234567890');
        expect(tooLong.isValid).toBe(false);
        expect(tooLong.errors).toContain('International number must be 7-15 digits');
      });
    });

    describe('Emergency Numbers', () => {
      it('should validate emergency numbers', () => {
        const emergencyNumbers = ['911', '999', '112'];

        emergencyNumbers.forEach((number) => {
          const result = validatePhoneNumber(number);
          expect(result.isValid).toBe(true);
          expect(result.formatted).toBe(number);
          expect(result.number).toBe(number);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle null and undefined inputs', () => {
        const result1 = validatePhoneNumber(null as any);
        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain('Phone number is required');

        const result2 = validatePhoneNumber(undefined as any);
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain('Phone number is required');
      });

      it('should handle empty strings', () => {
        const result = validatePhoneNumber('');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Phone number is required');
      });

      it('should handle numbers with special characters', () => {
        const result = validatePhoneNumber('555-123-4567 # press 1 for support');
        expect(result.isValid).toBe(true);
        expect(result.formatted).toBe('555-123-4567');
      });

      it('should handle very short numbers', () => {
        const result = validatePhoneNumber('123');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Phone number too short');
      });

      it('should handle very long numbers', () => {
        const result = validatePhoneNumber('12345678901234567890');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Phone number too long');
      });

      it('should accept basic 7-11 digit numbers', () => {
        const result7 = validatePhoneNumber('1234567');
        expect(result7.isValid).toBe(true);
        expect(result7.formatted).toBe('123-4567');

        const result8 = validatePhoneNumber('12345678');
        expect(result8.isValid).toBe(true);
      });
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@subdomain.example.org',
        'user123@test-domain.com',
        'a@b.co',
      ];

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
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user@.domain.com',
        'user@domain..com',
      ];

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

      // Too long email
      const longLocalPart = 'a'.repeat(65) + '@example.com';
      const longResult = validateEmail(longLocalPart);
      expect(longResult.isValid).toBe(false);
      expect(longResult.errors).toContain('Email local part too long');

      // Very long email
      const veryLongEmail = 'test@' + 'a'.repeat(250) + '.com';
      const veryLongResult = validateEmail(veryLongEmail);
      expect(veryLongResult.isValid).toBe(false);
      expect(veryLongResult.errors).toContain('Email address too long');
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
        role: 'Principal',
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
        role: 'Principal',
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
      expect(result.errors).toEqual(
        expect.arrayContaining([
          'Name is required',
          expect.stringContaining('Phone:'),
          expect.stringContaining('Email:'),
        ]),
      );
    });
  });

  describe('parseContactString', () => {
    it('should parse contact string with name, phone, and email', () => {
      const contactStrings = [
        'John Doe 555-123-4567 john@example.com',
        'John Doe john@example.com 555-123-4567',
        'john@example.com John Doe 555-123-4567',
        'Dr. Jane Smith (555) 123-4567 ext 100 jane.smith@school.edu',
      ];

      contactStrings.forEach((str) => {
        const result = parseContactString(str);
        expect(result.isValid).toBe(true);
        expect(result.name).toBeTruthy();
        expect(result.phone?.isValid).toBe(true);
        expect(result.email?.isValid).toBe(true);
      });
    });

    it('should parse contact string with only name and phone', () => {
      const result = parseContactString('John Doe 555-123-4567');
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.phone?.isValid).toBe(true);
      expect(result.email).toBeUndefined();
    });

    it('should parse contact string with only name and email', () => {
      const result = parseContactString('John Doe john@example.com');
      expect(result.isValid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.phone).toBeUndefined();
      expect(result.email?.isValid).toBe(true);
    });

    it('should handle various separators', () => {
      const tests = [
        'John Doe - 555-123-4567',
        'John Doe, 555-123-4567',
        'John Doe | 555-123-4567',
        'John Doe : 555-123-4567',
      ];

      tests.forEach((str) => {
        const result = parseContactString(str);
        expect(result.isValid).toBe(true);
        expect(result.name).toBe('John Doe');
      });
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
  });

  describe('extractExtension', () => {
    it('should extract extensions from phone numbers', () => {
      const tests = [
        { input: '555-123-4567 ext 123', phone: '555-123-4567', ext: '123' },
        { input: '555-123-4567 ext. 456', phone: '555-123-4567', ext: '456' },
        { input: '555-123-4567 extension 789', phone: '555-123-4567', ext: '789' },
        { input: '555-123-4567 x999', phone: '555-123-4567', ext: '999' },
      ];

      tests.forEach(({ input, phone, ext }) => {
        const result = extractExtension(input);
        expect(result.phone).toBe(phone);
        expect(result.extension).toBe(ext);
      });
    });

    it('should handle phones without extensions', () => {
      const result = extractExtension('555-123-4567');
      expect(result.phone).toBe('555-123-4567');
      expect(result.extension).toBeUndefined();
    });

    it('should handle various extension formats', () => {
      const tests = [
        '555-123-4567 Ext 123',
        '555-123-4567 EXT. 123',
        '555-123-4567 Extension 123',
        '555-123-4567 X 123',
      ];

      tests.forEach((input) => {
        const result = extractExtension(input);
        expect(result.extension).toBe('123');
      });
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

  describe('Multiple Format Support', () => {
    it('should handle various phone number formats from different countries', () => {
      const formats = [
        // US/Canada
        { phone: '+1 555 123 4567', country: '1' },
        { phone: '(555) 123-4567', formatted: '555-123-4567' },

        // UK
        { phone: '+44 20 7946 0958', country: '44' },
        { phone: '+44 7911 123456', country: '44' },

        // Germany
        { phone: '+49 30 12345678', country: '49' },

        // France
        { phone: '+33 1 42 86 83 26', country: '33' },

        // Australia
        { phone: '+61 2 9374 4000', country: '61' },

        // Japan
        { phone: '+81 3 1234 5678', country: '81' },
      ];

      formats.forEach(({ phone, country, formatted }) => {
        const result = validatePhoneNumber(phone);
        expect(result.isValid).toBe(true);
        if (country) {
          expect(result.countryCode).toBe(country);
        }
        if (formatted) {
          expect(result.formatted).toBe(formatted);
        }
      });
    });

    it('should handle contact parsing edge cases', () => {
      const edgeCases = [
        'Dr. Mary Johnson-Smith 555.123.4567 ext 105',
        'Prof. Jean-Pierre Dubois +33 1 42 86 83 26',
        "Ms. Sarah O'Connor (555) 123-4567 sarah.oconnor@school.edu",
        'Mr. José García +1-555-123-4567 jose.garcia@escuela.edu',
      ];

      edgeCases.forEach((contactStr) => {
        const result = parseContactString(contactStr);
        expect(result.isValid).toBe(true);
        expect(result.name).toBeTruthy();
        expect(result.phone?.isValid || result.email?.isValid).toBe(true);
      });
    });
  });

  describe('Error Handling Scenarios', () => {
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

    it('should handle unicode and special characters', () => {
      const unicodePhone = validatePhoneNumber('５５５-１２３-４５６７'); // Full-width numbers
      expect(unicodePhone.isValid).toBe(false); // Should fail as we expect ASCII digits

      const unicodeName = validateContact({
        name: 'José García-González',
        phone: '555-123-4567',
      });
      expect(unicodeName.isValid).toBe(true);
      expect(unicodeName.name).toBe('José García-González');

      const unicodeEmail = validateEmail('josé@example.com');
      expect(unicodeEmail.isValid).toBe(false); // Basic regex doesn't support unicode domains
    });
  });
});
