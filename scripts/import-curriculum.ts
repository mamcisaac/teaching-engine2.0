#!/usr/bin/env tsx

/**
 * Curriculum Import Script
 * Imports all curriculum PDFs from /resources/PE_Grade1_Fr/ directory
 * Parses and extracts curriculum expectations into the database
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { CurriculumImportOrchestrator } from '../server/src/services/curriculum/CurriculumImportOrchestrator';
import { logger } from '../server/src/logger';

const prisma = new PrismaClient();

async function importAllCurriculumPDFs() {
  console.log('🚀 Starting comprehensive curriculum import for Grade 1 French Immersion');
  
  const resourcesPath = join(process.cwd(), 'resources', 'PE_Grade1_Fr');
  const orchestrator = new CurriculumImportOrchestrator();
  
  try {
    // Get all PDF files in the resources directory
    const files = await readdir(resourcesPath);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    console.log(`📁 Found ${pdfFiles.length} PDF files to process:`);
    pdfFiles.forEach(file => console.log(`   • ${file}`));
    
    let totalExpectationsImported = 0;
    const importResults = [];
    
    for (const pdfFile of pdfFiles) {
      console.log(`\n📖 Processing: ${pdfFile}`);
      
      try {
        const filePath = join(resourcesPath, pdfFile);
        const fileBuffer = await readFile(filePath);
        
        // Create a mock file object for the orchestrator
        const mockFile = {
          originalname: pdfFile,
          buffer: fileBuffer,
          mimetype: 'application/pdf',
          size: fileBuffer.length
        };
        
        // Import the curriculum from this PDF
        const result = await orchestrator.importCurriculum(
          mockFile as any,
          1, // Emily McIsaac's user ID
          {
            province: 'PE',
            grade: 1,
            subject: extractSubjectFromFilename(pdfFile),
            language: 'French',
            year: '2025'
          }
        );
        
        console.log(`✅ Successfully imported ${result.expectations?.length || 0} expectations from ${pdfFile}`);
        totalExpectationsImported += result.expectations?.length || 0;
        
        importResults.push({
          filename: pdfFile,
          success: true,
          expectationsCount: result.expectations?.length || 0,
          importId: result.id
        });
        
        // Add delay between files to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing ${pdfFile}:`, error);
        importResults.push({
          filename: pdfFile,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 CURRICULUM IMPORT SUMMARY:');
    console.log('='.repeat(60));
    console.log(`📁 Total files processed: ${pdfFiles.length}`);
    console.log(`✅ Successfully imported: ${importResults.filter(r => r.success).length}`);
    console.log(`❌ Failed imports: ${importResults.filter(r => !r.success).length}`);
    console.log(`📚 Total curriculum expectations imported: ${totalExpectationsImported}`);
    
    // Display results summary
    console.log('\n📋 IMPORT RESULTS:');
    importResults.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.filename}: ${result.expectationsCount} expectations`);
      } else {
        console.log(`❌ ${result.filename}: ${result.error}`);
      }
    });
    
    // Verify database has the expectations
    const dbCount = await prisma.curriculumExpectation.count();
    console.log(`\n🗄️ Database now contains ${dbCount} total curriculum expectations`);
    
    if (dbCount > 100) {
      console.log('🎉 SUCCESS: Database now has comprehensive curriculum data!');
    } else {
      console.log('⚠️ WARNING: Expected more curriculum expectations. Check import results.');
    }
    
  } catch (error) {
    console.error('💥 Critical error during curriculum import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Extract subject from filename
 */
function extractSubjectFromFilename(filename: string): string {
  const name = filename.toLowerCase();
  
  if (name.includes('français') || name.includes('french') || name.includes('immersion')) {
    return 'Français langue première';
  }
  if (name.includes('math')) {
    return 'Mathématiques';
  }
  if (name.includes('science')) {
    return 'Sciences';
  }
  if (name.includes('health') || name.includes('santé')) {
    return 'Éducation à la santé';
  }
  if (name.includes('physical') || name.includes('éducation physique')) {
    return 'Éducation physique';
  }
  if (name.includes('social') || name.includes('études sociales')) {
    return 'Études sociales';
  }
  if (name.includes('art')) {
    return 'Arts';
  }
  if (name.includes('music') || name.includes('musique')) {
    return 'Musique';
  }
  
  // Default to French Language Arts for French immersion
  return 'Français langue première';
}

// Run the import if this script is executed directly
if (require.main === module) {
  importAllCurriculumPDFs()
    .then(() => {
      console.log('\n🎯 Curriculum import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Curriculum import failed:', error);
      process.exit(1);
    });
}

export { importAllCurriculumPDFs };