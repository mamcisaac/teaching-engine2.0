import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { startOfWeek, endOfWeek } from 'date-fns';

import NewsletterRecipientSelector from '../components/StudentSelector';
import DateRangeSelector from '../components/DateRangeSelector';
import NewsletterEditor from '../components/NewsletterEditor';
import { 
  useStudents, 
  useGenerateNewsletter, 
  useSaveNewsletterDraft,
  useNewsletterDrafts,
  useNewsletter,
  useSendNewsletter,
  useDeleteNewsletter,
  useRegenerateNewsletter 
} from '../hooks/useNewsletterData';
import { 
  NewsletterDraft, 
  NewsletterTone, 
  NewsletterSection,
  NewsletterGenerationParams 
} from '../types/newsletter';
import { cn } from '../lib/utils';

export default function ParentNewsletterPage() {
  const { id: newsletterId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  // State for new newsletter creation
  const [showNewNewsletterForm, setShowNewNewsletterForm] = useState(!newsletterId);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDate, setEndDate] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [tone, setTone] = useState<NewsletterTone>('friendly');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [newFocusArea, setNewFocusArea] = useState('');
  
  // Advanced options
  const [includeArtifacts, setIncludeArtifacts] = useState(true);
  const [includeReflections, setIncludeReflections] = useState(true);
  const [includeLearningGoals, setIncludeLearningGoals] = useState(true);
  const [includeUpcomingEvents, setIncludeUpcomingEvents] = useState(false);
  
  // Current newsletter state
  const [currentDraft, setCurrentDraft] = useState<NewsletterDraft | null>(null);

  // Hooks
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: drafts = [], isLoading: draftsLoading } = useNewsletterDrafts();
  const { data: newsletter, isLoading: newsletterLoading } = useNewsletter(newsletterId);
  
  const generateNewsletter = useGenerateNewsletter();
  const regenerateNewsletter = useRegenerateNewsletter();
  const saveNewsletter = useSaveNewsletterDraft();
  const sendNewsletter = useSendNewsletter();
  const deleteNewsletter = useDeleteNewsletter();

  // Load existing newsletter if editing
  useEffect(() => {
    if (newsletter) {
      setCurrentDraft(newsletter);
      setShowNewNewsletterForm(false);
    }
  }, [newsletter]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const addFocusArea = () => {
    if (newFocusArea.trim() && !focusAreas.includes(newFocusArea.trim())) {
      setFocusAreas([...focusAreas, newFocusArea.trim()]);
      setNewFocusArea('');
    }
  };

  const removeFocusArea = (area: string) => {
    setFocusAreas(focusAreas.filter(a => a !== area));
  };

  const handleGenerateNewsletter = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one newsletter recipient');
      return;
    }

    const params: NewsletterGenerationParams = {
      studentIds: selectedStudentIds,
      from: startDate,
      to: endDate,
      tone,
      focusAreas,
      includeArtifacts,
      includeReflections,
      includeLearningGoals,
      includeUpcomingEvents,
    };

    try {
      const generated = await generateNewsletter.mutateAsync(params);
      
      // Create a new draft with generated content
      const newDraft: NewsletterDraft = {
        title: `Parent Newsletter - ${startDate.toLocaleDateString()}`,
        titleFr: `Bulletin aux parents - ${startDate.toLocaleDateString()}`,
        studentIds: selectedStudentIds,
        dateFrom: startDate,
        dateTo: endDate,
        tone,
        sections: generated.sections,
        isDraft: true,
      };

      setCurrentDraft(newDraft);
      setShowNewNewsletterForm(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleSaveNewsletter = async (draft: NewsletterDraft) => {
    try {
      const saved = await saveNewsletter.mutateAsync(draft);
      setCurrentDraft(saved);
      
      // Update URL if this is a new newsletter
      if (!newsletterId && saved.id) {
        navigate(`/newsletters/${saved.id}`, { replace: true });
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleSendNewsletter = async (draft: NewsletterDraft) => {
    if (!draft.id) {
      toast.error('Please save the newsletter first');
      return;
    }

    try {
      await sendNewsletter.mutateAsync({ newsletterId: draft.id });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRegenerateNewsletter = async (newTone?: NewsletterTone) => {
    if (!currentDraft) return;

    try {
      const regenerated = await regenerateNewsletter.mutateAsync({
        draft: currentDraft,
        tone: newTone,
      });

      setCurrentDraft({
        ...currentDraft,
        sections: regenerated.sections,
        tone: newTone || currentDraft.tone,
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await deleteNewsletter.mutateAsync(draftId);
      if (newsletterId === draftId) {
        navigate('/newsletters');
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const toneOptions: { value: NewsletterTone; label: string; description: string }[] = [
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' },
    { value: 'formal', label: 'Formal', description: 'Professional and structured tone' },
    { value: 'informative', label: 'Informative', description: 'Clear and factual tone' },
  ];

  if (showNewNewsletterForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-indigo-900 mb-2">📝 Newsletter Planning Tool</h2>
            <p className="text-indigo-800">
              This tool helps you plan and draft newsletter content. Use your school&apos;s communication system (email, app, or platform) for actual distribution to parents.
            </p>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plan Parent Newsletter</h1>
          <p className="text-gray-600">
            Create a draft newsletter template based on curriculum activities and learning goals.
          </p>
        </div>

        <div className="space-y-8">
          {/* Student Selection */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Newsletter Recipients
            </h2>
            <NewsletterRecipientSelector
              recipients={students}
              selectedRecipientIds={selectedStudentIds}
              onChange={setSelectedStudentIds}
              isLoading={studentsLoading}
              helpText="Select recipient profiles for newsletter planning. This helps you draft appropriate content for your parent communication."
            />
          </div>

          {/* Date Range */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Range
            </h2>
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Newsletter Settings */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Newsletter Settings</h2>
            
            {/* Tone Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tone of Communication
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {toneOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={cn(
                      "p-4 text-left border rounded-lg transition-colors",
                      tone === option.value
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Areas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Areas (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFocusArea}
                  onChange={(e) => setNewFocusArea(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFocusArea()}
                  placeholder="Add a focus area (e.g., Reading, Math, Behavior)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addFocusArea}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map(area => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {area}
                      <button
                        onClick={() => removeFocusArea(area)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include in Newsletter
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeArtifacts}
                    onChange={(e) => setIncludeArtifacts(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Student artifacts and work samples</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeReflections}
                    onChange={(e) => setIncludeReflections(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Student reflections and self-assessments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeLearningGoals}
                    onChange={(e) => setIncludeLearningGoals(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Current learning goals and objectives</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeUpcomingEvents}
                    onChange={(e) => setIncludeUpcomingEvents(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Upcoming events and important dates</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/newsletters')}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateNewsletter}
              disabled={generateNewsletter.isPending || selectedStudentIds.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {generateNewsletter.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate Newsletter
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show existing newsletter editor
  if (currentDraft) {
    return (
      <div className="p-6">
        <NewsletterEditor
          draft={currentDraft}
          isGenerating={generateNewsletter.isPending || regenerateNewsletter.isPending}
          onSave={handleSaveNewsletter}
          onSend={handleSendNewsletter}
          onRegenerate={handleRegenerateNewsletter}
        />
      </div>
    );
  }

  // Show drafts list (default view)
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Newsletters</h1>
          <p className="text-gray-600">
            Create and manage newsletters to communicate student progress with parents.
          </p>
        </div>
        <button
          onClick={() => setShowNewNewsletterForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Newsletter
        </button>
      </div>

      {/* Drafts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {draftsLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading newsletters...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletters yet</h3>
            <p className="text-gray-500 mb-4">Create your first parent newsletter to get started.</p>
            <button
              onClick={() => setShowNewNewsletterForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Newsletter
            </button>
          </div>
        ) : (
          drafts.map(draft => (
            <div key={draft.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {draft.title}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/newsletters/${draft.id}`)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => draft.id && handleDeleteDraft(draft.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{draft.studentIds.length} recipients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {draft.dateFrom.toLocaleDateString()} - {draft.dateTo.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className={cn(
                    "inline-block px-2 py-1 rounded-full text-xs font-medium",
                    draft.isDraft 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-green-100 text-green-800"
                  )}>
                    {draft.isDraft ? 'Draft' : 'Sent'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {draft.tone} tone
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/newsletters/${draft.id}`)}
                  className="w-full py-2 text-blue-600 hover:bg-blue-50 rounded font-medium transition-colors"
                >
                  {draft.isDraft ? 'Continue Editing' : 'View Newsletter'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}