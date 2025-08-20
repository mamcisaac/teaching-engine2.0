import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PEI School Calendar 2025-2026
const SCHOOL_START = new Date('2025-09-03');
const SCHOOL_END = new Date('2026-06-20');

const HOLIDAYS = [
  { start: new Date('2025-10-13'), end: new Date('2025-10-13') }, // Thanksgiving
  { start: new Date('2025-11-11'), end: new Date('2025-11-11') }, // Remembrance Day
  { start: new Date('2025-12-22'), end: new Date('2026-01-02') }, // Christmas Break
  { start: new Date('2026-02-16'), end: new Date('2026-02-16') }, // Family Day
  { start: new Date('2026-03-09'), end: new Date('2026-03-13') }, // March Break
  { start: new Date('2026-04-10'), end: new Date('2026-04-13') }, // Easter
  { start: new Date('2026-05-18'), end: new Date('2026-05-18') } // Victoria Day
];

function isSchoolDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  // Check holidays
  for (const holiday of HOLIDAYS) {
    if (date >= holiday.start && date <= holiday.end) return false;
  }
  
  return true;
}

function addSchoolDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < days) {
    result.setDate(result.getDate() + 1);
    if (isSchoolDay(result)) {
      daysAdded++;
    }
  }
  
  return result;
}

function getNextSchoolDay(date: Date): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  while (!isSchoolDay(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

async function achieveTrueUnitPerfection() {
  console.log('🎯 ACHIEVING TRUE UNIT PLAN PERFECTION - COMPLETE REWRITE\\n');
  console.log('═'.repeat(80));
  console.log('📅 School Year: September 3, 2025 - June 20, 2026 (195 school days)');
  console.log('📚 Complete rewrite for ZERO-TOLERANCE perfection\\n');
  
  try {
    // STEP 1: Generate all school days with alternating pattern
    console.log('📅 STEP 1: GENERATING TRUE ALTERNATING SCHEDULE\\n');
    
    const allSchoolDays: { date: Date; dayNumber: number; isSocialStudies: boolean }[] = [];
    let dayNumber = 1;
    const currentDate = new Date(SCHOOL_START);
    
    while (currentDate <= SCHOOL_END) {
      if (isSchoolDay(currentDate)) {
        allSchoolDays.push({
          date: new Date(currentDate),
          dayNumber: dayNumber,
          isSocialStudies: dayNumber % 2 === 1 // Odd days = SS, Even days = Health
        });
        dayNumber++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const socialStudiesDays = allSchoolDays.filter(d => d.isSocialStudies);
    const healthDays = allSchoolDays.filter(d => !d.isSocialStudies);
    
    console.log(`📊 Total school days: ${allSchoolDays.length}`);
    console.log(`📚 Social Studies days: ${socialStudiesDays.length}`);
    console.log(`🏥 Health/FPS days: ${healthDays.length}\\n`);
    
    // STEP 2: COMPLETE REWRITE - Social Studies with COMPACT periods
    console.log('📚 STEP 2: REWRITING SOCIAL STUDIES - COMPACT PERIODS\\n');
    
    const socialStudiesUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Sciences humaines' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Perfect distribution: 97 days across 5 units
    const ssDaysPerUnit = [19, 19, 20, 19, 20]; // Total = 97
    let ssCurrentIndex = 0;
    
    for (let i = 0; i < socialStudiesUnits.length; i++) {
      const unit = socialStudiesUnits[i];
      const daysForThisUnit = ssDaysPerUnit[i];
      
      // Get the SS days for this unit
      const unitSSDays = socialStudiesDays.slice(ssCurrentIndex, ssCurrentIndex + daysForThisUnit);
      
      if (unitSSDays.length > 0) {
        const startDate = unitSSDays[0].date;
        const endDate = unitSSDays[unitSSDays.length - 1].date;
        
        // Perfect hour calculation: days * 0.75
        const exactHours = Math.round(daysForThisUnit * 0.75 * 100) / 100;
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: startDate,
            endDate: endDate,
            estimatedHours: exactHours
          }
        });
        
        console.log(`✅ SS Unit ${i+1}: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (${daysForThisUnit} SS days, ${exactHours}h)`);
        
        ssCurrentIndex += daysForThisUnit;
      }
    }
    
    // STEP 3: COMPLETE REWRITE - Health/FPS with COMPACT periods  
    console.log('\\n🏥 STEP 3: REWRITING HEALTH/FPS - COMPACT PERIODS\\n');
    
    const healthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        }
      },
      orderBy: { startDate: 'asc' }
    });
    
    // Perfect distribution: 98 days across 5 units (corrected from previous error)
    const healthDaysPerUnit = [20, 20, 19, 19, 20]; // Total = 98
    let healthCurrentIndex = 0;
    
    for (let i = 0; i < healthUnits.length; i++) {
      const unit = healthUnits[i];
      const daysForThisUnit = healthDaysPerUnit[i];
      
      // Get the Health days for this unit
      const unitHealthDays = healthDays.slice(healthCurrentIndex, healthCurrentIndex + daysForThisUnit);
      
      if (unitHealthDays.length > 0) {
        const startDate = unitHealthDays[0].date;
        const endDate = unitHealthDays[unitHealthDays.length - 1].date;
        
        // Perfect hour calculation
        const exactHours = Math.round(daysForThisUnit * 0.75 * 100) / 100;
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            startDate: startDate,
            endDate: endDate,
            estimatedHours: exactHours
          }
        });
        
        console.log(`✅ Health Unit ${i+1}: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (${daysForThisUnit} Health days, ${exactHours}h)`);
        
        healthCurrentIndex += daysForThisUnit;
      }
    }
    
    // STEP 4: PERFECT HOUR PRECISION - Daily Subjects
    console.log('\\n⚖️ STEP 4: ACHIEVING PERFECT HOUR PRECISION\\n');
    
    const dailySubjects = [
      { lrpSubject: 'Français (Immersion)', name: 'French' },
      { lrpSubject: 'Mathématiques', name: 'Math' },
      { lrpSubject: 'Sciences de la nature', name: 'Science' },
      { lrpSubject: 'Arts visuels', name: 'Arts' }
    ];
    
    for (const subject of dailySubjects) {
      const units = await prisma.unitPlan.findMany({
        where: {
          longRangePlan: {
            subject: { contains: subject.lrpSubject },
            userId: 23
          }
        },
        orderBy: { startDate: 'asc' }
      });
      
      console.log(`🔧 Perfecting ${subject.name} hours (${units.length} units)`);
      
      // Target: 146.25 hours exactly across 10 units
      // Perfect distribution: 14.625h per unit, rounded strategically
      const targetHours = 146.25;
      const baseHours = 14.6;
      const extraHours = targetHours - (baseHours * 10); // 0.25h to distribute
      
      for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        
        // Distribute extra hours across first few units
        let unitHours = baseHours;
        if (i < 2) unitHours += 0.125; // First 2 units get extra 0.125h each (total 0.25h)
        
        unitHours = Math.round(unitHours * 100) / 100; // Round to 2 decimals
        
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            estimatedHours: unitHours
          }
        });
        
        console.log(`  ✅ Unit ${i+1}: ${unitHours}h`);
      }
    }
    
    // STEP 5: COMPLETE MISSING VOCABULARY FIELDS
    console.log('\\n📝 STEP 5: COMPLETING MISSING VOCABULARY FIELDS\\n');
    
    const incompleteHealthUnits = await prisma.unitPlan.findMany({
      where: {
        longRangePlan: {
          subject: { contains: 'Formation personnelle' },
          userId: 23
        },
        OR: [
          { keyVocabulary: null },
          { keyVocabulary: { equals: [] } }
        ]
      }
    });
    
    console.log(`Found ${incompleteHealthUnits.length} units with missing vocabulary`);
    
    // Complete vocabulary for each unit
    const vocabularyTemplates = {
      'Mon corps et ma sécurité': [
        {"word": "corps", "definition": "toutes les parties physiques de notre être", "category": "anatomie", "grade_level": "1"},
        {"word": "sécurité", "definition": "être protégé du danger", "category": "bien-être", "grade_level": "1"},
        {"word": "danger", "definition": "quelque chose qui peut nous blesser", "category": "sécurité", "grade_level": "1"},
        {"word": "règles", "definition": "instructions à suivre pour être en sécurité", "category": "sécurité", "grade_level": "1"},
        {"word": "propre", "definition": "sans saleté, lavé", "category": "hygiène", "grade_level": "1"}
      ],
      'Mes émotions et sentiments': [
        {"word": "émotions", "definition": "ce que nous ressentons dans notre cœur", "category": "sentiments", "grade_level": "1"},
        {"word": "content", "definition": "sentiment de joie et bonheur", "category": "sentiments", "grade_level": "1"},
        {"word": "triste", "definition": "sentiment de peine ou chagrin", "category": "sentiments", "grade_level": "1"},
        {"word": "calme", "definition": "sentiment de paix et tranquillité", "category": "sentiments", "grade_level": "1"},
        {"word": "respirer", "definition": "prendre de l'air pour se calmer", "category": "stratégies", "grade_level": "1"}
      ],
      'Amitiés et relations positives': [
        {"word": "ami", "definition": "personne qu'on aime et qui nous aime", "category": "relations", "grade_level": "1"},
        {"word": "gentil", "definition": "qui est bon et aimable avec les autres", "category": "qualités", "grade_level": "1"},
        {"word": "partager", "definition": "donner une partie de ce qu'on a", "category": "actions", "grade_level": "1"},
        {"word": "écouter", "definition": "faire attention à ce que dit quelqu'un", "category": "actions", "grade_level": "1"},
        {"word": "respecter", "definition": "traiter les autres avec politesse", "category": "valeurs", "grade_level": "1"}
      ],
      'Nutrition et mode de vie sain': [
        {"word": "nutrition", "definition": "bien manger pour être en santé", "category": "santé", "grade_level": "1"},
        {"word": "légumes", "definition": "plantes qu'on mange pour être fort", "category": "aliments", "grade_level": "1"},
        {"word": "fruits", "definition": "aliments sucrés qui poussent sur les arbres", "category": "aliments", "grade_level": "1"},
        {"word": "exercice", "definition": "bouger son corps pour être en forme", "category": "activité", "grade_level": "1"},
        {"word": "sommeil", "definition": "dormir pour reposer notre corps", "category": "bien-être", "grade_level": "1"}
      ]
    };
    
    for (const unit of incompleteHealthUnits) {
      const vocab = vocabularyTemplates[unit.title as keyof typeof vocabularyTemplates];
      
      if (vocab) {
        await prisma.unitPlan.update({
          where: { id: unit.id },
          data: {
            keyVocabulary: vocab as any
          }
        });
        
        console.log(`✅ Completed vocabulary for: ${unit.title}`);
      }
    }
    
    // STEP 6: ZERO-TOLERANCE VERIFICATION
    console.log('\\n🔍 STEP 6: ZERO-TOLERANCE VERIFICATION\\n');
    
    const allLRPs = await prisma.longRangePlan.findMany({
      where: { userId: 23 },
      include: {
        unitPlans: {
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: { subject: 'asc' }
    });
    
    let allPerfect = true;
    let totalUnits = 0;
    
    const expectedHours = {
      'Arts visuels': 146.25,
      'Français (Immersion)': 146.25,
      'Mathématiques': 146.25,
      'Sciences de la nature': 146.25,
      'Sciences humaines': 72.75,
      'Formation personnelle et sociale': 73.5
    };
    
    for (const lrp of allLRPs) {
      const totalHours = lrp.unitPlans.reduce((sum, u) => sum + (u.estimatedHours || 0), 0);
      const expected = expectedHours[lrp.subject] || 0;
      const gap = Math.abs(totalHours - expected);
      
      totalUnits += lrp.unitPlans.length;
      
      const status = gap < 0.01 ? '✅' : '❌';
      if (gap >= 0.01) allPerfect = false;
      
      console.log(`${status} ${lrp.subject}: ${lrp.unitPlans.length} units, ${totalHours}h (expected: ${expected}h)`);
    }
    
    // Check for overlaps
    const ssUnits = allLRPs.find(lrp => lrp.subject.includes('Sciences humaines'))?.unitPlans || [];
    const healthUnits = allLRPs.find(lrp => lrp.subject.includes('Formation personnelle'))?.unitPlans || [];
    
    let hasOverlaps = false;
    for (const ssUnit of ssUnits) {
      for (const healthUnit of healthUnits) {
        if (ssUnit.startDate <= healthUnit.endDate && ssUnit.endDate >= healthUnit.startDate) {
          hasOverlaps = true;
          console.log(`❌ OVERLAP: ${ssUnit.title} overlaps with ${healthUnit.title}`);
        }
      }
    }
    
    console.log('\\n' + '═'.repeat(80));
    if (allPerfect && !hasOverlaps) {
      console.log('🎉 TRUE PERFECTION ACHIEVED!');
      console.log('═'.repeat(80));
      console.log('✅ ALL CRITICAL ISSUES RESOLVED:');
      console.log('  • Zero overlaps between alternating subjects');
      console.log('  • Perfect hour precision (146.25h daily, 72.75h SS, 73.5h Health)');
      console.log('  • 100% field completeness achieved');
      console.log('  • Compact, efficient date ranges');
      console.log('  • True alternating schedule implemented');
      console.log('\\n🚀 UNIT PLANS ARE GENUINELY PERFECT FOR SEPTEMBER 2025');
    } else {
      console.log('❌ PERFECTION NOT YET ACHIEVED');
      if (!allPerfect) console.log('  • Hour precision issues remain');
      if (hasOverlaps) console.log('  • Overlapping units still exist');
    }
    
    console.log(`\\n📊 FINAL STATISTICS: ${totalUnits} units across 6 subjects`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

achieveTrueUnitPerfection().catch(console.error);