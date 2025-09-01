import React from 'react';
import { Clock, Target, BookOpen, Users } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import type { QuickPlanData } from '../../hooks/useQuickPlan';

interface Props {
  planData: QuickPlanData;
  expectation?: any;
}

export function QuickPlanPreview({ planData, expectation }: Props): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Lesson Overview */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-3">Lesson Overview</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Title</p>
            <p className="font-medium">{planData.title}</p>
            <p className="text-sm text-gray-500 italic">{planData.titleFr}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {planData.duration} minutes
            </p>
          </div>
        </div>
        {planData.metadata && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <div className="flex items-center gap-4 text-xs text-indigo-700">
              <span>Generation Method: {planData.metadata.method}</span>
              {planData.metadata.templatePreference && (
                <span>Template: {planData.metadata.templatePreference}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Learning Goals */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Learning Goals
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-gray-700">{planData.learningGoals}</p>
          <p className="text-gray-600 italic text-sm">{planData.learningGoalsFr}</p>
        </div>
      </div>

      {/* Lesson Structure */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Lesson Structure</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium mb-1">Minds On (10 min)</h4>
            <p className="text-gray-700 text-sm">{planData.mindsOn}</p>
            <p className="text-gray-600 text-xs italic mt-1">{planData.mindsOnFr}</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium mb-1">Action (25 min)</h4>
            <p className="text-gray-700 text-sm">{planData.action}</p>
            <p className="text-gray-600 text-xs italic mt-1">{planData.actionFr}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium mb-1">Consolidation (10 min)</h4>
            <p className="text-gray-700 text-sm">{planData.consolidation}</p>
            <p className="text-gray-600 text-xs italic mt-1">{planData.consolidationFr}</p>
          </div>
        </div>
      </div>

      {/* Materials */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Materials Needed
        </h3>
        <div className="flex flex-wrap gap-2">
          {planData.materials.map((material, index) => (
            <Badge key={index} variant="outline">
              {material}
            </Badge>
          ))}
        </div>
      </div>

      {/* Assessment */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Assessment Strategy</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 text-sm">{planData.assessmentNotes}</p>
        </div>
      </div>

      {/* Differentiation */}
      <div>
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Differentiation Strategies
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">For Struggling Learners</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {planData.differentiationStrategies.forStruggling.map((strategy, index) => (
                <li key={index}>• {strategy}</li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">For Advanced Learners</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {planData.differentiationStrategies.forAdvanced.map((strategy, index) => (
                <li key={index}>• {strategy}</li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">For ELL Students</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {planData.differentiationStrategies.forELL.map((strategy, index) => (
                <li key={index}>• {strategy}</li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">For IEP Students</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {planData.differentiationStrategies.forIEP.map((strategy, index) => (
                <li key={index}>• {strategy}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Linked Expectation */}
      {expectation && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">Linked Curriculum Expectation</h4>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{expectation.code}</span> - {expectation.subject}
            </p>
            <p className="text-sm text-gray-600">{expectation.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}