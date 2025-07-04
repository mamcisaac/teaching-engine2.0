/**
 * Mock API handlers for testing
 * Basic mock responses without MSW dependency
 */

// Mock data
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER' as const,
};

export const mockUnitPlans = [
  {
    id: '1',
    title: 'Fractions Unit',
    description: 'Introduction to fractions',
    longRangePlanId: '1',
    userId: 1,
    startDate: '2024-03-01',
    endDate: '2024-03-15',
    bigIdeas: 'Fractions represent parts of a whole',
    grade: 4,
    subjects: ['Mathematics'],
    totalHours: 20,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    expectations: [],
    resources: [],
    _count: {
      lessonPlans: 5,
    },
  },
];

export const mockLessonPlans = [
  {
    id: '1',
    title: 'Introduction to Fractions',
    description: 'Basic fraction concepts',
    unitPlanId: '1',
    userId: 1,
    date: '2024-03-01',
  },
];

export const mockNotifications = [
  {
    id: 1,
    message: 'Test notification',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

// Mock API responses
export const mockResponses = {
  auth: {
    login: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser,
    },
    me: mockUser,
    logout: { success: true },
  },
  unitPlans: mockUnitPlans,
  lessonPlans: mockLessonPlans,
  notifications: mockNotifications,
  curriculumExpectations: [
    {
      id: '1',
      code: 'M4.N1',
      description: 'Demonstrate understanding of fractions',
      grade: 4,
      subject: 'Mathematics',
      strand: 'Number',
    },
  ],
};