/**
 * Enhanced Contact Extractor Tests
 * Comprehensive testing for contact extraction service
 * Focuses on achieving 80%+ coverage with real-world scenarios
 */

import { jest } from '@jest/globals';
import {
  ContactInfo,
  ExtractedContacts,
  extractSchoolContacts,
  formatContactsForSubPlan,
  getEmergencyContactsList,
  generateEmergencyContactCard,
  updateTeacherContacts,
} from '../../src/services/contactExtractor';

// Mock console.warn to test the updateTeacherContacts function
const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Enhanced Contact Extractor Service', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('extractSchoolContacts - Comprehensive Testing', () => {
    it('should extract complete default school contact structure', async () => {
      const contacts = await extractSchoolContacts(1);

      // Verify all categories exist
      expect(contacts).toHaveProperty('emergency');
      expect(contacts).toHaveProperty('administration');
      expect(contacts).toHaveProperty('support');
      expect(contacts).toHaveProperty('technical');
      expect(contacts).toHaveProperty('medical');
      expect(contacts).toHaveProperty('transportation');
      expect(contacts).toHaveProperty('custom');

      // All should be arrays
      Object.values(contacts).forEach((category) => {
        expect(Array.isArray(category)).toBe(true);
      });

      // Should have default contacts
      expect(contacts.emergency.length).toBeGreaterThan(0);
      expect(contacts.administration.length).toBeGreaterThan(0);
    });

    it('should include all expected default contacts with correct properties', async () => {
      const contacts = await extractSchoolContacts(1);
      const allContacts = [
        ...contacts.emergency,
        ...contacts.administration,
        ...contacts.support,
        ...contacts.technical,
        ...contacts.medical,
        ...contacts.transportation,
      ];

      // Check for essential default contacts
      const emergency911 = allContacts.find((c) => c.phone === '911');
      expect(emergency911).toBeDefined();
      expect(emergency911?.role).toBe('Emergency (Fire/Police/Ambulance)');
      expect(emergency911?.priority).toBe('emergency');
      expect(emergency911?.category).toBe('safety');

      const principal = allContacts.find((c) => c.role === 'Principal');
      expect(principal).toBeDefined();
      expect(principal?.category).toBe('administration');
      expect(principal?.priority).toBe('urgent');

      const nurse = allContacts.find((c) => c.role === 'Nurse');
      expect(nurse).toBeDefined();
      expect(nurse?.category).toBe('medical');
      expect(nurse?.priority).toBe('urgent');

      // Verify all contacts have required fields
      allContacts.forEach((contact) => {
        expect(contact.id).toBeTruthy();
        expect(contact.name).toBeTruthy();
        expect(contact.role).toBeTruthy();
        expect(contact.phone).toBeTruthy();
        expect(contact.availability).toBeTruthy();
        expect(contact.priority).toBeTruthy();
        expect(contact.category).toBeTruthy();
      });
    });

    it('should handle different user IDs consistently', async () => {
      const contacts1 = await extractSchoolContacts(1);
      const contacts2 = await extractSchoolContacts(999);
      const contacts3 = await extractSchoolContacts(0);

      // All should return the same default structure
      expect(Object.keys(contacts1)).toEqual(Object.keys(contacts2));
      expect(Object.keys(contacts2)).toEqual(Object.keys(contacts3));

      // Should have consistent emergency contacts
      expect(contacts1.emergency.length).toBe(contacts2.emergency.length);
      expect(contacts2.emergency.length).toBe(contacts3.emergency.length);
    });

    it('should handle missing user ID parameter', async () => {
      const contactsWithoutUser = await extractSchoolContacts();
      const contactsWithUser = await extractSchoolContacts(1);

      // Should return same structure regardless
      expect(Object.keys(contactsWithoutUser)).toEqual(Object.keys(contactsWithUser));
      expect(contactsWithoutUser.emergency.length).toBe(contactsWithUser.emergency.length);
    });

    it('should categorize all contacts correctly', async () => {
      const contacts = await extractSchoolContacts(1);

      // Check emergency category
      contacts.emergency.forEach((contact) => {
        expect(contact.category).toBe('safety');
        expect(['emergency', 'urgent'].includes(contact.priority)).toBe(true);
      });

      // Check administration category
      contacts.administration.forEach((contact) => {
        expect(contact.category).toBe('administration');
        expect(['urgent', 'normal'].includes(contact.priority)).toBe(true);
      });

      // Check medical category
      contacts.medical.forEach((contact) => {
        expect(contact.category).toBe('medical');
        expect(['urgent', 'normal'].includes(contact.priority)).toBe(true);
      });

      // Check technical category
      contacts.technical.forEach((contact) => {
        expect(contact.category).toBe('technical');
        expect(['normal', 'info'].includes(contact.priority)).toBe(true);
      });

      // Check support category
      contacts.support.forEach((contact) => {
        expect(contact.category).toBe('support');
        expect(['normal', 'info'].includes(contact.priority)).toBe(true);
      });
    });

    it('should assign priority levels correctly', async () => {
      const contacts = await extractSchoolContacts(1);
      const allContacts = [
        ...contacts.emergency,
        ...contacts.administration,
        ...contacts.support,
        ...contacts.technical,
        ...contacts.medical,
        ...contacts.transportation,
      ];

      // Emergency contacts should have emergency priority
      const emergencyContacts = allContacts.filter((c) => c.priority === 'emergency');
      expect(emergencyContacts.length).toBeGreaterThan(0);
      emergencyContacts.forEach((contact) => {
        expect(contact.role.toLowerCase()).toMatch(/emergency|911/);
      });

      // Urgent contacts should include principal, nurse, office
      const urgentContacts = allContacts.filter((c) => c.priority === 'urgent');
      expect(urgentContacts.length).toBeGreaterThan(0);
      urgentContacts.forEach((contact) => {
        const role = contact.role.toLowerCase();
        expect(
          role.includes('principal') ||
            role.includes('nurse') ||
            role.includes('office') ||
            role.includes('security') ||
            role.includes('admin'),
        ).toBe(true);
      });

      // Normal priority contacts
      const normalContacts = allContacts.filter((c) => c.priority === 'normal');
      expect(normalContacts.length).toBeGreaterThan(0);
    });
  });

  describe('formatContactsForSubPlan - Advanced Formatting', () => {
    const createTestContacts = (): ExtractedContacts => ({
      emergency: [
        {
          id: 'emergency-1',
          name: 'Emergency Services',
          role: 'Emergency Response',
          phone: '911',
          availability: '24/7',
          priority: 'emergency',
          category: 'safety',
        },
        {
          id: 'emergency-2',
          name: 'School Security',
          role: 'Security Officer',
          phone: '416-555-SAFE',
          extension: '911',
          location: 'Main Entrance',
          availability: 'School hours',
          priority: 'urgent',
          category: 'safety',
        },
      ],
      administration: [
        {
          id: 'admin-1',
          name: 'Dr. Sarah Johnson',
          role: 'Principal',
          phone: '416-555-1234',
          extension: '100',
          location: 'Main Office',
          availability: 'School hours',
          priority: 'urgent',
          category: 'administration',
        },
        {
          id: 'admin-2',
          name: 'Michael Chen',
          role: 'Vice Principal',
          phone: '416-555-1234',
          extension: '101',
          availability: 'School hours',
          priority: 'urgent',
          category: 'administration',
        },
      ],
      support: [
        {
          id: 'support-1',
          name: 'Maria Santos',
          role: 'Office Secretary',
          phone: '416-555-1234',
          extension: '102',
          location: 'Main Office',
          availability: '8:00 AM - 4:00 PM',
          priority: 'normal',
          category: 'support',
        },
      ],
      technical: [
        {
          id: 'tech-1',
          name: 'David Kim',
          role: 'Technology Support',
          phone: '416-555-TECH',
          extension: '200',
          availability: 'Weekdays 9-3',
          priority: 'normal',
          category: 'technical',
        },
      ],
      medical: [
        {
          id: 'medical-1',
          name: 'Nurse Patricia',
          role: 'School Nurse',
          phone: '416-555-1234',
          extension: '105',
          location: 'Health Office',
          availability: 'School hours',
          priority: 'urgent',
          category: 'medical',
        },
      ],
      transportation: [
        {
          id: 'transport-1',
          name: 'Bus Coordinator',
          role: 'Transportation Office',
          phone: '416-555-BUSS',
          availability: '7:00 AM - 5:00 PM',
          priority: 'normal',
          category: 'transportation',
        },
      ],
      custom: [
        {
          id: 'custom-1',
          name: 'Parent Volunteer',
          role: 'Library Helper',
          phone: '416-555-5678',
          availability: 'Tuesday mornings',
          priority: 'info',
          category: 'support',
        },
      ],
    });

    it('should format all contact sections correctly', () => {
      const testContacts = createTestContacts();
      const formatted = formatContactsForSubPlan(testContacts);

      // Check section headers
      expect(formatted).toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).toContain('🤝 SUPPORT STAFF:');
      expect(formatted).toContain('💻 TECHNICAL SUPPORT:');
      expect(formatted).toContain('🏥 MEDICAL:');
      expect(formatted).toContain('🚌 TRANSPORTATION:');
      expect(formatted).toContain('📞 ADDITIONAL CONTACTS:');
    });

    it('should format contact details with all possible fields', () => {
      const testContacts = createTestContacts();
      const formatted = formatContactsForSubPlan(testContacts);

      // Emergency with basic info
      expect(formatted).toContain('Emergency Response: Emergency Services - 911 [24/7]');

      // Contact with extension and location
      expect(formatted).toContain(
        'Security Officer: School Security - 416-555-SAFE ext. 911 (Main Entrance) [School hours]',
      );

      // Principal with standard format
      expect(formatted).toContain(
        'Principal: Dr. Sarah Johnson - 416-555-1234 ext. 100 (Main Office)',
      );

      // Secretary with custom availability
      expect(formatted).toContain(
        'Office Secretary: Maria Santos - 416-555-1234 ext. 102 (Main Office) [8:00 AM - 4:00 PM]',
      );

      // Contact without location but with custom availability
      expect(formatted).toContain(
        'Technology Support: David Kim - 416-555-TECH ext. 200 [Weekdays 9-3]',
      );

      // Transportation without extension
      expect(formatted).toContain(
        'Transportation Office: Bus Coordinator - 416-555-BUSS [7:00 AM - 5:00 PM]',
      );

      // Custom contact
      expect(formatted).toContain(
        'Library Helper: Parent Volunteer - 416-555-5678 [Tuesday mornings]',
      );
    });

    it('should handle sections with no contacts', () => {
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

    it('should handle partial contact sections', () => {
      const partialContacts: ExtractedContacts = {
        emergency: [
          {
            id: 'emergency-only',
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

      const formatted = formatContactsForSubPlan(partialContacts);
      expect(formatted).toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('Emergency Services: Emergency - 911 [24/7]');
      expect(formatted).not.toContain('ADMINISTRATION:');
      expect(formatted).not.toContain('SUPPORT STAFF:');
    });

    it('should handle contacts with minimal information', () => {
      const minimalContacts: ExtractedContacts = {
        emergency: [],
        administration: [
          {
            id: 'minimal',
            name: 'Contact Name',
            role: 'Contact Role',
            phone: '416-555-0000',
            availability: 'School hours',
            priority: 'normal',
            category: 'administration',
          },
        ],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const formatted = formatContactsForSubPlan(minimalContacts);
      expect(formatted).toContain('Contact Role: Contact Name - 416-555-0000');
      expect(formatted).not.toContain('[School hours]'); // Default availability not shown
    });

    it('should not show default availability text', () => {
      const testContacts = createTestContacts();
      const formatted = formatContactsForSubPlan(testContacts);

      // School hours is default and should not appear in brackets
      const schoolHoursCount = (formatted.match(/\[School hours\]/g) || []).length;
      const totalSchoolHoursContacts = 4; // Principal, VP, Security, Nurse have school hours
      expect(schoolHoursCount).toBe(1); // Only Security should show it because it has location too
    });
  });

  describe('getEmergencyContactsList - Emergency Filtering', () => {
    const createEmergencyTestContacts = (): ExtractedContacts => ({
      emergency: [
        {
          id: 'emergency-1',
          name: 'Emergency Services',
          role: 'Emergency Response',
          phone: '911',
          availability: '24/7',
          priority: 'emergency',
          category: 'safety',
        },
        {
          id: 'emergency-2',
          name: 'Fire Department',
          role: 'Fire Emergency',
          phone: '416-555-FIRE',
          availability: '24/7',
          priority: 'emergency',
          category: 'safety',
        },
      ],
      administration: [
        {
          id: 'admin-urgent',
          name: 'Principal Smith',
          role: 'Principal',
          phone: '416-555-1234',
          extension: '100',
          availability: 'School hours',
          priority: 'urgent',
          category: 'administration',
        },
        {
          id: 'admin-normal',
          name: 'Secretary Jones',
          role: 'Secretary',
          phone: '416-555-1234',
          extension: '102',
          availability: 'School hours',
          priority: 'normal',
          category: 'administration',
        },
      ],
      medical: [
        {
          id: 'medical-urgent',
          name: 'Nurse Williams',
          role: 'School Nurse',
          phone: '416-555-1234',
          extension: '105',
          availability: 'School hours',
          priority: 'urgent',
          category: 'medical',
        },
      ],
      support: [
        {
          id: 'support-normal',
          name: 'Custodian Brown',
          role: 'Custodian',
          phone: '416-555-1234',
          extension: '300',
          availability: 'School hours',
          priority: 'normal',
          category: 'support',
        },
      ],
      technical: [],
      transportation: [],
      custom: [],
    });

    it('should filter emergency and urgent priority contacts only', () => {
      const contacts = createEmergencyTestContacts();
      const emergencyList = getEmergencyContactsList(contacts);

      // Should include emergency contacts
      expect(emergencyList).toContain('Emergency Response: 911');
      expect(emergencyList).toContain('Fire Emergency: 416-555-FIRE');

      // Should include urgent contacts
      expect(emergencyList).toContain('Principal: 416-555-1234 ext. 100');
      expect(emergencyList).toContain('School Nurse: 416-555-1234 ext. 105');

      // Should NOT include normal priority contacts
      expect(emergencyList).not.toContain('Secretary:');
      expect(emergencyList).not.toContain('Custodian:');
    });

    it('should format phone numbers with extensions correctly', () => {
      const contacts = createEmergencyTestContacts();
      const emergencyList = getEmergencyContactsList(contacts);

      expect(emergencyList).toContain('ext. 100');
      expect(emergencyList).toContain('ext. 105');
    });

    it('should handle contacts without extensions', () => {
      const contacts = createEmergencyTestContacts();
      const emergencyList = getEmergencyContactsList(contacts);

      expect(emergencyList).toContain('Emergency Response: 911');
      expect(emergencyList).toContain('Fire Emergency: 416-555-FIRE');
    });

    it('should return default message when no emergency contacts exist', () => {
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

    it('should handle contacts with only normal priority', () => {
      const normalOnlyContacts: ExtractedContacts = {
        emergency: [],
        administration: [
          {
            id: 'normal-admin',
            name: 'Normal Contact',
            role: 'Office Assistant',
            phone: '416-555-1234',
            availability: 'School hours',
            priority: 'normal',
            category: 'administration',
          },
        ],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const result = getEmergencyContactsList(normalOnlyContacts);
      expect(result).toBe('No emergency contacts configured. Contact main office.');
    });
  });

  describe('generateEmergencyContactCard - Card Generation', () => {
    it('should generate properly formatted emergency contact card', () => {
      const testContacts: ExtractedContacts = {
        emergency: [
          {
            id: 'emergency-1',
            name: 'Emergency Services',
            role: 'Emergency Response',
            phone: '911',
            availability: '24/7',
            priority: 'emergency',
            category: 'safety',
          },
        ],
        administration: [
          {
            id: 'admin-1',
            name: 'Principal',
            role: 'Principal',
            phone: '416-555-1234',
            extension: '100',
            availability: 'School hours',
            priority: 'urgent',
            category: 'administration',
          },
        ],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const card = generateEmergencyContactCard(testContacts);

      // Check box drawing characters
      expect(card).toContain('┌─────────────────────────────────────┐');
      expect(card).toContain('│         EMERGENCY CONTACTS          │');
      expect(card).toContain('├─────────────────────────────────────┤');
      expect(card).toContain('└─────────────────────────────────────┘');

      // Check content
      expect(card).toContain('Emergency Response: 911');
      expect(card).toContain('Principal: 416-555-1234 ext. 100');
      expect(card).toContain('FOR IMMEDIATE EMERGENCIES CALL 911');
      expect(card).toContain('Keep this card visible at all times');
    });

    it('should handle card with no contacts', () => {
      const emptyContacts: ExtractedContacts = {
        emergency: [],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const card = generateEmergencyContactCard(emptyContacts);

      // Should still have structure
      expect(card).toContain('EMERGENCY CONTACTS');
      expect(card).toContain('No emergency contacts configured. Contact main office.');
      expect(card).toContain('FOR IMMEDIATE EMERGENCIES CALL 911');
    });

    it('should format multiple emergency contacts', () => {
      const multipleEmergencyContacts: ExtractedContacts = {
        emergency: [
          {
            id: 'emergency-1',
            name: 'Emergency Services',
            role: 'Emergency Response',
            phone: '911',
            availability: '24/7',
            priority: 'emergency',
            category: 'safety',
          },
          {
            id: 'emergency-2',
            name: 'Fire Department',
            role: 'Fire Emergency',
            phone: '416-555-FIRE',
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

      const card = generateEmergencyContactCard(multipleEmergencyContacts);

      expect(card).toContain('Emergency Response: 911');
      expect(card).toContain('Fire Emergency: 416-555-FIRE');
    });
  });

  describe('updateTeacherContacts - Disabled Functionality', () => {
    it('should warn about disabled functionality and not process contacts', async () => {
      const testContacts = [
        { name: 'Test Contact 1', role: 'Principal', phone: '416-555-1234' },
        { name: 'Test Contact 2', role: 'Secretary', phone: '416-555-5678' },
      ];

      await updateTeacherContacts(1, testContacts);

      expect(consoleSpy).toHaveBeenCalledWith(
        'updateTeacherContacts is disabled - teacherPreferences model archived',
      );
    });

    it('should handle different user IDs and contact arrays', async () => {
      const testScenarios = [
        { userId: 1, contacts: [] },
        { userId: 999, contacts: [{ name: 'Single Contact', role: 'Test', phone: '911' }] },
        {
          userId: 0,
          contacts: [
            { name: 'Contact 1', role: 'Role 1', phone: '416-555-1111' },
            { name: 'Contact 2', role: 'Role 2', phone: '416-555-2222' },
            { name: 'Contact 3', role: 'Role 3', phone: '416-555-3333' },
          ],
        },
      ];

      for (const scenario of testScenarios) {
        consoleSpy.mockClear();
        await updateTeacherContacts(scenario.userId, scenario.contacts);
        expect(consoleSpy).toHaveBeenCalledWith(
          'updateTeacherContacts is disabled - teacherPreferences model archived',
        );
      }
    });

    it('should handle various contact formats without processing', async () => {
      const complexContacts = [
        { name: 'Dr. Sarah Johnson', role: 'Principal', phone: '416-555-1234' },
        { name: 'María González', role: 'Vice Principal', phone: '(416) 555-5678' },
        { name: 'Emergency Contact', role: 'Emergency', phone: '911' },
        { name: 'Tech Support', role: 'IT Specialist', phone: '+1-416-555-TECH' },
      ];

      await updateTeacherContacts(42, complexContacts);

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        'updateTeacherContacts is disabled - teacherPreferences model archived',
      );
    });
  });

  describe('Internal Function Coverage - Real Implementation Testing', () => {
    it('should validate default contacts structure and content', async () => {
      const contacts = await extractSchoolContacts(1);

      // Verify specific expected default contacts exist
      const expectedContacts = [
        { role: 'Emergency (Fire/Police/Ambulance)', category: 'safety', phone: '911' },
        { role: 'Main Office', category: 'administration' },
        { role: 'Principal', category: 'administration' },
        { role: 'Vice Principal', category: 'administration' },
        { role: 'Nurse', category: 'medical' },
        { role: 'Custodian', category: 'support' },
        { role: 'Technology Support', category: 'technical' },
      ];

      const allContacts = [
        ...contacts.emergency,
        ...contacts.administration,
        ...contacts.support,
        ...contacts.technical,
        ...contacts.medical,
        ...contacts.transportation,
        ...contacts.custom,
      ];

      expectedContacts.forEach((expected) => {
        const found = allContacts.find(
          (contact) => contact.role === expected.role && contact.category === expected.category,
        );
        expect(found).toBeDefined();
        if (expected.phone) {
          expect(found?.phone).toBe(expected.phone);
        }
      });
    });

    it('should handle async operations correctly', async () => {
      const start = Date.now();

      // Test multiple concurrent calls
      const promises = [
        extractSchoolContacts(1),
        extractSchoolContacts(2),
        extractSchoolContacts(3),
      ];

      const results = await Promise.all(promises);
      const elapsed = Date.now() - start;

      // All should complete successfully
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.emergency).toBeDefined();
        expect(result.administration).toBeDefined();
      });

      // Should complete reasonably quickly (async function should not hang)
      expect(elapsed).toBeLessThan(1000);
    });

    it('should maintain contact data integrity across calls', async () => {
      const contacts1 = await extractSchoolContacts(1);
      const contacts2 = await extractSchoolContacts(1);

      // Should return identical data
      expect(contacts1.emergency.length).toBe(contacts2.emergency.length);
      expect(contacts1.administration.length).toBe(contacts2.administration.length);

      // Emergency contact should be consistent
      const emergency1 = contacts1.emergency.find((c) => c.phone === '911');
      const emergency2 = contacts2.emergency.find((c) => c.phone === '911');

      expect(emergency1).toEqual(emergency2);
    });

    it('should test contact formatting edge cases', () => {
      const edgeCaseContacts: ExtractedContacts = {
        emergency: [
          {
            id: 'edge-1',
            name: '',
            role: 'Empty Name Test',
            phone: '911',
            availability: '',
            priority: 'emergency',
            category: 'safety',
          },
        ],
        administration: [
          {
            id: 'edge-2',
            name: 'Very Long Name That Exceeds Normal Length Expectations',
            role: 'Long Role Description That Also Exceeds Normal Expectations',
            phone: '416-555-1234',
            extension: '12345',
            location: 'Very Long Location Description That Could Cause Formatting Issues',
            availability: 'Very Long Availability Description That Could Also Cause Issues',
            priority: 'urgent',
            category: 'administration',
          },
        ],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: [],
      };

      const formatted = formatContactsForSubPlan(edgeCaseContacts);

      // Should handle empty names gracefully
      expect(formatted).toContain('Empty Name Test:');

      // Should handle long descriptions
      expect(formatted).toContain('Very Long Name That Exceeds Normal Length Expectations');
      expect(formatted).toContain('ext. 12345');
    });
  });

  describe('Contact Priority and Category Logic Validation', () => {
    it('should correctly implement priority determination logic', async () => {
      const contacts = await extractSchoolContacts(1);
      const allContacts = [
        ...contacts.emergency,
        ...contacts.administration,
        ...contacts.support,
        ...contacts.technical,
        ...contacts.medical,
        ...contacts.transportation,
      ];

      // Test specific priority assignments
      allContacts.forEach((contact) => {
        const role = contact.role.toLowerCase();

        if (role.includes('emergency') || role.includes('911')) {
          expect(contact.priority).toBe('emergency');
        } else if (
          role.includes('principal') ||
          role.includes('nurse') ||
          role.includes('security') ||
          role.includes('office') ||
          role.includes('secretary') ||
          role.includes('admin')
        ) {
          expect(contact.priority).toBe('urgent');
        } else {
          expect(['normal', 'info'].includes(contact.priority)).toBe(true);
        }
      });
    });

    it('should correctly implement category determination logic', async () => {
      const contacts = await extractSchoolContacts(1);
      const allContacts = [
        ...contacts.emergency,
        ...contacts.administration,
        ...contacts.support,
        ...contacts.technical,
        ...contacts.medical,
        ...contacts.transportation,
      ];

      // Test specific category assignments
      allContacts.forEach((contact) => {
        const role = contact.role.toLowerCase();

        if (role.includes('emergency') || role.includes('security') || role.includes('safety')) {
          expect(contact.category).toBe('safety');
        } else if (role.includes('principal') || role.includes('vice') || role.includes('admin')) {
          expect(contact.category).toBe('administration');
        } else if (role.includes('nurse') || role.includes('health') || role.includes('medical')) {
          expect(contact.category).toBe('medical');
        } else if (role.includes('it') || role.includes('tech') || role.includes('computer')) {
          expect(contact.category).toBe('technical');
        } else if (role.includes('bus') || role.includes('transport')) {
          expect(contact.category).toBe('transportation');
        } else {
          expect(['administration', 'support'].includes(contact.category)).toBe(true);
        }
      });
    });
  });
});
