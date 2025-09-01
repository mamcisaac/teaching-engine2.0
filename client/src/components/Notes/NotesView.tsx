import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { notesApi, type Note } from '../../services/api/notes';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface NotesViewProps {
  studentId?: string;
  subject?: string;
  showStudentName?: boolean;
  allowEdit?: boolean;
}

export function NotesView({ 
  studentId, 
  subject, 
  showStudentName = true,
  allowEdit = true 
}: NotesViewProps): React.ReactElement {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await notesApi.getAll({ studentId, subject });
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [studentId, subject]);

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingContent.trim()) return;

    try {
      const updatedNote = await notesApi.update(editingId, { 
        content: editingContent 
      });
      
      setNotes(notes.map(n => n.id === editingId ? updatedNote : n));
      setEditingId(null);
      setEditingContent('');
      toast.success('Note updated');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesApi.delete(id);
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  // Group notes by date
  const notesByDate: Record<string, Note[]> = {};
  notes.forEach(note => {
    const dateKey = format(new Date(note.createdAt), 'yyyy-MM-dd');
    if (!notesByDate[dateKey]) {
      notesByDate[dateKey] = [];
    }
    notesByDate[dateKey].push(note);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No notes yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(notesByDate)
        .sort(([a], [b]) => b.localeCompare(a)) // Newest first
        .map(([dateKey, dateNotes]) => (
          <div key={dateKey}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {format(new Date(dateKey), 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-2">
              {dateNotes.map(note => (
                <Card key={note.id} className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {showStudentName && note.student && (
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {note.student.firstName} {note.student.lastName}
                            </Badge>
                            {note.subject && (
                              <Badge variant="secondary" className="text-xs">
                                {note.subject}
                              </Badge>
                            )}
                            {note.lessonTitle && (
                              <span className="text-xs text-gray-500">
                                • {note.lessonTitle}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {editingId === note.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={handleSaveEdit}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleCancelEdit}
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {note.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(note.createdAt), 'h:mm a')}
                          {note.updatedAt !== note.createdAt && 
                            ` (edited ${format(new Date(note.updatedAt), 'MMM d, h:mm a')})`
                          }
                        </p>
                      </div>
                      
                      {allowEdit && editingId !== note.id && (
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(note)}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(note.id)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}