/**
 * Analytics Dashboard API Routes
 * Provides class-wide insights and progress summaries for Emily's classroom
 */

import { Router, Request, Response } from 'express';
import { query, body, validationResult } from 'express-validator';
import { PrismaClient } from '@teaching-engine/database';
import { logger } from '../logger';
import { getClassAnalyticsOptimized, cachedQuery, invalidateUserCache } from '../services/performanceOptimizer';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

/**
 * GET /api/analytics/class-overview
 * Get comprehensive class analytics overview
 */
router.get('/class-overview', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all students for this teacher
    const students = await prisma.student.findMany({
      where: { userId, isActive: true },
      include: {
        artifacts: {
          select: {
            id: true,
            artifactType: true,
            dateCollected: true,
            fileSize: true
          }
        },
        outcomeProgress: {
          include: {
            outcome: {
              select: {
                subject: true,
                strand: true
              }
            }
          }
        }
      }
    });

    // Calculate overall metrics
    const totalStudents = students.length;
    const totalArtifacts = students.reduce((sum, student) => sum + student.artifacts.length, 0);
    const totalStorageUsed = students.reduce((sum, student) => 
      sum + student.artifacts.reduce((artifactSum, artifact) => artifactSum + (artifact.fileSize || 0), 0), 0
    );

    // Mastery level distribution
    const allProgress = students.flatMap(student => student.outcomeProgress);
    const masteryDistribution = {
      NOT_YET: allProgress.filter(p => p.currentLevel === 'NOT_YET').length,
      APPROACHING: allProgress.filter(p => p.currentLevel === 'APPROACHING').length,
      MEETING: allProgress.filter(p => p.currentLevel === 'MEETING').length,
      EXCEEDING: allProgress.filter(p => p.currentLevel === 'EXCEEDING').length,
      total: allProgress.length
    };

    // Subject-wise progress
    const progressBySubject = allProgress.reduce((acc, progress) => {
      const subject = progress.outcome?.subject || 'Unknown';
      if (!acc[subject]) {
        acc[subject] = {
          NOT_YET: 0,
          APPROACHING: 0,
          MEETING: 0,
          EXCEEDING: 0,
          total: 0
        };
      }
      acc[subject][progress.currentLevel as keyof typeof acc[string]]++;
      acc[subject].total++;
      return acc;
    }, {} as Record<string, any>);

    // Artifact type distribution
    const allArtifacts = students.flatMap(student => student.artifacts);
    const artifactTypes = allArtifacts.reduce((acc, artifact) => {
      acc[artifact.artifactType] = (acc[artifact.artifactType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentArtifacts = allArtifacts.filter(artifact => 
      artifact.dateCollected >= thirtyDaysAgo
    ).length;

    const recentAssessments = allProgress.filter(progress => 
      progress.lastAssessmentDate >= thirtyDaysAgo
    ).length;

    // Student engagement metrics
    const studentMetrics = students.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      artifactCount: student.artifacts.length,
      progressCount: student.outcomeProgress.length,
      lastActivity: Math.max(
        ...[
          ...student.artifacts.map(a => a.dateCollected.getTime()),
          ...student.outcomeProgress.map(p => p.lastAssessmentDate.getTime())
        ]
      ),
      masteryAverage: student.outcomeProgress.length > 0 ? 
        student.outcomeProgress.reduce((sum, p) => {
          const levelScore = { NOT_YET: 0, APPROACHING: 1, MEETING: 2, EXCEEDING: 3 }[p.currentLevel] || 0;
          return sum + levelScore;
        }, 0) / student.outcomeProgress.length : 0
    }));

    res.json({
      overview: {
        totalStudents,
        totalArtifacts,
        totalAssessments: allProgress.length,
        totalStorageUsed,
        storageUsedMB: Math.round(totalStorageUsed / 1024 / 1024 * 100) / 100,
        recentActivity: {
          artifacts: recentArtifacts,
          assessments: recentAssessments
        }
      },
      masteryDistribution,
      progressBySubject,
      artifactTypes,
      studentMetrics: studentMetrics.sort((a, b) => b.lastActivity - a.lastActivity)
    });

  } catch (error: unknown) {
    logger.error('Failed to get class analytics overview', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Failed to retrieve class analytics' });
  }
});

/**
 * GET /api/analytics/evidence-triangulation
 * Analyze evidence triangulation balance across the class
 */
router.get('/evidence-triangulation', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all evidence collections for this teacher's students
    const evidence = await prisma.studentArtifactOutcome.findMany({
      where: {
        artifact: {
          userId
        }
      },
      include: {
        artifact: {
          select: {
            studentId: true,
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        outcome: {
          select: {
            subject: true,
            strand: true,
            code: true
          }
        }
      }
    });

    // Analyze by evidence type
    const evidenceTypes = evidence.reduce((acc, item) => {
      acc[item.evidenceType] = (acc[item.evidenceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Analyze by student
    const studentEvidence = evidence.reduce((acc, item) => {
      const studentId = item.artifact.studentId;
      const studentName = `${item.artifact.student.firstName} ${item.artifact.student.lastName}`;
      
      if (!acc[studentId]) {
        acc[studentId] = {
          name: studentName,
          OBSERVATION: 0,
          CONVERSATION: 0,
          PRODUCT: 0,
          total: 0
        };
      }
      
      acc[studentId][item.evidenceType as keyof typeof acc[string]]++;
      acc[studentId].total++;
      return acc;
    }, {} as Record<string, any>);

    // Calculate triangulation balance for each student
    const triangulationAnalysis = Object.values(studentEvidence).map((student: any) => {
      const total = student.total;
      if (total === 0) {
        return {
          ...student,
          balance: 'No evidence',
          needsAttention: true,
          recommendations: ['Start collecting evidence across all three types']
        };
      }

      const observation = student.OBSERVATION / total;
      const conversation = student.CONVERSATION / total;
      const product = student.PRODUCT / total;

      let balance = 'Well balanced';
      let needsAttention = false;
      const recommendations = [];

      // Check for imbalanced evidence
      if (observation < 0.2) {
        needsAttention = true;
        recommendations.push('Collect more observation evidence');
      }
      if (conversation < 0.2) {
        needsAttention = true;
        recommendations.push('Include more conversation evidence');
      }
      if (product < 0.2) {
        needsAttention = true;
        recommendations.push('Gather more product evidence');
      }

      if (needsAttention) {
        if (recommendations.length > 1) {
          balance = 'Needs multiple types';
        } else {
          balance = 'Needs more ' + recommendations[0].split(' ')[2];
        }
      }

      return {
        ...student,
        percentages: {
          observation: Math.round(observation * 100),
          conversation: Math.round(conversation * 100),
          product: Math.round(product * 100)
        },
        balance,
        needsAttention,
        recommendations
      };
    });

    // Subject-wise triangulation
    const subjectTriangulation = evidence.reduce((acc, item) => {
      const subject = item.outcome?.subject || 'Unknown';
      if (!acc[subject]) {
        acc[subject] = {
          OBSERVATION: 0,
          CONVERSATION: 0,
          PRODUCT: 0,
          total: 0
        };
      }
      acc[subject][item.evidenceType as keyof typeof acc[string]]++;
      acc[subject].total++;
      return acc;
    }, {} as Record<string, any>);

    res.json({
      overview: {
        totalEvidence: evidence.length,
        evidenceTypes,
        averagePerStudent: evidence.length / Object.keys(studentEvidence).length || 0
      },
      triangulationAnalysis: triangulationAnalysis.sort((a, b) => b.total - a.total),
      subjectTriangulation,
      recommendations: {
        classLevel: generateClassRecommendations(triangulationAnalysis),
        studentsNeedingAttention: triangulationAnalysis.filter(s => s.needsAttention).length
      }
    });

  } catch (error: unknown) {
    logger.error('Failed to get evidence triangulation analytics', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Failed to retrieve triangulation analytics' });
  }
});

/**
 * GET /api/analytics/progress-trends
 * Get progress trends over time
 */
router.get('/progress-trends', 
  requireAuth,
  [
    query('timeframe').optional().isIn(['week', 'month', 'term', 'year']).withMessage('Timeframe must be week, month, term, or year'),
    query('subject').optional().isString().withMessage('Subject must be a string')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user!.id;
      const timeframe = req.query.timeframe as string || 'month';
      const subject = req.query.subject as string;

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'term':
          startDate.setMonth(now.getMonth() - 4);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get progress data within timeframe
      const progressData = await prisma.studentOutcomeProgress.findMany({
        where: {
          student: { userId },
          lastAssessmentDate: { gte: startDate },
          ...(subject ? {
            outcome: { subject }
          } : {})
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          outcome: {
            select: {
              subject: true,
              strand: true,
              description: true
            }
          }
        },
        orderBy: { lastAssessmentDate: 'asc' }
      });

      // Group by time periods
      const timeGroups = progressData.reduce((acc, progress) => {
        const date = progress.lastAssessmentDate;
        let timeKey: string;

        if (timeframe === 'week') {
          timeKey = date.toISOString().split('T')[0]; // Daily
        } else {
          timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Monthly
        }

        if (!acc[timeKey]) {
          acc[timeKey] = {
            NOT_YET: 0,
            APPROACHING: 0,
            MEETING: 0,
            EXCEEDING: 0,
            total: 0
          };
        }

        acc[timeKey][progress.currentLevel as keyof typeof acc[string]]++;
        acc[timeKey].total++;
        return acc;
      }, {} as Record<string, any>);

      // Calculate improvement trends
      const studentImprovements = progressData.reduce((acc, progress) => {
        const studentName = `${progress.student.firstName} ${progress.student.lastName}`;
        if (!acc[studentName]) {
          acc[studentName] = [];
        }
        acc[studentName].push({
          date: progress.lastAssessmentDate,
          level: progress.currentLevel,
          outcome: progress.outcome?.description || 'Unknown',
          subject: progress.outcome?.subject || 'Unknown'
        });
        return acc;
      }, {} as Record<string, any[]>);

      res.json({
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        },
        trends: {
          byTime: Object.entries(timeGroups).map(([date, data]) => ({
            date,
            ...data
          })).sort((a, b) => a.date.localeCompare(b.date)),
          totalAssessments: progressData.length,
          improvementRate: calculateImprovementRate(studentImprovements)
        },
        studentImprovements: Object.entries(studentImprovements).map(([name, improvements]) => ({
          studentName: name,
          totalAssessments: improvements.length,
          improvements: improvements.sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        }))
      });

    } catch (error: unknown) {
      logger.error('Failed to get progress trends', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to retrieve progress trends' });
    }
  }
);

/**
 * Helper function to generate class-level recommendations
 */
function generateClassRecommendations(triangulationAnalysis: any[]): string[] {
  const recommendations = [];
  const totalStudents = triangulationAnalysis.length;
  const needingAttention = triangulationAnalysis.filter(s => s.needsAttention).length;
  
  if (needingAttention > totalStudents * 0.5) {
    recommendations.push('Consider implementing more structured evidence collection routines');
  }
  
  const lowObservation = triangulationAnalysis.filter(s => 
    s.total > 0 && (s.OBSERVATION || 0) < s.total * 0.3
  ).length;
  
  if (lowObservation > totalStudents * 0.3) {
    recommendations.push('Focus on increasing observation-based evidence during lessons');
  }
  
  const lowConversation = triangulationAnalysis.filter(s => 
    s.total > 0 && (s.CONVERSATION || 0) < s.total * 0.3
  ).length;
  
  if (lowConversation > totalStudents * 0.3) {
    recommendations.push('Include more conferencing and discussion evidence');
  }
  
  return recommendations;
}

/**
 * Helper function to calculate improvement rate
 */
function calculateImprovementRate(studentImprovements: Record<string, any[]>): number {
  const levelValues = { NOT_YET: 0, APPROACHING: 1, MEETING: 2, EXCEEDING: 3 };
  let totalImprovement = 0;
  let studentsWithMultipleAssessments = 0;
  
  for (const improvements of Object.values(studentImprovements)) {
    if (improvements.length >= 2) {
      const first = levelValues[improvements[0].level as keyof typeof levelValues];
      const last = levelValues[improvements[improvements.length - 1].level as keyof typeof levelValues];
      totalImprovement += (last - first);
      studentsWithMultipleAssessments++;
    }
  }
  
  return studentsWithMultipleAssessments > 0 ? 
    Math.round((totalImprovement / studentsWithMultipleAssessments) * 100) / 100 : 0;
}

/**
 * POST /api/analytics/export
 * Export analytics data in various formats (PDF, CSV, PNG)
 */
router.post('/export', 
  requireAuth,
  [
    body('type').isString().withMessage('Export type is required'),
    body('format').isIn(['pdf', 'csv', 'png']).withMessage('Format must be pdf, csv, or png'),
    body('data').isObject().withMessage('Export data is required')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user!.id;
      const { type, format, data } = req.body;
      
      logger.info(`Exporting analytics data: ${type} as ${format}`, JSON.stringify({ userId, type, format }));

      if (format === 'csv') {
        // Export as CSV
        const csvData = await generateCSVExport(type, data, userId);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvData);
        
      } else if (format === 'pdf') {
        // Export as PDF (basic implementation - could be enhanced)
        const pdfBuffer = await generatePDFExport(type, data, userId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfBuffer);
        
      } else if (format === 'png') {
        // Export as PNG (placeholder - would need chart generation library)
        res.status(501).json({ error: 'PNG export not yet implemented' });
        
      } else {
        res.status(400).json({ error: 'Unsupported export format' });
      }
      
    } catch (error: unknown) {
      logger.error('Failed to export analytics data', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to export analytics data' });
    }
  }
);

/**
 * Helper function to generate CSV export
 */
async function generateCSVExport(type: string, data: any, userId: number): Promise<string> {
  let csvContent = '';
  
  if (type === 'class-overview') {
    // Export class overview as CSV
    csvContent = 'Student,Artifacts,Assessments,Mastery Average,Last Activity\n';
    
    if (data.studentMetrics) {
      data.studentMetrics.forEach((student: any) => {
        const lastActivity = student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'N/A';
        csvContent += `"${student.name}",${student.artifactCount},${student.progressCount},${student.masteryAverage.toFixed(2)},"${lastActivity}"\n`;
      });
    }
    
  } else if (type === 'evidence-triangulation') {
    // Export triangulation analysis as CSV
    csvContent = 'Student,Total Evidence,Observation %,Conversation %,Product %,Balance Status,Needs Attention\n';
    
    if (data.triangulationAnalysis) {
      data.triangulationAnalysis.forEach((analysis: any) => {
        const obs = analysis.percentages?.observation || 0;
        const conv = analysis.percentages?.conversation || 0;
        const prod = analysis.percentages?.product || 0;
        csvContent += `"${analysis.name}",${analysis.total},${obs}%,${conv}%,${prod}%,"${analysis.balance}",${analysis.needsAttention ? 'Yes' : 'No'}\n`;
      });
    }
    
  } else if (type === 'progress-trends') {
    // Export progress trends as CSV
    csvContent = 'Date,Not Yet,Approaching,Meeting,Exceeding,Total\n';
    
    if (data.trends?.byTime) {
      data.trends.byTime.forEach((trend: any) => {
        csvContent += `"${trend.date}",${trend.NOT_YET || 0},${trend.APPROACHING || 0},${trend.MEETING || 0},${trend.EXCEEDING || 0},${trend.total || 0}\n`;
      });
    }
    
  } else {
    // Generic data export
    csvContent = 'Key,Value\n';
    for (const [key, value] of Object.entries(data)) {
      csvContent += `"${key}","${String(value)}"\n`;
    }
  }
  
  return csvContent;
}

/**
 * Helper function to generate PDF export (basic implementation)
 */
async function generatePDFExport(type: string, data: any, userId: number): Promise<Buffer> {
  // This is a basic text-based PDF. In a real implementation, you'd use
  // a proper PDF library like PDFKit or similar for better formatting
  const pdfContent = `
Analytics Export: ${type}
Generated: ${new Date().toLocaleDateString()}
Teacher ID: ${userId}

Data:
${JSON.stringify(data, null, 2)}
`;
  
  // For now, return a simple text buffer
  // In production, you'd use PDFKit or similar to create a proper PDF
  return Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${pdfContent.length}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${pdfContent.replace(/\n/g, ') Tj 0 -14 Td (')}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${250 + pdfContent.length}
%%EOF`, 'utf-8');
}

export { router };