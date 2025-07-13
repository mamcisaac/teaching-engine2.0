import {
  Database,
  FileUp,
  // FileDown,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Copy,
  // Upload,
  Download,
  ListPlus,
  Wand2,
} from 'lucide-react';
import React, { useState } from 'react';

import type { LongRangePlan, UnitPlan } from '../../hooks/useETFOPlanning';
import { validateUnitPlan, validateLessonPlan } from '../../utils/formValidation';
import logger from '../../utils/logger';
import { safeJsonParse } from "../../utils/typeGuards";
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// import { Textarea } from '../ui/Textarea';
import type { LessonPlanFormData } from './LessonPlanForm';
import LessonPlanForm from './LessonPlanForm';
import type { UnitPlanFormData } from './UnitPlanForm';
import UnitPlanForm from './UnitPlanForm';

interface BatchOperation {
  id: string;
  type: 'unit' | 'lesson';
  status: 'pending' | 'processing' | 'completed' | 'error';
  data: UnitPlanFormData | LessonPlanFormData;
  errors?: string[];
  progress?: number;
}

interface FormsDataAgentProps {
  longRangePlans?: LongRangePlan[];
  unitPlans?: UnitPlan[];
  onBatchUnitCreate?: (units: UnitPlanFormData[]) => Promise<void>;
  onBatchLessonCreate?: (lessons: LessonPlanFormData[]) => Promise<void>;
  onTemplateExport?: (
    type: 'unit' | 'lesson',
    template: UnitPlanFormData | LessonPlanFormData,
  ) => void;
  onDataImport?: (type: 'unit' | 'lesson', data: (UnitPlanFormData | LessonPlanFormData)[]) => void;
}

export default function FormsDataAgent({
  longRangePlans = [],
  unitPlans = [],
  onBatchUnitCreate,
  onBatchLessonCreate,
  onTemplateExport,
  onDataImport,
}: FormsDataAgentProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'batch' | 'templates' | 'import' | 'wizard'>('batch');
  const [batchOperations, setBatchOperations] = useState<BatchOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [_selectedTemplate, _setSelectedTemplate] = useState<'unit' | 'lesson' | null>(null);

  // Batch operations management
  const addBatchOperation = (
    type: 'unit' | 'lesson',
    data: UnitPlanFormData | LessonPlanFormData,
  ): void => {
    const operation: BatchOperation = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      data,
      progress: 0,
    };

    setBatchOperations((prev) => [...prev, operation]);
  };

  const removeBatchOperation = (id: string): void => {
    setBatchOperations((prev) => prev.filter((op) => op.id !== id));
  };

  const clearAllOperations = (): void => {
    setBatchOperations([]);
  };

  const validateBatchOperation = (operation: BatchOperation): string[] => {
    const errors: string[] = [];

    if (operation.type === 'unit') {
      const result = validateUnitPlan(operation.data as UnitPlanFormData);
      if (!result.isValid) {
        errors.push(...Object.values(result.errors));
      }
    } else if (operation.type === 'lesson') {
      const result = validateLessonPlan(operation.data as LessonPlanFormData);
      if (!result.isValid) {
        errors.push(...Object.values(result.errors));
      }
    }

    return errors;
  };

  const processBatchOperations = async (): Promise<void> => {
    if (batchOperations.length === 0) {
return;
}

    setIsProcessing(true);

    try {
      // Validate all operations first
      const validatedOps = batchOperations.map((op, _index) => ({
        ...op,
        errors: validateBatchOperation(op),
        status: 'processing' as const,
      }));

      setBatchOperations(validatedOps);

      // Separate units and lessons
      const unitOps = validatedOps.filter((op) => op.type === 'unit' && op.errors.length === 0);
      const lessonOps = validatedOps.filter(
        (op) => op.type === 'lesson' && op.errors.length === 0,
      );

      // Process units in batch
      if (unitOps.length > 0 && onBatchUnitCreate) {
        const unitData = unitOps.map((op, _index) => op.data as UnitPlanFormData);
        await onBatchUnitCreate(unitData);

        // Mark units as completed
        setBatchOperations((prev) =>
          prev.map((op, _index) =>
            unitOps.some((validOp) => validOp.id === op.id)
              ? { ...op, status: 'completed', progress: 100 }
              : op,
          ),
        );
      }

      // Process lessons in batch
      if (lessonOps.length > 0 && onBatchLessonCreate) {
        const lessonData = lessonOps.map((op, _index) => op.data as LessonPlanFormData);
        await onBatchLessonCreate(lessonData);

        // Mark lessons as completed
        setBatchOperations((prev) =>
          prev.map((op, _index) =>
            lessonOps.some((validOp) => validOp.id === op.id)
              ? { ...op, status: 'completed', progress: 100 }
              : op,
          ),
        );
      }

      // Mark operations with errors
      setBatchOperations((prev) =>
        prev.map((op, _index) => (op.errors && op.errors.length > 0 ? { ...op, status: 'error' } : op)),
      );
    } catch (_error) {
      logger.error('Batch processing error:', _error);
      setBatchOperations((prev) =>
        prev.map((op, _index) => ({
          ...op,
          status: 'error',
          errors: [`Processing failed: ${  (_error as Error).message}`],
        })),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Template generation
  const generateTemplate = (type: 'unit' | 'lesson'): void => {
    const template =
      type === 'unit'
        ? ({
            title: '',
            description: '',
            bigIdeas: '',
            essentialQuestions: [''],
            startDate: '',
            endDate: '',
            estimatedHours: 20,
            assessmentPlan: '',
            successCriteria: [''],
            expectationIds: [],
            longRangePlanId: '',
            crossCurricularConnections: '',
            learningSkills: [],
            culminatingTask: '',
            keyVocabulary: [''],
            priorKnowledge: '',
            parentCommunicationPlan: '',
            fieldTripsAndGuestSpeakers: '',
            differentiationStrategies: {
              forStruggling: [''],
              forAdvanced: [''],
              forELL: [''],
              forIEP: [''],
            },
            indigenousPerspectives: '',
            environmentalEducation: '',
            socialJusticeConnections: '',
            technologyIntegration: '',
            communityConnections: '',
          } as UnitPlanFormData)
        : ({
            title: '',
            titleFr: '',
            unitPlanId: '',
            date: '',
            duration: 60,
            mindsOn: '',
            mindsOnFr: '',
            action: '',
            actionFr: '',
            consolidation: '',
            consolidationFr: '',
            learningGoals: '',
            learningGoalsFr: '',
            materials: [''],
            grouping: 'whole class',
            accommodations: [''],
            modifications: [''],
            extensions: [''],
            assessmentType: 'formative' as const,
            assessmentNotes: '',
            isSubFriendly: true,
            subNotes: '',
            expectationIds: [],
          } as LessonPlanFormData);

    onTemplateExport?.(type, template);
  };

  // Import handling
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
return;
}

    try {
      const text = await file.text();
      const data = safeJsonParse<(UnitPlanFormData | LessonPlanFormData)[]>(text, []);

      if (Array.isArray(data)) {
        // Determine type based on data structure
        const type = (data[0] && 'unitPlanId' in data[0]) ? 'lesson' : 'unit';
        onDataImport?.(type, data);
      }
    } catch (_error) {
      logger.error('Import error:', _error);
    }
  };

  const completedOperations = batchOperations.filter((op) => op.status === 'completed').length;
  const errorOperations = batchOperations.filter((op) => op.status === 'error').length;
  const processingOperations = batchOperations.filter((op) => op.status === 'processing').length;
  const totalOperations = batchOperations.length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forms & Data Agent</h1>
        <p className="text-gray-600">
          Comprehensive data entry management system for curriculum planning
        </p>
      </div>

      <Tabs
        className="space-y-6"
        value={activeTab}
        onValueChange={(value) => {
 setActiveTab(value as 'batch' | 'templates' | 'import' | 'wizard'); 
}
        }
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger className="flex items-center gap-2" value="batch">
            <ListPlus className="h-4 w-4" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="templates">
            <Copy className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="import">
            <FileUp className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="wizard">
            <Wand2 className="h-4 w-4" />
            Setup Wizard
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="batch">
          {/* Batch Operations Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Batch Operations Queue
              </CardTitle>
              <CardDescription>
                Manage multiple curriculum planning entries with validation and bulk processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalOperations > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      {completedOperations} / {totalOperations} completed
                    </span>
                  </div>
                  <Progress
                    className="mb-2"
                    value={(completedOperations / totalOperations) * 100}
                  />
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {completedOperations} completed
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {errorOperations} errors
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                      <RotateCcw className="h-4 w-4" />
                      {processingOperations} processing
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isProcessing || totalOperations === 0}
                  onClick={(): void => { void processBatchOperations(); }}
                >
                  {isProcessing ? 'Processing...' : 'Process All'}
                </Button>
                <Button aria-label="Click button" onClick={clearAllOperations}>
                  Clear All
                </Button>
              </div>

              {/* Operations List */}
              {batchOperations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No batch operations queued. Use the forms below to add entries.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchOperations.map((operation, _index) => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={operation.type === 'unit' ? 'default' : 'secondary'}>
                          {operation.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{operation.data.title || 'Untitled'}</p>
                          {operation.errors && operation.errors.length > 0 && (
                            <p className="text-sm text-red-600">
                              {operation.errors.length} validation error(s)
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            operation.status === 'completed'
                              ? 'default'
                              : operation.status === 'error'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {operation.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
 removeBatchOperation(operation.id); 
}}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Add Forms */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Add Unit Plan</CardTitle>
                <CardDescription>Add a unit plan to the batch queue</CardDescription>
              </CardHeader>
              <CardContent>
                <UnitPlanForm
                  showLongRangePlanSelector
                  allLongRangePlans={longRangePlans}
                  longRangePlan={null}
                  onCancel={() => {}}
                  onSubmit={(data) => {
                    addBatchOperation('unit', data);
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Add Lesson Plan</CardTitle>
                <CardDescription>Add a lesson plan to the batch queue</CardDescription>
              </CardHeader>
              <CardContent>
                <LessonPlanForm
                  showUnitPlanSelector
                  allUnitPlans={unitPlans}
                  unitPlan={null}
                  onCancel={() => {}}
                  onSubmit={(data) => {
                    addBatchOperation('lesson', data);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Form Templates</CardTitle>
              <CardDescription>
                Generate and download template files for bulk data entry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Unit Plan Template</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a JSON template for creating multiple unit plans
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
 generateTemplate('unit'); 
}}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Unit Template
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Lesson Plan Template</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Download a JSON template for creating multiple lesson plans
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
 generateTemplate('lesson'); 
}}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Lesson Template
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Template Instructions</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>1. Download the appropriate template file</p>
                  <p>2. Edit the JSON file with your planning data</p>
                  <p>3. Use the Import tab to upload your completed file</p>
                  <p>4. All entries will be validated before processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export Data</CardTitle>
              <CardDescription>
                Import curriculum planning data from external sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-import">Import JSON File</Label>
                <Input
                  accept=".json"
                  className="mt-2"
                  id="file-import"
                  type="file"
                  onChange={(e): void => { void handleFileImport(e); }}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Upload a JSON file containing unit plans or lesson plans
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Supported Formats</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• JSON files with array of unit plan or lesson plan objects</p>
                  <p>• Files must match the expected schema structure</p>
                  <p>• All imported data will be validated before processing</p>
                  <p>• Invalid entries will be flagged for review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="wizard">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Setup Wizard</CardTitle>
              <CardDescription>Guided setup for comprehensive curriculum planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wand2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Setup Wizard Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  The curriculum setup wizard will guide you through creating a complete year-long
                  planning structure with automated workflows.
                </p>
                <Button disabled variant="outline">
                  Launch Wizard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
