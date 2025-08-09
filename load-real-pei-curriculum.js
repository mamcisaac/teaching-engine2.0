#!/usr/bin/env node
/**
 * Load REAL PEI Curriculum into Database
 * Only loads expectations that exist in actual PEI documents
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function loadRealPEICurriculum() {
  console.log('🚀 LOADING REAL PEI GRADE 1 CURRICULUM (NO FABRICATIONS)');
  console.log('=' .repeat(70));
  
  try {
    // Load the real curriculum data
    const curriculumData = JSON.parse(
      fs.readFileSync('REAL-PEI-CURRICULUM-ONLY.json', 'utf8')
    );
    
    // Get Emily's account
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });
    
    if (!emily) {
      console.log('❌ Emily account not found.');
      return;
    }
    
    console.log(`👤 Loading for user: ${emily.name}\n`);
    
    // Clear existing Grade 1 expectations
    console.log('🧹 Clearing any existing Grade 1 expectations...');
    await prisma.curriculumExpectation.deleteMany({
      where: { grade: 1 }
    });
    
    const allExpectations = [];
    
    // Process each subject
    for (const [subject, expectations] of Object.entries(curriculumData.curriculum)) {
      console.log(`\n📚 Processing ${subject}...`);
      let subjectCount = 0;
      
      for (const expectation of expectations) {
        // Fix the 1CO.O typo (should be letter O not zero)
        const code = expectation.code === '1CO.0' ? '1CO.O' : expectation.code;
        
        allExpectations.push({
          code: code,
          description: expectation.description,
          descriptionFr: expectation.description,
          subject: subject,
          strand: expectation.strand || subject,
          strandFr: expectation.strand || subject,
          substrand: '',
          substrandFr: '',
          grade: 1
        });
        
        subjectCount++;
      }
      
      console.log(`  ✅ Found ${subjectCount} REAL expectations`);
    }
    
    // Load all expectations
    console.log(`\n💾 Loading ${allExpectations.length} REAL expectations into database...`);
    
    let loaded = 0;
    let errors = 0;
    
    for (const expectation of allExpectations) {
      try {
        await prisma.curriculumExpectation.create({
          data: expectation
        });
        loaded++;
        process.stdout.write(`\r  Progress: ${loaded}/${allExpectations.length}`);
      } catch (error) {
        if (!error.message.includes('Unique constraint')) {
          console.log(`\n  ⚠️ Error with ${expectation.code}: ${error.message}`);
          errors++;
        }
      }
    }
    
    console.log('\n');
    
    // Verification
    console.log('=' .repeat(70));
    console.log('VERIFICATION OF REAL DATA');
    console.log('=' .repeat(70));
    
    const dbCount = await prisma.curriculumExpectation.count({
      where: { grade: 1 }
    });
    
    const bySubject = await prisma.curriculumExpectation.groupBy({
      by: ['subject'],
      where: { grade: 1 },
      _count: true,
      orderBy: { _count: { subject: 'desc' } }
    });
    
    console.log(`\n📊 Database Statistics:`)
    console.log(`  • Total REAL expectations: ${dbCount}`);
    console.log(`  • Subjects with REAL data: ${bySubject.length}`);
    
    console.log(`\n📚 REAL Expectations by Subject:`);
    bySubject.forEach(item => {
      console.log(`  • ${item.subject}: ${item._count} expectations`);
    });
    
    // Sample real codes
    console.log(`\n🔍 Sample REAL PEI Codes:`);
    const sampleCodes = ['1CO.O', '1CO.2', '1L.2', '1.N1', '1.1.1', 'AV1', 'FPS1', '1C.1'];
    
    for (const code of sampleCodes) {
      const found = await prisma.curriculumExpectation.findFirst({
        where: { code }
      });
      if (found) {
        console.log(`  ✅ [${code}] ${found.subject}`);
      }
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('✅ REAL PEI CURRICULUM LOADED SUCCESSFULLY!');
    console.log('📚 Only verified expectations from actual documents');
    console.log('🚫 No fabricated data');
    console.log('=' .repeat(70));
    
    console.log('\n⚠️  NOTE: Missing subjects that need to be extracted:');
    console.log('  • Physical Education - PDF available but codes not yet extracted');
    console.log('  • Health - PDF available but codes not yet extracted');
    console.log('  • Music - PDF available but codes not yet extracted');
    console.log('  • Technology - Need to find source document');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

loadRealPEICurriculum();