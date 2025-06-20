import React, { useState } from 'react';
import { useStudents } from '../api';
import { Plus, Mail, Edit2, Trash2, Users, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';

interface ParentContact {
  id: number;
  name: string;
  email: string;
  studentId: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  parentContacts?: ParentContact[];
}

export default function ParentContactsPage() {
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ParentContact | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Get parent contacts from students data
  const allContacts: ParentContact[] = students.flatMap((student: Student) => 
    (student.parentContacts || []).map(contact => ({
      ...contact,
      studentId: student.id
    }))
  );

  const filteredContacts = selectedStudent
    ? students.find((s: Student) => s.id === selectedStudent)?.parentContacts || []
    : allContacts;

  const loading = studentsLoading;

  const handleAddContact = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditContact = (contact: ParentContact) => {
    setEditingContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleDeleteContact = async (contactId: number) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      // TODO: Implement delete functionality
      console.log('Delete contact:', contactId);
    }
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Contacts</h1>
        <p className="text-gray-600">Manage parent and guardian contact information</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
            
            <div className="text-sm text-gray-600">
              {filteredContacts.length} contacts
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleImport} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleAddContact} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600 mb-4">
            {selectedStudent 
              ? "Add parent contacts for this student"
              : "Start by adding parent contact information"}
          </p>
          <Button onClick={handleAddContact}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Contact
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id || contact.email}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Edit contact"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>

                {!selectedStudent && contact.studentId && (
                  <div className="text-sm text-gray-600 mt-2">
                    Student: {students.find(s => s.id === contact.studentId)?.firstName} {students.find(s => s.id === contact.studentId)?.lastName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Parent Contact</DialogTitle>
          </DialogHeader>
          <ContactForm
            students={students}
            onSave={() => {
              setIsAddDialogOpen(false);
              // TODO: Refresh contacts
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Parent Contact</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <ContactForm
              contact={editingContact}
              students={students}
              onSave={() => {
                setIsEditDialogOpen(false);
                setEditingContact(null);
                // TODO: Refresh contacts
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingContact(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Parent Contacts</DialogTitle>
          </DialogHeader>
          <ImportContactsForm
            students={students}
            onImport={() => {
              setIsImportDialogOpen(false);
              // TODO: Refresh contacts
            }}
            onCancel={() => setIsImportDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Contact Form Component
interface ContactFormProps {
  contact?: ParentContact;
  students: Student[];
  onSave: () => void;
  onCancel: () => void;
}

function ContactForm({ contact, students, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    studentId: contact?.studentId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save functionality
    console.log('Save contact:', formData);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Student *
        </label>
        <select
          value={formData.studentId}
          onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a student</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {contact ? 'Update' : 'Add'} Contact
        </Button>
      </div>
    </form>
  );
}

// Import Contacts Form Component
interface ImportContactsFormProps {
  students: Student[];
  onImport: () => void;
  onCancel: () => void;
}

function ImportContactsForm({ students, onImport, onCancel }: ImportContactsFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [studentId, setStudentId] = useState('');
  const [preview] = useState<ParentContact[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // TODO: Parse CSV and show preview
    }
  };

  const handleImport = async () => {
    if (!file || !studentId) return;
    // TODO: Implement import functionality
    console.log('Import file:', file, 'for student:', studentId);
    onImport();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Student
        </label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a student</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-600 mt-1">
          CSV should have columns: Name, Email
        </p>
      </div>

      {preview.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preview.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{row.name}</td>
                    <td className="px-4 py-2 text-sm">{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 5 && (
              <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
                And {preview.length - 5} more...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleImport} disabled={!file || !studentId}>
          Import Contacts
        </Button>
      </div>
    </div>
  );
}