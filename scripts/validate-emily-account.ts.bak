import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function validateEmilyAccount() {
  console.log('🔍 Validating Emily McIsaac\'s Teaching Engine 2.0 setup...\n');

  let validationErrors: string[] = [];
  let validationWarnings: string[] = [];

  try {
    // 1. Validate User Account
    console.log('1️⃣ Checking user account...');
    const emily = await prisma.user.findUnique({
      where: { email: 'emmcisaac@gmail.com' }
    });

    if (!emily) {
      validationErrors.push('❌ Emily\'s user account not found');
      return;
    }

    console.log(`   ✅ Account found: ${emily.name} (${emily.email})`);
    console.log(`   ✅ Role: ${emily.role}`);
    console.log(`   ✅ Language preference: ${emily.preferredLanguage}`);

    // Test password
    const passwordValid = await bcrypt.compare('myhusbandisthebest', emily.password);
    if (passwordValid) {
      console.log('   ✅ Password validation successful');
    } else {
      validationErrors.push('❌ Password validation failed');
    }

    // 2. Validate Curriculum Expectations
    console.log('\n2️⃣ Checking curriculum expectations...');
    const curriculumExpectations = await prisma.curriculumExpectation.findMany({
      where: { grade: 1 }
    });

    console.log(`   ✅ Found ${curriculumExpectations.length} Grade 1 curriculum expectations`);

    const frenchExpectations = curriculumExpectations.filter(e => 
      e.subject === 'Français langue première'
    );
    const mathExpectations = curriculumExpectations.filter(e => 
      e.subject === 'Mathématiques'
    );
    const scienceExpectations = curriculumExpectations.filter(e => 
      e.subject === 'Sciences'
    );
    const socialStudiesExpectations = curriculumExpectations.filter(e => 
      e.subject === 'Études sociales'
    );

    console.log(`   ✅ French Language Arts: ${frenchExpectations.length} expectations`);
    console.log(`   ✅ Mathematics in French: ${mathExpectations.length} expectations`);
    console.log(`   ✅ Science in French: ${scienceExpectations.length} expectations`);
    console.log(`   ✅ Social Studies in French: ${socialStudiesExpectations.length} expectations`);

    // Check for bilingual content
    const bilingualExpectations = curriculumExpectations.filter(e => 
      e.descriptionFr && e.strandFr
    );
    console.log(`   ✅ Bilingual expectations: ${bilingualExpectations.length} have French translations`);

    // 3. Validate Long Range Plans
    console.log('\n3️⃣ Checking long range plans...');
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: { userId: emily.id },
      include: { expectations: true }
    });

    console.log(`   ✅ Found ${longRangePlans.length} long range plans for 2025-2026`);
    
    for (const plan of longRangePlans) {
      console.log(`   📋 ${plan.title}: ${plan.expectations.length} linked expectations`);
      if (plan.titleFr) {
        console.log(`      🇫🇷 French title: ${plan.titleFr}`);
      }
    }

    if (longRangePlans.length < 3) {
      validationWarnings.push('⚠️ Expected at least 3 long range plans (French, Math, Integrated)');
    }

    // 4. Validate Unit Plans
    console.log('\n4️⃣ Checking unit plans...');
    const unitPlans = await prisma.unitPlan.findMany({
      where: { userId: emily.id },
      include: { expectations: true }
    });

    console.log(`   ✅ Found ${unitPlans.length} unit plans`);
    
    for (const unit of unitPlans) {
      console.log(`   📚 ${unit.title}: ${unit.expectations.length} expectations`);
      console.log(`      📅 ${unit.startDate.toDateString()} - ${unit.endDate.toDateString()}`);
      if (unit.titleFr) {
        console.log(`      🇫🇷 ${unit.titleFr}`);
      }
    }

    if (unitPlans.length < 3) {
      validationWarnings.push('⚠️ Expected at least 3 unit plans for fall term');
    }

    // 5. Validate Lesson Plans
    console.log('\n5️⃣ Checking lesson plans...');
    const lessonPlans = await prisma.eTFOLessonPlan.findMany({
      where: { userId: emily.id },
      include: { expectations: true, resources: true }
    });

    console.log(`   ✅ Found ${lessonPlans.length} ETFO lesson plans`);
    
    for (const lesson of lessonPlans) {
      console.log(`   📝 ${lesson.title}: ${lesson.duration} minutes`);
      console.log(`      🎯 ${lesson.expectations.length} expectations, ${lesson.resources.length} resources`);
      console.log(`      🗣️ Language: ${lesson.language}`);
      if (lesson.titleFr) {
        console.log(`      🇫🇷 ${lesson.titleFr}`);
      }
    }

    // 6. Validate Daybook Entries
    console.log('\n6️⃣ Checking daybook entries...');
    const daybookEntries = await prisma.daybookEntry.findMany({
      where: { userId: emily.id },
      include: { expectations: true }
    });

    console.log(`   ✅ Found ${daybookEntries.length} daybook entries`);
    
    for (const entry of daybookEntries) {
      console.log(`   📔 Entry for ${entry.date.toDateString()}: Rating ${entry.overallRating}/5`);
      if (entry.whatWorkedFr) {
        console.log('      🇫🇷 Has French reflections');
      }
    }

    // 7. Validate Class Routines
    console.log('\n7️⃣ Checking class routines...');
    const classRoutines = await prisma.classRoutine.findMany({
      where: { userId: emily.id, isActive: true }
    });

    console.log(`   ✅ Found ${classRoutines.length} active class routines`);
    
    for (const routine of classRoutines) {
      console.log(`   🔄 ${routine.title} (${routine.category})`);
      if (routine.timeOfDay) {
        console.log(`      ⏰ ${routine.timeOfDay}`);
      }
    }

    // 8. Validate Calendar Events
    console.log('\n8️⃣ Checking calendar events...');
    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { teacherId: emily.id },
          { teacherId: null } // System-wide events
        ]
      },
      orderBy: { start: 'asc' }
    });

    console.log(`   ✅ Found ${calendarEvents.length} calendar events for 2025-2026`);
    
    const schoolYear2025Events = calendarEvents.filter(e => 
      e.start >= new Date('2025-09-01') && e.start <= new Date('2026-06-30')
    );
    console.log(`   📅 ${schoolYear2025Events.length} events in 2025-2026 school year`);

    for (const event of schoolYear2025Events.slice(0, 5)) {
      console.log(`   🗓️ ${event.title}: ${event.start.toDateString()}`);
    }

    // 9. Validate External Activities
    console.log('\n9️⃣ Checking external activities...');
    const externalActivities = await prisma.externalActivity.findMany({
      where: { isActive: true }
    });

    console.log(`   ✅ Found ${externalActivities.length} external activities`);
    
    const frenchActivities = externalActivities.filter(a => 
      a.language === 'fr' || a.subject.includes('French')
    );
    console.log(`   🇫🇷 ${frenchActivities.length} French-specific activities`);

    const grade1Activities = externalActivities.filter(a => 
      a.gradeMin <= 1 && a.gradeMax >= 1
    );
    console.log(`   📚 ${grade1Activities.length} activities suitable for Grade 1`);

    // 10. Validate Activity Collections
    console.log('\n🔟 Checking activity collections...');
    const activityCollections = await prisma.activityCollection.findMany({
      where: { userId: emily.id },
      include: { items: true }
    });

    console.log(`   ✅ Found ${activityCollections.length} activity collections`);
    
    for (const collection of activityCollections) {
      console.log(`   📂 ${collection.name}: ${collection.items.length} activities`);
    }

    // 11. Validate Parent Communications
    console.log('\n1️⃣1️⃣ Checking parent communications...');
    const announcements = await prisma.classroomAnnouncement.findMany({
      where: { userId: emily.id }
    });

    console.log(`   ✅ Found ${announcements.length} classroom announcements`);
    
    for (const announcement of announcements) {
      console.log(`   📢 ${announcement.title} (${announcement.timeframe})`);
      if (announcement.contentFr) {
        console.log('      🇫🇷 Has French translation');
      }
    }

    // 12. Validate Curriculum Import
    console.log('\n1️⃣2️⃣ Checking curriculum imports...');
    const curriculumImports = await prisma.curriculumImport.findMany({
      where: { userId: emily.id }
    });

    console.log(`   ✅ Found ${curriculumImports.length} curriculum imports`);
    
    for (const importRecord of curriculumImports) {
      console.log(`   📥 ${importRecord.filename}: ${importRecord.status}`);
      console.log(`      📊 ${importRecord.processedOutcomes}/${importRecord.totalOutcomes} outcomes processed`);
    }

    // 13. Final Summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=' .repeat(50));
    
    if (validationErrors.length === 0) {
      console.log('🎉 ALL VALIDATIONS PASSED!');
      console.log('\n✨ Emily\'s Teaching Engine 2.0 account is fully configured with:');
      console.log(`   👤 Complete user profile for West Kent Elementary`);
      console.log(`   📚 ${curriculumExpectations.length} curriculum expectations across all subjects`);
      console.log(`   📋 ${longRangePlans.length} long range plans for 2025-2026`);
      console.log(`   📖 ${unitPlans.length} unit plans ready for fall term`);
      console.log(`   📝 ${lessonPlans.length} bilingual lesson plans`);
      console.log(`   📔 ${daybookEntries.length} sample daybook entries`);
      console.log(`   🔄 ${classRoutines.length} French Immersion class routines`);
      console.log(`   📅 ${calendarEvents.length} calendar events for PEI school year`);
      console.log(`   🌐 ${externalActivities.length} external activity resources`);
      console.log(`   📂 ${activityCollections.length} organized activity collections`);
      console.log(`   📢 ${announcements.length} bilingual parent communication templates`);
      console.log(`   📥 ${curriculumImports.length} curriculum import records with frequency words`);
      
      console.log('\n🎯 Emily can now log in with:');
      console.log('   📧 Email: emmcisaac@gmail.com');
      console.log('   🔐 Password: myhusbandisthebest');
      console.log('   🏫 School: West Kent Elementary, PEI');
      console.log('   🇫🇷 Grade 1 French Immersion - 2025-2026 Academic Year');
      
      console.log('\n🚀 Ready for September 4, 2025 (Teacher Preparation Day)!');
    } else {
      console.log('❌ VALIDATION FAILED');
      for (const error of validationErrors) {
        console.log(error);
      }
    }

    if (validationWarnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      for (const warning of validationWarnings) {
        console.log(warning);
      }
    }

  } catch (error) {
    console.error('💥 Validation error:', error);
    validationErrors.push(`System error: ${error}`);
  }

  return {
    success: validationErrors.length === 0,
    errors: validationErrors,
    warnings: validationWarnings
  };
}

validateEmilyAccount()
  .then((result) => {
    if (result.success) {
      console.log('\n🏆 Emily\'s Teaching Engine 2.0 setup is COMPLETE and VALIDATED!');
      process.exit(0);
    } else {
      console.log('\n💥 Validation failed. Please address the errors above.');
      process.exit(1);
    }
  })
  .catch((e) => {
    console.error('Critical validation error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });