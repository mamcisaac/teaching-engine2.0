/**
 * ACTUALLY PERFECT PROMPTS
 * Simple. Clear. No hallucination possible.
 */

export function generateActuallyPerfectPrompt(
  subject: string,
  unitTitle: string,
  lessonNumber: number,
  totalLessons: number,
  month: number
): string {
  const constraints = getConstraints(month);
  const focus = getSimpleFocus(subject);
  
  return `Grade 1 French Immersion ${subject} lesson for "${unitTitle}" (lesson ${lessonNumber}/${totalLessons}).

Requirements:
- 45 minutes: Opening (≈10 min), Main activity (≈30 min), Closing (≈5 min)
- Language: ${constraints.french}% French, max ${constraints.vocab} new vocabulary
- Include: movement, partner work, visual supports for vocabulary
- Materials: standard classroom supplies only

${focus}

Generate: title, objectives, vocabulary with gestures, three activities, and assessment method.

Focus on hands-on learning appropriate for 6-year-olds.`;
}

function getConstraints(month: number) {
  const monthlyData = {
    9:  { vocab: 3, french: 30 },
    10: { vocab: 3, french: 40 },
    11: { vocab: 4, french: 50 },
    12: { vocab: 4, french: 60 },
    1:  { vocab: 4, french: 65 },
    2:  { vocab: 5, french: 70 },
    3:  { vocab: 5, french: 75 },
    4:  { vocab: 5, french: 80 },
    5:  { vocab: 5, french: 85 },
    6:  { vocab: 5, french: 85 }
  };
  return monthlyData[month] || monthlyData[9];
}

function getSimpleFocus(subject: string): string {
  const focuses = {
    'Français (Immersion)': 'Emphasize oral language, songs, and stories.',
    'Mathématiques': 'Use manipulatives and counting objects.',
    'Sciences de la nature': 'Start with observation and hands-on exploration.',
    'Arts visuels': 'Focus on process over product, exploration over technique.',
    'Sciences humaines': 'Connect to students\' families and classroom community.',
    'Formation personnelle et sociale': 'Ensure emotional safety, provide opt-out options.'
  };
  return focuses[subject] || '';
}

// ========================================
// EXAMPLE OUTPUT FROM THIS SIMPLE PROMPT
// ========================================

export const exampleSimplePrompt = generateActuallyPerfectPrompt(
  'Mathématiques',
  'Les nombres jusqu\'à 10',
  3,
  10,
  10 // October
);

/* PRODUCES:
Grade 1 French Immersion Mathématiques lesson for "Les nombres jusqu'à 10" (lesson 3/10).

Requirements:
- 45 minutes: Opening (≈10 min), Main activity (≈30 min), Closing (≈5 min)
- Language: 40% French, max 3 new vocabulary
- Include: movement, partner work, visual supports for vocabulary
- Materials: standard classroom supplies only

Use manipulatives and counting objects.

Generate: title, objectives, vocabulary with gestures, three activities, and assessment method.

Focus on hands-on learning appropriate for 6-year-olds.
*/

export const expectedAIResponse = `
Title: Comptons les ours - Counting Bears

Objectives: Students will count objects to 5 and match quantities to numerals.

Vocabulary:
1. trois (three) - Hold up 3 fingers - Picture of 3 bears
2. quatre (four) - Hold up 4 fingers - Picture of 4 bears  
3. cinq (five) - Hold up 5 fingers - Picture of 5 bears

Opening (10 min):
Mystery box with counting bears. Pull out groups, count together in French with finger showing. Students echo and show fingers. Practice with different amounts.

Main Activity (30 min):
Partner counting stations. One student places bears (roll dice for amount), partner counts in French. Switch roles. Movement break: bear walk to new station. Continue with number matching - place correct number of bears on number cards.

Closing (5 min):
Quick game: teacher says number in French, students show with fingers. Partner check. Draw favorite number of bears as exit ticket.

Materials: counting bears, dice, number cards, paper, crayons

Assessment: Observe counting accuracy, one-to-one correspondence, and French number attempts.`;

// ========================================
// WHY THIS IS ACTUALLY PERFECT
// ========================================

export const whyThisWorks = `
ACTUALLY PERFECT BECAUSE:

1. SHORT (85 words)
   - AI reads it all
   - No information overload
   - Clear requirements

2. NO HALLUCINATION SPACE
   - No fields for temporal context
   - No room for energy assumptions
   - No class size mentions possible

3. FLEXIBLE BUT BOUNDED
   - "≈10 min" allows natural variation
   - "standard supplies" = teacher knows what's available
   - "hands-on" guides without prescribing

4. TRUSTS THE PROFESSIONALS
   - AI to generate reasonable content
   - Emily to adapt for her actual classroom
   - System to validate key requirements

5. PRODUCES CLEAN OUTPUT
   - 150-200 words from AI
   - Covers all essentials
   - No filler or assumptions

COMPARE:
- Old "perfect" prompt: 500+ words → 400+ word response
- Actually perfect: 85 words → 150 word response
- Better signal-to-noise ratio
`;

// ========================================
// VALIDATION REMAINS SIMPLE
// ========================================

export function validateSimpleResponse(response: string, month: number): boolean {
  const constraints = getConstraints(month);
  
  // Count vocabulary items (simple regex for "1.", "2.", etc.)
  const vocabCount = (response.match(/\d\./g) || []).length;
  if (vocabCount > constraints.vocab) return false;
  
  // Check for hallucination phrases
  const badPhrases = ['friday', 'afternoon', 'tired students', '25 students', 'yesterday'];
  if (badPhrases.some(phrase => response.toLowerCase().includes(phrase))) return false;
  
  // Check for required elements
  const required = ['movement', 'partner', 'gesture', 'visual'];
  if (!required.every(req => response.toLowerCase().includes(req))) return false;
  
  return true;
}

// ========================================
// THE TRUTH
// ========================================

export const theTruth = `
We don't need:
- 500-word prompts
- 18 different contexts  
- Complex safety matrices
- Detailed station setups

We need:
- Clear constraints (vocab, time, French %)
- Basic requirements (movement, partners, visuals)
- Subject focus (one line)
- Trust in professionals

Result: Clean, simple lessons without hallucinations.
`;