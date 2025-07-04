import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Mail, Calendar, Users,
  Languages, Edit3, Trash2,
  RefreshCw, Clock, CheckCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
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
import { NewsletterDraft, NewsletterTone, NewsletterGenerationParams } from '../types/newsletter';
import NewsletterEditor from '../components/NewsletterEditor';
import { cn } from '../lib/utils';

export default function ParentNewsletterPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const { t: _t, language } = useLanguage();
  
  // State
  const [showCreateForm, setShowCreateForm] = useState(!id);
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
      setSelectedStudentIds(currentNewsletter.studentIds || []);
      setDateRange({
        from: new Date(currentNewsletter.dateFrom),
        to: new Date(currentNewsletter.dateTo)
      });
      setTone(currentNewsletter.tone);
    }
  }, [currentNewsletter, showCreateForm]);

  // Handlers
  const handleGenerateNewsletter = async () => {
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
        title: result.metadata.templateType ? 
          `${result.metadata.templateType.charAt(0).toUpperCase()}${result.metadata.templateType.slice(1)} Newsletter` :
          'Parent Newsletter',
        titleFr: result.metadata.templateType ? 
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
      console.error('Failed to generate newsletter:', error);
      toast.error('Failed to generate newsletter. Please try again.');
    }
  };

  const handleRegenerateNewsletter = async (newTone?: NewsletterTone) => {
    if (!currentNewsletter) return;
    
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
      console.error('Failed to regenerate newsletter:', error);
      toast.error('Failed to regenerate newsletter. Please try again.');
    }
  };

  const handleSaveDraft = async (draft: NewsletterDraft) => {
    try {
      await saveNewsletterDraft.mutateAsync(draft);
    } catch (_error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft. Please try again.');
    }
  };

  const handleSendNewsletter = async (draft: NewsletterDraft) => {
    if (!draft.id) return;
    
    try {
      await sendNewsletter.mutateAsync({ 
        newsletterId: draft.id,
        recipientEmails: students
          ?.filter(student => selectedStudentIds.includes(student.id))
          ?.map(student => student.parentEmail)
          ?.filter(Boolean) as string[]
      });
    } catch (_error) {
      console.error('Failed to send newsletter:', error);
      toast.error('Failed to send newsletter. Please try again.');
    }
  };

  const handleDeleteNewsletter = async (newsletterId: string) => {
    try {
      await deleteNewsletter.mutateAsync(newsletterId);
      if (id === newsletterId) {
        navigate('/newsletters');
      }
    } catch (_error) {
      console.error('Failed to delete newsletter:', error);
      toast.error('Failed to delete newsletter. Please try again.');
    }
  };

  // Loading states
  if (studentsLoading || draftsLoading || (id && newsletterLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={format(dateRange.from, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange(prev => ({ 
                      ...prev, 
                      from: new Date(e.target.value) 
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={format(dateRange.to, 'yyyy-MM-dd')}
                    onChange={(e) => setDateRange(prev => ({ 
                      ...prev, 
                      to: new Date(e.target.value) 
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Newsletter Tone
              </label>
              <div className="flex gap-3">
                {(['friendly', 'formal', 'informative'] as NewsletterTone[]).map((toneOption) => (
                  <button
                    key={toneOption}
                    onClick={() => setTone(toneOption)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-colors",
                      tone === toneOption
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    )}
                  >
                    {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeUpcomingEvents}
                    onChange={(e) => setIncludeUpcomingEvents(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Upcoming events and important dates</span>
                </label>
              </div>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Math progress, Reading milestones, Science projects"
                value={focusAreas.join(', ')}
                onChange={(e) => setFocusAreas(
                  e.target.value.split(',').map(area => area.trim()).filter(Boolean)
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated list of topics to emphasize
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <button
                onClick={() => navigate('/newsletters')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              
              <button
                onClick={handleGenerateNewsletter}
                disabled={generateNewsletter.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                onClick={() => navigate('/newsletters')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back to Newsletters
              </button>
              
              <button
                onClick={() => handleDeleteNewsletter(currentNewsletter.id!)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
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
          onSave={handleSaveDraft}
          onSend={handleSendNewsletter}
          onRegenerate={handleRegenerateNewsletter}
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
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            New Newsletter
          </button>
        </div>
      </div>

      {/* Newsletter drafts */}
      {drafts && drafts.length > 0 ? (
        <div className="grid gap-6">
          {drafts.map((draft) => (
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
                    onClick={() => navigate(`/newsletters/${draft.id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteNewsletter(draft.id!)}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
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
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Create Newsletter
          </button>
        </div>
      )}
    </div>
  );
}