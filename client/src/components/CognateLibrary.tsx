import React, { useState } from 'react';
import { useCognates, useCreateCognate, useUpdateCognate, useDeleteCognate } from '../api';
import { CognatePair, CognateInput } from '../types';
import Dialog from './Dialog';

interface CognateModalProps {
  cognate?: CognatePair;
  onClose: () => void;
  userId: number;
}

function CognateModal({ cognate, onClose, userId }: CognateModalProps) {
  const [wordFr, setWordFr] = useState(cognate?.wordFr || '');
  const [wordEn, setWordEn] = useState(cognate?.wordEn || '');
  const [notes, setNotes] = useState(cognate?.notes || '');

  const createMutation = useCreateCognate();
  const updateMutation = useUpdateCognate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!wordFr.trim() || !wordEn.trim()) {
      return;
    }

    const data: CognateInput = {
      wordFr: wordFr.trim(),
      wordEn: wordEn.trim(),
      notes: notes.trim() || undefined,
      userId,
    };

    if (cognate) {
      updateMutation.mutate({ id: cognate.id, data });
    } else {
      createMutation.mutate(data);
    }

    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="space-y-4 w-96">
        <h2 className="text-lg font-semibold">
          {cognate ? 'Edit Cognate Pair' : 'Add New Cognate Pair'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">🇫🇷 French Word</label>
            <input
              type="text"
              value={wordFr}
              onChange={(e) => setWordFr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="mot français"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">🇬🇧 English Word</label>
            <input
              type="text"
              value={wordEn}
              onChange={(e) => setWordEn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="English word"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 'Exact cognate', 'False friend caution', etc."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : cognate
                  ? 'Update'
                  : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

interface CognateLibraryProps {
  userId: number;
}

export default function CognateLibrary({ userId }: CognateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCognate, setEditingCognate] = useState<CognatePair | undefined>();

  const { data: cognates = [], isLoading, error } = useCognates(userId);
  const deleteMutation = useDeleteCognate();

  const filteredCognates = cognates.filter(
    (cognate) =>
      cognate.wordFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cognate.wordEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cognate.notes && cognate.notes.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleEdit = (cognate: CognatePair) => {
    setEditingCognate(cognate);
    setShowModal(true);
  };

  const handleDelete = (cognate: CognatePair) => {
    if (window.confirm(`Delete cognate pair "${cognate.wordFr} – ${cognate.wordEn}"?`)) {
      deleteMutation.mutate(cognate.id);
    }
  };

  const handleAddNew = () => {
    setEditingCognate(undefined);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCognate(undefined);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading cognates...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading cognates</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🧠 Cognate Library</h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Cognate Pair
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cognates..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredCognates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No cognates match your search.' : 'No cognate pairs created yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCognates.map((cognate) => (
            <div
              key={cognate.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-medium text-blue-600">🇫🇷 {cognate.wordFr}</span>
                    <span className="text-gray-400">–</span>
                    <span className="text-lg font-medium text-green-600">🇬🇧 {cognate.wordEn}</span>
                  </div>

                  {cognate.notes && <p className="text-sm text-gray-600 mb-2">{cognate.notes}</p>}

                  <div className="flex space-x-4 text-xs text-gray-500">
                    {cognate.linkedOutcomes && cognate.linkedOutcomes.length > 0 && (
                      <span>
                        📋 {cognate.linkedOutcomes.length} outcome
                        {cognate.linkedOutcomes.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {cognate.linkedActivities && cognate.linkedActivities.length > 0 && (
                      <span>
                        🎯 {cognate.linkedActivities.length} activit
                        {cognate.linkedActivities.length !== 1 ? 'ies' : 'y'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(cognate)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cognate)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CognateModal cognate={editingCognate} onClose={closeModal} userId={userId} />}
    </div>
  );
}
