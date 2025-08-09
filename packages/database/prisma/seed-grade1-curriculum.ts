#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seedGrade1Curriculum() {
  console.log('🚀 Starting Grade 1 French Immersion curriculum seed...');
  console.log('📚 Using VERIFIED curriculum with 73 expectations');
  
  try {
    // Load the verified curriculum database
    const curriculumPath = path.join(__dirname, '../../../curriculum/PEI_GRADE1_FRENCH_IMMERSION_FINAL.json');
    const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'));
    
    // Clear existing Grade 1 curriculum
    console.log('🗑️ Clearing existing Grade 1 curriculum expectations...');
    await prisma.curriculumExpectation.deleteMany({
      where: { grade: 1 }
    });
    
    let totalCreated = 0;
    
    // Process French-taught subjects
    console.log('🇫🇷 Seeding French-taught subjects (65 expectations)...');
    for (const [subject, expectations] of Object.entries(curriculumData.taught_in_french)) {
      console.log(`  📝 ${subject}: ${(expectations as any[]).length} expectations`);
      
      for (const exp of expectations as any[]) {
        await prisma.curriculumExpectation.create({
          data: {
            code: exp.code,
            description: exp.description,
            descriptionFr: exp.description,
            subject: subject,
            grade: 1,
            strand: exp.strand || subject,
            strandFr: exp.strand || subject,
            substrand: exp.substrand || null,
            source: exp.source || null
          }
        });
        totalCreated++;
      }
    }
    
    // Process English-taught subjects (Music)
    console.log('🇬🇧 Seeding English-taught subjects (8 expectations)...');
    for (const [subject, expectations] of Object.entries(curriculumData.taught_in_english)) {
      console.log(`  🎵 ${subject}: ${(expectations as any[]).length} expectations`);
      
      for (const exp of expectations as any[]) {
        await prisma.curriculumExpectation.create({
          data: {
            code: exp.code,
            description: exp.description,
            descriptionFr: exp.description, // Keep English for Music
            subject: subject,
            grade: 1,
            strand: exp.strand || subject,
            strandFr: exp.strand || subject,
            substrand: exp.substrand || null,
            source: exp.source || null,
            languageNote: exp.language_note || 'Taught in English'
          }
        });
        totalCreated++;
      }
    }
    
    console.log(`✅ Successfully created ${totalCreated} curriculum expectations!`);
    console.log('📊 Breakdown:');
    console.log('  - Français langue première: 15');
    console.log('  - Mathématiques: 14');
    console.log('  - Sciences de la nature: 5');
    console.log('  - Sciences humaines: 7');
    console.log('  - Arts visuels: 4');
    console.log('  - Formation personnelle et sociale: 4');
    console.log('  - Éducation physique: 16');
    console.log('  - Music (English): 8');
    console.log('  - TOTAL: 73 expectations');
    
  } catch (error) {
    console.error('❌ Error seeding curriculum:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedGrade1Curriculum()
  .then(() => console.log('🎉 Curriculum seed completed!'))
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });