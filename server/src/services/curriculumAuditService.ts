import { prisma } from '../prisma';

interface AuditReportParams {
  userId: number;
  subjectIds?: number[];
  timeframe: 'term' | 'semester' | 'year';
  fromDate?: Date;
  toDate?: Date;
}

interface ExportParams extends AuditReportParams {
  format: 'pdf' | 'csv' | 'json';
  includeDetails: boolean;
}

interface OutcomeInfo {
  id: string;
  title: string;
  description: string;
  milestone?: string;
}

interface ActivityInfo {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
}

interface SubjectMetrics {
  subjectId: number;
  subjectName: string;
  totalOutcomes: number;
  coveredOutcomes: number;
  uncoveredOutcomes: number;
  coveragePercentage: number;
  activitiesCount: number;
  uncoveredOutcomeDetails: OutcomeInfo[];
  recentActivities: ActivityInfo[];
  milestoneBreakdown: {
    milestoneId: number;
    milestoneName: string;
    totalOutcomes: number;
    coveredOutcomes: number;
    coveragePercentage: number;
  }[];
}

interface AuditReport {
  generatedAt: string;
  timeframe: string;
  dateRange: {
    from: Date;
    to: Date;
  } | null;
  overallMetrics: {
    totalOutcomes: number;
    coveredOutcomes: number;
    uncoveredOutcomes: number;
    coveragePercentage: number;
    activitiesCount: number;
    subjectsAudited: number;
  };
  subjectMetrics: SubjectMetrics[];
  recommendations: string[];
  criticalGaps: OutcomeInfo[];
}

function calculateDateRange(
  timeframe: 'term' | 'semester' | 'year',
  fromDate?: Date,
  toDate?: Date,
) {
  if (fromDate && toDate) {
    return { from: fromDate, to: toDate };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let startDate: Date;
  const endDate: Date = toDate || now;

  switch (timeframe) {
    case 'term':
      // Assume term is 4 months
      startDate = new Date(currentYear, currentMonth - 4, 1);
      break;
    case 'semester':
      // Assume semester is 6 months
      startDate = new Date(currentYear, currentMonth - 6, 1);
      break;
    case 'year':
      // Academic year (September to June)
      if (currentMonth >= 8) {
        // Current academic year
        startDate = new Date(currentYear, 8, 1); // September 1st
      } else {
        // Previous academic year
        startDate = new Date(currentYear - 1, 8, 1);
      }
      break;
    default:
      startDate = new Date(currentYear, currentMonth - 4, 1);
  }

  return { from: fromDate || startDate, to: endDate };
}

export async function generateAuditReport(params: AuditReportParams): Promise<AuditReport> {
  const { userId, subjectIds, timeframe, fromDate, toDate } = params;
  const dateRange = calculateDateRange(timeframe, fromDate, toDate);

  // Get user's subjects
  const subjects = await prisma.subject.findMany({
    where: {
      userId,
      ...(subjectIds && subjectIds.length > 0 ? { id: { in: subjectIds } } : {}),
    },
    include: {
      milestones: {
        include: {
          outcomes: true,
        },
      },
    },
  });

  // Get activities for the timeframe
  const activities = await prisma.activity.findMany({
    where: {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
      milestone: {
        subject: {
          userId,
          ...(subjectIds && subjectIds.length > 0 ? { id: { in: subjectIds } } : {}),
        },
      },
    },
    include: {
      milestone: {
        include: {
          subject: true,
        },
      },
      outcomes: {
        include: {
          outcome: true,
        },
      },
    },
  });

  // Calculate overall metrics
  const allOutcomes = subjects.flatMap((subject) =>
    subject.milestones.flatMap((milestone) => milestone.outcomes),
  );

  const coveredOutcomeIds = new Set(
    activities.flatMap((activity) => activity.outcomes.map((ao) => ao.outcome.id)),
  );

  const totalOutcomes = allOutcomes.length;
  const coveredOutcomes = allOutcomes.filter((outcome) => coveredOutcomeIds.has(outcome.id)).length;
  const uncoveredOutcomes = totalOutcomes - coveredOutcomes;
  const coveragePercentage = totalOutcomes > 0 ? (coveredOutcomes / totalOutcomes) * 100 : 0;

  // Calculate subject-specific metrics
  const subjectMetrics: SubjectMetrics[] = subjects.map((subject) => {
    const subjectOutcomes = subject.milestones.flatMap((m) => m.outcomes);
    const subjectActivities = activities.filter((a) => a.milestone.subjectId === subject.id);
    const subjectCoveredIds = new Set(
      subjectActivities.flatMap((a) => a.outcomes.map((ao) => ao.outcome.id)),
    );

    const subjectCovered = subjectOutcomes.filter((o) => subjectCoveredIds.has(o.id)).length;

    // Milestone breakdown
    const milestoneBreakdown = subject.milestones.map((milestone) => {
      const milestoneOutcomes = milestone.outcomes;
      const milestoneCovered = milestoneOutcomes.filter((o) => subjectCoveredIds.has(o.id)).length;

      return {
        milestoneId: milestone.id,
        milestoneName: milestone.title,
        totalOutcomes: milestoneOutcomes.length,
        coveredOutcomes: milestoneCovered,
        coveragePercentage:
          milestoneOutcomes.length > 0 ? (milestoneCovered / milestoneOutcomes.length) * 100 : 0,
      };
    });

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalOutcomes: subjectOutcomes.length,
      coveredOutcomes: subjectCovered,
      uncoveredOutcomes: subjectOutcomes.length - subjectCovered,
      coveragePercentage:
        subjectOutcomes.length > 0 ? (subjectCovered / subjectOutcomes.length) * 100 : 0,
      activitiesCount: subjectActivities.length,
      uncoveredOutcomeDetails: subjectOutcomes
        .filter((o) => !subjectCoveredIds.has(o.id))
        .map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          milestone: subject.milestones.find((m) =>
            m.outcomes.some((outcome) => outcome.id === o.id),
          )?.title,
        })),
      recentActivities: subjectActivities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          createdAt: a.createdAt,
        })),
      milestoneBreakdown,
    };
  });

  // Generate recommendations
  const recommendations = generateRecommendations(subjectMetrics, coveragePercentage);

  // Identify critical gaps (outcomes with 0% coverage that should be prioritized)
  const criticalGaps = subjectMetrics
    .flatMap((subject) => subject.uncoveredOutcomeDetails)
    .slice(0, 10); // Top 10 critical gaps

  return {
    generatedAt: new Date().toISOString(),
    timeframe,
    dateRange,
    overallMetrics: {
      totalOutcomes,
      coveredOutcomes,
      uncoveredOutcomes,
      coveragePercentage,
      activitiesCount: activities.length,
      subjectsAudited: subjects.length,
    },
    subjectMetrics,
    recommendations,
    criticalGaps,
  };
}

function generateRecommendations(
  subjectMetrics: SubjectMetrics[],
  overallCoverage: number,
): string[] {
  const recommendations: string[] = [];

  // Overall coverage recommendations
  if (overallCoverage < 60) {
    recommendations.push(
      'Overall curriculum coverage is below 60%. Consider reviewing your planning process and ensure all subjects are adequately addressed.',
    );
  } else if (overallCoverage < 80) {
    recommendations.push(
      'Good progress on curriculum coverage. Focus on the uncovered outcomes to reach optimal coverage levels.',
    );
  } else {
    recommendations.push(
      'Excellent curriculum coverage! Maintain this level of comprehensive planning.',
    );
  }

  // Subject-specific recommendations
  subjectMetrics.forEach((subject) => {
    if (subject.coveragePercentage < 50) {
      recommendations.push(
        `${subject.subjectName}: Critical attention needed. Only ${subject.coveragePercentage.toFixed(1)}% coverage. Consider scheduling focused activities for uncovered outcomes.`,
      );
    } else if (subject.coveragePercentage < 70) {
      recommendations.push(
        `${subject.subjectName}: Moderate coverage at ${subject.coveragePercentage.toFixed(1)}%. Plan additional activities to address gaps.`,
      );
    }

    // Check for milestones with very low coverage
    const problematicMilestones = subject.milestoneBreakdown.filter(
      (m) => m.coveragePercentage < 30 && m.totalOutcomes > 0,
    );

    if (problematicMilestones.length > 0) {
      recommendations.push(
        `${subject.subjectName}: The following milestones need immediate attention: ${problematicMilestones.map((m) => m.milestoneName).join(', ')}`,
      );
    }
  });

  // Activity frequency recommendations
  const subjectsWithFewActivities = subjectMetrics.filter(
    (s) => s.activitiesCount < 5 && s.totalOutcomes > 10,
  );

  if (subjectsWithFewActivities.length > 0) {
    recommendations.push(
      `Consider increasing activity frequency for: ${subjectsWithFewActivities.map((s) => s.subjectName).join(', ')}`,
    );
  }

  return recommendations;
}

export async function exportAuditData(params: ExportParams): Promise<string | Buffer> {
  const report = await generateAuditReport(params);
  const { format, includeDetails } = params;

  switch (format) {
    case 'json':
      return JSON.stringify(report, null, 2);

    case 'csv':
      return generateCSVExport(report, includeDetails);

    case 'pdf':
      // For now, return a JSON representation
      // In a full implementation, you'd use a PDF library like puppeteer or jsPDF
      return JSON.stringify(
        {
          error: 'PDF export not yet implemented',
          message: 'Use JSON or CSV format for now',
          data: report,
        },
        null,
        2,
      );

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function generateCSVExport(report: AuditReport, includeDetails: boolean): string {
  const csvRows: string[][] = [];

  // Header
  csvRows.push([
    'Subject',
    'Total Outcomes',
    'Covered Outcomes',
    'Uncovered Outcomes',
    'Coverage %',
    'Activities Count',
  ]);

  // Subject data
  report.subjectMetrics.forEach((subject) => {
    csvRows.push([
      subject.subjectName,
      subject.totalOutcomes.toString(),
      subject.coveredOutcomes.toString(),
      subject.uncoveredOutcomes.toString(),
      subject.coveragePercentage.toFixed(1) + '%',
      subject.activitiesCount.toString(),
    ]);
  });

  if (includeDetails) {
    // Add uncovered outcomes details
    csvRows.push([]);
    csvRows.push(['Uncovered Outcomes Details']);
    csvRows.push(['Subject', 'Outcome ID', 'Outcome Title', 'Milestone']);

    report.subjectMetrics.forEach((subject) => {
      subject.uncoveredOutcomeDetails.forEach((outcome) => {
        csvRows.push([
          subject.subjectName,
          outcome.id,
          outcome.title,
          outcome.milestone || 'Unknown',
        ]);
      });
    });

    // Add recommendations
    csvRows.push([]);
    csvRows.push(['Recommendations']);
    report.recommendations.forEach((rec, index) => {
      csvRows.push([`${index + 1}. ${rec}`]);
    });
  }

  return csvRows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
