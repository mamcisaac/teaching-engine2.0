import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import planningRoutes from '../planning';
import { 
  calculateWeeklyPlanDiagnostics, 
  getPlanningQualityTrend 
} from '../../services/planning/weeklyPlanDiagnostics';

const mockCalculateWeeklyPlanDiagnostics = calculateWeeklyPlanDiagnostics as ReturnType<typeof vi.fn>;
const mockGetPlanningQualityTrend = getPlanningQualityTrend as ReturnType<typeof vi.fn>;

// Mock the services
vi.mock('../../services/planning/weeklyPlanDiagnostics', () => ({
  calculateWeeklyPlanDiagnostics: vi.fn(),
  getPlanningQualityTrend: vi.fn(),
}));

// Mock auth middleware
vi.mock('../../middleware/auth', () => ({
  requireAuth: (req: Request, res: Response, next: NextFunction) => {
    req.user = { userId: '1' };
    next();
  },
}));

describe('Planning Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/planning', planningRoutes);
  });

  describe('GET /api/planning/quality-score', () => {
    const mockDiagnostics = {
      metrics: {
        outcomesCoverage: 75,
        assessmentBalance: 80,
        engagementVariety: 70,
        differentiationScore: 85,
        timeEfficiency: 90,
        domainBalance: 75,
        themeConsistency: 80,
        vocabularyIntegration: 65,
        overallScore: 77.5,
      },
      suggestions: ['Add more activities'],
      warnings: ['Too many assessments'],
      strengths: ['Good coverage'],
      missingDomains: ['Art'],
      overusedDomains: ['Math'],
      uncoveredOutcomes: ['LA.1.1'],
    };

    it('returns diagnostics for specified week', async () => {
      mockCalculateWeeklyPlanDiagnostics.mockResolvedValue(mockDiagnostics);

      const response = await request(app)
        .get('/api/planning/quality-score')
        .query({ weekStart: '2024-01-22' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDiagnostics);
      expect(calculateWeeklyPlanDiagnostics).toHaveBeenCalledWith({
        weekStart: expect.any(Date),
        userId: 1,
      });
    });

    it('uses current week when weekStart not provided', async () => {
      mockCalculateWeeklyPlanDiagnostics.mockResolvedValue(mockDiagnostics);

      const response = await request(app)
        .get('/api/planning/quality-score');

      expect(response.status).toBe(200);
      expect(calculateWeeklyPlanDiagnostics).toHaveBeenCalledWith({
        weekStart: expect.any(Date),
        userId: 1,
      });
    });

    it('handles service errors', async () => {
      mockCalculateWeeklyPlanDiagnostics.mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/planning/quality-score');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/planning/quality-trend', () => {
    const mockTrend = [
      { week: '2024-01-01', score: 65 },
      { week: '2024-01-08', score: 70 },
      { week: '2024-01-15', score: 75 },
      { week: '2024-01-22', score: 78 },
    ];

    it('returns trend data for default weeks', async () => {
      mockGetPlanningQualityTrend.mockResolvedValue(mockTrend);

      const response = await request(app)
        .get('/api/planning/quality-trend');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTrend);
      expect(getPlanningQualityTrend).toHaveBeenCalledWith(1, 8);
    });

    it('returns trend data for specified weeks', async () => {
      mockGetPlanningQualityTrend.mockResolvedValue(mockTrend.slice(0, 2));

      const response = await request(app)
        .get('/api/planning/quality-trend')
        .query({ weeks: '4' });

      expect(response.status).toBe(200);
      expect(getPlanningQualityTrend).toHaveBeenCalledWith(1, 4);
    });

    it('handles service errors', async () => {
      mockGetPlanningQualityTrend.mockRejectedValue(
        new Error('Service error')
      );

      const response = await request(app)
        .get('/api/planning/quality-trend');

      expect(response.status).toBe(500);
    });
  });

  describe('Authentication', () => {
    it('returns 401 when user not authenticated', async () => {
      // Override the mock auth middleware for this test
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.use('/api/planning', (req: Request, res: Response, next: NextFunction) => {
        req.user = null; // No user
        next();
      }, planningRoutes);

      const response = await request(unauthApp)
        .get('/api/planning/quality-score');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });
  });
});