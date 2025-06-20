import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { useToast } from './ui/use-toast';

interface SmartMaterial {
  name: string;
  category: 'supplies' | 'technology' | 'books' | 'equipment' | 'printables' | 'other';
  priority: 'essential' | 'helpful' | 'optional';
  quantity?: string;
  notes?: string;
  prepTime?: number;
}

interface WeeklyMaterialPlan {
  weekStart: string;
  totalPrepTime: number;
  materials: SmartMaterial[];
  preparation: {
    printingNeeded: SmartMaterial[];
    setupRequired: SmartMaterial[];
    purchaseNeeded: SmartMaterial[];
  };
  byDay: Array<{
    day: number;
    dayName: string;
    activities: Array<{
      activityId: number;
      title: string;
      timeSlot: string;
      materials: SmartMaterial[];
    }>;
  }>;
}

interface SmartMaterialsChecklistProps {
  weekStart: string;
}

const CATEGORY_ICONS = {
  supplies: '📝',
  technology: '💻',
  books: '📚',
  equipment: '🔧',
  printables: '🖨️',
  other: '📦',
};

const PRIORITY_COLORS = {
  essential: 'text-red-600 bg-red-50 border-red-200',
  helpful: 'text-blue-600 bg-blue-50 border-blue-200',
  optional: 'text-gray-600 bg-gray-50 border-gray-200',
};

export function SmartMaterialsChecklist({ weekStart }: SmartMaterialsChecklistProps) {
  const [materialPlan, setMaterialPlan] = useState<WeeklyMaterialPlan | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'summary' | 'by-day' | 'by-category'>('summary');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterialPlan();
  }, [weekStart]);

  const fetchMaterialPlan = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/material-lists/${weekStart}/smart-plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch material plan');
      }

      const plan = await response.json();
      setMaterialPlan(plan);
    } catch (error) {
      console.error('Error fetching material plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to load material plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/material-lists/${weekStart}/auto-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update materials');
      }

      toast({
        title: 'Materials Updated',
        description: 'Material list has been automatically updated with AI extraction',
      });

      // Refresh the plan
      await fetchMaterialPlan();
    } catch (error) {
      console.error('Error updating materials:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update material list',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleItem = (itemKey: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }));
  };

  const formatPrepTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getCompletionProgress = () => {
    if (!materialPlan) return { completed: 0, total: 0, percentage: 0 };
    
    const total = materialPlan.materials.length;
    const completed = materialPlan.materials.filter(
      (_, index) => checkedItems[`material-${index}`]
    ).length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!materialPlan || materialPlan.materials.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No materials needed</h3>
        <p className="text-gray-600">
          No materials have been identified for this week's activities.
        </p>
        <Button
          onClick={handleAutoUpdate}
          disabled={isUpdating}
          className="mt-4"
          variant="outline"
        >
          {isUpdating ? 'Scanning...' : 'Scan for Materials'}
        </Button>
      </div>
    );
  }

  const progress = getCompletionProgress();

  const renderSummaryView = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-blue-900">Preparation Overview</h3>
          <span className="text-sm text-blue-700">
            {progress.completed}/{progress.total} items ready
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center">
            <div className="font-medium text-blue-900">{formatPrepTime(materialPlan.totalPrepTime)}</div>
            <div className="text-blue-700">Total prep time</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-900">{materialPlan.preparation.printingNeeded.length}</div>
            <div className="text-blue-700">Need printing</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-900">{materialPlan.preparation.setupRequired.length}</div>
            <div className="text-blue-700">Need setup</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-900">{materialPlan.preparation.purchaseNeeded.length}</div>
            <div className="text-blue-700">Need purchase</div>
          </div>
        </div>
      </div>

      {/* Critical Actions */}
      {(materialPlan.preparation.printingNeeded.length > 0 || 
        materialPlan.preparation.setupRequired.length > 0 || 
        materialPlan.preparation.purchaseNeeded.length > 0) && (
        <div className="space-y-4">
          {materialPlan.preparation.purchaseNeeded.length > 0 && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-900 mb-2 flex items-center">
                🛒 Need to Purchase ({materialPlan.preparation.purchaseNeeded.length})
              </h4>
              <ul className="space-y-1">
                {materialPlan.preparation.purchaseNeeded.map((item, index) => (
                  <li key={index} className="text-sm text-red-800">
                    • {item.name} {item.quantity && `(${item.quantity})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {materialPlan.preparation.printingNeeded.length > 0 && (
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h4 className="font-medium text-orange-900 mb-2 flex items-center">
                🖨️ Need to Print ({materialPlan.preparation.printingNeeded.length})
              </h4>
              <ul className="space-y-1">
                {materialPlan.preparation.printingNeeded.map((item, index) => (
                  <li key={index} className="text-sm text-orange-800">
                    • {item.name} {item.quantity && `(${item.quantity})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {materialPlan.preparation.setupRequired.length > 0 && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                ⚙️ Need Setup ({materialPlan.preparation.setupRequired.length})
              </h4>
              <ul className="space-y-1">
                {materialPlan.preparation.setupRequired.map((item, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {item.name} {item.prepTime && `(${item.prepTime}m setup)`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* All Materials Checklist */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">All Materials Checklist</h4>
        {materialPlan.materials.map((material, index) => {
          const itemKey = `material-${index}`;
          const isChecked = checkedItems[itemKey];
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                isChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleItem(itemKey)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{CATEGORY_ICONS[material.category]}</span>
                  <div>
                    <div className={`text-sm font-medium ${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {material.name}
                    </div>
                    {material.quantity && (
                      <div className="text-xs text-gray-500">{material.quantity}</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {material.prepTime && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {material.prepTime}m
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded border ${PRIORITY_COLORS[material.priority]}`}>
                  {material.priority}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderByDayView = () => (
    <div className="space-y-6">
      {materialPlan.byDay.map((day) => (
        <div key={day.day} className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">{day.dayName}</h4>
          {day.activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No materials needed</p>
          ) : (
            <div className="space-y-3">
              {day.activities.map((activity) => (
                <div key={activity.activityId} className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900 text-sm">{activity.title}</h5>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {activity.timeSlot}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {activity.materials.map((material, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <span>{CATEGORY_ICONS[material.category]}</span>
                        <span>{material.name}</span>
                        {material.quantity && (
                          <span className="text-gray-500">({material.quantity})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderByCategoryView = () => {
    const materialsByCategory = materialPlan.materials.reduce((acc, material) => {
      if (!acc[material.category]) {
        acc[material.category] = [];
      }
      acc[material.category].push(material);
      return acc;
    }, {} as Record<string, SmartMaterial[]>);

    return (
      <div className="space-y-6">
        {Object.entries(materialsByCategory).map(([category, materials]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2 text-lg">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)} ({materials.length})
            </h4>
            <div className="grid gap-2">
              {materials.map((material, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{material.name}</div>
                    {material.quantity && (
                      <div className="text-xs text-gray-500">{material.quantity}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {material.prepTime && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {material.prepTime}m
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded border ${PRIORITY_COLORS[material.priority]}`}>
                      {material.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Materials</h2>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleAutoUpdate}
              disabled={isUpdating}
              variant="outline"
              size="sm"
            >
              {isUpdating ? 'Updating...' : 'Auto-Update'}
            </Button>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="mt-4 flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['summary', 'by-day', 'by-category'] as const).map((viewOption) => (
            <button
              key={viewOption}
              onClick={() => setView(viewOption)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                view === viewOption
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {viewOption === 'by-day' ? 'By Day' : 
               viewOption === 'by-category' ? 'By Category' : 'Summary'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {view === 'summary' && renderSummaryView()}
        {view === 'by-day' && renderByDayView()}
        {view === 'by-category' && renderByCategoryView()}
      </div>
    </div>
  );
}