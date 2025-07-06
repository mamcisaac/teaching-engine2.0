/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Simple database connectivity test for debugging
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@teaching-engine/database';

let prisma: PrismaClient;

describe('Database Debug Tests', () => {
  beforeEach(async () => {
    // Create direct Prisma client
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./test.db',
        },
      },
    });

    // Clear users table
    await prisma.user.deleteMany({});
  });

  afterEach(async () => {
    // Clean up and disconnect
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create a user successfully', async () => {
    console.log('Starting user creation test...');

    const userData = {
      email: 'test@example.com',
      password: 'hashed_password_123',
      name: 'Test User',
      role: 'teacher',
    };

    console.log('User data to create:', userData);

    try {
      const user = await prisma.user.create({
        data: userData,
      });

      console.log('User created successfully:', user);

      expect(user).toBeTruthy();
      expect(user.id).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
    } catch (_error) {
      console.error('Error creating user:', error);
      throw error;
    }
  });

  it('should read a user successfully', async () => {
    // First create a user
    const userData = {
      email: 'read-test@example.com',
      password: 'hashed_password_123',
      name: 'Read Test User',
      role: 'teacher',
    };

    const createdUser = await prisma.user.create({
      data: userData,
    });

    console.log('Created user for read test:', createdUser);

    // Then read it back
    const foundUser = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });

    console.log('Found user:', foundUser);

    expect(foundUser).toBeTruthy();
    expect(foundUser!.email).toBe(userData.email);
  });
});
