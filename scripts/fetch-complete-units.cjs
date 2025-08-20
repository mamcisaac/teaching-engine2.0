/**
 * Fetch Complete Units
 * Retrieves all unit plans with COMPLETE data - no truncation, no cutoffs
 */

const { PrismaClient } = require('@prisma/client');

class CompleteUnitFetcher {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./packages/database/dev.db'
        }
      }
    });
  }

  /**
   * Fetch all units with complete related data
   */
  async fetchAllUnits() {
    try {
      const units = await this.prisma.unitPlan.findMany({
        include: {
          // Include user info
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          
          // Include complete LRP data
          longRangePlan: {
            include: {
              expectations: {
                include: {
                  expectation: true
                }
              }
            }
          },
          
          // Include all unit expectations with full details
          expectations: {
            include: {
              expectation: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  description: true,
                  strand: true,
                  subStrand: true,
                  specificExpectation: true,
                  example: true,
                  frenchDescription: true,
                  frenchTitle: true
                }
              }
            }
          },
          
          // Include any resources
          resources: true,
          
          // Include transfer skills if any
          transferSkills: {
            include: {
              transferSkill: true
            }
          },
          
          // Include existing lesson plans to avoid duplication
          lessonPlans: {
            select: {
              id: true,
              title: true,
              date: true
            }
          }
        },
        orderBy: [
          { longRangePlan: { subject: 'asc' } },
          { startDate: 'asc' }
        ]
      });

      return this.enrichUnitsWithCompleteData(units);
    } catch (error) {
      console.error('Error fetching units:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Fetch a single unit with complete data for testing
   */
  async fetchSingleUnit(unitId) {
    try {
      const unit = await this.prisma.unitPlan.findUnique({
        where: { id: unitId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          longRangePlan: {
            include: {
              expectations: {
                include: {
                  expectation: true
                }
              }
            }
          },
          expectations: {
            include: {
              expectation: true
            }
          },
          resources: true,
          transferSkills: {
            include: {
              transferSkill: true
            }
          },
          lessonPlans: {
            select: {
              id: true,
              title: true,
              date: true
            }
          }
        }
      });

      if (!unit) {
        throw new Error(`Unit with ID ${unitId} not found`);
      }

      return this.enrichSingleUnit(unit);
    } catch (error) {
      console.error('Error fetching single unit:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Enrich units with complete, untruncated data
   */
  enrichUnitsWithCompleteData(units) {
    return units.map(unit => this.enrichSingleUnit(unit));
  }

  /**
   * Enrich a single unit with complete data
   */
  enrichSingleUnit(unit) {
    // Parse JSON fields to ensure they're properly formatted
    const essentialQuestions = this.parseJsonField(unit.essentialQuestions, []);
    const keyVocabulary = this.parseJsonField(unit.keyVocabulary, []);
    const successCriteria = this.parseJsonField(unit.successCriteria, []);
    const differentiationStrategies = this.parseJsonField(unit.differentiationStrategies, {});
    
    // Calculate lesson count needed
    const lessonCount = this.calculateLessonCount(unit);
    const existingLessonCount = unit.lessonPlans ? unit.lessonPlans.length : 0;
    const lessonsNeeded = lessonCount - existingLessonCount;

    return {
      // Core unit information
      id: unit.id,
      title: unit.title,
      titleFr: unit.titleFr,
      description: unit.description || '',
      descriptionFr: unit.descriptionFr || '',
      
      // Dates and timing
      startDate: unit.startDate,
      endDate: unit.endDate,
      estimatedHours: unit.estimatedHours,
      lessonCount: lessonCount,
      existingLessons: existingLessonCount,
      lessonsNeeded: lessonsNeeded,
      
      // Pedagogical content - COMPLETE, no truncation
      bigIdeas: unit.bigIdeas || '',
      bigIdeasFr: unit.bigIdeasFr || '',
      essentialQuestions: essentialQuestions,
      keyVocabulary: keyVocabulary,
      
      // Assessment and success
      assessmentPlan: unit.assessmentPlan || '',
      successCriteria: successCriteria,
      culminatingTask: unit.culminatingTask || '',
      
      // Differentiation and support
      differentiationStrategies: differentiationStrategies,
      priorKnowledge: unit.priorKnowledge || '',
      
      // Connections and perspectives
      communityConnections: unit.communityConnections || '',
      crossCurricularConnections: unit.crossCurricularConnections || '',
      indigenousPerspectives: unit.indigenousPerspectives || '',
      environmentalEducation: unit.environmentalEducation || '',
      socialJusticeConnections: unit.socialJusticeConnections || '',
      
      // Technology and resources
      technologyIntegration: unit.technologyIntegration || '',
      fieldTripsAndGuestSpeakers: unit.fieldTripsAndGuestSpeakers || '',
      
      // Parent communication
      parentCommunicationPlan: unit.parentCommunicationPlan || '',
      
      // Long Range Plan context
      longRangePlan: {
        id: unit.longRangePlan.id,
        title: unit.longRangePlan.title,
        subject: unit.longRangePlan.subject,
        grade: unit.longRangePlan.grade,
        academicYear: unit.longRangePlan.academicYear,
        goals: unit.longRangePlan.goals || '',
        goalsFr: unit.longRangePlan.goalsFr || '',
        themes: this.parseJsonField(unit.longRangePlan.themes, []),
        assessmentOverview: unit.longRangePlan.assessmentOverview || ''
      },
      
      // Complete curriculum expectations
      expectations: unit.expectations.map(exp => ({
        id: exp.expectation.id,
        code: exp.expectation.code,
        title: exp.expectation.title || '',
        description: exp.expectation.description || '',
        strand: exp.expectation.strand || '',
        subStrand: exp.expectation.subStrand || '',
        specificExpectation: exp.expectation.specificExpectation || '',
        example: exp.expectation.example || '',
        frenchTitle: exp.expectation.frenchTitle || '',
        frenchDescription: exp.expectation.frenchDescription || ''
      })),
      
      // Resources
      resources: unit.resources || [],
      
      // Transfer skills
      transferSkills: unit.transferSkills ? unit.transferSkills.map(ts => ({
        id: ts.transferSkill.id,
        name: ts.transferSkill.name,
        emphasis: ts.emphasis
      })) : [],
      
      // User context
      userId: unit.userId,
      userName: unit.user ? unit.user.name : 'Emily McIsaac'
    };
  }

  /**
   * Parse JSON fields safely
   */
  parseJsonField(field, defaultValue) {
    if (!field) return defaultValue;
    if (typeof field === 'object') return field;
    
    try {
      return JSON.parse(field);
    } catch (error) {
      console.warn('Failed to parse JSON field:', field);
      return defaultValue;
    }
  }

  /**
   * Calculate how many lessons this unit needs
   */
  calculateLessonCount(unit) {
    const subject = unit.longRangePlan?.subject || '';
    
    // Standard lesson counts by subject
    const lessonCounts = {
      'Français (Immersion)': 20,
      'Mathématiques': 20,
      'Sciences de la nature': 20,
      'Sciences humaines': 19,
      'Arts visuels': 20,
      'Formation personnelle et sociale': 20
    };
    
    // Check for specific matches
    for (const [subjectKey, count] of Object.entries(lessonCounts)) {
      if (subject.includes(subjectKey)) {
        return count;
      }
    }
    
    // Default to 20 lessons
    return 20;
  }

  /**
   * Get units that need lessons
   */
  async getUnitsNeedingLessons() {
    const allUnits = await this.fetchAllUnits();
    return allUnits.filter(unit => unit.lessonsNeeded > 0);
  }

  /**
   * Get a sample of units for testing
   */
  async getSampleUnits(count = 5) {
    const units = await this.fetchAllUnits();
    
    // Get a diverse sample - one from each subject if possible
    const subjects = [...new Set(units.map(u => u.longRangePlan.subject))];
    const sample = [];
    
    for (const subject of subjects) {
      const subjectUnits = units.filter(u => u.longRangePlan.subject === subject);
      if (subjectUnits.length > 0) {
        sample.push(subjectUnits[0]);
      }
      if (sample.length >= count) break;
    }
    
    return sample;
  }
}

// Export for use in other scripts
module.exports = { CompleteUnitFetcher };

// Run if called directly
if (require.main === module) {
  const fetcher = new CompleteUnitFetcher();
  
  fetcher.getSampleUnits(1)
    .then(units => {
      console.log('\n📚 Sample Unit (COMPLETE DATA):');
      console.log('=' .repeat(60));
      
      const unit = units[0];
      console.log('\nBASIC INFO:');
      console.log(`Title: ${unit.title}`);
      console.log(`Subject: ${unit.longRangePlan.subject}`);
      console.log(`Lessons Needed: ${unit.lessonsNeeded}`);
      
      console.log('\nBIG IDEAS (full text):');
      console.log(unit.bigIdeas);
      
      console.log('\nESSENTIAL QUESTIONS:');
      unit.essentialQuestions.forEach((q, i) => {
        console.log(`${i + 1}. ${q}`);
      });
      
      console.log('\nVOCABULARY (${unit.keyVocabulary.length} terms):');
      console.log(unit.keyVocabulary.slice(0, 5).join(', '), '...');
      
      console.log('\nEXPECTATIONS:');
      unit.expectations.forEach(exp => {
        console.log(`- ${exp.code}: ${exp.description}`);
      });
      
      console.log('\nCULMINATING TASK:');
      console.log(unit.culminatingTask);
      
      console.log('\n✅ Complete unit data ready for subagent processing');
    })
    .catch(console.error);
}