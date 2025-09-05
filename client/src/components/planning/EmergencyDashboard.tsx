/**
 * EmergencyDashboard Component
 * PANIC-FIRST UI for teachers in crisis
 */

import { 
  AlertTriangle, 
  Search, 
  Clock, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { 
  findLessonPanicking, 
  getPanicCoverageGaps, 
  generateSupplyPlan 
} from '../../utils/planningCascade';
import type { LessonPlan } from '../../types/planningCascade';

interface EmergencyDashboardProps {
  lessons?: LessonPlan[];
  onLessonStatusChange?: (lessonId: string, status: 'taught' | 'skipped') => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  lessons = [],
  onLessonStatusChange
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSupplyPlan, setShowSupplyPlan] = useState(false);
  const [supplyPlan, setSupplyPlan] = useState('');
  const [searchTime, setSearchTime] = useState(0);

  // Get panic coverage gaps
  const reportCardDue = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
  const coverageGaps = getPanicCoverageGaps(reportCardDue, lessons);

  // Search handler with timing
  const handleSearch = useCallback((term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const startTime = performance.now();
    
    // Perform search
    const results = findLessonPanicking(term, lessons);
    
    const endTime = performance.now();
    setSearchTime(Math.round(endTime - startTime));
    setSearchResults(results);
    setIsSearching(false);
  }, [lessons]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  // Generate supply plan
  const handleGenerateSupplyPlan = () => {
    const plan = generateSupplyPlan('tomorrow', lessons);
    setSupplyPlan(plan);
    setShowSupplyPlan(true);
  };

  // Count overdue lessons
  const overdueLessons = lessons.filter(l => {
    const lessonDate = new Date(l.date);
    lessonDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return lessonDate < today && l.status === 'planned';
  });

  const hasUrgentItems = overdueLessons.length > 0 || coverageGaps.mustTeachToday.length > 0;

  return (
    <div className="emergency-dashboard space-y-4">
      {/* GIANT SEARCH BAR - Can't miss it! */}
      <div className="bg-white border-4 border-blue-500 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Search className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Lesson Finder</h2>
          {searchTime > 0 && (
            <span className="text-sm text-gray-500">
              Found in {searchTime}ms
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="Type anything you remember: butterfly, counting, France, shapes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xl p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          autoFocus
        />
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                className={`p-4 rounded-lg border-2 ${
                  result.didIAlreadyTeachIt 
                    ? 'bg-green-50 border-green-300' 
                    : result.whenIsProbablyScheduled.includes('OVERDUE')
                    ? 'bg-red-50 border-red-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{result.name}</h3>
                    <p className="text-gray-600">
                      Unit: {result.whatUnitIsItIn} | {result.subject}
                    </p>
                    <p className={`font-medium ${
                      result.whenIsProbablyScheduled.includes('OVERDUE') 
                        ? 'text-red-600' 
                        : result.whenIsProbablyScheduled.includes('TODAY')
                        ? 'text-orange-600'
                        : 'text-blue-600'
                    }`}>
                      📅 {result.whenIsProbablyScheduled}
                    </p>
                    {result.activities && (
                      <p className="text-sm text-gray-500 mt-1">
                        Activities: {result.activities.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {result.didIAlreadyTeachIt ? (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Taught
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onLessonStatusChange?.(result.id, 'taught')}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                        >
                          Mark Taught
                        </button>
                        <button
                          onClick={() => onLessonStatusChange?.(result.id, 'skipped')}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isSearching && (
          <div className="mt-4 text-center text-gray-500">
            Searching...
          </div>
        )}
        
        {searchTerm && !isSearching && searchResults.length === 0 && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-600">No lessons found matching "{searchTerm}"</p>
            <p className="text-sm text-gray-500 mt-1">Try different keywords or check your spelling</p>
          </div>
        )}
      </div>

      {/* PANIC ALERTS - Big and red! */}
      {hasUrgentItems && (
        <div className="bg-red-600 text-white rounded-lg p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-10 h-10" />
            <h2 className="text-3xl font-bold">⚠️ URGENT ATTENTION REQUIRED</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overdue Lessons */}
            {overdueLessons.length > 0 && (
              <div className="bg-red-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  {overdueLessons.length} Overdue Lessons
                </h3>
                <ul className="space-y-2">
                  {overdueLessons.slice(0, 3).map(lesson => (
                    <li key={lesson.id} className="flex items-center justify-between">
                      <span>{lesson.name}</span>
                      <button
                        onClick={() => onLessonStatusChange?.(lesson.id, 'taught')}
                        className="px-2 py-1 bg-white text-red-600 rounded text-sm hover:bg-gray-100"
                      >
                        Mark Done
                      </button>
                    </li>
                  ))}
                  {overdueLessons.length > 3 && (
                    <li className="text-red-200">
                      ...and {overdueLessons.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Report Card Gaps */}
            {coverageGaps.mustTeachToday.length > 0 && (
              <div className="bg-red-700 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Must Teach Before Report Cards!
                </h3>
                <ul className="space-y-2">
                  {coverageGaps.mustTeachToday.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {coverageGaps.parentWillNotice.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-600">
                    <p className="font-bold text-yellow-300">⚠️ Parents will notice:</p>
                    <ul className="text-sm mt-1">
                      {coverageGaps.parentWillNotice.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setSearchTerm(coverageGaps.mustTeachToday[0]?.split(' ')[0] || 'counting')}
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100"
            >
              Find Critical Lessons
            </button>
            <button
              onClick={handleGenerateSupplyPlan}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600"
            >
              Generate Supply Plan NOW
            </button>
          </div>
        </div>
      )}

      {/* Coverage Status - Simple checkboxes */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Quick Coverage Check
        </h3>
        
        {coverageGaps.canFudgeOnReportCard.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
            <p className="font-medium text-yellow-800 mb-2">Can mark as "Emerging":</p>
            <ul className="text-sm text-yellow-700">
              {coverageGaps.canFudgeOnReportCard.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Simple taught/not taught list */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ Recently Taught</h4>
            <ul className="space-y-1">
              {lessons
                .filter(l => l.status === 'taught')
                .slice(0, 5)
                .map(lesson => (
                  <li key={lesson.id} className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {lesson.name}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-red-600 mb-2">❌ Coming Up (Not Taught)</h4>
            <ul className="space-y-1">
              {lessons
                .filter(l => l.status === 'planned')
                .slice(0, 5)
                .map(lesson => (
                  <li key={lesson.id} className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      {lesson.name}
                    </span>
                    <button
                      onClick={() => onLessonStatusChange?.(lesson.id, 'taught')}
                      className="text-xs px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Done
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Supply Plan Modal */}
      {showSupplyPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Supply Teacher Plan</h2>
                <button
                  onClick={() => setShowSupplyPlan(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
                {supplyPlan}
              </pre>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(supplyPlan)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowSupplyPlan(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};