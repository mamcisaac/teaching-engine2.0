import { prisma } from '../src/prisma';
import { outcomes } from '../../scripts/bulk-import-outcomes';

describe('Import Outcomes', () => {
  beforeAll(async () => {
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should import French Immersion Grade 1 outcomes', async () => {
    // We won't delete existing outcomes, just check and create new ones
    // Due to FK constraints, we need to be careful with deleting
    
    // Import the outcomes using upsert to avoid duplicates
    let createdCount = 0;
    for (const outcome of outcomes) {
      try {
        await prisma.outcome.upsert({
          where: { code: outcome.code },
          update: {
            description: outcome.description,
            domain: outcome.domain,
            subject: outcome.subject,
            grade: outcome.grade
          },
          create: outcome
        });
        createdCount++;
      } catch (e) {
        console.error(`Error upserting outcome ${outcome.code}:`, e);
      }
    }
    console.log(`Successfully created/updated ${createdCount} outcomes`);
    
    // Verify the outcomes were imported
    const count = await prisma.outcome.count({
      where: { grade: 1 }
    });
    
    console.log(`Imported ${count} Grade 1 outcomes`);
    expect(count).toBeGreaterThanOrEqual(85);
    
    // Check subject-specific counts
    const fraCount = await prisma.outcome.count({
      where: { grade: 1, subject: 'FRA' }
    });
    console.log(`French outcomes: ${fraCount}`);
    expect(fraCount).toBeGreaterThanOrEqual(50);
    
    // Verify a specific outcome
    const outcome = await prisma.outcome.findUnique({
      where: { code: '1CO.1' }
    });
    
    expect(outcome).toBeTruthy();
    expect(outcome?.subject).toBe('FRA');
    expect(outcome?.grade).toBe(1);
    expect(outcome?.domain).toBe('COMMUNICATION ORALE');
    expect(outcome?.description.length).toBeGreaterThan(10);
  });
});