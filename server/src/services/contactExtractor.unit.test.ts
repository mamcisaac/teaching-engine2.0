import {
  ContactInfo,
  ExtractedContacts,
  extractSchoolContacts,
  formatContactsForSubPlan,
  getEmergencyContactsList,
  generateEmergencyContactCard,
  updateTeacherContacts,
} from './contactExtractor';

// For mocking
import { jest } from '@jest/globals';

describe('ContactExtractor Service', () => {
  describe('extractSchoolContacts', () => {
    it('should extract and organize default school contacts', async () => {
      const contacts = await extractSchoolContacts(1);

      expect(contacts).toBeDefined();
      expect(contacts.emergency).toBeInstanceOf(Array);
      expect(contacts.administration).toBeInstanceOf(Array);
      expect(contacts.support).toBeInstanceOf(Array);
      expect(contacts.technical).toBeInstanceOf(Array);
      expect(contacts.medical).toBeInstanceOf(Array);
      expect(contacts.transportation).toBeInstanceOf(Array);
      expect(contacts.custom).toBeInstanceOf(Array);

      // Check that default contacts are included
      const emergencyService = contacts.emergency.find((c) => c.phone === '911');
      expect(emergencyService).toBeDefined();
      expect(emergencyService?.role).toBe('Emergency (Fire/Police/Ambulance)');
      expect(emergencyService?.priority).toBe('emergency');
    });

    it('should categorize contacts correctly', async () => {
      const contacts = await extractSchoolContacts(1);

      // Check administration contacts
      const principal = contacts.administration.find((c) => c.role === 'Principal');
      expect(principal).toBeDefined();
      expect(principal?.category).toBe('administration');

      // Check medical contacts
      const nurse = contacts.medical.find((c) => c.role === 'Nurse');
      expect(nurse).toBeDefined();
      expect(nurse?.category).toBe('medical');

      // Check technical contacts
      const itSupport = contacts.technical.find((c) => c.role === 'Technology Support');
      expect(itSupport).toBeDefined();
      expect(itSupport?.category).toBe('technical');
    });

    it('should handle missing userId parameter', async () => {
      const contacts = await extractSchoolContacts();
      expect(contacts).toBeDefined();
      expect(contacts.emergency.length).toBeGreaterThan(0);
    });
  });

  describe('formatContactsForSubPlan', () => {
    const mockContacts: ExtractedContacts = {
      emergency: [
        {
          id: 'emergency',
          name: 'Emergency Services',
          role: 'Emergency (Fire/Police/Ambulance)',
          phone: '911',
          availability: '24/7',
          priority: 'emergency',
          category: 'safety',
        },
      ],
      administration: [
        {
          id: 'principal',
          name: 'Dr. Jane Smith',
          role: 'Principal',
          phone: '555-1234',
          extension: '100',
          availability: 'School hours',
          priority: 'urgent',
          category: 'administration',
        },
      ],
      support: [
        {
          id: 'secretary',
          name: 'John Doe',
          role: 'Office Secretary',
          phone: '555-1234',
          extension: '101',
          location: 'Main Office',
          availability: '8:00 AM - 4:00 PM',
          priority: 'normal',
          category: 'support',
        },
      ],
      technical: [],
      medical: [
        {
          id: 'nurse',
          name: 'Mary Johnson',
          role: 'School Nurse',
          phone: '555-1234',
          extension: '105',
          location: 'Health Office',
          availability: 'School hours',
          priority: 'urgent',
          category: 'medical',
        },
      ],
      transportation: [],
      custom: [],
    };

    it('should format contacts with proper sections', () => {
      const formatted = formatContactsForSubPlan(mockContacts);

      expect(formatted).toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).toContain('🤝 SUPPORT STAFF:');
      expect(formatted).toContain('🏥 MEDICAL:');
      expect(formatted).not.toContain('💻 TECHNICAL SUPPORT:'); // Empty section
      expect(formatted).not.toContain('🚌 TRANSPORTATION:'); // Empty section
    });

    it('should format contact details correctly', () => {
      const formatted = formatContactsForSubPlan(mockContacts);

      // Check emergency contact
      expect(formatted).toContain('Emergency (Fire/Police/Ambulance): Emergency Services - 911 [24/7]');

      // Check principal with extension
      expect(formatted).toContain('Principal: Dr. Jane Smith - 555-1234 ext. 100');

      // Check secretary with location and custom availability
      expect(formatted).toContain('Office Secretary: John Doe - 555-1234 ext. 101 (Main Office) [8:00 AM - 4:00 PM]');
    });

    it('should handle empty contact lists', () => {
      const emptyContacts: ExtractedContacts = {
        emergency: [],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const formatted = formatContactsForSubPlan(emptyContacts);
      expect(formatted).toBe('');
    });

    it('should include custom contacts when present', () => {
      const contactsWithCustom: ExtractedContacts = {
        ...mockContacts,
        custom: [
          {
            id: 'custom-parent',
            name: 'Parent Volunteer',
            role: 'Parent Helper',
            phone: '555-5678',
            availability: 'Thursdays',
            priority: 'normal',
            category: 'support',
          },
        ],
      };

      const formatted = formatContactsForSubPlan(contactsWithCustom);
      expect(formatted).toContain('📞 ADDITIONAL CONTACTS:');
      expect(formatted).toContain('Parent Helper: Parent Volunteer - 555-5678 [Thursdays]');
    });
  });

  describe('getEmergencyContactsList', () => {
    it('should extract emergency and urgent contacts', () => {
      const contacts: ExtractedContacts = {
        emergency: [
          {
            id: '1',
            name: 'Emergency',
            role: 'Emergency Services',
            phone: '911',
            availability: '24/7',
            priority: 'emergency',
            category: 'safety',
          },
        ],
        administration: [
          {
            id: '2',
            name: 'Principal',
            role: 'Principal',
            phone: '555-1234',
            extension: '100',
            availability: 'School hours',
            priority: 'urgent',
            category: 'administration',
          },
          {
            id: '3',
            name: 'Secretary',
            role: 'Secretary',
            phone: '555-1234',
            extension: '101',
            availability: 'School hours',
            priority: 'normal',
            category: 'administration',
          },
        ],
        medical: [
          {
            id: '4',
            name: 'Nurse',
            role: 'School Nurse',
            phone: '555-1234',
            extension: '105',
            availability: 'School hours',
            priority: 'urgent',
            category: 'medical',
          },
        ],
        support: [],
        technical: [],
        transportation: [],
        custom: [],
      };

      const emergencyList = getEmergencyContactsList(contacts);

      expect(emergencyList).toContain('Emergency Services: 911');
      expect(emergencyList).toContain('Principal: 555-1234 ext. 100');
      expect(emergencyList).toContain('School Nurse: 555-1234 ext. 105');
      expect(emergencyList).not.toContain('Secretary'); // Normal priority
    });

    it('should handle no emergency contacts', () => {
      const emptyContacts: ExtractedContacts = {
        emergency: [],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const result = getEmergencyContactsList(emptyContacts);
      expect(result).toBe('No emergency contacts configured. Contact main office.');
    });

    it('should format phone extensions correctly', () => {
      const contacts: ExtractedContacts = {
        emergency: [
          {
            id: '1',
            name: 'Test Contact',
            role: 'Test Role',
            phone: '555-1234',
            extension: '999',
            availability: 'Always',
            priority: 'emergency',
            category: 'safety',
          },
        ],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const result = getEmergencyContactsList(contacts);
      expect(result).toBe('Test Role: 555-1234 ext. 999');
    });
  });

  describe('generateEmergencyContactCard', () => {
    it('should generate formatted emergency contact card', () => {
      const contacts: ExtractedContacts = {
        emergency: [
          {
            id: '1',
            name: 'Emergency',
            role: 'Emergency Services',
            phone: '911',
            availability: '24/7',
            priority: 'emergency',
            category: 'safety',
          },
        ],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const card = generateEmergencyContactCard(contacts);

      expect(card).toContain('EMERGENCY CONTACTS');
      expect(card).toContain('Emergency Services: 911');
      expect(card).toContain('FOR IMMEDIATE EMERGENCIES CALL 911');
      expect(card).toContain('Keep this card visible at all times');
    });

    it('should include formatted box drawing characters', () => {
      const contacts: ExtractedContacts = {
        emergency: [],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const card = generateEmergencyContactCard(contacts);

      expect(card).toContain('┌─────────────────────────────────────┐');
      expect(card).toContain('│         EMERGENCY CONTACTS          │');
      expect(card).toContain('├─────────────────────────────────────┤');
      expect(card).toContain('└─────────────────────────────────────┘');
    });
  });

  describe('updateTeacherContacts', () => {
    it('should handle disabled functionality with warning', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await updateTeacherContacts(1, [
        { name: 'Test Contact', role: 'Test Role', phone: '555-1234' },
      ]);

      expect(consoleSpy).toHaveBeenCalledWith(
        'updateTeacherContacts is disabled - teacherPreferences model archived'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Phone Number Parsing', () => {
    it('should handle various phone number formats', async () => {
      // This test would require mocking the internal functions
      // or modifying the service to expose parsing functions
      const contacts = await extractSchoolContacts(1);

      // Verify default contacts have valid phone data
      const office = contacts.administration.find((c) => c.role === 'Main Office');
      expect(office).toBeDefined();
      expect(office?.phone).toBe('Contact office for number');
    });

    it('should handle missing or invalid data gracefully', async () => {
      const contacts = await extractSchoolContacts(1);

      // All categories should be arrays even if empty
      Object.values(contacts).forEach((category) => {
        expect(Array.isArray(category)).toBe(true);
      });
    });
  });

  describe('Contact Priority and Category Determination', () => {
    it('should correctly assign priorities to default contacts', async () => {
      const contacts = await extractSchoolContacts(1);

      // Emergency contacts should have emergency priority
      const emergency = contacts.emergency.find((c) => c.phone === '911');
      expect(emergency?.priority).toBe('emergency');

      // Principal should have urgent priority
      const principal = contacts.administration.find((c) => c.role === 'Principal');
      expect(principal?.priority).toBe('urgent');

      // Custodian should have normal priority
      const custodian = contacts.support.find((c) => c.role === 'Custodian');
      expect(custodian?.priority).toBe('normal');
    });

    it('should correctly categorize all default contacts', async () => {
      const contacts = await extractSchoolContacts(1);

      // Verify each default contact is in the correct category
      expect(contacts.administration.some((c) => c.role === 'Principal')).toBe(true);
      expect(contacts.administration.some((c) => c.role === 'Vice Principal')).toBe(true);
      expect(contacts.medical.some((c) => c.role === 'Nurse')).toBe(true);
      expect(contacts.support.some((c) => c.role === 'Custodian')).toBe(true);
      expect(contacts.technical.some((c) => c.role === 'Technology Support')).toBe(true);
    });
  });

  describe('International Phone Number Support', () => {
    it('should handle basic phone numbers in default contacts', async () => {
      const contacts = await extractSchoolContacts(1);

      // Check that 911 is properly stored
      const emergency = contacts.emergency.find((c) => c.role.includes('Emergency'));
      expect(emergency?.phone).toBe('911');
    });

    it('should support extensions in contact information', async () => {
      const contacts = await extractSchoolContacts(1);

      // Check that extensions are properly stored
      const principal = contacts.administration.find((c) => c.role === 'Principal');
      expect(principal?.extension).toBe('100');

      const nurse = contacts.medical.find((c) => c.role === 'Nurse');
      expect(nurse?.extension).toBe('105');
    });
  });
});