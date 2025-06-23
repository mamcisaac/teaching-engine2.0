import { describe, it, expect } from '@jest/globals';
import { 
  formatContactsForSubPlan, 
  getEmergencyContactsList,
  generateEmergencyContactCard,
  ExtractedContacts
} from '../../src/services/contactExtractor';

describe('ContactExtractor - Formatting Functions', () => {
  const mockContacts: ExtractedContacts = {
    emergency: [
      {
        id: 'emergency-911',
        name: 'Emergency Services',
        role: 'Emergency',
        phone: '911',
        availability: '24/7',
        priority: 'emergency',
        category: 'safety'
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
        priority: 'urgent',
        category: 'administration'
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
        priority: 'urgent',
        category: 'medical'
      }
    ],
    transportation: [],
    custom: []
  };

  describe('formatContactsForSubPlan', () => {
    it('should format contacts for substitute plan display', () => {
      const formatted = formatContactsForSubPlan(mockContacts);

      expect(formatted).toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('Emergency: Emergency Services - 911');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).toContain('Principal: Dr. Smith - 555-1234 ext. 100');
      expect(formatted).toContain('🏥 MEDICAL:');
      expect(formatted).toContain('School Nurse: Ms. Health - 555-5678');
    });

    it('should include sections only when contacts exist', () => {
      const partialContacts: ExtractedContacts = {
        emergency: [],
        administration: mockContacts.administration,
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: []
      };

      const formatted = formatContactsForSubPlan(partialContacts);

      expect(formatted).not.toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).not.toContain('💻 TECHNICAL SUPPORT:');
    });
  });

  describe('getEmergencyContactsList', () => {
    it('should return emergency contacts in simple format', () => {
      const emergencyList = getEmergencyContactsList(mockContacts);

      expect(emergencyList).toContain('Emergency: 911');
      expect(emergencyList).toContain('Principal: 555-1234 ext. 100');
      expect(emergencyList).toContain('School Nurse: 555-5678');
    });

    it('should return default message when no emergency contacts exist', () => {
      const emptyContacts: ExtractedContacts = {
        emergency: [],
        administration: [],
        support: [],
        technical: [],
        medical: [],
        transportation: [],
        custom: []
      };

      const emergencyList = getEmergencyContactsList(emptyContacts);
      expect(emergencyList).toBe('No emergency contacts configured. Contact main office.');
    });
  });

  describe('generateEmergencyContactCard', () => {
    it('should generate formatted emergency contact card', () => {
      const card = generateEmergencyContactCard(mockContacts);

      expect(card).toContain('┌─────────────────────────────────────┐');
      expect(card).toContain('│         EMERGENCY CONTACTS          │');
      expect(card).toContain('│ Emergency: 911');
      expect(card).toContain('│ FOR IMMEDIATE EMERGENCIES CALL 911  │');
      expect(card).toContain('└─────────────────────────────────────┘');
      expect(card).toContain('Keep this card visible at all times');
    });
  });
});