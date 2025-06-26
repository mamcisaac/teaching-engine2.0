import React from 'react';
import { Link } from 'react-router-dom';
import FormsDataAgent from '../components/forms/FormsDataAgent';
import {
  useLongRangePlans,
  useUnitPlans,
  useCreateUnitPlan,
  useCreateETFOLessonPlan,
} from '../hooks/useETFOPlanning';
import { UnitPlanFormData } from '../components/forms/UnitPlanForm';
import { LessonPlanFormData } from '../components/forms/LessonPlanForm';

export default function FormsDataAgentPage() {
  // Fetch data for dropdowns and validation
  const { data: longRangePlans = [] } = useLongRangePlans();
  const { data: unitPlans = [] } = useUnitPlans({});

  // Mutations for batch operations
  const createUnit = useCreateUnitPlan();
  const createLesson = useCreateETFOLessonPlan();

  // Batch creation handlers
  const handleBatchUnitCreate = async (units: UnitPlanFormData[]) => {
    const results = await Promise.allSettled(
      units.map(unit => createUnit.mutateAsync(unit))
    );
    
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some unit creations failed:', failures);
      throw new Error(`${failures.length} unit(s) failed to create`);
    }
  };

  const handleBatchLessonCreate = async (lessons: LessonPlanFormData[]) => {
    const results = await Promise.allSettled(
      lessons.map(lesson => createLesson.mutateAsync(lesson))
    );
    
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some lesson creations failed:', failures);
      throw new Error(`${failures.length} lesson(s) failed to create`);
    }
  };

  // Template export handler
  const handleTemplateExport = (type: 'unit' | 'lesson', template: unknown) => {
    const filename = `${type}-plan-template.json`;
    const data = JSON.stringify([template], null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  // Data import handler
  const handleDataImport = (type: 'unit' | 'lesson', data: unknown[]) => {
    // This would typically trigger batch processing
    // TODO: Implement actual data import functionality
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/planner" className="hover:text-indigo-600">
              Planning Tools
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Forms & Data Agent</span>
          </div>
        </div>
      </div>

      <FormsDataAgent
        longRangePlans={longRangePlans}
        unitPlans={unitPlans}
        onBatchUnitCreate={handleBatchUnitCreate}
        onBatchLessonCreate={handleBatchLessonCreate}
        onTemplateExport={handleTemplateExport}
        onDataImport={handleDataImport}
      />
    </div>
  );
}