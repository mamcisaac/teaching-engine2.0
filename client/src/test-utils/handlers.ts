/**
 * MSW Request Handlers
 * Network-level API mocking for realistic client tests
 */

import { rest } from 'msw';

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export const handlers = [
  // Authentication endpoints
  rest.post(`${BASE_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER',
          },
          token: 'mock-jwt-token',
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),

  rest.post(`${BASE_URL}/auth/register`, (req, res, ctx) => {
    const { email, password, name } = req.body as any;
    
    if (email === 'existing@example.com') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'User already exists' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        user: {
          id: Math.floor(Math.random() * 1000),
          email,
          name,
          role: 'USER',
        },
        token: 'mock-jwt-token',
      })
    );
  }),

  rest.get(`${BASE_URL}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      })
    );
  }),

  // User management
  rest.get(`${BASE_URL}/api/users/profile`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString(),
      })
    );
  }),

  // Students
  rest.get(`${BASE_URL}/api/students`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          grade: 5,
          userId: 1,
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          grade: 5,
          userId: 1,
        },
      ])
    );
  }),

  rest.post(`${BASE_URL}/api/students`, (req, res, ctx) => {
    const { firstName, lastName, grade } = req.body as any;
    
    return res(
      ctx.status(201),
      ctx.json({
        id: Math.floor(Math.random() * 1000),
        firstName,
        lastName,
        grade,
        userId: 1,
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Curriculum Expectations
  rest.get(`${BASE_URL}/api/curriculum-expectations`, (req, res, ctx) => {
    const subject = req.url.searchParams.get('subject');
    const grade = req.url.searchParams.get('grade');
    
    const expectations = [
      {
        id: 'exp-1',
        code: 'MATH.5.NBT.1',
        description: 'Recognize place value',
        subject: 'Mathematics',
        grade: 5,
        strand: 'Number and Operations',
      },
      {
        id: 'exp-2',
        code: 'SCI.5.ESS.1',
        description: 'Earth systems interactions',
        subject: 'Science',
        grade: 5,
        strand: 'Earth Science',
      },
    ];

    const filtered = expectations.filter(exp => {
      return (!subject || exp.subject === subject) &&
             (!grade || exp.grade === parseInt(grade));
    });

    return res(ctx.status(200), ctx.json(filtered));
  }),

  // Planning endpoints
  rest.get(`${BASE_URL}/api/long-range-plans`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'lrp-1',
          title: 'Fall Mathematics Plan',
          subject: 'Mathematics',
          grade: 5,
          startDate: '2024-09-01',
          endDate: '2024-12-20',
          userId: 1,
        },
      ])
    );
  }),

  rest.post(`${BASE_URL}/api/long-range-plans`, (req, res, ctx) => {
    const planData = req.body as any;
    
    return res(
      ctx.status(201),
      ctx.json({
        id: `lrp-${Math.floor(Math.random() * 1000)}`,
        ...planData,
        userId: 1,
        createdAt: new Date().toISOString(),
      })
    );
  }),

  rest.get(`${BASE_URL}/api/unit-plans`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'up-1',
          title: 'Number Sense Unit',
          subject: 'Mathematics',
          grade: 5,
          startDate: '2024-09-01',
          endDate: '2024-10-15',
          longRangePlanId: 'lrp-1',
          userId: 1,
        },
      ])
    );
  }),

  rest.get(`${BASE_URL}/api/etfo-lesson-plans`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'elp-1',
          title: 'Introduction to Fractions',
          subject: 'Mathematics',
          grade: 5,
          date: '2024-09-15',
          duration: 60,
          threePartLesson: {
            minds_on: 'Fraction pizza activity',
            action: 'Hands-on fraction exploration',
            consolidation: 'Share discoveries',
          },
          unitPlanId: 'up-1',
          userId: 1,
        },
      ])
    );
  }),

  // AI Generation endpoints
  rest.post(`${BASE_URL}/api/ai/generate-activity`, (req, res, ctx) => {
    const { subject, grade, expectations } = req.body as any;
    
    // Simulate AI processing delay
    return res(
      ctx.delay(1000),
      ctx.status(200),
      ctx.json({
        id: `activity-${Math.floor(Math.random() * 1000)}`,
        title: `${subject} Activity for Grade ${grade}`,
        description: 'AI-generated activity description',
        instructions: 'Step-by-step instructions',
        materials: ['Paper', 'Pencils', 'Manipulatives'],
        assessmentCriteria: 'Assessment rubric',
        subject,
        grade,
        expectations,
        activityType: 'practice',
        duration: 30,
        userId: 1,
      })
    );
  }),

  rest.post(`${BASE_URL}/api/ai/generate-lesson-plan`, (req, res, ctx) => {
    const { subject, grade, title } = req.body as any;
    
    return res(
      ctx.delay(2000),
      ctx.status(200),
      ctx.json({
        id: `lesson-${Math.floor(Math.random() * 1000)}`,
        title: title || `${subject} Lesson for Grade ${grade}`,
        subject,
        grade,
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        threePartLesson: {
          minds_on: 'AI-generated minds on activity',
          action: 'AI-generated main activity',
          consolidation: 'AI-generated consolidation',
        },
        learningGoals: ['Learning goal 1', 'Learning goal 2'],
        successCriteria: ['Success criteria 1', 'Success criteria 2'],
        materials: ['AI-suggested materials'],
        accommodations: 'AI-generated accommodations',
        userId: 1,
      })
    );
  }),

  // Calendar endpoints
  rest.get(`${BASE_URL}/api/calendar-events`, (req, res, ctx) => {
    const start = req.url.searchParams.get('start');
    const end = req.url.searchParams.get('end');
    
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'event-1',
          title: 'Math Lesson',
          start: '2024-09-15T09:00:00Z',
          end: '2024-09-15T10:00:00Z',
          type: 'LESSON',
          userId: 1,
        },
        {
          id: 'event-2',
          title: 'Parent-Teacher Conference',
          start: '2024-09-16T15:00:00Z',
          end: '2024-09-16T16:00:00Z',
          type: 'MEETING',
          userId: 1,
        },
      ])
    );
  }),

  // Newsletter endpoints
  rest.get(`${BASE_URL}/api/newsletters`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'newsletter-1',
          title: 'Weekly Update',
          content: 'Newsletter content here',
          date: '2024-09-15',
          published: true,
          userId: 1,
        },
      ])
    );
  }),

  // File upload
  rest.post(`${BASE_URL}/api/upload`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        url: 'https://example.com/uploaded-file.pdf',
        filename: 'uploaded-file.pdf',
        size: 1024,
      })
    );
  }),

  // Error simulation handlers
  rest.get(`${BASE_URL}/api/test/error-500`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal server error' })
    );
  }),

  rest.get(`${BASE_URL}/api/test/error-404`, (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json({ error: 'Not found' })
    );
  }),

  rest.get(`${BASE_URL}/api/test/slow`, (req, res, ctx) => {
    return res(
      ctx.delay(5000),
      ctx.status(200),
      ctx.json({ message: 'Slow response' })
    );
  }),

  // Rate limiting simulation
  rest.get(`${BASE_URL}/api/test/rate-limit`, (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.json({ error: 'Too many requests' }),
      ctx.set('Retry-After', '60')
    );
  }),
];