import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function standardizeAssessmentTypes() {
  console.log('📊 STANDARDIZING ASSESSMENT TYPES');
  console.log('='.repeat(70));
  
  // Define the 5 standard assessment types for Grade 1
  const standardTypes = {
    'Diagnostique': 'Initial assessment to understand prior knowledge',
    'Formative': 'Ongoing assessment during learning',
    'Sommative': 'Final assessment of learning outcomes', 
    'Performance': 'Authentic performance-based assessment',
    'Auto-évaluation': 'Student self-assessment and reflection'
  };
  
  console.log('Standard Assessment Types:');
  Object.entries(standardTypes).forEach(([type, desc]) => {
    console.log(`  • ${type}: ${desc}`);
  });
  
  // Map all variations to standard types
  const mappings = new Map([
    // Diagnostique variations
    ['Diagnostic', 'Diagnostique'],
    ['Diagnostique', 'Diagnostique'],
    ['Diagnostique et Formative', 'Diagnostique'],
    ['Diagnostique et formative', 'Diagnostique'],
    
    // Formative variations
    ['Formative', 'Formative'],
    ['Observation formative', 'Formative'],
    ['Formative et sommative', 'Formative'],
    ['Formative et Sommative', 'Formative'],
    ['Formative et comme apprentissage', 'Formative'],
    ['Formative et Performative', 'Formative'],
    ['Formative et Créative', 'Formative'],
    ['Formative et Collaborative', 'Formative'],
    ['Formative et Célébrative', 'Formative'],
    ['Formative et Ludique', 'Formative'],
    ['Formative et pratique', 'Formative'],
    ['Créative et formative', 'Formative'],
    ['Formative - Observation du travail d\'équipe', 'Formative'],
    ['Observation et production', 'Formative'],
    ['Observation et portfolio', 'Formative'],
    ['Observation et documentation', 'Formative'],
    ['Observation et interaction', 'Formative'],
    ['Observation pratique', 'Formative'],
    ['Pratique', 'Formative'],
    
    // Sommative variations
    ['Sommative', 'Sommative'],
    ['Summative', 'Sommative'],
    ['Portfolio sommatif', 'Sommative'],
    ['Sommative et Célébrative', 'Sommative'],
    ['Sommative - Performance authentique', 'Performance'],
    
    // Performance variations
    ['Performance authentique', 'Performance'],
    
    // Self-assessment variations
    ['Réflexive', 'Auto-évaluation'],
    ['Réflexive et célébrative', 'Auto-évaluation'],
    ['Célébrative', 'Auto-évaluation']
  ]);
  
  // Get all unique assessment types currently in use
  const currentTypes = await prisma.eTFOLessonPlan.findMany({
    select: { assessmentType: true },
    distinct: ['assessmentType']
  });
  
  console.log(`\n📋 Current Assessment Types: ${currentTypes.length} variations`);
  
  // Process each assessment type
  let updateCount = 0;
  const updatePromises = [];
  
  for (const [oldType, newType] of mappings) {
    const count = await prisma.eTFOLessonPlan.count({
      where: { assessmentType: oldType }
    });
    
    if (count > 0) {
      console.log(`\n  Converting "${oldType}" → "${newType}" (${count} lessons)`);
      
      updatePromises.push(
        prisma.eTFOLessonPlan.updateMany({
          where: { assessmentType: oldType },
          data: { assessmentType: newType }
        })
      );
      
      updateCount += count;
    }
  }
  
  // Execute all updates
  await Promise.all(updatePromises);
  
  // Verify standardization
  console.log('\n' + '='.repeat(70));
  console.log('📊 STANDARDIZATION RESULTS');
  
  const finalTypes = await prisma.eTFOLessonPlan.groupBy({
    by: ['assessmentType'],
    _count: true
  });
  
  console.log('\nFinal Assessment Type Distribution:');
  finalTypes.sort((a, b) => b._count - a._count).forEach(type => {
    const percentage = ((type._count / 664) * 100).toFixed(1);
    console.log(`  ${type.assessmentType}: ${type._count} lessons (${percentage}%)`);
  });
  
  const uniqueTypes = finalTypes.length;
  
  if (uniqueTypes <= 5) {
    console.log('\n✅ SUCCESS! Assessment types standardized to 5 or fewer types.');
  } else {
    console.log(`\n⚠️  Still have ${uniqueTypes} types. May need additional mapping.`);
  }
  
  // Add meaningful assessment notes for lessons with generic notes
  console.log('\n📝 Improving Assessment Notes Quality');
  
  const lessonsWithGenericNotes = await prisma.eTFOLessonPlan.findMany({
    where: {
      OR: [
        { assessmentNotes: null },
        { assessmentNotes: '' },
        { assessmentNotes: 'Observer les élèves' }
      ]
    },
    select: { id: true, assessmentType: true, title: true }
  });
  
  console.log(`Found ${lessonsWithGenericNotes.length} lessons with generic assessment notes`);
  
  // Update with meaningful assessment notes based on type
  const assessmentNotesTemplates = {
    'Diagnostique': 'Évaluer les connaissances antérieures sur le sujet, noter les idées préconçues et les points forts/faibles de chaque élève',
    'Formative': 'Observer la participation, les stratégies utilisées, la collaboration, et fournir une rétroaction immédiate pour guider l\'apprentissage',
    'Sommative': 'Évaluer la maîtrise des objectifs d\'apprentissage à travers le produit final, en utilisant une grille d\'évaluation claire',
    'Performance': 'Documenter la performance authentique avec photos/vidéos, évaluer le processus et le produit selon les critères établis',
    'Auto-évaluation': 'Guider la réflexion des élèves sur leur apprentissage, leurs défis et leurs succès à travers des questions structurées'
  };
  
  let notesUpdated = 0;
  for (const lesson of lessonsWithGenericNotes.slice(0, 100)) { // Update first 100
    const template = assessmentNotesTemplates[lesson.assessmentType] || assessmentNotesTemplates['Formative'];
    
    await prisma.eTFOLessonPlan.update({
      where: { id: lesson.id },
      data: { 
        assessmentNotes: template + ` - ${lesson.title}`
      }
    });
    notesUpdated++;
  }
  
  console.log(`✅ Updated ${notesUpdated} assessment notes with meaningful content`);
  
  console.log('\n🎉 ASSESSMENT STANDARDIZATION COMPLETE!');
  
  await prisma.$disconnect();
}

standardizeAssessmentTypes().catch(console.error);