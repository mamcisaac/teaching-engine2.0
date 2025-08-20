#!/usr/bin/env node

/**
 * Initialize Database
 * Sets up the database with real data from the perfect backup
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function initializeDatabase() {
  console.log('🚀 Initializing Database with Real Data');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Create database schema
    console.log('\n📋 Step 1: Creating database schema...');
    const dbPath = path.join(__dirname, '../packages/database');
    process.chdir(dbPath);
    
    // Push schema to create tables
    try {
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
      });
      console.log('✅ Database schema created');
    } catch (error) {
      console.log('⚠️  Schema already exists or minor warning');
    }
    
    // Step 2: Load backup data
    console.log('\n📦 Step 2: Loading backup data...');
    const backupPath = path.join(dbPath, 'PERFECT-EMILY-MCISAAC-GRADE1-FRENCH-IMMERSION-COMPLETE.json');
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found: ' + backupPath);
    }
    
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    // Count units across all LRPs
    let totalUnits = 0;
    for (const lrp of backupData.longRangePlans) {
      if (lrp.unitPlans) totalUnits += lrp.unitPlans.length;
    }
    console.log(`   Found ${totalUnits} units to import`);
    console.log(`   Found ${backupData.longRangePlans.length} long range plans`);
    
    // Step 3: Connect to database
    console.log('\n🔌 Step 3: Connecting to database...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./dev.db'
        }
      }
    });
    
    // Step 4: Clear existing data (if any) - in correct order for foreign keys
    console.log('\n🗑️  Step 4: Clearing existing data...');
    try {
      // Delete in reverse dependency order
      await prisma.eTFOLessonPlan.deleteMany({});
      await prisma.unitPlanExpectation.deleteMany({});
      await prisma.longRangePlanExpectation.deleteMany({});
      await prisma.unitPlan.deleteMany({});
      await prisma.longRangePlan.deleteMany({});
      await prisma.curriculumExpectation.deleteMany({});
      // Only delete Emily's test user if exists
      await prisma.user.deleteMany({ where: { email: 'emily.mcisaac@example.com' } });
      console.log('✅ Existing data cleared');
    } catch (e) {
      console.log('⚠️  Some data might already be cleared, continuing...');
    }
    
    // Step 5: Create or update user (Emily)
    console.log('\n👤 Step 5: Creating/updating user...');
    const emily = await prisma.user.upsert({
      where: { id: 23 },
      update: {
        email: 'emily.mcisaac@example.com',
        name: 'Emily McIsaac',
        role: 'teacher',
        preferredLanguage: 'fr'
      },
      create: {
        id: 23,
        email: 'emily.mcisaac@example.com',
        password: 'hashed_password',
        name: 'Emily McIsaac',
        role: 'teacher',
        preferredLanguage: 'fr'
      }
    });
    console.log(`✅ User ready: ${emily.name}`);
    
    // Step 6: Import curriculum expectations
    console.log('\n📚 Step 6: Importing curriculum expectations...');
    const expectationsToCreate = [];
    
    // Extract unique expectations from units (nested in LRPs)
    const expectationMap = new Map();
    for (const lrp of backupData.longRangePlans) {
      if (lrp.unitPlans) {
        for (const unit of lrp.unitPlans) {
          if (unit.expectations) {
            for (const exp of unit.expectations) {
              if (exp.expectation && !expectationMap.has(exp.expectation.id)) {
                expectationMap.set(exp.expectation.id, exp.expectation);
              }
            }
          }
        }
      }
    }
    
    // Create expectations
    for (const [id, exp] of expectationMap) {
      await prisma.curriculumExpectation.create({
        data: {
          id: exp.id,
          code: exp.code || `EXP-${id.substring(0, 6)}`,
          title: exp.title || 'Expectation',
          description: exp.description || '',
          grade: exp.grade || 1,
          subject: exp.subject || 'General',
          strand: exp.strand || '',
          substrand: exp.subStrand || null,
          titleFr: exp.frenchTitle || null,
          descriptionFr: exp.frenchDescription || null,
          strandFr: exp.strandFr || null,
          substrandFr: exp.substrandFr || null
        }
      });
    }
    console.log(`✅ Created ${expectationMap.size} curriculum expectations`);
    
    // Step 7: Import long range plans
    console.log('\n📅 Step 7: Importing long range plans...');
    const lrpMap = new Map();
    
    for (const lrp of backupData.longRangePlans) {
      const created = await prisma.longRangePlan.create({
        data: {
          id: lrp.id,
          userId: emily.id,
          title: lrp.title,
          academicYear: lrp.academicYear,
          term: lrp.term,
          grade: lrp.grade,
          subject: lrp.subject,
          description: lrp.description,
          goals: lrp.goals,
          themes: lrp.themes || undefined,
          overarchingQuestions: lrp.overarchingQuestions,
          assessmentOverview: lrp.assessmentOverview,
          resourceNeeds: lrp.resourceNeeds,
          professionalGoals: lrp.professionalGoals,
          titleFr: lrp.titleFr || null,
          descriptionFr: lrp.descriptionFr || null,
          goalsFr: lrp.goalsFr || null
        }
      });
      lrpMap.set(lrp.id, created);
      console.log(`   ✅ ${lrp.subject}`);
    }
    console.log(`✅ Created ${lrpMap.size} long range plans`);
    
    // Step 8: Import unit plans
    console.log('\n📖 Step 8: Importing unit plans...');
    let unitCount = 0;
    
    // Units are nested within LRPs
    for (const lrp of backupData.longRangePlans) {
      if (!lrp.unitPlans) continue;
      
      for (const unit of lrp.unitPlans) {
      try {
        // Ensure dates are valid
        const startDate = new Date(unit.startDate);
        const endDate = new Date(unit.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`   ⚠️  Skipping unit with invalid dates: ${unit.title}`);
          continue;
        }
        
        const created = await prisma.unitPlan.create({
          data: {
            id: unit.id,
            userId: emily.id,
            title: unit.title,
            longRangePlanId: unit.longRangePlanId,
            description: unit.description,
            bigIdeas: unit.bigIdeas,
            essentialQuestions: unit.essentialQuestions || undefined,
            startDate: startDate,
            endDate: endDate,
            estimatedHours: unit.estimatedHours,
            titleFr: unit.titleFr,
            descriptionFr: unit.descriptionFr,
            bigIdeasFr: unit.bigIdeasFr,
            assessmentPlan: unit.assessmentPlan,
            successCriteria: unit.successCriteria || undefined,
            communityConnections: unit.communityConnections,
            crossCurricularConnections: unit.crossCurricularConnections,
            culminatingTask: unit.culminatingTask,
            differentiationStrategies: unit.differentiationStrategies || undefined,
            environmentalEducation: unit.environmentalEducation,
            fieldTripsAndGuestSpeakers: unit.fieldTripsAndGuestSpeakers,
            indigenousPerspectives: unit.indigenousPerspectives,
            keyVocabulary: unit.keyVocabulary || undefined,
            learningSkills: unit.learningSkills || undefined,
            parentCommunicationPlan: unit.parentCommunicationPlan,
            priorKnowledge: unit.priorKnowledge,
            socialJusticeConnections: unit.socialJusticeConnections,
            technologyIntegration: unit.technologyIntegration,
            isLocked: unit.isLocked || false,
            lockedAt: unit.lockedAt ? new Date(unit.lockedAt) : null,
            lockedReason: unit.lockedReason
          }
        });
        
        // Link expectations
        if (unit.expectations && unit.expectations.length > 0) {
          for (const exp of unit.expectations) {
            if (exp.expectationId) {
              try {
                await prisma.unitPlanExpectation.create({
                  data: {
                    unitPlanId: created.id,
                    expectationId: exp.expectationId
                  }
                });
              } catch (e) {
                // Expectation might not exist, skip
              }
            }
          }
        }
        
        unitCount++;
        console.log(`   ✅ ${unit.title}`);
      } catch (error) {
        console.error(`   ❌ Failed to import unit: ${unit.title}`, error.message);
      }
    }
    }
    
    console.log(`✅ Created ${unitCount} unit plans`);
    
    // Step 9: Verify data
    console.log('\n🔍 Step 9: Verifying database...');
    const counts = {
      users: await prisma.user.count(),
      lrps: await prisma.longRangePlan.count(),
      units: await prisma.unitPlan.count(),
      expectations: await prisma.curriculumExpectation.count(),
      lessons: await prisma.eTFOLessonPlan.count()
    };
    
    console.log('\n📊 Database Status:');
    console.log(`   Users: ${counts.users}`);
    console.log(`   Long Range Plans: ${counts.lrps}`);
    console.log(`   Unit Plans: ${counts.units}`);
    console.log(`   Curriculum Expectations: ${counts.expectations}`);
    console.log(`   Lesson Plans: ${counts.lessons} (to be generated)`);
    
    // Disconnect
    await prisma.$disconnect();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ DATABASE INITIALIZATION COMPLETE!');
    console.log('=' .repeat(60));
    console.log('\nReady for lesson generation with real data!');
    
    return counts;
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n✨ Success! Database is ready.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };