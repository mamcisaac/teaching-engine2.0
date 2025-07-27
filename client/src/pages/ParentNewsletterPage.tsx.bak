
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  PlusCircle, Mail, Calendar, Users,
  Languages, Edit3, Trash2,
  RefreshCw, Clock, CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { NewsletterEditor } from '../components/NewsletterEditor';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  useGenerateNewsletter,
  useRegenerateNewsletter,
  useSaveNewsletterDraft,
  useNewsletterDrafts,
  useNewsletter,
  useSendNewsletter,
  useDeleteNewsletter,
  useStudents
} from '../hooks/useNewsletterData';
import { cn } from '../lib/utils';
import type { NewsletterDraft, NewsletterTone, NewsletterGenerationParams } from '../types/newsletter';
import { logger } from '../utils/logger';
export function ParentNewsletterPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const { t: _t, language } = useLanguage();
  
  // State
  const [showCreateForm, setShowCreateForm] = useState(id === null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [tone, setTone] = useState<NewsletterTone>('friendly');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [includeUpcomingEvents, setIncludeUpcomingEvents] = useState(true);
  
  // Queries and mutations
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: drafts, isLoading: draftsLoading } = useNewsletterDrafts();
  const { data: currentNewsletter, isLoading: newsletterLoading } = useNewsletter(id);
  
  const generateNewsletter = useGenerateNewsletter();
  const regenerateNewsletter = useRegenerateNewsletter();
  const saveNewsletterDraft = useSaveNewsletterDraft();
  const sendNewsletter = useSendNewsletter();
  const deleteNewsletter = useDeleteNewsletter();

  // Effects
  useEffect(() => {
    if (currentNewsletter && !showCreateForm) {
      setSelectedStudentIds(currentNewsletter.studentIds ?? []);
      setDateRange({
        from: new Date(currentNewsletter.dateFrom),
        to: new Date(currentNewsletter.dateTo)
      });
      setTone(currentNewsletter.tone);
    }
    
    return () => { // Cleanup
    };
  }, [currentNewsletter, showCreateForm]);

  // Handlers
  const handleGenerateNewsletter = async (): Promise<void> => {
    try {
      const params: NewsletterGenerationParams = {
        studentIds: selectedStudentIds,
        from: dateRange.from,
        to: dateRange.to,
        tone,
        focusAreas,
        includeUpcomingEvents,
        includeArtifacts: true,
        includeReflections: true,
        includeLearningGoals: true,
      };

      const result = await generateNewsletter.mutateAsync(params);
      
      // Create draft from generated content
      const draft: NewsletterDraft = {
        title: (result.metadata.templateType != null && result.metadata.templateType != '') ? 
          `${result.metadata.templateType.charAt(0).toUpperCase()}${result.metadata.templateType.slice(1)} Newsletter` :
          'Parent Newsletter',
        titleFr: (result.metadata.templateType != null && result.metadata.templateType != '') ? 
          `Bulletin ${result.metadata.templateType === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}` :
          'Bulletin aux Parents',
        studentIds: selectedStudentIds,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        tone,
        sections: result.sections,
        isDraft: true,
      };

      const savedDraft = await saveNewsletterDraft.mutateAsync(draft);
      navigate(`/newsletters/${savedDraft.id}`);
      setShowCreateForm(false);
    } catch (_error) {
      logger.error('Failed to generate newsletter:', _error);
      toast.error('Failed to generate newsletter. Please try again.');
    }
  };

  const handleRegenerateNewsletter = async (newTone?: NewsletterTone): Promise<void> => {
    if (!currentNewsletter) {
return;
}
    
    try {
      const result = await regenerateNewsletter.mutateAsync({
        draft: currentNewsletter,
        tone: newTone,
      });

      const updatedDraft: NewsletterDraft = {
        ...currentNewsletter,
        sections: result.sections,
        tone: newTone || currentNewsletter.tone,
      };

      await saveNewsletterDraft.mutateAsync(updatedDraft);
      toast.success('Newsletter regenerated successfully!');
    } catch (_error) {
      logger.error('Failed to regenerate newsletter:', _error);
      toast.error('Failed to regenerate newsletter. Please try again.');
    }
  };

  const handleSaveDraft = async (draft: NewsletterDraft): Promise<void> => {
    try {
      await saveNewsletterDraft.mutateAsync(draft);
    } catch (_error) {
      logger.error('Failed to save draft:', _error);
      toast.error('Failed to save draft. Please try again.');
    }
  };

  const handleSendNewsletter = async (draft: NewsletterDraft): Promise<void> => {
    if (draft.id === null || draft.id === '') {
return;
}
    
    try {
      await sendNewsletter.mutateAsync({ 
        newsletterId: draft.id,
        recipientEmails: students
          ?.filter(student => selectedStudentIds.includes(student.id))
          .map(student => student.parentEmail)
          .filter(Boolean) as string[]
      });
    } catch (_error) {
      logger.error('Failed to send newsletter:', _error);
      toast.error('Failed to send newsletter. Please try again.');
    }
  };

  const handleDeleteNewsletter = async (newsletterId: string): Promise<void> => {
    try {
      await deleteNewsletter.mutateAsync(newsletterId);
      if (id === newsletterId) {
        navigate('/newsletters');
      }
    } catch (_error) {
      logger.error('Failed to delete newsletter:', _error);
      toast.error('Failed to delete newsletter. Please try again.');
    }
  };

  // Loading states
  if (studentsLoading || draftsLoading || ((id != null && id != '') && newsletterLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  // Create new newsletter form
  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Parent Newsletter</h1>
          <p className="text-gray-600">
            Generate personalized newsletters for parents with student progress and classroom updates.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Date Range */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </legend>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="date-from">From</label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="date-from"
                    type="date"
                    value={format(dateRange.from, 'yyyy-MM-dd')}
                    onChange={(e) => {
 setDateRange(prev => ({ 
                      ...prev, 
                      from: new Date(e.target.value) 
                    })); 
}}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor="date-to">To</label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="date-to"
                    type="date"
                    value={format(dateRange.to, 'yyyy-MM-dd')}
                    onChange={(e) => {
 setDateRange(prev => ({ 
                      ...prev, 
                      to: new Date(e.target.value) 
                    })); 
}}
                  />
                </div>
              </div>
            </fieldset>

            {/* Tone Selection */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Tone
              </legend>
              <div className="flex gap-3">
                {(['friendly', 'formal', 'informative'] as NewsletterTone[]).map((toneOption, _index) => (
                  <button
                    key={toneOption}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-colors",
                      tone === toneOption
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    )}
                    onClick={() => {
 setTone(toneOption); 
}}
                  >
                    {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Options */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Include
              </legend>
              <div className="space-y-2">
                <label className="flex items-center" htmlFor="include-upcoming-events">
                  <input
                    checked={includeUpcomingEvents}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    id="include-upcoming-events"
                    type="checkbox"
                    onChange={(e) => {
 setIncludeUpcomingEvents(e.target.checked); 
}}
                  />
                  <span className="ml-2 text-sm text-gray-700">Upcoming events and important dates</span>
                </label>
              </div>
            </fieldset>

            {/* Focus Areas */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas (Optional)
              </legend>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                id="focus-areas"
                placeholder="e.g., Math progress, Reading milestones, Science projects"
                type="text"
                value={focusAreas.join(', ')}
                onChange={(e) => {
 setFocusAreas(
                  e.target.value.split(',').map(area => area.trim()).filter(Boolean)
                ); 
}}
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of topics to emphasize
              </p>
            </fieldset>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
 navigate('/newsletters'); 
}}
              >
                Cancel
              </button>
              
              <button
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={generateNewsletter.isPending}
                onClick={() => {
                  void handleGenerateNewsletter().catch((error: unknown) => {
                    logger.error('Error generating newsletter:', error);
                  });
                }}
              >
                {generateNewsletter.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Generate Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Newsletter editor view
  if (currentNewsletter) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Editor</h1>
              <p className="text-gray-600">
                {format(currentNewsletter.dateFrom, 'MMM d')} - {format(currentNewsletter.dateTo, 'MMM d, yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
 navigate('/newsletters'); 
}}
              >
                Back to Newsletters
              </button>
              
              <button
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                onClick={() => {
                  if (currentNewsletter.id != null && currentNewsletter.id != '') {
                    void handleDeleteNewsletter(currentNewsletter.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <NewsletterEditor
          draft={currentNewsletter}
          isGenerating={regenerateNewsletter.isPending}
          onRegenerate={(tone?: NewsletterTone) => {
            void handleRegenerateNewsletter(tone).catch((error: unknown) => {
              logger.error('Error regenerating newsletter:', error);
            });
          }}
          onSave={(draft: NewsletterDraft) => {
            void handleSaveDraft(draft).catch((error: unknown) => {
              logger.error('Error saving draft:', error);
            });
          }}
          onSend={(draft: NewsletterDraft) => {
            void handleSendNewsletter(draft).catch((error: unknown) => {
              logger.error('Error sending newsletter:', error);
            });
          }}
        />
      </div>
    );
  }

  // Newsletter list view
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Newsletters</h1>
            <p className="text-gray-600">
              Create and manage newsletters to keep parents informed about classroom activities and student progress.
            </p>
          </div>
          
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => {
 setShowCreateForm(true); 
}}
          >
            <PlusCircle className="w-4 h-4" />
            New Newsletter
          </button>
        </div>
      </div>

      {/* Newsletter drafts */}
      {drafts && drafts.length > 0 ? (
        <div className="grid gap-6">
          {drafts.map((draft, _index) => (
            <div key={draft.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'en' ? draft.title : draft.titleFr}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(draft.dateFrom), 'MMM d')} - {format(new Date(draft.dateTo), 'MMM d, yyyy')}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Languages className="w-4 h-4" />
                      {draft.tone}
                    </div>
                    
                    {draft.studentIds && draft.studentIds.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {draft.studentIds.length} students
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {draft.isDraft ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        <Clock className="w-3 h-3" />
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Sent
                      </span>
                    )}
                    
                    <span className="text-xs text-gray-500">
                      Updated {draft.updatedAt ? format(new Date(draft.updatedAt), 'MMM d, h:mm a') : 'Never'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                    onClick={() => {
 navigate(`/newsletters/${draft.id}`); 
}}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                    onClick={() => {
 void handleDeleteNewsletter(draft.id!); 
}}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletters yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first newsletter to share classroom updates with parents.
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
            onClick={() => {
 setShowCreateForm(true); 
}}
          >
            <PlusCircle className="w-4 h-4" />
            Create Newsletter
          </button>
        </div>
      )}
    </div>
  );
}
