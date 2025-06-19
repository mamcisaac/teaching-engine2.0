import React, { useState } from 'react';
import { useCreateStudentArtifact, useOutcomes } from '../api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Outcome } from '../types';

interface UploadStudentArtifactModalProps {
  studentId: number;
  onClose: () => void;
}

const UploadStudentArtifactModal: React.FC<UploadStudentArtifactModalProps> = ({
  studentId,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'image' as 'image' | 'audio' | 'video' | 'pdf',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    selectedOutcomes: [] as string[],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: outcomes } = useOutcomes();
  const createArtifact = useCreateStudentArtifact();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Auto-detect type based on file extension
      const extension = file.name.toLowerCase().split('.').pop();
      if (extension) {
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          setFormData((prev) => ({ ...prev, type: 'image' }));
        } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
          setFormData((prev) => ({ ...prev, type: 'audio' }));
        } else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) {
          setFormData((prev) => ({ ...prev, type: 'video' }));
        } else if (['pdf'].includes(extension)) {
          setFormData((prev) => ({ ...prev, type: 'pdf' }));
        }
      }

      // If title is empty, use the filename (without extension)
      if (!formData.title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setFormData((prev) => ({ ...prev, title: nameWithoutExtension }));
      }
    }
  };

  const handleOutcomeToggle = (outcomeId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedOutcomes: prev.selectedOutcomes.includes(outcomeId)
        ? prev.selectedOutcomes.filter((id) => id !== outcomeId)
        : [...prev.selectedOutcomes, outcomeId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title for the artifact.');
      return;
    }

    setIsUploading(true);

    try {
      // In a real implementation, you would upload the file to a storage service
      // For now, we'll simulate this by creating a mock file path
      const mockFilePath = `/uploads/students/${studentId}/${Date.now()}-${selectedFile.name}`;

      await createArtifact.mutateAsync({
        studentId,
        data: {
          title: formData.title.trim(),
          filePath: mockFilePath,
          type: formData.type,
          date: formData.date,
          outcomeIds: formData.selectedOutcomes,
          notes: formData.notes.trim() || undefined,
        },
      });

      onClose();
    } catch (error) {
      console.error('Failed to upload artifact:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const groupedOutcomes =
    outcomes?.reduce((acc: Record<string, Outcome[]>, outcome: Outcome) => {
      const key = `${outcome.subject} - Grade ${outcome.grade}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(outcome);
      return acc;
    }, {}) || {};

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Student Artifact" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*,audio/*,video/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose File
            </label>
            {selectedFile && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a title for this artifact"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                type: e.target.value as 'image' | 'audio' | 'video' | 'pdf',
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about this artifact..."
          />
        </div>

        {/* Linked Outcomes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link to Outcomes (Optional)
          </label>
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
            {Object.entries(groupedOutcomes).map(([subject, subjectOutcomes]) => (
              <div key={subject} className="p-3 border-b border-gray-200 last:border-b-0">
                <h4 className="font-medium text-gray-800 mb-2">{subject}</h4>
                <div className="space-y-2">
                  {subjectOutcomes.map((outcome: Outcome) => (
                    <label key={outcome.id} className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedOutcomes.includes(outcome.id)}
                        onChange={() => handleOutcomeToggle(outcome.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{outcome.code}</div>
                        <div className="text-xs text-gray-600 break-words">
                          {outcome.description}
                        </div>
                        {outcome.domain && (
                          <div className="text-xs text-gray-500">Domain: {outcome.domain}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {formData.selectedOutcomes.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {formData.selectedOutcomes.length} outcome(s) selected
            </div>
          )}
        </div>

        {/* Preview of selected file if it's an image */}
        {selectedFile && formData.type === 'image' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="border border-gray-300 rounded-lg p-4">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="max-w-full max-h-48 object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" onClick={onClose} variant="secondary" disabled={isUploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? 'Uploading...' : 'Upload Artifact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadStudentArtifactModal;
