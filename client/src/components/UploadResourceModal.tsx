import { useState, useRef } from 'react';
import { useUploadMediaResource, useOutcomes, useSubjects } from '../api';
import type { Activity, Outcome } from '../types';
import TagInput from './TagInput';
import Dialog from './Dialog';

interface UploadResourceModalProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
  preselectedActivity?: Activity;
  preselectedOutcomes?: Outcome[];
}

export default function UploadResourceModal({
  userId,
  onClose,
  onSuccess,
  preselectedActivity,
  preselectedOutcomes = [],
}: UploadResourceModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [linkedOutcomeIds, setLinkedOutcomeIds] = useState<string[]>(
    preselectedOutcomes.map((o) => o.id),
  );
  const [linkedActivityIds, setLinkedActivityIds] = useState<number[]>(
    preselectedActivity ? [preselectedActivity.id] : [],
  );
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMediaResource();

  // For linking to outcomes and activities
  const { data: outcomes = [] } = useOutcomes();
  const { data: subjects = [] } = useSubjects();

  // Get activities from subjects for linking
  const allActivities: Activity[] = subjects.flatMap(
    (subject) => subject.milestones?.flatMap((milestone) => milestone.activities || []) || [],
  );

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);

    // Auto-generate title from filename if not already set
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
    ];
    return allowedTypes.includes(file.type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      alert('Please select a file and enter a title.');
      return;
    }

    if (!isValidFileType(file)) {
      alert('Please select a valid file type (images, PDFs, videos, or audio files).');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    formData.append('title', title.trim());
    formData.append('tags', JSON.stringify(tags));

    if (linkedOutcomeIds.length > 0) {
      linkedOutcomeIds.forEach((id) => formData.append('linkedOutcomeIds', id));
    }

    if (linkedActivityIds.length > 0) {
      linkedActivityIds.forEach((id) => formData.append('linkedActivityIds', id.toString()));
    }

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        onSuccess();
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Upload Resource</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${file ? 'bg-green-50 border-green-300' : ''}
                hover:border-blue-400 hover:bg-blue-50
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,video/*,audio/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileChange(selectedFile);
                }}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="text-2xl">✅</div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-4xl text-gray-400">📎</div>
                  <div className="text-lg font-medium">Drop your file here</div>
                  <div className="text-sm text-gray-500">or click to browse</div>
                  <div className="text-xs text-gray-400">
                    Supports: Images, PDFs, Videos, Audio (max 50MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title..."
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add tags (press Enter or comma to add)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tags help organize and filter your resources
            </p>
          </div>

          {/* Link to Outcomes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Link to Curriculum Outcomes (Optional)
            </label>
            <select
              multiple
              value={linkedOutcomeIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                setLinkedOutcomeIds(selected);
              }}
              className="w-full border rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {outcomes.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>
                  {outcome.code} - {outcome.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple outcomes</p>
          </div>

          {/* Link to Activities */}
          <div>
            <label className="block text-sm font-medium mb-2">Link to Activities (Optional)</label>
            <select
              multiple
              value={linkedActivityIds.map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) =>
                  parseInt(option.value),
                );
                setLinkedActivityIds(selected);
              }}
              className="w-full border rounded-lg px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.milestone?.subject?.name} → {activity.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple activities
            </p>
          </div>

          {/* Preselected Items Display */}
          {(preselectedActivity || preselectedOutcomes.length > 0) && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Pre-linked Items:</h4>
              {preselectedActivity && (
                <div className="text-sm text-blue-800">
                  🎯 Activity: {preselectedActivity.title}
                </div>
              )}
              {preselectedOutcomes.map((outcome) => (
                <div key={outcome.id} className="text-sm text-blue-800">
                  📋 Outcome: {outcome.code} - {outcome.description}
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !title.trim() || uploadMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
