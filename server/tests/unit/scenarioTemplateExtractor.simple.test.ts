import { describe, it, expect } from '@jest/globals';
import { 
  getScenarioById, 
  generateScenarioContent 
} from '../../src/services/scenarioTemplateExtractor';

describe('ScenarioTemplateExtractor - Pure Functions', () => {
  describe('getScenarioById', () => {
    it('should return correct scenario by ID', () => {
      const scenario = getScenarioById('technology_failure');

      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('technology_failure');
      expect(scenario?.name).toBe('Technology Failure Plan');
      expect(scenario?.procedures).toContain('Do not attempt to fix technical equipment');
      expect(scenario?.materials).toContain('Printed worksheets and activities (in blue folder)');
    });

    it('should return lockdown scenario with security procedures', () => {
      const scenario = getScenarioById('lockdown');

      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('lockdown');
      expect(scenario?.name).toBe('Lockdown/Security Plan');
      expect(scenario?.procedures).toContain('Follow school lockdown procedures immediately');
      expect(scenario?.procedures).toContain('Lock classroom door and turn off lights');
      expect(scenario?.template).toContain('LOCKDOWN PROCEDURES');
    });

    it('should return severe weather scenario', () => {
      const scenario = getScenarioById('severe_weather');

      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('severe_weather');
      expect(scenario?.name).toBe('Severe Weather Plan');
      expect(scenario?.procedures).toContain('Monitor weather announcements throughout the day');
      expect(scenario?.modifications.schedule).toContain('Cancel any outdoor activities or field trips');
    });

    it('should return staff shortage scenario', () => {
      const scenario = getScenarioById('staff_shortage');

      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('staff_shortage');
      expect(scenario?.name).toBe('Staff Shortage Plan');
      expect(scenario?.procedures).toContain('Check with office for class combinations or room changes');
      expect(scenario?.materials).toContain('Large group activity supplies');
    });

    it('should return undefined for non-existent scenario', () => {
      const scenario = getScenarioById('non_existent_scenario');
      expect(scenario).toBeUndefined();
    });
  });

  describe('generateScenarioContent', () => {
    it('should replace template variables correctly', () => {
      const scenario = getScenarioById('general_emergency');
      expect(scenario).toBeDefined();

      const content = generateScenarioContent(
        scenario!,
        'Ms. Johnson',
        'Grade 3A'
      );

      expect(content).toContain('Ms. Johnson');
      expect(content).toContain('Grade 3A');
      expect(content).toContain(new Date().toLocaleDateString());
      expect(content).toContain('EMERGENCY SUBSTITUTE PLAN');
    });

    it('should handle missing teacher name and class name', () => {
      const scenario = getScenarioById('general_emergency');
      expect(scenario).toBeDefined();

      const content = generateScenarioContent(scenario!);

      expect(content).toContain('[Teacher Name]');
      expect(content).toContain('[Class Name]');
      expect(content).toContain(new Date().toLocaleDateString());
    });

    it('should generate technology failure template correctly', () => {
      const scenario = getScenarioById('technology_failure');
      expect(scenario).toBeDefined();

      const content = generateScenarioContent(
        scenario!,
        'Mr. Smith',
        'Grade 5B'
      );

      expect(content).toContain('TECHNOLOGY FAILURE SUBSTITUTE PLAN');
      expect(content).toContain('Mr. Smith');
      expect(content).toContain('Grade 5B');
      expect(content).toContain('TECHNOLOGY ALERT');
      expect(content).toContain('Do NOT attempt to fix any technology');
    });

    it('should generate severe weather template correctly', () => {
      const scenario = getScenarioById('severe_weather');
      expect(scenario).toBeDefined();

      const content = generateScenarioContent(
        scenario!,
        'Ms. Brown',
        'Kindergarten'
      );

      expect(content).toContain('SEVERE WEATHER SUBSTITUTE PLAN');
      expect(content).toContain('Ms. Brown');
      expect(content).toContain('Kindergarten');
      expect(content).toContain('WEATHER ALERT');
      expect(content).toContain('Keep students away from windows');
    });

    it('should generate lockdown template correctly', () => {
      const scenario = getScenarioById('lockdown');
      expect(scenario).toBeDefined();

      const content = generateScenarioContent(scenario!);

      expect(content).toContain('LOCKDOWN PROCEDURES');
      expect(content).toContain('THIS IS A LOCKDOWN SITUATION');
      expect(content).toContain('Lock door, turn off lights');
      expect(content).toContain('DO NOT:');
      expect(content).toContain('Open door for anyone');
    });

    it('should generate staff shortage template correctly', () => {
      const scenario = getScenarioById('staff_shortage');
      expect(scenario).toBeDefined();

      const content = generateScenarioContent(scenario!);

      expect(content).toContain('STAFF SHORTAGE SUBSTITUTE PLAN');
      expect(content).toContain('MULTIPLE STAFF ABSENT');
      expect(content).toContain('LARGE GROUP MANAGEMENT');
      expect(content).toContain('Higher supervision needed');
    });
  });

  describe('Scenario Content Validation', () => {
    it('should ensure all scenarios have required properties', () => {
      const scenarios = [
        'general_emergency',
        'technology_failure',
        'severe_weather',
        'lockdown',
        'staff_shortage'
      ];

      scenarios.forEach(scenarioId => {
        const scenario = getScenarioById(scenarioId);
        expect(scenario).toBeDefined();
        expect(scenario).toHaveProperty('id');
        expect(scenario).toHaveProperty('name');
        expect(scenario).toHaveProperty('description');
        expect(scenario).toHaveProperty('procedures');
        expect(scenario).toHaveProperty('materials');
        expect(scenario).toHaveProperty('contacts');
        expect(scenario).toHaveProperty('modifications');
        expect(scenario).toHaveProperty('template');

        // Validate procedures array
        expect(scenario!.procedures).toBeInstanceOf(Array);
        expect(scenario!.procedures.length).toBeGreaterThan(0);

        // Validate materials array
        expect(scenario!.materials).toBeInstanceOf(Array);
        expect(scenario!.materials.length).toBeGreaterThan(0);

        // Validate contacts array
        expect(scenario!.contacts).toBeInstanceOf(Array);
        expect(scenario!.contacts.length).toBeGreaterThan(0);

        // Validate modifications structure
        expect(scenario!.modifications).toHaveProperty('schedule');
        expect(scenario!.modifications).toHaveProperty('activities');
        expect(scenario!.modifications).toHaveProperty('safety');
        expect(scenario!.modifications.schedule).toBeInstanceOf(Array);
        expect(scenario!.modifications.activities).toBeInstanceOf(Array);
        expect(scenario!.modifications.safety).toBeInstanceOf(Array);

        // Validate template is non-empty string
        expect(typeof scenario!.template).toBe('string');
        expect(scenario!.template.length).toBeGreaterThan(0);
      });
    });

    it('should ensure emergency contacts include 911', () => {
      const scenarios = [
        'general_emergency',
        'technology_failure',
        'severe_weather',
        'lockdown',
        'staff_shortage'
      ];

      scenarios.forEach(scenarioId => {
        const scenario = getScenarioById(scenarioId);
        const hasEmergencyContact = scenario!.contacts.some(
          contact => contact.number === '911' || contact.role.toLowerCase().includes('emergency')
        );
        expect(hasEmergencyContact).toBe(true);
      });
    });
  });
});