/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import { ActivityCollection, ExternalActivity, ActivityCollectionItem } from '@prisma/client';

describe('Activity Collections Routes', () => {
  let authToken: string;
  let userId: number;
  let testEmail: string;
  let testActivity1: ExternalActivity;
  let testActivity2: ExternalActivity;
  let testActivity3: ExternalActivity;
  let testCollection: ActivityCollection;

  beforeAll(async () => {
    // Create test user
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    testEmail = `activity-collections-test-${timestamp}@example.com`;

    // Clean up any existing user
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: hashedPassword,
        role: 'TEACHER',
      },
    });

    userId = testUser.id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'testpassword123',
      });

    authToken = loginResponse.body.token;
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.activityCollectionItem.deleteMany({});
    await prisma.activityCollection.deleteMany({ where: { userId } });
    await prisma.externalActivity.deleteMany({});

    // Create test activities
    testActivity1 = await prisma.externalActivity.create({
      data: {
        title: 'Math Manipulatives Activity',
        description: 'Hands-on learning with blocks and shapes',
        type: 'hands-on',
        subject: 'Mathematics',
        gradeLevel: '3-5',
        duration: 45,
        materials: ['blocks', 'shapes', 'counters'],
        instructions: 'Use manipulatives to explore fractions',
        source: 'Teaching Resources Hub',
        sourceUrl: 'https://example.com/math-activity',
        tags: ['math', 'fractions', 'manipulatives'],
      },
    });

    testActivity2 = await prisma.externalActivity.create({
      data: {
        title: 'Science Experiment: Plant Growth',
        description: 'Observe and document plant growth over time',
        type: 'experiment',
        subject: 'Science',
        gradeLevel: '2-4',
        duration: 30,
        materials: ['seeds', 'soil', 'pots', 'water'],
        instructions: 'Plant seeds and track growth daily',
        source: 'Science for Kids',
        sourceUrl: 'https://example.com/plant-experiment',
        tags: ['science', 'plants', 'experiment'],
      },
    });

    testActivity3 = await prisma.externalActivity.create({
      data: {
        title: 'Creative Writing Prompts',
        description: 'Engaging writing prompts for storytelling',
        type: 'writing',
        subject: 'Language Arts',
        gradeLevel: '4-6',
        duration: 60,
        materials: ['paper', 'pencils'],
        instructions: 'Choose a prompt and write a story',
        source: 'Writing Workshop',
        sourceUrl: 'https://example.com/writing-prompts',
        tags: ['writing', 'creativity', 'language'],
      },
    });

    // Create a test collection
    testCollection = await prisma.activityCollection.create({
      data: {
        userId,
        name: 'My Favorite Activities',
        description: 'A collection of go-to classroom activities',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.activityCollectionItem.deleteMany({});
    await prisma.activityCollection.deleteMany({ where: { userId } });
    await prisma.externalActivity.deleteMany({});
    await prisma.user.delete({ where: { id: userId } });
  });

  describe('GET /api/activity-collections', () => {
    test('should get user collections', async () => {
      // Create additional collections
      await prisma.activityCollection.createMany({
        data: [
          {
            userId,
            name: 'Science Activities',
            description: 'Collection of science experiments',
          },
          {
            userId,
            name: 'Math Games',
            description: 'Fun math activities and games',
          },
        ],
      });

      const response = await request(app)
        .get('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      
      // Should include collection details
      const collection = response.body.data[0];
      expect(collection).toHaveProperty('id');
      expect(collection).toHaveProperty('name');
      expect(collection).toHaveProperty('description');
      expect(collection).toHaveProperty('_count');
      expect(collection._count).toHaveProperty('items');
      expect(collection).toHaveProperty('user');
      expect(collection.user).toHaveProperty('id');
      expect(collection.user).toHaveProperty('name');
    });

    test('should order collections by updatedAt desc', async () => {
      // Create collections with different update times
      const oldCollection = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'Old Collection',
          description: 'Created first',
          updatedAt: new Date('2024-01-01'),
        },
      });

      const newCollection = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'New Collection',
          description: 'Created recently',
          updatedAt: new Date('2024-01-04'),
        },
      });

      const response = await request(app)
        .get('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data[0].name).toBe('New Collection');
      expect(response.body.data[response.body.data.length - 1].name).toBe('Old Collection');
    });

    test('should only show user own collections', async () => {
      // Create another user with collections
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-collections-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Other User Collection',
          description: 'Should not be visible',
        },
      });

      const response = await request(app)
        .get('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.every((c: unknown) => c.user.id === userId)).toBe(true);
      expect(response.body.data.find((c: unknown) => c.name === 'Other User Collection')).toBeUndefined();
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/activity-collections');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/activity-collections/:collectionId', () => {
    beforeEach(async () => {
      // Add activities to test collection
      await prisma.activityCollectionItem.createMany({
        data: [
          {
            collectionId: testCollection.id,
            activityId: testActivity1.id,
            addedAt: new Date('2024-01-01'),
          },
          {
            collectionId: testCollection.id,
            activityId: testActivity2.id,
            addedAt: new Date('2024-01-02'),
          },
        ],
      });
    });

    test('should get collection details with activities', async () => {
      const response = await request(app)
        .get(`/api/activity-collections/${testCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const collection = response.body.data;
      expect(collection.id).toBe(testCollection.id);
      expect(collection.name).toBe('My Favorite Activities');
      expect(collection.description).toBe('A collection of go-to classroom activities');
      expect(collection.items).toHaveLength(2);
      
      // Should order by addedAt desc
      expect(collection.items[0].activity.title).toBe('Science Experiment: Plant Growth');
      expect(collection.items[1].activity.title).toBe('Math Manipulatives Activity');
      
      // Should include full activity details
      const item = collection.items[0];
      expect(item.activity).toHaveProperty('title');
      expect(item.activity).toHaveProperty('description');
      expect(item.activity).toHaveProperty('type');
      expect(item.activity).toHaveProperty('subject');
      expect(item.activity).toHaveProperty('gradeLevel');
    });

    test('should return 404 for non-existent collection', async () => {
      const response = await request(app)
        .get('/api/activity-collections/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found');
    });

    test('should not allow access to other user collections', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-detail-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherCollection = await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Private Collection',
          description: 'Should not be accessible',
        },
      });

      const response = await request(app)
        .get(`/api/activity-collections/${otherCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/activity-collections/${testCollection.id}`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/activity-collections', () => {
    test('should create a new collection', async () => {
      const newCollection = {
        name: 'STEM Activities',
        description: 'Science, Technology, Engineering, and Math activities',
      };

      const response = await request(app)
        .post('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCollection);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const collection = response.body.data;
      expect(collection).toHaveProperty('id');
      expect(collection.name).toBe('STEM Activities');
      expect(collection.description).toBe('Science, Technology, Engineering, and Math activities');
      expect(collection.userId).toBe(userId);

      // Verify in database
      const dbCollection = await prisma.activityCollection.findUnique({
        where: { id: collection.id },
      });
      expect(dbCollection).toBeTruthy();
    });

    test('should create collection without description', async () => {
      const response = await request(app)
        .post('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Quick Collection' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Quick Collection');
      expect(response.body.data.description).toBeNull();
    });

    test('should validate collection name', async () => {
      const response = await request(app)
        .post('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should enforce name length limits', async () => {
      const longName = 'A'.repeat(101);
      const response = await request(app)
        .post('/api/activity-collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: longName });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/activity-collections')
        .send({ name: 'Test Collection' });
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/activity-collections/:collectionId', () => {
    test('should update collection name and description', async () => {
      const updates = {
        name: 'Updated Collection Name',
        description: 'Updated description with more details',
      };

      const response = await request(app)
        .put(`/api/activity-collections/${testCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const updated = response.body.data;
      expect(updated.name).toBe('Updated Collection Name');
      expect(updated.description).toBe('Updated description with more details');

      // Verify in database
      const dbCollection = await prisma.activityCollection.findUnique({
        where: { id: testCollection.id },
      });
      expect(dbCollection?.name).toBe('Updated Collection Name');
    });

    test('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/api/activity-collections/${testCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Just Name Updated' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Just Name Updated');
      expect(response.body.data.description).toBe(testCollection.description);
    });

    test('should not allow updating other user collections', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-update-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherCollection = await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Other Collection',
          description: 'Cannot update this',
        },
      });

      const response = await request(app)
        .put(`/api/activity-collections/${otherCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked!' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found or you do not have permission to edit it');
    });

    test('should validate updates', async () => {
      const response = await request(app)
        .put(`/api/activity-collections/${testCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/activity-collections/${testCollection.id}`)
        .send({ name: 'Updated' });
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/activity-collections/:collectionId', () => {
    test('should delete collection and its items', async () => {
      // Add items to collection
      await prisma.activityCollectionItem.create({
        data: {
          collectionId: testCollection.id,
          activityId: testActivity1.id,
        },
      });

      const response = await request(app)
        .delete(`/api/activity-collections/${testCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Collection deleted successfully');

      // Verify collection deleted
      const deletedCollection = await prisma.activityCollection.findUnique({
        where: { id: testCollection.id },
      });
      expect(deletedCollection).toBeNull();

      // Verify items deleted (cascade)
      const items = await prisma.activityCollectionItem.findMany({
        where: { collectionId: testCollection.id },
      });
      expect(items).toHaveLength(0);
    });

    test('should not delete activities themselves', async () => {
      await prisma.activityCollectionItem.create({
        data: {
          collectionId: testCollection.id,
          activityId: testActivity1.id,
        },
      });

      await request(app)
        .delete(`/api/activity-collections/${testCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Activity should still exist
      const activity = await prisma.externalActivity.findUnique({
        where: { id: testActivity1.id },
      });
      expect(activity).toBeTruthy();
    });

    test('should not allow deleting other user collections', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-delete-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherCollection = await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Protected Collection',
        },
      });

      const response = await request(app)
        .delete(`/api/activity-collections/${otherCollection.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found or you do not have permission to delete it');

      // Collection should still exist
      const collection = await prisma.activityCollection.findUnique({
        where: { id: otherCollection.id },
      });
      expect(collection).toBeTruthy();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/activity-collections/${testCollection.id}`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/activity-collections/:collectionId/activities', () => {
    test('should add activity to collection', async () => {
      const response = await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityId: testActivity1.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const item = response.body.data;
      expect(item).toHaveProperty('collectionId', testCollection.id);
      expect(item).toHaveProperty('activityId', testActivity1.id);
      expect(item).toHaveProperty('activity');
      expect(item.activity.title).toBe('Math Manipulatives Activity');

      // Verify in database
      const dbItem = await prisma.activityCollectionItem.findUnique({
        where: {
          collectionId_activityId: {
            collectionId: testCollection.id,
            activityId: testActivity1.id,
          },
        },
      });
      expect(dbItem).toBeTruthy();
    });

    test('should handle duplicate additions gracefully', async () => {
      // Add activity first time
      await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityId: testActivity1.id });

      // Add same activity again
      const response = await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityId: testActivity1.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Should only have one item
      const items = await prisma.activityCollectionItem.findMany({
        where: {
          collectionId: testCollection.id,
          activityId: testActivity1.id,
        },
      });
      expect(items).toHaveLength(1);
    });

    test('should update timestamp on re-add', async () => {
      // Add activity with old timestamp
      await prisma.activityCollectionItem.create({
        data: {
          collectionId: testCollection.id,
          activityId: testActivity1.id,
          addedAt: new Date('2024-01-01'),
        },
      });

      // Re-add activity
      const response = await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityId: testActivity1.id });

      const item = response.body.data;
      const addedAt = new Date(item.addedAt);
      expect(addedAt.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });

    test('should validate activity exists', async () => {
      const response = await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityId: 'non-existent-id' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Activity not found');
    });

    test('should not allow adding to other user collections', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-add-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherCollection = await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Private Collection',
        },
      });

      const response = await request(app)
        .post(`/api/activity-collections/${otherCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ activityId: testActivity1.id });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found or you do not have permission to modify it');
    });

    test('should validate request body', async () => {
      const response = await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({}); // Missing activityId

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/activity-collections/${testCollection.id}/activities`)
        .send({ activityId: testActivity1.id });
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/activity-collections/:collectionId/activities/:activityId', () => {
    beforeEach(async () => {
      // Add activity to collection
      await prisma.activityCollectionItem.create({
        data: {
          collectionId: testCollection.id,
          activityId: testActivity1.id,
        },
      });
    });

    test('should remove activity from collection', async () => {
      const response = await request(app)
        .delete(`/api/activity-collections/${testCollection.id}/activities/${testActivity1.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Activity removed from collection');

      // Verify removed from database
      const item = await prisma.activityCollectionItem.findUnique({
        where: {
          collectionId_activityId: {
            collectionId: testCollection.id,
            activityId: testActivity1.id,
          },
        },
      });
      expect(item).toBeNull();
    });

    test('should not delete the activity itself', async () => {
      await request(app)
        .delete(`/api/activity-collections/${testCollection.id}/activities/${testActivity1.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Activity should still exist
      const activity = await prisma.externalActivity.findUnique({
        where: { id: testActivity1.id },
      });
      expect(activity).toBeTruthy();
    });

    test('should handle non-existent items gracefully', async () => {
      const response = await request(app)
        .delete(`/api/activity-collections/${testCollection.id}/activities/${testActivity2.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should fail with appropriate error
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to remove activity from collection');
    });

    test('should not allow removing from other user collections', async () => {
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-remove-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherCollection = await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Protected Collection',
        },
      });

      await prisma.activityCollectionItem.create({
        data: {
          collectionId: otherCollection.id,
          activityId: testActivity1.id,
        },
      });

      const response = await request(app)
        .delete(`/api/activity-collections/${otherCollection.id}/activities/${testActivity1.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Collection not found or you do not have permission to modify it');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/activity-collections/${testCollection.id}/activities/${testActivity1.id}`);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/activity-collections/trending/public', () => {
    beforeEach(async () => {
      // Create collections with different item counts
      const collection1 = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'Popular Collection',
          description: 'Has many items',
        },
      });

      const collection2 = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'Medium Collection',
          description: 'Has some items',
        },
      });

      const collection3 = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'Empty Collection',
          description: 'Has no items',
        },
      });

      // Add items to collections
      await prisma.activityCollectionItem.createMany({
        data: [
          // Popular collection - 3 items
          { collectionId: collection1.id, activityId: testActivity1.id },
          { collectionId: collection1.id, activityId: testActivity2.id },
          { collectionId: collection1.id, activityId: testActivity3.id },
          // Medium collection - 1 item
          { collectionId: collection2.id, activityId: testActivity1.id },
          // Test collection - add 2 items
          { collectionId: testCollection.id, activityId: testActivity1.id },
          { collectionId: testCollection.id, activityId: testActivity2.id },
        ],
      });
    });

    test('should get trending collections ordered by item count', async () => {
      const response = await request(app)
        .get('/api/activity-collections/trending/public')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const collections = response.body.data;
      expect(collections.length).toBeGreaterThan(0);
      
      // Should be ordered by item count descending
      expect(collections[0].name).toBe('Popular Collection');
      expect(collections[0]._count.items).toBe(3);
      
      // Should include collection details
      expect(collections[0]).toHaveProperty('user');
      expect(collections[0].user).toHaveProperty('name');
    });

    test('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/activity-collections/trending/public?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    test('should only show user own collections', async () => {
      // Create another user with a popular collection
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-trending-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherCollection = await prisma.activityCollection.create({
        data: {
          userId: otherUser.id,
          name: 'Super Popular Collection',
        },
      });

      // Add many items
      await prisma.activityCollectionItem.createMany({
        data: [
          { collectionId: otherCollection.id, activityId: testActivity1.id },
          { collectionId: otherCollection.id, activityId: testActivity2.id },
          { collectionId: otherCollection.id, activityId: testActivity3.id },
        ],
      });

      const response = await request(app)
        .get('/api/activity-collections/trending/public')
        .set('Authorization', `Bearer ${authToken}`);

      // Should not include other user's collection
      expect(response.body.data.every((c: unknown) => c.user.id === userId)).toBe(true);
      expect(response.body.data.find((c: unknown) => c.name === 'Super Popular Collection')).toBeUndefined();
    });

    test('should handle secondary sort by updatedAt', async () => {
      // Create collections with same item count but different update times
      const collection1 = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'Same Count 1',
          updatedAt: new Date('2024-01-01'),
        },
      });

      const collection2 = await prisma.activityCollection.create({
        data: {
          userId,
          name: 'Same Count 2',
          updatedAt: new Date('2024-01-03'),
        },
      });

      // Add same number of items to both
      await prisma.activityCollectionItem.createMany({
        data: [
          { collectionId: collection1.id, activityId: testActivity1.id },
          { collectionId: collection2.id, activityId: testActivity2.id },
        ],
      });

      const response = await request(app)
        .get('/api/activity-collections/trending/public?limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      const collections = response.body.data;
      const sameCount1Index = collections.findIndex((c: unknown) => c.name === 'Same Count 1');
      const sameCount2Index = collections.findIndex((c: unknown) => c.name === 'Same Count 2');

      // More recently updated should come first when item counts are equal
      expect(sameCount2Index).toBeLessThan(sameCount1Index);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/activity-collections/trending/public');
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Force a database error by using an invalid collection ID format
      const response = await request(app)
        .get('/api/activity-collections/invalid-uuid-format')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get collection details');
    });

    test('should handle concurrent modifications', async () => {
      // Add same activity to collection concurrently
      const promises = Array(5).fill(null).map(() => 
        request(app)
          .post(`/api/activity-collections/${testCollection.id}/activities`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ activityId: testActivity1.id })
      );

      const results = await Promise.all(promises);
      
      // All should succeed (upsert handles concurrency)
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      // Should only have one item in database
      const items = await prisma.activityCollectionItem.findMany({
        where: {
          collectionId: testCollection.id,
          activityId: testActivity1.id,
        },
      });
      expect(items).toHaveLength(1);
    });
  });
});