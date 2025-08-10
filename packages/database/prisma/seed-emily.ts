#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedEmily() {
  console.log('Creating Emily\'s user account...');
  
  try {
    // Check if Emily already exists
    const existingEmily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (existingEmily) {
      console.log('✅ Emily\'s account already exists');
      return;
    }
    
    // Create Emily's account
    const emily = await prisma.user.create({
      data: {
        email: 'emmcisaac@gmail.com',
        name: 'Emily McIsaac',
        password: await bcrypt.hash('myhusbandisthebest', 12),
        role: 'teacher',
        preferredLanguage: 'fr'
      }
    });
    
    console.log(`✅ Created Emily McIsaac user account: ${emily.email}`);
    
  } catch (error) {
    console.error('❌ Error creating Emily:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedEmily()
  .then(() => console.log('🎉 Emily account created successfully!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });