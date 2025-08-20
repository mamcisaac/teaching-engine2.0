const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:./packages/database/dev.db"
      }
    }
  });

  try {
    console.log('Querying Emily McIsaac\'s Français (Immersion) LRP...\n');
    
    // Get Emily's French LRP data
    const frenchLRP = await prisma.longRangePlan.findFirst({
      where: {
        userId: 23,
        subject: "Français (Immersion)"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    if (!frenchLRP) {
      console.log('No Français (Immersion) LRP found for Emily McIsaac (userId: 23)');
      
      // Check what LRPs Emily has
      const allLRPs = await prisma.longRangePlan.findMany({
        where: {
          userId: 23
        },
        select: {
          id: true,
          title: true,
          subject: true,
          grade: true,
          academicYear: true
        }
      });
      
      console.log('\nEmily\'s existing LRPs:');
      console.log(JSON.stringify(allLRPs, null, 2));
      return;
    }

    console.log('=== EMILY MCISAAC FRANÇAIS (IMMERSION) LRP ===\n');
    console.log(`Title: ${frenchLRP.title}`);
    console.log(`Subject: ${frenchLRP.subject}`);
    console.log(`Grade: ${frenchLRP.grade}`);
    console.log(`Academic Year: ${frenchLRP.academicYear}`);
    console.log(`Teacher: ${frenchLRP.user.name} (${frenchLRP.user.email})`);
    console.log(`Created: ${frenchLRP.createdAt}`);
    console.log(`Updated: ${frenchLRP.updatedAt}`);
    console.log(`\n=== DETAILED CONTENT ===\n`);
    
    console.log(`DESCRIPTION:\n${frenchLRP.description || 'MISSING'}\n`);
    console.log(`LEARNING GOALS:\n${frenchLRP.learningGoals || 'MISSING'}\n`);
    console.log(`MONTHLY THEMES:\n${JSON.stringify(frenchLRP.monthlyThemes, null, 2) || 'MISSING'}\n`);
    console.log(`OVERARCHING QUESTIONS:\n${frenchLRP.overarchingQuestions || 'MISSING'}\n`);
    console.log(`ASSESSMENT OVERVIEW:\n${frenchLRP.assessmentOverview || 'MISSING'}\n`);
    console.log(`RESOURCE NEEDS:\n${frenchLRP.resourceNeeds || 'MISSING'}\n`);
    console.log(`INDIGENOUS PERSPECTIVES:\n${frenchLRP.indigenousPerspectives || 'MISSING'}\n`);
    console.log(`PARENT COMMUNICATION:\n${frenchLRP.parentCommunication || 'MISSING'}\n`);
    
    console.log(`\n=== CURRICULUM EXPECTATIONS (${frenchLRP.expectations.length}) ===\n`);
    frenchLRP.expectations.forEach(exp => {
      console.log(`- ${exp.expectation.code}: ${exp.expectation.description}`);
      if (exp.plannedTerm) console.log(`  Term: ${exp.plannedTerm}`);
    });

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);