import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

interface MigrationStats {
  outcomes: { total: number; migrated: number; errors: number };
  milestones: { total: number; migrated: number; errors: number };
  activities: { total: number; migrated: number; errors: number };
  relationships: { total: number; migrated: number; errors: number };
}

/**
 * Migrate from legacy Milestone/Activity model to ETFO 5-level planning model
 */
export async function migrateToETFO(userId?: number): Promise<MigrationStats> {
  const stats: MigrationStats = {
    outcomes: { total: 0, migrated: 0, errors: 0 },
    milestones: { total: 0, migrated: 0, errors: 0 },
    activities: { total: 0, migrated: 0, errors: 0 },
    relationships: { total: 0, migrated: 0, errors: 0 },
  };

  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Migrate Outcomes to CurriculumExpectations
      console.log('Step 1: Migrating Outcomes to CurriculumExpectations...');
      const outcomes = await tx.outcome.findMany({
        include: {
          milestones: true,
          activities: true,
        },
      });
      stats.outcomes.total = outcomes.length;

      const outcomeIdMap = new Map<string, string>(); // old ID -> new ID

      for (const outcome of outcomes) {
        try {
          const curriculumExpectation = await tx.curriculumExpectation.create({
            data: {
              code: outcome.code,
              description: outcome.description,
              strand: outcome.domain || 'General',
              grade: outcome.grade,
              subject: outcome.subject,
              importId: outcome.importId,
            },
          });
          outcomeIdMap.set(outcome.id, curriculumExpectation.id);
          stats.outcomes.migrated++;
        } catch (error) {
          console.error(`Failed to migrate outcome ${outcome.code}:`, error);
          stats.outcomes.errors++;
        }
      }

      // Step 2: Create default LongRangePlans for each user/subject/year
      console.log('Step 2: Creating LongRangePlans...');
      const userSubjects = await tx.subject.findMany({
        where: userId ? { userId } : {},
        distinct: ['userId', 'name'],
      });

      const longRangePlanMap = new Map<string, string>(); // key -> LRP ID
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      for (const subject of userSubjects) {
        if (!subject.userId) continue;
        
        const key = `${subject.userId}-${subject.name}`;
        try {
          const longRangePlan = await tx.longRangePlan.create({
            data: {
              userId: subject.userId,
              title: `${subject.name} Year Plan`,
              academicYear,
              term: 'Full Year',
              grade: 1, // Default, should be updated based on user's teaching grade
              subject: subject.name,
              description: 'Auto-generated from legacy data migration',
            },
          });
          longRangePlanMap.set(key, longRangePlan.id);
        } catch (error) {
          console.error(`Failed to create LongRangePlan for ${key}:`, error);
        }
      }

      // Step 3: Migrate Milestones to UnitPlans
      console.log('Step 3: Migrating Milestones to UnitPlans...');
      const milestones = await tx.milestone.findMany({
        where: userId ? { userId } : {},
        include: {
          subject: true,
          outcomes: { include: { outcome: true } },
          activities: {
            include: {
              outcomes: { include: { outcome: true } },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
      stats.milestones.total = milestones.length;

      const milestoneIdMap = new Map<number, string>(); // old ID -> new ID

      for (const milestone of milestones) {
        if (!milestone.userId || !milestone.subject) continue;
        
        const lrpKey = `${milestone.userId}-${milestone.subject.name}`;
        const longRangePlanId = longRangePlanMap.get(lrpKey);
        
        if (!longRangePlanId) {
          console.error(`No LongRangePlan found for milestone ${milestone.id}`);
          stats.milestones.errors++;
          continue;
        }

        try {
          const unitPlan = await tx.unitPlan.create({
            data: {
              userId: milestone.userId,
              title: milestone.title,
              titleFr: milestone.titleFr,
              longRangePlanId,
              description: milestone.description,
              descriptionFr: milestone.descriptionFr,
              startDate: milestone.startDate || new Date(),
              endDate: milestone.endDate || new Date(),
              estimatedHours: milestone.estHours,
            },
          });
          milestoneIdMap.set(milestone.id, unitPlan.id);
          stats.milestones.migrated++;

          // Migrate milestone-outcome relationships
          for (const mo of milestone.outcomes) {
            const newExpectationId = outcomeIdMap.get(mo.outcomeId);
            if (newExpectationId) {
              try {
                await tx.unitPlanExpectation.create({
                  data: {
                    unitPlanId: unitPlan.id,
                    expectationId: newExpectationId,
                  },
                });
                stats.relationships.migrated++;
              } catch (error) {
                console.error(`Failed to migrate milestone-outcome relationship:`, error);
                stats.relationships.errors++;
              }
            }
            stats.relationships.total++;
          }

          // Step 4: Migrate Activities to ETFOLessonPlans
          console.log(`  Migrating ${milestone.activities.length} activities for unit plan ${unitPlan.title}...`);
          for (const activity of milestone.activities) {
            stats.activities.total++;
            
            if (!activity.userId) continue;
            
            try {
              // Determine lesson date based on activity order and milestone dates
              const lessonDate = milestone.startDate || new Date();
              
              const etfoLessonPlan = await tx.eTFOLessonPlan.create({
                data: {
                  userId: activity.userId,
                  title: activity.title,
                  titleFr: activity.titleFr,
                  unitPlanId: unitPlan.id,
                  date: lessonDate,
                  duration: activity.durationMins || 60,
                  action: activity.publicNote,
                  actionFr: activity.publicNoteFr,
                  materials: activity.materialsText ? [activity.materialsText] : [],
                  isSubFriendly: activity.isSubFriendly,
                  subNotes: activity.privateNote,
                  assessmentType: activity.activityType === 'ASSESSMENT' ? 'summative' : 'formative',
                },
              });
              stats.activities.migrated++;

              // Migrate activity-outcome relationships
              for (const ao of activity.outcomes) {
                const newExpectationId = outcomeIdMap.get(ao.outcomeId);
                if (newExpectationId) {
                  try {
                    await tx.eTFOLessonPlanExpectation.create({
                      data: {
                        lessonPlanId: etfoLessonPlan.id,
                        expectationId: newExpectationId,
                      },
                    });
                    stats.relationships.migrated++;
                  } catch (error) {
                    console.error(`Failed to migrate activity-outcome relationship:`, error);
                    stats.relationships.errors++;
                  }
                }
                stats.relationships.total++;
              }

              // Create DaybookEntry for completed activities
              if (activity.completedAt) {
                await tx.daybookEntry.create({
                  data: {
                    userId: activity.userId,
                    date: activity.completedAt,
                    lessonPlanId: etfoLessonPlan.id,
                    notes: 'Auto-generated from completed activity',
                  },
                });
              }
            } catch (error) {
              console.error(`Failed to migrate activity ${activity.id}:`, error);
              stats.activities.errors++;
            }
          }
        } catch (error) {
          console.error(`Failed to migrate milestone ${milestone.id}:`, error);
          stats.milestones.errors++;
        }
      }
    });

    console.log('\nMigration completed successfully!');
    console.log('Migration Statistics:', JSON.stringify(stats, null, 2));
    return stats;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI execution
if (require.main === module) {
  const userId = process.argv[2] ? parseInt(process.argv[2]) : undefined;
  
  console.log('Starting ETFO migration...');
  if (userId) {
    console.log(`Migrating data for user ID: ${userId}`);
  } else {
    console.log('Migrating data for all users');
  }
  
  migrateToETFO(userId)
    .then((stats) => {
      console.log('\nMigration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nMigration failed:', error);
      process.exit(1);
    });
}