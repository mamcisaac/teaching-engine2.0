import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  ChevronRight,
  Clock,
  BookOpen,
  CheckSquare,
  Square,
  Search,
  Download,
  Sparkles,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '../api/core/client';
import { cn } from '../utils/cn';

interface UncoveredExpectation {
  id: string;
  code: string;
  description: string;
  descriptionFr?: string;
  subject: string;
  grade: number;
  strand: string;
  substrand?: string;
  priority: 'high' | 'medium' | 'low';
  suggestedDuration: number;
  suggestedActivities: string[];
}

interface Props {
  subject?: string;
  limit?: number;
  onQuickPlan?: (expectationId: string) => void;
}

export function UncoveredExpectationsList({ 
  subject: initialSubject, 
  limit = 50,
  onQuickPlan 
}: Props): React.ReactElement {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStrand, setSelectedStrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExpectations, setSelectedExpectations] = useState<Set<string>>(new Set());
  const [showActivities, setShowActivities] = useState<string | null>(null);

  // Fetch uncovered expectations
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['uncovered-expectations', selectedSubject, selectedPriority, selectedStrand, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (selectedPriority !== 'all') params.append('priorityFilter', selectedPriority);
      params.append('grade', '1');
      params.append('limit', limit.toString());
      
      const response = await apiClient.get(`/api/curriculum-coverage/uncovered?${params.toString()}`);
      return response.data.data;
    },
  });

  // Generate quick plan mutation
  const generateQuickPlan = useMutation({
    mutationFn: async (expectationId: string) => {
      const response = await apiClient.post('/api/curriculum-coverage/quick-plan', {
        expectationId,
      });
      return response.data.data;
    },
    onSuccess: (data, expectationId) => {
      // Navigate to quick lesson page with pre-filled data
      const params = new URLSearchParams({
        expectationId,
        prefilled: 'true',
      });
      navigate(`/planner/quick-lesson?${params.toString()}`, {
        state: { quickPlanData: data }
      });
      toast.success('Quick plan generated! Redirecting to lesson planner...');
    },
    onError: () => {
      toast.error('Failed to generate quick plan. Please try again.');
    },
  });

  // Filter expectations based on search
  const filteredExpectations = useMemo(() => {
    if (!data?.expectations) return [];
    
    let filtered = data.expectations;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((exp: UncoveredExpectation) =>
        exp.code.toLowerCase().includes(query) ||
        exp.description.toLowerCase().includes(query) ||
        exp.descriptionFr?.toLowerCase().includes(query) ||
        exp.strand.toLowerCase().includes(query)
      );
    }

    if (selectedStrand !== 'all') {
      filtered = filtered.filter((exp: UncoveredExpectation) => exp.strand === selectedStrand);
    }

    return filtered;
  }, [data?.expectations, searchQuery, selectedStrand]);

  // Get unique strands for filtering
  const uniqueStrands = useMemo((): string[] => {
    if (!data?.expectations) return [];
    const strands = new Set<string>(data.expectations.map((exp: UncoveredExpectation) => exp.strand));
    return Array.from(strands).sort();
  }, [data?.expectations]);

  // Handle selection
  const toggleSelection = (id: string): void => {
    const newSelection = new Set(selectedExpectations);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedExpectations(newSelection);
  };

  const toggleSelectAll = (): void => {
    if (selectedExpectations.size === filteredExpectations.length) {
      setSelectedExpectations(new Set());
    } else {
      setSelectedExpectations(new Set(filteredExpectations.map((exp: UncoveredExpectation) => exp.id)));
    }
  };

  // Handle bulk quick plan
  const handleBulkQuickPlan = (): void => {
    if (selectedExpectations.size === 0) {
      toast.error('Please select at least one expectation');
      return;
    }
    
    // For now, just handle the first one
    // In a real implementation, you might create a unit plan or multiple lessons
    const firstId = Array.from(selectedExpectations)[0];
    generateQuickPlan.mutate(firstId);
  };

  // Handle individual quick plan
  const handleQuickPlan = (expectationId: string): void => {
    if (onQuickPlan) {
      onQuickPlan(expectationId);
    } else {
      generateQuickPlan.mutate(expectationId);
    }
  };

  // Export selected expectations
  const handleExport = (): void => {
    const toExport = selectedExpectations.size > 0
      ? filteredExpectations.filter((exp: UncoveredExpectation) => selectedExpectations.has(exp.id))
      : filteredExpectations;

    const csvContent = [
      ['Code', 'Subject', 'Strand', 'Priority', 'Description', 'Description (FR)'],
      ...toExport.map((exp: UncoveredExpectation) => [
        exp.code,
        exp.subject,
        exp.strand,
        exp.priority,
        exp.description,
        exp.descriptionFr || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uncovered-expectations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Expectations exported successfully');
  };

  const getPriorityBadgeVariant = (priority: 'high' | 'medium' | 'low'): 'default' | 'secondary' | 'destructive' => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                Uncovered Curriculum Expectations
              </CardTitle>
              <CardDescription className="mt-2">
                {data?.total || 0} expectations need coverage in your lesson plans
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              {selectedExpectations.size > 0 && (
                <button
                  onClick={handleBulkQuickPlan}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Quick Plan ({selectedExpectations.size})
                </button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              <option value="Français (Immersion)">Français</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Sciences de la nature">Sciences</option>
              <option value="Sciences humaines">Social Studies</option>
              <option value="Arts visuels">Arts</option>
              <option value="Formation personnelle et sociale">FPS</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Strand Filter */}
            {uniqueStrands.length > 0 && (
              <select
                value={selectedStrand}
                onChange={(e) => setSelectedStrand(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Strands</option>
                {uniqueStrands.map((strand: string) => (
                  <option key={strand} value={strand}>{strand}</option>
                ))}
              </select>
            )}

            {/* Select All */}
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedExpectations.size === filteredExpectations.length ? (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="h-4 w-4" />
                  Select All
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Expectations List */}
      <div className="space-y-4">
        {filteredExpectations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No uncovered expectations found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpectations.map((exp: UncoveredExpectation) => (
            <Card 
              key={exp.id} 
              className={cn(
                "transition-all",
                selectedExpectations.has(exp.id) && "ring-2 ring-indigo-500"
              )}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleSelection(exp.id)}
                    className="mt-1"
                  >
                    {selectedExpectations.has(exp.id) ? (
                      <CheckSquare className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityBadgeVariant(exp.priority)}>
                            {exp.priority} priority
                          </Badge>
                          <Badge variant="outline">{exp.subject}</Badge>
                          <Badge variant="outline">{exp.strand}</Badge>
                          {exp.substrand && (
                            <Badge variant="outline">{exp.substrand}</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-lg">{exp.code}</h4>
                      </div>
                      <button
                        onClick={() => handleQuickPlan(exp.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
                      >
                        Quick Plan
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <p className="text-gray-700">{exp.description}</p>
                      {exp.descriptionFr && (
                        <p className="text-gray-600 italic text-sm">{exp.descriptionFr}</p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exp.suggestedDuration} min suggested
                      </span>
                      <button
                        onClick={() => setShowActivities(showActivities === exp.id ? null : exp.id)}
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        {exp.suggestedActivities.length} suggested activities
                      </button>
                    </div>

                    {/* Suggested Activities (expandable) */}
                    {showActivities === exp.id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h5 className="font-medium text-sm mb-2">Suggested Activities:</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {exp.suggestedActivities.map((activity, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {data?.hasMore && (
        <div className="text-center py-6">
          <button
            onClick={() => refetch()}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Load More Expectations
          </button>
        </div>
      )}
    </div>
  );
}