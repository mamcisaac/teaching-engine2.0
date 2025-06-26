import React, { useState, useEffect } from 'react';
import { useHelp } from '../contexts/HelpContext';
import { HELP_SECTIONS, HELP_CATEGORIES, HelpSection } from '../types/help';
import { HelpButton, HelpSearch } from '../components/help';
import { useHelpContent } from '../hooks/useHelp';
import { Button } from '../components/ui/Button';
import { clsx } from 'clsx';

// Mock help content - in a real app, this would come from markdown files
const mockHelpContent: Record<string, string> = {
  'getting-started': `
    # Getting Started with Teaching Engine 2.0

    Welcome to Teaching Engine 2.0! This comprehensive guide will help you get up and running quickly.

    ## Overview
    Teaching Engine 2.0 is designed to reduce your planning workload by 60% while improving curriculum coverage through intelligent automation.

    ## First Steps
    1. **Complete your profile setup** - Add your grade level, subjects, and preferences
    2. **Import your curriculum** - Use our AI-powered curriculum import tool
    3. **Create your first long-range plan** - Start with the ETFO-aligned workflow
    4. **Explore AI features** - Let AI assist with lesson planning and resource generation

    ## Key Features
    - **ETFO-Aligned Planning**: Follow the proven 5-level planning hierarchy
    - **AI-Powered Assistance**: Get intelligent suggestions for lessons and activities
    - **Curriculum Integration**: Automatic alignment with Ontario curriculum expectations
    - **Resource Generation**: Bulk creation of teaching materials and planning templates
  `,
  'planning': `
    # Planning Workflows

    Master the ETFO-aligned planning process that forms the backbone of Teaching Engine 2.0.

    ## The 5-Level Planning Hierarchy

    ### 1. Long-Range Plans
    - Set up your year-long overview
    - Align with curriculum expectations
    - Plan major units and themes

    ### 2. Unit Plans
    - Detail your unit structure
    - Define learning goals and success criteria
    - Plan assessments and culminating activities

    ### 3. Lesson Plans
    - Create detailed daily lessons
    - Follow the three-part lesson structure
    - Include differentiation strategies

    ### 4. Weekly Planning
    - Organize your weekly schedule
    - Plan cross-curricular connections
    - Prepare resources and materials

    ### 5. Daily Reflection (Daybook)
    - Record what happened each day
    - Note teaching reflections and observations
    - Plan adjustments for tomorrow

    ## Best Practices
    - Start with the big picture (long-range) and work down
    - Use AI suggestions to enhance your planning
    - Regularly review and adjust based on student needs
  `,
  'ai-features': `
    # AI Features

    Leverage artificial intelligence to enhance your teaching and planning efficiency.

    ## AI-Powered Planning
    Our AI assistant can help you:
    - Generate lesson ideas based on curriculum expectations
    - Suggest activities and resources
    - Create planning rubrics for formative assessment
    - Develop differentiation strategies

    ## Prompting Tips
    To get the best results from AI:
    - Be specific about your grade level and subject
    - Include your learning goals
    - Mention any constraints (time, resources, student needs)
    - Ask for multiple options to choose from

    ## AI Content Generation
    - **Lesson Plans**: Get complete lesson structures
    - **Activities**: Creative and engaging student activities
    - **Assessment Planning**: Templates for formative assessment strategies
    - **Parent Communication**: Newsletter content and updates

    ## Quality Assurance
    Always review AI-generated content to ensure:
    - Alignment with your specific curriculum
    - Appropriateness for your students
    - Accuracy of content and pedagogy
  `,
  'etfo-specific': `
    # ETFO Features

    Ontario-specific features designed for elementary teachers.

    ## Curriculum Alignment
    - Automatic mapping to Ontario curriculum expectations
    - Grade-specific learning goals
    - Planning templates aligned with provincial curriculum

    ## ETFO Planning Templates
    - Pre-built templates following ETFO best practices
    - Three-part lesson structure
    - Differentiated instruction frameworks

    ## Planning Tools
    - Ontario curriculum-aligned templates
    - Formative assessment planning guides
    - Teaching observation templates

    ## Professional Learning
    - Resources aligned with ETFO professional development
    - Best practices from Ontario educators
    - Research-based teaching strategies
  `,
  'advanced': `
    # Advanced Features

    Power user tips and customization options for experienced users.

    ## Customization
    - Create your own templates
    - Set up automated workflows
    - Customize AI prompts for your teaching style

    ## Integration
    - Export to Google Classroom
    - Sync with school information systems
    - Connect with other teaching tools

    ## Planning Analytics
    - Track curriculum coverage in your plans
    - Monitor your planning efficiency
    - Review your teaching patterns and reflections

    ## Collaboration
    - Share plans with colleagues
    - Create team templates
    - Collaborate on unit development
  `
};

export default function HelpPage() {
  const { state, setCurrentSection, markHelpPageViewed } = useHelp();
  const { content, filteredCount, totalCount } = useHelpContent();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [filteredSections, setFilteredSections] = useState<HelpSection[]>(HELP_SECTIONS);

  useEffect(() => {
    markHelpPageViewed('help-main');
  }, [markHelpPageViewed]);

  useEffect(() => {
    if (state.searchQuery) {
      const filtered = HELP_SECTIONS.filter(section =>
        section.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(HELP_SECTIONS);
    }
  }, [state.searchQuery]);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentSection(sectionId);
    markHelpPageViewed(`help-${sectionId}`);
  };

  const getSectionIcon = (sectionId: string) => {
    const iconClasses = "h-8 w-8";
    
    switch (sectionId) {
      case 'getting-started':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'planning':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'ai-features':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'etfo-specific':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'advanced':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const renderSectionContent = (sectionId: string) => {
    const sectionContent = mockHelpContent[sectionId] || 'Content not available.';
    
    return (
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: sectionContent.replace(/\n/g, '<br/>') }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help & Documentation</h1>
              <p className="mt-2 text-lg text-gray-600">
                Learn how to make the most of Teaching Engine 2.0
              </p>
            </div>
            <HelpButton
              variant="floating"
              content="Get help anywhere in the app"
              onClick={() => {/* Handle global help */}}
            />
          </div>

          {/* Search */}
          <div className="mt-6 max-w-2xl">
            <HelpSearch
              placeholder="Search help topics..."
              showFilters={true}
              showSuggestions={true}
              onResultSelect={(contentId) => {
                // In a real app, you would navigate to the specific content
                console.log('Selected content:', contentId);
              }}
            />
            {state.searchQuery && (
              <div className="mt-2 text-sm text-gray-600">
                Showing {filteredCount} of {totalCount} help articles
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Help Topics</h2>
              
              <nav className="space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleSectionSelect(section.id)}
                    className={clsx(
                      'w-full text-left p-3 rounded-lg transition-colors',
                      'flex items-start space-x-3',
                      selectedSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <div className="flex-shrink-0 mt-1 text-gray-400">
                      {getSectionIcon(section.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{section.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{section.description}</div>
                      <div className="flex items-center mt-2 space-x-4 text-xs text-gray-400">
                        <span className="capitalize">{section.level}</span>
                        {section.estimatedTime && (
                          <span>{section.estimatedTime} min read</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2 text-sm">
                  <a href="/tutorials" className="block text-blue-600 hover:text-blue-700">
                    Interactive Tutorials
                  </a>
                  <a href="/faq" className="block text-blue-600 hover:text-blue-700">
                    Frequently Asked Questions
                  </a>
                  <a href="/support" className="block text-blue-600 hover:text-blue-700">
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedSection ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                {renderSectionContent(selectedSection)}
                
                {/* Feedback section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Was this helpful?</h3>
                      <p className="text-sm text-gray-600 mt-1">Let us know how we can improve this page.</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        👍 Yes
                      </Button>
                      <Button variant="outline" size="sm">
                        👎 No
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to Teaching Engine 2.0 Help
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a topic from the sidebar to get started, or search for specific help.
                  </p>
                  
                  {/* Popular topics */}
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {HELP_SECTIONS.slice(0, 4).map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionSelect(section.id)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-gray-400 mb-2">
                          {getSectionIcon(section.id)}
                        </div>
                        <div className="font-medium text-gray-900">{section.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}