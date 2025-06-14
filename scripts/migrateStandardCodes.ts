import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:../packages/database/prisma/dev.db'
      }
    }
  });

  try {
    console.log('Starting migration of standardCodes to Outcomes...');
    
    const milestones = await prisma.milestone.findMany();
    console.log(`Found ${milestones.length} milestones to process.`);
    
    let totalCodes = 0;
    let totalMilestones = 0;
    
    for (const m of milestones) {
      // Parse standardCodes - handle both string array and JSON string
      let codes: string[] = [];
      try {
        if (typeof m.standardCodes === 'string') {
          codes = JSON.parse(m.standardCodes as string);
        } else if (Array.isArray(m.standardCodes)) {
          codes = m.standardCodes as unknown as string[];
        }
      } catch (e) {
        console.error(`Error parsing standardCodes for milestone ${m.id}: ${e}`);
        continue;
      }
      
      if (!codes.length) {
        console.log(`Milestone ${m.id} has no standard codes, skipping.`);
        continue;
      }
      
      console.log(`Processing milestone ${m.id} with ${codes.length} standard codes.`);
      totalMilestones++;
      
      for (const code of codes) {
        if (!code || typeof code !== 'string') {
          console.log(`Skipping invalid code: ${code}`);
          continue;
        }
        
        try {
          // Upsert the outcome
          const outcome = await prisma.outcome.upsert({
            where: { code },
            update: {}, // No changes if it exists
            create: { 
              subject: 'UNKNOWN', 
              grade: 0, 
              code, 
              description: 'TEMP' 
            },
          });
          
          // Create the relation
          await prisma.milestoneOutcome.create({
            data: { 
              milestoneId: m.id, 
              outcomeId: outcome.id 
            },
          }).catch(e => {
            console.log(`Note: ${e.message}`);
          });
          
          totalCodes++;
        } catch (e) {
          console.error(`Error processing code ${code} for milestone ${m.id}: ${e}`);
        }
      }
      
      // Clear the standardCodes field once the codes are migrated
      try {
        await prisma.milestone.update({
          where: { id: m.id },
          data: { standardCodes: [] },
        });
      } catch (e) {
        console.error(`Error clearing standardCodes for milestone ${m.id}: ${e}`);
      }
    }
    
    console.log(`Migration complete. Processed ${totalCodes} standard codes across ${totalMilestones} milestones.`);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});