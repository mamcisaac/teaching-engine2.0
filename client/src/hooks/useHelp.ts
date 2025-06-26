import { useState, useEffect, useMemo } from 'react';
import { useHelp as useHelpContext } from '../contexts/HelpContext';
import { HelpContent, Tutorial } from '../types/help';

// Mock help content - in a real app, this would come from markdown files or API
const mockHelpContent: HelpContent[] = [
  {
    id: 'getting-started-overview',
    title: 'Getting Started Overview',
    content: 'Welcome to Teaching Engine 2.0! This comprehensive guide will help you get up and running quickly...',
    section: 'getting-started',
    tags: ['beginner', 'setup', 'overview'],
    searchTerms: ['start', 'begin', 'new', 'setup', 'first time'],
    lastUpdated: new Date(),
    difficulty: 'beginner'
  },
  {
    id: 'long-range-planning',
    title: 'Long-Range Planning Guide',
    content: 'Long-range plans form the foundation of the ETFO-aligned planning hierarchy...',
    section: 'planning',
    tags: ['planning', 'long-range', 'yearly', 'curriculum'],
    searchTerms: ['long-range', 'yearly', 'annual', 'scope', 'sequence'],
    lastUpdated: new Date(),
    difficulty: 'beginner'
  },
  {
    id: 'unit-planning',
    title: 'Unit Planning Guide',
    content: 'Unit plans are the detailed breakdown of your long-range plan themes...',
    section: 'planning',
    tags: ['planning', 'unit', 'curriculum', 'assessment'],
    searchTerms: ['unit', 'theme', 'assessment', 'learning goals'],
    lastUpdated: new Date(),
    difficulty: 'beginner'
  },
  {
    id: 'ai-features-overview',
    title: 'AI Features Overview',
    content: 'Teaching Engine 2.0 integrates artificial intelligence to reduce your planning workload...',
    section: 'ai-features',
    tags: ['ai', 'artificial intelligence', 'automation', 'efficiency'],
    searchTerms: ['ai', 'artificial intelligence', 'automation', 'suggestions', 'smart'],
    lastUpdated: new Date(),
    difficulty: 'intermediate'
  },
  {
    id: 'prompting-tips',
    title: 'AI Prompting Best Practices',
    content: 'Get the most out of AI assistance with these proven prompting strategies...',
    section: 'ai-features',
    tags: ['ai', 'prompts', 'tips', 'best practices'],
    searchTerms: ['prompts', 'prompting', 'ai tips', 'better results'],
    lastUpdated: new Date(),
    difficulty: 'intermediate'
  },
  {
    id: 'etfo-templates',
    title: 'ETFO Template Guide',
    content: 'Learn how to use and customize ETFO-aligned planning templates...',
    section: 'etfo-specific',
    tags: ['etfo', 'templates', 'ontario', 'standards'],
    searchTerms: ['etfo', 'templates', 'ontario', 'standards', 'alignment'],
    lastUpdated: new Date(),
    difficulty: 'intermediate'
  },
  {
    id: 'curriculum-import',
    title: 'Curriculum Import Walkthrough',
    content: 'Step-by-step guide to importing and organizing curriculum documents...',
    section: 'workflows',
    tags: ['curriculum', 'import', 'setup', 'organization'],
    searchTerms: ['import', 'curriculum', 'upload', 'documents', 'organize'],
    lastUpdated: new Date(),
    difficulty: 'beginner'
  }
];

// Mock tutorials - comprehensive interactive guides
const mockTutorials: Tutorial[] = [
  {
    id: 'getting-started-tour',
    title: 'Teaching Engine 2.0 Getting Started Tour',
    description: 'Take a comprehensive tour of Teaching Engine 2.0 and learn the ETFO planning workflow',
    category: 'Getting Started',
    estimatedTime: 10,
    difficulty: 'beginner',
    prerequisites: [],
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Teaching Engine 2.0',
        description: 'Welcome! This tour will show you how Teaching Engine 2.0 follows the ETFO 5-level planning hierarchy to reduce your workload by 60%.',
        position: 'bottom'
      },
      {
        id: 'sidebar-overview',
        title: 'ETFO Planning Workflow',
        description: 'The sidebar shows the 5-level ETFO planning hierarchy. You\'ll work through these levels from top to bottom: Long-Range Plans → Unit Plans → Lesson Plans → Weekly Planning → Daily Reflection.',
        targetElement: '[data-testid="main-sidebar"]',
        position: 'right'
      },
      {
        id: 'help-location',
        title: 'Getting Help',
        description: 'The Help & Documentation section provides comprehensive guides, tutorials, and AI prompting tips. You can access it anytime from the sidebar.',
        targetElement: 'a[href="/help"]',
        position: 'right'
      },
      {
        id: 'next-steps',
        title: 'Ready to Start Planning',
        description: 'You\'re ready to begin! Start with the "Create Your First Long-Range Plan" tutorial to begin your planning journey.',
        position: 'top'
      }
    ],
    completionMessage: 'Welcome aboard! You\'re ready to start using Teaching Engine 2.0 to streamline your planning process.',
    rewards: {
      badge: 'Welcome Explorer',
      points: 50
    }
  },
  {
    id: 'first-long-range-plan',
    title: 'Create Your First Long-Range Plan',
    description: 'Learn to create a comprehensive yearly plan with AI assistance following ETFO best practices',
    category: 'Getting Started',
    estimatedTime: 15,
    difficulty: 'beginner',
    prerequisites: [],
    steps: [
      {
        id: 'navigate-long-range',
        title: 'Navigate to Long-Range Plans',
        description: 'Click on "Long-Range Plans" in the ETFO workflow sidebar to begin creating your yearly overview.',
        targetElement: '[data-testid="long-range-nav"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'create-new-plan',
        title: 'Create New Plan',
        description: 'Click the "Create New Plan" button to start building your long-range plan. This will become the foundation for all your other planning.',
        targetElement: '[data-testid="create-plan-button"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'select-grade-subjects',
        title: 'Choose Grade and Subjects',
        description: 'Select your grade level and the subjects you teach. The AI will customize suggestions based on these selections.',
        targetElement: '[data-testid="grade-subject-selector"]',
        position: 'top',
        action: 'input'
      },
      {
        id: 'ai-assistance',
        title: 'Use AI for Unit Suggestions',
        description: 'Click the AI assistant to get curriculum-aligned unit suggestions. The AI analyzes Ontario curriculum expectations to suggest logical unit themes.',
        targetElement: '[data-testid="ai-unit-suggestions"]',
        position: 'left',
        action: 'click'
      },
      {
        id: 'save-plan',
        title: 'Save Your Plan',
        description: 'Save your long-range plan. You can always come back to refine it as you develop your units and lessons.',
        targetElement: '[data-testid="save-plan-button"]',
        position: 'bottom',
        action: 'click'
      }
    ],
    completionMessage: 'Excellent! You\'ve created your first long-range plan. This foundation will guide all your subsequent planning. Next, try creating unit plans from your long-range themes.',
    rewards: {
      badge: 'Planning Pioneer',
      points: 100
    }
  },
  {
    id: 'unit-plan-creation',
    title: 'Develop Your First Unit Plan',
    description: 'Learn to create detailed unit plans that break down your long-range themes into manageable learning experiences',
    category: 'Planning Workflow',
    estimatedTime: 20,
    difficulty: 'beginner',
    prerequisites: ['first-long-range-plan'],
    steps: [
      {
        id: 'navigate-units',
        title: 'Navigate to Unit Plans',
        description: 'Click on "Unit Plans" in the ETFO workflow. Unit plans are where you detail the learning experiences for each theme in your long-range plan.',
        targetElement: 'a[href*="units"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'select-unit-theme',
        title: 'Choose a Unit Theme',
        description: 'Select a unit theme from your long-range plan. Start with a unit you\'ll be teaching soon.',
        targetElement: '[data-testid="unit-theme-selector"]',
        position: 'top',
        action: 'click'
      },
      {
        id: 'set-learning-goals',
        title: 'Define Learning Goals',
        description: 'Set clear, curriculum-aligned learning goals for your unit. These will guide all your lesson planning.',
        targetElement: '[data-testid="learning-goals-section"]',
        position: 'bottom',
        action: 'input'
      },
      {
        id: 'plan-assessment',
        title: 'Plan Assessment Strategy',
        description: 'Design your assessment strategy before planning activities. Consider diagnostic, formative, and summative assessment opportunities.',
        targetElement: '[data-testid="assessment-planning"]',
        position: 'left'
      },
      {
        id: 'generate-activities',
        title: 'Use AI for Activity Ideas',
        description: 'Let the AI suggest engaging activities based on your learning goals. You can customize these suggestions for your students.',
        targetElement: '[data-testid="ai-activity-generator"]',
        position: 'right',
        action: 'click'
      }
    ],
    completionMessage: 'Great work! You\'ve created a comprehensive unit plan. Now you can break this down into daily lessons using the ETFO three-part lesson structure.',
    rewards: {
      badge: 'Unit Architect',
      points: 150
    }
  },
  {
    id: 'ai-lesson-planning',
    title: 'AI-Assisted Lesson Planning',
    description: 'Master the three-part lesson structure with AI assistance to create engaging, curriculum-aligned daily lessons',
    category: 'AI Features',
    estimatedTime: 25,
    difficulty: 'intermediate',
    prerequisites: ['unit-plan-creation'],
    steps: [
      {
        id: 'navigate-lessons',
        title: 'Open Lesson Planning',
        description: 'Navigate to lesson planning from your unit plan. Daily lessons implement your unit goals through the three-part ETFO structure.',
        targetElement: '[data-testid="lesson-planning-nav"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'three-part-structure',
        title: 'Understanding Three-Part Lessons',
        description: 'ETFO lessons follow a proven structure: Minds On (engagement), Action (core learning), and Consolidation (reflection). This maximizes student learning.',
        targetElement: '[data-testid="lesson-structure-guide"]',
        position: 'top'
      },
      {
        id: 'minds-on-ai',
        title: 'AI for Minds On Activities',
        description: 'Use AI to generate engaging opening activities that activate prior knowledge and introduce your learning goal.',
        targetElement: '[data-testid="minds-on-ai"]',
        position: 'bottom',
        action: 'click'
      },
      {
        id: 'action-phase-planning',
        title: 'Plan Action Phase Activities',
        description: 'The Action phase is your core instruction. AI can suggest varied activities for different learning styles and abilities.',
        targetElement: '[data-testid="action-phase-ai"]',
        position: 'left',
        action: 'click'
      },
      {
        id: 'consolidation-strategies',
        title: 'Consolidation Activities',
        description: 'Plan how students will summarize their learning and connect to bigger ideas. AI can suggest reflection strategies.',
        targetElement: '[data-testid="consolidation-ai"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'differentiation-planning',
        title: 'Add Differentiation',
        description: 'Use AI to generate accommodations, modifications, and enrichment activities for diverse learners.',
        targetElement: '[data-testid="differentiation-tools"]',
        position: 'bottom',
        action: 'click'
      }
    ],
    completionMessage: 'Fantastic! You\'ve mastered AI-assisted lesson planning. You can now create engaging, differentiated lessons efficiently while maintaining high quality.',
    rewards: {
      badge: 'AI Lesson Master',
      points: 200
    }
  },
  {
    id: 'ai-prompting-mastery',
    title: 'Master AI Prompting for Better Results',
    description: 'Learn advanced prompting techniques to get the most helpful and relevant AI suggestions for your teaching context',
    category: 'AI Features',
    estimatedTime: 15,
    difficulty: 'intermediate',
    prerequisites: ['ai-lesson-planning'],
    steps: [
      {
        id: 'prompting-basics',
        title: 'Effective Prompting Principles',
        description: 'Good prompts are specific, include context, and clearly state what you want. Learn the CLEAR framework: Context, Learning goals, Environment, Action, Requirements.',
        targetElement: '[data-testid="ai-help-panel"]',
        position: 'left'
      },
      {
        id: 'specific-prompts',
        title: 'Write Specific Prompts',
        description: 'Instead of "create a math lesson," try "create a 45-minute Grade 4 lesson on area measurement using hands-on materials for students who struggle with spatial concepts."',
        targetElement: '[data-testid="ai-prompt-input"]',
        position: 'top',
        action: 'input'
      },
      {
        id: 'context-matters',
        title: 'Include Important Context',
        description: 'Tell the AI about your students, available resources, time constraints, and any special considerations. This dramatically improves suggestion quality.',
        targetElement: '[data-testid="ai-prompt-input"]',
        position: 'bottom',
        action: 'input'
      },
      {
        id: 'iterative-prompting',
        title: 'Build on Previous Suggestions',
        description: 'Start broad, then ask for more detail: "From those activities, expand on the hands-on options" or "Add differentiation for English language learners."',
        targetElement: '[data-testid="ai-conversation"]',
        position: 'right'
      }
    ],
    completionMessage: 'Excellent! You\'ve learned to communicate effectively with AI to get highly relevant, customized suggestions that save time while improving your teaching.',
    rewards: {
      badge: 'AI Whisperer',
      points: 175
    }
  },
  {
    id: 'daybook-reflection',
    title: 'Daily Reflection with the Daybook',
    description: 'Learn to use the Daybook for meaningful daily reflection that improves your teaching and student learning',
    category: 'Planning Workflow',
    estimatedTime: 12,
    difficulty: 'beginner',
    prerequisites: ['ai-lesson-planning'],
    steps: [
      {
        id: 'navigate-daybook',
        title: 'Open the Daybook',
        description: 'The Daybook is your daily reflection tool. It captures what actually happened vs. what you planned, helping you become a more responsive teacher.',
        targetElement: 'a[href*="daybook"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'daily-reflection-purpose',
        title: 'Why Daily Reflection Matters',
        description: 'Daily reflection helps you adjust instruction based on evidence, track student progress, and improve your teaching over time. It only takes 5-10 minutes.',
        targetElement: '[data-testid="reflection-guide"]',
        position: 'top'
      },
      {
        id: 'what-happened',
        title: 'Record What Actually Happened',
        description: 'Note which activities worked well, which students struggled or excelled, and what unexpected learning opportunities emerged.',
        targetElement: '[data-testid="what-happened-section"]',
        position: 'bottom',
        action: 'input'
      },
      {
        id: 'student-observations',
        title: 'Track Student Progress',
        description: 'Record specific observations about individual students and whole-class patterns. This informs your planning and parent communication.',
        targetElement: '[data-testid="student-observations"]',
        position: 'left',
        action: 'input'
      },
      {
        id: 'tomorrow-adjustments',
        title: 'Plan Tomorrow\'s Adjustments',
        description: 'Based on today\'s evidence, what needs to change tomorrow? This makes your teaching truly responsive to student needs.',
        targetElement: '[data-testid="tomorrow-adjustments"]',
        position: 'right',
        action: 'input'
      }
    ],
    completionMessage: 'Perfect! Regular Daybook reflection will transform your teaching by making it truly responsive to student learning. You\'re building professional expertise!',
    rewards: {
      badge: 'Reflective Practitioner',
      points: 125
    }
  },
  {
    id: 'etfo-workflow-mastery',
    title: 'Complete ETFO Workflow Integration',
    description: 'Learn how all five ETFO planning levels work together to create a seamless, efficient planning system',
    category: 'Advanced Features',
    estimatedTime: 20,
    difficulty: 'advanced',
    prerequisites: ['daybook-reflection', 'ai-prompting-mastery'],
    steps: [
      {
        id: 'workflow-overview',
        title: 'The Complete ETFO System',
        description: 'The 5-level ETFO hierarchy creates a seamless flow: Long-Range Plans inform Unit Plans, which guide Lesson Plans, supported by Weekly Planning and Daily Reflection.',
        targetElement: '[data-testid="workflow-diagram"]',
        position: 'top'
      },
      {
        id: 'planning-connections',
        title: 'See the Connections',
        description: 'Notice how your long-range themes automatically populate in unit planning, and unit goals flow into lesson planning. This eliminates duplicate work.',
        targetElement: '[data-testid="planning-connections"]',
        position: 'bottom'
      },
      {
        id: 'assessment-integration',
        title: 'Assessment Flows Through All Levels',
        description: 'Assessment strategies planned at the unit level inform daily lesson assessment, and Daybook observations inform future unit planning.',
        targetElement: '[data-testid="assessment-flow"]',
        position: 'left'
      },
      {
        id: 'ai-throughout',
        title: 'AI Enhances Every Level',
        description: 'AI assists at every planning level: curriculum mapping for long-range plans, activity generation for units, lesson structuring, and reflection analysis.',
        targetElement: '[data-testid="ai-integration"]',
        position: 'right'
      },
      {
        id: 'efficiency-gains',
        title: 'Your 60% Time Savings',
        description: 'By following this integrated system, teachers typically reduce planning time by 60% while improving curriculum coverage and lesson quality.',
        targetElement: '[data-testid="efficiency-metrics"]',
        position: 'top'
      }
    ],
    completionMessage: 'Congratulations! You\'ve mastered the complete ETFO workflow in Teaching Engine 2.0. You\'re now equipped to plan efficiently while maintaining excellent teaching quality.',
    rewards: {
      badge: 'ETFO Master Planner',
      points: 300
    }
  }
];

export function useHelpContent() {
  const { state } = useHelpContext();
  const [_isLoading, _setIsLoading] = useState(false);

  // Filter and search help content
  const filteredContent = useMemo(() => {
    let content = mockHelpContent;

    // Apply section filter
    if (state.currentSection) {
      content = content.filter(item => item.section === state.currentSection);
    }

    // Apply active filters
    if (state.activeFilters.length > 0) {
      content = content.filter(item =>
        state.activeFilters.some(filter =>
          item.tags.includes(filter.toLowerCase()) ||
          item.difficulty === filter.toLowerCase()
        )
      );
    }

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      content = content.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.searchTerms.some(term => term.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return content;
  }, [state.currentSection, state.activeFilters, state.searchQuery]);

  // Get available filter options
  const availableFilters = useMemo(() => {
    const allTags = mockHelpContent.flatMap(item => item.tags);
    const allDifficulties = mockHelpContent.map(item => item.difficulty);
    const uniqueFilters = [...new Set([...allTags, ...allDifficulties])];
    
    return uniqueFilters.map(filter => ({
      value: filter,
      label: filter.charAt(0).toUpperCase() + filter.slice(1),
      count: mockHelpContent.filter(item =>
        item.tags.includes(filter) || item.difficulty === filter
      ).length
    }));
  }, []);

  return {
    content: filteredContent,
    availableFilters,
    isLoading,
    totalCount: mockHelpContent.length,
    filteredCount: filteredContent.length
  };
}

export function useTutorials() {
  const { state } = useHelpContext();

  // Get available tutorials
  const availableTutorials = useMemo(() => {
    return mockTutorials.filter(tutorial => {
      // Check if prerequisites are met
      if (tutorial.prerequisites.length > 0) {
        return tutorial.prerequisites.every(prereq =>
          state.completedTutorials.includes(prereq)
        );
      }
      return true;
    });
  }, [state.completedTutorials]);

  // Get tutorial by ID
  const getTutorial = (tutorialId: string) => {
    return mockTutorials.find(tutorial => tutorial.id === tutorialId);
  };

  // Get tutorial progress
  const getTutorialProgress = (tutorialId: string) => {
    const tutorial = getTutorial(tutorialId);
    if (!tutorial) return 0;

    const currentStep = state.tutorialProgress[tutorialId] || 0;
    return (currentStep / tutorial.steps.length) * 100;
  };

  return {
    availableTutorials,
    completedTutorials: state.completedTutorials,
    activeTutorials: Object.keys(state.tutorialProgress),
    getTutorial,
    getTutorialProgress
  };
}

export function useHelpAnalytics() {
  const { state } = useHelpContext();

  const analytics = useMemo(() => {
    const totalPagesViewed = state.userProgress.helpPagesViewed.length;
    const totalTutorialsCompleted = state.userProgress.tutorialsCompleted.length;
    const totalTimeSpent = state.userProgress.totalTimeSpent;

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(
      100,
      (totalPagesViewed * 5) + (totalTutorialsCompleted * 20) + (totalTimeSpent * 2)
    );

    // Calculate completion rate
    const completionRate = (totalTutorialsCompleted / mockTutorials.length) * 100;

    return {
      totalPagesViewed,
      totalTutorialsCompleted,
      totalTimeSpent,
      engagementScore,
      completionRate,
      lastVisited: state.userProgress.lastVisited,
      streak: calculateHelpStreak(state.userProgress.helpPagesViewed)
    };
  }, [state.userProgress]);

  return analytics;
}

// Helper function to calculate help usage streak
function calculateHelpStreak(viewedPages: string[]): number {
  // This is a simplified streak calculation
  // In a real app, you'd track daily usage
  return Math.min(viewedPages.length, 30);
}

export function useHelpSearch() {
  const { setSearchQuery, state } = useHelpContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get search suggestions based on current query
  useEffect(() => {
    if (state.searchQuery.length > 1) {
      const query = state.searchQuery.toLowerCase();
      const allSearchTerms = mockHelpContent.flatMap(item => item.searchTerms);
      const matchingSuggestions = allSearchTerms
        .filter(term => term.toLowerCase().includes(query))
        .slice(0, 5);
      
      setSuggestions(matchingSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [state.searchQuery]);

  const popularSearches = [
    'getting started',
    'ai prompts',
    'lesson planning',
    'curriculum import',
    'unit plans',
    'assessment'
  ];

  return {
    query: state.searchQuery,
    setQuery: setSearchQuery,
    suggestions,
    popularSearches
  };
}