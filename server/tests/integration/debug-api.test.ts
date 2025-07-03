/**
 * Debug API test to identify validation issues
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
} from '../integration-test-setup';

// Import the actual app
let app: any;

beforeEach(async () => {
  // Import the actual app
  const appModule = await import('../../src/index');
  app = appModule.app;
});

describe('API Debug Tests', () => {
  let teacherToken: string;
  let teacherId: number;

  beforeEach(async () => {
    // Clean any existing test data
    await cleanIntegrationTestData();

    // Use the integration test Prisma client
    const prisma = getIntegrationTestPrismaClient();

    console.log('Creating test user...');

    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash('SecurePassword123!', 12);

    const user = await prisma.user.create({
      data: {
        email: 'testteacher@example.com',
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher',
      },
    });

    console.log('Created user:', user);
    teacherId = user.id;

    // Login to get token
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'testteacher@example.com',
      password: 'SecurePassword123!',
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response body:', loginResponse.body);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeTruthy();

    teacherToken = loginResponse.body.accessToken;
  });

  it('should test schema validation directly', async () => {
    // Test the schema directly
    const { z } = await import('zod');

    const studentCreateSchema = z
      .object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        grade: z.number().int().min(1).max(12).optional(),
        name: z.string().min(1).max(200).optional(),
      })
      .refine(
        (data) => {
          return (data.firstName && data.lastName && typeof data.grade === 'number') || data.name;
        },
        {
          message: 'Either provide firstName, lastName, and grade, or provide name',
        },
      );

    const testData = {
      firstName: 'Test',
      lastName: 'Student',
      grade: 5,
    };

    console.log('Testing schema with data:', testData);

    try {
      const result = studentCreateSchema.parse(testData);
      console.log('Schema validation passed:', result);
    } catch (error) {
      console.error('Schema validation failed:', error);
    }
  });

  it('should create a student successfully', async () => {
    console.log('Attempting to create student...');
    console.log('Using token:', teacherToken);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    const createStudentResponse = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Student',
        grade: 5,
      });

    console.log('Create student response status:', createStudentResponse.status);
    console.log('Create student response body:', createStudentResponse.body);
    console.log('Create student response headers:', createStudentResponse.headers);

    if (createStudentResponse.status !== 201) {
      console.error('Student creation failed with status:', createStudentResponse.status);
      console.error('Error body:', createStudentResponse.body);
    }

    expect(createStudentResponse.status).toBe(201);
    expect(createStudentResponse.body.id).toBeTruthy();
  });

  it('should get students list', async () => {
    // First create a student
    await request(app).post('/api/students').set('Authorization', `Bearer ${teacherToken}`).send({
      firstName: 'Test',
      lastName: 'Student',
      grade: 5,
    });

    // Then try to get the list
    const getStudentsResponse = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`);

    console.log('Get students response status:', getStudentsResponse.status);
    console.log('Get students response body:', getStudentsResponse.body);

    expect(getStudentsResponse.status).toBe(200);
  });
});
