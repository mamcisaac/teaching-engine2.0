/**
 * Coverage Page - Detailed curriculum coverage view
 * Shows uncovered expectations with drill-down and quick plan features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertCircle, 
  CheckCircle2, 
  Search,
  BookOpen,
  Calendar,
  Flag
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { apiClient } from '../api/core/client';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/Progress';
import { Switch } from '../components/ui/Switch';
// Tabs components imported but not used in current implementation

interface CurriculumExpectation {
  id: string;
  code: string;
  description: string;
  descriptionFr?: string | null;
  subject: string;
  grade: number;
  strand: string;
  substrand?: string | null;
  isCovered: boolean;
}

interface ExpectationsResponse {
  expectations: CurriculumExpectation[];
}

interface LessonModalProps {
  expectation: CurriculumExpectation;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
}

function LessonModal({ expectation, onClose, onSave }: LessonModalProps): React.ReactElement {
  const [title, setTitle] = useState(`Lesson for ${expectation.code}`);
  const [saving, setSaving] = useState(false);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await onSave(title);
      onClose();
    } catch (error) {
      console.error('Failed to save lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      data-testid="lesson-modal"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Create Lesson Plan</h2>
        
        <div data-testid="selected-expectations" className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Selected Expectation:</p>
          <div 
            data-testid={`expectation-chip-${expectation.code}`}
            className="locked inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
          >
            <span className="font-mono text-sm">{expectation.code}</span>
            <span className="text-xs">Locked</span>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="lesson-title-input" className="block text-sm font-medium mb-2">Lesson Title</label>
          <input
            id="lesson-title-input"
            data-testid="lesson-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Expectation Details</h3>
          <p className="text-sm text-gray-600">{expectation.description}</p>
          {expectation.descriptionFr && (
            <p className="text-sm text-gray-500 mt-2 italic">{expectation.descriptionFr}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            data-testid="save-lesson-button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
          >
            {saving ? 'Saving...' : 'Save Lesson'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CoveragePage(): React.ReactElement {
  const navigate = useNavigate();
  const { subject } = useParams<{ subject?: string }>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUncoveredOnly, setShowUncoveredOnly] = useState(true);
  const [selectedExpectation, setSelectedExpectation] = useState<CurriculumExpectation | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());

  // Fetch expectations
  const { data, isLoading, error } = useQuery({
    queryKey: ['curriculum-coverage', 'uncovered', subject, showUncoveredOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      params.append('showAll', (!showUncoveredOnly).toString());
      
      const response = await apiClient.get<ExpectationsResponse>(
        `/curriculum-coverage/uncovered?${params.toString()}`
      );
      return response.data;
    },
  });

  // Plan lesson mutation
  const planLessonMutation = useMutation({
    mutationFn: async ({ expectationId, title }: { expectationId: string; title: string }) => {
      const response = await apiClient.post('/curriculum-coverage/plan-lesson', {
        expectationId,
        title,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      void queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
    },
  });

  // Filter expectations based on search
  const filteredExpectations = useMemo(() => {
    if (!data?.expectations) return [];
    
    return data.expectations.filter(exp => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        exp.code.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        (exp.descriptionFr?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [data?.expectations, searchQuery]);

  // Calculate metrics
  const uncoveredCount = filteredExpectations.filter(exp => !exp.isCovered).length;
  const totalCount = filteredExpectations.length;
  const coveredCount = totalCount - uncoveredCount;
  const coveragePercentage = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;

  // Group by strand
  const byStrand = useMemo(() => {
    const grouped: Record<string, CurriculumExpectation[]> = {};
    filteredExpectations.forEach(exp => {
      const strand = exp.strand || 'Other';
      if (!grouped[strand]) grouped[strand] = [];
      grouped[strand].push(exp);
    });
    return grouped;
  }, [filteredExpectations]);

  const handlePlanLesson = (expectation: CurriculumExpectation): void => {
    setSelectedExpectation(expectation);
  };

  const handleSaveLesson = async (title: string): Promise<void> => {
    if (!selectedExpectation) return;
    
    await planLessonMutation.mutateAsync({
      expectationId: selectedExpectation.id,
      title,
    });
    
    setSelectedExpectation(null);
  };

  const handleBulkPlan = async (): Promise<void> => {
    if (selectedForBulk.size === 0) return;
    
    try {
      const response = await apiClient.post('/curriculum-coverage/bulk-plan-lessons', {
        expectationIds: Array.from(selectedForBulk),
        baseTitle: 'Coverage Lesson',
        duration: 45,
      });
      
      // Clear selection and refresh data
      setSelectedForBulk(new Set());
      void queryClient.invalidateQueries({ queryKey: ['curriculum-coverage'] });
      
      // Show success message (could add a toast notification here)
      console.log(response.data.message);
    } catch (error) {
      console.error('Failed to create bulk lessons:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Curriculum Coverage
            {subject && ` - ${subject}`}
          </h1>
          <p className="text-gray-600">
            Track and manage your curriculum expectations coverage
          </p>
        </div>

        {/* Overall Coverage Summary */}
        <Card className="mb-6" data-testid="coverage-loaded">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Coverage Summary</span>
              <div className="flex items-center gap-4">
                <Badge variant={coveragePercentage >= 80 ? 'default' : coveragePercentage >= 60 ? 'secondary' : 'destructive'}>
                  {coveragePercentage}% Complete
                </Badge>
                <span data-testid="uncovered-count" className="text-sm text-gray-600">
                  {uncoveredCount} uncovered
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={coveragePercentage} className="h-3 mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{coveredCount} expectations covered</span>
              <span>{totalCount} total expectations</span>
            </div>
          </CardContent>
        </Card>

        {/* Controls and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  data-testid="expectation-search"
                  type="text"
                  placeholder="Search by code or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Toggle uncovered only */}
              <div className="flex items-center gap-2">
                <label htmlFor="show-uncovered-toggle" className="text-sm font-medium">Show uncovered only</label>
                <div data-testid="show-uncovered-toggle">
                  <Switch
                    id="show-uncovered-toggle"
                    checked={showUncoveredOnly}
                    onChange={setShowUncoveredOnly}
                  />
                </div>
              </div>

              {/* Show all button */}
              {showUncoveredOnly && (
                <Button
                  data-testid="show-all-expectations"
                  variant="outline"
                  onClick={() => setShowUncoveredOnly(false)}
                >
                  Show All
                </Button>
              )}

              {/* View curriculum browser */}
              <Button
                data-testid="view-curriculum-browser"
                variant="outline"
                onClick={() => navigate(`/curriculum${showUncoveredOnly ? '?highlight=uncovered' : ''}`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Curriculum Browser
              </Button>
            </div>

            {/* Bulk actions */}
            {selectedForBulk.size > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <span data-testid="selected-expectations-count">
                  {selectedForBulk.size} expectations selected
                </span>
                <Button
                  data-testid="bulk-plan-lessons"
                  onClick={handleBulkPlan}
                >
                  Plan Lessons
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expectations List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {showUncoveredOnly ? 'Uncovered Expectations' : 'All Expectations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              data-testid="expectations-list"
              className="space-y-6"
            >
              {/* Virtual list container */}
              <div 
                data-testid="expectations-list-container"
                className="max-h-[600px] overflow-y-auto"
              >
                <div data-testid="virtualized-list">
                  {Object.entries(byStrand).map(([strand, expectations]) => (
                    <div key={strand} data-testid={`strand-${strand}`} className="mb-6">
                      <h3 className="font-semibold text-lg mb-3 sticky top-0 bg-white py-2">
                        {strand}
                        <span 
                          data-testid="strand-coverage"
                          className="ml-2 text-sm font-normal text-gray-600"
                        >
                          {expectations.filter(e => e.isCovered).length}/{expectations.length} covered
                        </span>
                      </h3>
                      
                      <div 
                        data-testid={showUncoveredOnly ? "uncovered-expectations" : "all-expectations"}
                        className="space-y-2"
                      >
                        {expectations.map((exp) => (
                          <div
                            key={exp.id}
                            data-testid={exp.isCovered ? "covered-expectation-row" : "uncovered-expectation-row"}
                            className={`
                              p-4 border rounded-lg transition-all
                              ${exp.isCovered 
                                ? 'covered bg-green-50 border-green-200' 
                                : 'uncovered attention bg-red-50 border-red-200 hover:shadow-md'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                {/* Checkbox for bulk selection */}
                                {!exp.isCovered && (
                                  <input
                                    data-testid="select-expectation-checkbox"
                                    type="checkbox"
                                    checked={selectedForBulk.has(exp.id)}
                                    onChange={(e) => {
                                      const newSet = new Set(selectedForBulk);
                                      if (e.target.checked) {
                                        newSet.add(exp.id);
                                      } else {
                                        newSet.delete(exp.id);
                                      }
                                      setSelectedForBulk(newSet);
                                    }}
                                    className="mt-1"
                                  />
                                )}

                                {/* Status icon */}
                                {exp.isCovered ? (
                                  <CheckCircle2 
                                    data-testid="covered-checkmark"
                                    className="h-5 w-5 text-green-600 mt-0.5"
                                  />
                                ) : (
                                  <Flag
                                    data-testid="uncovered-flag"
                                    className="h-5 w-5 text-red-600 mt-0.5"
                                  />
                                )}

                                {/* Content */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span 
                                      data-testid="expectation-code"
                                      className="font-mono text-sm font-semibold text-gray-700"
                                    >
                                      {exp.code}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {exp.subject}
                                    </Badge>
                                  </div>
                                  <p 
                                    data-testid="expectation-description"
                                    className="text-sm text-gray-700"
                                  >
                                    {exp.description}
                                  </p>
                                  {exp.descriptionFr && (
                                    <p className="text-sm text-gray-500 italic mt-1">
                                      {exp.descriptionFr}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Plan Lesson button */}
                              {!exp.isCovered && (
                                <Button
                                  data-testid="plan-lesson-button"
                                  size="sm"
                                  onClick={() => handlePlanLesson(exp)}
                                  className="ml-4"
                                >
                                  Plan Lesson
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School year progress */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="school-year-progress" className="space-y-4">
              <div className="flex justify-between items-center">
                <span data-testid="weeks-remaining" className="text-sm text-gray-600">
                  32 weeks remaining in school year
                </span>
                <span data-testid="coverage-pace-needed" className="text-sm font-medium">
                  Need to cover {Math.ceil(uncoveredCount / 32)} expectations per week
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low coverage alert */}
        {coveragePercentage < 70 && (
          <Alert 
            data-testid="low-coverage-alert"
            className="mt-6 border-yellow-200 bg-yellow-50"
          >
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              {uncoveredCount} expectations still need to be covered this year. 
              <Button
                data-testid="plan-uncovered-button"
                variant="outline"
                className="p-0 ml-2"
                onClick={() => setShowUncoveredOnly(true)}
              >
                Focus on uncovered
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Bulk planning wizard modal */}
        {selectedForBulk.size >= 3 && (
          <div 
            data-testid="bulk-planning-wizard"
            className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm"
          >
            <p className="font-medium mb-2">Ready to Plan</p>
            <p data-testid="selected-expectations-count" className="text-sm text-gray-600">
              {selectedForBulk.size} expectations selected
            </p>
            <Button 
              size="sm" 
              className="mt-2 w-full"
              onClick={handleBulkPlan}
            >
              Start Planning Wizard
            </Button>
          </div>
        )}
      </div>

      {/* Lesson Planning Modal */}
      {selectedExpectation && (
        <LessonModal
          expectation={selectedExpectation}
          onClose={() => setSelectedExpectation(null)}
          onSave={handleSaveLesson}
        />
      )}
    </div>
  );
}