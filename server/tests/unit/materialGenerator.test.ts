import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  extractMaterials,
  generateMaterialList,
  updateMaterialList,
  generateMaterialDetails,
  zipWeeklyPrintables,
} from '../../src/services/materialGenerator';

describe('MaterialGenerator', () => {
  beforeEach(() => {
    // Suppress console.warn for cleaner test output
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('extractMaterials', () => {
    describe('basic material extraction', () => {
      it('should extract materials from simple materials line', () => {
        const note = 'Materials: chart paper, markers, scissors';
        const result = extractMaterials(note);
        expect(result).toEqual(['chart paper', 'markers', 'scissors']);
      });

      it('should extract materials with different header formats', () => {
        const cases = [
          'Materials: item1, item2',
          'Materials needed: item1, item2',
          'Additional materials: item1, item2',
          'Extra supplies: item1, item2',
          'Supplies: item1, item2',
        ];

        cases.forEach((note) => {
          const result = extractMaterials(note);
          expect(result).toEqual(['item1', 'item2']);
        });
      });

      it('should handle case-insensitive headers', () => {
        const note = 'MATERIALS: paper, PENCILS';
        const result = extractMaterials(note);
        expect(result).toEqual(['paper', 'PENCILS']);
      });

      it('should extract from list format after header', () => {
        const note = `Materials:
- chart paper
- colored markers
- safety scissors
- glue sticks`;

        const result = extractMaterials(note);
        expect(result).toEqual([
          'chart paper',
          'colored markers',
          'safety scissors',
          'glue sticks',
        ]);
      });

      it('should handle both dashes and asterisks for lists', () => {
        const note = `Materials needed:
- item1
* item2
- item3`;

        const result = extractMaterials(note);
        expect(result).toEqual(['item1', 'item2', 'item3']);
      });

      it('should extract materials from multiple sections', () => {
        const note = `Activity 1:
Materials: paper, pencils

Activity 2:
Additional materials: markers, rulers

Other notes here

Extra supplies: erasers`;

        const result = extractMaterials(note);
        expect(result).toEqual(['paper', 'pencils', 'markers', 'rulers', 'erasers']);
      });
    });

    describe('advanced parsing', () => {
      it('should handle semicolon separators', () => {
        const note = 'Materials: paper; pencils; rulers';
        const result = extractMaterials(note);
        expect(result).toEqual(['paper', 'pencils', 'rulers']);
      });

      it('should handle mixed separators', () => {
        const note = 'Materials: paper, pencils; rulers, erasers';
        const result = extractMaterials(note);
        expect(result).toEqual(['paper', 'pencils', 'rulers', 'erasers']);
      });

      it('should trim whitespace from items', () => {
        const note = 'Materials:  chart paper  ,   markers  , scissors   ';
        const result = extractMaterials(note);
        expect(result).toEqual(['chart paper', 'markers', 'scissors']);
      });

      it('should deduplicate materials', () => {
        const note = `Materials: paper, pencils
Additional materials: paper, rulers`;

        const result = extractMaterials(note);
        expect(result).toEqual(['paper', 'pencils', 'rulers']);
      });

      it('should handle materials on same line as header', () => {
        const note = 'Materials: item1, item2, item3';
        const result = extractMaterials(note);
        expect(result).toEqual(['item1', 'item2', 'item3']);
      });

      it('should handle complex multi-line format', () => {
        const note = `Lesson Plan:

Materials needed:
- Base-10 blocks (1 set per pair)
- Whiteboard markers
- Chart paper for recording

Other activities...

Additional supplies:
* Student worksheets
* Timer

Assessment notes here

Extra materials: calculators`;

        const result = extractMaterials(note);
        expect(result).toEqual([
          'Base-10 blocks (1 set per pair)',
          'Whiteboard markers',
          'Chart paper for recording',
          'Student worksheets',
          'Timer',
          'calculators',
        ]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        const result = extractMaterials('');
        expect(result).toEqual([]);
      });

      it('should handle notes with no materials', () => {
        const note = `This is a lesson plan.
It has many notes.
But no materials section.`;

        const result = extractMaterials(note);
        expect(result).toEqual([]);
      });

      it('should handle materials header with no content', () => {
        const note = 'Materials:';
        const result = extractMaterials(note);
        expect(result).toEqual([]);
      });

      it('should handle materials header with empty list', () => {
        const note = `Materials:
-
*
`;
        const result = extractMaterials(note);
        expect(result).toEqual([]);
      });

      it('should stop parsing list when non-list line encountered', () => {
        const note = `Materials:
- item1
- item2
This is not a list item
- item3 (this should not be included)`;

        const result = extractMaterials(note);
        expect(result).toEqual(['item1', 'item2']);
      });

      it('should handle empty lines in lists', () => {
        const note = `Materials:
- item1

- item2

Regular text here`;

        const result = extractMaterials(note);
        expect(result).toEqual(['item1', 'item2']);
      });

      it('should filter out empty items', () => {
        const note = 'Materials: item1, , item2, , ';
        const result = extractMaterials(note);
        expect(result).toEqual(['item1', 'item2']);
      });

      it('should handle special characters in material names', () => {
        const note = 'Materials: 12" ruler, 3/4" pipe, #2 pencils, markers (red & blue)';
        const result = extractMaterials(note);
        expect(result).toEqual(['12" ruler', '3/4" pipe', '#2 pencils', 'markers (red & blue)']);
      });

      it('should handle very long material lists', () => {
        const materials = Array.from({ length: 100 }, (_, i) => `item${i + 1}`);
        const note = `Materials: ${materials.join(', ')}`;
        const result = extractMaterials(note);
        expect(result).toHaveLength(100);
        expect(result[0]).toBe('item1');
        expect(result[99]).toBe('item100');
      });
    });

    describe('real-world examples', () => {
      it('should handle typical elementary lesson plan', () => {
        const note = `Math Lesson - Fractions

Learning Goals:
- Understand fractions as parts of a whole

Materials needed:
- Fraction strips (1 set per student)
- Pizza worksheets (photocopied)
- Colored pencils
- Chart paper for class discussion

Activities:
1. Introduction (10 min)
2. Hands-on exploration (20 min)

Additional materials:
- Document camera
- Fraction wall display

Assessment:
Exit ticket with fraction problems`;

        const result = extractMaterials(note);
        expect(result).toEqual([
          'Fraction strips (1 set per student)',
          'Pizza worksheets (photocopied)',
          'Colored pencils',
          'Chart paper for class discussion',
          'Document camera',
          'Fraction wall display',
        ]);
      });

      it('should handle science experiment format', () => {
        const note = `Science Experiment: Plant Growth

Question: What do plants need to grow?

Materials:
- Bean seeds (3 per student)
- Small pots (3 per student)  
- Potting soil
- Measuring cups
- Water

Extra supplies:
* Labels for pots
* Rulers for measuring
* Science journals

Procedure:
1. Fill pots with soil
2. Plant seeds

Supplies for cleanup: paper towels`;

        const result = extractMaterials(note);
        expect(result).toEqual([
          'Bean seeds (3 per student)',
          'Small pots (3 per student)',
          'Potting soil',
          'Measuring cups',
          'Water',
          'Labels for pots',
          'Rulers for measuring',
          'Science journals',
          'paper towels',
        ]);
      });

      it('should handle art project with detailed specifications', () => {
        const note = `Art Project: Self-Portraits

Materials needed:
- 9" x 12" drawing paper
- Pencils (2B recommended)
- Erasers (kneaded)
- Mirrors (1 per 2 students)
- Colored pencils or pastels

Additional supplies:
- Hair ties for long hair
- Tissues for blending
- Spray fixative (teacher use only)

Optional materials: watercolor paints`;

        const result = extractMaterials(note);
        expect(result).toEqual([
          '9" x 12" drawing paper',
          'Pencils (2B recommended)',
          'Erasers (kneaded)',
          'Mirrors (1 per 2 students)',
          'Colored pencils or pastels',
          'Hair ties for long hair',
          'Tissues for blending',
          'Spray fixative (teacher use only)',
          'watercolor paints',
        ]);
      });
    });
  });

  describe('generateMaterialList', () => {
    it('should return empty array and log warning', async () => {
      const result = await generateMaterialList('2024-01-15');

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'generateMaterialList is disabled - legacy models removed',
      );
    });

    it('should handle different date formats', async () => {
      const dates = ['2024-01-15', '2024-12-31', '2023-06-01'];

      for (const date of dates) {
        const result = await generateMaterialList(date);
        expect(result).toEqual([]);
      }
    });
  });

  describe('updateMaterialList', () => {
    it('should log warning with week start date', async () => {
      const weekStart = '2024-01-15';
      await updateMaterialList(weekStart);

      expect(console.warn).toHaveBeenCalledWith(
        'updateMaterialList is disabled - MaterialList model archived. Items for 2024-01-15:',
        [],
      );
    });
  });

  describe('generateMaterialDetails', () => {
    it('should return empty array and log warning', async () => {
      const result = await generateMaterialDetails('2024-01-15');

      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'generateMaterialDetails is disabled - legacy models removed',
      );
    });
  });

  describe('zipWeeklyPrintables', () => {
    it('should return empty buffer and log warning', async () => {
      const result = await zipWeeklyPrintables('2024-01-15');

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'zipWeeklyPrintables is disabled - legacy models removed',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle extractMaterials for typical weekly planning', () => {
      const weeklyNotes = `Monday - Math
Materials: base-10 blocks, worksheets

Tuesday - Science  
Additional supplies: microscopes, slides
- Safety goggles
- Lab notebooks

Wednesday - Art
Materials needed: paint, brushes, paper

Thursday - Reading
Supplies: books, sticky notes

Friday - Social Studies
Extra materials: maps, timeline cards`;

      const result = extractMaterials(weeklyNotes);

      expect(result).toContain('base-10 blocks');
      expect(result).toContain('worksheets');
      expect(result).toContain('microscopes');
      expect(result).toContain('slides');
      expect(result).toContain('Safety goggles');
      expect(result).toContain('Lab notebooks');
      expect(result).toContain('paint');
      expect(result).toContain('brushes');
      expect(result).toContain('paper');
      expect(result).toContain('books');
      expect(result).toContain('sticky notes');
      expect(result).toContain('maps');
      expect(result).toContain('timeline cards');
    });

    it('should handle complex lesson plan with multiple activities', () => {
      const lessonPlan = `Grade 3 Mathematics - Measurement

Activity 1: Length Exploration
Materials:
- Rulers (cm and inches)
- Measuring tape
- Various objects to measure

Activity 2: Comparing Heights
Additional materials:
* Chart paper
* Markers for recording

Activity 3: Problem Solving
Supplies needed: word problem cards, calculators

Reflection Activity:
Extra supplies: exit tickets`;

      const result = extractMaterials(lessonPlan);

      expect(result).toEqual([
        'Rulers (cm and inches)',
        'Measuring tape',
        'Various objects to measure',
        'Chart paper',
        'Markers for recording',
        'word problem cards',
        'calculators',
        'exit tickets',
      ]);
    });
  });
});
