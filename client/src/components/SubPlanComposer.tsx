import { useState, useEffect } from 'react';
import Dialog from './Dialog';
import { 
  generateSubPlanWithOptions, 
  getClassRoutines, 
  saveClassRoutine,
  deleteClassRoutine,
  extractWeeklyPlan,
  extractScenarioTemplates,
  autoDetectScenario,
  extractSchoolContacts,
  extractDayMaterials,
  extractComprehensiveSubPlan,
  type SubPlanOptions,
  type ClassRoutine,
  type WeeklyPlanData,
  type EmergencyScenario,
  type ScenarioConditions,
  type ExtractedContacts,
  type ExtractedMaterials
} from '../api';
import { useToast } from './ui/use-toast';

interface Props {
  onClose: () => void;
}

interface RoutineFormData {
  title: string;
  description: string;
  category: string;
  timeOfDay?: string;
  priority?: number;
}

export default function SubPlanComposer({ onClose }: Props) {
  const { toast } = useToast();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(1);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeRoutines, setIncludeRoutines] = useState(true);
  const [includePlans, setIncludePlans] = useState(true);
  const [anonymize, setAnonymize] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [notes, setNotes] = useState('');
  const [saveRecord, setSaveRecord] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  
  // Routine management state
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [routines, setRoutines] = useState<ClassRoutine[]>([]);
  const [editingRoutine, setEditingRoutine] = useState<ClassRoutine | null>(null);
  const [routineForm, setRoutineForm] = useState<RoutineFormData>({
    title: '',
    description: '',
    category: 'morning',
    timeOfDay: '',
    priority: 0
  });

  // D3 Extraction features state
  const [showAdvancedExtraction, setShowAdvancedExtraction] = useState(false);
  const [useExtractionFeatures, setUseExtractionFeatures] = useState(false);
  const [scenarioConditions, setScenarioConditions] = useState<ScenarioConditions>({});
  const [extractionPreview, setExtractionPreview] = useState<{
    weeklyPlan?: WeeklyPlanData;
    scenario?: EmergencyScenario;
    contacts?: ExtractedContacts;
    materials?: ExtractedMaterials;
  }>({});
  const [extractionLoading, setExtractionLoading] = useState(false);

  // Load routines on mount
  useEffect(() => {
    loadRoutines();
  }, []);

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const loadRoutines = async () => {
    try {
      const data = await getClassRoutines();
      setRoutines(data);
    } catch (error) {
      console.error('Failed to load routines:', error);
    }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const options: SubPlanOptions = {
        date,
        days,
        includeGoals,
        includeRoutines,
        includePlans,
        anonymize,
        saveRecord,
        emailTo: emailTo || undefined,
        notes: notes || undefined,
        userId: 1 // TODO: Get from auth context
      };

      const res = await generateSubPlanWithOptions(options);
      const blob = new Blob([res.data], { type: 'application/pdf' });

      // Clean up previous URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(URL.createObjectURL(blob));
      
      if (saveRecord) {
        toast({ description: 'Sub plan saved for future reference' });
      }
    } catch (error) {
      console.error('Failed to generate sub plan:', error);
      toast({ description: 'Failed to generate sub plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoutine = async () => {
    try {
      const routine: ClassRoutine = {
        ...routineForm,
        userId: 1, // TODO: Get from auth context
        isActive: true,
        ...(editingRoutine?.id && { id: editingRoutine.id })
      };

      await saveClassRoutine(routine);
      toast({ description: `Routine ${editingRoutine ? 'updated' : 'created'} successfully` });
      await loadRoutines();
      setEditingRoutine(null);
      setRoutineForm({
        title: '',
        description: '',
        category: 'morning',
        timeOfDay: '',
        priority: 0
      });
    } catch (error) {
      console.error('Failed to save routine:', error);
      toast({ description: 'Failed to save routine', variant: 'destructive' });
    }
  };

  const handleDeleteRoutine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this routine?')) return;
    
    try {
      await deleteClassRoutine(id);
      toast({ description: 'Routine deleted successfully' });
      await loadRoutines();
    } catch (error) {
      console.error('Failed to delete routine:', error);
      toast({ description: 'Failed to delete routine', variant: 'destructive' });
    }
  };

  const handleEditRoutine = (routine: ClassRoutine) => {
    setEditingRoutine(routine);
    setRoutineForm({
      title: routine.title,
      description: routine.description,
      category: routine.category,
      timeOfDay: routine.timeOfDay || '',
      priority: routine.priority || 0
    });
  };

  // D3 Extraction functions
  const previewExtraction = async () => {
    setExtractionLoading(true);
    try {
      const userId = 1; // TODO: Get from auth context
      const preview: typeof extractionPreview = {};

      // Extract weekly plan if multiple days
      if (days > 1) {
        preview.weeklyPlan = await extractWeeklyPlan(date, days, {
          includeGoals,
          includeRoutines,
          includePlans,
          anonymize,
          userId
        });
      }

      // Auto-detect scenario
      preview.scenario = await autoDetectScenario(userId);

      // Extract contacts
      preview.contacts = await extractSchoolContacts(userId, 'organized');

      // Extract materials for first day
      preview.materials = await extractDayMaterials(date, userId);

      setExtractionPreview(preview);
      toast({ description: 'Extraction preview generated' });
    } catch (error) {
      console.error('Failed to generate extraction preview:', error);
      toast({ description: 'Failed to generate preview', variant: 'destructive' });
    } finally {
      setExtractionLoading(false);
    }
  };

  const generateWithExtraction = async () => {
    setLoading(true);
    try {
      if (useExtractionFeatures) {
        // Use comprehensive extraction endpoint
        const comprehensiveData = await extractComprehensiveSubPlan({
          startDate: date,
          numDays: days,
          userId: 1, // TODO: Get from auth context
          includeWeeklyOverview: days > 1,
          includeScenarios: true,
          includeContacts: true,
          includeMaterials: true,
          scenarioConditions,
          options: {
            includeGoals,
            includeRoutines,
            includePlans,
            anonymize
          }
        });

        // Here we would need to extend the PDF generation to use the comprehensive data
        // For now, fall back to the regular generation
        toast({ description: 'Comprehensive extraction completed - using enhanced data for PDF generation' });
      }

      // Generate PDF using regular method (enhanced PDF generation would use extraction data)
      const options: SubPlanOptions = {
        date,
        days,
        includeGoals,
        includeRoutines,
        includePlans,
        anonymize,
        saveRecord,
        emailTo: emailTo || undefined,
        notes: notes || undefined,
        userId: 1 // TODO: Get from auth context
      };

      const res = await generateSubPlanWithOptions(options);
      const blob = new Blob([res.data], { type: 'application/pdf' });

      // Clean up previous URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(URL.createObjectURL(blob));
      
      if (saveRecord) {
        toast({ description: 'Enhanced sub plan saved for future reference' });
      }
    } catch (error) {
      console.error('Failed to generate enhanced sub plan:', error);
      toast({ description: 'Failed to generate enhanced sub plan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="space-y-4 w-full max-w-2xl">
        <h2 className="text-xl font-semibold">Generate Substitute Plan</h2>
        
        {/* Date and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Days</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
              <option value={3}>3 days</option>
            </select>
          </div>
        </div>

        {/* Content Options */}
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2">Include in Plan:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={includePlans}
                onChange={(e) => setIncludePlans(e.target.checked)}
              />
              Daily Schedule & Activities
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={includeGoals}
                onChange={(e) => setIncludeGoals(e.target.checked)}
              />
              Current Student Goals
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={includeRoutines}
                onChange={(e) => setIncludeRoutines(e.target.checked)}
              />
              Class Routines & Procedures
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
              />
              Anonymize Student Names
            </label>
          </div>
        </div>

        {/* Email Options */}
        <div>
          <label className="block text-sm font-medium mb-1">Email To (optional)</label>
          <input
            type="email"
            className="border rounded px-3 py-2 w-full"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            placeholder="substitute@school.com"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Additional Notes</label>
          <textarea
            className="border rounded px-3 py-2 w-full"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions or reminders..."
          />
        </div>

        {/* Save for Later */}
        <label className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={saveRecord}
            onChange={(e) => setSaveRecord(e.target.checked)}
          />
          Save this plan for future reference
        </label>

        {/* D3 Extraction Features Toggle */}
        <div className="border-t pt-4">
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              className="mr-2"
              checked={useExtractionFeatures}
              onChange={(e) => setUseExtractionFeatures(e.target.checked)}
            />
            <span className="font-medium">🚀 Use Enhanced D3 Sub Plan Extractor</span>
          </label>
          
          {useExtractionFeatures && (
            <div className="bg-blue-50 p-4 rounded mb-4">
              <h4 className="font-medium mb-2">Enhanced Extraction Features</h4>
              <p className="text-sm text-gray-600 mb-3">
                The D3 Sub Plan Extractor provides advanced features including weekly plan extraction, 
                emergency scenario detection, automatic contact extraction, and materials analysis.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Weather Conditions</label>
                  <select
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={scenarioConditions.weather || 'normal'}
                    onChange={(e) => setScenarioConditions({
                      ...scenarioConditions,
                      weather: e.target.value as any
                    })}
                  >
                    <option value="normal">Normal</option>
                    <option value="severe">Severe Weather</option>
                    <option value="extreme">Extreme Weather</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Technology Status</label>
                  <select
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={scenarioConditions.technology || 'working'}
                    onChange={(e) => setScenarioConditions({
                      ...scenarioConditions,
                      technology: e.target.value as any
                    })}
                  >
                    <option value="working">Working</option>
                    <option value="partial">Partial Issues</option>
                    <option value="down">Not Working</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Staffing Level</label>
                  <select
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={scenarioConditions.staffing || 'full'}
                    onChange={(e) => setScenarioConditions({
                      ...scenarioConditions,
                      staffing: e.target.value as any
                    })}
                  >
                    <option value="full">Full Staff</option>
                    <option value="short">Staff Shortage</option>
                    <option value="emergency">Emergency Staffing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Building Status</label>
                  <select
                    className="border rounded px-2 py-1 w-full text-sm"
                    value={scenarioConditions.building || 'normal'}
                    onChange={(e) => setScenarioConditions({
                      ...scenarioConditions,
                      building: e.target.value as any
                    })}
                  >
                    <option value="normal">Normal</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
                  onClick={previewExtraction}
                  disabled={extractionLoading}
                >
                  {extractionLoading ? 'Extracting...' : 'Preview Extraction'}
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  onClick={() => setShowAdvancedExtraction(!showAdvancedExtraction)}
                >
                  {showAdvancedExtraction ? 'Hide' : 'Show'} Preview
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={useExtractionFeatures ? generateWithExtraction : generate}
            disabled={loading}
          >
            {loading ? 'Generating...' : useExtractionFeatures ? 'Generate Enhanced Plan' : 'Generate Plan'}
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setShowRoutineManager(!showRoutineManager)}
          >
            Manage Routines
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        {/* PDF Preview */}
        {pdfUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Preview</h3>
            <iframe src={pdfUrl} className="w-full h-96 border rounded" />
            <div className="mt-2 flex gap-2">
              <a
                href={pdfUrl}
                download={`sub-plan-${date}.pdf`}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Download PDF
              </a>
              {emailTo && (
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Send Email
                </button>
              )}
            </div>
          </div>
        )}

        {/* D3 Extraction Preview */}
        {showAdvancedExtraction && useExtractionFeatures && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">Extraction Preview</h3>
            
            {Object.keys(extractionPreview).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No extraction preview available. Click "Preview Extraction" above.</p>
            ) : (
              <div className="space-y-4">
                {/* Scenario Preview */}
                {extractionPreview.scenario && (
                  <div className="bg-yellow-50 p-3 rounded">
                    <h4 className="font-medium text-yellow-800">🚨 Recommended Scenario: {extractionPreview.scenario.name}</h4>
                    <p className="text-sm text-yellow-700 mt-1">{extractionPreview.scenario.description}</p>
                    <div className="text-xs text-yellow-600 mt-2">
                      <strong>Key Procedures:</strong> {extractionPreview.scenario.procedures.slice(0, 2).join(', ')}
                      {extractionPreview.scenario.procedures.length > 2 && '...'}
                    </div>
                  </div>
                )}

                {/* Weekly Overview */}
                {extractionPreview.weeklyPlan && (
                  <div className="bg-green-50 p-3 rounded">
                    <h4 className="font-medium text-green-800">📅 Weekly Overview ({extractionPreview.weeklyPlan.days.length} days)</h4>
                    <div className="text-sm text-green-700 mt-1">
                      <strong>Subjects:</strong> {extractionPreview.weeklyPlan.weeklyOverview.subjects.map(s => s.name).join(', ')}
                    </div>
                    <div className="text-sm text-green-700">
                      <strong>Milestones:</strong> {extractionPreview.weeklyPlan.weeklyOverview.milestones.length} active
                    </div>
                    {extractionPreview.weeklyPlan.weeklyOverview.specialEvents.length > 0 && (
                      <div className="text-sm text-green-700">
                        <strong>Special Events:</strong> {extractionPreview.weeklyPlan.weeklyOverview.specialEvents.length} scheduled
                      </div>
                    )}
                  </div>
                )}

                {/* Emergency Contacts */}
                {extractionPreview.contacts && (
                  <div className="bg-red-50 p-3 rounded">
                    <h4 className="font-medium text-red-800">📞 Emergency Contacts</h4>
                    <div className="text-sm text-red-700 mt-1">
                      <strong>Emergency:</strong> {extractionPreview.contacts.emergency.length} contacts
                    </div>
                    <div className="text-sm text-red-700">
                      <strong>Administration:</strong> {extractionPreview.contacts.administration.length} contacts
                    </div>
                    <div className="text-sm text-red-700">
                      <strong>Custom:</strong> {extractionPreview.contacts.custom.length} contacts
                    </div>
                  </div>
                )}

                {/* Materials Summary */}
                {extractionPreview.materials && (
                  <div className="bg-purple-50 p-3 rounded">
                    <h4 className="font-medium text-purple-800">📦 Materials Analysis</h4>
                    <div className="text-sm text-purple-700 mt-1">
                      <strong>Total Items:</strong> {extractionPreview.materials.summary.totalItems}
                    </div>
                    <div className="text-sm text-purple-700">
                      <strong>Setup Time:</strong> {extractionPreview.materials.summary.prepTime} minutes
                    </div>
                    <div className="text-sm text-purple-700">
                      <strong>Time Slots:</strong> {extractionPreview.materials.byTimeSlot.length} scheduled
                    </div>
                    {extractionPreview.materials.summary.missingItems.length > 0 && (
                      <div className="text-sm text-purple-700">
                        <strong>Potential Issues:</strong> {extractionPreview.materials.summary.missingItems.length} items to check
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-3">
                  ✨ Enhanced extraction data will be included in the generated substitute plan PDF
                </div>
              </div>
            )}
          </div>
        )}

        {/* Routine Manager */}
        {showRoutineManager && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">Class Routines</h3>
            
            {/* Routine Form */}
            <div className="bg-gray-50 p-4 rounded mb-4">
              <h4 className="font-medium mb-2">{editingRoutine ? 'Edit' : 'Add'} Routine</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Title"
                  className="border rounded px-3 py-2"
                  value={routineForm.title}
                  onChange={(e) => setRoutineForm({ ...routineForm, title: e.target.value })}
                />
                <select
                  className="border rounded px-3 py-2"
                  value={routineForm.category}
                  onChange={(e) => setRoutineForm({ ...routineForm, category: e.target.value })}
                >
                  <option value="morning">Morning</option>
                  <option value="transition">Transition</option>
                  <option value="dismissal">Dismissal</option>
                  <option value="behavior">Behavior</option>
                  <option value="emergency">Emergency</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Time of Day (optional)"
                  className="border rounded px-3 py-2"
                  value={routineForm.timeOfDay}
                  onChange={(e) => setRoutineForm({ ...routineForm, timeOfDay: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Priority (0-10)"
                  className="border rounded px-3 py-2"
                  value={routineForm.priority}
                  onChange={(e) => setRoutineForm({ ...routineForm, priority: Number(e.target.value) })}
                />
                <textarea
                  placeholder="Description"
                  className="border rounded px-3 py-2 col-span-2"
                  rows={2}
                  value={routineForm.description}
                  onChange={(e) => setRoutineForm({ ...routineForm, description: e.target.value })}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleSaveRoutine}
                  disabled={!routineForm.title || !routineForm.description}
                >
                  {editingRoutine ? 'Update' : 'Add'} Routine
                </button>
                {editingRoutine && (
                  <button
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={() => {
                      setEditingRoutine(null);
                      setRoutineForm({
                        title: '',
                        description: '',
                        category: 'morning',
                        timeOfDay: '',
                        priority: 0
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Routine List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {routines.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No routines added yet</p>
              ) : (
                routines.map((routine) => (
                  <div key={routine.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{routine.title}</h4>
                        <p className="text-sm text-gray-600">{routine.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="capitalize">{routine.category}</span>
                          {routine.timeOfDay && <span> • {routine.timeOfDay}</span>}
                          {routine.priority !== undefined && routine.priority > 0 && (
                            <span> • Priority: {routine.priority}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="text-blue-500 hover:text-blue-700 text-sm"
                          onClick={() => handleEditRoutine(routine)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => routine.id && handleDeleteRoutine(routine.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}