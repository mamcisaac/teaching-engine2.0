/**
 * Script to run aggregation on existing assessments
 * This populates the StudentOutcomeProgress table with aggregated data
 */

import { PrismaClient } from '@teaching-engine/database';
import { assessmentAggregation } from '../server/src/services/assessmentAggregation';

const prisma = new PrismaClient();

async function aggregateExistingAssessments() {
  try {
    console.log('Starting aggregation of existing assessments...');
    
    // Get all unique student-expectation-user combinations
    const assessments = await prisma.studentAssessment.findMany({
      where: {
        expectationId: { not: null },
        isAnecdotal: false
      },
      select: {
        studentId: true,
        expectationId: true,
        userId: true
      },
      distinct: ['studentId', 'expectationId', 'userId']
    });
    
    console.log(`Found ${assessments.length} unique student-expectation combinations to aggregate`);
    
    // Run aggregation for each combination
    for (const { studentId, expectationId, userId } of assessments) {
      if (expectationId) {
        console.log(`Aggregating for student ${studentId}, expectation ${expectationId}`);
        await assessmentAggregation.updateOutcomeProgress(
          studentId,
          expectationId,
          userId
        );
      }
    }
    
    // Verify results
    const progressCount = await prisma.studentOutcomeProgress.count();
    console.log(`\nAggregation complete! Created ${progressCount} StudentOutcomeProgress records`);
    
    // Show sample of aggregated data
    const sample = await prisma.studentOutcomeProgress.findMany({
      take: 5,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        outcome: {
          select: {
            code: true,
            description: true
          }
        }
      }
    });
    
    console.log('\nSample of aggregated progress:');
    sample.forEach(p => {
      console.log(`- ${p.student.firstName} ${p.student.lastName}: ${p.outcome.code} - ${p.currentLevel} (${p.totalEvidencePieces} pieces of evidence)`);
    });
    
  } catch (error) {
    console.error('Error during aggregation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

aggregateExistingAssessments();