import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PencilIcon, PlusIcon, SearchIcon, FilterIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { notesApi, type Note } from '../../services/api/notes';
import { studentsApi, type Student } from '../../services/api/students';
import { NotesView } from './NotesView';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';

export function NotesTab(): React.ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  const subjects = [
    'Français (Immersion)',
    'Mathématiques',
    'Sciences de la nature',
    'Sciences humaines',
    'Arts visuels',
    'Formation personnelle et sociale',
  ];

  useEffect(() => {
    fetchStudents();
    fetchNotes();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data.filter(s => s.status === 'active'));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await notesApi.getAll({
        studentId: selectedStudent || undefined,
        search: searchTerm || undefined,
        subject: selectedSubject || undefined,
        limit: 100,
      });
      setNotes(response.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(debounce);
  }, [selectedStudent, searchTerm, selectedSubject]);

  const handleAddNote = async () => {
    if (!selectedStudent || !noteText.trim()) {
      toast.error('Please select a student and enter a note');
      return;
    }

    try {
      await notesApi.create({
        studentId: selectedStudent,
        content: noteText.trim(),
        subject: selectedSubject || undefined,
      });
      toast.success('Note added');
      setNoteText('');
      setShowAddModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleBulkAdd = async () => {
    if (selectedStudents.length === 0 || !noteText.trim()) {
      toast.error('Please select students and enter a note');
      return;
    }

    try {
      const result = await notesApi.createBulk({
        studentIds: selectedStudents,
        content: noteText.trim(),
        subject: selectedSubject || undefined,
      });
      toast.success(result.message);
      setNoteText('');
      setSelectedStudents([]);
      setShowBulkModal(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding bulk notes:', error);
      toast.error('Failed to add notes');
    }
  };

  const exportNotes = () => {
    // Create CSV export
    const csv = [
      ['Date', 'Time', 'Student', 'Subject', 'Note'],
      ...notes.map(note => [
        format(new Date(note.createdAt), 'yyyy-MM-dd'),
        format(new Date(note.createdAt), 'HH:mm'),
        note.student ? `${note.student.firstName} ${note.student.lastName}` : '',
        note.subject || '',
        note.content,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anecdotal-notes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Notes exported');
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Note
          </Button>
          <Button
            onClick={() => setShowBulkModal(true)}
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Bulk Add
          </Button>
        </div>

        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Students</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={exportNotes}
          variant="outline"
          disabled={notes.length === 0}
        >
          <DownloadIcon className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Notes Display */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No notes found. Click "Add Note" to create your first anecdotal note.
        </Card>
      ) : (
        <NotesView 
          studentId={selectedStudent || undefined}
          subject={selectedSubject || undefined}
          showStudentName={!selectedStudent}
        />
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Anecdotal Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">No subject</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Describe what you observed..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleAddNote}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Note
              </Button>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setNoteText('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add Note for Multiple Students</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Students
                </label>
                <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                  {students.map(s => (
                    <label key={s.id} className="flex items-center p-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, s.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                          }
                        }}
                        className="mr-2"
                      />
                      {s.firstName} {s.lastName}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedStudents.length} students selected
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject (Optional)
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">No subject</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (same for all selected students)
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Describe what you observed..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleBulkAdd}
                disabled={selectedStudents.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Notes ({selectedStudents.length})
              </Button>
              <Button
                onClick={() => {
                  setShowBulkModal(false);
                  setNoteText('');
                  setSelectedStudents([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}