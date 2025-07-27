export interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number; // in minutes
  prerequisites?: string[];
}

export interface HelpContent {
  id: string;
  title: string;
  content: string;
  section: string;
  tags: string[];
  searchTerms: string[];
  lastUpdated: Date;
  author?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'input' | 'scroll' | 'wait';
  validation?: () => boolean;
  optional?: boolean;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  steps: TutorialStep[];
  completionMessage?: string;
  rewards?: {
    badge?: string;
    points?: number;
  };
}

export interface HelpState {
  currentSection: string | null;
  searchQuery: string;
  activeFilters: string[];
  tutorialProgress: Record<string, number>; // tutorialId -> stepIndex
  completedTutorials: string[];
  showOnboarding: boolean;
  contextualHints: boolean;
  userProgress: {
    helpPagesViewed: string[];
    tutorialsCompleted: string[];
    totalTimeSpent: number; // in minutes
    lastVisited: Date;
  };
}

export interface HelpContextType {
  state: HelpState;
  setCurrentSection: (section: string | null) => void;
  setSearchQuery: (query: string) => void;
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  clearFilters: () => void;
  startTutorial: (tutorialId: string) => void;
  nextTutorialStep: (tutorialId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  markHelpPageViewed: (pageId: string) => void;
  toggleOnboarding: () => void;
  toggleContextualHints: () => void;
}

export interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  delay?: number;
  maxWidth?: number;
  children: React.ReactElement;
}

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | React.ReactNode;
  category?: string;
  showProgress?: boolean;
  nextAction?: {
    label: string;
    action: () => void;
  };
}

export interface TutorialOverlayProps {
  isActive: boolean;
  currentStep: TutorialStep | null;
  tutorial: Tutorial | null;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  progress: number;
}

export interface HelpContentFile {
  filename: string;
  title: string;
  content: string;
  section: string;
  tags: string[];
  lastModified: Date;
}

// Predefined help sections
export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of Teaching Engine 2.0',
    icon: null, // Will be filled in component
    path: '/help/getting-started',
    level: 'beginner',
    estimatedTime: 15
  },
  {
    id: 'planning',
    title: 'Planning Workflows',
    description: 'Master the ETFO-aligned planning process',
    icon: null,
    path: '/help/planning',
    level: 'beginner',
    estimatedTime: 30,
    prerequisites: ['getting-started']
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Leverage AI to enhance your planning',
    icon: null,
    path: '/help/ai',
    level: 'intermediate',
    estimatedTime: 20,
    prerequisites: ['planning']
  },
  {
    id: 'etfo-specific',
    title: 'ETFO Features',
    description: 'Ontario-specific features and templates',
    icon: null,
    path: '/help/etfo',
    level: 'intermediate',
    estimatedTime: 25,
    prerequisites: ['planning']
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    description: 'Power user tips and customization',
    icon: null,
    path: '/help/advanced',
    level: 'advanced',
    estimatedTime: 45,
    prerequisites: ['planning', 'ai-features']
  }
];

// Common help content categories
export const HELP_CATEGORIES = [
  'Getting Started',
  'Planning',
  'AI Features',
  'ETFO Features',
  'Troubleshooting',
  'FAQ',
  'Advanced Tips'
] as const;

export type HelpCategory = typeof HELP_CATEGORIES[number];