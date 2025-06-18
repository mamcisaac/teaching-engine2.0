import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import { getResourceSuggestions } from '../services/resourceSuggestions';

describe('Resource Suggestions Service', () => {
  const prisma = getTestPrismaClient();

  beforeEach(async () => {
    // Clean up test data
    await prisma.activityOutcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
  });

  it('should return empty array for non-existent activity', async () => {
    const suggestions = await getResourceSuggestions(999);
    expect(suggestions).toEqual([]);
  });

  it('should return suggestions for French activity with CO outcome', async () => {
    // Create test data
    const subject = await prisma.subject.create({
      data: { name: 'Français' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'French Communication',
        subjectId: subject.id,
      },
    });

    const outcome = await prisma.outcome.create({
      data: {
        code: 'CO.1',
        description: 'Oral Communication',
        subject: 'Français',
        grade: 1,
      },
    });

    const activity = await prisma.activity.create({
      data: {
        title: 'French Listening Activity',
        milestoneId: milestone.id,
      },
    });

    await prisma.activityOutcome.create({
      data: {
        activityId: activity.id,
        outcomeId: outcome.id,
      },
    });

    const suggestions = await getResourceSuggestions(activity.id);

    expect(suggestions).toHaveLength(2);

    // Check that we get oral communication suggestions
    const audioSuggestion = suggestions.find((s) => s.type === 'audio');
    expect(audioSuggestion).toBeDefined();
    expect(audioSuggestion?.title).toContain('Les Animaux');
    expect(audioSuggestion?.rationale).toContain('CO.1');

    const linkSuggestion = suggestions.find((s) => s.type === 'link');
    expect(linkSuggestion).toBeDefined();
    expect(linkSuggestion?.title).toContain('Interactive');
  });

  it('should return suggestions for reading outcomes', async () => {
    // Create test data
    const subject = await prisma.subject.create({
      data: { name: 'Français' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Reading Unit',
        subjectId: subject.id,
      },
    });

    const outcome = await prisma.outcome.create({
      data: {
        code: 'CL.2',
        description: 'Reading Comprehension',
        subject: 'Français',
        grade: 1,
      },
    });

    const activity = await prisma.activity.create({
      data: {
        title: 'Reading Comprehension',
        milestoneId: milestone.id,
      },
    });

    await prisma.activityOutcome.create({
      data: {
        activityId: activity.id,
        outcomeId: outcome.id,
      },
    });

    const suggestions = await getResourceSuggestions(activity.id);

    expect(suggestions.length).toBeGreaterThan(0);

    // Check that we get reading-related suggestions
    const videoSuggestion = suggestions.find((s) => s.type === 'video');
    expect(videoSuggestion).toBeDefined();
    expect(videoSuggestion?.rationale).toContain('CL.2');
  });

  it('should return keyword-based suggestions', async () => {
    // Create test data
    const subject = await prisma.subject.create({
      data: { name: 'Français' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Phonics Unit',
        subjectId: subject.id,
      },
    });

    const activity = await prisma.activity.create({
      data: {
        title: 'Syllable Counting Game',
        milestoneId: milestone.id,
      },
    });

    // No outcomes linked - should trigger keyword-based suggestions

    const suggestions = await getResourceSuggestions(activity.id);

    expect(suggestions.length).toBeGreaterThan(0);

    // Check that we get syllable-related suggestions
    const worksheetSuggestion = suggestions.find(
      (s) => s.type === 'worksheet' && s.title.includes('Syllable'),
    );
    expect(worksheetSuggestion).toBeDefined();
  });

  it('should limit suggestions to 5 items', async () => {
    // Create test data with multiple outcomes
    const subject = await prisma.subject.create({
      data: { name: 'Français' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Comprehensive Unit',
        subjectId: subject.id,
      },
    });

    const outcomes = await Promise.all([
      prisma.outcome.create({
        data: {
          code: 'CO.1',
          description: 'Oral Communication 1',
          subject: 'Français',
          grade: 1,
        },
      }),
      prisma.outcome.create({
        data: {
          code: 'CL.1',
          description: 'Reading 1',
          subject: 'Français',
          grade: 1,
        },
      }),
    ]);

    const activity = await prisma.activity.create({
      data: {
        title: 'Song and Number Activity',
        milestoneId: milestone.id,
      },
    });

    // Link multiple outcomes
    await Promise.all(
      outcomes.map((outcome) =>
        prisma.activityOutcome.create({
          data: {
            activityId: activity.id,
            outcomeId: outcome.id,
          },
        }),
      ),
    );

    const suggestions = await getResourceSuggestions(activity.id);

    expect(suggestions.length).toBeLessThanOrEqual(5);
  });

  it('should handle activities without milestones', async () => {
    // Create activity without milestone (edge case)
    const activity = await prisma.activity.create({
      data: {
        title: 'Standalone Activity',
        // No milestoneId
      },
    });

    const suggestions = await getResourceSuggestions(activity.id);

    // Should still get keyword-based suggestions
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('should prioritize outcome-based suggestions over keyword suggestions', async () => {
    // Create test data
    const subject = await prisma.subject.create({
      data: { name: 'Français' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Mixed Unit',
        subjectId: subject.id,
      },
    });

    const outcome = await prisma.outcome.create({
      data: {
        code: 'PE.1',
        description: 'Written Expression',
        subject: 'Français',
        grade: 1,
      },
    });

    // Activity title has "song" keyword but outcome is for writing
    const activity = await prisma.activity.create({
      data: {
        title: 'Writing Songs Activity',
        milestoneId: milestone.id,
      },
    });

    await prisma.activityOutcome.create({
      data: {
        activityId: activity.id,
        outcomeId: outcome.id,
      },
    });

    const suggestions = await getResourceSuggestions(activity.id);

    // Should have writing suggestions based on PE outcome
    const writingSuggestion = suggestions.find((s) => s.rationale && s.rationale.includes('PE.1'));
    expect(writingSuggestion).toBeDefined();
  });

  it('should handle complex activity with multiple outcome types', async () => {
    // Create comprehensive test scenario
    const subject = await prisma.subject.create({
      data: { name: 'Français' },
    });

    const milestone = await prisma.milestone.create({
      data: {
        title: 'Integrated Learning',
        subjectId: subject.id,
      },
    });

    // Create different types of outcomes
    const outcomes = await Promise.all([
      prisma.outcome.create({
        data: {
          code: 'CO.3',
          description: 'Advanced Oral Communication',
          subject: 'Français',
          grade: 1,
        },
      }),
      prisma.outcome.create({
        data: {
          code: 'CL.3',
          description: 'Critical Reading',
          subject: 'Français',
          grade: 1,
        },
      }),
      prisma.outcome.create({
        data: {
          code: 'PE.2',
          description: 'Creative Writing',
          subject: 'Français',
          grade: 1,
        },
      }),
    ]);

    const activity = await prisma.activity.create({
      data: {
        title: 'Integrated Language Arts Project',
        milestoneId: milestone.id,
      },
    });

    // Link all outcomes
    await Promise.all(
      outcomes.map((outcome) =>
        prisma.activityOutcome.create({
          data: {
            activityId: activity.id,
            outcomeId: outcome.id,
          },
        }),
      ),
    );

    const suggestions = await getResourceSuggestions(activity.id);

    // Should have diverse suggestions covering different skills
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(5);

    // Check for variety in suggestion types
    const types = new Set(suggestions.map((s) => s.type));
    expect(types.size).toBeGreaterThan(1); // Should have multiple types
  });
});
