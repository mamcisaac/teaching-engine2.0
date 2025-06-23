import { jest, describe, it, beforeEach, expect } from '@jest/globals';
import { 
  extractSchoolContacts, 
  formatContactsForSubPlan, 
  getEmergencyContactsList,
  generateEmergencyContactCard,
  updateTeacherContacts
} from '../../src/services/contactExtractor';
import { prisma } from '../../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ContactExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractSchoolContacts', () => {
    it('should extract default contacts when no teacher preferences exist', async () => {
      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(null);

      const result = await extractSchoolContacts(1);

      expect(result).toHaveProperty('emergency');
      expect(result).toHaveProperty('administration');
      expect(result).toHaveProperty('support');
      expect(result).toHaveProperty('technical');
      expect(result).toHaveProperty('medical');
      expect(result).toHaveProperty('transportation');
      expect(result).toHaveProperty('custom');

      // Should have default emergency contacts
      expect(result.emergency.length).toBeGreaterThan(0);
      const emergencyContact = result.emergency.find(c => c.phone === '911');
      expect(emergencyContact).toBeDefined();

      // Should have default admin contacts
      expect(result.administration.length).toBeGreaterThan(0);
      const principalContact = result.administration.find(c => c.role === 'Principal');
      expect(principalContact).toBeDefined();

      // Should have default medical contacts
      expect(result.medical.length).toBeGreaterThan(0);
      const nurseContact = result.medical.find(c => c.role === 'Nurse');
      expect(nurseContact).toBeDefined();
    });

    it('should extract custom contacts from teacher preferences', async () => {
      const mockPreferences = {
        id: 1,
        subPlanContacts: {
          'Principal': 'Ms. Johnson - 555-1234 ext. 100',
          'Vice Principal': 'Mr. Smith - 555-1234 ext. 102',
          'Secretary': 'Mrs. Brown - 555-1234 ext. 101',
          'IT Support': 'Tech Team - 555-1234 ext. 150'
        }
      };

      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(mockPreferences as any);

      const result = await extractSchoolContacts(1);

      expect(result.custom.length).toBe(4);

      const principalContact = result.custom.find(c => c.role === 'Principal');
      expect(principalContact).toBeDefined();
      expect(principalContact?.name).toBe('Ms. Johnson');
      expect(principalContact?.phone).toBe('555-1234');
      expect(principalContact?.extension).toBe('100');
      expect(principalContact?.priority).toBe('urgent');
      expect(principalContact?.category).toBe('administration');

      const itContact = result.custom.find(c => c.role === 'IT Support');
      expect(itContact).toBeDefined();
      expect(itContact?.name).toBe('Tech Team');
      expect(itContact?.category).toBe('technical');
    });

    it('should handle malformed contact data gracefully', async () => {
      const mockPreferences = {
        id: 1,
        subPlanContacts: {
          'Principal': 'No phone number provided',
          'Office': '', // Empty string
          'Valid Contact': 'Ms. Smith - 555-1234'
        }
      };

      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(mockPreferences as any);

      const result = await extractSchoolContacts(1);

      // Should only include the valid contact
      expect(result.custom.length).toBe(1);
      expect(result.custom[0].role).toBe('Valid Contact');
      expect(result.custom[0].name).toBe('Ms. Smith');
    });

    it('should categorize contacts correctly', async () => {
      const mockPreferences = {
        id: 1,
        subPlanContacts: {
          'Principal': 'Dr. Johnson - 555-1234',
          'School Nurse': 'Ms. Health - 555-5678',
          'Custodian': 'Mr. Clean - 555-9012',
          'Bus Coordinator': 'Ms. Transport - 555-3456',
          'IT Technician': 'Mr. Tech - 555-7890'
        }
      };

      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(mockPreferences as any);

      const result = await extractSchoolContacts(1);

      // Check categorization
      const adminContacts = [...result.administration, ...result.custom.filter(c => c.category === 'administration')];
      const medicalContacts = [...result.medical, ...result.custom.filter(c => c.category === 'medical')];
      const supportContacts = [...result.support, ...result.custom.filter(c => c.category === 'support')];
      const transportContacts = [...result.transportation, ...result.custom.filter(c => c.category === 'transportation')];
      const techContacts = [...result.technical, ...result.custom.filter(c => c.category === 'technical')];

      expect(adminContacts.some(c => c.name === 'Dr. Johnson')).toBe(true);
      expect(medicalContacts.some(c => c.name === 'Ms. Health')).toBe(true);
      expect(supportContacts.some(c => c.name === 'Mr. Clean')).toBe(true);
      expect(transportContacts.some(c => c.name === 'Ms. Transport')).toBe(true);
      expect(techContacts.some(c => c.name === 'Mr. Tech')).toBe(true);
    });
  });

  describe('formatContactsForSubPlan', () => {
    it('should format contacts for substitute plan display', async () => {
      const mockContacts = {
        emergency: [
          {
            id: 'emergency-911',
            name: 'Emergency Services',
            role: 'Emergency',
            phone: '911',
            availability: '24/7',
            priority: 'emergency' as const,
            category: 'safety' as const
          }
        ],
        administration: [
          {
            id: 'admin-principal',
            name: 'Dr. Smith',
            role: 'Principal',
            phone: '555-1234',
            extension: '100',
            availability: 'School hours',
            priority: 'urgent' as const,
            category: 'administration' as const
          }
        ],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: []
      };

      const formatted = formatContactsForSubPlan(mockContacts);

      expect(formatted).toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('Emergency: Emergency Services - 911');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).toContain('Principal: Dr. Smith - 555-1234 ext. 100');
    });

    it('should include sections only when contacts exist', async () => {
      const mockContacts = {
        emergency: [],
        administration: [
          {
            id: 'admin-principal',
            name: 'Dr. Smith',
            role: 'Principal',
            phone: '555-1234',
            availability: 'School hours',
            priority: 'urgent' as const,
            category: 'administration' as const
          }
        ],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: []
      };

      const formatted = formatContactsForSubPlan(mockContacts);

      expect(formatted).not.toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).not.toContain('💻 TECHNICAL SUPPORT:');
    });
  });

  describe('getEmergencyContactsList', () => {
    it('should return emergency contacts in simple format', async () => {
      const mockContacts = {
        emergency: [
          {
            id: 'emergency-911',
            name: 'Emergency Services',
            role: 'Emergency',
            phone: '911',
            availability: '24/7',
            priority: 'emergency' as const,
            category: 'safety' as const
          }
        ],
        administration: [
          {
            id: 'admin-principal',
            name: 'Dr. Smith',
            role: 'Principal',
            phone: '555-1234',
            extension: '100',
            availability: 'School hours',
            priority: 'urgent' as const,
            category: 'administration' as const
          }
        ],
        support: [],
        technical: [],
        medical: [
          {
            id: 'medical-nurse',
            name: 'Ms. Health',
            role: 'School Nurse',
            phone: '555-5678',
            availability: 'School hours',
            priority: 'urgent' as const,
            category: 'medical' as const
          }
        ],
        transportation: [],
        custom: []
      };

      const emergencyList = getEmergencyContactsList(mockContacts);

      expect(emergencyList).toContain('Emergency: 911');
      expect(emergencyList).toContain('Principal: 555-1234 ext. 100');
      expect(emergencyList).toContain('School Nurse: 555-5678');
    });

    it('should return default message when no emergency contacts exist', async () => {
      const mockContacts = {
        emergency: [],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: []
      };

      const emergencyList = getEmergencyContactsList(mockContacts);

      expect(emergencyList).toBe('No emergency contacts configured. Contact main office.');
    });
  });

  describe('generateEmergencyContactCard', () => {
    it('should generate formatted emergency contact card', async () => {
      const mockContacts = {
        emergency: [
          {
            id: 'emergency-911',
            name: 'Emergency Services',
            role: 'Emergency',
            phone: '911',
            availability: '24/7',
            priority: 'emergency' as const,
            category: 'safety' as const
          }
        ],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: []
      };

      const card = generateEmergencyContactCard(mockContacts);

      expect(card).toContain('┌─────────────────────────────────────┐');
      expect(card).toContain('│         EMERGENCY CONTACTS          │');
      expect(card).toContain('│ Emergency: 911');
      expect(card).toContain('│ FOR IMMEDIATE EMERGENCIES CALL 911  │');
      expect(card).toContain('└─────────────────────────────────────┘');
      expect(card).toContain('Keep this card visible at all times');
    });
  });

  describe('updateTeacherContacts', () => {
    it('should create new teacher preferences when none exist', async () => {
      const contacts = [
        { name: 'Dr. Smith', role: 'Principal', phone: '555-1234', notes: 'Available 8-4' },
        { name: 'Ms. Jones', role: 'Secretary', phone: '555-5678' }
      ];

      mockPrisma.teacherPreferences.upsert.mockResolvedValue({
        id: 1,
        subPlanContacts: {
          'Principal': 'Dr. Smith - 555-1234 (Available 8-4)',
          'Secretary': 'Ms. Jones - 555-5678'
        }
      });

      await updateTeacherContacts(1, contacts);

      expect(mockPrisma.teacherPreferences.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: {
          id: 1,
          subPlanContacts: {
            'Principal': 'Dr. Smith - 555-1234 (Available 8-4)',
            'Secretary': 'Ms. Jones - 555-5678'
          }
        },
        update: {
          subPlanContacts: {
            'Principal': 'Dr. Smith - 555-1234 (Available 8-4)',
            'Secretary': 'Ms. Jones - 555-5678'
          }
        }
      });
    });

    it('should format contacts correctly with and without notes', async () => {
      const contacts = [
        { name: 'Dr. Smith', role: 'Principal', phone: '555-1234', notes: 'Emergency only' },
        { name: 'Ms. Jones', role: 'Secretary', phone: '555-5678' }
      ];

      await updateTeacherContacts(1, contacts);

      const call = mockPrisma.teacherPreferences.upsert.mock.calls[0][0];
      const expectedContacts = call.create.subPlanContacts;

      expect(expectedContacts['Principal']).toBe('Dr. Smith - 555-1234 (Emergency only)');
      expect(expectedContacts['Secretary']).toBe('Ms. Jones - 555-5678');
    });
  });

  describe('Contact Parsing', () => {
    it('should parse phone numbers in different formats', async () => {
      const mockPreferences = {
        id: 1,
        subPlanContacts: {
          'Contact1': 'Name1 - 555-123-4567',
          'Contact2': 'Name2 - 555.123.4567',
          'Contact3': 'Name3 - 555 123 4567',
          'Contact4': 'Name4 - 5551234567'
        }
      };

      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(mockPreferences as any);

      const result = await extractSchoolContacts(1);

      expect(result.custom).toHaveLength(4);
      result.custom.forEach(contact => {
        expect(contact.phone).toMatch(/555[-.\s]?123[-.\s]?456[7]?/);
      });
    });

    it('should parse extension numbers correctly', async () => {
      const mockPreferences = {
        id: 1,
        subPlanContacts: {
          'Contact1': 'Name1 - 555-1234 ext. 100',
          'Contact2': 'Name2 - 555-1234 ext 200',
          'Contact3': 'Name3 - 555-1234 extension 300'
        }
      };

      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(mockPreferences as any);

      const result = await extractSchoolContacts(1);

      expect(result.custom).toHaveLength(3);
      expect(result.custom[0].extension).toBe('100');
      expect(result.custom[1].extension).toBe('200');
      expect(result.custom[2].extension).toBe('300');
    });

    it('should extract names correctly', async () => {
      const mockPreferences = {
        id: 1,
        subPlanContacts: {
          'Principal': 'Dr. Sarah Johnson - 555-1234',
          'Secretary': 'Ms. Mary Smith - Office - 555-5678'
        }
      };

      mockPrisma.teacherPreferences.findFirst.mockResolvedValue(mockPreferences as any);

      const result = await extractSchoolContacts(1);

      expect(result.custom).toHaveLength(2);
      expect(result.custom[0].name).toBe('Dr. Sarah Johnson');
      expect(result.custom[1].name).toBe('Ms. Mary Smith - Office');
    });
  });
});