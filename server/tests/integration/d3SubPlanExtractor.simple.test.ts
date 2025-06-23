import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { extractScenarioTemplates, autoDetectScenario } from '../../src/services/scenarioTemplateExtractor';
import { formatContactsForSubPlan, getEmergencyContactsList, generateEmergencyContactCard, ExtractedContacts } from '../../src/services/contactExtractor';

describe('D3 Sub Plan Extractor - Simple Integration Tests', () => {
  describe('Scenario Template Extraction', () => {
    it('should extract scenario templates without conditions', async () => {
      const scenarios = await extractScenarioTemplates();

      expect(scenarios).toHaveProperty('scenarios');
      expect(scenarios).toHaveProperty('triggers');
      expect(scenarios).toHaveProperty('recommendedScenario');
      expect(scenarios.scenarios.length).toBeGreaterThan(0);

      // Check scenario structure
      const scenario = scenarios.scenarios[0];
      expect(scenario).toHaveProperty('id');
      expect(scenario).toHaveProperty('name');
      expect(scenario).toHaveProperty('procedures');
      expect(scenario).toHaveProperty('materials');
      expect(scenario).toHaveProperty('contacts');
      expect(scenario).toHaveProperty('template');
    });

    it('should detect weather scenario with conditions', async () => {
      const scenarios = await extractScenarioTemplates({
        weather: 'severe',
        technology: 'working',
        staffing: 'full',
        building: 'normal'
      });

      expect(scenarios.triggers).toContain('severe_weather');
      expect(scenarios.recommendedScenario?.id).toBe('severe_weather');
    });

    it('should detect technology failure scenario', async () => {
      const scenarios = await extractScenarioTemplates({
        weather: 'normal',
        technology: 'down',
        staffing: 'full',
        building: 'normal'
      });

      expect(scenarios.triggers).toContain('technology_failure');
      expect(scenarios.recommendedScenario?.id).toBe('technology_failure');
    });

    it('should prioritize lockdown scenario over others', async () => {
      const scenarios = await extractScenarioTemplates({
        weather: 'severe',
        technology: 'down',
        staffing: 'emergency',
        building: 'emergency'
      });

      expect(scenarios.triggers).toContain('severe_weather');
      expect(scenarios.triggers).toContain('technology_failure');
      expect(scenarios.triggers).toContain('staff_shortage');
      expect(scenarios.triggers).toContain('lockdown');
      // Lockdown should override other scenarios
      expect(scenarios.recommendedScenario?.id).toBe('lockdown');
    });
  });

  describe('Contact Extraction - Pure Functions', () => {
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
      medical: [],
      transportation: [],
      custom: []
    };

    it('should format contacts for substitute plan', () => {
      const formatted = formatContactsForSubPlan(mockContacts);

      expect(formatted).toContain('🚨 EMERGENCY CONTACTS:');
      expect(formatted).toContain('Emergency: Emergency Services - 911');
      expect(formatted).toContain('👥 ADMINISTRATION:');
      expect(formatted).toContain('Principal: Dr. Smith - 555-1234 ext. 100');
    });

    it('should get emergency contacts list', () => {
      const emergencyList = getEmergencyContactsList(mockContacts);

      expect(emergencyList).toContain('Emergency: 911');
      expect(emergencyList).toContain('Principal: 555-1234 ext. 100');
    });

    it('should generate emergency contact card', () => {
      const card = generateEmergencyContactCard(mockContacts);

      expect(card).toContain('┌─────────────────────────────────────┐');
      expect(card).toContain('│         EMERGENCY CONTACTS          │');
      expect(card).toContain('│ Emergency: 911');
      expect(card).toContain('│ FOR IMMEDIATE EMERGENCIES CALL 911  │');
      expect(card).toContain('└─────────────────────────────────────┘');
    });
  });
});