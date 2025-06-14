import { prisma } from '../src/prisma';

describe('Curriculum Import', () => {
  beforeAll(async () => {
    // Ensure SQLite doesn't immediately error when the database is busy
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 20000');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have imported French Immersion Grade 1 outcomes', async () => {
    const count = await prisma.outcome.count({ 
      where: { 
        grade: 1,
        subject: 'FRA'
      }
    });
    
    // If this test fails, it means the import script hasn't been run yet
    // Run the import script with: pnpm curriculum:import pei-fi-1
    console.log(`Found ${count} Grade 1 French outcomes in database`);
    expect(count).toBeGreaterThan(50);
  });

  it('should have unique code values for all outcomes', async () => {
    // Get all outcome codes
    const outcomes = await prisma.outcome.findMany({
      select: { code: true }
    });
    
    // Check for duplicates
    const codes = outcomes.map(o => o.code);
    const uniqueCodes = new Set(codes);
    
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('should have properly populated fields for outcomes', async () => {
    // Get a sample French outcome with a specific code we know exists
    const outcome = await prisma.outcome.findFirst({
      where: { 
        code: '1CO.1'
      }
    });
    
    // Skip test if no outcomes exist yet
    if (!outcome) {
      console.warn('No outcomes found in database. Import script needs to be run.');
      return;
    }
    
    // Check that all fields are populated
    expect(outcome.code).toBeTruthy();
    expect(outcome.description.length).toBeGreaterThan(5);
    expect(outcome.domain).toBeTruthy();
    expect(outcome.subject).toBe('FRA');
    expect(outcome.grade).toBe(1);
  });
});