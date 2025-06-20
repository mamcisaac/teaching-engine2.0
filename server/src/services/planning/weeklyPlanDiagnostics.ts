import { prisma } from '../../prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export interface QualityMetrics {
  outcomesCoverage: number;      // 0-100%
  assessmentBalance: number;     // 0-100%
  engagementVariety: number;     // 0-100%
  differentiationScore: number;  // 0-100%
  timeEfficiency: number;        // 0-100%
  domainBalance: number;         // 0-100%
  themeConsistency: number;      // 0-100%
  vocabularyIntegration: number; // 0-100%
  overallScore: number;          // 0-100%
}

export interface DiagnosticDetails {
  metrics: QualityMetrics;
  suggestions: string[];
  warnings: string[];
  strengths: string[];
  missingDomains: string[];
  overusedDomains: string[];
  uncoveredOutcomes: string[];
}

export interface WeeklyPlanDiagnosticsInput {
  weekStart: Date;
  userId: number;
}

/**
 * Calculate comprehensive quality metrics for a weekly plan
 */
export async function calculateWeeklyPlanDiagnostics(
  input: WeeklyPlanDiagnosticsInput
): Promise<DiagnosticDetails> {
  const { weekStart, userId } = input;
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  try {
    // Get the lesson plan for the week
    const lessonPlan = await prisma.lessonPlan.findFirst({
      where: {
        weekStart: startOfWeek(weekStart, { weekStartsOn: 1 }),
      },
      include: {
        schedule: {
          include: {
            activity: {
              include: {
                milestone: {
                  include: {
                    subject: true,
                    outcomes: {
                      include: {
                        outcome: true,
                      },
                    },
                  },
                },
                outcomes: {
                  include: {
                    outcome: true,
                  },
                },
                thematicUnits: {
                  include: {
                    thematicUnit: true,
                  },
                },
                cognatePairs: true,
              },
            },
          },
        },
      },
    });

    if (!lessonPlan || lessonPlan.schedule.length === 0) {
      return {
        metrics: {
          outcomesCoverage: 0,
          assessmentBalance: 0,
          engagementVariety: 0,
          differentiationScore: 0,
          timeEfficiency: 0,
          domainBalance: 0,
          themeConsistency: 0,
          vocabularyIntegration: 0,
          overallScore: 0,
        },
        suggestions: ['No activities scheduled for this week. Start by adding activities to your weekly plan.'],
        warnings: ['Empty weekly plan detected'],
        strengths: [],
        missingDomains: [],
        overusedDomains: [],
        uncoveredOutcomes: [],
      };
    }

    // Extract activities from schedule
    const activities = lessonPlan.schedule
      .map(item => item.activity)
      .filter(Boolean);

    // 1. Calculate Outcome Coverage
    const allOutcomes = await prisma.outcome.findMany({
      where: {
        milestones: {
          some: {
            milestone: {
              userId,
            },
          },
        },
      },
    });

    const coveredOutcomeIds = new Set<string>();
    activities.forEach(activity => {
      activity.outcomes?.forEach(ao => {
        coveredOutcomeIds.add(ao.outcomeId);
      });
      activity.milestone?.outcomes?.forEach(mo => {
        coveredOutcomeIds.add(mo.outcomeId);
      });
    });

    const outcomesCoverage = allOutcomes.length > 0
      ? (coveredOutcomeIds.size / allOutcomes.length) * 100
      : 0;

    // 2. Calculate Assessment Balance
    const assessmentActivities = activities.filter(a => a.activityType === 'ASSESSMENT');
    const assessmentBalance = activities.length > 0
      ? Math.min((assessmentActivities.length / activities.length) * 100 * 5, 100) // Target ~20% assessments
      : 0;

    // 3. Calculate Engagement Variety (based on activity types and tags)
    const activityTypes = new Set<string>();
    const activityTags = new Set<string>();
    
    activities.forEach(activity => {
      activityTypes.add(activity.activityType);
      if (activity.tags && typeof activity.tags === 'object') {
        const tags = activity.tags as string[];
        tags.forEach(tag => activityTags.add(tag));
      }
    });

    const engagementVariety = Math.min(
      ((activityTypes.size + activityTags.size) / 10) * 100,
      100
    );

    // 4. Calculate Differentiation Score (based on group types and individualized activities)
    const hasIndividualActivities = activities.some(a => 
      a.privateNote?.toLowerCase().includes('individual') ||
      a.privateNote?.toLowerCase().includes('differentiat')
    );
    const hasGroupActivities = activities.some(a => 
      a.privateNote?.toLowerCase().includes('group') ||
      a.privateNote?.toLowerCase().includes('partner')
    );
    
    const differentiationScore = 
      (hasIndividualActivities ? 50 : 0) + 
      (hasGroupActivities ? 50 : 0);

    // 5. Calculate Time Efficiency
    const totalMinutesPlanned = activities.reduce((sum, a) => sum + (a.durationMins || 0), 0);
    const availableMinutes = 5 * 6 * 60; // 5 days * 6 hours * 60 minutes
    const timeEfficiency = Math.min((totalMinutesPlanned / availableMinutes) * 100, 100);

    // 6. Calculate Domain Balance
    const domainCounts = new Map<string, number>();
    activities.forEach(activity => {
      const domain = activity.milestone?.subject?.name || 'Unknown';
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    });

    const domains = Array.from(domainCounts.keys());
    const domainValues = Array.from(domainCounts.values());
    const avgActivitiesPerDomain = domainValues.reduce((sum, v) => sum + v, 0) / domains.length;
    const domainVariance = domainValues.reduce((sum, v) => 
      sum + Math.pow(v - avgActivitiesPerDomain, 2), 0
    ) / domains.length;
    
    // Lower variance means better balance
    const domainBalance = Math.max(100 - (domainVariance * 10), 0);

    // 7. Calculate Theme Consistency
    const themeCount = new Set(
      activities.flatMap(a => a.thematicUnits?.map(tu => tu.thematicUnitId) || [])
    ).size;
    
    const themeConsistency = themeCount > 0
      ? Math.min((activities.filter(a => a.thematicUnits?.length > 0).length / activities.length) * 100, 100)
      : 50; // Neutral score if no themes

    // 8. Calculate Vocabulary Integration
    const vocabActivities = activities.filter(a => 
      a.cognatePairs?.length > 0 ||
      a.title?.toLowerCase().includes('vocab') ||
      a.title?.toLowerCase().includes('word')
    );
    
    const vocabularyIntegration = activities.length > 0
      ? (vocabActivities.length / activities.length) * 100
      : 0;

    // Calculate overall score
    const overallScore = (
      outcomesCoverage * 0.2 +
      assessmentBalance * 0.15 +
      engagementVariety * 0.15 +
      differentiationScore * 0.1 +
      timeEfficiency * 0.1 +
      domainBalance * 0.1 +
      themeConsistency * 0.1 +
      vocabularyIntegration * 0.1
    );

    // Generate suggestions, warnings, and strengths
    const suggestions: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];

    // Outcome coverage feedback
    if (outcomesCoverage < 50) {
      warnings.push('Low outcome coverage - many curriculum outcomes are not addressed this week');
      suggestions.push('Consider adding activities that target uncovered outcomes');
    } else if (outcomesCoverage > 80) {
      strengths.push('Excellent outcome coverage across the curriculum');
    }

    // Assessment balance feedback
    if (assessmentBalance < 10) {
      suggestions.push('Add more assessment activities to track student progress');
    } else if (assessmentBalance > 30) {
      warnings.push('High proportion of assessments may reduce learning time');
    } else {
      strengths.push('Good balance between teaching and assessment');
    }

    // Engagement variety feedback
    if (engagementVariety < 40) {
      suggestions.push('Increase variety in activity types to maintain student engagement');
    } else if (engagementVariety > 70) {
      strengths.push('Great variety in learning activities');
    }

    // Differentiation feedback
    if (differentiationScore < 50) {
      suggestions.push('Consider adding differentiated activities for diverse learners');
    } else {
      strengths.push('Good differentiation strategies in place');
    }

    // Time efficiency feedback
    if (timeEfficiency < 60) {
      warnings.push('Many time slots are unfilled - optimize your schedule');
    } else if (timeEfficiency > 90) {
      warnings.push('Schedule is very full - ensure buffer time for transitions');
    }

    // Domain balance feedback
    const overusedDomains = Array.from(domainCounts.entries())
      .filter(([_, count]) => count > avgActivitiesPerDomain * 1.5)
      .map(([domain]) => domain);
    
    const underusedDomains = Array.from(domainCounts.entries())
      .filter(([_, count]) => count < avgActivitiesPerDomain * 0.5)
      .map(([domain]) => domain);

    if (overusedDomains.length > 0) {
      warnings.push(`Overemphasis on: ${overusedDomains.join(', ')}`);
    }
    
    if (underusedDomains.length > 0) {
      suggestions.push(`Add more activities for: ${underusedDomains.join(', ')}`);
    }

    // Theme consistency feedback
    if (themeConsistency < 30 && themeCount > 0) {
      suggestions.push('Connect more activities to your active themes');
    } else if (themeConsistency > 70) {
      strengths.push('Strong thematic connections throughout the week');
    }

    // Vocabulary feedback
    if (vocabularyIntegration < 20) {
      suggestions.push('Include more vocabulary-building activities');
    } else if (vocabularyIntegration > 40) {
      strengths.push('Good emphasis on vocabulary development');
    }

    // Find uncovered outcomes
    const uncoveredOutcomes = allOutcomes
      .filter(o => !coveredOutcomeIds.has(o.id))
      .map(o => o.code)
      .slice(0, 5); // Limit to top 5

    // Find missing domains
    const allSubjects = await prisma.subject.findMany({
      where: { userId },
    });
    
    const scheduledSubjectIds = new Set(
      activities.map(a => a.milestone?.subjectId).filter(Boolean)
    );
    
    const missingDomains = allSubjects
      .filter(s => !scheduledSubjectIds.has(s.id))
      .map(s => s.name);

    return {
      metrics: {
        outcomesCoverage,
        assessmentBalance,
        engagementVariety,
        differentiationScore,
        timeEfficiency,
        domainBalance,
        themeConsistency,
        vocabularyIntegration,
        overallScore,
      },
      suggestions,
      warnings,
      strengths,
      missingDomains,
      overusedDomains,
      uncoveredOutcomes,
    };
  } catch (error) {
    console.error('Error calculating weekly plan diagnostics:', error);
    throw new Error('Failed to calculate weekly plan diagnostics');
  }
}

/**
 * Get planning quality trend over time
 */
export async function getPlanningQualityTrend(
  userId: number,
  weeks: number = 8
): Promise<{ week: string; score: number }[]> {
  const trend: { week: string; score: number }[] = [];
  const currentDate = new Date();

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - (i * 7));
    const mondayStart = startOfWeek(weekStart, { weekStartsOn: 1 });

    try {
      const diagnostics = await calculateWeeklyPlanDiagnostics({
        weekStart: mondayStart,
        userId,
      });

      trend.unshift({
        week: mondayStart.toISOString().split('T')[0],
        score: Math.round(diagnostics.metrics.overallScore),
      });
    } catch (error) {
      // If calculation fails for a week, use 0
      trend.unshift({
        week: mondayStart.toISOString().split('T')[0],
        score: 0,
      });
    }
  }

  return trend;
}