/**
 * ETFO-COMPLIANT LESSON TEMPLATE
 * Grade 1 French Immersion
 * 
 * This template follows ETFO best practices and addresses all quality requirements:
 * - 45-minute duration (not 60)
 * - Three-part lesson structure (Minds On 8 min, Action 27 min, Consolidation 10 min)
 * - JSON differentiation with all learner types
 * - Observable assessment with checkboxes
 * - Indigenous perspectives (100+ characters)
 * - Limited vocabulary (2-3 terms for Grade 1)
 * - Complete materials list
 */

export interface ETFOLessonTemplate {
  title: string;
  date: Date;
  duration: 45; // MUST be 45 minutes for Grade 1
  subject: string;
  unitPlanId: number;
  
  // ETFO Three-Part Structure (required)
  mindsOn: string; // 8 minutes - hook/activation
  action: string; // 27 minutes - main learning
  consolidation: string; // 10 minutes - reflection/assessment
  
  // Learning components
  learningGoals: string; // Clear, student-friendly language
  successCriteria: string; // Observable, measurable outcomes
  
  // Vocabulary (Grade 1 limit: 2-3 terms)
  vocabularyFr: {
    [term: string]: string; // Max 3 entries
  };
  
  // Materials (comprehensive list)
  materials: string; // Detailed list of all required materials
  
  // Assessment (MUST include checkboxes)
  assessmentStrategies: string; // Must include ☐ checkboxes for observation
  
  // Differentiation (JSON structure required)
  differentiationStrategies: {
    forStruggling: string; // Support for learners who need help
    forIEP: string; // Modifications for IEP students
    forELL: string; // Support for English Language Learners
    forAdvanced: string; // Extensions for advanced learners
  };
  
  // Cultural perspectives (minimum 100 characters)
  indigenousPerspectives: string; // Authentic Mi'kmaq connections for PEI
  
  // Cross-curricular connections
  crossCurricularConnections: string;
  
  // Reflection
  reflectionQuestions: string;
  
  // User reference
  userId: number;
}

/**
 * Creates a perfect ETFO-compliant lesson
 */
export function createETFOLesson(params: {
  title: string;
  date: Date;
  subject: string;
  unitPlanId: number;
  userId: number;
  topic: string;
  vocabularyTerms: { term: string; definition: string }[]; // Max 3
  indigenousConnection: string; // Must be 100+ characters
}): ETFOLessonTemplate {
  
  // Validate vocabulary limit
  if (params.vocabularyTerms.length > 3) {
    throw new Error('Grade 1 lessons must have maximum 3 vocabulary terms');
  }
  
  // Validate Indigenous perspectives length
  if (params.indigenousConnection.length < 100) {
    throw new Error('Indigenous perspectives must be at least 100 characters');
  }
  
  // Build vocabulary object
  const vocab: { [key: string]: string } = {};
  params.vocabularyTerms.forEach(v => {
    vocab[v.term] = v.definition;
  });
  
  return {
    title: params.title,
    date: params.date,
    duration: 45, // Always 45 minutes
    subject: params.subject,
    unitPlanId: params.unitPlanId,
    userId: params.userId,
    
    // ETFO Structure
    mindsOn: `(8 minutes)
☐ Welcome students with enthusiasm
☐ Review previous learning connections
☐ Present today's topic: ${params.topic}
☐ Activate prior knowledge through discussion
☐ Share learning goals in student-friendly language`,
    
    action: `(27 minutes)
Part 1 - Guided Instruction (10 minutes):
☐ Model the concept/skill explicitly
☐ Use visual supports and manipulatives
☐ Check for understanding frequently
☐ Provide vocabulary in context

Part 2 - Active Learning (12 minutes):
☐ Students practice with partners/small groups
☐ Circulate and provide feedback
☐ Note observations on checklist
☐ Support struggling learners

Part 3 - Independent Practice (5 minutes):
☐ Students demonstrate understanding
☐ Differentiated tasks available
☐ Document student progress`,
    
    consolidation: `(10 minutes)
☐ Gather students for sharing circle
☐ Review key concepts learned
☐ Students self-assess with thumbs up/middle/down
☐ Preview next lesson connection
☐ Celebrate learning achievements`,
    
    learningGoals: `Students will understand ${params.topic} and be able to demonstrate their learning through discussion and activities.`,
    
    successCriteria: `☐ I can explain ${params.topic} in my own words
☐ I can show my understanding through [specific action]
☐ I can work cooperatively with my classmates
☐ I can use new vocabulary correctly`,
    
    vocabularyFr: vocab,
    
    materials: `• Chart paper and markers
• Visual vocabulary cards
• Student whiteboards and markers
• Manipulatives for hands-on learning
• Assessment observation checklist
• Differentiated activity materials
• Books/resources related to ${params.topic}
• Technology: tablet/computer for visual supports`,
    
    assessmentStrategies: `Formative Assessment:
☐ Observation during minds on discussion
☐ Anecdotal notes during partner work
☐ Checklist for skill demonstration
☐ Student self-assessment (thumbs)

Success Criteria Observations:
☐ Can explain concept (meets/approaching/needs support)
☐ Demonstrates understanding (meets/approaching/needs support)
☐ Uses vocabulary correctly (meets/approaching/needs support)
☐ Collaborates effectively (meets/approaching/needs support)`,
    
    differentiationStrategies: {
      forStruggling: "Provide visual supports, simplified instructions, peer partners, manipulatives, reduced task complexity, and additional guided practice time",
      forIEP: "Modified expectations as per IEP, use of assistive technology, extended time, alternative demonstration methods, and one-on-one support as needed",
      forELL: "Visual vocabulary cards, bilingual dictionaries, sentence frames, peer translation support, gestures and demonstrations, home language connections",
      forAdvanced: "Extension activities, leadership roles, deeper inquiry questions, creation of teaching materials for peers, independent research opportunities"
    },
    
    indigenousPerspectives: params.indigenousConnection,
    
    crossCurricularConnections: `• Language Arts: Vocabulary development, oral communication
• Mathematics: Counting, patterns, measurement connections
• Arts: Visual representation of learning
• Social Studies: Community connections
• Science: Natural world observations`,
    
    reflectionQuestions: `• What worked well in today's lesson?
• Which students need additional support?
• How can I adjust tomorrow's lesson based on today's observations?
• What extensions can challenge advanced learners?`
  };
}

/**
 * Example usage for creating a perfect lesson
 */
export const exampleLesson = createETFOLesson({
  title: "Introduction aux formes géométriques",
  date: new Date('2025-09-04'),
  subject: "Mathématiques",
  unitPlanId: 1,
  userId: 23,
  topic: "geometric shapes in our environment",
  vocabularyTerms: [
    { term: "cercle", definition: "a round shape like a wheel" },
    { term: "carré", definition: "a shape with 4 equal sides" },
    { term: "triangle", definition: "a shape with 3 sides" }
  ],
  indigenousConnection: "Mi'kmaq traditional beadwork incorporates geometric patterns including circles representing the sun and moon, triangles representing mountains, and squares representing the four directions. Students will examine authentic Mi'kmaq beadwork samples from PEI artisans."
});