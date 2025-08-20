/**
 * TEST: Verify prompt generation prevents hallucination
 */

import { generateAIPrompt } from './PerfectLessonTemplate';

console.log('=== TESTING PROMPT GENERATION ===\n');

// Test 1: September lesson (30% French, 3 vocab words)
console.log('TEST 1: September French Lesson');
console.log('Expected: 30% French, max 3 vocabulary words\n');
const septemberPrompt = generateAIPrompt(
  'Français (Immersion)',
  'Les salutations',
  1,
  8,
  9
);

// Check constraints are correct
if (septemberPrompt.includes('30% French') && septemberPrompt.includes('Maximum 3 new French vocabulary')) {
  console.log('✅ September constraints correct\n');
} else {
  console.log('❌ September constraints incorrect\n');
}

// Test 2: June lesson (85% French, 5 vocab words)
console.log('TEST 2: June Math Lesson');
console.log('Expected: 85% French, max 5 vocabulary words\n');
const junePrompt = generateAIPrompt(
  'Mathématiques',
  'La résolution de problèmes',
  15,
  15,
  6
);

if (junePrompt.includes('85% French') && junePrompt.includes('Maximum 5 new French vocabulary')) {
  console.log('✅ June constraints correct\n');
} else {
  console.log('❌ June constraints incorrect\n');
}

// Test 3: Check for hallucination prevention
console.log('TEST 3: Hallucination Prevention');
console.log('Checking that prompts do NOT include temporal context...\n');

const testPrompt = generateAIPrompt(
  'Sciences de la nature',
  'Les plantes',
  5,
  10,
  3
);

const hallucinationTriggers = [
  'Friday',
  'Monday',
  'afternoon',
  'morning',
  'lunch',
  'recess',
  'tired',
  'energetic',
  'class size',
  'previous lesson',
  'yesterday',
  'tomorrow',
  'holiday',
  'parents'
];

const foundTriggers = hallucinationTriggers.filter(trigger => 
  testPrompt.toLowerCase().includes(trigger.toLowerCase())
);

if (foundTriggers.length === 0) {
  console.log('✅ No hallucination triggers found\n');
} else {
  console.log(`❌ Found hallucination triggers: ${foundTriggers.join(', ')}\n`);
}

// Test 4: Verify required constraints are present
console.log('TEST 4: Required Constraints');
console.log('Checking that all necessary constraints are included...\n');

const requiredConstraints = [
  'Maximum',
  'vocabulary',
  '45 minutes',
  'Minds On',
  'Action',  
  'Consolidation',
  'movement',
  'concrete materials',
  'visual supports',
  'partner work',
  'no silent work over 5 minutes'
];

const missingConstraints = requiredConstraints.filter(constraint =>
  !testPrompt.toLowerCase().includes(constraint.toLowerCase())
);

if (missingConstraints.length === 0) {
  console.log('✅ All required constraints present\n');
} else {
  console.log(`❌ Missing constraints: ${missingConstraints.join(', ')}\n`);
}

// Test 5: Subject-specific guidance
console.log('TEST 5: Subject-Specific Guidance');
console.log('Checking each subject gets appropriate focus...\n');

const subjects = [
  'Français (Immersion)',
  'Mathématiques',
  'Sciences de la nature',
  'Arts visuels',
  'Sciences humaines',
  'Formation personnelle et sociale'
];

subjects.forEach(subject => {
  const prompt = generateAIPrompt(subject, 'Test Unit', 1, 5, 10);
  
  // Check for subject-specific content
  const hasSubjectGuidance = 
    (subject === 'Français (Immersion)' && prompt.includes('oral communication')) ||
    (subject === 'Mathématiques' && prompt.includes('manipulatives')) ||
    (subject === 'Sciences de la nature' && prompt.includes('observation')) ||
    (subject === 'Arts visuels' && prompt.includes('Process over product')) ||
    (subject === 'Sciences humaines' && prompt.includes('family')) ||
    (subject === 'Formation personnelle et sociale' && prompt.includes('emotionally safe'));
    
  if (hasSubjectGuidance) {
    console.log(`✅ ${subject}: Has appropriate subject guidance`);
  } else {
    console.log(`❌ ${subject}: Missing subject guidance`);
  }
});

console.log('\n=== PROMPT GENERATION TEST COMPLETE ===');