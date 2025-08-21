#!/usr/bin/env node

/**
 * Pedagogical Principles Knowledge Base
 * Research-based educational principles for Grade 1 French Immersion
 * This is the WHY behind every requirement
 */

const PEDAGOGICAL_PRINCIPLES = {
  /**
   * ETFO Three-Part Lesson Structure Rationale
   * Based on cognitive science and attention research
   */
  etfoRationale: {
    mindsOn8: {
      principle: "8 minutes for Minds On activation",
      research: [
        "Sousa (2011): Prime-time learning occurs in first 10 minutes",
        "Jensen (2005): Attention spans = age + 2 minutes (6-year-olds = 8 minutes)",
        "Medina (2008): Brain Rules - attention must be re-engaged every 10 minutes"
      ],
      rationale: `
        - Activates prior knowledge before cognitive load increases
        - Captures peak attention window for 6-7 year olds
        - Creates emotional engagement essential for memory formation
        - Provides assessment opportunity while attention is highest
        - Establishes learning intention before fatigue sets in
      `,
      implications: [
        "Must be highly engaging and interactive",
        "Should connect to students' lives and experiences",
        "Needs movement or sensory engagement",
        "Cannot be passive listening beyond 3-4 minutes"
      ]
    },
    
    action27: {
      principle: "27 minutes for Action learning",
      research: [
        "Willingham (2009): Working memory limitations require chunking",
        "Diamond (2013): Executive function develops through practice",
        "Hattie (2012): Deliberate practice with feedback essential"
      ],
      rationale: `
        - Allows for 3 activities of 8-10 minutes each (attention span cycles)
        - Provides sufficient practice time for skill development
        - Enables differentiated instruction and small group work
        - Maintains engagement through variety and movement
        - Balances direct instruction with guided and independent practice
      `,
      implications: [
        "Must include variety (not one 27-minute activity)",
        "Requires movement transitions between activities",
        "Needs mix of groupings (whole, small, pairs, individual)",
        "Should progress from guided to independent"
      ]
    },
    
    consolidation10: {
      principle: "10 minutes for Consolidation and transfer",
      research: [
        "Ebbinghaus (1885): Forgetting curve - immediate review critical",
        "Roediger & Butler (2011): Retrieval practice strengthens memory",
        "Marzano (2001): Summarizing and note-taking effect size 1.00"
      ],
      rationale: `
        - Transfers learning from working memory to long-term memory
        - Provides metacognitive reflection opportunity
        - Allows formative assessment before lesson ends
        - Creates closure and sense of accomplishment
        - Sets up home connection and next lesson preview
      `,
      implications: [
        "Must actively involve students (not teacher summary)",
        "Should include self-assessment opportunity",
        "Needs to connect to learning goals explicitly",
        "Cannot introduce new content"
      ]
    }
  },

  /**
   * Child Development for Grade 1 (Ages 6-7)
   * Based on developmental psychology research
   */
  childDevelopment: {
    cognitive: {
      stage: "Preoperational transitioning to Concrete Operational (Piaget)",
      characteristics: [
        "Thinking is concrete, not abstract",
        "Need physical manipulatives to understand concepts",
        "Can focus on one aspect at a time (centration)",
        "Beginning to understand conservation",
        "Developing ability to classify and sequence"
      ],
      research: [
        "Piaget & Inhelder (1969): The Psychology of the Child",
        "Case (1985): Intellectual Development",
        "Siegler (2006): How Children Develop"
      ],
      implications: [
        "Use concrete materials for all math concepts",
        "Avoid abstract reasoning tasks",
        "Break complex tasks into single steps",
        "Use visual and physical representations",
        "Provide hands-on exploration before symbols"
      ]
    },
    
    social: {
      stage: "Initiative vs. Guilt (Erikson)",
      characteristics: [
        "Parallel play transitioning to cooperative play",
        "Learning to share and take turns",
        "Developing empathy and perspective-taking",
        "Strong need for adult approval",
        "Beginning peer relationships"
      ],
      research: [
        "Erikson (1950): Childhood and Society",
        "Vygotsky (1978): Zone of Proximal Development",
        "Bandura (1977): Social Learning Theory"
      ],
      implications: [
        "Structure cooperative learning carefully",
        "Explicitly teach social skills",
        "Use peer modeling and buddy systems",
        "Provide specific positive feedback",
        "Create safe environment for risk-taking"
      ]
    },
    
    physical: {
      stage: "Developing fine and gross motor skills",
      characteristics: [
        "Large muscle control better than fine motor",
        "Need frequent movement breaks",
        "Developing hand dominance",
        "Letter formation still challenging",
        "High energy with quick fatigue"
      ],
      research: [
        "Gallahue & Ozmun (2006): Understanding Motor Development",
        "Payne & Isaacs (2012): Human Motor Development"
      ],
      implications: [
        "Incorporate movement every 10 minutes",
        "Use large motor activities before fine motor",
        "Provide varied writing tools and surfaces",
        "Allow standing and movement while working",
        "Plan for physical manipulation of materials"
      ]
    },
    
    emotional: {
      stage: "Developing self-regulation",
      characteristics: [
        "Emotions are intense but brief",
        "Difficulty managing frustration",
        "Need predictable routines for security",
        "Developing sense of fairness",
        "Beginning self-control strategies"
      ],
      research: [
        "Denham (2007): Social-Emotional Development",
        "Blair & Raver (2015): School Readiness and Self-Regulation"
      ],
      implications: [
        "Maintain consistent routines and expectations",
        "Teach explicit self-regulation strategies",
        "Provide calm-down spaces and tools",
        "Use visual schedules and timers",
        "Celebrate effort over product"
      ]
    }
  },

  /**
   * French Immersion Specific Pedagogy
   * Based on second language acquisition research
   */
  frenchImmersion: {
    languageAcquisition: {
      principle: "Natural acquisition through meaningful content",
      research: [
        "Krashen (1982): Input Hypothesis - comprehensible input + 1",
        "Swain (1985): Output Hypothesis - production essential",
        "Long (1996): Interaction Hypothesis - negotiation of meaning",
        "Genesee (1987): Learning Through Two Languages"
      ],
      stages: {
        preproduction: "0-6 months: Silent period, listening comprehension",
        earlyProduction: "6-12 months: 1-2 word responses",
        speechEmergence: "1-3 years: Simple sentences",
        intermediteFluency: "3-5 years: Complex communication"
      },
      grade1Expectations: "Most students in early production to speech emergence"
    },
    
    scaffoldingStrategies: {
      essential: [
        "Total Physical Response (TPR) - Asher (1969)",
        "Visual supports and realia",
        "Gesture and body language",
        "Repetition and reformulation",
        "Wait time (3-5 seconds minimum)",
        "Cognates and context clues",
        "Predictable language patterns"
      ],
      research: [
        "Gibbons (2015): Scaffolding Language, Scaffolding Learning",
        "Echevarria et al. (2013): Making Content Comprehensible"
      ]
    },
    
    vocabularyDevelopment: {
      optimalLoad: "8-10 new words per lesson maximum",
      research: [
        "Nation (2001): 95% known words for comprehension",
        "Schmitt (2000): Vocabulary acquisition rates",
        "Nagy & Scott (2000): Word consciousness development"
      ],
      strategies: [
        "Pre-teach essential vocabulary",
        "Use in multiple contexts",
        "Connect to cognates when possible",
        "Visual vocabulary walls",
        "Gesture associations",
        "Meaningful repetition (not rote)"
      ]
    },
    
    errorCorrection: {
      principle: "Selective correction to maintain communication flow",
      research: [
        "Lyster & Ranta (1997): Corrective feedback types",
        "Ellis (2009): Implicit vs explicit correction"
      ],
      grade1Approach: [
        "Recast errors naturally in response",
        "Focus on meaning over accuracy",
        "Celebrate communication attempts",
        "Model correct forms without stopping flow",
        "Explicit correction only for critical errors"
      ]
    }
  },

  /**
   * Differentiation and Inclusion
   * Based on Universal Design for Learning (UDL)
   */
  differentiation: {
    framework: "Universal Design for Learning (CAST, 2018)",
    
    principles: {
      multipleRepresentation: {
        why: "Students differ in how they perceive and comprehend",
        research: "Rose & Meyer (2002): Teaching Every Student",
        grade1Implementation: [
          "Visual schedules and instructions",
          "Auditory directions with visual backup",
          "Hands-on materials for kinesthetic learners",
          "Technology supports when appropriate"
        ]
      },
      
      multipleActionExpression: {
        why: "Students differ in how they navigate learning",
        research: "Tomlinson (2014): Differentiated Classroom",
        grade1Implementation: [
          "Choice in response format (draw, write, say, show)",
          "Flexible seating and workspace options",
          "Varied tools for writing and creating",
          "Options for demonstrating understanding"
        ]
      },
      
      multipleEngagement: {
        why: "Students differ in what motivates them",
        research: "Deci & Ryan (2000): Self-Determination Theory",
        grade1Implementation: [
          "Choice in topics when possible",
          "Vary challenge levels within activity",
          "Connect to student interests and culture",
          "Provide roles and responsibilities"
        ]
      }
    },
    
    learnerCategories: {
      strugglingLearners: {
        percentage: "20-25% of typical class",
        needs: [
          "More processing time",
          "Concrete materials longer",
          "Repeated practice opportunities",
          "Smaller chunks of information",
          "Peer or adult support"
        ],
        strategies: [
          "Pre-teach vocabulary and concepts",
          "Provide templates and sentence starters",
          "Use manipulatives and visual aids",
          "Break tasks into smaller steps",
          "Offer frequent check-ins"
        ]
      },
      
      advancedLearners: {
        percentage: "10-15% of typical class",
        needs: [
          "Depth over breadth",
          "Complex thinking opportunities",
          "Choice and independence",
          "Acceleration when appropriate",
          "Creative challenges"
        ],
        strategies: [
          "Open-ended tasks with no ceiling",
          "Research projects on interests",
          "Peer tutoring opportunities",
          "Extension activities ready",
          "Choice in product format"
        ]
      },
      
      ellStudents: {
        percentage: "Varies by region (10-40%)",
        needs: [
          "Native language support when possible",
          "Extra visual supports",
          "Vocabulary pre-teaching",
          "Extended wait time",
          "Safe practice environment"
        ],
        strategies: [
          "Pair with supportive peer",
          "Use translation tools appropriately",
          "Provide picture dictionaries",
          "Allow native language planning",
          "Celebrate multilingualism"
        ]
      },
      
      iepStudents: {
        percentage: "12-15% have identified needs",
        needs: "Highly individualized based on diagnosis",
        commonAccommodations: [
          "Reduced task demands",
          "Alternative response formats",
          "Sensory breaks and tools",
          "Modified success criteria",
          "Assistive technology",
          "Additional adult support"
        ]
      }
    }
  },

  /**
   * Assessment Best Practices
   * Based on assessment for/as/of learning research
   */
  assessment: {
    framework: "Growing Success (Ontario Ministry of Education, 2010)",
    
    types: {
      diagnostic: {
        when: "Before instruction",
        why: "Determine starting points and readiness",
        research: "Black & Wiliam (1998): Inside the Black Box",
        grade1Examples: [
          "Observation during play",
          "Simple pre-assessments with manipulatives",
          "Conversations about prior knowledge",
          "Drawing or demonstration tasks"
        ]
      },
      
      formative: {
        when: "During instruction",
        why: "Guide instructional decisions",
        research: "Hattie & Timperley (2007): Power of Feedback",
        grade1Examples: [
          "Observation with anecdotal notes",
          "Exit tickets with faces or thumbs",
          "White board responses",
          "Peer and self-assessment with rubrics",
          "Learning conversations"
        ]
      },
      
      summative: {
        when: "After instruction",
        why: "Evaluate achievement of outcomes",
        research: "Stiggins (2002): Assessment Crisis",
        grade1Examples: [
          "Performance tasks",
          "Portfolio selections",
          "Simple projects with rubrics",
          "Demonstrations of learning",
          "NOT traditional tests"
        ]
      }
    },
    
    effectSize: {
      formativeFeedback: 0.90,
      selfAssessment: 1.33,
      peerAssessment: 0.53,
      source: "Hattie (2009): Visible Learning"
    }
  },

  /**
   * Subject-Specific Pedagogy
   */
  subjectPedagogy: {
    mathematics: {
      approach: "Concrete-Pictorial-Abstract (CPA)",
      research: "Bruner (1966): Toward a Theory of Instruction",
      progression: [
        "Concrete: Physical manipulatives (base-10 blocks, counters)",
        "Pictorial: Drawings and representations",
        "Abstract: Numbers and symbols"
      ],
      grade1Focus: "80% concrete, 20% pictorial, minimal abstract"
    },
    
    science: {
      approach: "Inquiry-based learning",
      research: "Bybee (1997): 5E Instructional Model",
      stages: [
        "Engage: Hook and wonder",
        "Explore: Investigate and discover",
        "Explain: Make sense of findings",
        "Elaborate: Apply to new situations",
        "Evaluate: Reflect and assess"
      ],
      grade1Focus: "Heavy on Engage and Explore"
    },
    
    arts: {
      approach: "Process over product",
      research: "Eisner (2002): The Arts and Creation of Mind",
      principles: [
        "Exploration of materials and techniques",
        "Expression of ideas and emotions",
        "No right or wrong outcomes",
        "Celebration of uniqueness",
        "Development of fine motor skills"
      ]
    },
    
    socialStudies: {
      approach: "Expanding horizons",
      research: "Parker (2015): Social Studies in Elementary Education",
      progression: [
        "Self → Family → School → Community → Province → Country",
        "Grade 1 focuses on self, family, and school community"
      ]
    }
  }
};

/**
 * Generate complete pedagogical context for prompts
 */
function generatePedagogicalContext(subject, focusArea = 'all') {
  let context = `
ESSENTIAL PEDAGOGICAL UNDERSTANDING:

You are not just following rules - you are applying research-based principles of child development and learning.

`;

  // Add ETFO rationale
  context += `
WHY THE 8-27-10 STRUCTURE MATTERS:
${PEDAGOGICAL_PRINCIPLES.etfoRationale.mindsOn8.rationale}
${PEDAGOGICAL_PRINCIPLES.etfoRationale.action27.rationale}
${PEDAGOGICAL_PRINCIPLES.etfoRationale.consolidation10.rationale}

`;

  // Add child development context
  context += `
HOW 6-YEAR-OLDS LEARN:
Cognitive: ${PEDAGOGICAL_PRINCIPLES.childDevelopment.cognitive.characteristics.join(', ')}
Social: ${PEDAGOGICAL_PRINCIPLES.childDevelopment.social.characteristics.join(', ')}
Physical: ${PEDAGOGICAL_PRINCIPLES.childDevelopment.physical.characteristics.join(', ')}
Emotional: ${PEDAGOGICAL_PRINCIPLES.childDevelopment.emotional.characteristics.join(', ')}

`;

  // Add French immersion context
  context += `
FRENCH IMMERSION CONSIDERATIONS:
- Students are in ${PEDAGOGICAL_PRINCIPLES.frenchImmersion.languageAcquisition.grade1Expectations}
- Maximum ${PEDAGOGICAL_PRINCIPLES.frenchImmersion.vocabularyDevelopment.optimalLoad}
- Use scaffolding: ${PEDAGOGICAL_PRINCIPLES.frenchImmersion.scaffoldingStrategies.essential.join(', ')}

`;

  // Add subject-specific pedagogy
  if (subject && PEDAGOGICAL_PRINCIPLES.subjectPedagogy[subject.toLowerCase()]) {
    const subjectPed = PEDAGOGICAL_PRINCIPLES.subjectPedagogy[subject.toLowerCase()];
    context += `
SUBJECT-SPECIFIC PEDAGOGY FOR ${subject.toUpperCase()}:
Approach: ${subjectPed.approach}
${subjectPed.grade1Focus ? `Grade 1 Focus: ${subjectPed.grade1Focus}` : ''}

`;
  }

  // Add differentiation rationale
  context += `
WHY DIFFERENTIATION IS CRITICAL:
${PEDAGOGICAL_PRINCIPLES.differentiation.principles.multipleRepresentation.why}
${PEDAGOGICAL_PRINCIPLES.differentiation.principles.multipleActionExpression.why}
${PEDAGOGICAL_PRINCIPLES.differentiation.principles.multipleEngagement.why}

Remember: ${PEDAGOGICAL_PRINCIPLES.differentiation.learnerCategories.strugglingLearners.percentage} need extra support,
${PEDAGOGICAL_PRINCIPLES.differentiation.learnerCategories.advancedLearners.percentage} need enrichment,
and all need to feel successful.

`;

  return context;
}

/**
 * Get research citations for validation
 */
function getResearchCitations(topic) {
  const citations = {
    etfo: PEDAGOGICAL_PRINCIPLES.etfoRationale.mindsOn8.research,
    attention: PEDAGOGICAL_PRINCIPLES.etfoRationale.mindsOn8.research,
    development: [
      ...PEDAGOGICAL_PRINCIPLES.childDevelopment.cognitive.research,
      ...PEDAGOGICAL_PRINCIPLES.childDevelopment.social.research
    ],
    immersion: [
      ...Object.values(PEDAGOGICAL_PRINCIPLES.frenchImmersion.languageAcquisition.research)
    ],
    differentiation: [
      PEDAGOGICAL_PRINCIPLES.differentiation.framework,
      PEDAGOGICAL_PRINCIPLES.differentiation.principles.multipleRepresentation.research
    ],
    assessment: [
      PEDAGOGICAL_PRINCIPLES.assessment.framework,
      PEDAGOGICAL_PRINCIPLES.assessment.types.formative.research
    ]
  };

  return citations[topic] || [];
}

/**
 * Validate against pedagogical principles
 */
function validateAgainstPrinciples(lesson, subject) {
  const issues = [];
  const suggestions = [];

  // Check cognitive appropriateness
  if (lesson.abstract_concepts && !lesson.concrete_materials) {
    issues.push({
      principle: 'Cognitive Development',
      problem: 'Abstract concepts without concrete support',
      research: PEDAGOGICAL_PRINCIPLES.childDevelopment.cognitive.research[0],
      suggestion: 'Add manipulatives or visual representations'
    });
  }

  // Check attention span alignment
  const activities = lesson.action?.activities || [];
  for (const activity of activities) {
    if (activity.duration > 10) {
      suggestions.push({
        principle: 'Attention Span',
        suggestion: `Activity "${activity.name}" is ${activity.duration} minutes. Consider breaking into smaller chunks.`,
        research: PEDAGOGICAL_PRINCIPLES.etfoRationale.mindsOn8.research[1]
      });
    }
  }

  // Check vocabulary load
  if (lesson.vocabulary && lesson.vocabulary.length > 10) {
    issues.push({
      principle: 'Vocabulary Acquisition',
      problem: `${lesson.vocabulary.length} new words exceeds optimal load`,
      research: PEDAGOGICAL_PRINCIPLES.frenchImmersion.vocabularyDevelopment.research[0],
      suggestion: 'Reduce to 8-10 words maximum'
    });
  }

  // Check for movement
  const hasMovement = JSON.stringify(lesson).toLowerCase().includes('movement') ||
                      JSON.stringify(lesson).toLowerCase().includes('bouger') ||
                      JSON.stringify(lesson).toLowerCase().includes('physique');
  
  if (!hasMovement) {
    suggestions.push({
      principle: 'Physical Development',
      suggestion: 'Add movement opportunities for physical development needs',
      research: PEDAGOGICAL_PRINCIPLES.childDevelopment.physical.research[0]
    });
  }

  return { issues, suggestions };
}

module.exports = {
  PEDAGOGICAL_PRINCIPLES,
  generatePedagogicalContext,
  getResearchCitations,
  validateAgainstPrinciples
};