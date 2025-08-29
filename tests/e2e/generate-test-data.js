#!/usr/bin/env node

/**
 * Generate 25-Student Test Data for Emily's ETFO Student Assessment System
 */

const { Grade1TestDataGenerator } = require('./test-data-generator');
const fs = require('fs').promises;
const path = require('path');

async function generateTestData() {
  console.log('🎓 Generating Grade 1 French Immersion Test Data...');
  console.log('=' * 60);
  
  const generator = new Grade1TestDataGenerator();
  
  try {
    // Generate complete classroom data
    const classroomData = await generator.generateCompleteClassroom();
    
    // Save to file
    const outputDir = path.join(__dirname, 'test-data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'classroom-test-data.json');
    await fs.writeFile(outputPath, JSON.stringify(classroomData, null, 2));
    
    // Summary
    console.log('\n✅ Test Data Generated Successfully!');
    console.log('=' * 60);
    console.log(`📊 Students: ${classroomData.students.length}`);
    console.log(`📄 Artifacts: ${classroomData.artifacts.length}`);
    console.log(`✏️ Assessments: ${classroomData.assessments.length}`);
    console.log(`👥 Parents: ${classroomData.parents.length}`);
    console.log(`💾 Total Storage: ${(classroomData.artifacts.reduce((sum, a) => sum + a.fileSize, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB`);
    console.log(`\n📁 Data saved to: ${outputPath}`);
    
    // Also save individual files for easier access
    await fs.writeFile(path.join(outputDir, 'students.json'), JSON.stringify(classroomData.students, null, 2));
    await fs.writeFile(path.join(outputDir, 'artifacts.json'), JSON.stringify(classroomData.artifacts, null, 2));
    await fs.writeFile(path.join(outputDir, 'assessments.json'), JSON.stringify(classroomData.assessments, null, 2));
    await fs.writeFile(path.join(outputDir, 'parents.json'), JSON.stringify(classroomData.parents, null, 2));
    
    // Generate CSV for bulk import testing
    const csvContent = [
      'firstName,lastName,studentNumber,grade,enrollmentDate,gender',
      ...classroomData.students.map(s => 
        `${s.firstName},${s.lastName},${s.studentNumber},${s.grade},${s.enrollmentDate},${s.gender}`
      )
    ].join('\n');
    
    await fs.writeFile(path.join(outputDir, 'students.csv'), csvContent);
    console.log('📋 CSV file generated for bulk import testing');
    
    return classroomData;
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  generateTestData()
    .then(() => {
      console.log('\n🎉 Test data generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to generate test data:', error);
      process.exit(1);
    });
}

module.exports = { generateTestData };