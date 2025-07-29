import React from 'react';

import { Badge } from '../../../components/ui/Badge';

interface Expectation {
  id: string;
  code: string;
  description: string;
  strand: string;
}

interface LessonExpectation {
  expectation: Expectation;
}

interface CurriculumExpectationsDisplayProps {
  expectations?: LessonExpectation[];
}

export function CurriculumExpectationsDisplay({ 
  expectations 
}: CurriculumExpectationsDisplayProps): React.ReactElement | null {
  if (!expectations || expectations.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Curriculum Expectations
      </h3>
      <div className="space-y-2">
        {expectations.map(({ expectation }) => (
          <div key={expectation.id} className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-sm">{expectation.code}</span>
                <p className="text-sm text-gray-700 mt-1">{expectation.description}</p>
              </div>
              <Badge className="ml-2" variant="outline">
                {expectation.strand}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}