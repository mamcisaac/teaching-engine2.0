import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { substituteApi, type SubstituteInfo } from '../../api/domains/substitute';
import { useToast } from '../../hooks/useToast';
import { logger } from '../../utils/logger';

export function SubstituteInfoForm(): React.ReactElement {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['substituteInfo'],
    queryFn: () => substituteApi.getSubstituteInfo(),
  });

  const saveMutation = useMutation({
    mutationFn: (info: SubstituteInfo) => substituteApi.saveSubstituteInfo(info),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substituteInfo'] });
      toast({
        title: 'Success',
        description: 'Substitute information saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save substitute information',
        variant: 'destructive',
      });
      logger.error('Failed to save substitute info', { error });
    },
  });

  const [formData, setFormData] = useState<SubstituteInfo>({
    classroomNumber: '',
    gradeLevel: '',
    classSize: null,
    officePhone: '',
    principalName: '',
    vicePrincipalName: '',
    nearbyTeacher: '',
    nearbyTeacherRoom: '',
    emergencyProcedures: '',
    fireExitRoute: '',
    allergies: '',
    medicalNeeds: '',
    behaviorNotes: '',
    specialNeeds: '',
    studentHelpers: '',
    classroomRules: '',
    rewardSystem: '',
    consequenceSystem: '',
    attentionSignal: '',
    morningRoutine: '',
    attendanceProcedure: '',
    bathroomPolicy: '',
    lunchProcedure: '',
    dismissalProcedure: '',
    materialsLocation: '',
    technologyAccess: '',
    copiesLocation: '',
    extraActivities: '',
    specialSchedule: '',
    importantInfo: '',
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (field: keyof SubstituteInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? (e.target.value ? parseInt(e.target.value) : null) : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-4">Loading substitute information...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold">Substitute Teacher Information</h2>
      <p className="text-gray-600">Save this information once and it will be included in all substitute plans.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div>
            <label htmlFor="classroomNumber" className="block text-sm font-medium mb-1">Classroom Number</label>
            <input
              id="classroomNumber"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.classroomNumber || ''}
              onChange={handleChange('classroomNumber')}
            />
          </div>
          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-medium mb-1">Grade Level</label>
            <input
              id="gradeLevel"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.gradeLevel || ''}
              onChange={handleChange('gradeLevel')}
            />
          </div>
          <div>
            <label htmlFor="classSize" className="block text-sm font-medium mb-1">Class Size</label>
            <input
              id="classSize"
              type="number"
              className="border rounded p-2 w-full"
              value={formData.classSize || ''}
              onChange={handleChange('classSize')}
            />
          </div>
        </div>

        {/* Emergency Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Emergency Information</h3>
          <div>
            <label htmlFor="officePhone" className="block text-sm font-medium mb-1">Office Phone</label>
            <input
              id="officePhone"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.officePhone || ''}
              onChange={handleChange('officePhone')}
            />
          </div>
          <div>
            <label htmlFor="emergencyProcedures" className="block text-sm font-medium mb-1">Emergency Procedures</label>
            <textarea
              id="emergencyProcedures"
              className="border rounded p-2 w-full h-24"
              value={formData.emergencyProcedures || ''}
              onChange={handleChange('emergencyProcedures')}
            />
          </div>
          <div>
            <label htmlFor="fireExitRoute" className="block text-sm font-medium mb-1">Fire Exit Route</label>
            <input
              id="fireExitRoute"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.fireExitRoute || ''}
              onChange={handleChange('fireExitRoute')}
            />
          </div>
        </div>

        {/* Student Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Student Information</h3>
          <div>
            <label htmlFor="allergies" className="block text-sm font-medium mb-1">Allergies (Critical)</label>
            <textarea
              id="allergies"
              className="border rounded p-2 w-full h-24 border-red-300"
              value={formData.allergies || ''}
              onChange={handleChange('allergies')}
              placeholder="List all student allergies"
            />
          </div>
          <div>
            <label htmlFor="medicalNeeds" className="block text-sm font-medium mb-1">Medical Needs</label>
            <textarea
              id="medicalNeeds"
              className="border rounded p-2 w-full h-24"
              value={formData.medicalNeeds || ''}
              onChange={handleChange('medicalNeeds')}
              placeholder="Medications, conditions, etc."
            />
          </div>
          <div>
            <label htmlFor="studentHelpers" className="block text-sm font-medium mb-1">Student Helpers</label>
            <textarea
              id="studentHelpers"
              className="border rounded p-2 w-full"
              value={formData.studentHelpers || ''}
              onChange={handleChange('studentHelpers')}
              placeholder="Names of reliable students"
            />
          </div>
        </div>

        {/* Daily Routines */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Daily Routines</h3>
          <div>
            <label htmlFor="morningRoutine" className="block text-sm font-medium mb-1">Morning Routine</label>
            <textarea
              id="morningRoutine"
              className="border rounded p-2 w-full"
              value={formData.morningRoutine || ''}
              onChange={handleChange('morningRoutine')}
            />
          </div>
          <div>
            <label htmlFor="attendanceProcedure" className="block text-sm font-medium mb-1">Attendance Procedure</label>
            <input
              id="attendanceProcedure"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.attendanceProcedure || ''}
              onChange={handleChange('attendanceProcedure')}
            />
          </div>
          <div>
            <label htmlFor="bathroomPolicy" className="block text-sm font-medium mb-1">Bathroom Policy</label>
            <input
              id="bathroomPolicy"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.bathroomPolicy || ''}
              onChange={handleChange('bathroomPolicy')}
            />
          </div>
          <div>
            <label htmlFor="dismissalProcedure" className="block text-sm font-medium mb-1">Dismissal Procedure</label>
            <textarea
              id="dismissalProcedure"
              className="border rounded p-2 w-full"
              value={formData.dismissalProcedure || ''}
              onChange={handleChange('dismissalProcedure')}
            />
          </div>
        </div>

        {/* Classroom Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Classroom Management</h3>
          <div>
            <label htmlFor="attentionSignal" className="block text-sm font-medium mb-1">Attention Signal</label>
            <input
              id="attentionSignal"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.attentionSignal || ''}
              onChange={handleChange('attentionSignal')}
              placeholder="e.g., Clap pattern, bell"
            />
          </div>
          <div>
            <label htmlFor="rewardSystem" className="block text-sm font-medium mb-1">Reward System</label>
            <textarea
              id="rewardSystem"
              className="border rounded p-2 w-full"
              value={formData.rewardSystem || ''}
              onChange={handleChange('rewardSystem')}
            />
          </div>
          <div>
            <label htmlFor="behaviorNotes" className="block text-sm font-medium mb-1">Behavior Notes</label>
            <textarea
              id="behaviorNotes"
              className="border rounded p-2 w-full h-24"
              value={formData.behaviorNotes || ''}
              onChange={handleChange('behaviorNotes')}
              placeholder="Specific student behaviors to watch"
            />
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resources & Materials</h3>
          <div>
            <label htmlFor="materialsLocation" className="block text-sm font-medium mb-1">Materials Location</label>
            <input
              id="materialsLocation"
              type="text"
              className="border rounded p-2 w-full"
              value={formData.materialsLocation || ''}
              onChange={handleChange('materialsLocation')}
            />
          </div>
          <div>
            <label htmlFor="extraActivities" className="block text-sm font-medium mb-1">Extra Activities</label>
            <textarea
              id="extraActivities"
              className="border rounded p-2 w-full"
              value={formData.extraActivities || ''}
              onChange={handleChange('extraActivities')}
              placeholder="If students finish early"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold">Additional Information</h3>
          <div>
            <label htmlFor="importantInfo" className="block text-sm font-medium mb-1">Important Information</label>
            <textarea
              id="importantInfo"
              className="border rounded p-2 w-full h-32"
              value={formData.importantInfo || ''}
              onChange={handleChange('importantInfo')}
              placeholder="Any other critical information for the substitute"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Information'}
        </button>
      </div>
    </div>
  );
}
