/**
 * Artillery.io Custom Processor for Teaching Engine 2.0
 * Handles education-specific workflow logic and custom metrics
 */

import { faker } from '@faker-js/faker';

// Custom function helpers for educational scenarios
export function authenticateTeacher(requestParams, context, next) {
  // Simulate realistic teacher login flow
  context.vars.username =
    context.vars.username || `teacher${faker.number.int({ min: 1, max: 1000 })}@school.edu`;
  context.vars.password = context.vars.password || 'Teacher123!';

  // Set realistic teacher context
  context.vars.grade =
    context.vars.grade || faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6']);
  context.vars.subject =
    context.vars.subject ||
    faker.helpers.arrayElement([
      'Mathematics',
      'Language Arts',
      'Science',
      'Social Studies',
      'French',
    ]);

  return next();
}

export function beforeRequest(requestParams, context, next) {
  // Add realistic delays based on teacher behavior patterns
  const teacherThinkTime = {
    login: 2000, // Teachers take time to enter credentials
    planning: 15000, // Thoughtful planning requires time
    browsing: 3000, // Quick scanning of content
    data_entry: 8000, // Careful data entry
    ai_generation: 25000, // Waiting for AI responses
  };

  // Add request timing for performance analysis
  requestParams.timestamp = Date.now();

  // Simulate realistic user behavior with appropriate think times
  const endpoint = requestParams.url;
  if (endpoint.includes('/auth/')) {
    setTimeout(next, teacherThinkTime.login);
  } else if (endpoint.includes('/lesson-plans') || endpoint.includes('/unit-plans')) {
    setTimeout(next, teacherThinkTime.planning);
  } else if (endpoint.includes('/curriculum') || endpoint.includes('/search')) {
    setTimeout(next, teacherThinkTime.browsing);
  } else if (endpoint.includes('/students') || endpoint.includes('/progress')) {
    setTimeout(next, teacherThinkTime.data_entry);
  } else if (endpoint.includes('/ai-') || endpoint.includes('/generate')) {
    setTimeout(next, teacherThinkTime.ai_generation);
  } else {
    return next();
  }
}

export function afterResponse(requestParams, response, context, next) {
  // Capture custom education-specific metrics
  const responseTime = Date.now() - requestParams.timestamp;
  const endpoint = requestParams.url;

  // Track critical teacher workflow performance
  if (endpoint.includes('/auth/login')) {
    context.vars.loginTime = responseTime;
    if (responseTime > 500) {
      console.warn(`⚠️  Login took ${responseTime}ms - exceeds 500ms SLA`);
    }
  }

  if (endpoint.includes('/dashboard')) {
    context.vars.dashboardLoadTime = responseTime;
    if (responseTime > 1500) {
      console.warn(`⚠️  Dashboard load took ${responseTime}ms - exceeds 1500ms SLA`);
    }
  }

  if (endpoint.includes('/etfo-lesson-plans') && requestParams.method === 'POST') {
    context.vars.lessonCreationTime = responseTime;
    if (responseTime > 2000) {
      console.warn(`⚠️  Lesson creation took ${responseTime}ms - exceeds 2000ms SLA`);
    }
  }

  if (endpoint.includes('/ai-')) {
    context.vars.aiGenerationTime = responseTime;
    if (responseTime > 10000) {
      console.warn(`⚠️  AI generation took ${responseTime}ms - exceeds 10000ms SLA`);
    }
  }

  // Track error patterns specific to educational workflows
  if (response.statusCode >= 400) {
    console.error(`❌ Educational workflow error: ${endpoint} - Status: ${response.statusCode}`);

    // Specific error handling for critical teacher functions
    if (endpoint.includes('/curriculum-expectations') && response.statusCode === 404) {
      console.error('🚨 Critical: Curriculum expectations not found - impacts lesson planning');
    }

    if (endpoint.includes('/students') && response.statusCode >= 500) {
      console.error('🚨 Critical: Student data service unavailable - impacts daily operations');
    }

    if (endpoint.includes('/auth/') && response.statusCode === 401) {
      console.error('🚨 Critical: Authentication failure - prevents teacher access');
    }
  }

  // Validate response content for educational data integrity
  if (response.statusCode === 200 && response.body) {
    try {
      const body = JSON.parse(response.body);

      // Validate lesson plan structure
      if (endpoint.includes('/etfo-lesson-plans') && body.id) {
        if (!body.learningGoals || !Array.isArray(body.learningGoals)) {
          console.warn('⚠️  Lesson plan missing required learning goals');
        }
        if (!body.successCriteria || !Array.isArray(body.successCriteria)) {
          console.warn('⚠️  Lesson plan missing required success criteria');
        }
      }

      // Validate curriculum expectation data
      if (endpoint.includes('/curriculum-expectations') && Array.isArray(body)) {
        body.forEach((expectation) => {
          if (!expectation.code || !expectation.description) {
            console.warn('⚠️  Curriculum expectation missing required fields');
          }
        });
      }

      // Validate student data structure
      if (endpoint.includes('/students') && body.id) {
        if (!body.firstName || !body.lastName || !body.grade) {
          console.warn('⚠️  Student record missing required demographic information');
        }
      }
    } catch (parseError) {
      console.warn(`⚠️  Could not parse response body for validation: ${parseError.message}`);
    }
  }

  return next();
}

// Custom helper functions for realistic test data
export function setTestContext(context, next) {
  // Set up realistic school context
  context.vars.schoolYear = '2024-2025';
  context.vars.currentTerm = faker.helpers.arrayElement(['Fall', 'Winter', 'Spring']);
  context.vars.schoolBoard = faker.helpers.arrayElement([
    'Toronto District School Board',
    'Peel District School Board',
    'York Region District School Board',
    'Ottawa-Carleton District School Board',
  ]);

  // Set teacher specialization
  context.vars.teacherSpecialty = faker.helpers.arrayElement([
    'Elementary Generalist',
    'Mathematics Specialist',
    'Special Education',
    'French Immersion',
    'ESL Support',
  ]);

  // Set realistic class size
  context.vars.classSize = faker.number.int({ min: 18, max: 28 });

  return next();
}

// Performance threshold monitoring
export function checkPerformanceThresholds(context, next) {
  const thresholds = {
    login: 500, // 500ms for login
    dashboard: 1500, // 1.5s for dashboard
    lessonCreation: 2000, // 2s for lesson creation
    aiGeneration: 10000, // 10s for AI content
    search: 300, // 300ms for search
    dataEntry: 1000, // 1s for data entry operations
  };

  // Check if any thresholds were exceeded
  let thresholdViolations = 0;

  Object.keys(thresholds).forEach((operation) => {
    const timeVar = `${operation}Time`;
    if (context.vars[timeVar] && context.vars[timeVar] > thresholds[operation]) {
      thresholdViolations++;
      console.warn(
        `🎯 Performance threshold exceeded: ${operation} took ${context.vars[timeVar]}ms (limit: ${thresholds[operation]}ms)`,
      );
    }
  });

  // Track threshold violations for reporting
  context.vars.thresholdViolations = thresholdViolations;

  return next();
}

// Realistic data generators specific to education
export const educationDataGenerators = {
  randomGrade: () => faker.helpers.arrayElement(['K', '1', '2', '3', '4', '5', '6', '7', '8']),

  randomSubject: () =>
    faker.helpers.arrayElement([
      'Mathematics',
      'Language Arts',
      'Science',
      'Social Studies',
      'French',
      'Health & Physical Education',
      'The Arts',
    ]),

  randomLearningGoal: () =>
    faker.helpers.arrayElement([
      'Students will understand the concept of place value',
      'Students will demonstrate reading comprehension strategies',
      'Students will identify characteristics of living things',
      'Students will analyze historical cause and effect relationships',
      'Students will express ideas clearly in French',
      'Students will demonstrate teamwork skills in physical activities',
    ]),

  randomSuccessCriteria: () =>
    faker.helpers.arrayElement([
      'I can explain my thinking using math vocabulary',
      'I can make connections between the text and my own experiences',
      'I can classify objects as living or non-living',
      'I can identify at least two causes of a historical event',
      'I can have a simple conversation in French',
      'I can work cooperatively with my classmates',
    ]),

  randomAssessmentType: () =>
    faker.helpers.arrayElement([
      'observation',
      'conversation',
      'product',
      'formative',
      'summative',
      'diagnostic',
    ]),

  randomAccommodation: () =>
    faker.helpers.arrayElement([
      'Extended time for assessments',
      'Alternative seating arrangement',
      'Visual supports and graphic organizers',
      'Reduced written output requirements',
      'Audio recording of instructions',
      'Frequent breaks as needed',
    ]),
};

// Export all functions for Artillery usage
export default {
  authenticateTeacher,
  beforeRequest,
  afterResponse,
  setTestContext,
  checkPerformanceThresholds,
  ...educationDataGenerators,
};
