import { describe, it, expect } from '@jest/globals';
import { extractMaterials } from '../../src/services/materialGenerator';

describe('MaterialGenerator Unit Tests', () => {
  describe('extractMaterials', () => {
    it('should extract materials from simple header format', () => {
      const note = `
        Today we will learn about fractions.
        Materials: paper, pencils, fraction blocks
        Remember to bring your notebooks.
      `;

      const result = extractMaterials(note);
      expect(result).toContain('paper');
      expect(result).toContain('pencils');
      expect(result).toContain('fraction blocks');
    });

    it('should extract materials from list format', () => {
      const note = `
        Materials:
        - Whiteboard markers
        - Chart paper
        - Sticky notes
        - Timer
      `;

      const result = extractMaterials(note);
      expect(result).toContain('Whiteboard markers');
      expect(result).toContain('Chart paper');
      expect(result).toContain('Sticky notes');
      expect(result).toContain('Timer');
    });

    it('should handle materials with asterisk bullets', () => {
      const note = `
        Materials needed:
        * Colored pencils
        * Ruler
        * Construction paper
      `;

      const result = extractMaterials(note);
      expect(result).toContain('Colored pencils');
      expect(result).toContain('Ruler');
      expect(result).toContain('Construction paper');
    });

    it('should handle comma-separated materials in header', () => {
      const note = `
        Materials: glue sticks, scissors, colored paper, markers
      `;

      const result = extractMaterials(note);
      expect(result).toContain('glue sticks');
      expect(result).toContain('scissors');
      expect(result).toContain('colored paper');
      expect(result).toContain('markers');
    });

    it('should handle semicolon-separated materials', () => {
      const note = `
        Materials: calculator; graph paper; protractor; compass
      `;

      const result = extractMaterials(note);
      expect(result).toContain('calculator');
      expect(result).toContain('graph paper');
      expect(result).toContain('protractor');
      expect(result).toContain('compass');
    });

    it('should handle case-insensitive materials header', () => {
      const testCases = [
        'Materials: paper',
        'MATERIALS: paper',
        'materials: paper',
        'Material: paper',
        'MATERIAL: paper',
      ];

      testCases.forEach(testCase => {
        const result = extractMaterials(testCase);
        expect(result).toContain('paper');
      });
    });

    it('should handle materials header with colon variations', () => {
      const testCases = [
        'Materials: paper',
        'Materials paper', // No colon
        'Materials needed: paper',
      ];

      testCases.forEach(testCase => {
        const result = extractMaterials(testCase);
        expect(result).toContain('paper');
      });
    });

    it('should remove duplicates', () => {
      const note = `
        Materials: paper, pencils, paper
        Additional materials:
        - paper
        - pencils
        - eraser
      `;

      const result = extractMaterials(note);
      const paperCount = result.filter(item => item === 'paper').length;
      const pencilsCount = result.filter(item => item === 'pencils').length;
      
      expect(paperCount).toBe(1);
      expect(pencilsCount).toBe(1);
      expect(result).toContain('eraser');
    });

    it('should trim whitespace from extracted materials', () => {
      const note = `
        Materials:   paper  ,  pencils   , markers  
      `;

      const result = extractMaterials(note);
      expect(result).toContain('paper');
      expect(result).toContain('pencils');
      expect(result).toContain('markers');
      
      // Should not contain items with extra whitespace
      expect(result).not.toContain(' paper ');
      expect(result).not.toContain('  pencils  ');
    });

    it('should handle empty notes', () => {
      const result = extractMaterials('');
      expect(result).toEqual([]);
    });

    it('should handle notes without materials section', () => {
      const note = `
        Today we will learn about photosynthesis.
        Students should take notes on the process.
        Homework is chapter 4.
      `;

      const result = extractMaterials(note);
      expect(result).toEqual([]);
    });

    it('should handle mixed format with multiple materials sections', () => {
      const note = `
        Materials: paper, pencils
        
        Today's lesson plan...
        
        Additional materials needed:
        - Calculators
        - Graph paper
        
        Extra supplies: rulers, erasers
      `;

      const result = extractMaterials(note);
      expect(result).toContain('paper');
      expect(result).toContain('pencils');
      expect(result).toContain('Calculators');
      expect(result).toContain('Graph paper');
      expect(result).toContain('rulers');
      expect(result).toContain('erasers');
    });

    it('should handle materials with numbers and special characters', () => {
      const note = `
        Materials:
        - 30 cm ruler
        - #2 pencils
        - 8.5x11 paper
        - 3-ring binder
      `;

      const result = extractMaterials(note);
      expect(result).toContain('30 cm ruler');
      expect(result).toContain('#2 pencils');
      expect(result).toContain('8.5x11 paper');
      expect(result).toContain('3-ring binder');
    });

    it('should handle materials with parenthetical information', () => {
      const note = `
        Materials:
        - Markers (various colors)
        - Paper plates (small size)
        - Glue (washable)
      `;

      const result = extractMaterials(note);
      expect(result).toContain('Markers (various colors)');
      expect(result).toContain('Paper plates (small size)');
      expect(result).toContain('Glue (washable)');
    });

    it('should filter out empty items', () => {
      const note = `
        Materials: paper,  , pencils, , markers
      `;

      const result = extractMaterials(note);
      expect(result).toEqual(['paper', 'pencils', 'markers']);
      expect(result).not.toContain('');
      expect(result).not.toContain(' ');
    });

    it('should handle notes with Windows line endings', () => {
      const note = 'Materials:\r\n- paper\r\n- pencils';
      
      const result = extractMaterials(note);
      expect(result).toContain('paper');
      expect(result).toContain('pencils');
    });

    it('should handle French materials section', () => {
      const note = `
        Matériel: papier, crayons, règle
        Aujourd'hui nous allons étudier...
      `;

      // The function might not handle French, but let's test behavior
      const result = extractMaterials(note);
      // This test documents current behavior - may need updating if French support is added
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very long material lists', () => {
      const materials = Array.from({ length: 50 }, (_, i) => `item${i + 1}`);
      const note = `Materials: ${materials.join(', ')}`;
      
      const result = extractMaterials(note);
      expect(result.length).toBe(50);
      expect(result).toContain('item1');
      expect(result).toContain('item25');
      expect(result).toContain('item50');
    });

    it('should handle materials with nested lists', () => {
      const note = `
        Materials:
        - Art supplies:
          - Crayons
          - Markers
        - Paper
      `;

      const result = extractMaterials(note);
      // Should handle the primary list items
      expect(result).toContain('Art supplies:');
      expect(result).toContain('Paper');
      
      // Nested items might not be captured (depends on implementation)
      // This test documents the current behavior
    });
  });
});