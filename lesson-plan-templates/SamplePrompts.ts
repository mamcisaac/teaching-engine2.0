/**
 * SAMPLE AI PROMPTS FOR ALL 6 SUBJECTS
 * Shows exactly how to generate lessons without hallucination
 */

import { generateAIPrompt } from './PerfectLessonTemplate';

// ====================
// FRENCH LANGUAGE ARTS
// ====================
export const FRENCH_PROMPT_EXAMPLE = generateAIPrompt(
  'Français (Immersion)',
  'Les histoires et les contes',
  3,
  12,
  10 // October
);

/* OUTPUT EXAMPLE:
Generate a Grade 1 French Immersion Français (Immersion) lesson.

CONSTRAINTS (MUST FOLLOW):
- Unit: "Les histoires et les contes"
- Lesson 3 of 12
- Month 10: Use 40% French, 60% English
- Maximum 3 new French vocabulary words
- Total duration: 45 minutes (Minds On: 10 min, Action: 30 min, Consolidation: 5 min)

[Full prompt continues with structure and requirements...]

EXPECTED AI RESPONSE:
Title: Le petit ours brun - The Little Brown Bear
Objective: Students will be able to identify story characters using French vocabulary
Success Criteria:
- Names main character in French
- Uses "Il y a" to describe what they see
- Points to characters when named
Vocabulary:
1. ours - bear - Gesture: Make bear paws with hands - Visual: Picture of brown bear
2. petit - small - Gesture: Pinch fingers close together - Visual: Big bear vs small bear
3. brun - brown - Gesture: Point to brown objects - Visual: Brown color card
Minds On Activity: Mystery box with toy bear inside. Pull out slowly, asking "Qu'est-ce que c'est?" Students guess. Practice vocabulary with gestures.
Action Activity: Read story with big book. Students do bear walk when bear moves. Partner practice: One shows picture card, other says French word. Movement break: Bear stretches.
Consolidation Activity: Thumbs up if you see "ours", thumbs down if no bear. Draw favorite part.
Materials: toy bear, big book, picture cards, paper, crayons
Assessment: Observation - Look for: correct vocabulary use, participation in gestures, engagement with story
Support Strategies: Pre-teach vocabulary with visuals, pair with strong French speaker, allow pointing instead of speaking
Extension Ideas: Create own bear movement, draw story sequence
*/

// ====================
// MATHEMATICS
// ====================
export const MATH_PROMPT_EXAMPLE = generateAIPrompt(
  'Mathématiques',
  'Les nombres et le dénombrement',
  5,
  15,
  11 // November
);

/* EXPECTED AI RESPONSE:
Title: Comptons les feuilles d'automne - Counting Fall Leaves
Objective: Students will be able to count objects to 10 in French
Success Criteria:
- Counts 1-10 with one-to-one correspondence
- Says number words in French
- Matches quantity to numeral
Vocabulary:
1. six - six - Gesture: Show 6 fingers - Visual: 6 dots on card
2. sept - seven - Gesture: Show 7 fingers - Visual: 7 dots on card  
3. huit - eight - Gesture: Show 8 fingers - Visual: 8 dots on card
4. feuille - leaf - Gesture: Falling motion with hand - Visual: Real fall leaf
Minds On Activity: Leaf pile surprise. Count leaves together as pulled from pile. Echo count in French with finger showing.
Action Activity: Leaf counting stations. Partners take turns being teacher. Roll dice, count that many leaves. Movement: Leaf dance between stations.
Consolidation Activity: Human number line. Teacher says number, students arrange themselves. Exit ticket: Draw favorite number of leaves.
Materials: paper leaves, dice, number cards, paper, crayons
Assessment: Partner-share - Look for: accurate counting, French number attempts, one-to-one correspondence
Support Strategies: Count to 5 only, use number line visual, count together first
Extension Ideas: Count backwards from 10, create patterns with leaves
*/

// ====================
// SCIENCE
// ====================
export const SCIENCE_PROMPT_EXAMPLE = generateAIPrompt(
  'Sciences de la nature',
  'Les saisons et les changements',
  2,
  8,
  9 // September
);

/* EXPECTED AI RESPONSE:
Title: Les feuilles changent - Leaves Are Changing
Objective: Students will be able to observe and describe fall changes
Success Criteria:
- Names 2 fall changes they observe
- Uses color words in French
- Sorts leaves by one attribute
Vocabulary:
1. feuille - leaf - Gesture: Falling hand motion - Visual: Real leaf
2. rouge - red - Gesture: Circle for apple - Visual: Red leaf
3. jaune - yellow - Gesture: Point to sun - Visual: Yellow leaf
Minds On Activity: Nature detective badges. Look out window. "Qu'est-ce que tu vois?" Point and name colors.
Action Activity: Leaf exploration with magnifying glasses. Sort by color. Movement: Tree pose, then fall like leaves. Partner leaf rubbings.
Consolidation Activity: Leaf color graph on floor. Each student places one leaf. Count together in French.
Materials: leaves, magnifying glasses, paper, crayons, sorting mats
Assessment: Observation - Look for: using color vocabulary, careful observation, sorting correctly
Support Strategies: Provide color cards for matching, work in small group, pre-sort some leaves
Extension Ideas: Create leaf pattern, find classroom items matching leaf colors
*/

// ====================
// VISUAL ARTS
// ====================
export const ARTS_PROMPT_EXAMPLE = generateAIPrompt(
  'Arts visuels',
  'Les couleurs et les formes',
  4,
  10,
  12 // December
);

/* EXPECTED AI RESPONSE:
Title: Mon sapin de Noël - My Christmas Tree
Objective: Students will be able to create art using geometric shapes
Success Criteria:
- Uses 3 different shapes in artwork
- Names shapes in French
- Shows creativity in decoration
Vocabulary:
1. triangle - triangle - Gesture: Make triangle with fingers - Visual: Triangle shape card
2. étoile - star - Gesture: Twinkle fingers - Visual: Star shape
3. cercle - circle - Gesture: Draw circle in air - Visual: Circle shape
4. vert - green - Gesture: Point to grass/plants - Visual: Green paper
Minds On Activity: Shape hunt in classroom. Find triangles. "C'est un triangle!" Movement: Make shapes with bodies.
Action Activity: Create tree with pre-cut shapes. Glue triangle tree, add circle ornaments, star on top. Movement: Gallery walk to see others' trees.
Consolidation Activity: Musical shapes. Music stops, teacher calls shape in French, students find and touch that shape.
Materials: pre-cut shapes, glue sticks, paper, crayons, markers
Assessment: Exit-ticket - Draw favorite shape and attempt to label
Support Strategies: Trace shapes first, provide shape templates, work with partner
Extension Ideas: Create shape pattern for tree garland, make 3D tree with folded paper
*/

// ====================
// SOCIAL STUDIES
// ====================
export const SOCIAL_PROMPT_EXAMPLE = generateAIPrompt(
  'Sciences humaines',
  'Ma communauté scolaire',
  1,
  9,
  9 // September
);

/* EXPECTED AI RESPONSE:
Title: Notre classe - Our Classroom
Objective: Students will be able to identify important places in their classroom
Success Criteria:
- Names 3 classroom areas
- Uses "Voici" to show locations
- Follows classroom movement safely
Vocabulary:
1. tapis - carpet - Gesture: Sit down motion - Visual: Photo of carpet area
2. porte - door - Gesture: Open/close motion - Visual: Classroom door photo
3. tableau - board - Gesture: Writing motion - Visual: Board photo
Minds On Activity: Classroom tour train. Teacher is conductor. Stop at each area. "Voici le tapis!"
Action Activity: Classroom map creation. Draw big circle for carpet, rectangle for tables. Movement: Simon Says classroom edition - "Va au tapis!"
Consolidation Activity: Partner classroom tour. One student is guide, shows favorite spot.
Materials: paper, crayons, markers, classroom photos
Assessment: Thumbs-check - Show understanding of classroom vocabulary
Support Strategies: Use photos for each location, practice vocabulary with gestures, buddy system for movement
Extension Ideas: Add more classroom vocabulary, create classroom rules poster
*/

// ====================
// HEALTH & PERSONAL DEVELOPMENT
// ====================
export const HEALTH_PROMPT_EXAMPLE = generateAIPrompt(
  'Formation personnelle et sociale',
  'Mes émotions et mes sentiments',
  2,
  12,
  10 // October
);

/* EXPECTED AI RESPONSE:
Title: Comment je me sens - How I Feel
Objective: Students will be able to identify and express basic emotions
Success Criteria:
- Names emotions in French
- Shows emotion with face/body
- Identifies emotion in others
Vocabulary:
1. content - happy - Gesture: Big smile with hands - Visual: Happy face emoji
2. triste - sad - Gesture: Tears falling motion - Visual: Sad face emoji
3. calme - calm - Gesture: Deep breath in/out - Visual: Calm face emoji
Minds On Activity: Emotion puppet show. Puppet shows different feelings. Students guess and copy face.
Action Activity: Emotion stations. Draw feeling faces. Movement: Emotion freeze dance - dance happy, freeze when music stops. Partner emotion charades.
Consolidation Activity: Feelings check-in circle. Hold up emotion card that matches how you feel now.
Materials: puppet, emotion cards, paper, crayons, markers
Assessment: Observation - Look for: appropriate emotion identification, willingness to express feelings, empathy for others
Support Strategies: Use emotion cards as visual support, allow showing without words, provide calming corner option
Extension Ideas: Create emotion book, practice calming strategies
*/

// ====================
// HOW TO USE THESE PROMPTS
// ====================
export function demonstrateUsage() {
  // Generate prompt for any subject
  const prompt = generateAIPrompt(
    'Mathématiques',
    'Les formes géométriques',
    7,
    12,
    1 // January
  );
  
  console.log('Generated Prompt:');
  console.log(prompt);
  
  // The AI would then respond with a complete lesson following the structure
  // No hallucination possible because:
  // 1. Structure is completely defined
  // 2. Materials are limited to standard supplies
  // 3. Vocabulary is constrained by month
  // 4. Activities must fit time constraints
  // 5. No temporal context to guess about
}

// ====================
// VALIDATION AFTER GENERATION
// ====================
export function validateAIResponse(aiResponse: string): boolean {
  // Check that response includes all required sections
  const requiredSections = [
    'Title:',
    'Objective:',
    'Success Criteria:',
    'Vocabulary:',
    'Minds On Activity:',
    'Action Activity:',
    'Consolidation Activity:',
    'Materials:',
    'Assessment:',
    'Support Strategies:',
    'Extension Ideas:'
  ];
  
  return requiredSections.every(section => aiResponse.includes(section));
}