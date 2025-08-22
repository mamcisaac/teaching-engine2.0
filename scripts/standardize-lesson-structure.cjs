#!/usr/bin/env node

/**
 * Standardize JSON structure across all lesson files
 * This script ensures consistent formatting and field names
 */

const fs = require('fs');
const path = require('path');

// Standard structure for all lesson files
const STANDARD_STRUCTURE = {
  unitTitle: '',
  subject: '',
  grade: '1',
  totalLessons: 20,
  coreCount: 14,
  extensionCount: 6,
  lessons: [],
  assessmentTools: {
    observationChecklist: [],
    rubrics: [],
    selfAssessment: [],
    portfolioGuidelines: ''
  },
  familyConnections: {
    unitLetter: '',
    homeActivities: [],
    vocabularyList: []
  },
  resourceAlternatives: {
    materials: {},
    digitalResources: []
  },
  metadata: {
    lastUpdated: new Date().toISOString(),
    version: '2.0',
    status: 'complete'
  }
};

// Standard lesson structure
const STANDARD_LESSON = {
  lessonNumber: 0,
  lessonType: '', // 'core' or 'extension'
  title: '',
  oneGoal: '',
  duration: 45,
  keyVocabulary: [],
  
  // Three-part structure
  opening: {
    duration: 8,
    activity: '',
    materials: [],
    visualSupports: ''
  },
  
  main: {
    duration: 27,
    activity: '',
    materials: [],
    visualSupports: '',
    decisionPoints: [],
    movementBreaks: []
  },
  
  closing: {
    duration: 10,
    activity: '',
    assessment: '',
    materials: []
  },
  
  // Support elements
  troubleshooting: {
    ifStrugglingWith: '',
    then: ''
  },
  
  realWorldConnection: '',
  
  differentiation: {
    forStruggling: [],
    forAdvanced: [],
    forELL: [],
    forIEP: []
  },
  
  assessmentCriteria: {
    observable: [],
    checkpoints: []
  }
};

function standardizeDirectory(dirPath) {
  const subjects = fs.readdirSync(dirPath).filter(f => 
    fs.statSync(path.join(dirPath, f)).isDirectory()
  );
  
  let processedCount = 0;
  let errors = [];
  
  subjects.forEach(subject => {
    const subjectPath = path.join(dirPath, subject);
    const files = fs.readdirSync(subjectPath).filter(f => 
      f.endsWith('-full.json')
    );
    
    files.forEach(file => {
      const filePath = path.join(subjectPath, file);
      
      try {
        // Read existing file
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Create standardized structure
        const standardized = {
          ...STANDARD_STRUCTURE,
          unitTitle: content.unitTitle || content.title || '',
          subject: mapSubjectName(subject),
          lessons: standardizeLessons(content.lessons || content),
          metadata: {
            ...STANDARD_STRUCTURE.metadata,
            originalFormat: detectOriginalFormat(content)
          }
        };
        
        // Preserve existing assessment and family data if present
        if (content.assessmentTools) {
          standardized.assessmentTools = content.assessmentTools;
        }
        if (content.familyConnections) {
          standardized.familyConnections = content.familyConnections;
        }
        
        // Write back standardized version
        fs.writeFileSync(
          filePath, 
          JSON.stringify(standardized, null, 2)
        );
        
        processedCount++;
        console.log(`✅ Standardized: ${file}`);
        
      } catch (error) {
        errors.push({ file: filePath, error: error.message });
        console.error(`❌ Error processing ${file}: ${error.message}`);
      }
    });
  });
  
  return { processedCount, errors };
}

function standardizeLessons(lessons) {
  // Handle both array and object formats
  const lessonArray = Array.isArray(lessons) ? lessons : [lessons];
  
  return lessonArray.map((lesson, index) => {
    const lessonNum = lesson.lessonNumber || index + 1;
    
    return {
      lessonNumber: lessonNum,
      lessonType: lessonNum <= 14 ? 'core' : 'extension',
      title: lesson.title || lesson.lessonTitle || '',
      oneGoal: lesson.oneGoal || lesson.goal || lesson.objectif || '',
      duration: lesson.duration || lesson.estimatedTime || 45,
      keyVocabulary: lesson.keyVocabulary || lesson.vocabulary || [],
      
      opening: standardizePhase(
        lesson.opening || lesson.mindsOn || lesson.ouverture,
        8
      ),
      
      main: standardizePhase(
        lesson.main || lesson.action || lesson.mainActivity || lesson.activitePrincipale,
        27
      ),
      
      closing: standardizePhase(
        lesson.closing || lesson.consolidation || lesson.cloture,
        10
      ),
      
      troubleshooting: lesson.troubleshooting || {
        ifStrugglingWith: lesson.whatWhenWrong || '',
        then: lesson.emergencyBackup || ''
      },
      
      realWorldConnection: lesson.realWorldConnection || '',
      
      differentiation: standardizeDifferentiation(lesson),
      
      assessmentCriteria: {
        observable: extractObservables(lesson),
        checkpoints: lesson.checkpoints || []
      }
    };
  });
}

function standardizePhase(phase, defaultDuration) {
  if (!phase) {
    return {
      duration: defaultDuration,
      activity: '',
      materials: [],
      visualSupports: ''
    };
  }
  
  if (typeof phase === 'string') {
    return {
      duration: defaultDuration,
      activity: phase,
      materials: [],
      visualSupports: ''
    };
  }
  
  return {
    duration: phase.duration || defaultDuration,
    activity: phase.activity || phase.description || phase.coreActivity || '',
    materials: phase.materials || [],
    visualSupports: phase.visualSupports || '',
    decisionPoints: phase.decisionPoints || [],
    movementBreaks: phase.movementBreaks || []
  };
}

function standardizeDifferentiation(lesson) {
  // Try to extract differentiation from various possible locations
  const diff = lesson.differentiation || lesson.adaptations || {};
  
  return {
    forStruggling: diff.forStruggling || diff.struggling || [],
    forAdvanced: diff.forAdvanced || diff.advanced || [],
    forELL: diff.forELL || diff.ell || [],
    forIEP: diff.forIEP || diff.iep || []
  };
}

function extractObservables(lesson) {
  const observables = [];
  
  // Extract from assessment notes
  if (lesson.assessment) {
    observables.push(lesson.assessment);
  }
  if (lesson.assessmentNotes) {
    observables.push(lesson.assessmentNotes);
  }
  if (lesson.closing?.assessment) {
    observables.push(lesson.closing.assessment);
  }
  
  return observables.filter(Boolean);
}

function mapSubjectName(folderName) {
  const mapping = {
    'francais': 'Français (Immersion)',
    'mathematiques': 'Mathématiques',
    'sciences': 'Sciences de la nature',
    'sciences-humaines': 'Sciences humaines',
    'arts-visuels': 'Arts visuels',
    'formation-personnelle': 'Formation personnelle et sociale',
    'formation-personnelle-et-sociale': 'Formation personnelle et sociale'
  };
  
  return mapping[folderName] || folderName;
}

function detectOriginalFormat(content) {
  // Detect which format the original file used
  if (content.mindsOn) return 'three-part-lesson';
  if (content.ouverture) return 'french-format';
  if (Array.isArray(content)) return 'lesson-array';
  if (content.lessons) return 'unit-with-lessons';
  return 'unknown';
}

// Main execution
console.log('🔄 Standardizing lesson JSON structures...\n');

const lessonsDir = path.join(__dirname, '..', 'generated-lessons');
const results = standardizeDirectory(lessonsDir);

console.log('\n📊 Standardization Complete:');
console.log(`✅ Successfully processed: ${results.processedCount} files`);

if (results.errors.length > 0) {
  console.log(`❌ Errors encountered: ${results.errors.length}`);
  results.errors.forEach(err => {
    console.log(`   - ${err.file}: ${err.error}`);
  });
}

console.log('\n✨ All lesson files now have consistent structure!');