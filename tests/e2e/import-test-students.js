#!/usr/bin/env node

/**
 * Import test students into the database via API
 */

const fs = require('fs').promises;
const path = require('path');

const API_URL = 'http://localhost:3000';

async function importStudents() {
  console.log('📥 Importing test students into database...');
  
  try {
    // Read the generated test data
    const testDataPath = path.join(__dirname, 'test-data', 'students.json');
    const students = JSON.parse(await fs.readFile(testDataPath, 'utf8'));
    
    console.log(`Found ${students.length} students to import`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Import each student
    for (const student of students) {
      try {
        const response = await fetch(`${API_URL}/api/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Bypass-Auth': 'true'
          },
          body: JSON.stringify({
            firstName: student.firstName,
            lastName: student.lastName,
            studentNumber: student.studentNumber,
            grade: String(student.grade), // Convert to string
            enrollmentDate: student.enrollmentDate,
            gender: student.gender,
            birthDate: student.birthDate,
            specialNeeds: student.specialNeeds,
            ealSupport: student.ealSupport,
            notes: student.notes
          })
        });
        
        if (response.ok) {
          successCount++;
          console.log(`✅ Imported ${student.firstName} ${student.lastName}`);
        } else {
          const error = await response.text();
          console.log(`⚠️ Failed to import ${student.firstName} ${student.lastName}: ${error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Error importing ${student.firstName} ${student.lastName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} students`);
    console.log(`❌ Failed imports: ${errorCount} students`);
    
    // Verify import by checking total students
    const verifyResponse = await fetch(`${API_URL}/api/students`, {
      headers: { 'X-Bypass-Auth': 'true' }
    });
    
    if (verifyResponse.ok) {
      const allStudents = await verifyResponse.json();
      console.log(`\n📋 Total students in database: ${allStudents.length}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to import students:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importStudents()
    .then(() => {
      console.log('\n🎉 Student import complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importStudents };