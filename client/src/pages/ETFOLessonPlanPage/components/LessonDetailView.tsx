import { format } from 'date-fns';
import { Calendar, Clock, Printer, Download, PencilIcon, XIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { ETFOLessonPlan, UnitPlan, CurriculumExpectation } from '../../../hooks/useETFOPlanning';
import type { LessonPlan } from '../../../utils/printing/types';
import { generateLessonPlanHTML, printHTML, downloadHTML } from '../../../utils/printUtils';
import { SafeHtmlRenderer } from '../../../utils/sanitization';
import { studentsApi } from '../../../services/api/students';
import { notesApi } from '../../../services/api/notes';
import type { Student } from '../../../services/api/students';

interface LessonDetailViewProps {
  lesson: ETFOLessonPlan;
  unitPlan: UnitPlan | undefined;
  unitId: string;
  onEdit: () => void;
}

export function LessonDetailView({ lesson, unitPlan, unitId, onEdit }: LessonDetailViewProps): React.ReactElement {
  const [students, setStudents] = useState<Student[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentsApi.getAll();
        setStudents(data.filter(s => s.status === 'active'));
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleSaveNote = async () => {
    if (!selectedStudent || !noteText.trim()) {
      toast.error('Please select a student and enter a note');
      return;
    }

    setSaving(true);
    
    try {
      // Create a proper note using the notes API (timestamp handled by createdAt field)
      await notesApi.create({
        studentId: selectedStudent,
        content: noteText.trim(),
        lessonPlanId: lesson.id,
        lessonTitle: lesson.title,
        subject: unitPlan?.longRangePlan?.subject || 'General',
      });
      
      toast.success('Note saved successfully');

      // Reset form
      setNoteText('');
      setSelectedStudent('');
      setShowNoteModal(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to convert ETFOLessonPlan to LessonPlan for printing
  const convertLessonForPrinting = (etfoLesson: ETFOLessonPlan): LessonPlan => ({
    title: etfoLesson.title,
    date: new Date(etfoLesson.date),
    duration: etfoLesson.duration,
    learningGoals: etfoLesson.learningGoals,
    mindsOn: etfoLesson.mindsOn,
    action: etfoLesson.action,
    consolidation: etfoLesson.consolidation,
    materials: etfoLesson.materials,
    grouping: etfoLesson.grouping,
    accommodations: etfoLesson.accommodations,
    modifications: etfoLesson.modifications,
    extensions: etfoLesson.extensions,
    assessmentType: etfoLesson.assessmentType,
    assessmentNotes: etfoLesson.assessmentNotes,
    isSubFriendly: etfoLesson.isSubFriendly,
    subNotes: etfoLesson.subNotes,
    expectations: etfoLesson.expectations?.map(exp => ({ expectation: exp.expectation })),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Link className="hover:text-indigo-600" to="/planner/long-range">
          Long-Range Plans
        </Link>
        <span>›</span>
        <Link className="hover:text-indigo-600" to="/planner/units">
          Unit Plans
        </Link>
        {unitPlan && (
          <React.Fragment>
            <span>›</span>
            <Link className="hover:text-indigo-600" to={`/planner/units/${unitId}`}>
              {unitPlan.title}
            </Link>
          </React.Fragment>
        )}
        <span>›</span>
        <Link className="hover:text-indigo-600" to={`/planner/units/${unitId}/lessons`}>
          Lessons
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </div>

      {/* Lesson Detail View */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              {lesson.titleFr && lesson.titleFr !== '' && (
                <p className="text-sm text-gray-600 mt-1">{lesson.titleFr}</p>
              )}
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(lesson.date), 'MMMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration} minutes
                </span>
                {lesson.isSubFriendly && <Badge variant="secondary">Sub-Friendly</Badge>}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Add Note
              </Button>
              <Button
                className="flex items-center gap-2"
                size="sm"
                variant="outline"
                onClick={() => {
                  printHTML(
                    generateLessonPlanHTML(
                      convertLessonForPrinting(lesson),
                      unitPlan,
                    ),
                    `${lesson.title}-lesson-plan`,
                  );
                }}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                className="flex items-center gap-2"
                size="sm"
                variant="outline"
                onClick={() => {
                  downloadHTML(
                    generateLessonPlanHTML(
                      convertLessonForPrinting(lesson),
                      unitPlan,
                    ),
                    `${lesson.title}-lesson-plan`,
                  );
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
              {lesson.daybookEntry ? (
                <Link to={`/planner/daybook?date=${lesson.date}`}>
                  <Button variant="outline">View in Daybook</Button>
                </Link>
              ) : (
                <Link
                  to={`/planner/daybook?date=${lesson.date}&lessonPlanId=${lesson.id}`}
                >
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Create Daybook Entry
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Three-Part Lesson Structure */}
        <div className="p-6 space-y-6">
          {lesson.learningGoals && lesson.learningGoals !== '' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Goals</h3>
              <SafeHtmlRenderer
                className="prose max-w-none"
                html={lesson.learningGoals}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Minds On</CardTitle>
                <CardDescription>Activating prior knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.mindsOn && lesson.mindsOn !== '' ? (
                  <SafeHtmlRenderer
                    className="prose max-w-none text-sm"
                    html={lesson.mindsOn}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No content provided</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Action</CardTitle>
                <CardDescription>Main learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.action && lesson.action !== '' ? (
                  <SafeHtmlRenderer
                    className="prose max-w-none text-sm"
                    html={lesson.action}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No content provided</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consolidation</CardTitle>
                <CardDescription>Summarizing and reflection</CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.consolidation && lesson.consolidation !== '' ? (
                  <SafeHtmlRenderer
                    className="prose max-w-none text-sm"
                    html={lesson.consolidation}
                  />
                ) : (
                  <p className="text-sm text-gray-500">No content provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Materials and Resources */}
          {lesson.materials && lesson.materials.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials Needed</h3>
              <ul className="list-disc list-inside space-y-1">
                {lesson.materials.map((material: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    {material}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assessment */}
          {(lesson.assessmentType || (lesson.assessmentNotes && lesson.assessmentNotes !== '')) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment</h3>
              {lesson.assessmentType && (
                <Badge className="mb-2">{lesson.assessmentType}</Badge>
              )}
              {lesson.assessmentNotes && lesson.assessmentNotes !== '' && (
                <p className="text-gray-700 mt-2">{lesson.assessmentNotes}</p>
              )}
            </div>
          )}

          {/* Differentiation */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lesson.accommodations && lesson.accommodations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Accommodations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {lesson.accommodations.map((item: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.modifications && lesson.modifications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Modifications</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {lesson.modifications.map((item: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.extensions && lesson.extensions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Extensions</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {lesson.extensions.map((item: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sub Notes */}
          {lesson.isSubFriendly && lesson.subNotes && lesson.subNotes !== '' && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-base">Substitute Teacher Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{lesson.subNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Curriculum Expectations */}
          {lesson.expectations && lesson.expectations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Curriculum Expectations
              </h3>
              <div className="space-y-2">
                {lesson.expectations.map((lessonExpectation: { expectation: CurriculumExpectation }, index: number) => (
                  <div key={lessonExpectation.expectation.id || index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-sm">{lessonExpectation.expectation.code}</span>
                        <p className="text-sm text-gray-700 mt-1">{lessonExpectation.expectation.description}</p>
                      </div>
                      <Badge className="ml-2" variant="outline">
                        {lessonExpectation.expectation.strand}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simple Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Anecdotal Note</h2>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedStudent('');
                  setNoteText('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your observation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Quick note for {lesson.title}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveNote}
                disabled={saving || !selectedStudent || !noteText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Note'}
              </button>
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setSelectedStudent('');
                  setNoteText('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}